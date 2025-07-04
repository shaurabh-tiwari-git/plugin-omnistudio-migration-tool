import * as fs from 'fs';
import * as path from 'path';
import { Messages } from '@salesforce/core';
import { Logger } from './logger';
import { sfProject } from './sfcli/project/sfProject';
import { PromptUtil } from './promptUtil';

export const EXISTING_MODE = 'existing';
export const EMPTY_MODE = 'empty';
export const YES_SHORT = 'y';
export const NO_SHORT = 'n';
export const YES_LONG = 'yes';
export const NO_LONG = 'no';

// Helper to create SFDX project if needed
export function createSfdxProject(folderPath: string): void {
  const projectName = path.basename(folderPath);
  const parentDir = path.dirname(folderPath);
  sfProject.create(projectName, parentDir);
}

export function isSfdxProject(folderPath: string): boolean {
  const sfdxProjectJson = path.join(folderPath, 'sfdx-project.json');
  return fs.existsSync(sfdxProjectJson);
}

export class ProjectPathUtil {
  /**
   * Gets project path with enhanced validation and user prompts
   *
   * @param messages - Messages object for internationalization
   * @param enableRetrieval - Whether to enable the retrieval option for empty projects
   * @returns Promise<string> - The validated project path
   */
  public static async getProjectPath(messages: Messages, enableRetrieval = true): Promise<string> {
    const askWithTimeout = PromptUtil.askWithTimeOut(messages);
    const mode = await ProjectPathUtil.promptForProjectType(messages, askWithTimeout);

    if (mode === EMPTY_MODE && enableRetrieval) {
      await ProjectPathUtil.promptForRetrieval(messages, askWithTimeout);
    }

    return ProjectPathUtil.promptForProjectPath(messages, askWithTimeout, mode);
  }

  /**
   * Prompts user to choose between existing or empty project
   */
  private static async promptForProjectType(
    messages: Messages,
    askWithTimeout: (promptFn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]) => Promise<string>
  ): Promise<string> {
    let validResponse = false;
    let mode = EXISTING_MODE;

    while (!validResponse) {
      try {
        const resp = await askWithTimeout(Logger.prompt.bind(Logger), messages.getMessage('existingApexPrompt'));
        const response = typeof resp === 'string' ? resp.trim().toLowerCase() : '';

        if (response === YES_SHORT || response === YES_LONG) {
          mode = EXISTING_MODE;
          validResponse = true;
        } else if (response === NO_SHORT || response === NO_LONG) {
          mode = EMPTY_MODE;
          validResponse = true;
        } else {
          Logger.error(messages.getMessage('invalidYesNoResponse'));
        }
      } catch (err) {
        Logger.error(messages.getMessage('requestTimedOut'));
        process.exit(1);
      }
    }

    return mode;
  }

  /**
   * Prompts user to confirm if they want to retrieve APEX classes
   */
  private static async promptForRetrieval(
    messages: Messages,
    askWithTimeout: (promptFn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]) => Promise<string>
  ): Promise<void> {
    let validResponse = false;

    while (!validResponse) {
      try {
        const resp = await askWithTimeout(Logger.prompt.bind(Logger), messages.getMessage('retrieveApexPrompt'));
        const response = typeof resp === 'string' ? resp.trim().toLowerCase() : '';

        if (response === YES_SHORT || response === YES_LONG) {
          validResponse = true;
        } else if (response === NO_SHORT || response === NO_LONG) {
          Logger.error(messages.getMessage('operationCancelled'));
          process.exit(0);
        } else {
          Logger.error(messages.getMessage('invalidYesNoResponse'));
        }
      } catch (err) {
        Logger.error(messages.getMessage('requestTimedOut'));
        process.exit(1);
      }
    }
  }

  /**
   * Prompts user for project path and validates it
   */
  private static async promptForProjectPath(
    messages: Messages,
    askWithTimeout: (promptFn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]) => Promise<string>,
    mode: string
  ): Promise<string> {
    let gotValidPath = false;
    let folderPath = '';
    while (!gotValidPath) {
      folderPath = await ProjectPathUtil.getFolderPathFromUser(messages, askWithTimeout, mode);
      if (ProjectPathUtil.isValidFolderPath(folderPath, mode, messages)) {
        if (mode === EMPTY_MODE) {
          createSfdxProject(folderPath);
        }
        gotValidPath = true;
      }
    }
    return folderPath;
  }

  /**
   * Gets folder path input from user
   */
  private static async getFolderPathFromUser(
    messages: Messages,
    askWithTimeout: (promptFn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]) => Promise<string>,
    mode: string
  ): Promise<string> {
    try {
      const resp = await askWithTimeout(
        Logger.prompt.bind(Logger),
        mode === EXISTING_MODE
          ? messages.getMessage('enterExistingProjectPath')
          : messages.getMessage('enterEmptyProjectPath')
      );
      return typeof resp === 'string' ? path.resolve(resp.trim()) : '';
    } catch (err) {
      Logger.error(messages.getMessage('requestTimedOut'));
      process.exit(1);
    }
  }

  /**
   * Validates the folder path based on mode
   */
  private static isValidFolderPath(folderPath: string, mode: string, messages: Messages): boolean {
    if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
      Logger.error(messages.getMessage('invalidProjectFolderPath'));
      return false;
    }

    if (mode === EMPTY_MODE && fs.readdirSync(folderPath).length > 0) {
      Logger.error(messages.getMessage('notEmptyProjectFolderPath'));
      return false;
    }

    if (mode === EXISTING_MODE && !isSfdxProject(folderPath)) {
      Logger.error(messages.getMessage('notSfdxProjectFolderPath'));
      return false;
    }

    return true;
  }
}
