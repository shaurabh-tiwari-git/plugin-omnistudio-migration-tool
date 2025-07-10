import { Connection } from '@salesforce/core';
import { AnonymousApexRunner } from './apex/executor/AnonymousApexRunner';

/**
 * Manager class for handling OmniGlobalAutoNumberPref org preference
 */
export class OmniGlobalAutoNumberPrefManager {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Check if OmniGlobalAutoNumberPref is enabled using FormulaParserService
   */
  public async isEnabled(): Promise<boolean> {
    try {
      const apexCode = `
        String orgId = UserInfo.getOrganizationId();
        java:industries.ptc.utils.PermissionUtils permUtils = new java:industries.ptc.utils.PermissionUtils();
        Boolean isEnabled = permUtils.isOrgPreferenceEnabled(orgId, 'OmniGlobalAutoNumberPref');
        System.debug('OmniGlobalAutoNumberPref enabled: ' + isEnabled);
      `;

      const result = await this.connection.tooling.executeAnonymous(apexCode);
      return result.success && result.compiled && !result.exceptionMessage;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable OmniGlobalAutoNumberPref
   */
  public async enable(): Promise<boolean> {
    try {
      // First check if it's already enabled
      if (await this.isEnabled()) {
        return true;
      }

      const apexCode = `
        industries.ptc.utils.PermissionUtils permissionUtils = 
          (industries.ptc.utils.PermissionUtils)ProviderFactory.get()
            .get(industries.ptc.utils.PermissionUtils.class);
        
        Boolean success = permissionUtils.setOrgPreference(
          UserContext.get().getOrganizationId(),
          'OmniGlobalAutoNumberPref',
          true
        );
        
        System.debug('Enablement result: ' + success);
      `;

      const result = await AnonymousApexRunner.runWithConnection(this.connection, apexCode);
      return result.success && result.compiled && !result.exceptionMessage;
    } catch (error) {
      return false;
    }
  }
}
