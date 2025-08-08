import * as path from 'path';
import { Messages } from '@salesforce/core';
import * as shell from 'shelljs';
import { sfProject } from '../utils/sfcli/project/sfProject';
import { Logger } from '../utils/logger';

export class Deployer {
  private readonly projectPath: string;
  private readonly authKey: string;
  private readonly requiredNodeDependency = '@omnistudio/omniscript_customization@250.0.0';
  private readonly username: string;
  private readonly messages: Messages;

  public constructor(projectPath: string, messages: Messages, username: string, authKey: string) {
    this.projectPath = projectPath;
    this.username = username;
    this.messages = messages;
    this.authKey = authKey;
  }

  public deploy(): void {
    shell.cd(this.projectPath);
    if (this.authKey) {
      sfProject.createNPMConfigFile(this.authKey);
      Logger.logVerbose(this.messages.getMessage('installingRequiredDependencies'));
      sfProject.installDependency();
      sfProject.installDependency(this.requiredNodeDependency);
    }
    sfProject.deployFromManifest(path.join(process.cwd(), 'package.xml'), this.username);
  }
}
