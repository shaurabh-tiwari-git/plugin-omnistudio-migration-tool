import { Connection, Messages } from '@salesforce/core';
import { Logger } from '../utils/logger';
import { OmnistudioOrgDetails } from './orgUtils';
import { globalValidationState, ValidationResult } from './globalValidationState';

export class ValidatorService {
  private readonly connection: Connection;
  private readonly messages: Messages;
  private readonly orgs: OmnistudioOrgDetails;

  public constructor(orgs: OmnistudioOrgDetails, connection: Connection, messages: Messages) {
    this.orgs = orgs;
    this.connection = connection;
    this.messages = messages;
  }

  public async validate(): Promise<boolean> {
    return (
      this.validateNamespace() &&
      this.validatePackageInstalled() &&
      this.validateOmniStudioOrgPermissionEnabled() &&
      (await this.validateOmniStudioLicenses())
    );
  }

  public validatePackageInstalled(): boolean {
    const { packageDetails } = this.orgs;
    if (!packageDetails) {
      const result: ValidationResult = {
        isValid: false,
        message: this.messages.getMessage('noPackageInstalled'),
      };
      globalValidationState.setPackageInstallationValidation(result);
      Logger.error(this.messages.getMessage('noPackageInstalled'));
      return false;
    }
    const result: ValidationResult = {
      isValid: true,
      message: 'Package installation validated successfully',
      details: { namespace: packageDetails.namespace, version: packageDetails.version },
    };
    globalValidationState.setPackageInstallationValidation(result);
    return true;
  }

  public validateOmniStudioOrgPermissionEnabled(): boolean {
    const { omniStudioOrgPermissionEnabled } = this.orgs;
    if (omniStudioOrgPermissionEnabled) {
      const result: ValidationResult = {
        isValid: false,
        message: this.messages.getMessage('alreadyStandardModel'),
      };
      globalValidationState.setOmniStudioOrgPermissionValidation(result);
      Logger.error(this.messages.getMessage('alreadyStandardModel'));
      return false;
    }
    const result: ValidationResult = {
      isValid: true,
      message: 'OmniStudio org permission validation passed',
    };
    globalValidationState.setOmniStudioOrgPermissionValidation(result);
    return true;
  }

  public validateNamespace(): boolean {
    const { hasValidNamespace } = this.orgs;
    if (!hasValidNamespace) {
      const result: ValidationResult = {
        isValid: false,
        message: this.messages.getMessage('unknownNamespace'),
      };
      globalValidationState.setNamespaceValidation(result);
      Logger.error(this.messages.getMessage('unknownNamespace'));
      return false;
    }
    const result: ValidationResult = {
      isValid: true,
      message: 'Namespace validation passed',
      details: { namespace: this.orgs.packageDetails?.namespace },
    };
    globalValidationState.setNamespaceValidation(result);
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
          const validationResult: ValidationResult = {
            isValid: true,
            message: 'OmniStudio licenses validation passed',
            details: { licenseCount: totalCount },
          };
          globalValidationState.setOmniStudioLicensesValidation(validationResult);
          return true;
        }
      }

      const validationResult: ValidationResult = {
        isValid: false,
        message: this.messages.getMessage('noOmniStudioLicenses'),
      };
      globalValidationState.setOmniStudioLicensesValidation(validationResult);
      Logger.error(this.messages.getMessage('noOmniStudioLicenses'));
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? `Error validating OmniStudio licenses: ${error.message}`
          : 'Error validating OmniStudio licenses: Unknown error';

      const validationResult: ValidationResult = {
        isValid: false,
        message: errorMessage,
      };
      globalValidationState.setOmniStudioLicensesValidation(validationResult);

      Logger.error(errorMessage);
      return false;
    }
  }
}
