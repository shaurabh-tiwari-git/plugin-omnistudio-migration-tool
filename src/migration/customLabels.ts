import { UX } from '@salesforce/command';
import { Connection, Messages } from '@salesforce/core';
import { NetUtils, RequestMethod } from '../utils/net';
import { Logger } from '../utils/logger';
import { BaseMigrationTool } from './base';
import { MigrationTool, MigrationResult, ObjectMapping } from './interfaces';

export interface CustomLabelMigrationResult {
  labelName: string;
  status: string;
}

export interface CustomLabelLocalizationResult {
  [labelName: string]: {
    [languageCode: string]: string;
  };
}

export interface CustomLabelMigrationResponse {
  results: CustomLabelMigrationResult[];
}

export interface CustomLabelLocalizationResponse {
  results: CustomLabelLocalizationResult;
}

export interface CustomLabelRecord {
  labelName?: string;
  Name?: string;
  Id?: string;
  name?: string;
  status?: string;
  cloneStatus?: string;
  localizationStatus?: Record<string, string>;
  errors?: string[];
  warnings?: string[];
}

export class CustomLabelsMigrationTool extends BaseMigrationTool implements MigrationTool {
  public constructor(namespace: string, connection: Connection, logger: Logger, messages: Messages, ux: UX) {
    super(namespace, connection, logger, messages, ux);
  }

  public getName(): string {
    return 'Custom Labels';
  }

  public getRecordName(record: CustomLabelRecord): string {
    return record.labelName || record.Name || 'Unknown';
  }

  public getMappings(): ObjectMapping[] {
    return [
      {
        source: 'Custom Labels',
        target: 'Custom Labels',
      },
    ];
  }

  public async truncate(): Promise<void> {
    // Custom labels don't need truncation as they are created via API
    Logger.log('Skipping truncation for Custom Labels');
    await Promise.resolve();
  }

  public async migrate(): Promise<MigrationResult[]> {
    try {
      Logger.log('Starting Custom Labels migration...');

      const results = new Map<string, any>();
      const records = new Map<string, any>();
      const errors: string[] = [];

      // Call first API: clone-custom-labels
      const cloneLabelsResponse = await this.callCloneCustomLabelsAPI();

      // Call second API: clone-custom-label-localizations
      const cloneLocalizationsResponse = await this.callCloneCustomLabelLocalizationsAPI();

      // Process results and include all labels
      const allLabels = this.processMigrationResults(cloneLabelsResponse, cloneLocalizationsResponse);

      // Store results using labelName as key for consistency
      allLabels.forEach((label) => {
        const key = label.labelName;
        const { mappedStatus, hasErrors } = this.mapCloneStatusToMigrationStatus(label.cloneStatus);

        results.set(key, {
          referenceId: key,
          id: label.labelName,
          newName: label.labelName,
          errors: label.errors || [],
          warnings: label.warnings || [],
          hasErrors,
          success: label.cloneStatus === 'created',
          type: 'Custom Label',
        });

        records.set(key, {
          ...label,
          Id: label.labelName,
          name: label.labelName,
          status: mappedStatus,
          localizationStatus: label.localizationStatus,
        });
      });

      const totalLabels = cloneLabelsResponse.results ? cloneLabelsResponse.results.length : 0;
      Logger.log(`Custom Labels migration completed. ${allLabels.length} labels processed out of ${totalLabels} total`);

      return [
        {
          name: this.getName(),
          results,
          records,
          errors,
        },
      ];
    } catch (error) {
      Logger.error(`Error during Custom Labels migration: ${String(error)}`);
      return [
        {
          name: this.getName(),
          results: new Map(),
          records: new Map(),
          errors: [String(error)],
        },
      ];
    }
  }

  private async callCloneCustomLabelsAPI(): Promise<CustomLabelMigrationResponse> {
    try {
      const url = 'connect/omni-runtime/omniscript/clone-custom-labels';
      const body = {
        namespace: this.namespace,
      };

      Logger.logVerbose(`Calling clone-custom-labels API for namespace: ${this.namespace}`);

      const response = await NetUtils.request(this.connection, url, body, RequestMethod.POST);

      const typedResponse = response as CustomLabelMigrationResponse;
      Logger.logVerbose(
        `Clone custom labels API response summary: ${typedResponse.results ? typedResponse.results.length : 0} results`
      );

      return response as CustomLabelMigrationResponse;
    } catch (error) {
      Logger.error(`Error calling clone-custom-labels API: ${String(error)}`);
      throw error;
    }
  }

  private async callCloneCustomLabelLocalizationsAPI(): Promise<CustomLabelLocalizationResponse> {
    try {
      const url = 'connect/omni-runtime/omniscript/clone-custom-label-localizations';
      const body = {
        namespace: this.namespace,
      };

      Logger.logVerbose(`Calling clone-custom-label-localizations API for namespace: ${this.namespace}`);

      const response = await NetUtils.request(this.connection, url, body, RequestMethod.POST);

      const typedResponse = response as CustomLabelLocalizationResponse;
      Logger.logVerbose(
        `Clone custom label localizations API response summary: ${
          typedResponse.results ? Object.keys(typedResponse.results).length : 0
        } labels with localizations`
      );

      return response as CustomLabelLocalizationResponse;
    } catch (error) {
      Logger.error(`Error calling clone-custom-label-localizations API: ${String(error)}`);
      throw error;
    }
  }

  private processMigrationResults(
    cloneLabelsResponse: CustomLabelMigrationResponse,
    cloneLocalizationsResponse: CustomLabelLocalizationResponse
  ): any[] {
    const allLabels: any[] = [];

    // Process clone labels results
    if (cloneLabelsResponse.results) {
      cloneLabelsResponse.results.forEach((labelResult) => {
        const labelInfo: any = {
          labelName: labelResult.labelName,
          cloneStatus: labelResult.status,
          localizationStatus: {},
          errors: [],
          warnings: [],
        };

        // Check if clone status needs attention
        if (labelResult.status !== 'created') {
          if (labelResult.status === 'duplicate') {
            labelInfo.warnings.push(`Label already exists with status: ${labelResult.status}`);
          } else if (labelResult.status === 'error') {
            labelInfo.errors.push(`Failed to clone label with status: ${labelResult.status}`);
          }
        }

        // Process localizations for this label
        if (cloneLocalizationsResponse.results && cloneLocalizationsResponse.results[labelResult.labelName]) {
          const localizations = cloneLocalizationsResponse.results[labelResult.labelName];
          labelInfo.localizationStatus = localizations;

          // Check localization statuses
          Object.entries(localizations).forEach(([languageCode, status]) => {
            if (status !== 'created') {
              if (status === 'duplicate') {
                labelInfo.warnings.push(`Localization for ${languageCode} already exists`);
              } else if (status === 'error') {
                labelInfo.errors.push(`Failed to create localization for ${languageCode}`);
              }
            }
          });
        }

        // Include all labels regardless of status
        allLabels.push(labelInfo);
      });
    }

    return allLabels;
  }

  /**
   * Maps Custom Labels API clone status to migration status format
   *
   * @param cloneStatus - The status returned by the clone API
   * @returns Object containing mapped status and error flag
   */
  private mapCloneStatusToMigrationStatus(cloneStatus: string): { mappedStatus: string; hasErrors: boolean } {
    switch (cloneStatus) {
      case 'created':
        return { mappedStatus: 'Complete', hasErrors: false };
      case 'error':
        return { mappedStatus: 'Error', hasErrors: true };
      case 'duplicate':
        return { mappedStatus: 'Skipped', hasErrors: false };
      default:
        return { mappedStatus: 'Skipped', hasErrors: false };
    }
  }
}
