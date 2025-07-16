import * as fs from 'fs';
import * as shell from 'shelljs';
import { Org, Messages } from '@salesforce/core';
import { FileUtil, File } from '../../utils/file/fileUtil';
import { Logger } from '../../utils/logger';
import { Constants } from '../../utils/constants/stringContants';
import {
  ExpSiteComponent,
  ExpSiteComponentAttributes,
  MigrationStorage,
  OmniScriptStorage,
  ExpSitePageJson,
  ExpSiteRegion,
} from '../interfaces';
import { FileDiffUtil } from '../../utils/lwcparser/fileutils/FileDiffUtil';
import { ExperienceSiteAssessmentInfo } from '../../utils';
import { StorageUtil } from '../../utils/storageUtil';
import { BaseRelatedObjectMigration } from './BaseRealtedObjectMigration';

Messages.importMessagesDirectory(__dirname);

const EXPERIENCE_SITES_PATH = '/force-app/main/default/experiences';

export class ExperienceSiteMigration extends BaseRelatedObjectMigration {
  public constructor(projectPath: string, namespace: string, org: Org) {
    super(projectPath, namespace, org);
  }

  public processObjectType(): string {
    return Constants.ExpSites;
  }

  public migrate(): ExperienceSiteAssessmentInfo[] {
    Logger.logVerbose('Starting experience sites migration');
    const pwd = shell.pwd();
    shell.cd(this.projectPath);
    Logger.logVerbose('Started processing the experience sites');
    const experienceSiteInfo = this.processExperienceSites(this.projectPath, 'migration');
    Logger.info('Successfully processed experience sites for migration');
    shell.cd(pwd);
    return experienceSiteInfo;
  }

  public processExperienceSites(dir: string, type = 'migration'): ExperienceSiteAssessmentInfo[] {
    dir += EXPERIENCE_SITES_PATH;
    Logger.logVerbose('Started reading the files');
    const directoryMap: Map<string, File[]> = FileUtil.getAllFilesInsideDirectory(dir);

    // TODO - IF directory is empty

    const experienceSitesAssessmentInfo: ExperienceSiteAssessmentInfo[] = [];
    for (const directory of directoryMap.keys()) {
      const fileArray = directoryMap.get(directory);
      for (const file of fileArray) {
        if (file.ext !== '.json') {
          Logger.logVerbose('Skipping non-JSON file - ' + file.name);
          continue;
        }
        try {
          const experienceSiteInfo = this.processExperienceSite(file, type);
          if (experienceSiteInfo?.hasOmnistudioContent === true) {
            Logger.logVerbose('Successfully processed experience site file having vlocity wrapper');
            experienceSitesAssessmentInfo.push(experienceSiteInfo);
          } else {
            Logger.logVerbose('File does not contain omnistudio wrapper');
          }
        } catch (err) {
          Logger.error('Error processing experience site file' + file.name);
          Logger.error(JSON.stringify(err));
        }
      }
    }
    return experienceSitesAssessmentInfo;
  }

  public processExperienceSite(file: File, type = 'migration'): ExperienceSiteAssessmentInfo {
    Logger.logVerbose('Processing for file ' + file.name);

    const experienceSiteAssessmentInfo: ExperienceSiteAssessmentInfo = {
      name: file.name,
      warnings: [],
      infos: [],
      path: file.location,
      diff: JSON.stringify([]),
      hasOmnistudioContent: false,
    };

    const lookupComponentName = `${this.namespace}:vlocityLWCOmniWrapper`;
    const targetComponentName = 'runtime_omnistudio_omniscript';
    const warningMessage: string[] = [];
    const updateMessage: string[] = [];
    let hasOmnistudioContent = false;

    const fileContent = fs.readFileSync(file.location, 'utf8');
    // TODO - undefined check here
    const experienceSiteParsedJSON = JSON.parse(fileContent) as ExpSitePageJson;
    const normalizedOriginalFileContent = JSON.stringify(experienceSiteParsedJSON, null, 2);
    const regions: ExpSiteRegion[] = experienceSiteParsedJSON['regions'];

    // TODO - When will it be Flexcard

    if (regions === undefined) {
      hasOmnistudioContent = false;
      return experienceSiteAssessmentInfo;
    }

    const storage: MigrationStorage = StorageUtil.getOmnistudioMigrationStorage();

    for (const region of regions) {
      Logger.logVerbose('The current region being processed is' + JSON.stringify(region));

      const regionComponents: ExpSiteComponent[] = region['components'];

      if (regionComponents === undefined) {
        continue;
      }

      if (Array.isArray(regionComponents)) {
        for (const component of regionComponents) {
          if (component === undefined) {
            continue;
          }

          Logger.logVerbose('The current component being processed is ' + JSON.stringify(component));

          if (component.componentName === lookupComponentName) {
            Logger.logVerbose('Omnistudio wrapper component found');
            hasOmnistudioContent = true;

            // Updating component
            component.componentName = targetComponentName;
            this.updateComponentAttributes(component.componentAttributes, experienceSiteAssessmentInfo, storage);
          }
        }
      }
    }

    Logger.logVerbose('Now printing the updated object' + JSON.stringify(experienceSiteParsedJSON));

    const noarmalizeUpdatedFileContent = JSON.stringify(experienceSiteParsedJSON, null, 2); // Pretty-print with 2 spaces
    const difference = new FileDiffUtil().getFileDiff(
      file.name,
      normalizedOriginalFileContent,
      noarmalizeUpdatedFileContent
    );

    Logger.logVerbose('Printing the difference' + JSON.stringify(difference));

    // TODO - CHECK SOME IF ELSES HERE
    if (normalizedOriginalFileContent !== noarmalizeUpdatedFileContent) {
      Logger.logVerbose('Updating the file content');
      fs.writeFileSync(file.location, noarmalizeUpdatedFileContent, 'utf8');
    }

    return {
      name: file.name,
      warnings: warningMessage,
      infos: updateMessage,
      path: file.location,
      diff: JSON.stringify(difference),
      hasOmnistudioContent,
    };
  }

  private updateComponentAttributes(
    currentAttribute: ExpSiteComponentAttributes,
    experienceSiteAssessmentInfo: ExperienceSiteAssessmentInfo,
    storage: MigrationStorage
  ): void {
    if (currentAttribute === undefined) {
      return;
    }

    if (currentAttribute.target === undefined || currentAttribute.target === '') {
      experienceSiteAssessmentInfo.warnings.push('Target is invalid. Please check experience site configuration');
      return;
    }

    const oldTypeSubtypeLanguage = currentAttribute.target.substring(currentAttribute.target.indexOf(':') + 1);

    // Use storage to find the updated properties
    const targetData: OmniScriptStorage = storage.osStorage.get(oldTypeSubtypeLanguage);
    Logger.logVerbose('In component attribute updation');
    if (targetData === undefined || targetData.migrationSuccess === false) {
      experienceSiteAssessmentInfo.warnings.push(`${oldTypeSubtypeLanguage} needs manual intervention`);
    } else {
      // Preserve the layout value before clearing
      const originalLayout = currentAttribute['layout'];

      // define an array and delete those keys
      // Clear existing properties and set new ones
      Object.keys(currentAttribute).forEach((key) => delete currentAttribute[key]);

      currentAttribute['direction'] = 'ltr';
      currentAttribute['display'] = 'Display button to open Omniscript';
      currentAttribute['inlineVariant'] = 'brand';
      currentAttribute['language'] = targetData.language === undefined ? 'English' : targetData.language;
      currentAttribute['subType'] = targetData.subtype;
      currentAttribute['theme'] = originalLayout;
      currentAttribute['type'] = targetData.type;
    }
    Logger.logVerbose('updatedComponentAttribute = ' + JSON.stringify(currentAttribute));
  }
}
