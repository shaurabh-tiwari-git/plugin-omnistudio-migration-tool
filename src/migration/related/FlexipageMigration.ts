import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import { Messages, Org } from '@salesforce/core';
import { sfProject } from '../../utils/sfcli/project/sfProject';
import { Logger } from '../../utils/logger';
import { Constants } from '../../utils/constants/stringContants';
import { FlexiPageAssessmentInfo } from '../../utils/interfaces';
import { createProgressBar } from '../base';
import { xmlUtil } from '../../utils/XMLUtil';
import { FileDiffUtil } from '../../utils/lwcparser/fileutils/FileDiffUtil';
import { transformFlexipageBundle } from '../../utils/flexipage/flexiPageTransformer';
import { Flexipage } from '../interfaces';
import { BaseRelatedObjectMigration } from './BaseRealtedObjectMigration';

export class FlexipageMigration extends BaseRelatedObjectMigration {
  private messages: Messages;

  public constructor(projectPath: string, namespace: string, org: Org, messages: Messages) {
    super(projectPath, namespace, org);
    this.messages = messages;
  }

  public processObjectType(): string {
    return Constants.FlexiPage;
  }

  public assess(): FlexiPageAssessmentInfo[] {
    Logger.info(this.messages.getMessage('assessingFlexiPages'));
    return this.process('assess');
  }

  public migrate(): FlexiPageAssessmentInfo[] {
    Logger.info(this.messages.getMessage('migratingFlexiPages'));
    return this.process('migrate');
  }

  private process(mode: 'assess' | 'migrate'): FlexiPageAssessmentInfo[] {
    Logger.info(this.messages.getMessage('retrievingFlexiPages'));
    shell.cd(this.projectPath);
    sfProject.retrieve(Constants.FlexiPage, this.org.getUsername());
    const files = fs
      .readdirSync(path.join(this.projectPath, 'force-app', 'main', 'default', 'flexipages'))
      .filter((file) => file.endsWith('.xml'));
    Logger.info(this.messages.getMessage('successfullyRetrievedFlexiPages', [files.length]));
    const progressBar = createProgressBar('Migrating', 'Flexipage');
    progressBar.setTotal(files.length);
    const flexPageAssessmentInfos: FlexiPageAssessmentInfo[] = [];

    for (const file of files) {
      Logger.logVerbose(this.messages.getMessage('processingFlexiPage', [file]));
      const filePath = path.join(this.projectPath, 'force-app', 'main', 'default', 'flexipages', file);
      try {
        const flexPageAssessmentInfo: FlexiPageAssessmentInfo = this.processFlexiPage(file, filePath, mode);
        flexPageAssessmentInfos.push(flexPageAssessmentInfo);
        Logger.logVerbose(
          this.messages.getMessage('completedProcessingFlexiPage', [
            file,
            JSON.stringify(flexPageAssessmentInfo.errors),
          ])
        );
      } catch (error) {
        Logger.error(this.messages.getMessage('errorProcessingFlexiPage', [file, error]));
        flexPageAssessmentInfos.push({
          name: file,
          errors: [error instanceof Error ? error.message : JSON.stringify(error)],
          path: filePath,
          diff: '',
          status: 'Errors',
        });
      }
      progressBar.increment();
    }
    progressBar.stop();
    Logger.info(this.messages.getMessage('completedProcessingAllFlexiPages', [flexPageAssessmentInfos.length]));
    return flexPageAssessmentInfos;
  }

  private processFlexiPage(fileName: string, filePath: string, mode: 'assess' | 'migrate'): FlexiPageAssessmentInfo {
    Logger.logVerbose(this.messages.getMessage('startingFlexiPageProcessing', [fileName]));
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Logger.logVerbose(this.messages.getMessage('readFlexiPageContent', [fileContent.length]));

    const parent: { FlexiPage: Flexipage } = xmlUtil.parse(fileContent) as { FlexiPage: Flexipage };
    const json = parent.FlexiPage;
    const transformedFlexiPage = transformFlexipageBundle(json, this.namespace);
    if (transformedFlexiPage === false) {
      return {
        name: fileName,
        errors: [],
        path: filePath,
        diff: '',
        status: 'No Changes',
      };
    }
    parent.FlexiPage = transformedFlexiPage as Flexipage;
    const modifiedContent = xmlUtil.build(parent);

    if (mode === 'migrate') {
      fs.writeFileSync(filePath, modifiedContent);
      Logger.logVerbose(this.messages.getMessage('updatedModifiedContent', [filePath]));
    }

    const diff = new FileDiffUtil().getFileDiff(fileName, fileContent, modifiedContent);
    Logger.logVerbose(this.messages.getMessage('generatedDiffForFile', [fileName]));

    return {
      path: filePath,
      name: fileName,
      diff: JSON.stringify(diff),
      errors: [],
      status: 'Can be Automated',
    };
  }
}
