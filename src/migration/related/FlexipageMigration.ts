/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import { Messages, Org } from '@salesforce/core';
import { sfProject } from '../../utils/sfcli/project/sfProject';
import { Logger } from '../../utils/logger';
import { Constants } from '../../utils/constants/stringContants';
import { FlexiPageAssessmentInfo } from '../../utils/interfaces';
import { createProgressBar } from '../base';
import { XMLUtil } from '../../utils/XMLUtil';
import { FileDiffUtil } from '../../utils/lwcparser/fileutils/FileDiffUtil';
import { transformFlexipageBundle } from '../../utils/flexipage/flexiPageTransformer';
import { Flexipage } from '../interfaces';
import { DuplicateKeyError, KeyNotFoundInStorageError, TargetPropertyNotFoundError } from '../../error/errorInterfaces';
import { BaseRelatedObjectMigration } from './BaseRealtedObjectMigration';

/**
 * FlexipageMigration handles the migration and assessment of FlexiPage components
 * in Salesforce OmniStudio migration operations.
 *
 * This class provides functionality to:
 * - Assess FlexiPage components for migration readiness
 * - Migrate FlexiPage components to the target format
 * - Process FlexiPage XML files and transform their content
 * - Generate assessment reports with detailed status information
 * - Handle errors and provide detailed error reporting
 *
 * The migration process involves:
 * - Retrieving FlexiPage metadata from the Salesforce org
 * - Parsing and analyzing FlexiPage XML files
 * - Transforming component structures and properties
 * - Generating diff information for visual comparison
 * - Writing transformed files back to the project structure
 */
export class FlexipageMigration extends BaseRelatedObjectMigration {
  /** Messages instance for internationalization */
  private messages: Messages;
  private xmlUtil: XMLUtil;

  /**
   * Creates a new FlexipageMigration instance.
   *
   * @param projectPath - The path to the Salesforce project
   * @param namespace - The namespace for the migration operation
   * @param org - The Salesforce org connection
   * @param messages - Messages instance for internationalization
   */
  public constructor(projectPath: string, namespace: string, org: Org, messages: Messages) {
    super(projectPath, namespace, org);
    this.messages = messages;
    this.xmlUtil = new XMLUtil(['flexiPageRegions', 'itemInstances', 'componentInstanceProperties']);
  }

  /**
   * Returns the object type constant for FlexiPage components.
   *
   * @returns The FlexiPage constant string
   */
  public processObjectType(): string {
    return Constants.FlexiPage;
  }

  /**
   * Performs assessment of FlexiPage components to determine migration readiness.
   *
   * @returns Array of FlexiPage assessment information
   */
  public assess(): FlexiPageAssessmentInfo[] {
    Logger.log(this.messages.getMessage('assessingFlexiPages'));
    return this.process('assess');
  }

  /**
   * Performs migration of FlexiPage components to the target format.
   *
   * @returns Array of FlexiPage assessment information after migration
   */
  public migrate(): FlexiPageAssessmentInfo[] {
    Logger.log(this.messages.getMessage('migratingFlexiPages'));
    return this.process('migrate');
  }

  /**
   * Processes FlexiPage files in either assessment or migration mode.
   *
   * This method:
   * - Retrieves FlexiPage metadata from the Salesforce org
   * - Reads and processes each FlexiPage XML file
   * - Transforms the content based on the specified mode
   * - Handles errors and provides detailed logging
   * - Generates progress indicators for long-running operations
   *
   * @param mode - The processing mode: 'assess' for analysis only, 'migrate' for actual transformation
   * @returns Array of FlexiPage assessment information
   */
  private process(mode: 'assess' | 'migrate'): FlexiPageAssessmentInfo[] {
    Logger.logVerbose(this.messages.getMessage('retrievingFlexiPages'));
    shell.cd(this.projectPath);
    sfProject.retrieve(Constants.FlexiPage, this.org.getUsername());
    const flexiPageDir = path.join(this.projectPath, 'force-app', 'main', 'default', 'flexipages');
    const files = fs.readdirSync(flexiPageDir).filter((file) => file.endsWith('.xml'));
    Logger.logVerbose(this.messages.getMessage('successfullyRetrievedFlexiPages', [files.length]));
    const progressBar = createProgressBar('Migrating', 'Flexipage');
    progressBar.setTotal(files.length);
    const flexPageAssessmentInfos: FlexiPageAssessmentInfo[] = [];

    for (const file of files) {
      Logger.logVerbose(this.messages.getMessage('processingFlexiPage', [file]));
      const filePath = path.join(flexiPageDir, file);
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
        if (error instanceof KeyNotFoundInStorageError) {
          Logger.error(`${error.componentType} ${error.key} can't be migrated`);
        } else if (error instanceof TargetPropertyNotFoundError) {
          Logger.error(error.message);
        } else if (error instanceof DuplicateKeyError) {
          Logger.error(`${error.componentType} ${error.key} is duplicate`);
        } else {
          Logger.error(this.messages.getMessage('errorProcessingFlexiPage', [file, error]));
          Logger.error(error);
        }
        flexPageAssessmentInfos.push({
          name: file,
          errors: [error instanceof Error ? error.message : JSON.stringify(error)],
          path: filePath,
          diff: '',
          status: mode === 'assess' ? 'Errors' : 'Failed',
        });
      }
      progressBar.increment();
    }
    progressBar.stop();
    Logger.logVerbose(this.messages.getMessage('completedProcessingAllFlexiPages', [flexPageAssessmentInfos.length]));
    const filteredResults = flexPageAssessmentInfos.filter(
      (flexPageAssessmentInfo) => flexPageAssessmentInfo.status !== 'No Changes'
    );
    Logger.log(this.messages.getMessage('flexipagesWithChanges', [filteredResults.length]));
    return filteredResults;
  }

  /**
   * Processes a single FlexiPage file for assessment or migration.
   *
   * This method:
   * - Reads the FlexiPage XML file content
   * - Parses the XML structure into a JavaScript object
   * - Transforms the FlexiPage bundle using the flexipage transformer
   * - Generates diff information for visual comparison
   * - Writes transformed content back to file in migration mode
   * - Handles errors and provides detailed error information
   *
   * @param fileName - The name of the FlexiPage file
   * @param filePath - The full path to the FlexiPage file
   * @param mode - The processing mode: 'assess' or 'migrate'
   * @returns FlexiPage assessment information with status and error details
   */
  private processFlexiPage(fileName: string, filePath: string, mode: 'assess' | 'migrate'): FlexiPageAssessmentInfo {
    Logger.logVerbose(this.messages.getMessage('startingFlexiPageProcessing', [fileName]));
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Logger.logVerbose(this.messages.getMessage('readFlexiPageContent', [fileContent.length]));

    const json = this.xmlUtil.parse(fileContent) as Flexipage;
    const transformedFlexiPage = transformFlexipageBundle(json, this.namespace, mode);
    if (transformedFlexiPage === false) {
      return {
        name: fileName,
        errors: [],
        path: filePath,
        diff: '',
        status: 'No Changes',
      };
    }
    const modifiedContent = this.xmlUtil.build(transformedFlexiPage, 'FlexiPage');

    if (mode === 'migrate') {
      fs.writeFileSync(filePath, modifiedContent);
      Logger.logVerbose(this.messages.getMessage('updatedModifiedContent', [filePath]));
    }

    const diff = new FileDiffUtil().getXMLDiff(fileContent, modifiedContent);
    Logger.logVerbose(this.messages.getMessage('generatedDiffForFile', [fileName]));

    return {
      path: filePath,
      name: fileName,
      diff: JSON.stringify(diff),
      errors: [],
      status: mode === 'assess' ? 'Can be Automated' : 'Complete',
    };
  }
}
