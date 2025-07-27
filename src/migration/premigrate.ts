/* eslint-disable */

import { Connection, Messages, Org } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { Logger } from '../utils/logger';
import { Constants } from '../utils/constants/stringContants';
import { OrgPreferences } from '../utils/orgPreferences';
import { BaseMigrationTool } from './base';
import { askStringWithTimeout } from '../utils/promptUtil';

export class PreMigrate extends BaseMigrationTool {
  private readonly org: Org;

  // Source Custom Object Names
  constructor(org: Org, namespace: string, connection: Connection, logger: Logger, messages: Messages, ux: UX) {
    super(namespace, connection, logger, messages, ux);
    this.org = org;
  }

  // Just to disable org is unused error coming
  public printOrg(): void {
    try {
      Logger.log(JSON.stringify(this.org));
    } catch (e) {
      Logger.log(e);
    }
  }

  public async handleExperienceSitePrerequisites(
    objectsToProcess: string[],
    conn: Connection,
    isExperienceBundleMetadataAPIProgramaticallyEnabled: { value: boolean }
  ): Promise<void> {
    if (objectsToProcess.includes(Constants.ExpSites)) {
      const expMetadataApiConsent = await this.getExpSiteMetadataEnableConsent();
      Logger.logVerbose(`The consent for exp site is  ${expMetadataApiConsent}`);

      if (expMetadataApiConsent === false) {
        Logger.warn('Consent for experience sites is not provided. Experience sites will not be processed');
        this.removeKeyFromRelatedObjectsToProcess(Constants.ExpSites, objectsToProcess);
        Logger.logVerbose(`Objects to process after removing expsite are ${JSON.stringify(objectsToProcess)}`);
        return;
      }

      const isMetadataAPIPreEnabled = await OrgPreferences.isExperienceBundleMetadataAPIEnabled(conn);
      if (isMetadataAPIPreEnabled === true) {
        Logger.logVerbose('ExperienceBundle metadata api is already enabled');
        return;
      }

      Logger.logVerbose('ExperienceBundle metadata api needs to be programatically enabled');
      isExperienceBundleMetadataAPIProgramaticallyEnabled.value = await OrgPreferences.setExperienceBundleMetadataAPI(
        conn,
        true
      );
      if (isExperienceBundleMetadataAPIProgramaticallyEnabled.value === false) {
        this.removeKeyFromRelatedObjectsToProcess(Constants.ExpSites, objectsToProcess);
        Logger.warn('Since the api could not able enabled the experience sites would not be processed');
      }

      Logger.logVerbose(`Objects to process are ${JSON.stringify(objectsToProcess)}`);
    }
  }

  // This needs to be behind timeout
  private async getExpSiteMetadataEnableConsent(): Promise<boolean> {
    const question =
      'By proceeding further, you hereby consent to enable digital experience metadata api(y/n). If y sites will be processed, if n expsites will not be processed';

    while (true) {
      try {
        // Get string input from user with timeout
        const userInput = await askStringWithTimeout(
          Logger.prompt.bind(Logger),
          question,
          this.messages.getMessage('requestTimedOut'),
          1000
        );

        // Validate and convert the input
        const normalizedInput = userInput.trim().toLowerCase();

        if (normalizedInput === 'y' || normalizedInput === 'yes') {
          return true;
        } else if (normalizedInput === 'n' || normalizedInput === 'no') {
          return false;
        } else {
          // Invalid input - show error and continue loop to re-prompt
          Logger.error(this.messages.getMessage('invalidYesNoResponse'));
          Logger.log('Please enter "y" or "yes" to consent, "n" or "no" to decline.');
        }
      } catch (error) {
        // Handle timeout or other errors
        Logger.error(`Failed to get user consent: ${error.message}`);
        throw error; // Re-throw to let caller handle timeout
      }
    }
  }

  private removeKeyFromRelatedObjectsToProcess(keyToRemove: string, relatedObjects: string[]): void {
    const index = relatedObjects.indexOf(Constants.ExpSites);
    if (index > -1) {
      relatedObjects.splice(index, 1);
    }
  }
}
