import { LWCAssessmentInfo } from '../interfaces';
import { Logger } from '../logger';
import { OmnistudioOrgDetails } from '../orgUtils';
import {
  FilterGroupParam,
  ReportHeaderGroupParam,
  ReportParam,
  ReportRowParam,
  SummaryItemDetailParam,
} from '../reportGenerator/reportInterfaces';
import { createFilterGroupParam, createRowDataParam, getOrgDetailsForReport } from '../reportGenerator/reportUtil';
import { FileDiffUtil } from '../lwcparser/fileutils/FileDiffUtil';

export class LWCAssessmentReporter {
  private static rowId = 0;
  private static rowIdPrefix = 'lwc-row-data-';
  public static getLwcAssessmentData(
    lwcAssessmentInfos: LWCAssessmentInfo[],
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): ReportParam {
    Logger.captureVerboseData('lwc data:', lwcAssessmentInfos);
    return {
      title: 'LWC Assessment Report',
      heading: 'LWC',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toString(),
      total: lwcAssessmentInfos?.length || 0,
      filterGroups: this.getFilterGroupsForReport(lwcAssessmentInfos),
      headerGroups: this.getHeaderGroupsForReport(),
      rows: this.getRowsForReport(lwcAssessmentInfos),
    };
  }

  public static getSummaryData(lwcAssessmentInfos: LWCAssessmentInfo[]): SummaryItemDetailParam[] {
    return [
      {
        name: 'Can be Automated',
        count: lwcAssessmentInfos.filter(
          (lwcAssessmentInfo) => !lwcAssessmentInfo.errors || lwcAssessmentInfo.errors.length === 0
        ).length,
        cssClass: 'text-success',
      },
      {
        name: 'Has Warnings',
        count: lwcAssessmentInfos.filter((info) => info.warnings && info.warnings.length > 0).length,
        cssClass: 'text-warning',
      },
      {
        name: 'Has Errors',
        count: lwcAssessmentInfos.filter((info) => info.errors && info.errors.length > 0).length,
        cssClass: 'text-error',
      },
    ];
  }

  private static getRowsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): ReportRowParam[] {
    const rows: ReportRowParam[] = [];

    for (const lwcAssessmentInfo of lwcAssessmentInfos) {
      const changeInfosCount = lwcAssessmentInfo.changeInfos.length;
      const rId = `${this.rowIdPrefix}${this.rowId++}`;

      for (let fileIndex = 0; fileIndex < lwcAssessmentInfo.changeInfos.length; fileIndex++) {
        const fileChangeInfo = lwcAssessmentInfo.changeInfos[fileIndex];

        rows.push({
          rowId: rId,
          data: [
            ...(fileIndex === 0
              ? [createRowDataParam('name', lwcAssessmentInfo.name, true, changeInfosCount, 1, false)]
              : []),
            createRowDataParam(
              'fileReference',
              fileChangeInfo.name,
              false,
              1,
              1,
              true,
              fileChangeInfo.path,
              fileChangeInfo.name
            ),
            createRowDataParam(
              'diff',
              fileChangeInfo.name + 'diff',
              false,
              1,
              1,
              false,
              undefined,
              FileDiffUtil.getDiffHTML(fileChangeInfo.diff, fileChangeInfo.name)
            ),
            ...(fileIndex === 0
              ? [
                  createRowDataParam(
                    'comments',
                    lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0
                      ? 'Need Manual Intervention'
                      : 'Can be Automated',
                    false,
                    changeInfosCount,
                    1,
                    false,
                    undefined,
                    lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0
                      ? 'Need Manual Intervention'
                      : 'Can be Automated',
                    lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'text-error' : 'text-success'
                  ),
                  createRowDataParam(
                    'errors',
                    lwcAssessmentInfo.errors ? lwcAssessmentInfo.errors.join(', ') : '',
                    false,
                    changeInfosCount,
                    1,
                    false,
                    undefined,
                    lwcAssessmentInfo.errors,
                    lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'text-error' : 'text-success'
                  ),
                ]
              : []),
          ],
        });
      }
    }

    return rows;
  }

  private static getFilterGroupsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): FilterGroupParam[] {
    return [
      createFilterGroupParam('Filter By Assessment Status', 'comments', [
        'Can be Automated',
        'Needs Manual Intervention',
      ]),
    ];
  }

  private static getHeaderGroupsForReport(): ReportHeaderGroupParam[] {
    return [
      {
        header: [
          {
            name: 'Name',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'File Reference',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'File Diff',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Assessment Status',
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
}
