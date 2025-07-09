import { Org, Connection } from '@salesforce/core';
import { ExecuteAnonymousResult } from 'jsforce';

export class AnonymousApexRunner {
  public static async run(org: Org, anonymousApex: string): Promise<ExecuteAnonymousResult> {
    return org.getConnection().tooling.executeAnonymous(anonymousApex);
  }

  public static async runWithConnection(
    connection: Connection,
    anonymousApex: string
  ): Promise<ExecuteAnonymousResult> {
    return connection.tooling.executeAnonymous(anonymousApex);
  }
}
