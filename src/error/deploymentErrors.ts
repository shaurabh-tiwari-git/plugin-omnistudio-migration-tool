/**
 * Custom error classes for deployment failures
 */

/**
 * Error thrown when omniscript package deployment fails
 */
export class OmniscriptPackageDeploymentError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'OmniscriptPackageDeploymentError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OmniscriptPackageDeploymentError);
    }
  }
}

/**
 * Error thrown when general deployment fails
 */
export class DeploymentError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'DeploymentError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DeploymentError);
    }
  }
}
