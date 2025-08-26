/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, camelcase, comma-dangle */
import { expect } from 'chai';
import { CardMigrationTool } from '../../../src/migration/flexcard';
import { NameMappingRegistry } from '../../../src/migration/NameMappingRegistry';
import CardMappings from '../../../src/mappings/VlocityCard';

describe('FlexCard Community Targets Functionality', () => {
  let cardTool: CardMigrationTool;
  let nameRegistry: NameMappingRegistry;
  let mockConnection: any;
  let mockMessages: any;
  let mockUx: any;
  let mockLogger: any;

  beforeEach(() => {
    nameRegistry = NameMappingRegistry.getInstance();
    nameRegistry.clear();

    // Use simple mock objects instead of Sinon stubs to avoid conflicts
    mockConnection = {};
    mockMessages = {
      getMessage: () => 'Mock message for testing',
    };
    mockUx = {};
    mockLogger = {};

    cardTool = new CardMigrationTool('vlocity_ins', mockConnection, mockLogger, mockMessages, mockUx, false);
  });

  describe('ensureCommunityTargets', () => {
    it('should add community targets when xmlObject.targets does not exist', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            // No targets property
          },
        }),
      };

      // Call the private method via type assertion
      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject.targets).to.exist;
      expect(updatedDefinition.xmlObject.targets.target).to.be.an('array');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });

    it('should add community targets when targets exist but are empty', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            targets: {
              target: [],
            },
          },
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject.targets.target).to.have.length(2);
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });

    it('should add missing community targets when some targets already exist', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            targets: {
              target: ['lightning__AppPage', 'lightningCommunity__Page'],
            },
          },
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject.targets.target).to.have.length(3);
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightning__AppPage');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });

    it('should not add duplicate community targets when they already exist', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            targets: {
              target: ['lightningCommunity__Page', 'lightningCommunity__Default', 'lightning__AppPage'],
            },
          },
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject.targets.target).to.have.length(3);
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightning__AppPage');
    });

    it('should convert non-array target to array and add community targets', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            targets: {
              target: 'lightning__AppPage', // Single string instead of array
            },
          },
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject.targets.target).to.be.an('array');
      expect(updatedDefinition.xmlObject.targets.target).to.have.length(3);
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightning__AppPage');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });

    it('should handle empty definition gracefully', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: '{}',
      };

      // Should not throw an error
      expect(() => {
        (cardTool as any).ensureCommunityTargets(mappedObject);
      }).to.not.throw();

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition).to.deep.equal({});
    });

    it('should handle missing definition gracefully', () => {
      const mappedObject = {};

      // Should not throw an error
      expect(() => {
        (cardTool as any).ensureCommunityTargets(mappedObject);
      }).to.not.throw();
    });

    it('should handle definition without xmlObject gracefully', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          someOtherProperty: 'value',
          // No xmlObject
        }),
      };

      // Should not throw an error
      expect(() => {
        (cardTool as any).ensureCommunityTargets(mappedObject);
      }).to.not.throw();

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.someOtherProperty).to.equal('value');
      expect(updatedDefinition.xmlObject).to.be.undefined;
    });

    it('should handle null xmlObject gracefully', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: null,
        }),
      };

      // Should not throw an error
      expect(() => {
        (cardTool as any).ensureCommunityTargets(mappedObject);
      }).to.not.throw();

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject).to.be.null;
    });

    it('should preserve existing properties while adding community targets', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            apiVersion: '55.0',
            isExposed: true,
            targets: {
              target: ['lightning__AppPage'],
            },
            masterLabel: 'Test Card',
          },
          otherProperty: 'preserved',
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      expect(updatedDefinition.xmlObject.apiVersion).to.equal('55.0');
      expect(updatedDefinition.xmlObject.isExposed).to.be.true;
      expect(updatedDefinition.xmlObject.masterLabel).to.equal('Test Card');
      expect(updatedDefinition.otherProperty).to.equal('preserved');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightning__AppPage');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });

    it('should handle malformed JSON gracefully', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: 'invalid json {',
      };

      // Should throw an error due to JSON.parse, but not crash the application
      expect(() => {
        (cardTool as any).ensureCommunityTargets(mappedObject);
      }).to.throw();
    });

    it('should verify both required community targets are added', () => {
      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            targets: {
              target: [],
            },
          },
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);
      const requiredTargets = ['lightningCommunity__Page', 'lightningCommunity__Default'];

      requiredTargets.forEach((target) => {
        expect(updatedDefinition.xmlObject.targets.target).to.include(target);
      });

      expect(updatedDefinition.xmlObject.targets.target).to.have.length(2);
    });

    it('should handle complex existing target arrays', () => {
      const existingTargets = [
        'lightning__AppPage',
        'lightning__HomePage',
        'lightning__RecordPage',
        'lightningCommunity__Page', // Already exists
      ];

      const mappedObject = {
        [CardMappings.Definition__c]: JSON.stringify({
          xmlObject: {
            targets: {
              target: [...existingTargets],
            },
          },
        }),
      };

      (cardTool as any).ensureCommunityTargets(mappedObject);

      const updatedDefinition = JSON.parse(mappedObject[CardMappings.Definition__c]);

      // Should have all original targets plus the missing community target
      expect(updatedDefinition.xmlObject.targets.target).to.have.length(5);
      existingTargets.forEach((target) => {
        expect(updatedDefinition.xmlObject.targets.target).to.include(target);
      });
      expect(updatedDefinition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });
  });

  describe('Integration with mapVlocityCardRecord', () => {
    it('should ensure community targets are added during card mapping', () => {
      const testCard: any = {
        Id: 'card1',
        Name: 'Test Card',
        vlocity_ins__Definition__c: JSON.stringify({
          xmlObject: {
            targets: {
              target: ['lightning__AppPage'],
            },
          },
        }),
      };

      const result = (cardTool as any).mapVlocityCardRecord(testCard, new Map(), new Map());
      const definition = JSON.parse(result['PropertySetConfig']);

      expect(definition.xmlObject.targets.target).to.include('lightning__AppPage');
      expect(definition.xmlObject.targets.target).to.include('lightningCommunity__Page');
      expect(definition.xmlObject.targets.target).to.include('lightningCommunity__Default');
    });

    it('should handle cards without xmlObject during mapping', () => {
      const testCard: any = {
        Id: 'card1',
        Name: 'Test Card',
        vlocity_ins__Definition__c: JSON.stringify({
          someProperty: 'value',
        }),
      };

      // Should not throw an error
      expect(() => {
        (cardTool as any).mapVlocityCardRecord(testCard, new Map(), new Map());
      }).to.not.throw();

      const result = (cardTool as any).mapVlocityCardRecord(testCard, new Map(), new Map());
      const definition = JSON.parse(result['PropertySetConfig']);

      expect(definition.someProperty).to.equal('value');
    });
  });
});
