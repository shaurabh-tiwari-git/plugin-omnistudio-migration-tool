/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { Messages, SfError, Org } from '@salesforce/core';
import { SfCommand, Flags as flags } from '@salesforce/sf-plugins-core';
import { Logger } from '../../../utils/logger';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-migration-tool', 'info');

export type InfoResult = {
  orgId: string;
  outputString: string;
};

interface InfoFlags {
  'target-org'?: Org;
  'target-dev-hub'?: Org;
  name?: string;
  allversions?: boolean;
  verbose?: boolean;
}

export default class Info extends SfCommand<InfoResult> {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static args: any = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static readonly flags: any = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    'target-org': flags.optionalOrg({
      summary: 'Target org username or alias',
      required: true,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    'target-dev-hub': flags.optionalHub({
      summary: 'Dev Hub username or alias',
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    name: flags.string({
      char: 'n',
      description: messages.getMessage('nameFlagDescription'),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    allversions: flags.boolean({
      char: 'a',
      description: messages.getMessage('allVersionsDescription'),
      required: false,
    }),
    verbose: flags.boolean({
      description: 'Enable verbose output',
    }),
  };

  public async run(): Promise<InfoResult> {
    try {
      return await this.runInfo();
    } catch (error) {
      Logger.error(messages.getMessage('errorRunningInfo'), error);
      process.exit(1);
    }
  }

  public async runInfo(): Promise<InfoResult> {
    const { flags: parsedFlags } = await this.parse(Info);
    const name = (parsedFlags as InfoFlags).name || 'world';
    const allVersions = (parsedFlags as InfoFlags).allversions || false;

    // target-org is required by flag definition, so it will always be present
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const org = (parsedFlags as InfoFlags)['target-org']!;
    const conn = org.getConnection();
    const query = 'Select Name, TrialExpirationDate from Organization';

    // The type we are querying for
    interface Organization {
      Name: string;
      TrialExpirationDate: string;
    }

    // Query the org
    const result = await conn.query<Organization>(query);

    // Organization will always return one result, but this is an example of throwing an error
    // The output and --json will automatically be handled for you.
    if (!result.records || result.records.length <= 0) {
      throw new SfError(messages.getMessage('errorNoOrgResults', [org.getOrgId()]));
    }

    // Organization always only returns one result
    const orgName = result.records[0].Name;
    const trialExpirationDate = result.records[0].TrialExpirationDate;

    let outputString = '';
    if (trialExpirationDate) {
      const date = new Date(trialExpirationDate).toLocaleString();
      outputString = messages.getMessage('greetingOrgInfoWithDate', [name, orgName, date]);
    } else {
      outputString = messages.getMessage('greetingOrgInfo', [name, orgName]);
    }
    Logger.log(outputString);

    // Check for dev hub org
    const hubOrg = (parsedFlags as InfoFlags)['target-dev-hub'];
    if (hubOrg) {
      const hubOrgId = hubOrg.getOrgId();
      Logger.log(messages.getMessage('hubOrgId', [hubOrgId]));
    }

    if (allVersions) {
      outputString = outputString + messages.getMessage('allVersionsAppended');
    }

    // Return an object to be displayed with --json
    return { orgId: org.getOrgId(), outputString };
  }
}
