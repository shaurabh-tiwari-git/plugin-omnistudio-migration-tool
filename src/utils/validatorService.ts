import { Messages } from '@salesforce/core';
import { Logger } from '../utils/logger';
import { OmnistudioOrgDetails } from './orgUtils';
import { isStandardDataModel, isCustomDataModel } from './dataModelService';

export class ValidatorService {
  private readonly messages: Messages;
  private readonly orgs: OmnistudioOrgDetails;

  public constructor(orgs: OmnistudioOrgDetails, messages: Messages) {
    this.orgs = orgs;
    this.messages = messages;
  }

  public async validate(): Promise<boolean> {
    const basicValidation = this.validateNamespace() && this.validatePackageInstalled();
    if (!basicValidation) {
      return false;
    }

    // Validate that data model is either standard or custom (not unknown)
    const isStandard = await isStandardDataModel();
    const isCustom = await isCustomDataModel();

    if (!isStandard && !isCustom) {
      Logger.error(this.messages.getMessage('unknownDataModel'));
      return false;
    }

    return true;
  }

  public validatePackageInstalled(): boolean {
    const { packageDetails } = this.orgs;
    if (!packageDetails) {
      Logger.error(this.messages.getMessage('noPackageInstalled'));
      return false;
    }
    return true;
  }

  public validateNamespace(): boolean {
    const { hasValidNamespace } = this.orgs;
    if (!hasValidNamespace) {
      Logger.error(this.messages.getMessage('unknownNamespace'));
      return false;
    }
    return true;
  }
}
