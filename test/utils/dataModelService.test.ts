import { expect } from '@salesforce/command/lib/test';
import { Connection, Messages } from '@salesforce/core';
import sinon = require('sinon');
import {
  DataModelService,
  initializeDataModelService,
  getDataModelInfo,
  isStandardDataModel,
  isCustomDataModel,
} from '../../src/utils/dataModelService';
import { Logger } from '../../src/utils/logger';
import { OmnistudioOrgDetails } from '../../src/utils/orgUtils';
import { Constants } from '../../src/utils/constants/stringContants';

describe('DataModelService', () => {
  let connection: Connection;
  let messages: Messages;
  let sandbox: sinon.SinonSandbox;
  let loggerErrorStub: sinon.SinonStub;

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
    loggerErrorStub = sandbox.stub(Logger, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('determineDataModel', () => {
    it('should return standard data model when org permission is enabled and licenses are valid', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '5' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      (messages.getMessage as sinon.SinonStub).withArgs('alreadyStandardModel').returns('Already standard model');
      const dataModelService = new DataModelService(orgs, connection, messages);

      // Act
      const result = await dataModelService.determineDataModel();

      // Assert
      expect(result).to.equal(Constants.StandardDataModel);
      expect(loggerErrorStub.called).to.be.false;
    });

    it('should return custom data model when org permission is not enabled', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '3' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      const dataModelService = new DataModelService(orgs, connection, messages);

      // Act
      const result = await dataModelService.determineDataModel();

      // Assert
      expect(result).to.equal(Constants.CustomDataModel);
      expect(loggerErrorStub.called).to.be.false;
    });

    it('should return standard data model when org permission is enabled but no licenses exist', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);
      (messages.getMessage as sinon.SinonStub).withArgs('alreadyStandardModel').returns('Already standard model');
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No OmniStudio licenses');
      const dataModelService = new DataModelService(orgs, connection, messages);

      // Act
      const result = await dataModelService.determineDataModel();

      // Assert
      expect(result).to.equal(Constants.StandardDataModel);
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No OmniStudio licenses');
    });

    it('should return unknown when org permission is not enabled and no licenses exist', async () => {
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
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No OmniStudio licenses');
      const dataModelService = new DataModelService(orgs, connection, messages);

      // Act
      const result = await dataModelService.determineDataModel();

      // Assert
      expect(result).to.equal('unknown');
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('No OmniStudio licenses');
    });

    it('should handle query errors gracefully', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const error = new Error('Database connection failed');
      (connection.query as sinon.SinonStub).rejects(error);
      const dataModelService = new DataModelService(orgs, connection, messages);

      // Act
      const result = await dataModelService.determineDataModel();

      // Assert
      expect(result).to.equal('unknown');
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal(
        'Error validating OmniStudio licenses: Database connection failed'
      );
    });

    it('should handle non-Error objects in query rejection', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      (connection.query as sinon.SinonStub).rejects('String error');
      const dataModelService = new DataModelService(orgs, connection, messages);

      // Act
      const result = await dataModelService.determineDataModel();

      // Assert
      expect(result).to.equal('unknown');
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.equal('Error validating OmniStudio licenses: Unknown error');
    });
  });

  describe('Global Functions', () => {
    beforeEach(() => {
      // Reset global state before each test
      // Note: Global state reset is handled by the service itself
    });

    it('should initialize global service correctly', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;

      // Act
      initializeDataModelService(orgs, connection, messages);

      // Assert - No error should be thrown
      expect(() => initializeDataModelService(orgs, connection, messages)).to.not.throw();
    });

    it('should throw error when getDataModelInfo is called without initialization', async () => {
      // Arrange - Clear any existing global state by importing fresh module
      delete require.cache[require.resolve('../../src/utils/dataModelService')];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const freshDataModelService = require('../../src/utils/dataModelService');

      // Act & Assert
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await freshDataModelService.getDataModelInfo();
        expect.fail('Expected getDataModelInfo to throw an error');
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.message).to.include('DataModelService has not been initialized');
      }
    });

    it('should return cached data model on subsequent calls', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '3' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);

      initializeDataModelService(orgs, connection, messages);

      // Act
      const result1 = await getDataModelInfo();
      const result2 = await getDataModelInfo();

      // Assert
      expect(result1).to.equal(Constants.CustomDataModel);
      expect(result2).to.equal(Constants.CustomDataModel);
      // Query should only be called once due to caching
      expect((connection.query as sinon.SinonStub).calledOnce).to.be.true;
    });

    it('should return true for isStandardDataModel when data model is standard', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '3' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);

      initializeDataModelService(orgs, connection, messages);

      // Act
      const result = await isStandardDataModel();

      // Assert
      expect(result).to.be.true;
    });

    it('should return false for isStandardDataModel when data model is custom', async () => {
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

      initializeDataModelService(orgs, connection, messages);

      // Act
      const result = await isStandardDataModel();

      // Assert
      expect(result).to.be.false;
    });

    it('should return true for isCustomDataModel when data model is custom', async () => {
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

      initializeDataModelService(orgs, connection, messages);

      // Act
      const result = await isCustomDataModel();

      // Assert
      expect(result).to.be.true;
    });

    it('should return false for isCustomDataModel when data model is standard', async () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;
      const queryResult = {
        records: [{ total: '3' }],
      };
      (connection.query as sinon.SinonStub).resolves(queryResult);

      initializeDataModelService(orgs, connection, messages);

      // Act
      const result = await isCustomDataModel();

      // Assert
      expect(result).to.be.false;
    });

    it('should return false for both isStandardDataModel and isCustomDataModel when data model is unknown', async () => {
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
      (messages.getMessage as sinon.SinonStub).withArgs('noOmniStudioLicenses').returns('No OmniStudio licenses');

      initializeDataModelService(orgs, connection, messages);

      // Act
      const isStandard = await isStandardDataModel();
      const isCustom = await isCustomDataModel();

      // Assert
      expect(isStandard).to.be.false;
      expect(isCustom).to.be.false;
    });

    it('should reset cache when initializeDataModelService is called again', async () => {
      // Arrange
      const orgs1: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const orgs2: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;

      const queryResult1 = { records: [{ total: '3' }] };
      const queryResult2 = { records: [{ total: '5' }] };

      (connection.query as sinon.SinonStub).onFirstCall().resolves(queryResult1).onSecondCall().resolves(queryResult2);

      (messages.getMessage as sinon.SinonStub).withArgs('alreadyStandardModel').returns('Already standard model');

      // Act
      initializeDataModelService(orgs1, connection, messages);
      const result1 = await getDataModelInfo();

      initializeDataModelService(orgs2, connection, messages);
      const result2 = await getDataModelInfo();

      // Assert
      expect(result1).to.equal(Constants.CustomDataModel);
      expect(result2).to.equal(Constants.StandardDataModel);
      expect((connection.query as sinon.SinonStub).calledTwice).to.be.true;
    });
  });
});
