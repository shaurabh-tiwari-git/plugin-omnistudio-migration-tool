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

    // Mock dataModelService
    isStandardDataModelStub = sandbox.stub(dataModelService, 'isStandardDataModel');
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
      const validator = new ValidatorService(orgs, messages, connection);

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
      const validator = new ValidatorService(orgs, messages, connection);

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
      const validator = new ValidatorService(orgs, messages, connection);

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
      const validator = new ValidatorService(orgs, messages, connection);

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
      const validator = new ValidatorService(orgs, messages, connection);

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
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = validator.validatePackageInstalled();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No package installed');
    });
  });

  describe('validateOmniStudioLicenses', () => {
    it('should return true when licenses exist with count > 0', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '5' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.true;
      expect(loggerErrorStub.called).to.be.false;
      expect((connection.query as sinon.SinonStub).calledOnce).to.be.true;
      expect((connection.query as sinon.SinonStub).firstCall.args[0]).to.include(
        "SELECT count(DeveloperName) total FROM PermissionSetLicense WHERE PermissionSetLicenseKey LIKE 'OmniStudio%' AND Status = 'Active'"
      );
    });

    it('should return true when count is exactly 1', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '1' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.true;
      expect(loggerErrorStub.called).to.be.false;
    });

    it('should return false and log error when no licenses exist (empty records)', async () => {
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
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No licenses found');
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No licenses found');
    });

    it('should return false and log error when license count is 0', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '0' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No licenses found');
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No licenses found');
    });

    it('should return false when query result is null', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      (connection.query as sinon.SinonStub).resolves(null);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
    });

    it('should return false when query result has no records property', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {};
      (connection.query as sinon.SinonStub).resolves(queryResult);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
    });

    it('should return false and log error when query throws Error', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const error = new Error('Database connection failed');
      (connection.query as sinon.SinonStub).rejects(error);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal(
        'Error validating OmniStudio licenses: Database connection failed'
      );
    });

    it('should return false and log generic error when query throws non-Error object', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const error = 'String error message';
      (connection.query as sinon.SinonStub).rejects(error);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('Error validating OmniStudio licenses: Unknown error');
    });

    it('should handle string counts correctly', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '10' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.true;
    });

    it('should handle non-numeric string counts as 0', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: 'invalid' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No licenses found');
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validateOmniStudioLicenses();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
    });
  });

  describe('validate', () => {
    it('should return true when all validations pass for custom data model', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '5' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      isStandardDataModelStub.returns(false); // Custom data model
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.true;
    });

    it('should return true for standard data model without checking licenses', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;
      isStandardDataModelStub.returns(true); // Standard data model
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.true;
      expect((connection.query as sinon.SinonStub).called).to.be.false; // License validation should be skipped
    });

    it('should return false when package validation fails', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: null,
        omniStudioOrgPermissionEnabled: false,
      } as unknown as OmnistudioOrgDetails;
      (messages.getMessage as sinon.SinonStub).withArgs('noPackageInstalled').returns('No package');
      isStandardDataModelStub.returns(false);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
    });

    it('should return false when license validation fails for custom data model', async () => {
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
      isStandardDataModelStub.returns(false); // Custom data model
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false;
      expect(loggerErrorStub.calledOnce).to.be.true;
    });

    it('should return false when license query throws error for custom data model', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const error = new Error('Connection error');
      (connection.query as sinon.SinonStub).rejects(error);
      isStandardDataModelStub.returns(false); // Custom data model
      const validator = new ValidatorService(orgs, messages, connection);

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
      isStandardDataModelStub.returns(false);
      const validator = new ValidatorService(orgs, messages, connection);

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).to.be.false; // Should fail because namespace validation now returns false
      expect(loggerErrorStub.calledOnce).to.be.true; // Error should be logged
    });
  });
});
