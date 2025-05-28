import { describe, expect, it } from '@jest/globals';
import { DRAssessmentReporter } from '../DRAssessmentReporter';
import { DataRaptorAssessmentInfo } from '../../interfaces';
import { ReportHeader } from '../../reportGenerator/reportInterfaces';

describe('DRAssessmentReporter', () => {
  const mockInstanceUrl = 'https://test.salesforce.com';
  const mockOrg: ReportHeader[] = [
    { key: 'orgId', value: 'test-org-id' },
    { key: 'orgName', value: 'Test Org' },
  ];

  const mockData: DataRaptorAssessmentInfo[] = [
    {
      oldName: 'TravelersInsuranceCreateQuotePolicyJson-OS',
      name: 'TravelersInsuranceCreateQuotePolicyJsonOS',
      id: 'a1dWs000001F1HxIAK',
      type: 'Transform',
      formulaChanges: [],
      infos: [],
      warnings: [
        'name will be changed from TravelersInsuranceCreateQuotePolicyJson-OS to TravelersInsuranceCreateQuotePolicyJsonOS',
      ],
      apexDependencies: [],
    },
    {
      oldName: 'OS-PolicyDetailsTransform',
      name: 'OSPolicyDetailsTransform',
      id: 'a1dWs000001F1HyIAK',
      type: 'Transform',
      formulaChanges: [],
      infos: [],
      warnings: ['name will be changed from OS-PolicyDetailsTransform to OSPolicyDetailsTransform'],
      apexDependencies: [],
    },
    {
      oldName: 'GetUserPermissionsSetGroupDetails',
      name: 'GetUserPermissionsSetGroupDetails',
      id: 'a1dWs000001F1HzIAK',
      type: 'Extract',
      formulaChanges: [],
      infos: [],
      warnings: [],
      apexDependencies: [],
    },
    {
      oldName: 'getCensusMemberIds',
      name: 'getCensusMemberIds',
      id: 'a1dWs000001F1I0IAK',
      type: 'Extract',
      formulaChanges: [],
      infos: [],
      warnings: [],
      apexDependencies: [],
    },
  ];

  describe('generateDRAssesment', () => {
    it('should generate report with correct title and structure', () => {
      const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

      expect(result).toContain('Data Mapper Components Assessment Report');
      expect(result).toContain('<div class="slds-text-heading_large">');
      expect(result).toContain('<table');
      expect(result).toContain('<thead>');
      expect(result).toContain('<tbody id="filterable-table-body">');
    });

    it('should include all data raptor assessments with correct names', () => {
      const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

      // Verify Transform type assessments
      expect(result).toContain('TravelersInsuranceCreateQuotePolicyJson-OS');
      expect(result).toContain('TravelersInsuranceCreateQuotePolicyJsonOS');
      expect(result).toContain('OS-PolicyDetailsTransform');
      expect(result).toContain('OSPolicyDetailsTransform');

      // Verify Extract type assessments
      expect(result).toContain('GetUserPermissionsSetGroupDetails');
      expect(result).toContain('getCensusMemberIds');
    });

    it('should include correct record IDs and links', () => {
      const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

      const expectedLinks = ['a1dWs000001F1HxIAK', 'a1dWs000001F1HyIAK', 'a1dWs000001F1HzIAK', 'a1dWs000001F1I0IAK'];

      expectedLinks.forEach((id) => {
        expect(result).toContain(`<a href="${mockInstanceUrl}/${id}">${id}</a>`);
      });
    });

    it('should include correct type information', () => {
      const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

      // Verify Transform type
      expect(result).toContain('Transform');

      // Verify Extract type
      expect(result).toContain('Extract');
    });

    it('should include name change warning messages', () => {
      const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

      const expectedMessages = [
        'name will be changed from TravelersInsuranceCreateQuotePolicyJson-OS to TravelersInsuranceCreateQuotePolicyJsonOS',
        'name will be changed from OS-PolicyDetailsTransform to OSPolicyDetailsTransform',
      ];

      expectedMessages.forEach((message) => {
        expect(result).toContain(message);
      });
    });

    it('should handle empty data raptor assessments array', () => {
      const result = DRAssessmentReporter.generateDRAssesment([], mockInstanceUrl, mockOrg);

      expect(result).toContain('Data Mapper Components Assessment Report');
      expect(result).toContain('<table');
      expect(result).toContain('<tbody id="filterable-table-body">');
      expect(result).toContain('<tr id="no-rows-message"');
      expect(result).toContain('No matching records found');
    });

    describe('filtering and record count', () => {
      it('should render with empty filters', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        // Should show all records when no filters are applied
        expect(result).toContain('TravelersInsuranceCreateQuotePolicyJson-OS');
        expect(result).toContain('OS-PolicyDetailsTransform');
        expect(result).toContain('GetUserPermissionsSetGroupDetails');
        expect(result).toContain('getCensusMemberIds');
      });

      it('should display correct record count', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        // Should show total number of records
        expect(result).toContain('Showing 4 records');
      });

      it('should display correct record count with empty data', () => {
        const result = DRAssessmentReporter.generateDRAssesment([], mockInstanceUrl, mockOrg);

        // Should show 0 records
        expect(result).toContain('Showing 0 records');
      });

      it('should display correct record count with single record', () => {
        const singleRecord = [mockData[0]];
        const result = DRAssessmentReporter.generateDRAssesment(singleRecord, mockInstanceUrl, mockOrg);

        // Should show 1 record
        expect(result).toContain('Showing 1 record');
      });
    });

    describe('UI elements and accessibility', () => {
      it('should include search functionality', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        expect(result).toContain('id="name-search-input"');
        expect(result).toContain('placeholder="Search by Name"');
        expect(result).toContain('oninput="filterAndSearchTable()"');
      });

      it('should include filter toggle button', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        expect(result).toContain('class="filter-toggle-button"');
        expect(result).toContain('onclick="toggleFilterDropdown()"');
        expect(result).toContain('Filters');
      });

      it('should include migration banner', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        expect(result).toContain('class="migration-message"');
        expect(result).toContain(
          'High level description of what actions were taken as part of the migration will come here'
        );
      });

      it('should include header container with org details', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        expect(result).toContain('class="header-container"');
        expect(result).toContain('class="org-details-section"');
        expect(result).toContain('test-org-id');
        expect(result).toContain('Test Org');
      });

      it('should include required scripts and styles', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        expect(result).toContain('<script src="./reportGeneratorUtility.js" defer></script>');
        expect(result).toContain('<link rel="stylesheet" href="./reportGenerator.css">');
      });

      it('should have proper table accessibility attributes', () => {
        const result = DRAssessmentReporter.generateDRAssesment(mockData, mockInstanceUrl, mockOrg);

        expect(result).toContain('aria-label="Data Mapper Components Assessment Report"');
        expect(result).toContain(
          'class="slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-table_col-bordered"'
        );
      });
    });
  });
});
