import { Connection, Messages } from '@salesforce/core';
import { Logger } from '../logger';
import { QueryTools } from '../query';
import { NetUtils } from '../net';

/**
 * ConfigDataCleanupService
 *
 * This service checks for records in four config tables and cleans them if found:
 * - OmniUiCardConfig
 * - OmniScriptConfig
 * - OmniIntegrationPocConfig
 * - OmniDataTransformConfig
 */

export class ConfigDataCleanupService {
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
  public async hasCleanConfigTables(): Promise<boolean> {
    try {
      for (const tableName of ConfigDataCleanupService.CONFIG_TABLES) {
        const recordIds = await QueryTools.queryIds(this.connection, tableName);
        if (recordIds.length > 0) {
          return false;
        }
      }
      return true;
    } catch (error) {
      Logger.error(this.messages.getMessage('errorCheckingConfigTables', [String(error)]));
      return false;
    }
  }

  /**
   * Checks all config tables for records and cleans them if found
   *
   * @returns Promise<boolean> - true if cleanup was successful, false otherwise
   */
  public async cleanupConfigTables(): Promise<boolean> {
    try {
      Logger.log(this.messages.getMessage('startingConfigCleanup'));

      let totalCleanedRecords = 0;
      const cleanupResults: Array<{ tableName: string; recordCount: number; success: boolean }> = [];

      for (const tableName of ConfigDataCleanupService.CONFIG_TABLES) {
        const result = await this.cleanupConfigTable(tableName);
        cleanupResults.push(result);

        if (result.success) {
          totalCleanedRecords += result.recordCount;
          Logger.logVerbose(this.messages.getMessage('successfullyCleanedRecords', [result.recordCount, tableName]));
        }
      }

      // Log summary
      const failedTables = cleanupResults.filter((r) => !r.success);
      if (failedTables.length > 0) {
        Logger.error(
          this.messages.getMessage('failedToCleanTables', [failedTables.map((t) => t.tableName).join(', ')])
        );
        return false;
      }
      Logger.log(this.messages.getMessage('configCleanupCompleted', [totalCleanedRecords]));
      return true;
    } catch (error) {
      Logger.error(this.messages.getMessage('errorDuringConfigTablesCleanup', [String(error)]));
      return false;
    }
  }

  /**
   * Checks a specific table for records and cleans them if found
   *
   * @param tableName - Name of the table to check and clean
   * @returns Promise<{tableName: string, recordCount: number, success: boolean}>
   */
  private async cleanupConfigTable(
    tableName: string
  ): Promise<{ tableName: string; recordCount: number; success: boolean }> {
    try {
      Logger.info(this.messages.getMessage('cleaningConfigTable', [tableName]));

      // Query for record IDs in the table
      const recordIds = await QueryTools.queryIds(this.connection, tableName);

      if (recordIds.length === 0) {
        Logger.logVerbose(this.messages.getMessage('noRecordsFoundInTable', [tableName]));
        return { tableName, recordCount: 0, success: true };
      }

      Logger.logVerbose(this.messages.getMessage('foundRecordsInTable', [recordIds.length, tableName]));

      // Delete the records using NetUtils
      const deleteSuccess = await NetUtils.delete(this.connection, recordIds);

      if (deleteSuccess) {
        return { tableName, recordCount: recordIds.length, success: true };
      } else {
        Logger.logVerbose(this.messages.getMessage('failedToDeleteRecords', [tableName]));
        return { tableName, recordCount: recordIds.length, success: false };
      }
    } catch (error) {
      Logger.logVerbose(this.messages.getMessage('errorCleaningTable', [tableName, String(error)]));
      return { tableName, recordCount: 0, success: false };
    }
  }
}
