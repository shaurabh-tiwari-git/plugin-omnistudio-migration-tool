/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expect } from 'chai';
import sinon = require('sinon');
import { FlexipageAssessmentReporter } from '../../../src/utils/resultsbuilder/FlexipageAssessmentReporter';
import { FlexiPageAssessmentInfo } from '../../../src/utils/interfaces';
import { OmnistudioOrgDetails } from '../../../src/utils/orgUtils';

describe('FlexipageAssessmentReporter', () => {
  let sandbox: sinon.SinonSandbox;
  let mockFileDiffUtil: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock FileDiffUtil.getDiffHTML
    mockFileDiffUtil = {
      getDiffHTML: sandbox.stub().returns('<div>mock-diff-html</div>'),
    };

    // Stub the FileDiffUtil import
    sandbox
      .stub(require('../../../src/utils/lwcparser/fileutils/FileDiffUtil'), 'FileDiffUtil')
      .value(mockFileDiffUtil);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getFlexipageAssessmentData', () => {
    it('should return correct report structure with all required fields', () => {
      // Arrange
      const mockAssessmentInfos: FlexiPageAssessmentInfo[] = [
        {
          name: 'TestPage1',
          path: '/test/path1',
          diff: 'mock-diff-1',
          errors: [],
          status: 'Can be Automated',
        },
        {
          name: 'TestPage2',
          path: '/test/path2',
          diff: 'mock-diff-2',
          errors: ['Error 1', 'Error 2'],
          status: 'Errors',
        },
      ];

      const mockOrgDetails: OmnistudioOrgDetails = {
        packageDetails: {
          version: '1.0.0',
          namespace: 'test',
        },
        omniStudioOrgPermissionEnabled: true,
        orgDetails: {
          Name: 'Test Org',
          Id: 'test-org-id',
        },
        dataModel: 'Standard',
        hasValidNamespace: true,
      };

      // Act
      const result = FlexipageAssessmentReporter.getFlexipageAssessmentData(mockAssessmentInfos, mockOrgDetails);

      // Assert
      expect(result).to.have.property('title', 'Flexipage Migration Assessment');
      expect(result).to.have.property('heading', 'FlexiPage');
      expect(result).to.have.property('total', 2);
      expect(result).to.have.property('assessmentDate');
      expect(result).to.have.property('org');
      expect(result).to.have.property('filterGroups');
      expect(result).to.have.property('headerGroups');
      expect(result).to.have.property('rows');
      expect(result.rows).to.have.length(2);
    });

    it('should handle empty assessment infos', () => {
      // Arrange
      const mockOrgDetails: OmnistudioOrgDetails = {
        packageDetails: {
          version: '1.0.0',
          namespace: 'test',
        },
        omniStudioOrgPermissionEnabled: true,
        orgDetails: {
          Name: 'Test Org',
          Id: 'test-org-id',
        },
        dataModel: 'Standard',
        hasValidNamespace: true,
      };

      // Act
      const result = FlexipageAssessmentReporter.getFlexipageAssessmentData([], mockOrgDetails);

      // Assert
      expect(result.total).to.equal(0);
      expect(result.rows).to.have.length(0);
    });

    it('should handle undefined assessment infos', () => {
      // Arrange
      const mockOrgDetails: OmnistudioOrgDetails = {
        packageDetails: {
          version: '1.0.0',
          namespace: 'test',
        },
        omniStudioOrgPermissionEnabled: true,
        orgDetails: {
          Name: 'Test Org',
          Id: 'test-org-id',
        },
        dataModel: 'Standard',
        hasValidNamespace: true,
      };

      // Act
      const result = FlexipageAssessmentReporter.getFlexipageAssessmentData(undefined as any, mockOrgDetails);

      // Assert
      expect(result.total).to.equal(0);
      expect(result.rows).to.have.length(0);
    });
  });

  describe('getSummaryData', () => {
    it('should return correct summary counts for different statuses', () => {
      // Arrange
      const mockAssessmentInfos: FlexiPageAssessmentInfo[] = [
        { name: 'Page1', path: '/path1', diff: '', errors: [], status: 'No Changes' },
        { name: 'Page2', path: '/path2', diff: '', errors: [], status: 'Can be Automated' },
        { name: 'Page3', path: '/path3', diff: '', errors: ['Error'], status: 'Errors' },
        { name: 'Page4', path: '/path4', diff: '', errors: [], status: 'No Changes' },
        { name: 'Page5', path: '/path5', diff: '', errors: [], status: 'Can be Automated' },
      ];

      // Act
      const result = FlexipageAssessmentReporter.getSummaryData(mockAssessmentInfos);

      // Assert
      expect(result).to.have.length(2);

      const canBeAutomated = result.find((item) => item.name === 'Can be Automated');
      expect(canBeAutomated).to.exist;
      expect(canBeAutomated.count).to.equal(2);
      expect(canBeAutomated.cssClass).to.equal('text-success');

      const hasErrors = result.find((item) => item.name === 'Has Errors');
      expect(hasErrors).to.exist;
      expect(hasErrors.count).to.equal(1);
      expect(hasErrors.cssClass).to.equal('text-error');
    });

    it('should handle empty assessment infos', () => {
      // Act
      const result = FlexipageAssessmentReporter.getSummaryData([]);

      // Assert
      expect(result).to.have.length(2);
      result.forEach((item) => {
        expect(item.count).to.equal(0);
      });
    });
  });

  describe('getRowsForReport', () => {
    it('should create correct row data with proper formatting', () => {
      // Arrange
      const mockAssessmentInfos: FlexiPageAssessmentInfo[] = [
        {
          name: 'TestPage1',
          path: '/test/path1',
          diff: 'mock-diff-1',
          errors: [],
          status: 'Can be Automated',
        },
        {
          name: 'TestPage2',
          path: '/test/path2',
          diff: 'mock-diff-2',
          errors: ['Error 1', 'Error 2'],
          status: 'Errors',
        },
      ];

      // Act
      const result = (FlexipageAssessmentReporter as any).getRowsForReport(mockAssessmentInfos);

      // Assert
      expect(result).to.have.length(2);

      // Check first row
      expect(result[0].rowId).to.match(/^flexipage-row-data-\d+$/);
      expect(result[0].data).to.have.length(5);
      expect(result[0].data[0].value).to.equal('TestPage1');
      expect(result[0].data[1].value).to.equal('/test/path1');
      expect(result[0].data[2].value).to.equal('Can be Automated');
      expect(result[0].data[2].customClass).to.equal('text-success');
      expect(result[0].data[3].value).to.equal('');
      expect(result[0].data[4].value).to.equal('Has No Errors');

      // Check second row
      expect(result[1].data[0].value).to.equal('TestPage2');
      expect(result[1].data[1].value).to.equal('/test/path2');
      expect(result[1].data[2].value).to.equal('Errors');
      expect(result[1].data[2].customClass).to.equal('text-error');
      expect(result[1].data[4].value).to.equal('Has Errors');
      expect(result[1].data[4].title).to.deep.equal(['Error 1', 'Error 2']);
    });

    it('should handle empty assessment infos', () => {
      // Act
      const result = (FlexipageAssessmentReporter as any).getRowsForReport([]);

      // Assert
      expect(result).to.have.length(0);
    });

    it('should handle undefined assessment infos', () => {
      // Act
      const result = (FlexipageAssessmentReporter as any).getRowsForReport(undefined);

      // Assert
      expect(result).to.have.length(0);
    });

    it('should call FileDiffUtil.getDiffHTML for each assessment info', () => {
      // Arrange
      const mockAssessmentInfos: FlexiPageAssessmentInfo[] = [
        {
          name: 'TestPage1',
          path: '/test/path1',
          diff: 'mock-diff-1',
          errors: [],
          status: 'Can be Automated',
        },
        {
          name: 'TestPage2',
          path: '/test/path2',
          diff: 'mock-diff-2',
          errors: ['Error 1'],
          status: 'Errors',
        },
      ];

      // Act
      (FlexipageAssessmentReporter as any).getRowsForReport(mockAssessmentInfos);

      // Assert
      expect(mockFileDiffUtil.getDiffHTML.calledTwice).to.be.true;
      expect(mockFileDiffUtil.getDiffHTML.firstCall.args).to.deep.equal(['mock-diff-1', 'TestPage1']);
      expect(mockFileDiffUtil.getDiffHTML.secondCall.args).to.deep.equal(['mock-diff-2', 'TestPage2']);
    });
  });

  describe('getHeaderGroupsForReport', () => {
    it('should return correct header structure', () => {
      // Act
      const result = (FlexipageAssessmentReporter as any).getHeaderGroupsForReport();

      // Assert
      expect(result).to.have.length(1);
      expect(result[0].header).to.have.length(5);

      const headers = result[0].header;
      expect(headers[0].name).to.equal('Page Name');
      expect(headers[1].name).to.equal('File Reference');
      expect(headers[2].name).to.equal('Assessment Status');
      expect(headers[3].name).to.equal('Differences');
      expect(headers[4].name).to.equal('Summary');

      headers.forEach((header) => {
        expect(header.colspan).to.equal(1);
        expect(header.rowspan).to.equal(1);
      });
    });
  });

  describe('getFilterGroupsForReport', () => {
    it('should return correct filter options', () => {
      // Act
      const result = (FlexipageAssessmentReporter as any).getFilterGroupsForReport();

      // Assert
      expect(result).to.have.length(2);

      const errorsFilter = result.find((filter) => filter.label === 'Filter by Errors');
      expect(errorsFilter).to.exist;
      expect(errorsFilter.key).to.equal('errors');
      expect(errorsFilter.filters).to.have.length(2);
      expect(errorsFilter.filters[0].label).to.equal('Has Errors');
      expect(errorsFilter.filters[1].label).to.equal('Has No Errors');

      const statusFilter = result.find((filter) => filter.label === 'Filter by Status');
      expect(statusFilter).to.exist;
      expect(statusFilter.key).to.equal('status');
      expect(statusFilter.filters).to.have.length(2);
      expect(statusFilter.filters[0].label).to.equal('Can be Automated');
      expect(statusFilter.filters[1].label).to.equal('Errors');
    });
  });

  describe('row ID generation', () => {
    it('should generate unique row IDs', () => {
      // Arrange
      const mockAssessmentInfos: FlexiPageAssessmentInfo[] = [
        { name: 'Page1', path: '/path1', diff: '', errors: [], status: 'No Changes' },
        { name: 'Page2', path: '/path2', diff: '', errors: [], status: 'Can be Automated' },
        { name: 'Page3', path: '/path3', diff: '', errors: [], status: 'Errors' },
      ];

      // Act
      const result = (FlexipageAssessmentReporter as any).getRowsForReport(mockAssessmentInfos);

      // Assert
      expect(result).to.have.length(3);
      const rowIds = result.map((row) => row.rowId);
      expect(rowIds[0]).to.match(/^flexipage-row-data-\d+$/);
      expect(rowIds[1]).to.match(/^flexipage-row-data-\d+$/);
      expect(rowIds[2]).to.match(/^flexipage-row-data-\d+$/);

      // Row IDs should be unique
      const uniqueRowIds = new Set(rowIds);
      expect(uniqueRowIds.size).to.equal(3);
    });
  });
});
