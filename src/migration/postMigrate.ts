/* eslint-disable */

import { Connection, Messages, Org } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { ExecuteAnonymousResult } from 'jsforce';
import { Logger } from '../utils/logger';
import { AnonymousApexRunner } from '../utils/apex/executor/AnonymousApexRunner';
import { Constants } from '../utils/constants/stringContants';
import { OrgPreferences } from '../utils/orgPreferences';
import { BaseMigrationTool } from './base';

export class PostMigrate extends BaseMigrationTool {
  private readonly org: Org;
  private readonly relatedObjectsToProcess: string[];

  // Source Custom Object Names
  constructor(
    org: Org,
    namespace: string,
    connection: Connection,
    logger: Logger,
    messages: Messages,
    ux: UX,
    relatedObjectsToProcess: string[]
  ) {
    super(namespace, connection, logger, messages, ux);
    this.org = org;
    this.relatedObjectsToProcess = relatedObjectsToProcess;
  }

  public async setDesignersToUseStandardDataModel(
    namespaceToModify: string,
    userActionMessage: string[]
  ): Promise<string[]> {
    try {
      Logger.logVerbose('Setting designers to use the standard data model');
      const apexCode = `
          ${namespaceToModify}.OmniStudioPostInstallClass.useStandardDataModel();
        `;

      const result: ExecuteAnonymousResult = await AnonymousApexRunner.run(this.org, apexCode);

      if (result?.success === false) {
        const message = result?.exceptionStackTrace;
        Logger.error(`Error occurred while setting designers to use the standard data model ${message}`);
        userActionMessage.push(this.messages.getMessage('manuallySwitchDesignerToStandardDataModel'));
      } else if (result?.success === true) {
        Logger.logVerbose('Successfully executed setDesignersToUseStandardDataModel');
      }
    } catch (ex) {
      Logger.error(`Exception occurred while setting designers to use the standard data model ${JSON.stringify(ex)}`);
      userActionMessage.push(this.messages.getMessage('manuallySwitchDesignerToStandardDataModel'));
    }
    return userActionMessage;
  }

  // If we processed exp sites and switched metadata api from off->on then only we revert it
  public async restoreExperienceAPIMetadataSettings(
    isExperienceBundleMetadataAPIProgramaticallyEnabled: {
      value: boolean;
    },
    userActionMessage: string[]
  ): Promise<void> {
    if (this.relatedObjectsToProcess === undefined || this.relatedObjectsToProcess === null) {
      Logger.logVerbose('Please check related objects to process as it is coming as null');
      return;
    }
    if (
      this.relatedObjectsToProcess.includes(Constants.ExpSites) &&
      isExperienceBundleMetadataAPIProgramaticallyEnabled.value === true
    ) {
      Logger.logVerbose('Since ExperienceSiteMetadata API was programatically enabled, turing it off');
      try {
        await OrgPreferences.toggleExperienceBundleMetadataAPI(this.connection, false);
      } catch (error) {
        userActionMessage.push('Exception occurred while reverting metadata API. Please do that manually');
      }
    }
  }
}
