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
  private static experienceSiteFileSuffix = '.json';

  private static rowId = 0;
  private static rowIdPrefix = 'experiencesite-row-data-';

  public static getExperienceSiteAssessmentData(
    experienceSiteAssessmentInfos: ExperienceSiteAssessmentInfo[],
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): ReportParam {
    return {
      title: 'Experience Sites Assessment Report',
      heading: 'Experience Sites Assessment Report',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toLocaleString(),
      total: experienceSiteAssessmentInfos?.length || 0,
      filterGroups: this.getFilterGroupsForReport(experienceSiteAssessmentInfos),
      headerGroups: this.getHeaderGroupsForReport(),
      rows: this.getRowsForReport(experienceSiteAssessmentInfos),
    };
  }

  public static getSummaryData(
    experienceSiteAssessmentInfos: ExperienceSiteAssessmentInfo[]
  ): SummaryItemDetailParam[] {
    return [
      {
        name: 'Ready for migration',
        count: experienceSiteAssessmentInfos.filter((info) => info.status === 'Ready for migration').length,
        cssClass: 'text-success',
      },
      {
        name: 'Warnings',
        count: 0,
        cssClass: 'text-warning',
      },
      {
        name: 'Needs Manual Intervention',
        count: experienceSiteAssessmentInfos.filter((info) => info.status === 'Needs Manual Intervention').length,
        cssClass: 'text-error',
      },
      {
        name: 'Failed',
        count: experienceSiteAssessmentInfos.filter((info) => info.status === 'Failed').length,
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
        createRowDataParam(
          'name',
          experienceSiteAssessmentInfo.name,
          true,
          1,
          1,
          false,
          undefined,
          undefined,
          experienceSiteAssessmentInfo.status === 'Needs Manual Intervention' ||
            experienceSiteAssessmentInfo.status === 'Failed'
            ? 'invalid-icon'
            : ''
        ),
        createRowDataParam(
          'path',
          `${experienceSiteAssessmentInfo.name}${this.experienceSiteFileSuffix}`,
          false,
          1,
          1,
          true,
          experienceSiteAssessmentInfo.path
        ),
        createRowDataParam(
          'status',
          experienceSiteAssessmentInfo.status,
          false,
          1,
          1,
          false,
          undefined,
          experienceSiteAssessmentInfo.status,
          experienceSiteAssessmentInfo.status === 'Ready for migration' ? 'text-success' : 'text-error'
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
        createRowDataParam('summary', '', false, 1, 1, false, undefined, experienceSiteAssessmentInfo.warnings),
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

  private static getFilterGroupsForReport(
    experienceSiteAssessmentInfos: ExperienceSiteAssessmentInfo[]
  ): FilterGroupParam[] {
    const distinctStatuses = [...new Set(experienceSiteAssessmentInfos.map((info) => info.status))];
    const statusFilterGroupParam: FilterGroupParam[] =
      distinctStatuses.length > 0 && distinctStatuses.filter((status) => status).length > 0
        ? [createFilterGroupParam('Filter By Assessment Status', 'status', distinctStatuses)]
        : [];

    return [...statusFilterGroupParam];
  }
}
