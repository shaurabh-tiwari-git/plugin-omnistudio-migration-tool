/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, camelcase, comma-dangle */
import { expect } from 'chai';
import { NameMappingRegistry } from '../../src/migration/NameMappingRegistry';

describe('OmniScript Dependency Updates with NameMappingRegistry', () => {
  let nameRegistry: NameMappingRegistry;

  beforeEach(() => {
    nameRegistry = NameMappingRegistry.getInstance();
    nameRegistry.clear();
    setupTestNameMappings();
  });

  function setupTestNameMappings() {
    // DataMapper mappings
    nameRegistry.registerNameMapping({
      originalName: 'Customer-Data Loader',
      cleanedName: 'CustomerDataLoader',
      componentType: 'DataMapper',
      recordId: 'dr1',
    });

    // Integration Procedure mappings (Type_SubType format only)
    nameRegistry.registerNameMapping({
      originalName: 'API_Gateway_Customer Info',
      cleanedName: 'APIGateway_CustomerInfo',
      componentType: 'IntegrationProcedure',
      recordId: 'ip1',
    });

    nameRegistry.registerNameMapping({
      originalName: 'Data_Validation_Service',
      cleanedName: 'DataValidation_Service',
      componentType: 'IntegrationProcedure',
      recordId: 'ip2',
    });

    // OmniScript mappings (Type_SubType_Language format)
    nameRegistry.registerNameMapping({
      originalName: 'Customer-Profile_Account-View_English',
      cleanedName: 'CustomerProfile_AccountView_English',
      componentType: 'OmniScript',
      recordId: 'os1',
    });
  }

  describe('Integration Procedure Action Updates', () => {
    it('should update integrationProcedureKey using registry', () => {
      const propertySet = {
        integrationProcedureKey: 'API_Gateway_Customer Info',
        someOtherProperty: 'value',
      };

      const updated = nameRegistry.updateDependencyReferences(propertySet);

      expect(updated.integrationProcedureKey).to.equal('APIGateway_CustomerInfo');
      expect(updated.someOtherProperty).to.equal('value');
    });

    it('should fallback to cleaning when no registry mapping exists', () => {
      const propertySet = {
        integrationProcedureKey: 'Unknown_Integration_Procedure',
        someOtherProperty: 'value',
      };

      const updated = nameRegistry.updateDependencyReferences(propertySet);

      expect(updated.integrationProcedureKey).to.equal('Unknown_Integration_Procedure');
      expect(updated.someOtherProperty).to.equal('value');
    });

    it('should handle multiple Integration Procedure references', () => {
      const elementData = {
        elements: [
          {
            type: 'Integration Procedure Action',
            propertySet: {
              integrationProcedureKey: 'API_Gateway_Customer Info',
            },
          },
          {
            type: 'Integration Procedure Action',
            propertySet: {
              integrationProcedureKey: 'Data_Validation_Service',
            },
          },
        ],
      };

      const updated = nameRegistry.updateDependencyReferences(elementData);

      expect(updated.elements[0].propertySet.integrationProcedureKey).to.equal('APIGateway_CustomerInfo');
      expect(updated.elements[1].propertySet.integrationProcedureKey).to.equal('DataValidation_Service');
    });
  });

  describe('DataRaptor Action Updates', () => {
    it('should update bundle reference using registry', () => {
      const propertySet = {
        bundle: 'Customer-Data Loader',
        someOtherProperty: 'value',
      };

      const updated = nameRegistry.updateDependencyReferences(propertySet);

      expect(updated.bundle).to.equal('CustomerDataLoader');
      expect(updated.someOtherProperty).to.equal('value');
    });

    it('should fallback to cleaning when no registry mapping exists', () => {
      const propertySet = {
        bundle: 'Unknown-DataMapper Bundle',
        someOtherProperty: 'value',
      };

      const updated = nameRegistry.updateDependencyReferences(propertySet);

      expect(nameRegistry.hasDataMapperMapping(updated.bundle)).to.be.false;
      expect(updated.someOtherProperty).to.equal('value');
    });

    it('should handle nested DataRaptor references', () => {
      const elementData = {
        elements: [
          {
            type: 'DataRaptor Extract Action',
            propertySet: {
              bundle: 'Customer-Data Loader',
              inputMap: {
                dataRaptorBundle: 'Customer-Data Loader',
              },
            },
          },
        ],
      };

      const updated = nameRegistry.updateDependencyReferences(elementData);

      expect(updated.elements[0].propertySet.bundle).to.equal('CustomerDataLoader');
      expect(updated.elements[0].propertySet.inputMap.dataRaptorBundle).to.equal('CustomerDataLoader');
    });
  });

  describe('OmniScript Action Updates', () => {
    it('should update OmniScript references in Type_SubType_Language format', () => {
      // Test that individual parts are cleaned when accessed
      const cleanedName = nameRegistry.getOmniScriptCleanedName('Customer-Profile', 'Account-View', 'English');

      expect(cleanedName).to.equal('CustomerProfile_AccountView_English');
    });

    it('should handle OmniScript references in string format', () => {
      const elementData = {
        omniscriptReference: 'Customer-Profile_Account-View_English',
        elements: [
          {
            type: 'OmniScript Action',
            propertySet: {
              scriptName: 'Customer-Profile_Account-View_English',
            },
          },
        ],
      };

      const updated = nameRegistry.updateDependencyReferences(elementData);

      expect(updated.omniscriptReference).to.equal('CustomerProfile_AccountView_English');
      expect(updated.elements[0].propertySet.scriptName).to.equal('CustomerProfile_AccountView_English');
    });
  });

  describe('Complex Element Structure Updates', () => {
    it('should update all dependency types in complex OmniScript structure', () => {
      const omniscriptDefinition = {
        name: 'Main OmniScript',
        elements: [
          {
            type: 'Step',
            name: 'DataStep',
            elements: [
              {
                type: 'DataRaptor Extract Action',
                name: 'LoadCustomerData',
                propertySet: {
                  bundle: 'Customer-Data Loader',
                  timeout: 30,
                },
              },
              {
                type: 'Integration Procedure Action',
                name: 'CallAPI',
                propertySet: {
                  integrationProcedureKey: 'API_Gateway_Customer Info',
                  timeout: 60,
                },
              },
              {
                type: 'OmniScript Action',
                name: 'CallSubScript',
                propertySet: {
                  scriptReference: 'Customer-Profile_Account-View_English',
                },
              },
            ],
          },
        ],
      };

      const updated = nameRegistry.updateDependencyReferences(omniscriptDefinition);

      // Check DataRaptor update
      const dataAction = updated.elements[0].elements[0];
      expect(dataAction.propertySet.bundle).to.equal('CustomerDataLoader');
      expect(dataAction.propertySet.timeout).to.equal(30);

      // Check Integration Procedure update
      const ipAction = updated.elements[0].elements[1];
      expect(ipAction.propertySet.integrationProcedureKey).to.equal('APIGateway_CustomerInfo');
      expect(ipAction.propertySet.timeout).to.equal(60);

      // Check OmniScript reference update
      const osAction = updated.elements[0].elements[2];
      expect(osAction.propertySet.scriptReference).to.equal('CustomerProfile_AccountView_English');
    });

    it('should preserve non-dependency properties during updates', () => {
      const elementData = {
        metadata: {
          version: '1.0',
          author: 'Test Author',
        },
        elements: [
          {
            type: 'Integration Procedure Action',
            name: 'TestAction',
            propertySet: {
              integrationProcedureKey: 'API_Gateway_Customer Info',
              timeout: 30,
              retries: 3,
              customProperty: 'customValue',
            },
            conditionalView: {
              show: true,
              condition: 'someCondition',
            },
          },
        ],
      };

      const updated = nameRegistry.updateDependencyReferences(elementData);

      // Check dependency was updated
      expect(updated.elements[0].propertySet.integrationProcedureKey).to.equal('APIGateway_CustomerInfo');

      // Check other properties preserved
      expect(updated.metadata.version).to.equal('1.0');
      expect(updated.metadata.author).to.equal('Test Author');
      expect(updated.elements[0].name).to.equal('TestAction');
      expect(updated.elements[0].propertySet.timeout).to.equal(30);
      expect(updated.elements[0].propertySet.retries).to.equal(3);
      expect(updated.elements[0].propertySet.customProperty).to.equal('customValue');
      expect(updated.elements[0].conditionalView.show).to.equal(true);
      expect(updated.elements[0].conditionalView.condition).to.equal('someCondition');
    });
  });

  describe('Registry vs Fallback Priority', () => {
    it('should prefer registry mapping over fallback cleaning', () => {
      // Register a component with a specific cleaned name
      nameRegistry.registerNameMapping({
        originalName: 'Special_Case_DR',
        cleanedName: 'SpecialRegistryName',
        componentType: 'DataMapper',
        recordId: 'dr_special',
      });

      const propertySet = {
        bundle: 'Special_Case_DR',
      };

      const updated = nameRegistry.updateDependencyReferences(propertySet);

      // Should use registry name, not what fallback cleaning would produce
      expect(updated.bundle).to.equal('SpecialRegistryName');
      expect(updated.bundle).to.not.equal('SpecialCaseDR');
    });

    it('should use fallback cleaning when component not in registry', () => {
      const propertySet = {
        bundle: 'Not-In-Registry DataMapper',
        integrationProcedureKey: 'Not-In-Registry IP',
      };

      const updated = nameRegistry.updateDependencyReferences(propertySet);

      // Should use fallback cleaning
      expect(nameRegistry.hasDataMapperMapping(updated.bundle)).to.be.false;
      expect(nameRegistry.hasIntegrationProcedureMapping(updated.integrationProcedureKey)).to.be.false;
    });
  });

  describe('Multiple Component Types in Single Object', () => {
    it('should update all component types correctly in mixed scenario', () => {
      const complexObject = {
        dataMappers: ['Customer-Data Loader'],
        integrationProcedures: ['API_Gateway_Customer Info', 'Data_Validation_Service'],
        omniscripts: ['Customer-Profile_Account-View_English'],
        nestedData: {
          drBundle: 'Customer-Data Loader',
          ipKey: 'API_Gateway_Customer Info',
          osRef: 'Customer-Profile_Account-View_English',
        },
      };

      const updated = nameRegistry.updateDependencyReferences(complexObject);

      // Check array updates
      expect(updated.dataMappers[0]).to.equal('CustomerDataLoader');
      expect(updated.integrationProcedures[0]).to.equal('APIGateway_CustomerInfo');
      expect(updated.integrationProcedures[1]).to.equal('DataValidation_Service');
      expect(updated.omniscripts[0]).to.equal('CustomerProfile_AccountView_English');

      // Check nested object updates
      expect(updated.nestedData.drBundle).to.equal('CustomerDataLoader');
      expect(updated.nestedData.ipKey).to.equal('APIGateway_CustomerInfo');
      expect(updated.nestedData.osRef).to.equal('CustomerProfile_AccountView_English');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty or null values gracefully', () => {
      const testData = {
        bundle: '',
        integrationProcedureKey: null,
        omniscriptRef: undefined,
        validRef: 'Customer-Data Loader',
      };

      const updated = nameRegistry.updateDependencyReferences(testData);

      expect(updated.bundle).to.equal('');
      expect(updated.integrationProcedureKey).to.equal(null);
      expect(updated.omniscriptRef).to.equal(undefined);
      expect(updated.validRef).to.equal('CustomerDataLoader');
    });

    it('should handle arrays with mixed content', () => {
      const testData = {
        mixedArray: [
          'Customer-Data Loader',
          123,
          null,
          'API_Gateway_Customer Info',
          { nested: 'Customer-Data Loader' },
        ],
      };

      const updated = nameRegistry.updateDependencyReferences(testData);

      expect(updated.mixedArray[0]).to.equal('CustomerDataLoader');
      expect(updated.mixedArray[1]).to.equal(123);
      expect(updated.mixedArray[2]).to.equal(null);
      expect(updated.mixedArray[3]).to.equal('APIGateway_CustomerInfo');
      expect(
        typeof updated.mixedArray[4] === 'object' && updated.mixedArray[4] !== null
          ? (updated.mixedArray[4] as { nested: string }).nested
          : undefined
      ).to.equal('CustomerDataLoader');
    });
  });
});
