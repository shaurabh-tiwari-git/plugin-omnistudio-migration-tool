import { Connection, Messages } from '@salesforce/core';
import { Logger } from './logger';
import { MetadataInfo } from './interfaces';

export class OmnistudioSettingsPrefManager {
  public constructor(private connection: Connection, private messages: Messages<string>) {}

  // Omni Global Auto Number methods
  public async isGlobalAutoNumberEnabled(): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      const result = (await (this.connection.metadata.read as any)('OmniStudioSettings', ['OmniStudio'])) as unknown;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const metadata = (Array.isArray(result) ? result[0] : result) as MetadataInfo;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    return await (this.connection.metadata.update as any)('OmniStudioSettings', [
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      const result = (await (this.connection.metadata.read as any)('OmniStudioSettings', ['OmniStudio'])) as unknown;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const metadata = (Array.isArray(result) ? result[0] : result) as MetadataInfo;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    return await (this.connection.metadata.update as any)('OmniStudioSettings', [
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

  // OmniStudio Metadata methods
  public async isOmniStudioSettingsMetadataEnabled(): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      const result = (await (this.connection.metadata.read as any)('OmniStudioSettings', ['OmniStudio'])) as unknown;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const metadata = (Array.isArray(result) ? result[0] : result) as MetadataInfo;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return metadata?.enableOmniStudioMetadata === 'true' || false;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      Logger.error(this.messages.getMessage('errorCheckingOmniStudioMetadata', [errMsg]));
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async enableOmniStudioSettingsMetadata(): Promise<any> {
    const isMetadataEnabled = await this.isOmniStudioSettingsMetadataEnabled();
    if (isMetadataEnabled) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    return await (this.connection.metadata.update as any)('OmniStudioSettings', [
      {
        fullName: 'OmniStudio',
        enableOmniStudioMetadata: 'true',
      } as MetadataInfo,
    ]);
  }
}
