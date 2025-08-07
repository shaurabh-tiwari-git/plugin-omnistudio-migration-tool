import * as path from 'path';
import { Messages } from '@salesforce/core';
import * as shell from 'shelljs';
import { sfProject } from '../utils/sfcli/project/sfProject';
import { Logger } from '../utils/logger';

export class Deployer {
  private readonly projectPath: string;
  private readonly authEnvKey = 'OMA_AUTH_KEY';
  private readonly authKey: string;
  private readonly requiredNodeDependency = '@omnistudio/omniscript_customization@250.0.0';
  private readonly username: string;
  private readonly messages: Messages;

  public constructor(projectPath: string, messages: Messages, username: string) {
    this.projectPath = projectPath;
    this.username = username;
    this.authKey = process.env[this.authEnvKey];
    this.messages = messages;

    if (!this.authKey) {
      throw new Error(`${this.authEnvKey} environment variable is not set`);
    }
  }

  public deploy(): void {
    shell.cd(this.projectPath);
    sfProject.createNPMConfigFile(this.authKey);
    Logger.logVerbose(this.messages.getMessage('installingRequiredDependencies'));
    sfProject.installDependency();
    sfProject.installDependency(this.requiredNodeDependency);
    sfProject.deployFromManifest(path.join(process.cwd(), 'package.xml'), this.username);
  }
}
