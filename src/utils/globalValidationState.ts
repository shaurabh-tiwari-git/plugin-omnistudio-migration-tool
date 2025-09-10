/**
 * Global validation state manager for storing validation results
 * This allows access to validation information across different parts of the application
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

export interface GlobalValidationState {
  namespaceValidation: ValidationResult;
  packageInstallationValidation: ValidationResult;
  omniStudioOrgPermissionValidation: ValidationResult;
  omniStudioLicensesValidation: ValidationResult;
  overallValidationPassed: boolean;
}

class GlobalValidationStateManager {
  private static instance: GlobalValidationStateManager;
  private validationState: GlobalValidationState;

  private constructor() {
    this.validationState = {
      namespaceValidation: { isValid: false },
      packageInstallationValidation: { isValid: false },
      omniStudioOrgPermissionValidation: { isValid: false },
      omniStudioLicensesValidation: { isValid: false },
      overallValidationPassed: false,
    };
  }

  public static getInstance(): GlobalValidationStateManager {
    if (!GlobalValidationStateManager.instance) {
      GlobalValidationStateManager.instance = new GlobalValidationStateManager();
    }
    return GlobalValidationStateManager.instance;
  }

  public getValidationState(): GlobalValidationState {
    return this.validationState;
  }

  public setNamespaceValidation(result: ValidationResult): void {
    this.validationState.namespaceValidation = result;
    this.updateOverallValidation();
  }

  public setPackageInstallationValidation(result: ValidationResult): void {
    this.validationState.packageInstallationValidation = result;
    this.updateOverallValidation();
  }

  public setOmniStudioOrgPermissionValidation(result: ValidationResult): void {
    this.validationState.omniStudioOrgPermissionValidation = result;
    this.updateOverallValidation();
  }

  public setOmniStudioLicensesValidation(result: ValidationResult): void {
    this.validationState.omniStudioLicensesValidation = result;
    this.updateOverallValidation();
  }

  public resetValidationState(): void {
    this.validationState = {
      namespaceValidation: { isValid: false },
      packageInstallationValidation: { isValid: false },
      omniStudioOrgPermissionValidation: { isValid: false },
      omniStudioLicensesValidation: { isValid: false },
      overallValidationPassed: false,
    };
  }

  private updateOverallValidation(): void {
    this.validationState.overallValidationPassed =
      this.validationState.namespaceValidation.isValid &&
      this.validationState.packageInstallationValidation.isValid &&
      this.validationState.omniStudioOrgPermissionValidation.isValid &&
      this.validationState.omniStudioLicensesValidation.isValid;
  }
}

// Export the singleton instance
export const globalValidationState = GlobalValidationStateManager.getInstance();
