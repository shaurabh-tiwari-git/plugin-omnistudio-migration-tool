import { Org } from '@salesforce/core';
import type { ExecuteAnonymousResult } from '@jsforce/jsforce-node/lib/api/tooling';

export class AnonymousApexRunner {
  public static async run(org: Org, anonymousApex: string): Promise<ExecuteAnonymousResult> {
    return org.getConnection().tooling.executeAnonymous(anonymousApex);
  }
}
