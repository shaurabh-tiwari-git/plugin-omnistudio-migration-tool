import { Connection, Messages } from '@salesforce/core';
import { Logger } from './logger';
import { MetadataInfo } from './interfaces';

export class OmnistudioSettingsPrefManager {
  public constructor(private connection: Connection, private messages: Messages) {}

  // Omni Global Auto Number methods
  public async isGlobalAutoNumberEnabled(): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await this.connection.metadata.read('OmniStudioSettings', ['OmniStudio'])) as unknown;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const metadata = result as MetadataInfo;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return metadata?.enableOmniGlobalAutoNumberPref === 'true' || false;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      Logger.error(this.messages.getMessage('errorCheckingGlobalAutoNumber', [errMsg]));
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async enableGlobalAutoNumber(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.connection.metadata.update('OmniStudioSettings', [
      {
        fullName: 'OmniStudio',
        enableOmniGlobalAutoNumberPref: 'true',
      } as MetadataInfo,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async enableGlobalAutoNumberIfDisabled(): Promise<any> {
    const isEnabled = await this.isGlobalAutoNumberEnabled();
    if (!isEnabled) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.enableGlobalAutoNumber();
    }
    return null; // Already enabled, no action needed
  }

  // Standard Runtime methods
  public async isStandardRuntimeEnabled(): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await this.connection.metadata.read('OmniStudioSettings', ['OmniStudio'])) as unknown;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const metadata = result as MetadataInfo;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return metadata?.enableStandardOmniStudioRuntime === 'true' || false;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      Logger.error(this.messages.getMessage('errorCheckingStandardRuntime', [errMsg]));
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async enableStandardRuntime(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.connection.metadata.update('OmniStudioSettings', [
      {
        fullName: 'OmniStudio',
        enableStandardOmniStudioRuntime: 'true',
      } as MetadataInfo,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async enableStandardRuntimeIfDisabled(): Promise<any> {
    const isEnabled = await this.isStandardRuntimeEnabled();
    if (!isEnabled) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.enableStandardRuntime();
    }
    return null; // Already enabled, no action needed
  }
}
