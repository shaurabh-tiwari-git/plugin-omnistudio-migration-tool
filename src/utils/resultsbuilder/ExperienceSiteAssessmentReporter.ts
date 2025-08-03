/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ExperienceSiteAssessmentInfo } from '../interfaces';
import { Logger } from '../logger';
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

export class ExperienceSiteAssessmentReporter {
  private static rowId = 0;
  private static rowIdPrefix = 'experiencesite-row-data-';

  public static getExperienceSiteAssessmentData(
    experienceSiteAssessmentInfos: ExperienceSiteAssessmentInfo[],
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): ReportParam {
    return {
      title: 'Experience Site Migration Assessment',
      heading: 'ExperienceSite',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toString(),
      total: experienceSiteAssessmentInfos?.length || 0,
      filterGroups: this.getFilterGroupsForReport(),
      headerGroups: this.getHeaderGroupsForReport(),
      rows: this.getRowsForReport(experienceSiteAssessmentInfos),
    };
  }

  public static getSummaryData(
    experienceSiteAssessmentInfos: ExperienceSiteAssessmentInfo[]
  ): SummaryItemDetailParam[] {
    return [
      {
        name: 'Can be Automated',
        count: experienceSiteAssessmentInfos.filter((info) => info.status === 'Can be Automated').length,
        cssClass: 'text-success',
      },
      {
        name: 'Has Errors',
        count: experienceSiteAssessmentInfos.filter((info) => info.status === 'Errors').length,
        cssClass: 'text-error',
      },
    ];
  }

  private static getRowsForReport(experienceSiteAssessmentInfos: ExperienceSiteAssessmentInfo[]): ReportRowParam[] {
    if (!experienceSiteAssessmentInfos || experienceSiteAssessmentInfos.length === 0) {
      return [];
    }
    experienceSiteAssessmentInfos.forEach((apexAssessmentInfo) => {
      const diffString = FileDiffUtil.getDiffHTML(apexAssessmentInfo.diff, apexAssessmentInfo.name);
      Logger.logVerbose('The diff is' + JSON.stringify(diffString));
    });

    return experienceSiteAssessmentInfos.map((experienceSiteAssessmentInfo) => ({
      data: [
        createRowDataParam('name', experienceSiteAssessmentInfo.name, true, 1, 1, false),
        createRowDataParam('path', experienceSiteAssessmentInfo.path, true, 1, 1, false),
        createRowDataParam(
          'status',
          experienceSiteAssessmentInfo.status,
          false,
          1,
          1,
          false,
          undefined,
          experienceSiteAssessmentInfo.status
        ),
        createRowDataParam(
          'diff',
          '',
          false,
          1,
          1,
          false,
          undefined,
          FileDiffUtil.getDiffHTML(experienceSiteAssessmentInfo.diff, experienceSiteAssessmentInfo.name)
        ),
        createRowDataParam(
          'summary',
          '',
          false,
          1,
          1,
          false,
          undefined,
          experienceSiteAssessmentInfo.warnings,
          'text-error'
        ),
      ],
      rowId: `${this.rowIdPrefix}${this.rowId++}`,
    }));
  }

  private static getHeaderGroupsForReport(): ReportHeaderGroupParam[] {
    return [
      {
        header: [
          {
            name: 'ExperienceSite Name',
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

  private static getFilterGroupsForReport(): FilterGroupParam[] {
    return [createFilterGroupParam('Filter by Status', 'status', ['Can be Automated', 'Errors'])];
  }
}
