import { Connection, Messages } from '@salesforce/core';
import { Logger } from '../utils/logger';
import { OmnistudioOrgDetails } from './orgUtils';

// Global variable to store data model type
let DATA_MODEL: string | null = null;

export class ValidatorService {
  private readonly connection: Connection;
  private readonly messages: Messages;
  private readonly orgs: OmnistudioOrgDetails;

  public constructor(orgs: OmnistudioOrgDetails, connection: Connection, messages: Messages) {
    this.orgs = orgs;
    this.connection = connection;
    this.messages = messages;
  }

  // Static methods to manage global DATA_MODEL variable
  public static setDataModel(dataModel: string): void {
    DATA_MODEL = dataModel;
    Logger.info('Current Data Model: ' + dataModel);
  }

  public static getDataModel(): string | null {
    return DATA_MODEL;
  }

  public static unsetDataModel(): void {
    DATA_MODEL = null;
  }

  public static hasDataModelInfo(): boolean {
    return DATA_MODEL !== null;
  }

  public async validate(): Promise<boolean> {
    const namespaceValid = this.validateNamespace();
    const packageInstalled = this.validatePackageInstalled();
    const omniStudioOrgPermissionEnabled = this.validateOmniStudioOrgPermissionEnabled();
    const omniStudioLicensesValid = await this.validateOmniStudioLicenses();

    // Determine DATA_MODEL based on validation results
    let dataModel: string;

    if (namespaceValid && packageInstalled && omniStudioOrgPermissionEnabled && omniStudioLicensesValid) {
      dataModel = 'custom';
    } else if (namespaceValid && packageInstalled && !omniStudioOrgPermissionEnabled) {
      dataModel = 'standard';
    } else {
      dataModel = 'unknown'; // Fallback for other cases
    }

    // Set the global DATA_MODEL variable
    ValidatorService.setDataModel(dataModel);

    // Return true if either custom or standard model is detected
    return dataModel === 'custom' || dataModel === 'standard';
  }

  public validatePackageInstalled(): boolean {
    const { packageDetails } = this.orgs;
    if (!packageDetails) {
      Logger.error(this.messages.getMessage('noPackageInstalled'));
      return false;
    }
    return true;
  }

  public validateOmniStudioOrgPermissionEnabled(): boolean {
    const { omniStudioOrgPermissionEnabled } = this.orgs;
    if (omniStudioOrgPermissionEnabled) {
      Logger.info(this.messages.getMessage('alreadyStandardModel'));
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

  public async validateOmniStudioLicenses(): Promise<boolean> {
    try {
      const query =
        "SELECT count(DeveloperName) total FROM PermissionSetLicense WHERE PermissionSetLicenseKey LIKE 'OmniStudio%' AND Status = 'Active'";
      const result = await this.connection.query<{ total: string }>(query);

      // Salesforce returns records as an array in result.records
      if (result?.records && result?.records?.length > 0) {
        // Since we only get one record with the total count, check if count > 0
        const totalCount = Number(result.records[0].total);
        if (totalCount > 0) {
          return true;
        }
      }

      Logger.error(this.messages.getMessage('noOmniStudioLicenses'));
      return false;
    } catch (error) {
      if (error instanceof Error && error.message) {
        Logger.error(`Error validating OmniStudio licenses: ${error.message}`);
      } else {
        Logger.error('Error validating OmniStudio licenses: Unknown error');
      }
      return false;
    }
  }
}
