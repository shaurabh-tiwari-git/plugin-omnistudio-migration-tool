import { Connection, Messages } from '@salesforce/core';
import { Logger } from '../logger';
import { QueryTools } from '../query';
import { NetUtils } from '../net';

/**
 * OmniStudioMetadataCleanupService
 *
 * This service checks for records in four OmniStudio metadata tables and cleans them if found:
 * - OmniUiCardConfig
 * - OmniScriptConfig
 * - OmniIntegrationProcConfig
 * - OmniDataTransformConfig
 */

export class OmniStudioMetadataCleanupService {
  private static readonly CONFIG_TABLES = [
    'OmniUiCardConfig',
    'OmniScriptConfig',
    'OmniIntegrationProcConfig',
    'OmniDataTransformConfig',
  ];

  private readonly connection: Connection;
  private readonly messages: Messages;

  public constructor(connection: Connection, messages: Messages) {
    this.messages = messages;
    this.connection = connection;
  }

  /**
   * Checks if all config tables are clean (have no records)
   *
   * @returns Promise<boolean> - true if all tables are empty, false if any table has records
   */
  public async hasCleanOmniStudioMetadataTables(): Promise<boolean> {
    try {
      for (const tableName of OmniStudioMetadataCleanupService.CONFIG_TABLES) {
        const recordIds = await QueryTools.queryIds(this.connection, tableName);
        if (recordIds.length > 0) {
          return false;
        }
      }
      return true;
    } catch (error) {
      Logger.error(this.messages.getMessage('errorCheckingMetadataTables', [String(error)]));
      return false;
    }
  }

  /**
   * Checks all config tables for records and cleans them if found
   *
   * @returns Promise<boolean> - true if cleanup was successful, false otherwise
   */
  public async cleanupOmniStudioMetadataTables(): Promise<boolean> {
    try {
      Logger.log(this.messages.getMessage('startingMetadataCleanup'));

      let totalCleanedRecords = 0;
      const failedTables: string[] = [];

      for (const tableName of OmniStudioMetadataCleanupService.CONFIG_TABLES) {
        const recordCount = await this.cleanupOmniStudioMetadataTable(tableName);

        if (recordCount >= 0) {
          totalCleanedRecords += recordCount;
        } else {
          failedTables.push(tableName);
        }
      }

      if (failedTables.length > 0) {
        Logger.error(this.messages.getMessage('failedToCleanTables', [failedTables.join(', ')]));
        return false;
      }

      Logger.log(this.messages.getMessage('metadataCleanupCompleted', [totalCleanedRecords]));
      return true;
    } catch (error) {
      Logger.error(this.messages.getMessage('errorCheckingMetadataTables', [String(error)]));
      return false;
    }
  }

  /**
   * Checks a specific table for records and cleans them if found
   *
   * @param tableName - Name of the table to check and clean
   * @returns Promise<number> - number of cleaned records, or -1 if failed
   */
  private async cleanupOmniStudioMetadataTable(tableName: string): Promise<number> {
    const recordIds = await QueryTools.queryIds(this.connection, tableName);

    if (recordIds.length === 0) {
      return 0;
    }

    const deleteResult = await NetUtils.deleteWithFieldIntegrityException(this.connection, recordIds);
    if (!deleteResult.success && deleteResult.statusCode === 'FIELD_INTEGRITY_EXCEPTION') {
      Logger.error(this.messages.getMessage('fieldIntegrityException', [tableName, deleteResult.message || '']));
      return -1;
    }
    return deleteResult.success ? recordIds.length : -1;
  }
}
