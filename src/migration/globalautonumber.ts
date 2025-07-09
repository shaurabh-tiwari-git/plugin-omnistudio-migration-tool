/* eslint-disable */
import { AnyJson } from '@salesforce/ts-types';
import GlobalAutoNumberMappings from '../mappings/GlobalAutoNumber';
import { DebugTimer, QueryTools } from '../utils';
import { NetUtils } from '../utils/net';
import { BaseMigrationTool } from './base';
import { MigrationResult, MigrationTool, ObjectMapping, UploadRecordResult } from './interfaces';
import { GlobalAutoNumberAssessmentInfo } from '../utils/interfaces';
import { Logger } from '../utils/logger';
import { createProgressBar } from './base';

export class GlobalAutoNumberMigrationTool extends BaseMigrationTool implements MigrationTool {
  static readonly GLOBAL_AUTO_NUMBER_SETTING_NAME = 'GlobalAutoNumberSetting__c';
  static readonly OMNI_GLOBAL_AUTO_NUMBER_NAME = 'OmniGlobalAutoNumber';

  getName(): string {
    return 'GlobalAutoNumber';
  }

  getRecordName(record: string) {
    return record['Name'];
  }

  getMappings(): ObjectMapping[] {
    return [
      {
        source: GlobalAutoNumberMigrationTool.GLOBAL_AUTO_NUMBER_SETTING_NAME,
        target: GlobalAutoNumberMigrationTool.OMNI_GLOBAL_AUTO_NUMBER_NAME,
      },
    ];
  }

  async truncate(): Promise<void> {
    await super.truncate(GlobalAutoNumberMigrationTool.OMNI_GLOBAL_AUTO_NUMBER_NAME);
  }

  async migrate(): Promise<MigrationResult[]> {
    return [await this.migrateGlobalAutoNumberData()];
  }

  private async migrateGlobalAutoNumberData(): Promise<MigrationResult> {
    let originalGlobalAutoNumberRecords = new Map<string, any>();
    let globalAutoNumberUploadInfo = new Map<string, UploadRecordResult>();
    const duplicatedNames = new Set<string>();

    // Query all GlobalAutoNumber settings
    DebugTimer.getInstance().lap('Query GlobalAutoNumber settings');
    const globalAutoNumberSettings = await this.getAllGlobalAutoNumberSettings();

    let progressCounter = 0;
    Logger.log(this.messages.getMessage('foundGlobalAutoNumbersToMigrate', [globalAutoNumberSettings.length]));
    const progressBar = createProgressBar('Migrating', 'GlobalAutoNumber');
    progressBar.start(globalAutoNumberSettings.length, progressCounter);

    // Prepare all records for bulk processing
    const mappedRecords: AnyJson[] = [];
    const validRecords: AnyJson[] = [];

    for (let gan of globalAutoNumberSettings) {
      progressBar.update(++progressCounter);
      const recordId = gan['Id'];

      // Transform the GlobalAutoNumber setting
      const transformedGlobalAutoNumber = this.mapGlobalAutoNumberRecord(gan);

      // Verify duplicated names before trying to submit
      if (duplicatedNames.has(transformedGlobalAutoNumber['Name'])) {
        this.setRecordErrors(gan, this.messages.getMessage('duplicatedGlobalAutoNumberName'));
        originalGlobalAutoNumberRecords.set(recordId, gan);
        continue;
      }
      duplicatedNames.add(transformedGlobalAutoNumber['Name']);

      // Create a map of the original records
      originalGlobalAutoNumberRecords.set(recordId, gan);
      validRecords.push(gan);

      // Add attributes for bulk processing
      transformedGlobalAutoNumber['attributes'] = {
        type: GlobalAutoNumberMigrationTool.OMNI_GLOBAL_AUTO_NUMBER_NAME,
        referenceId: recordId,
      };

      mappedRecords.push(transformedGlobalAutoNumber);
    }
    progressBar.stop();

    // Use bulk create for better performance
    if (mappedRecords.length > 0) {
      const bulkUploadResponse = await NetUtils.create(
        this.connection,
        GlobalAutoNumberMigrationTool.OMNI_GLOBAL_AUTO_NUMBER_NAME,
        mappedRecords
      );

      // Process results
      for (const [referenceId, result] of bulkUploadResponse) {
        if (result.success) {
          // Check for name changes
          const originalRecord = validRecords.find((record) => record['Id'] === referenceId);
          const mappedRecord = mappedRecords.find((record) => record['attributes']?.referenceId === referenceId);

          if (originalRecord && mappedRecord && mappedRecord['Name'] !== originalRecord['Name']) {
            result.newName = mappedRecord['Name'];
          }

          globalAutoNumberUploadInfo.set(referenceId, result);
        } else {
          // Handle failed records
          const originalRecord = validRecords.find((record) => record['Id'] === referenceId);
          if (originalRecord) {
            this.setRecordErrors(originalRecord, result.errors?.join(', ') || 'Unknown error');
          }
        }
      }
    }

    // Enable the org preference after successful migration
    await this.enableOmniGlobalAutoNumberPref();

    return {
      name: 'GlobalAutoNumber',
      results: globalAutoNumberUploadInfo,
      records: originalGlobalAutoNumberRecords,
    };
  }

  public async assess(): Promise<GlobalAutoNumberAssessmentInfo[]> {
    try {
      DebugTimer.getInstance().lap('Query GlobalAutoNumber settings');
      Logger.log(this.messages.getMessage('startingGlobalAutoNumberAssessment'));
      const globalAutoNumbers = await this.getAllGlobalAutoNumberSettings();
      Logger.log(this.messages.getMessage('foundGlobalAutoNumbersToAssess', [globalAutoNumbers.length]));

      const globalAutoNumberAssessmentInfos = this.processGlobalAutoNumberComponents(globalAutoNumbers);
      return globalAutoNumberAssessmentInfos;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      Logger.error(err.stack);
      return [];
    }
  }

  public processGlobalAutoNumberComponents(globalAutoNumbers: AnyJson[]): Promise<GlobalAutoNumberAssessmentInfo[]> {
    const globalAutoNumberAssessmentInfos: GlobalAutoNumberAssessmentInfo[] = [];
    let progressCounter = 0;
    const progressBar = createProgressBar('Assessing', 'GlobalAutoNumber');
    progressBar.start(globalAutoNumbers.length, progressCounter);
    const uniqueNames = new Set<string>();

    for (const globalAutoNumber of globalAutoNumbers) {
      try {
        const globalAutoNumberAssessmentInfo = this.processGlobalAutoNumber(globalAutoNumber, uniqueNames);
        globalAutoNumberAssessmentInfos.push(globalAutoNumberAssessmentInfo);
      } catch (e) {
        globalAutoNumberAssessmentInfos.push({
          name: globalAutoNumber['Name'],
          id: globalAutoNumber['Id'],
          infos: [],
          warnings: [this.messages.getMessage('unexpectedError')],
        });
        const error = e as Error;
        Logger.error(JSON.stringify(error));
        Logger.error(error.stack);
      }
      progressBar.update(++progressCounter);
    }
    progressBar.stop();
    return Promise.resolve(globalAutoNumberAssessmentInfos);
  }

  private processGlobalAutoNumber(globalAutoNumber: AnyJson, uniqueNames: Set<string>): GlobalAutoNumberAssessmentInfo {
    const globalAutoNumberName = globalAutoNumber['Name'];
    Logger.info(this.messages.getMessage('processingGlobalAutoNumber', [globalAutoNumberName]));
    const globalAutoNumberAssessmentInfo: GlobalAutoNumberAssessmentInfo = {
      name: globalAutoNumberName,
      id: globalAutoNumber['Id'],
      infos: [],
      warnings: [],
    };

    // Check for name changes due to API naming requirements
    const originalName: string = globalAutoNumberName;
    const cleanedName: string = this.cleanName(originalName);
    if (cleanedName !== originalName) {
      globalAutoNumberAssessmentInfo.warnings.push(
        this.messages.getMessage('globalAutoNumberNameChangeMessage', [originalName, cleanedName])
      );
    }

    // Check for duplicate names
    if (uniqueNames.has(cleanedName)) {
      globalAutoNumberAssessmentInfo.warnings.push(
        this.messages.getMessage('duplicateGlobalAutoNumberNameMessage', [cleanedName])
      );
    }
    uniqueNames.add(cleanedName);

    // Add migration info
    globalAutoNumberAssessmentInfo.infos.push(
      this.messages.getMessage('globalAutoNumberMigrationInfo', [originalName])
    );

    return globalAutoNumberAssessmentInfo;
  }

  private async getAllGlobalAutoNumberSettings(): Promise<AnyJson[]> {
    return await QueryTools.queryAll(
      this.connection,
      this.namespace,
      GlobalAutoNumberMigrationTool.GLOBAL_AUTO_NUMBER_SETTING_NAME,
      this.getGlobalAutoNumberFields()
    );
  }

  private mapGlobalAutoNumberRecord(globalAutoNumberRecord: AnyJson): AnyJson {
    const mappedRecord: AnyJson = {};

    // Map each field using the mapping configuration
    for (const [sourceField, targetField] of Object.entries(GlobalAutoNumberMappings)) {
      if (globalAutoNumberRecord[sourceField] !== undefined) {
        mappedRecord[targetField] = globalAutoNumberRecord[sourceField];
      }
    }

    // Set default values for core fields
    mappedRecord['IsActive__c'] = true;
    mappedRecord['IsEnabled__c'] = true;
    mappedRecord['Type__c'] = 'Sequential';

    // Calculate NextValue__c based on LastGeneratedNumber and Increment
    const lastGeneratedNumber = Number(mappedRecord['LastGeneratedNumber']) || 0;
    const increment = Number(mappedRecord['Increment']) || 1;
    mappedRecord['NextValue__c'] = lastGeneratedNumber + increment;

    // Add migration metadata
    mappedRecord['MigrationSourceId__c'] = globalAutoNumberRecord['Id'];
    mappedRecord['MigrationSourceObject__c'] =
      this.namespacePrefix + GlobalAutoNumberMigrationTool.GLOBAL_AUTO_NUMBER_SETTING_NAME;
    mappedRecord['MigrationDate__c'] = new Date().toISOString();

    return mappedRecord;
  }

  private async enableOmniGlobalAutoNumberPref(): Promise<void> {
    try {
      // Use connection.tooling.executeAnonymous for better performance
      const apexCode = `
        // Enable OmniGlobalAutoNumberPref org preference
        try {
          // Check if the org preference already exists
          List<OrgPreference__c> existingPrefs = [SELECT Id, Value__c FROM OrgPreference__c WHERE Name = 'OmniGlobalAutoNumberPref' LIMIT 1];
          
          if (existingPrefs.isEmpty()) {
            // Create the org preference record
            OrgPreference__c pref = new OrgPreference__c();
            pref.Name = 'OmniGlobalAutoNumberPref';
            pref.Value__c = 'true';
            insert pref;
            System.debug('Global Auto Number preference created and enabled successfully');
          } else {
            // Update existing preference
            existingPrefs[0].Value__c = 'true';
            update existingPrefs[0];
            System.debug('Global Auto Number preference updated and enabled successfully');
          }
        } catch (Exception e) {
          System.debug('Error enabling Global Auto Number preference: ' + e.getMessage());
          throw e;
        }
      `;

      await this.connection.tooling.executeAnonymous(apexCode);
      Logger.log(this.messages.getMessage('omniGlobalAutoNumberPrefEnabled'));
    } catch (error) {
      Logger.error(this.messages.getMessage('errorEnablingOmniGlobalAutoNumberPref'));
      Logger.error(JSON.stringify(error));
    }
  }

  private getGlobalAutoNumberFields(): string[] {
    return [
      'Name',
      `Increment__c`,
      `LastGeneratedNumber__c`,
      `LeftPadDigit__c`,
      `MinimumLength__c`,
      `Prefix__c`,
      `Separator__c`,
    ];
  }
}
