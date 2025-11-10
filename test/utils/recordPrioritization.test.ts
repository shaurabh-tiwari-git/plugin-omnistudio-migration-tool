import { expect } from 'chai';
import { hasOnlyAlphanumericCharacters, prioritizeCleanNamesFirst } from '../../src/utils/recordPrioritization';

describe('recordPrioritization', () => {
  describe('hasOnlyAlphanumericCharacters', () => {
    it('should return true for names starting with letter and containing only alphanumeric', () => {
      expect(hasOnlyAlphanumericCharacters('Flexcard001')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('Flexcard002')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('Flexcard003')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('MyCard123')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('TestCard')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('A1B2C3')).to.be.true;
    });

    it('should return true for names with only letters', () => {
      expect(hasOnlyAlphanumericCharacters('FlexCard')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('MyCard')).to.be.true;
      expect(hasOnlyAlphanumericCharacters('Test')).to.be.true;
    });

    it('should return false for names starting with numbers', () => {
      expect(hasOnlyAlphanumericCharacters('001Flexcard')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('123Test')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('1Card')).to.be.false;
    });

    it('should return false for names with underscores', () => {
      expect(hasOnlyAlphanumericCharacters('Flexcard_001')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Flexcard_002')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Flexcard_003')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('My_Card')).to.be.false;
    });

    it('should return false for names with hyphens', () => {
      expect(hasOnlyAlphanumericCharacters('Flex-Card')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('My-Card-123')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Test-001')).to.be.false;
    });

    it('should return false for names with spaces', () => {
      expect(hasOnlyAlphanumericCharacters('Flex Card')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('My Card 123')).to.be.false;
    });

    it('should return false for names with special characters', () => {
      expect(hasOnlyAlphanumericCharacters('Flex@Card')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('My#Card')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Test$123')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Card%20')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Test&Card')).to.be.false;
      expect(hasOnlyAlphanumericCharacters('Card(1)')).to.be.false;
    });

    it('should return false for empty strings', () => {
      expect(hasOnlyAlphanumericCharacters('')).to.be.false;
    });
  });

  describe('prioritizeCleanNamesFirst - FlexCard single field', () => {
    it('should prioritize clean alphanumeric names over names with special characters', () => {
      const flexCards = [
        { Name: 'Flexcard_001', Id: '1' },
        { Name: 'Flexcard001', Id: '2' },
        { Name: 'Flexcard_002', Id: '3' },
        { Name: 'Flexcard002', Id: '4' },
        { Name: 'Flexcard_003', Id: '5' },
        { Name: 'Flexcard003', Id: '6' },
      ];

      const result = prioritizeCleanNamesFirst(flexCards, 'Name');

      // Clean names should come first (IDs 2, 4, 6)
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      expect(result[2].Id).to.equal('6');
      // Names with underscores should come after (IDs 1, 3, 5)
      expect(result[3].Id).to.equal('1');
      expect(result[4].Id).to.equal('3');
      expect(result[5].Id).to.equal('5');
    });

    it('should maintain original order within each priority group', () => {
      const flexCards = [
        { Name: 'Alpha001', Id: '1' },
        { Name: 'Beta002', Id: '2' },
        { Name: 'Gamma003', Id: '3' },
      ];

      const result = prioritizeCleanNamesFirst(flexCards, 'Name');

      // All are clean, so order should be maintained
      expect(result[0].Id).to.equal('1');
      expect(result[1].Id).to.equal('2');
      expect(result[2].Id).to.equal('3');
    });

    it('should handle names starting with numbers', () => {
      const flexCards = [
        { Name: '001Card', Id: '1' }, // starts with number
        { Name: 'Card001', Id: '2' }, // clean
        { Name: '123Test', Id: '3' }, // starts with number
        { Name: 'Test123', Id: '4' }, // clean
      ];

      const result = prioritizeCleanNamesFirst(flexCards, 'Name');

      // Clean names first
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      // Names starting with numbers after
      expect(result[2].Id).to.equal('1');
      expect(result[3].Id).to.equal('3');
    });

    it('should handle various ASCII special characters', () => {
      const flexCards = [
        { Name: 'Card@Test', Id: '1' }, // @ symbol
        { Name: 'CardTest', Id: '2' }, // clean
        { Name: 'Card#123', Id: '3' }, // # symbol
        { Name: 'Card123', Id: '4' }, // clean
        { Name: 'Card$Money', Id: '5' }, // $ symbol
        { Name: 'CardMoney', Id: '6' }, // clean
        { Name: 'Card%20', Id: '7' }, // % symbol
        { Name: 'Card20', Id: '8' }, // clean
        { Name: 'Card&More', Id: '9' }, // & symbol
        { Name: 'CardMore', Id: '10' }, // clean
        { Name: 'Card(1)', Id: '11' }, // parentheses
        { Name: 'Card1', Id: '12' }, // clean
      ];

      const result = prioritizeCleanNamesFirst(flexCards, 'Name');

      // First 6 should be clean names (IDs 2, 4, 6, 8, 10, 12)
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      expect(result[2].Id).to.equal('6');
      expect(result[3].Id).to.equal('8');
      expect(result[4].Id).to.equal('10');
      expect(result[5].Id).to.equal('12');

      // Remaining should be names with special characters (IDs 1, 3, 5, 7, 9, 11)
      expect(result[6].Id).to.equal('1');
      expect(result[7].Id).to.equal('3');
      expect(result[8].Id).to.equal('5');
      expect(result[9].Id).to.equal('7');
      expect(result[10].Id).to.equal('9');
      expect(result[11].Id).to.equal('11');
    });

    it('should handle mixed case letters', () => {
      const flexCards = [
        { Name: 'FLEXCARD001', Id: '1' },
        { Name: 'flexcard002', Id: '2' },
        { Name: 'FlExCaRd003', Id: '3' },
        { Name: 'Flexcard_004', Id: '4' },
      ];

      const result = prioritizeCleanNamesFirst(flexCards, 'Name');

      // First 3 are clean (all caps variations)
      expect(result[0].Id).to.equal('1');
      expect(result[1].Id).to.equal('2');
      expect(result[2].Id).to.equal('3');
      // Last one has special character
      expect(result[3].Id).to.equal('4');
    });
  });

  describe('prioritizeCleanNamesFirst - OmniScript multiple fields', () => {
    it('should prioritize when both Type and SubType are clean', () => {
      /* eslint-disable camelcase */
      const omniScripts = [
        { Type__c: 'My-Type', SubType__c: 'Test', Id: '1' }, // Type has hyphen
        { Type__c: 'MyType', SubType__c: 'Test', Id: '2' }, // both clean
        { Type__c: 'MyType', SubType__c: 'Test-Sub', Id: '3' }, // SubType has hyphen
        { Type__c: 'MyType', SubType__c: 'TestSub', Id: '4' }, // both clean
      ];
      /* eslint-enable camelcase */

      const result = prioritizeCleanNamesFirst(omniScripts, ['Type__c', 'SubType__c']);

      // Only IDs 2 and 4 have both fields clean
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      // IDs 1 and 3 have special characters
      expect(result[2].Id).to.equal('1');
      expect(result[3].Id).to.equal('3');
    });

    it('should require ALL fields to be clean for prioritization', () => {
      /* eslint-disable camelcase */
      const omniScripts = [
        { Type__c: 'Type001', SubType__c: 'Sub_001', Id: '1' }, // Type clean, SubType not
        { Type__c: 'Type002', SubType__c: 'Sub002', Id: '2' }, // both clean
        { Type__c: 'Type_003', SubType__c: 'Sub003', Id: '3' }, // Type not, SubType clean
        { Type__c: 'Type004', SubType__c: 'Sub004', Id: '4' }, // both clean
      ];
      /* eslint-enable camelcase */

      const result = prioritizeCleanNamesFirst(omniScripts, ['Type__c', 'SubType__c']);

      // Only IDs 2 and 4 have BOTH fields clean
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      // IDs 1 and 3 have at least one field with special characters
      expect(result[2].Id).to.equal('1');
      expect(result[3].Id).to.equal('3');
    });

    it('should handle numbers in Type and SubType fields', () => {
      /* eslint-disable camelcase */
      const omniScripts = [
        { Type__c: '001Type', SubType__c: 'Sub001', Id: '1' }, // Type starts with number
        { Type__c: 'Type001', SubType__c: 'Sub001', Id: '2' }, // both clean
        { Type__c: 'Type002', SubType__c: '002Sub', Id: '3' }, // SubType starts with number
        { Type__c: 'Type003', SubType__c: 'Sub003', Id: '4' }, // both clean
      ];
      /* eslint-enable camelcase */

      const result = prioritizeCleanNamesFirst(omniScripts, ['Type__c', 'SubType__c']);

      // Only IDs 2 and 4 have both fields starting with letters
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      // IDs 1 and 3 have at least one field starting with number
      expect(result[2].Id).to.equal('1');
      expect(result[3].Id).to.equal('3');
    });
  });

  describe('prioritizeCleanNamesFirst - DataRaptor single field', () => {
    it('should handle DataRaptor names with various patterns', () => {
      const dataRaptors = [
        { Name: 'DR-Extract-001', Id: '1' }, // hyphens
        { Name: 'DRExtract001', Id: '2' }, // clean
        { Name: 'DR_Transform_002', Id: '3' }, // underscores
        { Name: 'DRTransform002', Id: '4' }, // clean
        { Name: '001_Load', Id: '5' }, // starts with number + underscore
        { Name: 'Load001', Id: '6' }, // clean
      ];

      const result = prioritizeCleanNamesFirst(dataRaptors, 'Name');

      // Clean names first (IDs 2, 4, 6)
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      expect(result[2].Id).to.equal('6');
      // Names with special characters after (IDs 1, 3, 5)
      expect(result[3].Id).to.equal('1');
      expect(result[4].Id).to.equal('3');
      expect(result[5].Id).to.equal('5');
    });
  });

  describe('prioritizeCleanNamesFirst - Edge cases', () => {
    it('should handle empty array', () => {
      const result = prioritizeCleanNamesFirst([], 'Name');
      expect(result).to.deep.equal([]);
    });

    it('should handle all clean names', () => {
      const records = [
        { Name: 'Card001', Id: '1' },
        { Name: 'Card002', Id: '2' },
        { Name: 'Card003', Id: '3' },
      ];

      const result = prioritizeCleanNamesFirst(records, 'Name');

      // Order should be maintained
      expect(result[0].Id).to.equal('1');
      expect(result[1].Id).to.equal('2');
      expect(result[2].Id).to.equal('3');
    });

    it('should handle all names with special characters', () => {
      const records = [
        { Name: 'Card-001', Id: '1' },
        { Name: 'Card_002', Id: '2' },
        { Name: '003-Card', Id: '3' },
      ];

      const result = prioritizeCleanNamesFirst(records, 'Name');

      // Order should be maintained (all in second bucket)
      expect(result[0].Id).to.equal('1');
      expect(result[1].Id).to.equal('2');
      expect(result[2].Id).to.equal('3');
    });

    it('should handle missing or empty field values', () => {
      const records = [
        { Name: '', Id: '1' }, // empty name
        { Name: 'ValidCard', Id: '2' }, // valid
        { OtherField: 'test', Id: '3' }, // missing Name field
        { Name: 'Card123', Id: '4' }, // valid
      ];

      const result = prioritizeCleanNamesFirst(records, 'Name');

      // Valid names first (IDs 2, 4)
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      // Invalid/empty names after (IDs 1, 3)
      expect(result[2].Id).to.equal('1');
      expect(result[3].Id).to.equal('3');
    });

    it('should handle version numbers in realistic scenario', () => {
      /* eslint-disable camelcase */
      const flexCards = [
        { Name: 'CustomerCard', Version__c: 1, Id: '1' },
        { Name: 'Customer-Card', Version__c: 1, Id: '2' },
        { Name: 'CustomerCard', Version__c: 2, Id: '3' },
        { Name: 'Customer-Card', Version__c: 2, Id: '4' },
        { Name: 'CustomerCard', Version__c: 3, Id: '5' },
        { Name: 'Customer-Card', Version__c: 3, Id: '6' },
      ];
      /* eslint-enable camelcase */

      const result = prioritizeCleanNamesFirst(flexCards, 'Name');

      // Clean names first (versions 1, 2, 3 of CustomerCard)
      expect(result[0].Id).to.equal('1');
      expect(result[1].Id).to.equal('3');
      expect(result[2].Id).to.equal('5');
      // Names with hyphens after (versions 1, 2, 3 of Customer-Card)
      expect(result[3].Id).to.equal('2');
      expect(result[4].Id).to.equal('4');
      expect(result[5].Id).to.equal('6');
    });
  });

  describe('prioritizeCleanNamesFirst - Unicode and extended ASCII', () => {
    it('should reject names with Unicode characters', () => {
      const records = [
        { Name: 'CardÄÖÜ', Id: '1' }, // German umlauts
        { Name: 'CardTest', Id: '2' }, // clean
        { Name: 'Card日本', Id: '3' }, // Japanese characters
        { Name: 'CardABC', Id: '4' }, // clean
        { Name: 'Carděšč', Id: '5' }, // Czech characters
        { Name: 'CardDEF', Id: '6' }, // clean
      ];

      const result = prioritizeCleanNamesFirst(records, 'Name');

      // Only clean ASCII alphanumeric names first
      expect(result[0].Id).to.equal('2');
      expect(result[1].Id).to.equal('4');
      expect(result[2].Id).to.equal('6');
      // Unicode names after
      expect(result[3].Id).to.equal('1');
      expect(result[4].Id).to.equal('3');
      expect(result[5].Id).to.equal('5');
    });
  });
});
