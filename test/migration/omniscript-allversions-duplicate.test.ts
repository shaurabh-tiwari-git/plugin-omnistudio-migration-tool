/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, camelcase, comma-dangle */
import { expect } from 'chai';
import { OmniScriptMigrationTool, OmniScriptExportType } from '../../src/migration/omniscript';
import { NameMappingRegistry } from '../../src/migration/NameMappingRegistry';

describe('OmniScript Multiple Versions Duplicate Check', () => {
  let osToolAllVersions: OmniScriptMigrationTool;
  let osTool: OmniScriptMigrationTool;
  let nameRegistry: NameMappingRegistry;
  let mockConnection: any;
  let mockMessages: any;
  let mockUx: any;
  let mockLogger: any;

  beforeEach(() => {
    nameRegistry = NameMappingRegistry.getInstance();
    nameRegistry.clear();

    mockConnection = {
      query: async () => ({ records: [] }),
    };
    mockMessages = {
      getMessage: (key: string, params?: string[]) => {
        if (key === 'duplicatedName') {
          return `Duplicate OmniScript name: ${params ? params[0] : ''}`;
        }
        if (key === 'lowerVersionDuplicateOmniscriptName') {
          return `Lower version duplicate: ${params ? params.join(' ') : ''}`;
        }
        if (key === 'duplicatedOSName') {
          return `Duplicate ${params ? params[0] : ''} name: ${params ? params[1] : ''}`;
        }
        if (key === 'lowerVersionDuplicateOSName') {
          return `Lower version duplicate ${params ? params[0] : ''}: ${params ? params[1] : ''}`;
        }
        if (key === 'processingOmniScript') {
          return `Processing OmniScript: ${params ? params[0] : ''}`;
        }
        if (key === 'changeMessage') {
          return 'Name changed';
        }
        return 'Mock message';
      },
    };
    mockUx = {};
    mockLogger = {
      info: () => {},
      log: () => {},
      error: () => {},
      logVerbose: () => {},
    };

    // Create two instances: one with allVersions=false, one with allVersions=true
    osTool = new OmniScriptMigrationTool(
      OmniScriptExportType.OS,
      'vlocity_ins',
      mockConnection,
      mockLogger,
      mockMessages,
      mockUx,
      false
    );

    osToolAllVersions = new OmniScriptMigrationTool(
      OmniScriptExportType.OS,
      'vlocity_ins',
      mockConnection,
      mockLogger,
      mockMessages,
      mockUx,
      true
    );
  });

  describe('Assessment Mode - allVersions=false', () => {
    it('should flag lower version OmniScripts when allVersions=false', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      // Mock getAllElementsForOmniScript to return empty array
      (osTool as any).getAllElementsForOmniScript = async () => [];

      const os1 = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const os2 = {
        Id: 'os2',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result1 = await (osTool as any).processOmniScript(
        os1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const result2 = await (osTool as any).processOmniScript(
        os2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // First OmniScript should be ready for migration
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);
      expect(result1.name).to.equal('TestType_TestSubType_English_1');

      // Second OmniScript should be flagged with duplicate warning (allVersions=false uses duplicatedName)
      expect(result2.migrationStatus).to.equal('Needs manual intervention');
      expect(result2.warnings.length).to.be.greaterThan(0);
      expect(result2.warnings.some((w) => w.includes('Duplicate'))).to.be.true;
    });
  });

  describe('Assessment Mode - allVersions=true', () => {
    it('should NOT flag OmniScripts with same name but different versions as duplicate', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      // Mock getAllElementsForOmniScript to return empty array
      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const os1 = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const os2 = {
        Id: 'os2',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result1 = await (osToolAllVersions as any).processOmniScript(
        os1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const result2 = await (osToolAllVersions as any).processOmniScript(
        os2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // Both OmniScripts should be ready for migration (no duplicate warning)
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);
      expect(result1.name).to.equal('TestType_TestSubType_English_1');

      expect(result2.migrationStatus).to.equal('Ready for migration');
      expect(result2.warnings).to.have.length(0);
      expect(result2.name).to.equal('TestType_TestSubType_English_2');
    });

    it('should flag OmniScripts with same name AND same version as duplicate', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      // Mock getAllElementsForOmniScript to return empty array
      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const os1 = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const os2 = {
        Id: 'os2',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result1 = await (osToolAllVersions as any).processOmniScript(
        os1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const result2 = await (osToolAllVersions as any).processOmniScript(
        os2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // First OmniScript should be ready for migration
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);

      // Second OmniScript should be flagged as duplicate
      expect(result2.migrationStatus).to.equal('Needs manual intervention');
      expect(result2.warnings.length).to.be.greaterThan(0);
      expect(result2.warnings.some((w) => w.includes('Duplicate'))).to.be.true;
    });

    it('should handle multiple versions of same OmniScript correctly', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      // Mock getAllElementsForOmniScript to return empty array
      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const omniscripts = [
        {
          Id: 'os1',
          Name: 'TestOS',
          vlocity_ins__Type__c: 'TestType',
          vlocity_ins__SubType__c: 'TestSubType',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 1,
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
        {
          Id: 'os2',
          Name: 'TestOS',
          vlocity_ins__Type__c: 'TestType',
          vlocity_ins__SubType__c: 'TestSubType',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 2,
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
        {
          Id: 'os3',
          Name: 'TestOS',
          vlocity_ins__Type__c: 'TestType',
          vlocity_ins__SubType__c: 'TestSubType',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 3,
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
      ];

      const results = [];
      for (const os of omniscripts) {
        const result = await (osToolAllVersions as any).processOmniScript(
          os,
          existingOmniscriptNames,
          existingDataRaptorNames,
          existingFlexCardNames,
          duplicateOmniscriptNames
        );
        results.push(result);
      }

      // All three versions should be ready for migration (no duplicates)
      expect(results[0].migrationStatus).to.equal('Ready for migration');
      expect(results[0].name).to.equal('TestType_TestSubType_English_1');
      expect(results[0].warnings).to.have.length(0);

      expect(results[1].migrationStatus).to.equal('Ready for migration');
      expect(results[1].name).to.equal('TestType_TestSubType_English_2');
      expect(results[1].warnings).to.have.length(0);

      expect(results[2].migrationStatus).to.equal('Ready for migration');
      expect(results[2].name).to.equal('TestType_TestSubType_English_3');
      expect(results[2].warnings).to.have.length(0);
    });

    it('should flag different OmniScripts that clean to same name - Use Case: A_1, A_2, A$_1, A$_2, A$_3', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      // OmniScript A with versions 1 and 2
      const osA1 = {
        Id: 'osA1',
        Name: 'A',
        vlocity_ins__Type__c: 'A',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const osA2 = {
        Id: 'osA2',
        Name: 'A',
        vlocity_ins__Type__c: 'A',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      // OmniScript A$ with versions 1, 2, and 3 (cleans to A)
      const osAS1 = {
        Id: 'osAS1',
        Name: 'A$',
        vlocity_ins__Type__c: 'A$',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const osAS2 = {
        Id: 'osAS2',
        Name: 'A$',
        vlocity_ins__Type__c: 'A$',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const osAS3 = {
        Id: 'osAS3',
        Name: 'A$',
        vlocity_ins__Type__c: 'A$',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 3,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      // Process OmniScripts in order
      const resultA1 = await (osToolAllVersions as any).processOmniScript(
        osA1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const resultA2 = await (osToolAllVersions as any).processOmniScript(
        osA2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const resultAS1 = await (osToolAllVersions as any).processOmniScript(
        osAS1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const resultAS2 = await (osToolAllVersions as any).processOmniScript(
        osAS2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const resultAS3 = await (osToolAllVersions as any).processOmniScript(
        osAS3,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // A_1 and A_2 should pass (same OmniScript, different versions)
      expect(resultA1.migrationStatus).to.equal('Ready for migration');
      expect(resultA1.name).to.equal('A_Type_English_1');
      expect(resultA1.warnings).to.have.length(0);

      expect(resultA2.migrationStatus).to.equal('Ready for migration');
      expect(resultA2.name).to.equal('A_Type_English_2');
      expect(resultA2.warnings).to.have.length(0);

      // A$_1 should be flagged as exact duplicate (A$ cleans to A, and A_1 already exists)
      expect(resultAS1.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS1.name).to.equal('A_Type_English_1');
      expect(resultAS1.warnings.length).to.be.greaterThan(0);
      expect(resultAS1.warnings.some((w) => w.includes('Duplicate'))).to.be.true;

      // A$_2 should be flagged as exact duplicate (A$ cleans to A, and A_2 already exists)
      expect(resultAS2.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS2.name).to.equal('A_Type_English_2');
      expect(resultAS2.warnings.length).to.be.greaterThan(0);
      expect(resultAS2.warnings.some((w) => w.includes('Duplicate'))).to.be.true;

      // A$_3 should be flagged as lower version duplicate (different original name)
      expect(resultAS3.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS3.name).to.equal('A_Type_English_3');
      expect(resultAS3.warnings.length).to.be.greaterThan(0);
      expect(resultAS3.warnings.some((w) => w.includes('Lower version duplicate'))).to.be.true;
    });

    it('should flag different OmniScripts that clean to same name - Use Case: A_1, A_2, A$_3', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      // OmniScript A with versions 1 and 2
      const osA1 = {
        Id: 'osA1',
        Name: 'A',
        vlocity_ins__Type__c: 'A',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const osA2 = {
        Id: 'osA2',
        Name: 'A',
        vlocity_ins__Type__c: 'A',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      // OmniScript A$ with version 3 (cleans to A)
      const osAS3 = {
        Id: 'osAS3',
        Name: 'A$',
        vlocity_ins__Type__c: 'A$',
        vlocity_ins__SubType__c: 'Type',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 3,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      // Process OmniScripts in order
      const resultA1 = await (osToolAllVersions as any).processOmniScript(
        osA1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const resultA2 = await (osToolAllVersions as any).processOmniScript(
        osA2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const resultAS3 = await (osToolAllVersions as any).processOmniScript(
        osAS3,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // A_1 and A_2 should pass (same OmniScript, different versions)
      expect(resultA1.migrationStatus).to.equal('Ready for migration');
      expect(resultA1.name).to.equal('A_Type_English_1');
      expect(resultA1.warnings).to.have.length(0);

      expect(resultA2.migrationStatus).to.equal('Ready for migration');
      expect(resultA2.name).to.equal('A_Type_English_2');
      expect(resultA2.warnings).to.have.length(0);

      // A$_3 should be flagged as lower version duplicate (different original name cleaning to A)
      expect(resultAS3.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS3.name).to.equal('A_Type_English_3');
      expect(resultAS3.warnings.length).to.be.greaterThan(0);
      expect(resultAS3.warnings.some((w) => w.includes('Lower version duplicate'))).to.be.true;
    });
  });

  describe('Integration Procedure - Multiple Versions', () => {
    it('should NOT flag IPs with same name but different versions as duplicate when allVersions=true', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      // Mock getAllElementsForOmniScript to return empty array
      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const ip1 = {
        Id: 'ip1',
        Name: 'TestIP',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: true,
      };

      const ip2 = {
        Id: 'ip2',
        Name: 'TestIP',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 2,
        vlocity_ins__IsProcedure__c: true,
      };

      const result1 = await (osToolAllVersions as any).processOmniScript(
        ip1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const result2 = await (osToolAllVersions as any).processOmniScript(
        ip2,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // Both IPs should be ready for migration (no duplicate warning)
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);
      expect(result1.name).to.equal('TestType_TestSubType_English_1');

      expect(result2.migrationStatus).to.equal('Ready for migration');
      expect(result2.warnings).to.have.length(0);
      expect(result2.name).to.equal('TestType_TestSubType_English_2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle OmniScripts with version 0', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const os = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 0,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result = await (osToolAllVersions as any).processOmniScript(
        os,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      expect(result.name).to.equal('TestType_TestSubType_English_0');
      expect(result.migrationStatus).to.equal('Ready for migration');
    });

    it('should handle OmniScripts with very large version numbers', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const os = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 999999,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result = await (osToolAllVersions as any).processOmniScript(
        os,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      expect(result.name).to.equal('TestType_TestSubType_English_999999');
      expect(result.migrationStatus).to.equal('Ready for migration');
    });

    it('should handle lower version appearing after higher version', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      // Process version 3 first
      const os3 = {
        Id: 'os3',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 3,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      // Then process version 1
      const os1 = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result3 = await (osToolAllVersions as any).processOmniScript(
        os3,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      const result1 = await (osToolAllVersions as any).processOmniScript(
        os1,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // Both should be ready for migration (different versions)
      expect(result3.name).to.equal('TestType_TestSubType_English_3');
      expect(result3.migrationStatus).to.equal('Ready for migration');

      expect(result1.name).to.equal('TestType_TestSubType_English_1');
      expect(result1.migrationStatus).to.equal('Ready for migration');
    });

    it('should handle mixed scenarios with duplicates and unique versions', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const omniscripts = [
        {
          Id: 'os1',
          Name: 'OSA',
          vlocity_ins__Type__c: 'TypeA',
          vlocity_ins__SubType__c: 'SubTypeA',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 1,
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
        {
          Id: 'os2',
          Name: 'OSA',
          vlocity_ins__Type__c: 'TypeA',
          vlocity_ins__SubType__c: 'SubTypeA',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 2,
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
        {
          Id: 'os3',
          Name: 'OSB',
          vlocity_ins__Type__c: 'TypeB',
          vlocity_ins__SubType__c: 'SubTypeB',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 1,
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
        {
          Id: 'os4',
          Name: 'OSA',
          vlocity_ins__Type__c: 'TypeA',
          vlocity_ins__SubType__c: 'SubTypeA',
          vlocity_ins__Language__c: 'English',
          vlocity_ins__Version__c: 1, // Duplicate of os1
          vlocity_ins__IsProcedure__c: false,
          vlocity_ins__IsLwcEnabled__c: true,
        },
      ];

      const results = [];
      for (const os of omniscripts) {
        const result = await (osToolAllVersions as any).processOmniScript(
          os,
          existingOmniscriptNames,
          existingDataRaptorNames,
          existingFlexCardNames,
          duplicateOmniscriptNames
        );
        results.push(result);
      }

      // OSA v1 should be ready
      expect(results[0].name).to.equal('TypeA_SubTypeA_English_1');
      expect(results[0].migrationStatus).to.equal('Ready for migration');

      // OSA v2 should be ready (different version)
      expect(results[1].name).to.equal('TypeA_SubTypeA_English_2');
      expect(results[1].migrationStatus).to.equal('Ready for migration');

      // OSB v1 should be ready (different OS)
      expect(results[2].name).to.equal('TypeB_SubTypeB_English_1');
      expect(results[2].migrationStatus).to.equal('Ready for migration');

      // OSA v1 (duplicate) should be flagged
      expect(results[3].name).to.equal('TypeA_SubTypeA_English_1');
      expect(results[3].migrationStatus).to.equal('Needs manual intervention');
      expect(results[3].warnings.length).to.be.greaterThan(0);
    });

    it('should handle OmniScripts without language field', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const os = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: undefined,
        vlocity_ins__Version__c: 1,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result = await (osToolAllVersions as any).processOmniScript(
        os,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      expect(result.name).to.equal('TestType_TestSubType_1');
      expect(result.migrationStatus).to.equal('Ready for migration');
    });
  });

  describe('Name Mapping with Versions', () => {
    it('should create correct name mapping with allVersions=true', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osToolAllVersions as any).getAllElementsForOmniScript = async () => [];

      const os = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 5,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result = await (osToolAllVersions as any).processOmniScript(
        os,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // Name should include version
      expect(result.name).to.equal('TestType_TestSubType_English_5');
      expect(result.oldName).to.equal('TestType_TestSubType_English_5');

      // Name mapping should have correct values
      expect(result.nameMapping).to.exist;
      expect(result.nameMapping.newType).to.equal('TestType');
      expect(result.nameMapping.newSubType).to.equal('TestSubType');
      expect(result.nameMapping.newLanguage).to.equal('English');
    });

    it('should create correct name mapping with allVersions=false', async () => {
      const existingOmniscriptNames = new Set<string>();
      const duplicateOmniscriptNames = new Map<string, string>();
      const existingDataRaptorNames = new Set<string>();
      const existingFlexCardNames = new Set<string>();

      (osTool as any).getAllElementsForOmniScript = async () => [];

      const os = {
        Id: 'os1',
        Name: 'TestOS',
        vlocity_ins__Type__c: 'TestType',
        vlocity_ins__SubType__c: 'TestSubType',
        vlocity_ins__Language__c: 'English',
        vlocity_ins__Version__c: 5,
        vlocity_ins__IsProcedure__c: false,
        vlocity_ins__IsLwcEnabled__c: true,
      };

      const result = await (osTool as any).processOmniScript(
        os,
        existingOmniscriptNames,
        existingDataRaptorNames,
        existingFlexCardNames,
        duplicateOmniscriptNames
      );

      // Name should still include version in the record name
      expect(result.name).to.equal('TestType_TestSubType_English_5');
      expect(result.oldName).to.equal('TestType_TestSubType_English_5');
    });
  });
});
