import { expect } from '@salesforce/command/lib/test';
import { Connection, Messages } from '@salesforce/core';
import sinon = require('sinon');
import { ValidatorService } from '../../src/utils/validatorService';
import { Logger } from '../../src/utils/logger';
import { OmnistudioOrgDetails } from '../../src/utils/orgUtils';
import * as dataModelService from '../../src/utils/dataModelService';

describe('ValidatorService', () => {
  let connection: Connection;
  let messages: Messages;
  let sandbox: sinon.SinonSandbox;
  let loggerWarnStub: sinon.SinonStub;
  let loggerErrorStub: sinon.SinonStub;
  let isStandardDataModelStub: sinon.SinonStub;
  let isCustomDataModelStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock Connection
    connection = {
      query: sandbox.stub(),
    } as unknown as Connection;

    // Mock Messages
    messages = {
      getMessage: sandbox.stub(),
    } as unknown as Messages;

    // Mock Logger
    loggerWarnStub = sandbox.stub(Logger, 'warn');
    loggerErrorStub = sandbox.stub(Logger, 'error');

    // Mock data model functions
    isStandardDataModelStub = sandbox.stub(dataModelService, 'isStandardDataModel');
    isCustomDataModelStub = sandbox.stub(dataModelService, 'isCustomDataModel');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('validateNamespace', () => {
    it('should return true and not log warning when namespace is valid', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'ValidNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = validator.validateNamespace();

      // Assert
      expect(result).to.be.true;
      expect(loggerWarnStub.called).to.be.false;
    });

    it('should return false and log error when namespace is invalid', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: false,
        packageDetails: { namespace: 'InvalidNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      (messages.getMessage as sinon.SinonStub)
        .withArgs('unknownNamespace')
        .returns("Org doesn't have Omnistudio namespace(s) configured");
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = validator.validateNamespace();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal("Org doesn't have Omnistudio namespace(s) configured");
    });

    it('should handle missing packageDetails gracefully', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: false,
        packageDetails: null,
        omniStudioOrgPermissionEnabled: false,
      } as unknown as OmnistudioOrgDetails;
      (messages.getMessage as sinon.SinonStub)
        .withArgs('unknownNamespace')
        .returns("Org doesn't have Omnistudio namespace(s) configured");
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = validator.validateNamespace();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal("Org doesn't have Omnistudio namespace(s) configured");
    });
  });

  describe('validatePackageInstalled', () => {
    it('should return true when package is installed', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = validator.validatePackageInstalled();

      // Assert
      expect(result).to.be.true;
      expect(loggerErrorStub.called).to.be.false;
    });

    it('should return false and log error when package is not installed (null)', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: null,
        omniStudioOrgPermissionEnabled: false,
      } as unknown as OmnistudioOrgDetails;
      (messages.getMessage as sinon.SinonStub).withArgs('noPackageInstalled').returns('No package installed');
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = validator.validatePackageInstalled();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No package installed');
    });

    it('should return false and log error when package is not installed (undefined)', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: undefined,
        omniStudioOrgPermissionEnabled: false,
      } as unknown as OmnistudioOrgDetails;
      (messages.getMessage as sinon.SinonStub).withArgs('noPackageInstalled').returns('No package installed');
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = validator.validatePackageInstalled();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No package installed');
    });
  });

  describe('validate', () => {
    it('should return true when all validations pass', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const validator = new ValidatorService(orgs, messages);

      // Mock data model functions to return valid data model
      isStandardDataModelStub.resolves(true);
      isCustomDataModelStub.resolves(false);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.true;
      expect(isStandardDataModelStub.calledOnce).to.be.true;
      expect(isCustomDataModelStub.calledOnce).to.be.true;
    });

    it('should return false when package validation fails', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: null,
        omniStudioOrgPermissionEnabled: false,
      } as unknown as OmnistudioOrgDetails;
      (messages.getMessage as sinon.SinonStub).withArgs('noPackageInstalled').returns('No package');
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      // Data model functions should not be called when basic validation fails
      expect(isStandardDataModelStub.called).to.be.false;
      expect(isCustomDataModelStub.called).to.be.false;
    });

    it('should return false when data model validation fails (unknown data model)', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const validator = new ValidatorService(orgs, messages);

      // Mock data model functions to return unknown data model (both false)
      isStandardDataModelStub.resolves(false);
      isCustomDataModelStub.resolves(false);
      (messages.getMessage as sinon.SinonStub).withArgs('unknownDataModel').returns('Unknown data model');

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('Unknown data model');
      expect(isStandardDataModelStub.calledOnce).to.be.true;
      expect(isCustomDataModelStub.calledOnce).to.be.true;
    });

    it('should return false when license validation fails', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No licenses');
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
    });

    it('should return false when license query throws error', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const error = new Error('Connection error');
      (connection.query as sinon.SinonStub).rejects(error);
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
    });

    it('should return false when namespace validation fails even if other validations pass', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: false,
        packageDetails: { namespace: 'InvalidNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '5' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      (messages.getMessage as sinon.SinonStub)
        .withArgs('unknownNamespace')
        .returns("Org doesn't have Omnistudio namespace(s) configured");
      const validator = new ValidatorService(orgs, messages);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false; // Should fail because namespace validation now returns false
      expect(loggerErrorStub.calledOnce).to.be.true; // Error should be logged
    });

    it('should return true when custom data model is valid', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const validator = new ValidatorService(orgs, messages);

      // Mock data model functions to return custom data model
      isStandardDataModelStub.resolves(false);
      isCustomDataModelStub.resolves(true);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.true;
      expect(isStandardDataModelStub.calledOnce).to.be.true;
      expect(isCustomDataModelStub.calledOnce).to.be.true;
    });
  });
});
