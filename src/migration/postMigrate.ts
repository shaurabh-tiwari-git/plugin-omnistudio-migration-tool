/* eslint-disable */

import { Connection, Messages, Org } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { ExecuteAnonymousResult } from 'jsforce';
import { Logger } from '../utils/logger';
import { AnonymousApexRunner } from '../utils/apex/executor/AnonymousApexRunner';
import { Constants } from '../utils/constants/stringContants';
import { OrgPreferences } from '../utils/orgPreferences';
import { BaseMigrationTool } from './base';
import { Deployer } from './deployer';

export class PostMigrate extends BaseMigrationTool {
  private readonly org: Org;
  private readonly relatedObjectsToProcess: string[];
  private readonly projectPath: string;
  private readonly deploymentConfig: { autoDeploy: boolean; authKey: string | undefined };

  // Source Custom Object Names
  constructor(
    org: Org,
    namespace: string,
    connection: Connection,
    logger: Logger,
    messages: Messages,
    ux: UX,
    relatedObjectsToProcess: string[],
    deploymentConfig: { autoDeploy: boolean; authKey: string | undefined },
    projectPath: string
  ) {
    super(namespace, connection, logger, messages, ux);
    this.org = org;
    this.relatedObjectsToProcess = relatedObjectsToProcess;
    this.deploymentConfig = deploymentConfig;
    this.projectPath = projectPath;
  }

  public async setDesignersToUseStandardDataModel(
    namespaceToModify: string,
    userActionMessage: string[]
  ): Promise<string[]> {
    try {
      Logger.logVerbose(this.messages.getMessage('settingDesignersToStandardModel'));
      const apexCode = `
          ${namespaceToModify}.OmniStudioPostInstallClass.useStandardDataModel();
        `;

      const result: ExecuteAnonymousResult = await AnonymousApexRunner.run(this.org, apexCode);

      if (result?.success === false) {
        const message = result?.exceptionStackTrace;
        Logger.error(this.messages.getMessage('errorSettingDesignersToStandardModel', [message]));
        userActionMessage.push(this.messages.getMessage('manuallySwitchDesignerToStandardDataModel'));
      } else if (result?.success === true) {
        Logger.logVerbose(this.messages.getMessage('designersSetToStandardModel'));
      }
    } catch (ex) {
      Logger.error(this.messages.getMessage('exceptionSettingDesignersToStandardModel', [JSON.stringify(ex)]));
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
      Logger.logVerbose(this.messages.getMessage('noRelatedObjects'));
      return;
    }
    if (
      this.relatedObjectsToProcess.includes(Constants.ExpSites) &&
      isExperienceBundleMetadataAPIProgramaticallyEnabled.value === true
    ) {
      Logger.logVerbose(this.messages.getMessage('turnOffExperienceBundleAPI'));
      try {
        await OrgPreferences.toggleExperienceBundleMetadataAPI(this.connection, false);
      } catch (error) {
        userActionMessage.push(this.messages.getMessage('errorRevertingExperienceBundleMetadataAPI'));
      }
    }
  }

  public deploy(): void {
    if (!this.deploymentConfig.autoDeploy) {
      return;
    }
    try {
      const deployer = new Deployer(
        this.projectPath,
        this.messages,
        this.org.getUsername(),
        this.deploymentConfig.authKey
      );
      deployer.deploy();
    } catch (error) {
      Logger.error(this.messages.getMessage('errorDeployingComponents'), error);
    }
  }
}
