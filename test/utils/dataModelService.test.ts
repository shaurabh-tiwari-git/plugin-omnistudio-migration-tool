import { expect } from 'chai';
import sinon = require('sinon');
import {
  DataModelService,
  initializeDataModelService,
  getDataModelService,
  isStandardDataModel,
  isCustomDataModel,
  isFoundationPackage,
  isStandardDataModelWithMetadataAPIEnabled,
  isOmnistudioMetadataAPIEnabled,
} from '../../src/utils/dataModelService';
import { OmnistudioOrgDetails } from '../../src/utils/orgUtils';

describe('DataModelService', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Class Methods', () => {
    describe('checkIfIsStandardDataModel', () => {
      it('should return true when omniStudioOrgPermissionEnabled is true', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsStandardDataModel();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when omniStudioOrgPermissionEnabled is false', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsStandardDataModel();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('checkIfIsCustomDataModel', () => {
      it('should return true when omniStudioOrgPermissionEnabled is false', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsCustomDataModel();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when omniStudioOrgPermissionEnabled is true', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsCustomDataModel();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('checkIfIsFoundationPackage', () => {
      it('should return true when isFoundationPackage is true', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: true,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsFoundationPackage();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when isFoundationPackage is false', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsFoundationPackage();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when isFoundationPackage is undefined', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsFoundationPackage();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when isFoundationPackage is null', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: null,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as unknown as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsFoundationPackage();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('checkIfIsOmnistudioMetadataAPIEnabled', () => {
      it('should return true when isOmnistudioMetadataAPIEnabled is true', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when isOmnistudioMetadataAPIEnabled is false', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when isOmnistudioMetadataAPIEnabled is undefined', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('checkIfIsStandardDataModelWithMetadataAPIEnabled', () => {
      it('should return true when both standard data model and metadata API are enabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when standard data model is enabled but metadata API is disabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when custom data model is used even if metadata API is enabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when both are disabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const dataModelService = new DataModelService(orgs);

        // Act
        const result = dataModelService.checkIfIsStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });
    });
  });

  describe('Global Functions', () => {
    describe('initializeDataModelService and getDataModelService', () => {
      it('should initialize global service correctly', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        // Act & Assert - No error should be thrown
        expect(() => initializeDataModelService(orgs)).to.not.throw();
      });

      it('should return global service instance after initialization', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const service = getDataModelService();

        // Assert
        expect(service).to.be.instanceOf(DataModelService);
      });

      it('should throw error when getDataModelService is called without initialization', () => {
        // Arrange - Clear any existing global state by importing fresh module
        delete require.cache[require.resolve('../../src/utils/dataModelService')];
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const freshDataModelService = require('../../src/utils/dataModelService');

        // Act & Assert
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          freshDataModelService.getDataModelService();
        }).to.throw('DataModelService not initialized');
      });
    });

    describe('isStandardDataModel', () => {
      it('should return true when data model is standard', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isStandardDataModel();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when data model is custom', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isStandardDataModel();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('isCustomDataModel', () => {
      it('should return true when data model is custom', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isCustomDataModel();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when data model is standard', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isCustomDataModel();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('isFoundationPackage', () => {
      it('should return true when foundation package is true', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: true,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isFoundationPackage();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when foundation package is false', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isFoundationPackage();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when foundation package is undefined', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isFoundationPackage();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('isOmnistudioMetadataAPIEnabled', () => {
      it('should return true when metadata API is enabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when metadata API is disabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when metadata API is undefined', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('isStandardDataModelWithMetadataAPIEnabled', () => {
      it('should return true when both standard data model and metadata API are enabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.true;
      });

      it('should return false when standard data model is enabled but metadata API is disabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when custom data model is used even if metadata API is enabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });

      it('should return false when both are disabled', () => {
        // Arrange
        const orgs: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;

        initializeDataModelService(orgs);

        // Act
        const result = isStandardDataModelWithMetadataAPIEnabled();

        // Assert
        expect(result).to.be.false;
      });
    });

    describe('Service reinitialization', () => {
      it('should use new values when initializeDataModelService is called again', () => {
        // Arrange
        const orgs1: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: true,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: false,
          isOmnistudioMetadataAPIEnabled: false,
        } as OmnistudioOrgDetails;
        const orgs2: OmnistudioOrgDetails = {
          hasValidNamespace: true,
          isFoundationPackage: false,
          packageDetails: { namespace: 'TestNamespace' },
          omniStudioOrgPermissionEnabled: true,
          isOmnistudioMetadataAPIEnabled: true,
        } as OmnistudioOrgDetails;

        // Act
        initializeDataModelService(orgs1);
        const result1Foundation = isFoundationPackage();
        const result1Standard = isStandardDataModel();
        const result1MetadataAPI = isOmnistudioMetadataAPIEnabled();

        initializeDataModelService(orgs2);
        const result2Foundation = isFoundationPackage();
        const result2Standard = isStandardDataModel();
        const result2MetadataAPI = isOmnistudioMetadataAPIEnabled();

        // Assert
        expect(result1Foundation).to.be.true;
        expect(result1Standard).to.be.false;
        expect(result1MetadataAPI).to.be.false;

        expect(result2Foundation).to.be.false;
        expect(result2Standard).to.be.true;
        expect(result2MetadataAPI).to.be.true;
      });
    });
  });
});
