import * as path from 'path';
import { Messages } from '@salesforce/core';
import * as shell from 'shelljs';
import { sfProject } from '../utils/sfcli/project/sfProject';
import { Logger } from '../utils/logger';
import { OmniscriptPackageManager, OmniscriptPackageConfig } from '../utils/omniscriptPackageManager';
import { OmniscriptPackageDeploymentError } from '../error/deploymentErrors';

export class Deployer {
  private readonly projectPath: string;
  private readonly authKey: string;
  private readonly omniscriptCustomizationPackage = '@omnistudio/omniscript_customization';
  private readonly omniscriptCustomizationPackageVersion = '250.0.0';
  private readonly username: string;
  private readonly messages: Messages<string>;
  private readonly omniscriptPackageConfig: OmniscriptPackageConfig;
  private omniscriptPackageManager?: OmniscriptPackageManager;

  public constructor(projectPath: string, messages: Messages<string>, username: string, authKey: string) {
    this.projectPath = projectPath;
    this.username = username;
    this.messages = messages;
    this.authKey = authKey;

    // Configure omniscript package settings
    this.omniscriptPackageConfig = {
      packageName: this.omniscriptCustomizationPackage,
      version: this.omniscriptCustomizationPackageVersion,
    };
  }

  public async deploy(): Promise<void> {
    const pwd = shell.pwd();
    shell.cd(this.projectPath);

    try {
      // Install dependencies including omniscript customization package
      if (this.authKey) {
        sfProject.createNPMConfigFile(this.authKey);
        Logger.logVerbose(this.messages.getMessage('installingRequiredDependencies'));
        sfProject.installDependency();
        sfProject.installDependency(
          `${this.omniscriptCustomizationPackage}@${this.omniscriptCustomizationPackageVersion}`
        );

        // Deploy omniscript customization package separately first
        await this.deployOmniscriptPackage();
      }

      // Deploy the main project after omniscript package deployment succeeds
      Logger.log(path.join(pwd.toString(), 'package.xml'));
      sfProject.deployFromManifest(path.join(pwd.toString(), 'package.xml'), this.username);
    } finally {
      shell.cd(pwd);
    }
  }

  private async deployOmniscriptPackage(): Promise<void> {
    try {
      this.omniscriptPackageManager = new OmniscriptPackageManager(
        this.projectPath,
        this.omniscriptPackageConfig,
        this.username
      );

      const success = await this.omniscriptPackageManager.deployPackageAsync();
      if (success) {
        Logger.log(this.messages.getMessage('omniscriptPackageIntegrated'));
      } else {
        const errorMsg = this.messages.getMessage('omniscriptPackageDeploymentFailedReturnedFalse');
        Logger.error(errorMsg);
        throw new OmniscriptPackageDeploymentError(
          this.messages.getMessage('omniscriptPackageDeploymentFailedWithMessage', [errorMsg])
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(this.messages.getMessage('errorIntegratingOmniscriptPackage'), error);

      // Re-throw as OmniscriptPackageDeploymentError for consistent error handling upstream
      if (error instanceof OmniscriptPackageDeploymentError) {
        throw error;
      } else {
        throw new OmniscriptPackageDeploymentError(
          this.messages.getMessage('omniscriptPackageDeploymentFailedWithMessage', [errorMessage])
        );
      }
    }
  }
}
