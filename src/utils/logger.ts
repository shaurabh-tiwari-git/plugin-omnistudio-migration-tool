import { Ux } from '@salesforce/sf-plugins-core';
import { Logger as SfLogger } from '@salesforce/core';
import { FileLogger } from './logger/fileLogger';
import { askQuestion, askConfirmation } from './promptUtil';

export class Logger {
  private static sfUX: Ux;
  private static sfLogger: SfLogger;
  private static verbose = false;

  public static initialiseLogger(ux: Ux, logger: SfLogger, command?: string, verbose?: boolean): Logger {
    Logger.sfUX = ux;
    Logger.sfLogger = logger;
    Logger.verbose = verbose || false;
    FileLogger.initialize(command || 'default');
    return Logger;
  }

  public static setVerbose(isVerbose: boolean): void {
    Logger.verbose = isVerbose;
  }

  public static getVerbose(): boolean {
    return Logger.verbose;
  }

  public static logVerbose(message: string): void {
    if (Logger.verbose && Logger.sfUX) {
      Logger.sfUX.log(message);
    }
    FileLogger.writeLog('VERBOSE', message);
  }

  public static captureVerboseData(message: string, data: unknown): void {
    if (Logger.verbose) {
      FileLogger.writeLog('VERBOSE DATA', `${message}: ${JSON.stringify(data)}`);
    }
  }

  public static get logger(): SfLogger {
    return Logger.sfLogger;
  }

  public static get ux(): Ux {
    return Logger.sfUX;
  }

  public static log(message: string): void {
    if (Logger.sfUX) {
      Logger.sfUX.log(message);
    }
    FileLogger.writeLog('INFO', message);
  }

  public static warn(message: string): void {
    if (Logger.sfUX) {
      Logger.sfUX.warn(message);
    }
    FileLogger.writeLog('WARN', message);
  }

  public static error(message: string | Error, error?: Error): void {
    if (Logger.sfUX) {
      if (message instanceof Error) {
        Logger.sfUX.log(`\x1b[31m${message.message}\n${message.stack}\x1b[0m`);
      } else {
        if (error) {
          Logger.sfUX.log(`\x1b[31m${error.message}\n${error.stack}\x1b[0m`);
        } else {
          Logger.sfUX.log(`\x1b[31m${message}\x1b[0m`);
        }
      }
    }
    FileLogger.writeLog('ERROR', message instanceof Error ? `${message.message}\n${message.stack}` : message);
  }

  public static debug(message: string): void {
    if (Logger.sfLogger) {
      Logger.sfLogger.debug(message);
    }
    FileLogger.writeLog('DEBUG', message);
  }

  public static info(message: string): void {
    if (Logger.sfLogger) {
      Logger.sfLogger.info(message);
    }
    FileLogger.writeLog('INFO', message);
  }

  public static async confirm(message: string): Promise<boolean> {
    if (Logger.sfUX) {
      FileLogger.writeLog('CONFIRM', message);
      return askConfirmation(message);
    }
    return Promise.resolve(false);
  }

  public static async prompt(message: string): Promise<string> {
    if (Logger.sfUX) {
      FileLogger.writeLog('PROMPT', message);
      return askQuestion(message);
    }
    return Promise.resolve('');
  }
}
