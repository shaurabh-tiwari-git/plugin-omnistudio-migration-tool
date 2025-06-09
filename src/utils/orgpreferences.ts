import { Connection } from '@salesforce/core';

/**
 * Interface representing the metadata structure for OmniStudio settings
 *
 * @interface OmniStudioSettingsMetadata
 * @property {string} fullName - The full name of the OmniStudio settings
 * @property {boolean} disableRollbackFlagsPref - Flag to disable rollback preferences
 */
interface OmniStudioSettingsMetadata {
  fullName: string;
  disableRollbackFlagsPref: boolean;
}

/**
 * Interface representing the structure of query results from OmniInteractionConfig
 *
 * @interface QueryResult
 * @property {string} DeveloperName - Name of the configuration
 * @property {string} Value - Value of the configuration
 * @property {number} totalSize - Total number of records returned
 * @property {boolean} done - Whether the query is complete
 * @property {Array<{attributes: {type: string, url: string}, DeveloperName: string, Value: string}>} records - Array of query result records
 */
interface QueryResult {
  DeveloperName: string;
  Value: string;
  totalSize: number;
  done: boolean;
  records: Array<{
    attributes: {
      type: string;
      url: string;
    };
    DeveloperName: string;
    Value: string;
  }>;
}

/**
 * Class to manage OmniStudio organization preferences
 *
 * @class OrgPreferences
 * @description Provides functionality to enable OmniStudio preferences and check rollback flags
 */
export class OrgPreferences {
  /**
   * List of rollback flags to check in OmniInteractionConfig
   *
   * @private
   * @static
   * @readonly
   * @type {string[]}
   */
  private static readonly ROLLBACK_FLAGS: string[] = ['RollbackIPChanges', 'RollbackDRChanges', 'RollbackOSChanges'];

  /**
   * Enables the disableRollbackFlagsPref setting in OmniStudio
   *
   * @public
   * @static
   * @async
   * @param {Connection} connection - Salesforce connection instance
   * @throws {Error} If enabling the preference fails
   * @returns {Promise<void>}
   */
  public static async enableOmniPreferences(connection: Connection): Promise<void> {
    try {
      await connection.metadata.update('OmniStudioSettings', [
        {
          fullName: 'OmniStudio',
          disableRollbackFlagsPref: true,
        } as OmniStudioSettingsMetadata,
      ]);
    } catch (error) {
      throw new Error(
        `Failed to enable disableRollbackFlagsPref: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Checks which rollback flags are enabled in OmniInteractionConfig
   *
   * @public
   * @static
   * @async
   * @param {Connection} connection - Salesforce connection instance
   * @throws {Error} If checking rollback flags fails
   * @returns {Promise<string[]>} Array of enabled rollback flag names
   */
  public static async checkRollbackFlags(connection: Connection): Promise<string[]> {
    try {
      const result = await connection.query<QueryResult>(
        `SELECT DeveloperName, Value FROM OmniInteractionConfig WHERE DeveloperName IN ('${this.ROLLBACK_FLAGS.join(
          "','"
        )}')`
      );
      const enabledFlags: string[] = [];
      for (const record of result.records) {
        if (record.Value === 'true') {
          enabledFlags.push(record.DeveloperName);
        }
      }
      return enabledFlags;
    } catch (error) {
      throw new Error(`Failed to check rollback flags: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
