/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, camelcase, comma-dangle */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CardMigrationTool } from '../../../src/migration/flexcard';
import { NameMappingRegistry } from '../../../src/migration/NameMappingRegistry';
import * as dataModelService from '../../../src/utils/dataModelService';
import { StorageUtil } from '../../../src/utils/storageUtil';

describe('FlexCard Storage Name Validation', () => {
  let cardTool: CardMigrationTool;
  let cardToolAllVersions: CardMigrationTool;
  let nameRegistry: NameMappingRegistry;
  let mockConnection: any;
  let mockMessages: any;
  let mockUx: any;
  let mockLogger: any;

  beforeEach(() => {
    // Stub to use custom data model since tests use custom field names
    const isStandardDataModelStub = sinon.stub().returns(false);
    sinon.replace(dataModelService, 'isStandardDataModel', isStandardDataModelStub);

    nameRegistry = NameMappingRegistry.getInstance();
    nameRegistry.clear();

    mockConnection = {};
    mockMessages = {
      getMessage: (key: string, params?: string[]) => {
        if (key === 'duplicateCardNameMessage') {
          return `Duplicate card name: ${params ? params[0] : ''}`;
        }
        if (key === 'lowerVersionDuplicateCardNameMessage') {
          return `Lower version duplicate card name: ${params ? params[0] : ''}`;
        }
        if (key === 'cardNameChangeMessage') {
          return `Card name changed from ${params ? params[0] : ''} to ${params ? params[1] : ''}`;
        }
        if (key === 'processingFlexCard') {
          return `Processing FlexCard: ${params ? params[0] : ''}`;
        }
        if (key === 'flexcardStorageProcessingStarted') {
          return 'Processing flexcard storage';
        }
        if (key === 'errorWhileProcessingFlexcardStorage') {
          return 'Error while processing flexcard storage';
        }
        if (key === 'missingInfo') {
          return 'Missing information';
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

    // Reset storage instances to ensure clean state between tests
    const migrationStorage = StorageUtil.getOmnistudioMigrationStorage();
    migrationStorage.osStorage.clear();
    migrationStorage.osStandardStorage.clear();
    migrationStorage.fcStorage.clear();

    const assessmentStorage = StorageUtil.getOmnistudioAssessmentStorage();
    assessmentStorage.osStorage.clear();
    assessmentStorage.osStandardStorage.clear();
    assessmentStorage.fcStorage.clear();

    // Create two instances: one with allVersions=false, one with allVersions=true
    cardTool = new CardMigrationTool('vlocity_ins', mockConnection, mockLogger, mockMessages, mockUx, false);
    cardToolAllVersions = new CardMigrationTool('vlocity_ins', mockConnection, mockLogger, mockMessages, mockUx, true);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Assessment Storage - Name without Version', () => {
    it('should store flexcard name WITHOUT version when allVersions=true and multiple versions exist', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      // Create three versions of the same flexcard (ABCFlexcard)
      const cards = [
        {
          Id: 'card1',
          Name: 'ABCFlexcard',
          vlocity_ins__Version__c: 1,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card2',
          Name: 'ABCFlexcard',
          vlocity_ins__Version__c: 2,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card3',
          Name: 'ABCFlexcard',
          vlocity_ins__Version__c: 3,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
      ];

      const assessmentInfos = [];
      for (const card of cards) {
        const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);
        assessmentInfos.push(result);
      }

      // Verify assessment info has correct display name (with version)
      expect(assessmentInfos[0].name).to.equal('ABCFlexcard_1');
      expect(assessmentInfos[1].name).to.equal('ABCFlexcard_2');
      expect(assessmentInfos[2].name).to.equal('ABCFlexcard_3');

      // Verify nameMapping has name WITHOUT version
      expect(assessmentInfos[0].nameMapping.newName).to.equal('ABCFlexcard');
      expect(assessmentInfos[1].nameMapping.newName).to.equal('ABCFlexcard');
      expect(assessmentInfos[2].nameMapping.newName).to.equal('ABCFlexcard');

      // Prepare storage
      (cardToolAllVersions as any).prepareAssessmentStorageForFlexcards(assessmentInfos);

      // Get actual storage
      const assessmentStorage = StorageUtil.getOmnistudioAssessmentStorage();

      // All three versions map to the SAME storage key (without version) - 'abcflexcard'
      // The last version processed overwrites previous ones (expected behavior)
      expect(assessmentStorage.fcStorage.has('abcflexcard')).to.be.true;
      expect(assessmentStorage.fcStorage.size).to.equal(1); // Only one entry for all versions

      // Verify storage value has name WITHOUT version (from nameMapping.newName)
      const storedValue = assessmentStorage.fcStorage.get('abcflexcard');
      expect(storedValue?.name).to.equal('ABCFlexcard');
      expect(storedValue?.originalName).to.equal('ABCFlexcard');

      // Should NOT be marked as duplicate (same flexcard, different versions)
      expect(storedValue?.isDuplicate).to.be.false;
    });

    it('should store flexcard name WITHOUT version when name has special characters', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const cards = [
        {
          Id: 'card1',
          Name: 'ABC Flexcard!',
          vlocity_ins__Version__c: 1,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card2',
          Name: 'ABC Flexcard!',
          vlocity_ins__Version__c: 2,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
      ];

      const assessmentInfos = [];
      for (const card of cards) {
        const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);
        assessmentInfos.push(result);
      }

      // Name should be cleaned
      expect(assessmentInfos[0].nameMapping.newName).to.equal('ABCFlexcard');
      expect(assessmentInfos[1].nameMapping.newName).to.equal('ABCFlexcard');

      // Prepare storage
      (cardToolAllVersions as any).prepareAssessmentStorageForFlexcards(assessmentInfos);

      // Get actual storage
      const assessmentStorage = StorageUtil.getOmnistudioAssessmentStorage();

      // Both versions map to the SAME storage key (without version) - 'abc flexcard!' (lowercased)
      // Note: Storage keys preserve special characters and spaces, just lowercased
      expect(assessmentStorage.fcStorage.has('abc flexcard!')).to.be.true;
      expect(assessmentStorage.fcStorage.size).to.equal(1);

      // Verify storage value has cleaned name WITHOUT version
      const storedValue = assessmentStorage.fcStorage.get('abc flexcard!');
      expect(storedValue?.name).to.equal('ABCFlexcard');
      expect(storedValue?.originalName).to.equal('ABC Flexcard!');
      expect(storedValue?.isDuplicate).to.be.false;
    });

    it('should store flexcard name WITHOUT version when allVersions=false', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card = {
        Id: 'card1',
        Name: 'ABCFlexcard',
        vlocity_ins__Version__c: 5,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const assessmentInfo = await (cardTool as any).processFlexCard(card, uniqueNames, dupFlexCardNames);

      // Verify assessment info has correct display name (without version)
      expect(assessmentInfo.name).to.equal('ABCFlexcard');

      // Verify nameMapping has name WITHOUT version
      expect(assessmentInfo.nameMapping.newName).to.equal('ABCFlexcard');

      // Prepare storage
      (cardTool as any).prepareAssessmentStorageForFlexcards([assessmentInfo]);

      // Get actual storage
      const assessmentStorage = StorageUtil.getOmnistudioAssessmentStorage();

      // Verify storage contains entry with correct key
      expect(assessmentStorage.fcStorage.has('abcflexcard')).to.be.true;

      // Verify storage value has name WITHOUT version
      const storage = assessmentStorage.fcStorage.get('abcflexcard');
      expect(storage?.name).to.equal('ABCFlexcard');
      expect(storage?.originalName).to.equal('ABCFlexcard');
    });
  });

  describe('Migration Storage - Name without Version', () => {
    it('should store flexcard name WITHOUT version in migration storage', () => {
      const originalRecords = new Map<string, any>();
      const uploadResults = new Map<string, any>();

      // Add three versions of ABCFlexcard to original records
      originalRecords.set('card1', {
        Id: 'card1',
        Name: 'ABCFlexcard',
        vlocity_ins__Version__c: 1,
      });
      originalRecords.set('card2', {
        Id: 'card2',
        Name: 'ABCFlexcard',
        vlocity_ins__Version__c: 2,
      });
      originalRecords.set('card3', {
        Id: 'card3',
        Name: 'ABCFlexcard',
        vlocity_ins__Version__c: 3,
      });

      // Simulate upload results with actualName (without version)
      uploadResults.set('card1', {
        referenceId: 'card1',
        id: 'newcard1',
        newName: 'ABCFlexcard_1', // Display name with version
        actualName: 'ABCFlexcard', // Actual Salesforce Name field WITHOUT version
        errors: [],
        warnings: [],
        hasErrors: false,
        success: true,
      });
      uploadResults.set('card2', {
        referenceId: 'card2',
        id: 'newcard2',
        newName: 'ABCFlexcard_2',
        actualName: 'ABCFlexcard',
        errors: [],
        warnings: [],
        hasErrors: false,
        success: true,
      });
      uploadResults.set('card3', {
        referenceId: 'card3',
        id: 'newcard3',
        newName: 'ABCFlexcard_3',
        actualName: 'ABCFlexcard',
        errors: [],
        warnings: [],
        hasErrors: false,
        success: true,
      });

      // Prepare storage
      (cardToolAllVersions as any).prepareStorageForFlexcards(uploadResults, originalRecords);

      // Get actual storage
      const migrationStorage = StorageUtil.getOmnistudioMigrationStorage();

      // All three versions map to the SAME storage key (without version) - 'abcflexcard'
      // The last version processed overwrites previous ones (expected behavior)
      expect(migrationStorage.fcStorage.size).to.equal(1); // Only one entry for all versions
      expect(migrationStorage.fcStorage.has('abcflexcard')).to.be.true;

      // Verify storage value has name WITHOUT version (from actualName)
      const storedValue = migrationStorage.fcStorage.get('abcflexcard');
      expect(storedValue).to.exist;
      expect(storedValue?.name).to.equal('ABCFlexcard');
      expect(storedValue?.originalName).to.equal('ABCFlexcard');
      expect(storedValue?.migrationSuccess).to.be.true;
      expect(storedValue?.isDuplicate).to.be.false;
    });

    it('should use actualName (without version) even when newName has version', () => {
      const originalRecords = new Map<string, any>();
      const uploadResults = new Map<string, any>();

      originalRecords.set('card1', {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 5,
      });

      // Upload result with different newName (with version) and actualName (without version)
      uploadResults.set('card1', {
        referenceId: 'card1',
        id: 'newcard1',
        newName: 'TestCard_5', // Display name includes version
        actualName: 'TestCard', // Actual Salesforce Name does NOT include version
        errors: [],
        warnings: [],
        hasErrors: false,
        success: true,
      });

      (cardToolAllVersions as any).prepareStorageForFlexcards(uploadResults, originalRecords);

      // Get actual storage
      const migrationStorage = StorageUtil.getOmnistudioMigrationStorage();

      // Verify storage uses actualName (without version)
      const storage = migrationStorage.fcStorage.get('testcard');
      expect(storage).to.exist;
      expect(storage?.name).to.equal('TestCard');
      expect(storage?.name).to.not.include('_5');
    });

    it('should handle migration failures and store correct name', () => {
      const originalRecords = new Map<string, any>();
      const uploadResults = new Map<string, any>();

      originalRecords.set('card1', {
        Id: 'card1',
        Name: 'FailedCard',
        vlocity_ins__Version__c: 1,
      });

      // Simulate failed upload
      uploadResults.set('card1', {
        referenceId: 'card1',
        id: undefined,
        newName: 'FailedCard_1',
        actualName: 'FailedCard',
        errors: ['Migration failed'],
        warnings: [],
        hasErrors: true,
        success: false,
      });

      (cardToolAllVersions as any).prepareStorageForFlexcards(uploadResults, originalRecords);

      // Get actual storage
      const migrationStorage = StorageUtil.getOmnistudioMigrationStorage();

      // Verify storage still uses actualName (without version)
      const storage = migrationStorage.fcStorage.get('failedcard');
      expect(storage).to.exist;
      expect(storage?.name).to.equal('FailedCard');
      expect(storage?.migrationSuccess).to.be.false;
      expect(storage?.error).to.deep.equal(['Migration failed']);
    });
  });

  describe('Cross-reference Validation', () => {
    it('should ensure all versions of a flexcard map to the same storage name', () => {
      const originalRecords = new Map<string, any>();
      const uploadResults = new Map<string, any>();

      // Create 5 versions of the same flexcard
      for (let i = 1; i <= 5; i++) {
        originalRecords.set(`card${i}`, {
          Id: `card${i}`,
          Name: 'MultiVersionCard',
          vlocity_ins__Version__c: i,
        });

        uploadResults.set(`card${i}`, {
          referenceId: `card${i}`,
          id: `newcard${i}`,
          newName: `MultiVersionCard_${i}`,
          actualName: 'MultiVersionCard', // Same for all versions
          errors: [],
          warnings: [],
          hasErrors: false,
          success: true,
        });
      }

      (cardToolAllVersions as any).prepareStorageForFlexcards(uploadResults, originalRecords);

      // Get actual storage
      const migrationStorage = StorageUtil.getOmnistudioMigrationStorage();

      // All versions should be stored, but the last one will overwrite previous entries
      // The key point is that they all use the same name (without version)
      const finalStorage = migrationStorage.fcStorage.get('multiversioncard');
      expect(finalStorage).to.exist;
      expect(finalStorage?.name).to.equal('MultiVersionCard');

      // Verify no version suffix in the stored name
      expect(finalStorage?.name).to.not.include('_1');
      expect(finalStorage?.name).to.not.include('_2');
      expect(finalStorage?.name).to.not.include('_3');
      expect(finalStorage?.name).to.not.include('_4');
      expect(finalStorage?.name).to.not.include('_5');
    });
  });
});
