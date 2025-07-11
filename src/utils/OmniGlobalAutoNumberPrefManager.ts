import { Connection } from '@salesforce/core';
import { MetadataInfo } from './interfaces';

/**
 * Manager class for handling OmniGlobalAutoNumberPref org preference
 */
export class OmniGlobalAutoNumberPrefManager {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Check if OmniGlobalAutoNumberPref is enabled
   */
  public async isEnabled(): Promise<boolean> {
    try {
      const result = (await this.connection.metadata.read('OmniStudioSettings', ['OmniStudio'])) as MetadataInfo;
      return result?.enableOmniGlobalAutoNumberPref === 'true' || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable OmniGlobalAutoNumberPref
   */
  public async enable(): Promise<boolean> {
    try {
      await this.connection.metadata.update('OmniStudioSettings', [
        {
          fullName: 'OmniStudio',
          enableOmniGlobalAutoNumberPref: 'true',
        } as MetadataInfo,
      ]);
      return true;
    } catch (error) {
      return false;
    }
  }
}
