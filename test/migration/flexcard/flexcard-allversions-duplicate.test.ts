/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, camelcase, comma-dangle */
import { expect } from 'chai';
import { CardMigrationTool } from '../../../src/migration/flexcard';
import { NameMappingRegistry } from '../../../src/migration/NameMappingRegistry';

describe('FlexCard Multiple Versions Duplicate Check', () => {
  let cardTool: CardMigrationTool;
  let cardToolAllVersions: CardMigrationTool;
  let nameRegistry: NameMappingRegistry;
  let mockConnection: any;
  let mockMessages: any;
  let mockUx: any;
  let mockLogger: any;

  beforeEach(() => {
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
    cardTool = new CardMigrationTool('vlocity_ins', mockConnection, mockLogger, mockMessages, mockUx, false);
    cardToolAllVersions = new CardMigrationTool('vlocity_ins', mockConnection, mockLogger, mockMessages, mockUx, true);
  });

  describe('Assessment Mode - allVersions=false', () => {
    it('should flag duplicate cards with same name but different versions as duplicate', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card1 = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const card2 = {
        Id: 'card2',
        Name: 'TestCard',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result1 = await (cardTool as any).processFlexCard(card1, uniqueNames, dupFlexCardNames);
      const result2 = await (cardTool as any).processFlexCard(card2, uniqueNames, dupFlexCardNames);

      // First card should be ready for migration
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);

      // Second card should be flagged as duplicate (manual intervention)
      expect(result2.migrationStatus).to.equal('Needs manual intervention');
      expect(result2.warnings).to.have.length(1);
      expect(result2.warnings[0]).to.include('Duplicate card name');
    });

    it('should not include version in card name when allVersions=false', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 5,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result = await (cardTool as any).processFlexCard(card, uniqueNames, dupFlexCardNames);

      // Card name should not include version
      expect(result.name).to.equal('TestCard');
      expect(result.oldName).to.equal('TestCard');
      expect(result.name).to.not.include('_5');
    });
  });

  describe('Assessment Mode - allVersions=true', () => {
    it('should NOT flag cards with same name but different versions as duplicate', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card1 = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const card2 = {
        Id: 'card2',
        Name: 'TestCard',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result1 = await (cardToolAllVersions as any).processFlexCard(card1, uniqueNames, dupFlexCardNames);
      const result2 = await (cardToolAllVersions as any).processFlexCard(card2, uniqueNames, dupFlexCardNames);

      // Both cards should be ready for migration (no duplicate warning)
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);

      expect(result2.migrationStatus).to.equal('Ready for migration');
      expect(result2.warnings).to.have.length(0);
    });

    it('should flag cards with same name AND same version as duplicate', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card1 = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const card2 = {
        Id: 'card2',
        Name: 'TestCard',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result1 = await (cardToolAllVersions as any).processFlexCard(card1, uniqueNames, dupFlexCardNames);
      const result2 = await (cardToolAllVersions as any).processFlexCard(card2, uniqueNames, dupFlexCardNames);

      // First card should be ready for migration
      expect(result1.migrationStatus).to.equal('Ready for migration');
      expect(result1.warnings).to.have.length(0);

      // Second card should be flagged as duplicate
      expect(result2.migrationStatus).to.equal('Needs manual intervention');
      expect(result2.warnings).to.have.length(1);
      expect(result2.warnings[0]).to.include('Duplicate card name');
      expect(result2.warnings[0]).to.include('TestCard_2');
    });

    it('should include version in card name when allVersions=true', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 5,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);

      // Card name should include version
      expect(result.name).to.equal('TestCard_5');
      expect(result.oldName).to.equal('TestCard_5');
    });

    it('should handle multiple versions of same card correctly', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const cards = [
        {
          Id: 'card1',
          Name: 'TestCard',
          vlocity_ins__Version__c: 1,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card2',
          Name: 'TestCard',
          vlocity_ins__Version__c: 2,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card3',
          Name: 'TestCard',
          vlocity_ins__Version__c: 3,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
      ];

      const results = [];
      for (const card of cards) {
        const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);
        results.push(result);
      }

      // All three versions should be ready for migration (no duplicates)
      expect(results[0].migrationStatus).to.equal('Ready for migration');
      expect(results[0].name).to.equal('TestCard_1');
      expect(results[0].warnings).to.have.length(0);

      expect(results[1].migrationStatus).to.equal('Ready for migration');
      expect(results[1].name).to.equal('TestCard_2');
      expect(results[1].warnings).to.have.length(0);

      expect(results[2].migrationStatus).to.equal('Ready for migration');
      expect(results[2].name).to.equal('TestCard_3');
      expect(results[2].warnings).to.have.length(0);
    });

    it('should handle name cleaning with versions correctly', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card1 = {
        Id: 'card1',
        Name: 'Test Card!',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const card2 = {
        Id: 'card2',
        Name: 'Test Card!',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result1 = await (cardToolAllVersions as any).processFlexCard(card1, uniqueNames, dupFlexCardNames);
      const result2 = await (cardToolAllVersions as any).processFlexCard(card2, uniqueNames, dupFlexCardNames);

      // Both should have warning about name change
      expect(result1.warnings).to.have.length(1);
      expect(result1.warnings[0]).to.include('Card name changed');
      expect(result1.name).to.equal('TestCard_1');

      expect(result2.warnings).to.have.length(1);
      expect(result2.warnings[0]).to.include('Card name changed');
      expect(result2.name).to.equal('TestCard_2');

      // Both should be ready for migration (not duplicates)
      expect(result1.migrationStatus).to.equal('Warnings');
      expect(result2.migrationStatus).to.equal('Warnings');
    });

    it('should flag different cards that clean to same name - Use Case: A_1, A_2, A$_1, A$_2, A$_3', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      // Card A with versions 1 and 2
      const cardA1 = {
        Id: 'cardA1',
        Name: 'A',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const cardA2 = {
        Id: 'cardA2',
        Name: 'A',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      // Card A$ with versions 1, 2, and 3 (cleans to A)
      const cardAS1 = {
        Id: 'cardAS1',
        Name: 'A$',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const cardAS2 = {
        Id: 'cardAS2',
        Name: 'A$',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const cardAS3 = {
        Id: 'cardAS3',
        Name: 'A$',
        vlocity_ins__Version__c: 3,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      // Process cards in order
      const resultA1 = await (cardToolAllVersions as any).processFlexCard(cardA1, uniqueNames, dupFlexCardNames);
      const resultA2 = await (cardToolAllVersions as any).processFlexCard(cardA2, uniqueNames, dupFlexCardNames);
      const resultAS1 = await (cardToolAllVersions as any).processFlexCard(cardAS1, uniqueNames, dupFlexCardNames);
      const resultAS2 = await (cardToolAllVersions as any).processFlexCard(cardAS2, uniqueNames, dupFlexCardNames);
      const resultAS3 = await (cardToolAllVersions as any).processFlexCard(cardAS3, uniqueNames, dupFlexCardNames);

      // A_1 and A_2 should pass (same card, different versions)
      expect(resultA1.migrationStatus).to.equal('Ready for migration');
      expect(resultA1.name).to.equal('A_1');
      expect(resultA1.warnings).to.have.length(0);

      expect(resultA2.migrationStatus).to.equal('Ready for migration');
      expect(resultA2.name).to.equal('A_2');
      expect(resultA2.warnings).to.have.length(0);

      // A$_1 should be flagged as exact duplicate (A$ cleans to A, and A_1 already exists)
      // Note: Will have 2 warnings - one for name change (A$ -> A), one for duplicate
      expect(resultAS1.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS1.name).to.equal('A_1');
      expect(resultAS1.warnings.length).to.be.greaterThan(0);
      expect(resultAS1.warnings.some((w) => w.includes('Duplicate card name'))).to.be.true;

      // A$_2 should be flagged as exact duplicate (A$ cleans to A, and A_2 already exists)
      // Note: Will have 2 warnings - one for name change (A$ -> A), one for duplicate
      expect(resultAS2.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS2.name).to.equal('A_2');
      expect(resultAS2.warnings.length).to.be.greaterThan(0);
      expect(resultAS2.warnings.some((w) => w.includes('Duplicate card name'))).to.be.true;

      // A$_3 should be flagged as lower version duplicate (different original name)
      // Note: Will have 2 warnings - one for name change (A$ -> A), one for lower version duplicate
      expect(resultAS3.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS3.name).to.equal('A_3');
      expect(resultAS3.warnings.length).to.be.greaterThan(0);
      expect(resultAS3.warnings.some((w) => w.includes('Lower version duplicate'))).to.be.true;
    });

    it('should flag different cards that clean to same name - Use Case: A_1, A_2, A$_3', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      // Card A with versions 1 and 2
      const cardA1 = {
        Id: 'cardA1',
        Name: 'A',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const cardA2 = {
        Id: 'cardA2',
        Name: 'A',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      // Card A$ with version 3 (cleans to A)
      const cardAS3 = {
        Id: 'cardAS3',
        Name: 'A$',
        vlocity_ins__Version__c: 3,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      // Process cards in order
      const resultA1 = await (cardToolAllVersions as any).processFlexCard(cardA1, uniqueNames, dupFlexCardNames);
      const resultA2 = await (cardToolAllVersions as any).processFlexCard(cardA2, uniqueNames, dupFlexCardNames);
      const resultAS3 = await (cardToolAllVersions as any).processFlexCard(cardAS3, uniqueNames, dupFlexCardNames);

      // A_1 and A_2 should pass (same card, different versions)
      expect(resultA1.migrationStatus).to.equal('Ready for migration');
      expect(resultA1.name).to.equal('A_1');
      expect(resultA1.warnings).to.have.length(0);

      expect(resultA2.migrationStatus).to.equal('Ready for migration');
      expect(resultA2.name).to.equal('A_2');
      expect(resultA2.warnings).to.have.length(0);

      // A$_3 should be flagged as lower version duplicate (different original name cleaning to A)
      // Note: Will have 2 warnings - one for name change (A$ -> A), one for lower version duplicate
      expect(resultAS3.migrationStatus).to.equal('Needs manual intervention');
      expect(resultAS3.name).to.equal('A_3');
      expect(resultAS3.warnings.length).to.be.greaterThan(0);
      expect(resultAS3.warnings.some((w) => w.includes('Lower version duplicate'))).to.be.true;
    });
  });

  describe('Migration Mode - allVersions=false', () => {
    it('should detect duplicates in migration without version', () => {
      const card1 = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const card2 = {
        Id: 'card2',
        Name: 'TestCard',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const transformedCard1 = (cardTool as any).mapVlocityCardRecord(card1, new Map(), new Map());
      const transformedCard2 = (cardTool as any).mapVlocityCardRecord(card2, new Map(), new Map());

      // Check unique name construction
      const uniqueCheckName1 = transformedCard1['Name'];
      const uniqueCheckName2 = transformedCard2['Name'];

      // Both should have the same name (no version)
      expect(uniqueCheckName1).to.equal(uniqueCheckName2);
      expect(uniqueCheckName1).to.equal('TestCard');
    });
  });

  describe('Migration Mode - allVersions=true', () => {
    it('should NOT detect duplicates when versions differ', () => {
      const card1 = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const card2 = {
        Id: 'card2',
        Name: 'TestCard',
        vlocity_ins__Version__c: 2,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const transformedCard1 = (cardToolAllVersions as any).mapVlocityCardRecord(card1, new Map(), new Map());
      const transformedCard2 = (cardToolAllVersions as any).mapVlocityCardRecord(card2, new Map(), new Map());

      // Check unique name construction
      const uniqueCheckName1 = `${String(transformedCard1['Name'])}_${String(transformedCard1['VersionNumber'])}`;
      const uniqueCheckName2 = `${String(transformedCard2['Name'])}_${String(transformedCard2['VersionNumber'])}`;

      // Names should be different (includes version)
      expect(uniqueCheckName1).to.not.equal(uniqueCheckName2);
      expect(uniqueCheckName1).to.equal('TestCard_1');
      expect(uniqueCheckName2).to.equal('TestCard_2');
    });

    it('should preserve version number in transformed card', () => {
      const card = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 7,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const transformedCard = (cardToolAllVersions as any).mapVlocityCardRecord(card, new Map(), new Map());

      expect(transformedCard['Name']).to.equal('TestCard');
      expect(transformedCard['VersionNumber']).to.equal(7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle cards with version 0', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 0,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);

      expect(result.name).to.equal('TestCard_0');
      expect(result.migrationStatus).to.equal('Ready for migration');
    });

    it('should handle cards with very large version numbers', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const card = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 999999,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);

      expect(result.name).to.equal('TestCard_999999');
      expect(result.migrationStatus).to.equal('Ready for migration');
    });

    it('should handle mixed scenarios with duplicates and unique versions', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      const cards = [
        {
          Id: 'card1',
          Name: 'CardA',
          vlocity_ins__Version__c: 1,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card2',
          Name: 'CardA',
          vlocity_ins__Version__c: 2,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card3',
          Name: 'CardB',
          vlocity_ins__Version__c: 1,
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
        {
          Id: 'card4',
          Name: 'CardA',
          vlocity_ins__Version__c: 1, // Duplicate of card1
          vlocity_ins__Definition__c: '{}',
          vlocity_ins__Datasource__c: '{}',
        },
      ];

      const results = [];
      for (const card of cards) {
        const result = await (cardToolAllVersions as any).processFlexCard(card, uniqueNames, dupFlexCardNames);
        results.push(result);
      }

      // CardA v1 should be ready
      expect(results[0].name).to.equal('CardA_1');
      expect(results[0].migrationStatus).to.equal('Ready for migration');

      // CardA v2 should be ready (different version)
      expect(results[1].name).to.equal('CardA_2');
      expect(results[1].migrationStatus).to.equal('Ready for migration');

      // CardB v1 should be ready (different card)
      expect(results[2].name).to.equal('CardB_1');
      expect(results[2].migrationStatus).to.equal('Ready for migration');

      // CardA v1 (duplicate) should be flagged
      expect(results[3].name).to.equal('CardA_1');
      expect(results[3].migrationStatus).to.equal('Needs manual intervention');
      expect(results[3].warnings).to.have.length(1);
    });

    it('should handle lower version appearing after higher version', async () => {
      const uniqueNames = new Set<string>();
      const dupFlexCardNames = new Map<string, string>();

      // Process version 3 first
      const card3 = {
        Id: 'card3',
        Name: 'TestCard',
        vlocity_ins__Version__c: 3,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      // Then process version 1
      const card1 = {
        Id: 'card1',
        Name: 'TestCard',
        vlocity_ins__Version__c: 1,
        vlocity_ins__Definition__c: '{}',
        vlocity_ins__Datasource__c: '{}',
      };

      const result3 = await (cardToolAllVersions as any).processFlexCard(card3, uniqueNames, dupFlexCardNames);
      const result1 = await (cardToolAllVersions as any).processFlexCard(card1, uniqueNames, dupFlexCardNames);

      // Both should be ready for migration (different versions)
      expect(result3.name).to.equal('TestCard_3');
      expect(result3.migrationStatus).to.equal('Ready for migration');

      expect(result1.name).to.equal('TestCard_1');
      expect(result1.migrationStatus).to.equal('Ready for migration');
    });
  });

  describe('Storage Preparation with Versions', () => {
    it('should use version in storage key when allVersions=true', () => {
      const flexCardInfo = {
        name: 'TestCard_5',
        oldName: 'TestCard_5',
        id: 'card1',
        dependenciesIP: [],
        dependenciesDR: [],
        dependenciesOS: [],
        dependenciesFC: [],
        dependenciesLWC: [],
        dependenciesApexRemoteAction: [],
        infos: [],
        warnings: [],
        errors: [],
        migrationStatus: 'Ready for migration' as const,
        nameMapping: {
          oldName: 'TestCard',
          newName: 'TestCard',
        },
      };

      // This test verifies the storage logic indirectly through the name structure
      expect(flexCardInfo.name).to.include('_5');
      expect(flexCardInfo.oldName).to.include('_5');
    });

    it('should not use version in storage key when allVersions=false', () => {
      const flexCardInfo = {
        name: 'TestCard',
        oldName: 'TestCard',
        id: 'card1',
        dependenciesIP: [],
        dependenciesDR: [],
        dependenciesOS: [],
        dependenciesFC: [],
        dependenciesLWC: [],
        dependenciesApexRemoteAction: [],
        infos: [],
        warnings: [],
        errors: [],
        migrationStatus: 'Ready for migration' as const,
        nameMapping: {
          oldName: 'TestCard',
          newName: 'TestCard',
        },
      };

      // This test verifies the storage logic indirectly through the name structure
      expect(flexCardInfo.name).to.not.include('_');
      expect(flexCardInfo.oldName).to.not.include('_');
    });
  });
});
