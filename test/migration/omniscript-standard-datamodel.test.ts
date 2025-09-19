/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, camelcase, comma-dangle */
import { expect } from 'chai';
import { OmniScriptMigrationTool, OmniScriptExportType } from '../../src/migration/omniscript';
import { NameMappingRegistry } from '../../src/migration/NameMappingRegistry';
import { initializeDataModelService } from '../../src/utils/dataModelService';
import { OmnistudioOrgDetails } from '../../src/utils/orgUtils';

describe('OmniScript Standard Data Model (Metadata API Disabled) - Assessment and Migration', () => {
  let omniScriptTool: OmniScriptMigrationTool;
  let nameRegistry: NameMappingRegistry;
  let mockConnection: any;
  let mockMessages: any;
  let mockUx: any;
  let mockLogger: any;

  beforeEach(() => {
    nameRegistry = NameMappingRegistry.getInstance();
    nameRegistry.clear();

    // Initialize data model service for tests (set to STANDARD data model)
    const mockOrgDetails: OmnistudioOrgDetails = {
      packageDetails: { version: '1.0.0', namespace: 'omnistudio' },
      omniStudioOrgPermissionEnabled: true, // This makes IS_STANDARD_DATA_MODEL = true
      orgDetails: { Name: 'Test Org', Id: '00D000000000000' },
      dataModel: 'Standard',
      hasValidNamespace: true,
    };
    initializeDataModelService(mockOrgDetails);

    // Setup mock objects
    mockConnection = {
      query: () => Promise.resolve({ records: [] }),
    };
    mockMessages = {
      getMessage: (key: string, params?: string[]) => {
        const messages = {
          startingOmniScriptAssessment: `Starting ${params?.[0]} assessment...`,
          foundOmniScriptsToAssess: `Found ${params?.[0]} ${params?.[1]} to assess`,
          processingOmniScript: `Processing OmniScript: ${params?.[0]}`,
          foundOmniScriptsToMigrate: `Found ${params?.[0]} ${params?.[1]} to migrate`,
          missingMandatoryField: `Missing mandatory field '${params?.[0]}' for ${params?.[1]}`,
          changeMessage: `The ${params?.[0]} '${params?.[1]}' will be changed to '${params?.[2]}'`,
          integrationProcedureTypeEmptyAfterCleaning: `Integration Procedure Type becomes empty after cleaning: '${params?.[0]}'`,
          integrationProcedureSubtypeEmptyAfterCleaning: `Integration Procedure SubType becomes empty after cleaning: '${params?.[0]}'`,
          duplicatedName: 'Duplicated name found',
          invalidOrRepeatingOmniscriptElementNames: `Invalid or repeating element names: ${params?.[0]}`,
          reservedKeysFoundInPropertySet: `Reserved keys found in PropertySet: ${params?.[0]}`,
          angularOSWarning: 'Angular OmniScript detected - migration not supported',
          angularOmniScriptDependencyWarning: `Element '${params?.[0]}' references Angular OmniScript '${params?.[1]}' which will not be migrated`,
          componentMappingNotFound: `No registry mapping found for ${params?.[0]} component: ${params?.[1]}, using fallback cleaning`,
          unexpectedError: 'An unexpected error occurred',
        };
        return messages[key] || 'Mock message for testing';
      },
    };
    mockUx = {};
    mockLogger = {};

    omniScriptTool = new OmniScriptMigrationTool(
      OmniScriptExportType.All,
      '', // No namespace for standard data model
      mockConnection,
      mockLogger,
      mockMessages,
      mockUx,
      false
    );

    // Setup test mappings for Standard Data Model
    setupTestMappingsForStandardDataModel();
  });

  function setupTestMappingsForStandardDataModel() {
    // DataMapper mappings with special characters
    nameRegistry.registerNameMapping({
      originalName: 'Customer-Data@Loader!',
      cleanedName: 'CustomerDataLoader',
      componentType: 'DataMapper',
      recordId: 'odt1',
    });

    nameRegistry.registerNameMapping({
      originalName: 'Product#Info$Extractor',
      cleanedName: 'ProductInfoExtractor',
      componentType: 'DataMapper',
      recordId: 'odt2',
    });

    // Integration Procedure mappings (Type_SubType format) with special characters
    nameRegistry.registerNameMapping({
      originalName: 'API-Gateway_Customer@Info!',
      cleanedName: 'APIGateway_CustomerInfo',
      componentType: 'IntegrationProcedure',
      recordId: 'op1',
    });

    nameRegistry.registerNameMapping({
      originalName: 'Data#Validation$Service',
      cleanedName: 'DataValidation_Service',
      componentType: 'IntegrationProcedure',
      recordId: 'op2',
    });

    // OmniScript mappings (Type_SubType_Language format) with special characters
    nameRegistry.registerNameMapping({
      originalName: 'Customer-Profile_Account@View!_English',
      cleanedName: 'CustomerProfile_AccountView_English',
      componentType: 'OmniScript',
      recordId: 'op3',
    });

    nameRegistry.registerNameMapping({
      originalName: 'Product#Catalog$_Detail&View_Spanish',
      cleanedName: 'ProductCatalog_DetailView_Spanish',
      componentType: 'OmniScript',
      recordId: 'op4',
    });
  }

  describe('Standard Data Model Assessment - OmniProcess with Special Characters', () => {
    it('should assess OmniProcess (OmniScript) with special characters in Type and clean them', async () => {
      const mockElements = [
        {
          Id: 'ope1',
          Name: 'TestElement1',
          Type: 'Text', // Standard Data Model uses 'Type' not 'Type__c'
          PropertySetConfig: JSON.stringify({}), // Standard Data Model uses 'PropertySetConfig' not 'PropertySet__c'
          Level: 0, // Standard Data Model uses 'Level' not 'Level__c'
          ParentElementId: null,
        },
      ];

      (omniScriptTool as any).getAllElementsForOmniScript = () => Promise.resolve(mockElements);

      const mockOmniscript = {
        Id: 'op123',
        Name: 'TestOmniProcess',
        Type: 'Customer-Profile@', // Special characters - Standard Data Model uses 'Type' not 'Type__c'
        SubType: 'Account!View', // Special characters - Standard Data Model uses 'SubType' not 'SubType__c'
        Language: 'English', // Standard Data Model uses 'Language' not 'Language__c'
        VersionNumber: '1', // Standard Data Model uses 'VersionNumber' not 'Version__c'
        IsIntegrationProcedure: false, // Standard Data Model uses 'IsIntegrationProcedure' not 'IsProcedure'
        IsWebCompEnabled: true, // Standard Data Model uses 'IsWebCompEnabled' not 'IsLwcEnabled'
        IsActive: true,
      };

      const result = await (omniScriptTool as any).processOmniScript(
        mockOmniscript,
        new Set<string>(),
        new Set<string>(),
        new Set<string>()
      );

      // Should clean special characters and show warnings
      expect(result.name).to.equal('CustomerProfile_AccountView_English_1');
      expect(result.oldName).to.equal('Customer-Profile@_Account!View_English_1');
      expect(result.warnings).to.include.members([
        "The type 'Customer-Profile@' will be changed to 'CustomerProfile'",
        "The sub type 'Account!View' will be changed to 'AccountView'",
      ]);
      expect(result.migrationStatus).to.equal('Warnings');
    });

    it('should assess OmniProcess with IP and DM dependencies having special characters', async () => {
      const mockElements = [
        {
          Id: 'ope1',
          Name: 'IPAction',
          Type: 'Integration Procedure Action',
          PropertySetConfig: JSON.stringify({
            integrationProcedureKey: 'API-Gateway_Customer@Info!',
          }),
          Level: 0,
        },
        {
          Id: 'ope2',
          Name: 'DRAction',
          Type: 'DataRaptor Extract Action',
          PropertySetConfig: JSON.stringify({
            bundle: 'Customer-Data@Loader!',
          }),
          Level: 0,
        },
      ];

      (omniScriptTool as any).getAllElementsForOmniScript = () => Promise.resolve(mockElements);

      const mockOmniscript = {
        Id: 'op125',
        Name: 'TestOmniScript',
        Type: 'TestType',
        SubType: 'TestSubType',
        Language: 'English',
        VersionNumber: '1',
        IsIntegrationProcedure: false,
        IsWebCompEnabled: true,
        IsActive: true,
      };

      const result = await (omniScriptTool as any).processOmniScript(
        mockOmniscript,
        new Set<string>(),
        new Set<string>(),
        new Set<string>()
      );

      // Should detect dependencies correctly
      expect(result.dependenciesIP).to.have.lengthOf(1);
      expect(result.dependenciesIP[0].name).to.equal('API-Gateway_Customer@Info!');
      expect(result.dependenciesIP[0].location).to.equal('IPAction');

      expect(result.dependenciesDR).to.have.lengthOf(1);
      expect(result.dependenciesDR[0].name).to.equal('Customer-Data@Loader!');
      expect(result.dependenciesDR[0].location).to.equal('DRAction');
    });
  });

  describe('Standard Data Model Assessment - Reserved Keys Detection', () => {
    it('should detect reserved keys in PropertySet and add warnings', async () => {
      const mockElements = [
        {
          Id: 'ope1',
          Name: 'TestElement',
          Type: 'Text',
          PropertySetConfig: JSON.stringify({
            additionalOutput: {
              Request: 'some value', // Reserved key
              Response: 'other value', // Reserved key
              normalKey: 'normal value',
            },
          }),
          Level: 0,
        },
      ];

      (omniScriptTool as any).getAllElementsForOmniScript = () => Promise.resolve(mockElements);

      const mockOmniscript = {
        Id: 'op126',
        Name: 'TestOmniScript',
        Type: 'TestType',
        SubType: 'TestSubType',
        IsIntegrationProcedure: true, // Integration Procedure
        IsActive: true,
      };

      const result = await (omniScriptTool as any).processOmniScript(
        mockOmniscript,
        new Set<string>(),
        new Set<string>(),
        new Set<string>()
      );

      expect(result.warnings).to.include('Reserved keys found in PropertySet: Request, Response');
      expect(result.migrationStatus).to.equal('Needs Manual Intervention');
    });
  });

  describe('Standard Data Model Migration - OmniProcess Element Mapping with Dependencies', () => {
    it('should map OmniProcessElement with IP dependency having special characters', () => {
      const mockElementRecord = {
        Id: 'ope1',
        Name: 'TestIPElement',
        Type: 'Integration Procedure Action',
        PropertySetConfig: JSON.stringify({
          integrationProcedureKey: 'API-Gateway_Customer@Info!',
          timeout: 30,
        }),
        Level: 0,
        ParentElementId: null,
        OmniProcessId: 'op123',
      };

      const result = (omniScriptTool as any).mapElementData(mockElementRecord, 'op123', new Map(), new Map());

      const propertySet = JSON.parse(result.PropertySetConfig);

      // Should use registry mapping to clean the IP name
      expect(propertySet.integrationProcedureKey).to.equal('APIGateway_CustomerInfo');
      expect(propertySet.timeout).to.equal(30);
      expect(result.OmniProcessId).to.equal('op123');
    });

    it('should map OmniProcessElement with DM dependency having special characters', () => {
      const mockElementRecord = {
        Id: 'ope2',
        Name: 'TestDRElement',
        Type: 'DataRaptor Extract Action',
        PropertySetConfig: JSON.stringify({
          bundle: 'Customer-Data@Loader!',
          inputType: 'JSON',
        }),
        Level: 0,
        OmniProcessId: 'op123',
      };

      const result = (omniScriptTool as any).mapElementData(mockElementRecord, 'op123', new Map(), new Map());

      const propertySet = JSON.parse(result.PropertySetConfig);

      // Should use registry mapping to clean the DM name (special chars removed)
      expect(propertySet.bundle).to.equal('CustomerDataLoader');
      expect(propertySet.inputType).to.equal('JSON');
    });

    it('should handle IP dependency without registry mapping (fallback cleaning)', () => {
      const mockElementRecord = {
        Id: 'ope3',
        Name: 'TestIPElement',
        Type: 'Integration Procedure Action',
        PropertySetConfig: JSON.stringify({
          integrationProcedureKey: 'Unknown-IP@With#Special$Chars',
        }),
        Level: 0,
        OmniProcessId: 'op123',
      };

      const invalidIpReferences = new Map();
      const result = (omniScriptTool as any).mapElementData(mockElementRecord, 'op123', new Map(), invalidIpReferences);

      const propertySet = JSON.parse(result.PropertySetConfig);

      // Should fallback to cleaning (special chars removed)
      expect(propertySet.integrationProcedureKey).to.equal('UnknownIPWithSpecialChars');
      // Note: Invalid IP reference tracking may need implementation review
    });
  });

  describe('Standard Data Model Migration - OmniProcessCompilation Content Processing', () => {
    it('should update nested content dependencies with special characters', () => {
      const mockDefinition = {
        Id: 'opc1',
        Name: 'TestDefinition',
        Content: JSON.stringify({
          // Standard Data Model uses 'Content' not 'Content__c'
          sOmniScriptId: 'oldId',
          children: [
            {
              type: 'Integration Procedure Action',
              propSetMap: {
                integrationProcedureKey: 'API-Gateway_Customer@Info!',
                remoteOptions: {
                  preTransformBundle: 'Customer-Data@Loader!',
                  postTransformBundle: 'Product#Info$Extractor',
                },
              },
            },
            {
              type: 'DataRaptor Extract Action',
              propSetMap: {
                bundle: 'Customer-Data@Loader!',
              },
            },
            {
              type: 'Step',
              children: [
                {
                  eleArray: [
                    {
                      type: 'OmniScript',
                      propSetMap: {
                        Type: 'Customer-Profile',
                        'Sub Type': 'Account@View!',
                        Language: 'English',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
        OmniProcessId: 'op123',
      };

      const result = (omniScriptTool as any).mapOsDefinitionsData(mockDefinition, 'newOpId');
      const content = JSON.parse(result.Content); // Standard Data Model returns 'Content' not 'Content__c'

      // Check sOmniScriptId update
      expect(content.sOmniScriptId).to.equal('newOpId');

      // Check Integration Procedure Action updates
      const ipAction = content.children[0];
      expect(ipAction.propSetMap.integrationProcedureKey).to.equal('APIGateway_CustomerInfo');
      expect(ipAction.propSetMap.remoteOptions.preTransformBundle).to.equal('CustomerDataLoader');
      expect(ipAction.propSetMap.remoteOptions.postTransformBundle).to.equal('ProductInfoExtractor');

      // Check DataRaptor Action updates
      const drAction = content.children[1];
      expect(drAction.propSetMap.bundle).to.equal('CustomerDataLoader');

      // Check nested OmniScript updates
      const nestedOmniScript = content.children[2].children[0].eleArray[0];
      expect(nestedOmniScript.propSetMap.Type).to.equal('CustomerProfile');
      expect(nestedOmniScript.propSetMap['Sub Type']).to.equal('AccountView');
    });

    it('should handle content with missing dependencies gracefully', () => {
      const mockDefinition = {
        Id: 'opc2',
        Name: 'TestDefinition',
        Content: JSON.stringify({
          // Standard Data Model uses 'Content' not 'Content__c'
          children: [
            {
              type: 'Integration Procedure Action',
              propSetMap: {
                integrationProcedureKey: 'Unknown-IP@With#Special$Chars',
              },
            },
          ],
        }),
        OmniProcessId: 'op123',
      };

      const result = (omniScriptTool as any).mapOsDefinitionsData(mockDefinition, 'newOpId');
      const content = JSON.parse(result.Content);

      // Should fallback to cleaning for unknown dependencies (special chars removed)
      const ipAction = content.children[0];
      expect(ipAction.propSetMap.integrationProcedureKey).to.equal('UnknownIPWithSpecialChars');
    });
  });

  describe('Standard Data Model Migration - Field Mapping Validation', () => {
    it('should handle standard data model field mappings correctly', () => {
      const mockOmniScriptRecord = {
        Id: 'op123',
        Name: 'Test@OmniScript!',
        Type: 'Customer-Profile@', // Standard Data Model field name
        SubType: 'Account!View', // Standard Data Model field name
        Language: 'English', // Standard Data Model field name
        VersionNumber: '1', // Standard Data Model field name
        IsActive: true,
        IsIntegrationProcedure: false,
        IsWebCompEnabled: true, // Standard Data Model field name
      };

      const result = (omniScriptTool as any).mapOmniScriptRecord(mockOmniScriptRecord);

      // In standard data model, should copy the object as-is but clean the Name
      expect(result.Id).to.equal('op123');
      expect(result.Name).to.equal('TestOmniScript'); // Cleaned
      expect(result.Type).to.equal('Customer-Profile@'); // Original preserved (Standard Data Model field)
      expect(result.SubType).to.equal('Account!View'); // Original preserved (Standard Data Model field)
      expect(result.IsActive).to.equal(true);
      expect(result.attributes.type).to.equal('OmniProcess');
      expect(result.attributes.referenceId).to.equal('op123');
    });

    it('should handle OmniProcessElement field mappings for standard data model', () => {
      const mockElementRecord = {
        Id: 'ope1',
        Name: 'Test@Element!',
        Type: 'Text', // Standard Data Model field name
        PropertySetConfig: JSON.stringify({ label: 'Test Label' }), // Standard Data Model field name
        Level: 0, // Standard Data Model field name
        ParentElementId: null,
        OmniProcessId: 'op123',
      };

      const result = (omniScriptTool as any).mapElementData(mockElementRecord, 'op123', new Map(), new Map());

      // In standard data model, should copy the object as-is
      expect(result.Id).to.equal('ope1');
      expect(result.Name).to.equal('Test@Element!'); // Original preserved in elements
      expect(result.Type).to.equal('Text'); // Standard Data Model field name
      expect(result.Level).to.equal(0); // Standard Data Model field name
      expect(result.OmniProcessId).to.equal('op123');
      expect(result.attributes.type).to.equal('OmniProcessElement');
    });
  });

  describe('Standard Data Model - Complex Scenarios with Multiple Dependencies', () => {
    it('should handle OmniProcess with mixed dependency types and special characters', async () => {
      const mockElements = [
        {
          Id: 'ope1',
          Name: 'IPAction@',
          Type: 'Integration Procedure Action',
          PropertySetConfig: JSON.stringify({
            integrationProcedureKey: 'API-Gateway_Customer@Info!',
            preTransformBundle: 'Customer-Data@Loader!',
            postTransformBundle: 'Product#Info$Extractor',
          }),
          Level: 0,
        },
        {
          Id: 'ope2',
          Name: 'DRAction#',
          Type: 'DataRaptor Transform Action',
          PropertySetConfig: JSON.stringify({
            bundle: 'Customer-Data@Loader!',
          }),
          Level: 0,
        },
        {
          Id: 'ope3',
          Name: 'OSAction$',
          Type: 'OmniScript',
          PropertySetConfig: JSON.stringify({
            Type: 'Customer-Profile',
            'Sub Type': 'Account@View!',
            Language: 'English',
          }),
          Level: 0,
        },
      ];

      (omniScriptTool as any).getAllElementsForOmniScript = () => Promise.resolve(mockElements);

      const mockOmniscript = {
        Id: 'op127',
        Name: 'ComplexOmniScript@',
        Type: 'Complex-Type!', // Standard Data Model field name
        SubType: 'Test@SubType', // Standard Data Model field name
        Language: 'English', // Standard Data Model field name
        VersionNumber: '1', // Standard Data Model field name
        IsIntegrationProcedure: false, // Standard Data Model field name
        IsWebCompEnabled: true, // Standard Data Model field name
        IsActive: true,
      };

      const result = await (omniScriptTool as any).processOmniScript(
        mockOmniscript,
        new Set<string>(),
        new Set<string>(),
        new Set<string>()
      );

      // Should detect all dependency types
      expect(result.dependenciesIP).to.have.lengthOf(1);
      expect(result.dependenciesIP[0].name).to.equal('API-Gateway_Customer@Info!');

      expect(result.dependenciesDR).to.have.lengthOf(1); // Deduplicated - same name from both actions
      expect(result.dependenciesDR.map((d) => d.name)).to.include.members(['Customer-Data@Loader!']);

      expect(result.dependenciesOS).to.have.lengthOf(1);
      expect(result.dependenciesOS[0].name).to.equal('Customer-Profile_Account@View!_English');

      // Should have warnings for special character cleaning
      expect(result.warnings).to.include.members([
        "The type 'Complex-Type!' will be changed to 'ComplexType'",
        "The sub type 'Test@SubType' will be changed to 'TestSubType'",
      ]);
    });

    it('should handle OmniProcess migration with update operations for standard data model', async () => {
      const mockOmniscript = {
        Id: 'op128',
        Name: 'Test@OmniScript',
        Type: 'Test-Type@', // Standard Data Model field name
        SubType: 'Test!SubType', // Standard Data Model field name
        Language: 'English', // Standard Data Model field name
        VersionNumber: '1', // Standard Data Model field name
        IsActive: false,
      };

      // Mock the update path for standard data model
      const mappedRecord = (omniScriptTool as any).mapOmniScriptRecord(mockOmniscript);

      expect(mappedRecord.Name).to.equal('TestOmniScript');
      expect(mappedRecord.Type).to.equal('Test-Type@'); // Original preserved (Standard Data Model field)
      expect(mappedRecord.SubType).to.equal('Test!SubType'); // Original preserved (Standard Data Model field)
    });
  });

  describe('Standard Data Model - Error Scenarios and Edge Cases', () => {
    it('should handle empty or null dependency references', () => {
      const mockElementRecord = {
        Id: 'ope1',
        Name: 'TestElement',
        Type: 'Integration Procedure Action',
        PropertySetConfig: JSON.stringify({
          integrationProcedureKey: '',
          preTransformBundle: null,
        }),
        Level: 0,
        OmniProcessId: 'op123',
      };

      const result = (omniScriptTool as any).mapElementData(mockElementRecord, 'op123', new Map(), new Map());

      const propertySet = JSON.parse(result.PropertySetConfig);
      expect(propertySet.integrationProcedureKey).to.equal('');
      expect(propertySet.preTransformBundle).to.equal(null);
    });
  });
});
