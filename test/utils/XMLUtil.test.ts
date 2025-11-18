import { expect } from 'chai';
import isEqual from 'lodash/isEqual.js';
import { XMLUtil } from '../../src/utils/XMLUtil';
import { FlexiPageRegion } from '../../src/migration/interfaces';

describe('XMLUtil', () => {
  let xmlUtil: XMLUtil;

  beforeEach(() => {
    xmlUtil = new XMLUtil();
  });

  describe('constructor', () => {
    it('should create instance with default alwaysArray', () => {
      const util = new XMLUtil();
      expect(util).to.be.instanceOf(XMLUtil);
    });

    it('should create instance with custom alwaysArray', () => {
      const customArray = ['customElement', 'anotherElement'];
      const util = new XMLUtil(customArray);
      expect(util).to.be.instanceOf(XMLUtil);
    });
  });

  describe('parse', () => {
    it('should parse simple XML to JSON', () => {
      const xmlString = '<root><name>test</name><value>123</value></root>';
      const result = xmlUtil.parse(xmlString);

      // expect(result).to.deep.equal({
      //   name: 'test',
      //   value: '123',
      // });

      expect(
        isEqual(result, {
          name: 'test',
          value: '123',
        })
      ).to.be.true;
    });

    it('should parse XML with attributes', () => {
      const xmlString = '<root id="1" type="test"><name>value</name></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          '@attributes': {
            id: '1',
            type: 'test',
          },
          name: 'value',
        })
      ).to.be.true;
    });

    it('should parse XML with nested elements', () => {
      const xmlString = '<root><parent><child>value</child></parent></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          parent: {
            child: 'value',
          },
        })
      ).to.be.true;
    });

    it('should parse XML with multiple children of same type', () => {
      const xmlString = '<root><item>first</item><item>second</item></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          item: ['first', 'second'],
        })
      ).to.be.true;
    });

    it('should parse XML with text content and elements', () => {
      const xmlString = '<root>Some text<element>value</element>More text</root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          element: 'value',
        })
      ).to.be.true;
    });

    it('should handle empty elements', () => {
      const xmlString = '<root><empty></empty></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          empty: {},
        })
      ).to.be.true;
    });

    it('should handle self-closing elements', () => {
      const xmlString = '<root><selfClosing /></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          selfClosing: {},
        })
      ).to.be.true;
    });

    it('should throw for invalid xml', () => {
      const invalidXml = '<root><unclosed>';

      // xmldom to throw error for mismatched tags after package update to @xmldom/xmldom.
      expect(() => {
        xmlUtil.parse(invalidXml);
      }).to.throw();
    });
  });

  describe('build', () => {
    it('should build simple JSON to XML', () => {
      const jsonObject = {
        name: 'test',
        value: '123',
      };
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).to.include('<root>');
      expect(result).to.include('<name>test</name>');
      expect(result).to.include('<value>123</value>');
      expect(result).to.include('</root>');
    });

    it('should build XML with attributes', () => {
      const jsonObject = {
        '@attributes': {
          id: '1',
          type: 'test',
        },
        name: 'value',
      };
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('id="1"');
      expect(result).to.include('type="test"');
      expect(result).to.include('<name>value</name>');
    });

    it('should build XML with nested objects', () => {
      const jsonObject = {
        parent: {
          child: 'value',
        },
      };
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('<parent>');
      expect(result).to.include('<child>value</child>');
      expect(result).to.include('</parent>');
    });

    it('should build XML with arrays', () => {
      const jsonObject = {
        items: [{ name: 'first' }, { name: 'second' }],
      };
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('<items>');
      expect(result).to.include('<name>first</name>');
      expect(result).to.include('<name>second</name>');
      expect(result).to.include('</items>');
    });

    it('should build XML with custom root element', () => {
      const jsonObject = { name: 'test' };
      const result = xmlUtil.build(jsonObject, 'customRoot');

      expect(result).to.include('<customRoot>');
      expect(result).to.include('</customRoot>');
    });

    it('should handle null and undefined values', () => {
      const jsonObject = {
        valid: 'value',
        nullValue: null,
        undefinedValue: undefined,
      };
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('<valid>value</valid>');
      expect(result).not.to.include('<nullValue>');
      expect(result).not.to.include('<undefinedValue>');
    });

    it('should handle empty objects', () => {
      const jsonObject = {};
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).to.include('<root/>');
    });

    it('should handle primitive values', () => {
      const jsonObject = 'simple string';
      const result = xmlUtil.build(jsonObject, 'root');

      expect(result).to.include('<root>simple string</root>');
    });
  });

  describe('prettyPrintXml', () => {
    it('should format XML with proper indentation', () => {
      const result = xmlUtil.build({ name: 'test', children: { child: 'value' } }, 'root');

      // Check that indentation is applied
      const lines = result.split('\r\n');
      expect(lines[0]).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(lines[0]).to.include('<root>');
      expect(lines[1]).to.match(/^\s{4}<name>test<\/name>$/);
      expect(lines[2]).to.match(/^\s{4}<children>$/);
      expect(lines[3]).to.match(/^\s{8}<child>value<\/child>$/);
      expect(lines[4]).to.match(/^\s{4}<\/children>$/);
      expect(lines[5]).to.equal('</root>');
    });

    it('should handle self-closing tags correctly', () => {
      const result = xmlUtil.build({ selfClosing: '', name: 'test' }, 'root');

      const lines = result.split('\r\n');
      expect(lines[1]).to.match(/^\s{4}<selfClosing>$/);
      expect(lines[2]).to.match(/^\s{4}<\/selfClosing>$/);
      expect(lines[3]).to.match(/^\s{4}<name>test<\/name>$/);
    });

    it('should handle nested structures with proper indentation', () => {
      const jsonObject = {
        level1: {
          level2: {
            level3: 'value',
          },
        },
      };
      const result = xmlUtil.build(jsonObject, 'root');

      const lines = result.split('\r\n');
      expect(lines[0]).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(lines[0]).to.include('<root>');
      expect(lines[1]).to.match(/^\s{4}<level1>$/);
      expect(lines[2]).to.match(/^\s{8}<level2>$/);
      expect(lines[3]).to.match(/^\s{12}<level3>value<\/level3>$/);
      expect(lines[4]).to.match(/^\s{8}<\/level2>$/);
      expect(lines[5]).to.match(/^\s{4}<\/level1>$/);
      expect(lines[6]).to.equal('</root>');
    });

    it('should handle arrays with proper indentation', () => {
      const jsonObject = {
        items: [{ name: 'first' }, { name: 'second' }],
      };
      const result = xmlUtil.build(jsonObject, 'root');

      const lines = result.split('\r\n');
      expect(lines[0]).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(lines[0]).to.include('<root>');
      expect(lines[1]).to.match(/^\s{4}<items>$/);
      expect(lines[2]).to.match(/^\s{8}<name>first<\/name>$/);
      expect(lines[3]).to.match(/^\s{4}<\/items>$/);
      expect(lines[4]).to.match(/^\s{4}<items>$/);
      expect(lines[5]).to.match(/^\s{8}<name>second<\/name>$/);
      expect(lines[6]).to.match(/^\s{4}<\/items>$/);
      expect(lines[7]).to.equal('</root>');
    });
  });

  describe('alwaysArray functionality', () => {
    it('should treat specified elements as arrays even when single', () => {
      const customArray = ['flexiPageRegions', 'itemInstances'];
      const util = new XMLUtil(customArray);

      const xmlString = '<root><flexiPageRegions><region>test</region></flexiPageRegions></root>';
      const result = util.parse(xmlString) as { flexiPageRegions: FlexiPageRegion[] };

      expect(result.flexiPageRegions).to.be.an('array');
      expect(result.flexiPageRegions).to.have.length(1);
      expect(
        isEqual(result.flexiPageRegions[0], {
          region: 'test',
        })
      ).to.be.true;
    });

    it('should handle multiple elements in alwaysArray fields', () => {
      const customArray = ['flexiPageRegions'];
      const util = new XMLUtil(customArray);

      const xmlString =
        '<root><flexiPageRegions><region>first</region></flexiPageRegions><flexiPageRegions><region>second</region></flexiPageRegions></root>';
      const result = util.parse(xmlString) as { flexiPageRegions: FlexiPageRegion[] };

      expect(result.flexiPageRegions).to.be.an('array');
      expect(result.flexiPageRegions).to.have.length(2);
      expect(isEqual(result.flexiPageRegions[0], { region: 'first' })).to.be.true;
      expect(isEqual(result.flexiPageRegions[1], { region: 'second' })).to.be.true;
    });
  });

  describe('round-trip functionality', () => {
    it('should maintain data integrity through parse and build cycle', () => {
      const originalJson = {
        '@attributes': { id: '1', type: 'test' },
        name: 'test',
        children: [{ child: 'first' }, { child: 'second' }],
        nested: {
          deep: {
            value: 'nested value',
          },
        },
      };

      const xml = xmlUtil.build(originalJson, 'root');
      const parsed = xmlUtil.parse(xml);

      expect(isEqual(parsed, originalJson)).to.be.true;
    });

    it('should handle complex nested structures', () => {
      const originalJson = {
        level1: {
          '@attributes': { attr1: 'value1' },
          level2: {
            level3: [{ item: 'first' }, { item: 'second' }],
          },
        },
      };

      const xml = xmlUtil.build(originalJson, 'root');
      const parsed = xmlUtil.parse(xml);

      expect(isEqual(parsed, originalJson)).to.be.true;
    });
  });

  describe('edge cases', () => {
    it('should handle XML with only attributes', () => {
      const xmlString = '<root id="1" type="test"></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          '@attributes': {
            id: '1',
            type: 'test',
          },
        })
      ).to.be.true;
    });

    it('should handle XML with mixed content', () => {
      const xmlString = '<root>Text before<element>value</element>Text after</root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          element: 'value',
        })
      ).to.be.true;
    });

    it('should handle empty XML', () => {
      const xmlString = '<root></root>';
      const result = xmlUtil.parse(xmlString);

      expect(isEqual(result, {})).to.be.true;
    });

    it('should handle XML with special characters', () => {
      const xmlString = '<root><name>&lt;test&gt;</name><value>123 &amp; 456</value></root>';
      const result = xmlUtil.parse(xmlString);

      expect(
        isEqual(result, {
          name: '<test>',
          value: '123 & 456',
        })
      ).to.be.true;
    });
  });
});
