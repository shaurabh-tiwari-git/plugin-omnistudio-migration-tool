import { expect } from 'chai';
import sinon from 'sinon';
import {
  createRowDataParam,
  getOrgDetailsForReport,
  createFilterGroupParam,
  getAssessmentReportNameHeaders,
} from '../../../src/utils/reportGenerator/reportUtil';
import { OmnistudioOrgDetails } from '../../../src/utils/orgUtils';
import * as dataModelService from '../../../src/utils/dataModelService';

describe('reportUtil', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createRowDataParam', () => {
    it('should create basic row data param without escaping', () => {
      const result = createRowDataParam('testKey', 'testValue', true, 1, 1, false);

      expect(result).to.deep.equal({
        key: 'testKey',
        value: 'testValue',
        title: 'testValue',
        searchable: true,
        rowspan: 1,
        colspan: 1,
        isHref: false,
        uri: undefined,
        customClass: '',
      });
    });

    it('should escape HTML content when escapeHtmlContent is true', () => {
      const htmlContent = '<script>alert("XSS")</script>';
      const result = createRowDataParam('testKey', htmlContent, true, 1, 1, false, undefined, undefined, '', true);

      expect(result.value).to.equal('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(result.title).to.equal('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should not escape HTML content when escapeHtmlContent is false or undefined', () => {
      const htmlContent = '<div>Test</div>';
      const result1 = createRowDataParam('testKey', htmlContent, true, 1, 1, false, undefined, undefined, '', false);
      const result2 = createRowDataParam('testKey', htmlContent, true, 1, 1, false);

      expect(result1.value).to.equal('<div>Test</div>');
      expect(result2.value).to.equal('<div>Test</div>');
    });

    it('should handle special characters with escaping', () => {
      const specialChars = '< > & " \'';
      const result = createRowDataParam('testKey', specialChars, true, 1, 1, false, undefined, undefined, '', true);

      // Verify all special characters are escaped (library-independent)
      expect(result.value).to.include('&lt;'); // < is escaped
      expect(result.value).to.include('&gt;'); // > is escaped
      expect(result.value).to.include('&amp;'); // & is escaped
      expect(result.value).to.include('&quot;'); // " is escaped
      // Single quote can be &#39; (decimal) or &#x27; (hexadecimal) - both are valid
      expect(result.value).to.match(/&#(39|x27);/); // ' is escaped in either format

      // Verify NO unescaped characters remain
      expect(result.value).to.not.match(/<(?!\/|!)/); // No unescaped <
      expect(result.value).to.not.match(/(?<!&)>/); // No unescaped >
      expect(result.value).to.not.include('&"'); // No unescaped & followed by "
    });

    it('should use custom title when provided as string', () => {
      const result = createRowDataParam('testKey', 'value', true, 1, 1, false, undefined, 'Custom Title');

      expect(result.title).to.equal('Custom Title');
      expect(result.value).to.equal('value');
    });

    it('should filter and use title array when provided', () => {
      const titleArray = ['Title 1', '  ', 'Title 2', '', 'Title 3'];
      const result = createRowDataParam('testKey', 'value', true, 1, 1, false, undefined, titleArray);

      expect(result.title).to.deep.equal(['Title 1', 'Title 2', 'Title 3']);
    });

    it('should escape title when escapeHtmlContent is true and title is not provided', () => {
      const htmlValue = '<b>Bold</b>';
      const result = createRowDataParam('testKey', htmlValue, true, 1, 1, false, undefined, undefined, '', true);

      expect(result.title).to.equal('&lt;b&gt;Bold&lt;/b&gt;');
    });

    it('should handle href with uri', () => {
      const result = createRowDataParam('testKey', 'Click here', true, 1, 1, true, 'https://example.com', 'Link Title');

      expect(result.isHref).to.be.true;
      expect(result.uri).to.equal('https://example.com');
      expect(result.title).to.equal('Link Title');
    });

    it('should set custom class when provided', () => {
      const result = createRowDataParam('testKey', 'value', true, 1, 1, false, undefined, undefined, 'custom-class');

      expect(result.customClass).to.equal('custom-class');
    });

    it('should handle empty string values', () => {
      const result = createRowDataParam('testKey', '', true, 1, 1, false);

      expect(result.value).to.equal('');
      expect(result.title).to.equal('');
    });

    it('should handle rowspan and colspan correctly', () => {
      const result = createRowDataParam('testKey', 'value', true, 3, 2, false);

      expect(result.rowspan).to.equal(3);
      expect(result.colspan).to.equal(2);
    });

    it('should escape complex HTML with nested tags', () => {
      const complexHtml = '<div class="container"><span onclick="malicious()">Text</span></div>';
      const result = createRowDataParam('testKey', complexHtml, true, 1, 1, false, undefined, undefined, '', true);

      expect(result.value).to.include('&lt;div');
      expect(result.value).to.include('&gt;');
      expect(result.value).to.not.include('<div');
    });

    it('should handle title array with escaping when custom title is provided', () => {
      const htmlTitle = '<script>alert("test")</script>';
      const result = createRowDataParam('testKey', 'value', true, 1, 1, false, undefined, htmlTitle, '', false);

      // Title should not be escaped because escapeHtmlContent is false
      expect(result.title).to.equal('<script>alert("test")</script>');
    });

    it('should handle empty title array', () => {
      const result = createRowDataParam('testKey', 'value', true, 1, 1, false, undefined, ['', '  ', '   ']);

      expect(result.title).to.deep.equal([]);
    });

    it('should handle null and undefined values gracefully with escaping', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = createRowDataParam('testKey', null as any, true, 1, 1, false, undefined, undefined, '', true);

      // When escapeHtml is applied to null, it becomes empty string
      expect(result.value).to.equal('');
    });
  });

  describe('getOrgDetailsForReport', () => {
    it('should extract and return org details correctly', () => {
      const omnistudioOrgDetails: OmnistudioOrgDetails = {
        orgDetails: {
          Name: 'Test Org',
          Id: '00D123456789ABC',
        },
        packageDetails: {
          namespace: 'testns',
        },
        dataModel: 'Standard',
      } as OmnistudioOrgDetails;

      const result = getOrgDetailsForReport(omnistudioOrgDetails);

      expect(result).to.deep.equal({
        name: 'Test Org',
        id: '00D123456789ABC',
        namespace: 'testns',
        dataModel: 'Standard',
      });
    });

    it('should handle empty namespace', () => {
      const omnistudioOrgDetails: OmnistudioOrgDetails = {
        orgDetails: {
          Name: 'Test Org',
          Id: '00D123456789ABC',
        },
        packageDetails: {
          namespace: '',
        },
        dataModel: 'Custom',
      } as OmnistudioOrgDetails;

      const result = getOrgDetailsForReport(omnistudioOrgDetails);

      expect(result.namespace).to.equal('');
      expect(result.dataModel).to.equal('Custom');
    });
  });

  describe('createFilterGroupParam', () => {
    it('should create filter group with single filter', () => {
      const result = createFilterGroupParam('Status', 'status', ['Active']);

      expect(result).to.deep.equal({
        label: 'Status',
        key: 'status',
        filters: [{ label: 'Active' }],
      });
    });

    it('should create filter group with multiple filters', () => {
      const result = createFilterGroupParam('Type', 'type', ['DataRaptor', 'OmniScript', 'FlexCard']);

      expect(result).to.deep.equal({
        label: 'Type',
        key: 'type',
        filters: [{ label: 'DataRaptor' }, { label: 'OmniScript' }, { label: 'FlexCard' }],
      });
    });

    it('should handle empty filter array', () => {
      const result = createFilterGroupParam('Empty', 'empty', []);

      expect(result).to.deep.equal({
        label: 'Empty',
        key: 'empty',
        filters: [],
      });
    });

    it('should handle filter labels with special characters', () => {
      const result = createFilterGroupParam('Status', 'status', [
        'Ready <for> migration',
        'Needs "Manual" Intervention',
      ]);

      expect(result.filters).to.have.lengthOf(2);
      expect(result.filters[0].label).to.equal('Ready <for> migration');
      expect(result.filters[1].label).to.equal('Needs "Manual" Intervention');
    });
  });

  describe('getAssessmentReportNameHeaders', () => {
    it('should return standard headers when in standard data model', () => {
      sandbox.stub(dataModelService, 'isStandardDataModel').returns(true);

      const result = getAssessmentReportNameHeaders();

      expect(result).to.deep.equal([{ name: 'Standard', colspan: 3, rowspan: 1 }]);
    });

    it('should return managed package and standard headers when not in standard data model', () => {
      sandbox.stub(dataModelService, 'isStandardDataModel').returns(false);

      const result = getAssessmentReportNameHeaders();

      expect(result).to.deep.equal([
        { name: 'Managed Package', colspan: 2, rowspan: 1 },
        { name: 'Standard', colspan: 1, rowspan: 1 },
      ]);
    });
  });
});
