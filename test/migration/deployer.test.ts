/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable camelcase */
import { expect } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
import sinon = require('sinon');
import { Deployer } from '../../src/migration/deployer';
import { sfProject } from '../../src/utils/sfcli/project/sfProject';
import { Logger } from '../../src/utils/logger';
import { OmniscriptPackageManager } from '../../src/utils/omniscriptPackageManager';
import { OmniscriptPackageDeploymentError } from '../../src/error/deploymentErrors';

describe('Deployer', () => {
  let deployer: Deployer;
  let messages: Messages;
  let sandbox: sinon.SinonSandbox;
  let getMessageStub: sinon.SinonStub;
  let originalEnv: NodeJS.ProcessEnv;

  const testProjectPath = '/test/project/path';
  const testUsername = 'test@example.com';
  const testAuthKey = 'test-auth-key-123';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Store original environment
    originalEnv = { ...process.env };

    // Set up test environment
    Object.assign(process.env, { OMA_AUTH_KEY: testAuthKey });

    // Mock messages
    messages = {
      getMessage: sandbox.stub(),
    } as unknown as Messages;
    getMessageStub = messages.getMessage as sinon.SinonStub;

    // Set up default message stubs
    getMessageStub.withArgs('installingRequiredDependencies').returns('Installing dependencies...');
    getMessageStub.withArgs('deploymentCompletedSuccessfully').returns('Deployment completed');
    getMessageStub.withArgs('omniscriptPackageIntegrated').returns('Package integrated');
    getMessageStub.withArgs('errorIntegratingOmniscriptPackage').returns('Integration error');

    // Message stubs for omniscriptPackageManager direct logging
    getMessageStub
      .withArgs('ensurePackageInstalled')
      .returns('Please ensure omniscript customization package is properly installed: %s');
    getMessageStub
      .withArgs('packageDeploymentFailedWithError')
      .returns(
        'Omniscript package deployment failed after %s attempts. Error: %s. Please check deployment logs and org settings.'
      );
    getMessageStub
      .withArgs('maxRetryAttemptsExceeded')
      .returns('Maximum retry attempts (%s) exceeded for omniscript package deployment');
    getMessageStub
      .withArgs('deploymentNonRetryableError')
      .returns('Deployment failed with non-retryable error: %s. Please review and fix the issue manually.');

    // Mock Logger
    sandbox.stub(Logger, 'logVerbose');
    sandbox.stub(Logger, 'log');
    sandbox.stub(Logger, 'error');

    // Mock sfProject methods
    sandbox.stub(sfProject, 'createNPMConfigFile');
    sandbox.stub(sfProject, 'installDependency');
    sandbox.stub(sfProject, 'deployFromManifest');

    // Mock OmniscriptPackageManager
    sandbox.stub(OmniscriptPackageManager.prototype, 'deployPackageAsync').resolves(true);

    deployer = new Deployer(testProjectPath, messages, testUsername, testAuthKey);
  });

  afterEach(() => {
    sandbox.restore();
    // Restore original environment
    Object.assign(process.env, originalEnv);
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(deployer).to.be.instanceOf(Deployer);
      expect((deployer as any).projectPath).to.equal(testProjectPath);
      expect((deployer as any).username).to.equal(testUsername);
      expect((deployer as any).authKey).to.equal(testAuthKey);
      expect((deployer as any).messages).to.equal(messages);
      expect((deployer as any).omniscriptCustomizationPackage).to.equal('@omnistudio/omniscript_customization');
      expect((deployer as any).omniscriptCustomizationPackageVersion).to.equal('250.0.0');
    });
  });

  describe('deploy', () => {
    it('should execute deployment steps in correct order', async () => {
      // Arrange
      const createNPMConfigFileStub = sfProject.createNPMConfigFile as sinon.SinonStub;
      const installDependencyStub = sfProject.installDependency as sinon.SinonStub;
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;
      const deployPackageStub = OmniscriptPackageManager.prototype.deployPackageAsync as sinon.SinonStub;
      const logStub = Logger.log as sinon.SinonStub;
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      await deployer.deploy();

      // Assert - Verify all steps were called in correct order
      expect(createNPMConfigFileStub.calledWith(testAuthKey)).to.be.true;
      expect(installDependencyStub.calledTwice).to.be.true;
      expect(installDependencyStub.firstCall.calledWith()).to.be.true; // No dependency
      expect(installDependencyStub.secondCall.calledWith('@omnistudio/omniscript_customization@250.0.0')).to.be.true;
      expect(deployPackageStub.called).to.be.true;
      expect(deployFromManifestStub.called).to.be.true;
      expect(logVerboseStub.calledWith('Installing dependencies...')).to.be.true;
      expect(logStub.calledWith('Package integrated')).to.be.true;
    });

    it('should handle errors from omniscript package deployment', async () => {
      // Arrange
      const deployPackageStub = OmniscriptPackageManager.prototype.deployPackageAsync as sinon.SinonStub;
      const error = new Error('Package deployment failed');
      deployPackageStub.rejects(error);

      // Act & Assert
      try {
        await deployer.deploy();
        expect.fail('Expected deploy to throw');
      } catch (err) {
        expect(err).to.be.instanceOf(OmniscriptPackageDeploymentError);
        expect(err.message).to.equal('Omniscript package deployment failed: Package deployment failed');
      }
    });

    it('should handle omniscript package deployment returning false', async () => {
      // Arrange
      const deployPackageStub = OmniscriptPackageManager.prototype.deployPackageAsync as sinon.SinonStub;
      deployPackageStub.resolves(false);
      const errorStub = Logger.error as sinon.SinonStub;

      // Act & Assert
      try {
        await deployer.deploy();
        expect.fail('Expected deploy to throw');
      } catch (err) {
        expect(err).to.be.instanceOf(OmniscriptPackageDeploymentError);
        expect(err.message).to.equal(
          'Omniscript package deployment failed: Omniscript package deployment failed - deployment returned false. This may be due to missing package, permissions, or deployment timeout.'
        );
        expect(errorStub.called).to.be.true;
      }
    });

    it('should handle deployment failures properly', async () => {
      // Arrange
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;
      const error = new Error('Deployment failed');
      deployFromManifestStub.throws(error);

      // Act & Assert
      try {
        await deployer.deploy();
        expect.fail('Expected deploy to throw');
      } catch (err) {
        expect(err.message).to.equal('Deployment failed');
      }
    });

    it('should not deploy omniscript package when authKey is not provided', async () => {
      // Arrange
      const deployerWithoutAuth = new Deployer(testProjectPath, messages, testUsername, '');
      const deployPackageStub = OmniscriptPackageManager.prototype.deployPackageAsync as sinon.SinonStub;
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;

      // Act
      await deployerWithoutAuth.deploy();

      // Assert
      expect(deployPackageStub.called).to.be.false;
      expect(deployFromManifestStub.called).to.be.true;
    });
  });

  describe('private properties', () => {
    it('should have correct omniscript customization package properties', () => {
      expect((deployer as any).omniscriptCustomizationPackage).to.equal('@omnistudio/omniscript_customization');
      expect((deployer as any).omniscriptCustomizationPackageVersion).to.equal('250.0.0');
    });
  });

  describe('integration scenarios', () => {
    it('should complete full deployment workflow successfully', async () => {
      // Arrange
      const createNPMConfigFileStub = sfProject.createNPMConfigFile as sinon.SinonStub;
      const installDependencyStub = sfProject.installDependency as sinon.SinonStub;
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;
      const deployPackageStub = OmniscriptPackageManager.prototype.deployPackageAsync as sinon.SinonStub;
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      await deployer.deploy();

      // Assert - Verify all steps were called
      expect(createNPMConfigFileStub.called).to.be.true;
      expect(installDependencyStub.called).to.be.true;
      expect(deployPackageStub.called).to.be.true;
      expect(deployFromManifestStub.called).to.be.true;
      expect(logVerboseStub.calledWith('Installing dependencies...')).to.be.true;
    });

    it('should handle omniscript package deployment failure with user action logging', async () => {
      // Arrange
      const deployPackageStub = OmniscriptPackageManager.prototype.deployPackageAsync as sinon.SinonStub;
      const errorStub = Logger.error as sinon.SinonStub;
      deployPackageStub.resolves(false); // Deployment returns false

      // Act & Assert
      try {
        await deployer.deploy();
        expect.fail('Expected deploy to throw');
      } catch (err) {
        expect(err).to.be.instanceOf(OmniscriptPackageDeploymentError);
        expect(err.message).to.equal(
          'Omniscript package deployment failed: Omniscript package deployment failed - deployment returned false. This may be due to missing package, permissions, or deployment timeout.'
        );
        expect(errorStub.calledTwice).to.be.true; // User action + integration error
      }
    });
  });
});
