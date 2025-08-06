/* eslint-disable */

import { Connection, Messages } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { Logger } from '../utils/logger';
import { Constants } from '../utils/constants/stringContants';
import { OrgPreferences } from '../utils/orgPreferences';
import { BaseMigrationTool } from './base';
import { askStringWithTimeout } from '../utils/promptUtil';

export class PreMigrate extends BaseMigrationTool {
  // Source Custom Object Names
  constructor(namespace: string, connection: Connection, logger: Logger, messages: Messages, ux: UX) {
    super(namespace, connection, logger, messages, ux);
  }

  public async handleExperienceSitePrerequisites(
    objectsToProcess: string[],
    conn: Connection,
    isExperienceBundleMetadataAPIProgramaticallyEnabled: { value: boolean }
  ): Promise<void> {
    if (objectsToProcess.includes(Constants.ExpSites)) {
      const expMetadataApiConsent = await this.getExpSiteMetadataEnableConsent();
      Logger.logVerbose(this.messages.getMessage('experienceSiteMetadataConsent', [expMetadataApiConsent]));

      if (expMetadataApiConsent === false) {
        Logger.warn(this.messages.getMessage('experienceSiteConsentNotProvidedWarning'));
        this.removeKeyFromRelatedObjectsToProcess(Constants.ExpSites, objectsToProcess);
        Logger.logVerbose(
          this.messages.getMessage('relatedObjectsToProcessAfterExpSitesRemoval', [JSON.stringify(objectsToProcess)])
        );
        return;
      }

      const isMetadataAPIPreEnabled = await OrgPreferences.isExperienceBundleMetadataAPIEnabled(conn);
      if (isMetadataAPIPreEnabled === true) {
        Logger.logVerbose(this.messages.getMessage('experienceBundleMetadataAPIAlreadyEnabled'));
        return;
      }

      Logger.logVerbose(this.messages.getMessage('enableExperienceBundleMetadataAPIProgramatically'));
      isExperienceBundleMetadataAPIProgramaticallyEnabled.value = await OrgPreferences.setExperienceBundleMetadataAPI(
        conn,
        true
      );
      if (isExperienceBundleMetadataAPIProgramaticallyEnabled.value === false) {
        this.removeKeyFromRelatedObjectsToProcess(Constants.ExpSites, objectsToProcess);
        Logger.warn(this.messages.getMessage('unableToEnableExperienceBundleMetadataAPI'));
      }

      Logger.logVerbose(this.messages.getMessage('relatedObjectsToProcess', [JSON.stringify(objectsToProcess)]));
    }
  }

  // This needs to be behind timeout
  private async getExpSiteMetadataEnableConsent(): Promise<boolean> {
    const question = this.messages.getMessage('consentForExperienceSites');

    while (true) {
      try {
        // Get string input from user with timeout
        const userInput = await askStringWithTimeout(
          Logger.prompt.bind(Logger),
          question,
          this.messages.getMessage('requestTimedOut')
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
        Logger.error(this.messages.getMessage('failedToGetConsentError', [error.message]));
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
