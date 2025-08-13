/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { FlexiPageAssessmentInfo } from '../interfaces';
import { FileDiffUtil } from '../lwcparser/fileutils/FileDiffUtil';
import { OmnistudioOrgDetails } from '../orgUtils';
import {
  FilterGroupParam,
  ReportHeaderGroupParam,
  ReportParam,
  ReportRowParam,
  SummaryItemDetailParam,
} from '../reportGenerator/reportInterfaces';
import { createFilterGroupParam, createRowDataParam, getOrgDetailsForReport } from '../reportGenerator/reportUtil';

/**
 * FlexipageAssessmentReporter provides functionality to generate assessment reports
 * for Flexipage migration operations. It processes FlexiPage assessment information
 * and converts it into report-ready data structures.
 *
 * This class handles:
 * - Converting FlexiPage assessment data into report parameters
 * - Generating summary statistics for different migration statuses
 * - Creating report rows with proper formatting and styling
 * - Managing header groups and filter options for reports
 * - Ensuring unique row IDs for report data
 */
export class FlexipageAssessmentReporter {
  /** Static counter for generating unique row IDs */
  private static rowId = 0;
  /** Prefix for row ID generation */
  private static rowIdPrefix = 'flexipage-row-data-';

  private static flexiPageFileSuffix = '.flexipage-meta.xml';

  /**
   * Generates comprehensive assessment data for Flexipage migration reports.
   *
   * @param flexipageAssessmentInfos - Array of FlexiPage assessment information
   * @param omnistudioOrgDetails - Organization details for the report
   * @returns Complete report parameters including title, headers, filters, and rows
   */
  public static getFlexipageAssessmentData(
    flexipageAssessmentInfos: FlexiPageAssessmentInfo[],
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): ReportParam {
    return {
      title: 'Flexipage Migration Assessment',
      heading: 'FlexiPage',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toString(),
      total: flexipageAssessmentInfos?.length || 0,
      filterGroups: this.getFilterGroupsForReport(),
      headerGroups: this.getHeaderGroupsForReport(),
      rows: this.getRowsForReport(flexipageAssessmentInfos),
    };
  }

  /**
   * Generates summary statistics for Flexipage assessment data.
   *
   * @param flexipageAssessmentInfos - Array of FlexiPage assessment information
   * @returns Array of summary items with counts and CSS classes for different statuses
   */
  public static getSummaryData(flexipageAssessmentInfos: FlexiPageAssessmentInfo[]): SummaryItemDetailParam[] {
    return [
      {
        name: 'Can be Automated',
        count: flexipageAssessmentInfos.filter((info) => info.status === 'Can be Automated').length,
        cssClass: 'text-success',
      },
      {
        name: 'Has Errors',
        count: flexipageAssessmentInfos.filter((info) => info.status === 'Errors').length,
        cssClass: 'text-error',
      },
    ];
  }

  /**
   * Converts FlexiPage assessment information into report row data.
   *
   * @param flexipageAssessmentInfos - Array of FlexiPage assessment information
   * @returns Array of report row parameters with formatted data and unique row IDs
   */
  private static getRowsForReport(flexipageAssessmentInfos: FlexiPageAssessmentInfo[]): ReportRowParam[] {
    if (!flexipageAssessmentInfos || flexipageAssessmentInfos.length === 0) {
      return [];
    }
    return flexipageAssessmentInfos.map((flexipageAssessmentInfo) => ({
      data: [
        createRowDataParam(
          'name',
          flexipageAssessmentInfo.name.substring(
            0,
            flexipageAssessmentInfo.name.length - this.flexiPageFileSuffix.length
          ),
          true,
          1,
          1,
          false
        ),
        createRowDataParam('path', flexipageAssessmentInfo.name, true, 1, 1, true, flexipageAssessmentInfo.path),
        createRowDataParam(
          'status',
          flexipageAssessmentInfo.status,
          false,
          1,
          1,
          false,
          undefined,
          undefined,
          flexipageAssessmentInfo.status === 'Errors' ? 'text-error' : 'text-success'
        ),
        createRowDataParam(
          'diff',
          '',
          false,
          1,
          1,
          false,
          undefined,
          FileDiffUtil.getDiffHTML(flexipageAssessmentInfo.diff, flexipageAssessmentInfo.name)
        ),
        createRowDataParam(
          'errors',
          flexipageAssessmentInfo.errors?.length > 0 ? 'Has Errors' : 'Has No Errors',
          false,
          1,
          1,
          false,
          undefined,
          flexipageAssessmentInfo.errors,
          'text-error'
        ),
      ],
      rowId: `${this.rowIdPrefix}${this.rowId++}`,
    }));
  }

  /**
   * Generates header groups for Flexipage assessment reports.
   *
   * @returns Array of header group parameters defining the report column structure
   */
  private static getHeaderGroupsForReport(): ReportHeaderGroupParam[] {
    return [
      {
        header: [
          {
            name: 'Page Name',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'File Reference',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Assessment Status',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Differences',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Summary',
            colspan: 1,
            rowspan: 1,
          },
        ],
      },
    ];
  }
  /**
   * Generates filter groups for Flexipage assessment reports.
   *
   * @returns Array of filter group parameters for filtering by errors and status
   */
  private static getFilterGroupsForReport(): FilterGroupParam[] {
    return [
      createFilterGroupParam('Filter by Errors', 'errors', ['Has Errors', 'Has No Errors']),
      createFilterGroupParam('Filter by Status', 'status', ['Can be Automated', 'Errors']),
    ];
  }
}
