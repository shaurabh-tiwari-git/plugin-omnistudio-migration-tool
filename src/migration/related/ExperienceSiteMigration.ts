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

    const experienceSiteAssessmentInfo: ExperienceSiteAssessmentInfo[] = [];
    for (const directory of directoryMap.keys()) {
      const fileArray = directoryMap.get(directory);
      for (const file of fileArray) {
        if (file.ext !== '.json') {
          Logger.logVerbose('Skipping non-JSON file - ' + file.name);
          continue;
        }
        try {
          Logger.logVerbose('Started processing the file - ' + file.name);
          const experienceSiteInfo = this.processExperienceSite(file, type);
          if (experienceSiteInfo?.hasOmnistudioContent === true) {
            // TODO - Condition to be upated
            Logger.logVerbose('Successfully processed experience site file having vlocity wrapper');
            experienceSiteAssessmentInfo.push(experienceSiteInfo);
          } else {
            Logger.logVerbose('File does not contain omnistudio wrapper');
          }
        } catch (err) {
          Logger.error('Error processing experience site file' + file.name);
          Logger.error(JSON.stringify(err));
        }
      }
    }
    return experienceSiteAssessmentInfo;
  }

  public processExperienceSite(file: File, type = 'migration'): ExperienceSiteAssessmentInfo {
    // Here we are reading the file. Before only the metadata is being fetched
    Logger.logVerbose('DELTA - Processing for file' + file.name);
    let hasOmnistudioContent = false;
    const fileContent = fs.readFileSync(file.location, 'utf8');
    const experienceSiteParsedJSON = JSON.parse(fileContent) as ExpSitePageJson;
    const normalizedOriginalFileContent = JSON.stringify(experienceSiteParsedJSON, null, 2);

    const regions: ExpSiteRegion[] = experienceSiteParsedJSON['regions'];
    // const attrsToRemove = ['target'];

    // TODO - When will it be Flexcard
    Logger.logVerbose('The namspace is ' + this.namespace);
    const lookupComponentName = `${this.namespace}:vlocityLWCOmniWrapper`;
    const targetComponentName = 'runtime_omnistudio_omniscript';
    const warningMessage: string[] = [];
    const updateMessage: string[] = [];

    if (regions === undefined) {
      return {
        name: file.name,
        warnings: warningMessage,
        infos: updateMessage,
        path: file.location,
        diff: JSON.stringify([]),
        hasOmnistudioContent: false,
      };
    }

    const storage: MigrationStorage = StorageUtil.getOmnistudioMigrationStorage();
    for (const region of regions) {
      Logger.logVerbose('The current region being processed is' + JSON.stringify(region));

      const regionComponents: ExpSiteComponent[] = region['components'];

      if (Array.isArray(regionComponents)) {
        for (const component of regionComponents) {
          Logger.logVerbose('The current component being processed is ' + JSON.stringify(component));

          // TODO - Replace with namespace - targetNamespace, check if namespace or targetnamespace, considering targetNamespace for now
          if (component?.componentName === lookupComponentName) {
            Logger.logVerbose('Omnistudio wrapper component found');
            hasOmnistudioContent = true;
            component.componentName = targetComponentName;

            if (component?.componentAttributes?.target !== undefined) {
              const currentAttribute: ExpSiteComponentAttributes = component.componentAttributes;
              const oldTypeSubtypeLanguage = component?.componentAttributes?.target;

              // Use storage to find the updated properties
              const targetData: OmniScriptStorage = storage.osStorage.get(oldTypeSubtypeLanguage);
              if (targetData === undefined || (targetData?.migrationSuccess === false && warningMessage.length === 0)) {
                warningMessage.push(`${oldTypeSubtypeLanguage} needs manual intervention`);
              } else {
                currentAttribute['type'] = targetData.type;
                currentAttribute['subType'] = targetData.subtype;
                currentAttribute['language'] = targetData.language;

                if (component?.componentAttributes && 'target' in component.componentAttributes) {
                  delete component.componentAttributes.target;
                }
              }
            }
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
}
