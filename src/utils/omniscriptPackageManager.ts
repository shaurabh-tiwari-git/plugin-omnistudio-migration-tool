import * as fs from 'fs';
import * as path from 'path';
import { Messages } from '@salesforce/core';
import { Logger } from './logger';
import { sfProject, DeploymentStatus } from './sfcli/project/sfProject';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-migration-tool', 'migrate');

export interface OmniscriptPackageConfig {
  packageName: string;
  version: string;
}

export interface DeploymentProgress {
  deploymentId: string;
  status: DeploymentStatus['status'];
  completionPercentage: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
  currentAttempt: number;
  maxRetries: number;
}

export class OmniscriptPackageManager {
  private readonly nodeModulesPath: string;
  private readonly config: OmniscriptPackageConfig;
  private readonly username: string;
  private readonly pollingIntervalMs = 60000; // 60 seconds
  private readonly maxRetries = 3;
  private deploymentStartTime = 0;

  public constructor(projectPath: string, packageConfig: OmniscriptPackageConfig, username: string) {
    this.nodeModulesPath = path.join(projectPath, 'node_modules');
    this.config = packageConfig;
    this.username = username;
  }

  public async deployPackageAsync(): Promise<boolean> {
    const packagePath = path.join(this.nodeModulesPath, this.config.packageName);

    if (!fs.existsSync(packagePath)) {
      Logger.logVerbose(messages.getMessage('omniscriptPackagePathNotFound', [packagePath]));
      Logger.error(messages.getMessage('ensurePackageInstalled', [packagePath]));
      return false;
    }

    Logger.log(messages.getMessage('startingOmniscriptPackageDeployment'));
    Logger.log(messages.getMessage('waitingForDeploymentCompletion'));

    let currentAttempt = 1;
    while (currentAttempt <= this.maxRetries) {
      try {
        const success = await this.attemptDeployment(packagePath, currentAttempt);
        if (success) {
          return true;
        }
      } catch (error) {
        const errorMessage = String(error);
        Logger.logVerbose(messages.getMessage('omniscriptPackageDeploymentError', [errorMessage]));

        if (currentAttempt < this.maxRetries) {
          const shouldRetry = this.shouldRetryDeployment(errorMessage);
          if (shouldRetry) {
            Logger.log(messages.getMessage('retryingDeployment', [errorMessage, currentAttempt + 1, this.maxRetries]));
            currentAttempt++;
            // Wait before retrying
            await this.sleep(5000);
            continue;
          }
        }

        Logger.error(messages.getMessage('packageDeploymentFailedWithError', [currentAttempt, errorMessage]));
        throw error;
      }
      currentAttempt++;
    }

    Logger.error(messages.getMessage('maxRetryAttemptsExceeded', [this.maxRetries]));
    Logger.error(messages.getMessage('deploymentRetryExhausted', [this.maxRetries]));
    return false;
  }

  private async attemptDeployment(packagePath: string, attemptNumber: number): Promise<boolean> {
    this.deploymentStartTime = Date.now();

    // Start async deployment
    const deploymentId = sfProject.deployPackageAsync(packagePath, this.username);

    // Poll for completion
    return await this.pollDeploymentStatus(deploymentId, attemptNumber);
  }

  private async pollDeploymentStatus(deploymentId: string, attemptNumber: number): Promise<boolean> {
    let pollAttempt = 1;
    const maxPollAttempts = 20; // 20 minutes max with 60s intervals

    while (pollAttempt <= maxPollAttempts) {
      Logger.logVerbose(messages.getMessage('pollingDeploymentStatus', [deploymentId, pollAttempt, maxPollAttempts]));

      let status: DeploymentStatus;

      try {
        status = sfProject.checkDeploymentStatus(deploymentId, this.username);
      } catch (networkError) {
        // Network/API error during status check - retry the status check
        Logger.logVerbose(messages.getMessage('deploymentStatusCheckFailed', [String(networkError)]));

        pollAttempt++;
        if (pollAttempt <= maxPollAttempts) {
          Logger.logVerbose(`Retrying status check in ${this.pollingIntervalMs / 1000}s...`);
          await this.sleep(this.pollingIntervalMs);
          continue;
        } else {
          // Exhausted status check retries
          throw new Error(
            messages.getMessage('deploymentStatusCheckExhausted', [maxPollAttempts, String(networkError)])
          );
        }
      }

      // Log progress update
      this.logProgressUpdate(status, attemptNumber);

      // Handle deployment completion states - these exit polling immediately
      if (status.status === 'Succeeded') {
        const totalTime = this.formatElapsedTime(Date.now() - this.deploymentStartTime);
        Logger.log(messages.getMessage('deploymentCompleted', [totalTime]));
        return true;
      }

      if (status.status === 'Failed') {
        Logger.error(messages.getMessage('deploymentFailed', [status.errorMessage || 'Unknown error']));

        if (status.isRetryable) {
          throw new Error(status.retryReason || status.errorMessage || 'Deployment failed');
        } else {
          Logger.error(messages.getMessage('deploymentNonRetryableError', [status.errorMessage]));
          throw new Error(status.errorMessage || 'Deployment failed');
        }
      }

      if (status.status === 'Canceled' || status.status === 'Canceling') {
        Logger.error(messages.getMessage('deploymentCancelled'));
        throw new Error('Deployment was cancelled');
      }

      // Still in progress - wait and continue polling
      await this.sleep(this.pollingIntervalMs);
      pollAttempt++;
    }

    // Polling timeout reached
    const timeoutMinutes = (maxPollAttempts * this.pollingIntervalMs) / 60000;
    Logger.error(messages.getMessage('deploymentTimedOut', [timeoutMinutes]));
    throw new Error(`Deployment timed out after ${timeoutMinutes} minutes`);
  }

  private logProgressUpdate(status: DeploymentStatus, attemptNumber: number): void {
    const elapsedTime = this.formatElapsedTime(Date.now() - this.deploymentStartTime);
    const estimatedRemaining = this.calculateEstimatedTime(status);

    // Log status update
    Logger.log(messages.getMessage('deploymentStatusUpdate', [status.id, status.status, status.completionPercentage]));

    // Log progress details
    Logger.log(
      messages.getMessage('deploymentProgressDetails', [
        status.completedComponentsCount,
        status.totalComponentsCount,
        status.errorCount,
        status.warningCount,
      ])
    );

    // Log timing information
    Logger.log(messages.getMessage('deploymentInProgress', [elapsedTime, estimatedRemaining]));

    // Log verbose details for debugging
    Logger.logVerbose(
      `Attempt ${attemptNumber}/${this.maxRetries}, Poll status: ${status.status}, ` +
        `Progress: ${status.completionPercentage}%, ` +
        `Components: ${status.completedComponentsCount}/${status.totalComponentsCount}`
    );
  }

  private calculateEstimatedTime(status: DeploymentStatus): string {
    if (status.completionPercentage === 0) {
      return 'Calculating...';
    }

    const elapsedMs = Date.now() - this.deploymentStartTime;
    const remainingPercentage = 100 - status.completionPercentage;
    const estimatedRemainingMs = (elapsedMs / status.completionPercentage) * remainingPercentage;

    return this.formatElapsedTime(estimatedRemainingMs);
  }

  private formatElapsedTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  private shouldRetryDeployment(errorMessage: string): boolean {
    const message = errorMessage.toLowerCase();

    // Retry on timeout or temporary errors
    if (
      message.includes('timeout') ||
      message.includes('temporarily unavailable') ||
      message.includes('connection') ||
      message.includes('network')
    ) {
      return true;
    }

    // Don't retry on validation or permission errors
    if (
      message.includes('validation') ||
      message.includes('permission') ||
      message.includes('invalid') ||
      message.includes('unauthorized') ||
      message.includes('limit')
    ) {
      return false;
    }

    // Default to retry for unknown errors
    return false;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
