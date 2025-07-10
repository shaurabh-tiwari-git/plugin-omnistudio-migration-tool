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
import { OrgPreferences } from '../utils/orgPreferences';
import { OmniGlobalAutoNumberPrefManager } from '../utils/OmniGlobalAutoNumberPrefManager';

export class GlobalAutoNumberMigrationTool extends BaseMigrationTool implements MigrationTool {
  static readonly GLOBAL_AUTO_NUMBER_SETTING_NAME = 'GlobalAutoNumberSetting__c';
  static readonly OMNI_GLOBAL_AUTO_NUMBER_NAME = 'OmniGlobalAutoNumber';
  static readonly ROLLBACK_FLAGS: string[] = ['RollbackIPChanges', 'RollbackDRChanges'];

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
    // Create preference manager instance once
    const prefManager = new OmniGlobalAutoNumberPrefManager(this.connection);

    // Pre-migration checks
    await this.performPreMigrationChecks(prefManager);

    // Migrate Global Auto Number data
    const migrationResult = await this.migrateGlobalAutoNumberData();

    // Perform post-migration cleanup
    await this.postMigrationCleanup(migrationResult.results, prefManager);

    return [migrationResult];
  }

  /**
   * Post-migration cleanup: Delete source objects from managed package
   * This should be called after successful migration
   */
  async postMigrationCleanup(
    uploadInfo?: Map<string, UploadRecordResult>,
    prefManager?: OmniGlobalAutoNumberPrefManager
  ): Promise<void> {
    try {
      Logger.log(this.messages.getMessage('startingPostMigrationCleanup'));

      // Validate that all objects are successfully migrated before truncation
      if (uploadInfo) {
        this.validateMigrationSuccess(uploadInfo);
      }

      // Delete source GlobalAutoNumberSetting__c records using the same truncate pattern
      await super.truncate(GlobalAutoNumberMigrationTool.GLOBAL_AUTO_NUMBER_SETTING_NAME);

      // Enable the org preference after successful cleanup
      if (prefManager) {
        const success = await prefManager.enable();
        if (success) {
          Logger.log(this.messages.getMessage('omniGlobalAutoNumberPrefEnabled'));
        } else {
          Logger.error(this.messages.getMessage('errorEnablingOmniGlobalAutoNumberPref'));
        }
      }

      Logger.log(this.messages.getMessage('postMigrationCleanupCompleted'));
    } catch (error) {
      Logger.error(this.messages.getMessage('errorDuringPostMigrationCleanup'));
      Logger.error(JSON.stringify(error));
      throw error;
    }
  }

  /**
   * Validate that all Global Auto Number objects are successfully migrated
   * before proceeding with source object truncation
   */
  private validateMigrationSuccess(uploadInfo: Map<string, UploadRecordResult>): void {
    try {
      // Check if all uploaded records have success: true
      const failedRecords = Array.from(uploadInfo.values()).filter((result) => !result.success);

      if (failedRecords.length > 0) {
        const failedCount = failedRecords.length;
        const totalCount = uploadInfo.size;
        throw new Error(
          this.messages.getMessage('incompleteMigrationDetected', [totalCount, totalCount - failedCount])
        );
      }
    } catch (error) {
      Logger.error(this.messages.getMessage('migrationValidationFailed'));
      Logger.error(JSON.stringify(error));
      throw error;
    }
  }

  private async performPreMigrationChecks(prefManager: OmniGlobalAutoNumberPrefManager): Promise<void> {
    try {
      // Check if Global Auto Number preference is already enabled
      const isEnabled = await prefManager.isEnabled();
      if (isEnabled) {
        const errorMessage = this.messages.getMessage('globalAutoNumberPrefEnabledError');
        Logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Check rollback flags using existing utility
      const rollbackFlags = await OrgPreferences.checkRollbackFlags(this.connection);
      const enabledFlags = rollbackFlags.filter((flag) => GlobalAutoNumberMigrationTool.ROLLBACK_FLAGS.includes(flag));

      if (enabledFlags.length > 0) {
        let errorMessage: string;
        if (enabledFlags.includes('RollbackIPChanges') && enabledFlags.includes('RollbackDRChanges')) {
          errorMessage = this.messages.getMessage('bothRollbackFlagsEnabledError');
        } else if (enabledFlags.includes('RollbackIPChanges')) {
          errorMessage = this.messages.getMessage('rollbackIPFlagEnabledError');
        } else if (enabledFlags.includes('RollbackDRChanges')) {
          errorMessage = this.messages.getMessage('rollbackDRFlagEnabledError');
        }
        Logger.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      Logger.error(this.messages.getMessage('preMigrationChecksFailed'));
      throw error;
    }
  }

  private async migrateGlobalAutoNumberData(): Promise<MigrationResult> {
    let originalGlobalAutoNumberRecords = new Map<string, any>();
    let globalAutoNumberUploadInfo = new Map<string, UploadRecordResult>();

    // Query all GlobalAutoNumber settings
    DebugTimer.getInstance().lap('Query GlobalAutoNumber settings');
    const globalAutoNumberSettings = await this.getAllGlobalAutoNumberSettings();

    let progressCounter = 0;
    Logger.log(this.messages.getMessage('foundGlobalAutoNumbersToMigrate', [globalAutoNumberSettings.length]));
    const progressBar = createProgressBar('Migrating', 'GlobalAutoNumber');
    progressBar.start(globalAutoNumberSettings.length, progressCounter);

    for (let gan of globalAutoNumberSettings) {
      progressBar.update(++progressCounter);
      const recordId = gan['Id'];

      // Create a map of the original records
      originalGlobalAutoNumberRecords.set(recordId, gan);

      try {
        // Transform the GlobalAutoNumber setting
        const transformedGlobalAutoNumber = this.mapGlobalAutoNumberRecord(gan);
        const transformedName = transformedGlobalAutoNumber['Name'];

        // Create Global Auto Number record
        const uploadResult = await NetUtils.createOne(
          this.connection,
          GlobalAutoNumberMigrationTool.OMNI_GLOBAL_AUTO_NUMBER_NAME,
          recordId,
          transformedGlobalAutoNumber
        );

        if (uploadResult) {
          // Fix errors
          uploadResult.errors = uploadResult.errors || [];
          if (!uploadResult.success) {
            uploadResult.errors = Array.isArray(uploadResult.errors) ? uploadResult.errors : [uploadResult.errors];
          }

          // Check for name changes
          uploadResult.warnings = uploadResult.warnings || [];
          if (transformedName !== gan['Name']) {
            uploadResult.newName = transformedName;
            uploadResult.warnings.unshift(
              this.messages.getMessage('globalAutoNumberNameChangeMessage', [transformedName])
            );
          }

          globalAutoNumberUploadInfo.set(recordId, uploadResult);
        }
      } catch (err) {
        this.setRecordErrors(gan, this.messages.getMessage('errorWhileUploadingGlobalAutoNumber') + err);
        originalGlobalAutoNumberRecords.set(recordId, gan);

        globalAutoNumberUploadInfo.set(recordId, {
          referenceId: recordId,
          hasErrors: true,
          success: false,
          errors: err,
          warnings: [],
        });
      }
    }

    progressBar.stop();

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
      Object.keys(GlobalAutoNumberMappings)
    );
  }

  private mapGlobalAutoNumberRecord(globalAutoNumberRecord: AnyJson): AnyJson {
    // Transformed object
    const mappedObject = {};

    // Get the fields of the record
    const recordFields = Object.keys(globalAutoNumberRecord);

    // Map individual fields (following same pattern as OS, DR, FC)
    recordFields.forEach((recordField) => {
      const cleanFieldName = this.getCleanFieldName(recordField);

      if (GlobalAutoNumberMappings.hasOwnProperty(cleanFieldName)) {
        mappedObject[GlobalAutoNumberMappings[cleanFieldName]] = globalAutoNumberRecord[recordField];
      }
    });

    // Set essential default values (following same pattern as other entities)
    mappedObject['Name'] = this.cleanName(mappedObject['Name']);

    // BATCH framework requires that each record has an "attributes" property
    mappedObject['attributes'] = {
      type: GlobalAutoNumberMigrationTool.OMNI_GLOBAL_AUTO_NUMBER_NAME,
      referenceId: globalAutoNumberRecord['Id'],
    };

    return mappedObject;
  }
}
