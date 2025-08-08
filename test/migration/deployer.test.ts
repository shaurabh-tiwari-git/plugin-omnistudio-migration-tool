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

    // Mock Logger
    sandbox.stub(Logger, 'logVerbose');

    // Mock sfProject methods
    sandbox.stub(sfProject, 'createNPMConfigFile');
    sandbox.stub(sfProject, 'installDependency');
    sandbox.stub(sfProject, 'deployFromManifest');

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
      expect((deployer as any).requiredNodeDependency).to.equal('@omnistudio/omniscript_customization@250.0.0');
    });
  });

  describe('deploy', () => {
    it('should execute deployment steps in correct order', () => {
      // Arrange
      const createNPMConfigFileStub = sfProject.createNPMConfigFile as sinon.SinonStub;
      const installDependencyStub = sfProject.installDependency as sinon.SinonStub;
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;

      // Act
      deployer.deploy();

      // Assert
      expect(createNPMConfigFileStub.calledWith(testAuthKey)).to.be.true;
      expect(installDependencyStub.calledTwice).to.be.true;
      expect(installDependencyStub.firstCall.calledWith()).to.be.true; // No dependency
      expect(installDependencyStub.secondCall.calledWith('@omnistudio/omniscript_customization@250.0.0')).to.be.true;
      expect(deployFromManifestStub.called).to.be.true;
    });

    it('should log verbose message for installing required dependencies', () => {
      // Arrange
      const expectedMessage = 'Installing required dependencies';
      getMessageStub.withArgs('installingRequiredDependencies').returns(expectedMessage);
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      deployer.deploy();

      // Assert
      expect(logVerboseStub.calledWith(expectedMessage)).to.be.true;
      expect(getMessageStub.calledWith('installingRequiredDependencies')).to.be.true;
    });

    it('should handle errors from createNPMConfigFile', () => {
      // Arrange
      const createNPMConfigFileStub = sfProject.createNPMConfigFile as sinon.SinonStub;
      const error = new Error('Failed to create NPM config');
      createNPMConfigFileStub.throws(error);

      // Act & Assert
      expect(() => {
        deployer.deploy();
      }).to.throw('Failed to create NPM config');
    });

    it('should handle errors from installDependency', () => {
      // Arrange
      const installDependencyStub = sfProject.installDependency as sinon.SinonStub;
      const error = new Error('NPM install failed');
      installDependencyStub.throws(error);

      // Act & Assert
      expect(() => {
        deployer.deploy();
      }).to.throw('NPM install failed');
    });

    it('should handle errors from deployFromManifest', () => {
      // Arrange
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;
      const error = new Error('Deployment failed');
      deployFromManifestStub.throws(error);

      // Act & Assert
      expect(() => {
        deployer.deploy();
      }).to.throw('Deployment failed');
    });
  });

  describe('private properties', () => {
    it('should have correct requiredNodeDependency', () => {
      expect((deployer as any).requiredNodeDependency).to.equal('@omnistudio/omniscript_customization@250.0.0');
    });
  });

  describe('integration scenarios', () => {
    it('should complete full deployment workflow successfully', () => {
      // Arrange
      const createNPMConfigFileStub = sfProject.createNPMConfigFile as sinon.SinonStub;
      const installDependencyStub = sfProject.installDependency as sinon.SinonStub;
      const deployFromManifestStub = sfProject.deployFromManifest as sinon.SinonStub;
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;
      getMessageStub.withArgs('installingRequiredDependencies').returns('Installing dependencies...');

      // Act
      deployer.deploy();

      // Assert - Verify all steps were called
      expect(createNPMConfigFileStub.called).to.be.true;
      expect(installDependencyStub.called).to.be.true;
      expect(deployFromManifestStub.called).to.be.true;
      expect(logVerboseStub.calledWith('Installing dependencies...')).to.be.true;
    });
  });
});
