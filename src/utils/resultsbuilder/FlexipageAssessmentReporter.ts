import { FlexiPageAssessmentInfo } from '../interfaces';
import { FileDiffUtil } from '../lwcparser/fileutils/FileDiffUtil';
import { OmnistudioOrgDetails } from '../orgUtils';
import {
  FilterGroupParam,
  ReportHeaderGroupParam,
  ReportParam,
  ReportRowParam,
} from '../reportGenerator/reportInterfaces';
import { createFilterGroupParam, createRowDataParam, getOrgDetailsForReport } from '../reportGenerator/reportUtil';

export class FlexipageAssessmentReporter {
  private static rowId = 0;
  private static rowIdPrefix = 'flexipage-row-data-';

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

  public static getSummaryData(
    flexipageAssessmentInfos: FlexiPageAssessmentInfo[]
  ): Array<import('../reportGenerator/reportInterfaces').SummaryItemDetailParam> {
    return [
      {
        name: 'No Changes',
        count: flexipageAssessmentInfos.filter((info) => info.status === 'No Changes').length,
        cssClass: 'text-success',
      },
      {
        name: 'Can be Automated',
        count: flexipageAssessmentInfos.filter((info) => info.status === 'Can be Automated').length,
        cssClass: 'text-warning',
      },
      {
        name: 'Has Errors',
        count: flexipageAssessmentInfos.filter((info) => info.status === 'Errors').length,
        cssClass: 'text-error',
      },
    ];
  }

  private static getRowsForReport(flexipageAssessmentInfos: FlexiPageAssessmentInfo[]): ReportRowParam[] {
    if (!flexipageAssessmentInfos || flexipageAssessmentInfos.length === 0) {
      return [];
    }
    return flexipageAssessmentInfos.map((flexipageAssessmentInfo) => ({
      data: [
        createRowDataParam('name', flexipageAssessmentInfo.name, true, 1, 1, false),
        createRowDataParam(
          'status',
          flexipageAssessmentInfo.status,
          false,
          1,
          1,
          false,
          undefined,
          undefined,
          flexipageAssessmentInfo.status === 'Errors'
            ? 'text-error'
            : flexipageAssessmentInfo.status === 'Can be Automated'
            ? 'text-warning'
            : 'text-success'
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
          flexipageAssessmentInfo.errors
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
            name: 'Page Name',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Status',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Differences',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Errors',
            colspan: 1,
            rowspan: 1,
          },
        ],
      },
    ];
  }
  private static getFilterGroupsForReport(): FilterGroupParam[] {
    return [
      createFilterGroupParam('Filter by Errors', 'errors', ['Has Errors', 'Has No Errors']),
      createFilterGroupParam('Filter by Status', 'status', ['No Changes', 'Can be Automated', 'Errors']),
    ];
  }
}
