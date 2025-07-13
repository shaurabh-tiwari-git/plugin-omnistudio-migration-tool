import * as fs from 'fs';
import * as shell from 'shelljs';
import { Org, Messages } from '@salesforce/core';
import { FileUtil, File } from '../../utils/file/fileUtil';
import { Logger } from '../../utils/logger';
import { Constants } from '../../utils/constants/stringContants';
import { Component, ComponentAttributes, MigrationStorage, OmniScriptStorage, PageJson, Region } from '../interfaces';
import { FileDiffUtil } from '../../utils/lwcparser/fileutils/FileDiffUtil';
import { ExperienceSiteAssessmentInfo } from '../../utils';
import { BaseRelatedObjectMigration } from './BaseRealtedObjectMigration';

Messages.importMessagesDirectory(__dirname);

// const EXPERIENCE_SITES_PATH = '/force-app/main/default/experiences/selfservicepolicyholder1';
const EXPERIENCE_SITES_PATH = '/force-app/main/default/experiences';

export class ExperienceSiteMigration extends BaseRelatedObjectMigration {
  private targetNamespace: string;
  private storage: MigrationStorage;

  public constructor(
    projectPath: string,
    namespace: string,
    org: Org,
    storage: MigrationStorage,
    targetNameSpace?: string
  ) {
    super(projectPath, namespace, org);
    this.targetNamespace = targetNameSpace;
    this.storage = storage;
  }

  public processObjectType(): string {
    return Constants.Apex;
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
    const directoryMap: Map<string, File[]> = FileUtil.readAllFiles(dir);

    // TODO - Can do chunking here later, so as to minimize the memory usage
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
    // Here we are reading the file. Before only the metadata is being fetchedl
    if (file.name === 'lwcos') {
      let hasOmnistudioContent = false;
      const fileContent = fs.readFileSync(file.location, 'utf8');
      this.printStorage();

      const experienceSiteParsedJSON = JSON.parse(fileContent) as PageJson;
      const normalizedOriginalFileContent = JSON.stringify(experienceSiteParsedJSON, null, 2);

      const regions: Region[] = experienceSiteParsedJSON['regions'];
      // const attrsToRemove = ['target'];

      // TODO - When will it be Flexcard
      // TODO - Namespace const lookupComponentName = `${this.targetNamespace}:vlocityLWCOmniWrapper`;
      Logger.logVerbose('The target namspace is ' + this.targetNamespace);
      const lookupComponentName = 'vlocity_ins:vlocityLWCOmniWrapper';
      const targetComponentName = 'runtime_omnistudio:omniscript';
      const warningMessage: string[] = [];
      const updateMessage: string[] = [];

      // TODO - THERE SEEMS TO BE ONLY ONE REGION
      for (const region of regions) {
        Logger.logVerbose('The current region being processed is' + JSON.stringify(region));

        const regionComponents: Component[] = region['components'];

        if (Array.isArray(regionComponents)) {
          for (const component of regionComponents) {
            Logger.logVerbose('The current component being processed is ' + JSON.stringify(component));

            // TODO - Replace with namespace - targetNamespace, check if namespace or targetnamespace, considering targetNamespace for now
            if (component?.componentName === lookupComponentName) {
              Logger.logVerbose('Omnistudio wrapper component found');
              hasOmnistudioContent = true;
              component.componentName = targetComponentName;

              if (component?.componentAttributes?.target !== undefined) {
                const currentAttribute: ComponentAttributes = component.componentAttributes;
                const oldTypeSubtypeLanguage = component?.componentAttributes?.target;

                // Use storage to find the updated properties
                const targetData: OmniScriptStorage = this.storage.osStorage.get(oldTypeSubtypeLanguage);
                if (
                  targetData === undefined ||
                  (targetData?.migrationSuccess === false && warningMessage.length === 0)
                ) {
                  warningMessage.push(`${oldTypeSubtypeLanguage} needs manual intervention`);
                } else {
                  currentAttribute['type'] = targetData.type;
                  currentAttribute['subType'] = targetData.subtype;
                  currentAttribute['language'] = targetData.language;

                  // TODO - LEFT TO REMOVE TARGET
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
    } else {
      Logger.logVerbose('File name is ' + file.name);
      return {
        name: file.name,
        warnings: ['Error occurred while processing the file'],
        infos: [],
        path: file.location,
        diff: '[]',
      };
    }
  }

  private printStorage(): void {
    Logger.logVerbose('Debug - Printing the storage from experience sites');
    Logger.logVerbose(
      JSON.stringify(this.storage, (key, value) => {
        if (value instanceof Map) {
          const safeEntries = [...value.entries()].map(([k, v]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return [k, v ?? { note: 'Value was undefined' }];
          });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return Object.fromEntries(safeEntries);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      })
    );
  }
}
