/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as shell from 'shelljs';

export class cli {
  public static exec(cmd: string): string {
    const exec = shell.exec(cmd, { silent: true });
    if (exec.code !== 0) {
      throw new Error(`Command failed with exit code ${exec.code}: ${exec.stderr || exec.stdout}`);
    }
    return exec.stdout;
  }
}
