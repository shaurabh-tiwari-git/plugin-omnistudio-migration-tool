/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Org } from '@salesforce/core';
import * as shell from 'shelljs';
import { ApexAssessmentInfo, DebugTimer, LWCAssessmentInfo, RelatedObjectAssesmentInfo } from '../../utils';
import { sfProject } from '../../utils/sfcli/project/sfProject';
import { Logger } from '../../utils/logger';
import { ApexMigration } from './ApexMigration';
import { LwcMigration } from './LwcMigration';

// Initialize Messages with the current plugin directory
// Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
// const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-related-object-migration-tool', 'migrate');
const LWCTYPE = 'LightningComponentBundle';
const APEXCLASS = 'Apexclass';

const defaultProjectName = 'omnistudio_migration';
export default class OmnistudioRelatedObjectMigrationFacade {
  // public static description = messages.getMessage('commandDescription');
  // public static examples = messages.getMessage('examples').split(os.EOL);
  public static args = [{ name: 'file' }];

  protected readonly namespace: string;
  protected readonly only: string;
  protected readonly allversions: boolean;
  protected readonly org: Org;
  protected readonly projectPath: string;

  public constructor(namespace: string, only: string, allversions: boolean, org: Org, projectPath?: string) {
    this.namespace = namespace;
    this.only = only;
    this.allversions = allversions;
    this.org = org;
    this.projectPath = projectPath || this.createProject();
  }

  private createProject(): string {
    sfProject.create(defaultProjectName);
    return process.cwd() + '/' + defaultProjectName;
  }

  private retrieveMetadata(relatedObjects: string[]): void {
    const pwd = shell.pwd();
    shell.cd(this.projectPath);
    if (relatedObjects.includes('lwc')) {
      sfProject.retrieve(LWCTYPE, this.org.getUsername());
    }
    if (relatedObjects.includes('apex')) {
      sfProject.retrieve(APEXCLASS, this.org.getUsername());
    }
    shell.cd(pwd);
  }

  public migrateAll(relatedObjects: string[], targetApexNamespace?: string): RelatedObjectAssesmentInfo {
    // Start the debug timer
    DebugTimer.getInstance().start();

    // Retrieve metadata if needed
    this.retrieveMetadata(relatedObjects);

    const debugTimer = DebugTimer.getInstance();
    debugTimer.start();
    // Initialize migration tools based on the relatedObjects parameter
    const apexMigrator = new ApexMigration(this.projectPath, this.namespace, this.org, targetApexNamespace);
    const lwcMigrator = new LwcMigration(this.projectPath, this.namespace, this.org);
    let apexAssessmentInfos: ApexAssessmentInfo[] = [];
    let lwcAssessmentInfos: LWCAssessmentInfo[] = [];
    // Proceed with migration logic
    try {
      if (relatedObjects.includes('apex')) {
        apexAssessmentInfos = apexMigrator.migrate();
      }
    } catch (Error) {
      // Log the error
      Logger.logger.error(Error.message);
    }
    try {
      if (relatedObjects.includes('lwc')) {
        lwcAssessmentInfos = lwcMigrator.migrate();
      }
    } catch (Error) {
      // Log the error
      Logger.logger.error(Error.message);
    }

    // Stop the debug timer
    const timer = debugTimer.stop();

    // Save timer to debug logger
    Logger.logger.debug(timer);

    // Return results needed for --json flag
    return { apexAssessmentInfos, lwcAssessmentInfos };
  }

  public assessAll(relatedObjects: string[]): RelatedObjectAssesmentInfo {
    // Start the debug timer
    DebugTimer.getInstance().start();

    const debugTimer = DebugTimer.getInstance();
    debugTimer.start();

    let apexAssessmentInfos: ApexAssessmentInfo[] = [];
    let lwcAssessmentInfos: LWCAssessmentInfo[] = [];

    // Proceed with assessment logic
    try {
      if (relatedObjects.includes('apex')) {
        const apexMigrator = new ApexMigration(this.projectPath, this.namespace, this.org);
        apexAssessmentInfos = apexMigrator.assess();
      }
    } catch (Error) {
      // Log the error
      Logger.logger.error(Error.message);
    }
    try {
      if (relatedObjects.includes('lwc')) {
        const lwcparser = new LwcMigration(this.projectPath, this.namespace, this.org);
        lwcAssessmentInfos = lwcparser.assessment();
      }
    } catch (Error) {
      // Log the error
      Logger.logger.error(Error.message);
    }

    // Stop the debug timer
    const timer = debugTimer.stop();

    // Save timer to debug logger
    Logger.logger.debug(timer);

    // Return results needed for --json flag
    return { apexAssessmentInfos, lwcAssessmentInfos };
  }
}
