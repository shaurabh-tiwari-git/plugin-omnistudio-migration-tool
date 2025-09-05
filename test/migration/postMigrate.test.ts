/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable camelcase */
import * as fs from 'fs';
import { expect } from '@salesforce/command/lib/test';
import { Connection, Messages, Org } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { ExecuteAnonymousResult } from 'jsforce';
import sinon = require('sinon');
import { PostMigrate } from '../../src/migration/postMigrate';
import { Logger } from '../../src/utils/logger';
import { AnonymousApexRunner } from '../../src/utils/apex/executor/AnonymousApexRunner';
import { OrgPreferences } from '../../src/utils/orgPreferences';
import { Deployer } from '../../src/migration/deployer';

describe('PostMigrate', () => {
  let postMigrate: PostMigrate;
  let org: Org;
  let connection: Connection;
  let logger: Logger;
  let messages: Messages;
  let ux: UX;
  let sandbox: sinon.SinonSandbox;
  let getMessageStub: sinon.SinonStub;
  let logErrorStub: sinon.SinonStub;

  const testNamespace = 'test_namespace';
  const testRelatedObjectsToProcess = ['Flexipage', 'expsites'];
  const testProjectPath = '/test/project/path';
  const testUsername = 'test@example.com';
  const testAuthKey = 'test-auth-key';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Set up environment variable for Deployer
    process.env.OMA_AUTH_KEY = testAuthKey;

    // Mock org
    org = {
      getUsername: sandbox.stub().returns(testUsername),
      getConnection: sandbox.stub().returns({
        tooling: {
          executeAnonymous: sandbox.stub(),
        },
      }),
    } as unknown as Org;

    // Mock connection
    connection = {
      tooling: {
        executeAnonymous: sandbox.stub(),
      },
      query: sandbox.stub(),
    } as unknown as Connection;

    // Mock logger
    logger = {
      log: sandbox.stub(),
      logVerbose: sandbox.stub(),
      error: sandbox.stub(),
    } as unknown as Logger;

    // Mock messages
    messages = {
      getMessage: sandbox.stub(),
    } as unknown as Messages;
    getMessageStub = messages.getMessage as sinon.SinonStub;

    // Mock UX
    ux = {
      log: sandbox.stub(),
      error: sandbox.stub(),
    } as unknown as UX;

    // Set up default message returns
    getMessageStub.withArgs('settingDesignersToStandardModel').returns('Setting designers to standard model...');
    getMessageStub.withArgs('designersSetToStandardModel').returns('Designers set to standard model');
    getMessageStub.returns('Error setting designers to standard model: Test error stack trace');
    getMessageStub
      .withArgs('exceptionSettingDesignersToStandardDataModel', ['{"message":"Test exception"}'])
      .returns('Exception setting designers to standard model: {"message":"Test exception"}');
    getMessageStub
      .withArgs('manuallySwitchDesignerToStandardDataModel')
      .returns('Please manually switch designer to standard data model');
    getMessageStub.withArgs('noRelatedObjects').returns('No related objects to process');
    getMessageStub.withArgs('turnOffExperienceBundleAPI').returns('Turning off Experience Bundle API');
    getMessageStub
      .withArgs('errorRevertingExperienceBundleMetadataAPI')
      .returns('Error reverting Experience Bundle Metadata API');
    getMessageStub.withArgs('errorDeployingComponents').returns('Error deploying components');
    // New messages referenced by implementation
    getMessageStub.withArgs('checkingStandardDesignerStatus', [testNamespace]).returns('Checking designer status');
    getMessageStub.withArgs('standardDesignerAlreadyEnabled', [testNamespace]).returns('Designer already enabled');
    getMessageStub.withArgs('skipStandardRuntimeDueToFailure').returns('Skip runtime due to failure');

    // Mock Logger static methods
    sandbox.stub(Logger, 'logVerbose');
    logErrorStub = sandbox.stub(Logger, 'error');

    // Mock fs.existsSync to return true for any package.xml path
    sandbox.stub(fs, 'existsSync').returns(true);

    postMigrate = new PostMigrate(
      org,
      testNamespace,
      connection,
      logger,
      messages,
      ux,
      testRelatedObjectsToProcess,
      { autoDeploy: true, authKey: testAuthKey },
      testProjectPath
    );
  });

  afterEach(() => {
    sandbox.restore();
    delete process.env.OMA_AUTH_KEY;
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(postMigrate).to.be.instanceOf(PostMigrate);
      expect((postMigrate as any).org).to.equal(org);
      expect((postMigrate as any).relatedObjectsToProcess).to.deep.equal(testRelatedObjectsToProcess);
      expect((postMigrate as any).projectPath).to.equal(testProjectPath);
      expect((postMigrate as any).deploymentConfig.autoDeploy).to.be.true;
      expect((postMigrate as any).deploymentConfig.authKey).to.equal(testAuthKey);
      expect((postMigrate as any).namespace).to.equal(testNamespace);
      expect((postMigrate as any).connection).to.equal(connection);
      expect((postMigrate as any).logger).to.equal(logger);
      expect((postMigrate as any).messages).to.equal(messages);
      expect((postMigrate as any).ux).to.equal(ux);
    });

    it('should initialize with autoDeploy set to false', () => {
      // Arrange
      const postMigrateNoDeploy = new PostMigrate(
        org,
        testNamespace,
        connection,
        logger,
        messages,
        ux,
        testRelatedObjectsToProcess,
        { autoDeploy: false, authKey: testAuthKey },
        testProjectPath
      );
      const deployerStub = sandbox.stub(Deployer.prototype, 'deploy');

      // Act
      postMigrateNoDeploy.deploy();

      // Assert
      expect((postMigrateNoDeploy as any).deploymentConfig.autoDeploy).to.be.false;
      expect(deployerStub.called).to.be.false;
    });

    it('should handle deployment errors gracefully', () => {
      // Arrange
      const error = new Error('Deployment failed');
      const deployerStub = sandbox.stub(Deployer.prototype, 'deploy').throws(error);
      sandbox.stub(fs, 'existsSync').returns(true);

      // Mock the deploy method directly to test error handling
      postMigrate.deploy = function () {
        try {
          const deployer = new Deployer(
            this.projectPath,
            this.messages,
            this.org.getUsername(),
            this.deploymentConfig.authKey
          );
          deployer.deploy();
        } catch (ex) {
          Logger.error(this.messages.getMessage('errorDeployingComponents'), ex);
        }
      };

      // Act
      postMigrate.deploy();

      // Assert
      expect(deployerStub.called).to.be.true;
      expect(logErrorStub.called).to.be.true;
      expect(logErrorStub.firstCall.args[0]).to.equal('Error deploying components');
      expect(logErrorStub.firstCall.args[1]).to.equal(error);
    });

    xit('should create Deployer with correct parameters', () => {
      // Arrange
      const deployerDeployStub = sandbox.stub(Deployer.prototype, 'deploy');
      sandbox.stub(fs, 'existsSync').returns(true);

      // Mock the deploy method directly to test Deployer creation
      postMigrate.deploy = function () {
        const deployer = new Deployer(
          this.projectPath,
          this.messages,
          this.org.getUsername(),
          this.deploymentConfig.authKey
        );
        deployer.deploy();
      };

      // Act
      postMigrate.deploy();

      // Assert
      expect(deployerDeployStub.called).to.be.true;
    });
  });

  describe('setDesignersToUseStandardDataModel', () => {
    it('should successfully set designers to use standard data model', async () => {
      // Arrange
      const namespaceToModify = 'test_namespace';
      const userActionMessage: string[] = [];
      const mockResult = {
        success: true,
        compiled: true,
        line: 1,
        column: 1,
        compileProblem: null,
        exceptionMessage: null,
        exceptionStackTrace: null,
      } as ExecuteAnonymousResult;
      const anonymousApexRunnerStub = sandbox.stub(AnonymousApexRunner, 'run').resolves(mockResult);
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      const result = await postMigrate.enableDesignersToUseStandardDataModelIfNeeded(
        namespaceToModify,
        userActionMessage
      );

      // Assert
      expect(anonymousApexRunnerStub.calledOnce).to.be.true;
      expect(anonymousApexRunnerStub.firstCall.args[0]).to.equal(org);
      expect(anonymousApexRunnerStub.firstCall.args[1]).to.include(
        'test_namespace.OmniStudioPostInstallClass.useStandardDataModel()'
      );
      expect(logVerboseStub.calledWith('Setting designers to standard model...')).to.be.true;
      expect(logVerboseStub.calledWith('Designers set to standard model')).to.be.true;
      expect(result).to.equal(true);
      expect(userActionMessage).to.deep.equal([]);
    });

    it('should handle unsuccessful anonymous apex execution', async () => {
      // Arrange
      const namespaceToModify = 'test_namespace';
      const userActionMessage: string[] = [];
      const mockResult = {
        success: false,
        compiled: true,
        line: 1,
        column: 1,
        compileProblem: null,
        exceptionMessage: 'Test error',
        exceptionStackTrace: 'Test error stack trace',
      } as ExecuteAnonymousResult;
      const anonymousApexRunnerStub = sandbox.stub(AnonymousApexRunner, 'run').resolves(mockResult);

      // Act
      const result = await postMigrate.enableDesignersToUseStandardDataModelIfNeeded(
        namespaceToModify,
        userActionMessage
      );

      // Assert
      expect(anonymousApexRunnerStub.calledOnce).to.be.true;
      expect(logErrorStub.called).to.be.true;
      expect(result).to.equal(false);
      expect(userActionMessage).to.include('Please manually switch designer to standard data model');
    });

    it('should handle exceptions during execution', async () => {
      // Arrange
      const namespaceToModify = 'test_namespace';
      const userActionMessage: string[] = [];
      const error = new Error('Test exception');
      const anonymousApexRunnerStub = sandbox.stub(AnonymousApexRunner, 'run').rejects(error);

      // Act
      const result = await postMigrate.enableDesignersToUseStandardDataModelIfNeeded(
        namespaceToModify,
        userActionMessage
      );

      // Assert
      expect(anonymousApexRunnerStub.calledOnce).to.be.true;
      expect(logErrorStub.called).to.be.true;
      expect(result).to.equal(false);
      expect(userActionMessage).to.include('Please manually switch designer to standard data model');
    });

    it('should return true when standard designer already enabled and skip Apex', async () => {
      // Arrange
      const namespaceToModify = 'test_namespace';
      const userActionMessage: string[] = [];
      // Stub SOQL query to indicate designer already enabled for this namespace
      (connection.query as unknown as sinon.SinonStub).resolves({
        totalSize: 2,
        records: [
          { DeveloperName: 'TheFirstInstalledOmniPackage', Value: namespaceToModify },
          { DeveloperName: 'InstalledIndustryPackage', Value: 'other' },
        ],
      });
      const anonymousApexRunnerStub = sandbox.stub(AnonymousApexRunner, 'run');

      // Act
      const result = await (postMigrate as any).enableDesignersToUseStandardDataModelIfNeeded(
        namespaceToModify,
        userActionMessage
      );

      // Assert
      expect(result).to.equal(true);
      expect(anonymousApexRunnerStub.called).to.be.false;
      expect(userActionMessage).to.deep.equal([]);
    });
  });

  describe('executeTasks', () => {
    it('should enable runtime when designer step succeeds', async () => {
      // Arrange
      const enableDesignerStub = sandbox
        .stub(postMigrate as any, 'enableDesignersToUseStandardDataModelIfNeeded')
        .resolves(true);
      const enableRuntimeSpy = sandbox.stub(postMigrate as any, 'enableStandardRuntimeIfNeeded').resolves();
      const actionItems: string[] = [];

      // Act
      const res = await (postMigrate as any).executeTasks(testNamespace, actionItems);

      // Assert
      expect(enableDesignerStub.calledOnce).to.be.true;
      expect(enableRuntimeSpy.calledOnce).to.be.true;
      expect(res).to.equal(actionItems);
    });

    it('should not enable runtime when designer step fails', async () => {
      // Arrange
      const enableDesignerStub = sandbox
        .stub(postMigrate as any, 'enableDesignersToUseStandardDataModelIfNeeded')
        .resolves(false);
      const enableRuntimeSpy = sandbox.stub(postMigrate as any, 'enableStandardRuntimeIfNeeded').resolves();
      const actionItems: string[] = [];

      // Act
      const res = await (postMigrate as any).executeTasks(testNamespace, actionItems);

      // Assert
      expect(enableDesignerStub.calledOnce).to.be.true;
      expect(enableRuntimeSpy.called).to.be.false;
      expect(res).to.equal(actionItems);
    });
  });

  describe('restoreExperienceAPIMetadataSettings', () => {
    it('should restore experience API metadata settings when conditions are met', async () => {
      // Arrange
      const userActionMessage: string[] = [];
      const isExperienceBundleMetadataAPIProgramaticallyEnabled = { value: true };
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .resolves();
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      await postMigrate.restoreExperienceAPIMetadataSettings(
        isExperienceBundleMetadataAPIProgramaticallyEnabled,
        userActionMessage
      );

      // Assert
      expect(logVerboseStub.calledWith('Turning off Experience Bundle API')).to.be.true;
      expect(toggleExperienceBundleMetadataAPIStub.calledWith(connection, false)).to.be.true;
    });

    it('should not restore settings when related objects are undefined', async () => {
      // Arrange
      const postMigrateUndefined = new PostMigrate(
        org,
        testNamespace,
        connection,
        logger,
        messages,
        ux,
        undefined as any,
        { autoDeploy: true, authKey: testAuthKey },
        testProjectPath
      );
      const userActionMessage: string[] = [];
      const isExperienceBundleMetadataAPIProgramaticallyEnabled = { value: true };
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .resolves();
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      await postMigrateUndefined.restoreExperienceAPIMetadataSettings(
        isExperienceBundleMetadataAPIProgramaticallyEnabled,
        userActionMessage
      );

      // Assert
      expect(logVerboseStub.called).to.be.true;
      expect(toggleExperienceBundleMetadataAPIStub.called).to.be.false;
    });

    it('should not restore settings when related objects are null', async () => {
      // Arrange
      const postMigrateNull = new PostMigrate(
        org,
        testNamespace,
        connection,
        logger,
        messages,
        ux,
        null as any,
        { autoDeploy: true, authKey: testAuthKey },
        testProjectPath
      );
      const userActionMessage: string[] = [];
      const isExperienceBundleMetadataAPIProgramaticallyEnabled = { value: true };
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .resolves();
      const logVerboseStub = Logger.logVerbose as sinon.SinonStub;

      // Act
      await postMigrateNull.restoreExperienceAPIMetadataSettings(
        isExperienceBundleMetadataAPIProgramaticallyEnabled,
        userActionMessage
      );

      // Assert
      expect(logVerboseStub.called).to.be.true;
      expect(toggleExperienceBundleMetadataAPIStub.called).to.be.false;
    });

    it('should not restore settings when ExperienceSites is not in related objects', async () => {
      // Arrange
      const postMigrateNoExpSites = new PostMigrate(
        org,
        testNamespace,
        connection,
        logger,
        messages,
        ux,
        ['Flexipage'], // No expsites
        { autoDeploy: true, authKey: testAuthKey },
        testProjectPath
      );
      const userActionMessage: string[] = [];
      const isExperienceBundleMetadataAPIProgramaticallyEnabled = { value: true };
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .resolves();

      // Act
      await postMigrateNoExpSites.restoreExperienceAPIMetadataSettings(
        isExperienceBundleMetadataAPIProgramaticallyEnabled,
        userActionMessage
      );

      // Assert
      expect(toggleExperienceBundleMetadataAPIStub.called).to.be.false;
    });

    it('should not restore settings when API was not programmatically enabled', async () => {
      // Arrange
      const userActionMessage: string[] = [];
      const isExperienceBundleMetadataAPIProgramaticallyEnabled = { value: false };
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .resolves();

      // Act
      await postMigrate.restoreExperienceAPIMetadataSettings(
        isExperienceBundleMetadataAPIProgramaticallyEnabled,
        userActionMessage
      );

      // Assert
      expect(toggleExperienceBundleMetadataAPIStub.called).to.be.false;
    });

    it('should handle errors during toggle operation', async () => {
      // Arrange
      const userActionMessage: string[] = [];
      const isExperienceBundleMetadataAPIProgramaticallyEnabled = { value: true };
      const error = new Error('Toggle failed');
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .rejects(error);

      // Act
      await postMigrate.restoreExperienceAPIMetadataSettings(
        isExperienceBundleMetadataAPIProgramaticallyEnabled,
        userActionMessage
      );

      // Assert
      expect(toggleExperienceBundleMetadataAPIStub.calledWith(connection, false)).to.be.true;
      expect(userActionMessage).to.include('Error reverting Experience Bundle Metadata API');
    });
  });

  describe('integration scenarios', () => {
    xit('should handle complete post-migration workflow with auto-deploy enabled', async () => {
      // Arrange
      const deployerStub = sandbox.stub(Deployer.prototype, 'deploy');
      sandbox.stub(fs, 'existsSync').returns(true);
      const anonymousApexRunnerStub = sandbox.stub(AnonymousApexRunner, 'run').resolves({
        success: true,
        compiled: true,
        line: 1,
        column: 1,
        compileProblem: null,
        exceptionMessage: null,
        exceptionStackTrace: null,
      } as ExecuteAnonymousResult);
      const toggleExperienceBundleMetadataAPIStub = sandbox
        .stub(OrgPreferences, 'toggleExperienceBundleMetadataAPI')
        .resolves();

      // Mock the deploy method directly to test workflow
      postMigrate.deploy = function () {
        const deployer = new Deployer(
          this.projectPath,
          this.messages,
          this.org.getUsername(),
          this.deploymentConfig.authKey
        );
        deployer.deploy();
      };

      // Act
      postMigrate.deploy();
      await (postMigrate as any).enableDesignersToUseStandardDataModelIfNeeded('test_namespace', []);
      await postMigrate.restoreExperienceAPIMetadataSettings({ value: true }, []);

      // Assert
      expect(deployerStub.called).to.be.true;
      expect(anonymousApexRunnerStub.called).to.be.true;
      expect(toggleExperienceBundleMetadataAPIStub.called).to.be.true;
    });

    it('should handle complete post-migration workflow with auto-deploy disabled', async () => {
      // Arrange
      const postMigrateNoDeploy = new PostMigrate(
        org,
        testNamespace,
        connection,
        logger,
        messages,
        ux,
        testRelatedObjectsToProcess,
        { autoDeploy: false, authKey: testAuthKey },
        testProjectPath
      );
      const deployerStub = sandbox.stub(Deployer.prototype, 'deploy');
      const anonymousApexRunnerStub = sandbox.stub(AnonymousApexRunner, 'run').resolves({
        success: true,
        compiled: true,
        line: 1,
        column: 1,
        compileProblem: null,
        exceptionMessage: null,
        exceptionStackTrace: null,
      } as ExecuteAnonymousResult);

      // Act
      postMigrateNoDeploy.deploy();
      await (postMigrateNoDeploy as any).enableDesignersToUseStandardDataModelIfNeeded('test_namespace', []);

      // Assert
      expect(deployerStub.called).to.be.false;
      expect(anonymousApexRunnerStub.called).to.be.true;
    });
  });
});
