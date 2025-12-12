import { Messages } from '@salesforce/core';

/**
 * Asks a question and returns the user's answer as a string
 */
export async function askQuestion(message: string): Promise<string> {
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(message + ' ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Asks a yes/no confirmation question and returns true if user answers 'y' or 'yes'
 */
export async function askConfirmation(message: string): Promise<boolean> {
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question(message + ' (y/n) ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export async function askStringWithTimeout(
  promptFn: (message: string) => Promise<string>,
  question: string,
  timeoutMsg: string,
  timeoutMs: number = 5 * 60 * 1000
): Promise<string> {
  return askPromptWithTimeout<string>(promptFn, question, timeoutMsg, timeoutMs);
}

export async function askPromptWithTimeout<T>(
  promptFn: (message: string) => Promise<T>,
  question: string,
  timeoutMsg: string,
  timeoutMs: number = 5 * 60 * 1000
): Promise<T> {
  return askUserWithTimeout(() => promptFn(question), timeoutMsg, timeoutMs);
}

async function askUserWithTimeout<T>(
  asyncFn: () => Promise<T>,
  timeoutMsg: string,
  timeoutMs: number = 5 * 60 * 1000
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(timeoutMsg));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([asyncFn(), timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle);
    throw error;
  }
}

export class PromptUtil {
  public static askWithTimeOut(
    messages: Messages<string>
  ): (promptFn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]) => Promise<string> {
    return async (promptFn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]): Promise<string> => {
      const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
      let timeoutHandle: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(messages.getMessage('requestTimedOut')));
        }, TIMEOUT_MS);
      });
      try {
        const result = await Promise.race([promptFn(...args), timeoutPromise]);
        clearTimeout(timeoutHandle);
        if (typeof result === 'string') {
          return result;
        } else {
          throw new Error('Prompt did not return a string');
        }
      } catch (err) {
        clearTimeout(timeoutHandle);
        throw err;
      }
    };
  }
}
