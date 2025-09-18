import * as fs from 'fs';
import { Messages } from '@salesforce/core';
import { Logger } from '../../logger';
import { cli } from '../../shell/cli';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-migration-tool', 'migrate');

export class sfProject {
  public static create(name: string, outputDir?: string): void {
    Logger.log(messages.getMessage('creatingProject', [name]));
    const cmd = `sf project generate --name ${name}${outputDir ? ` --output-dir ${outputDir}` : ''}`;
    sfProject.executeCommand(cmd);
    Logger.log(messages.getMessage('projectCreated', [name]));
  }

  public static retrieve(metadataName: string, username: string): void {
    Logger.log(messages.getMessage('retrievingMetadata', [metadataName, username]));
    const cmd = `sf project retrieve start --metadata ${metadataName} --target-org ${username}`;
    sfProject.executeCommand(cmd);
    Logger.log(messages.getMessage('metadataRetrieved', [metadataName, username]));
  }

  public static deploy(metadataName: string, username: string): void {
    Logger.log(messages.getMessage('deployingMetadata', [metadataName, username]));
    const cmd = `sf project deploy start --metadata ${metadataName} --target-org ${username}`;
    sfProject.executeCommand(cmd);
    Logger.log(messages.getMessage('metadataDeployed', [metadataName, username]));
  }

  public static installDependency(dependency?: string): void {
    Logger.logVerbose(messages.getMessage('installingDependency', [dependency]));
    const cmd = `npm install ${dependency || ''}`;
    sfProject.executeCommand(cmd);
    Logger.logVerbose(messages.getMessage('dependencyInstalled', [dependency]));
  }

  public static deployFromManifest(manifestPath: string, username: string): void {
    Logger.log(messages.getMessage('deployingFromManifest'));
    const cmd = `sf project deploy start --manifest "${manifestPath}" --target-org "${username}" --async`;
    Logger.log(cmd);
    const cmdOutput = sfProject.executeCommand(cmd, true);
    Logger.logVerbose(`Deploy output: ${cmdOutput}`);
    sfProject.processOutput(cmdOutput);
  }

  public static createNPMConfigFile(authKey: string): void {
    Logger.logVerbose(messages.getMessage('creatingNPMConfigFile'));
    fs.writeFileSync(
      '.npmrc',
      `always-auth=true\nregistry=https://repo.vlocity.com/repository/npm-public/\n//repo.vlocity.com/repository/npm-public/:_auth="${authKey}"`
    );
    Logger.logVerbose(messages.getMessage('npmConfigFileCreated'));
  }

  private static processOutput(cmdOutput: string): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jsonOutput = JSON.parse(cmdOutput);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.log(messages.getMessage('manifestDeployementStarted', [jsonOutput.result?.id]));
    } catch (error) {
      Logger.error(messages.getMessage('manifestDeployFailed'));
    }
  }

  private static executeCommand(cmd: string, jsonOutput = false): string {
    try {
      if (jsonOutput) {
        return cli.exec(`${cmd} --json`);
      } else {
        return cli.exec(`${cmd}`);
      }
    } catch (error) {
      Logger.error(messages.getMessage('sfProjectCommandError', [String(error)]));
      throw error;
    }
  }
}
