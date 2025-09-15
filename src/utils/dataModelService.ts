import { Connection, Messages } from '@salesforce/core';
import { OmnistudioOrgDetails } from './orgUtils';
import { ValidatorService } from './validatorService';
import { Constants } from './constants/stringContants';

export class DataModelService {
  private readonly validatorService: ValidatorService;

  public constructor(orgs: OmnistudioOrgDetails, connection: Connection, messages: Messages) {
    this.validatorService = new ValidatorService(orgs, connection, messages);
  }

  public async getDataModelInfo(): Promise<string> {
    let dataModel = 'unknown';
    const namespaceValid = this.validatorService.validateNamespace();
    const packageInstalled = this.validatorService.validatePackageInstalled();
    const omniStudioOrgPermissionEnabled = this.validatorService.validateOmniStudioOrgPermissionEnabled();
    const omniStudioLicensesValid = await this.validatorService.validateOmniStudioLicenses();
    if (namespaceValid && packageInstalled && omniStudioOrgPermissionEnabled && omniStudioLicensesValid) {
      dataModel = Constants.CustomDataModel;
    } else if (namespaceValid && packageInstalled && !omniStudioOrgPermissionEnabled) {
      dataModel = Constants.StandardDataModel;
    }
    return dataModel;
  }
}

// Global instance
let globalDataModelService: DataModelService | null = null;

// Initialize the global instance
export function initializeDataModelService(
  orgs: OmnistudioOrgDetails,
  connection: Connection,
  messages: Messages
): void {
  globalDataModelService = new DataModelService(orgs, connection, messages);
}

// Get the global instance
export function getDataModelService(): DataModelService {
  if (!globalDataModelService) {
    throw new Error('DataModelService has not been initialized. Call initializeDataModelService() first.');
  }
  return globalDataModelService;
}

// Convenience function to get data model info directly
export async function getDataModelInfo(): Promise<string> {
  return await getDataModelService().getDataModelInfo();
}
