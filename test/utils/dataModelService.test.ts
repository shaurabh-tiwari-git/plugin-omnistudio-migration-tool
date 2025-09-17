import { expect } from '@salesforce/command/lib/test';
import sinon = require('sinon');
import {
  DataModelService,
  initializeDataModelService,
  getDataModelService,
  getDataModelInfo,
  isStandardDataModel,
  isCustomDataModel,
} from '../../src/utils/dataModelService';
import { OmnistudioOrgDetails } from '../../src/utils/orgUtils';
import { Constants } from '../../src/utils/constants/stringContants';

describe('DataModelService', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDataModel', () => {
    it('should return standard data model when org permission is enabled', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;
      const dataModelService = new DataModelService(orgs);

      // Act
      const result = dataModelService.getDataModel();

      // Assert
      expect(result).to.equal(Constants.StandardDataModel);
    });

    it('should return custom data model when org permission is not enabled', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;
      const dataModelService = new DataModelService(orgs);

      // Act
      const result = dataModelService.getDataModel();

      // Assert
      expect(result).to.equal(Constants.CustomDataModel);
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

      // Act & Assert - No error should be thrown
      expect(() => initializeDataModelService(orgs)).to.not.throw();
    });

    it('should return global service instance after initialization', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;

      initializeDataModelService(orgs);

      // Act
      const service = getDataModelService();

      // Assert
      expect(service).to.be.instanceOf(DataModelService);
      expect(service.getDataModel()).to.equal(Constants.StandardDataModel);
    });

    it('should throw error when getDataModelService is called without initialization', () => {
      // Arrange - Clear any existing global state by importing fresh module
      delete require.cache[require.resolve('../../src/utils/dataModelService')];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const freshDataModelService = require('../../src/utils/dataModelService');

      // Act & Assert
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        freshDataModelService.getDataModelService();
        expect.fail('Expected getDataModelService to throw an error');
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.message).to.include('DataModelService has not been initialized');
      }
    });

    it('should throw error when getDataModelInfo is called without initialization', () => {
      // Arrange - Clear any existing global state by importing fresh module
      delete require.cache[require.resolve('../../src/utils/dataModelService')];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const freshDataModelService = require('../../src/utils/dataModelService');

      // Act & Assert
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        freshDataModelService.getDataModelInfo();
        expect.fail('Expected getDataModelInfo to throw an error');
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.message).to.include('DataModelService has not been initialized');
      }
    });

    it('should return cached data model on subsequent calls', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;

      initializeDataModelService(orgs);

      // Act
      const result1 = getDataModelInfo();
      const result2 = getDataModelInfo();

      // Assert
      expect(result1).to.equal(Constants.CustomDataModel);
      expect(result2).to.equal(Constants.CustomDataModel);
      // Both calls should return the same cached result
      expect(result1).to.equal(result2);
    });

    it('should return true for isStandardDataModel when data model is standard', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;

      initializeDataModelService(orgs);

      // Act
      const result = isStandardDataModel();

      // Assert
      expect(result).to.be.true;
    });

    it('should return false for isStandardDataModel when data model is custom', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;

      initializeDataModelService(orgs);

      // Act
      const result = isStandardDataModel();

      // Assert
      expect(result).to.be.false;
    });

    it('should return true for isCustomDataModel when data model is custom', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: false,
      } as OmnistudioOrgDetails;

      initializeDataModelService(orgs);

      // Act
      const result = isCustomDataModel();

      // Assert
      expect(result).to.be.true;
    });

    it('should return false for isCustomDataModel when data model is standard', () => {
      // Arrange
      const orgs: OmnistudioOrgDetails = {
        hasValidNamespace: true,
        packageDetails: { namespace: 'TestNamespace' },
        omniStudioOrgPermissionEnabled: true,
      } as OmnistudioOrgDetails;

      initializeDataModelService(orgs);

      // Act
      const result = isCustomDataModel();

      // Assert
      expect(result).to.be.false;
    });

    it('should reset cache when initializeDataModelService is called again', () => {
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

      // Act
      initializeDataModelService(orgs1);
      const result1 = getDataModelInfo();

      initializeDataModelService(orgs2);
      const result2 = getDataModelInfo();

      // Assert
      expect(result1).to.equal(Constants.CustomDataModel);
      expect(result2).to.equal(Constants.StandardDataModel);
    });
  });
});
