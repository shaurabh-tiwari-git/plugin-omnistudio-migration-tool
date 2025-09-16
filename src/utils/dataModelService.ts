import { Connection, Messages } from '@salesforce/core';
import { OmnistudioOrgDetails } from './orgUtils';
import { Constants } from './constants/stringContants';
import { Logger } from './logger';

export class DataModelService {
  private readonly connection: Connection;
  private readonly messages: Messages;
  private readonly orgs: OmnistudioOrgDetails;

  public constructor(orgs: OmnistudioOrgDetails, connection: Connection, messages: Messages) {
    this.orgs = orgs;
    this.connection = connection;
    this.messages = messages;
  }

  public async determineDataModel(): Promise<string> {
    let dataModel = 'unknown';
    const omniStudioOrgPermissionEnabled = this.validateOmniStudioOrgPermissionEnabled();
    const omniStudioLicensesValid = await this.validateOmniStudioLicenses();
    if (omniStudioOrgPermissionEnabled && omniStudioLicensesValid) {
      dataModel = Constants.CustomDataModel;
    } else if (!omniStudioOrgPermissionEnabled) {
      dataModel = Constants.StandardDataModel;
    }
    return dataModel;
  }

  private validateOmniStudioOrgPermissionEnabled(): boolean {
    const { omniStudioOrgPermissionEnabled } = this.orgs;
    if (omniStudioOrgPermissionEnabled) {
      Logger.info(this.messages.getMessage('alreadyStandardModel'));
      return false;
    }
    return true;
  }

  private async validateOmniStudioLicenses(): Promise<boolean> {
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

// Global instance and cached data model
let globalDataModelService: DataModelService | null = null;
let cachedDataModel: string | null = null;

// Initialize the global instance
export function initializeDataModelService(
  orgs: OmnistudioOrgDetails,
  connection: Connection,
  messages: Messages
): void {
  globalDataModelService = new DataModelService(orgs, connection, messages);
  cachedDataModel = null; // Reset cache when reinitializing
}

// Get the global instance
export function getDataModelService(): DataModelService {
  if (!globalDataModelService) {
    throw new Error('DataModelService has not been initialized. Call initializeDataModelService() first.');
  }
  return globalDataModelService;
}

// Convenience function to get data model info directly (with caching)
export async function getDataModelInfo(): Promise<string> {
  if (cachedDataModel === null) {
    cachedDataModel = await getDataModelService().determineDataModel();
  }
  return cachedDataModel;
}

// Convenience function to check if data model is standard
export async function isStandardDataModel(): Promise<boolean> {
  const dataModel = await getDataModelInfo();
  return dataModel === Constants.StandardDataModel;
}

// Convenience function to check if data model is custom
export async function isCustomDataModel(): Promise<boolean> {
  const dataModel = await getDataModelInfo();
  return dataModel === Constants.CustomDataModel;
}
