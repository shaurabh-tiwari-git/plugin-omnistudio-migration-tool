import { LWCAssessmentInfo } from '../interfaces';
import { Logger } from '../logger';
import { OmnistudioOrgDetails } from '../orgUtils';
import {
  FilterGroupParam,
  ReportHeaderGroupParam,
  ReportParam,
  ReportRowParam,
  SummaryItemDetailParam,
  CTASummary,
} from '../reportGenerator/reportInterfaces';
import { createFilterGroupParam, createRowDataParam, getOrgDetailsForReport } from '../reportGenerator/reportUtil';
import { FileDiffUtil } from '../lwcparser/fileutils/FileDiffUtil';
import { reportingHelper } from './reportingHelper';

export class LWCAssessmentReporter {
  private static rowId = 0;
  private static rowIdPrefix = 'lwc-row-data-';

  public static getLwcAssessmentData(
    lwcAssessmentInfos: LWCAssessmentInfo[],
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): ReportParam {
    Logger.captureVerboseData('lwc data:', lwcAssessmentInfos);
    return {
      title: 'LWC Migration Assessment',
      heading: 'Lightning Web Components (LWC)',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toString(),
      total: this.getTotalFileCount(lwcAssessmentInfos),
      filterGroups: this.getFilterGroupsForReport(lwcAssessmentInfos),
      headerGroups: this.getHeaderGroupsForReport(),
      rows: this.getRowsForReport(lwcAssessmentInfos),
      callToAction: this.getCallToAction(lwcAssessmentInfos),
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
        cssClass: 'text-warning',
      },
    ];
  }

  private static getTotalFileCount(lwcAssessmentInfos: LWCAssessmentInfo[]): number {
    return lwcAssessmentInfos.reduce((total, info) => total + (info.changeInfos?.length || 0), 0);
  }

  private static getRowsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): ReportRowParam[] {
    const rows: ReportRowParam[] = [];

    for (const lwcAssessmentInfo of lwcAssessmentInfos) {
      if (lwcAssessmentInfo.changeInfos && lwcAssessmentInfo.changeInfos.length > 0) {
        // Create rows for each file change
        for (const fileChangeInfo of lwcAssessmentInfo.changeInfos) {
          rows.push({
            rowId: `${this.rowIdPrefix}${this.rowId++}`,
            data: [
              createRowDataParam('componentName', lwcAssessmentInfo.name, true, 1, 1, false),
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
                'status',
                lwcAssessmentInfo.errors.length > 0 ? 'Has Errors' : 'Can be Automated',
                false,
                1,
                1,
                false,
                undefined,
                undefined,
                lwcAssessmentInfo.errors.length > 0 ? 'text-error' : 'text-success'
              ),
              createRowDataParam(
                'diff',
                fileChangeInfo.name + '_diff',
                false,
                1,
                1,
                false,
                undefined,
                FileDiffUtil.getDiffHTML(fileChangeInfo.diff, fileChangeInfo.name)
              ),
              createRowDataParam(
                'errors',
                lwcAssessmentInfo.errors ? lwcAssessmentInfo.errors.join(', ') : '',
                false,
                1,
                1,
                false,
                undefined,
                lwcAssessmentInfo.errors ? reportingHelper.decorateErrors(lwcAssessmentInfo.errors) : []
              ),
            ],
          });
        }
      } else {
        // Create a single row for components without file changes but with errors
        rows.push({
          rowId: `${this.rowIdPrefix}${this.rowId++}`,
          data: [
            createRowDataParam('componentName', lwcAssessmentInfo.name, true, 1, 1, false),
            createRowDataParam('fileReference', 'No file changes', false, 1, 1, false),
            createRowDataParam(
              'status',
              lwcAssessmentInfo.errors.length > 0 ? 'Has Errors' : 'Can be Automated',
              false,
              1,
              1,
              false,
              undefined,
              undefined,
              lwcAssessmentInfo.errors.length > 0 ? 'text-error' : 'text-success'
            ),
            createRowDataParam('diff', 'No diff available', false, 1, 1, false),
            createRowDataParam(
              'errors',
              lwcAssessmentInfo.errors ? lwcAssessmentInfo.errors.join(', ') : '',
              false,
              1,
              1,
              false,
              undefined,
              lwcAssessmentInfo.errors ? reportingHelper.decorateErrors(lwcAssessmentInfo.errors) : []
            ),
          ],
        });
      }
    }

    return rows;
  }

  private static getFilterGroupsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): FilterGroupParam[] {
    const componentNames = Array.from(new Set(lwcAssessmentInfos.map((info) => info.name)));
    const statusOptions = Array.from(
      new Set(lwcAssessmentInfos.map((info) => (info.errors.length > 0 ? 'Has Errors' : 'Can be Automated')))
    );
    const errorMessages = Array.from(
      new Set(lwcAssessmentInfos.filter((info) => info.errors && info.errors.length > 0).flatMap((info) => info.errors))
    );

    return [
      createFilterGroupParam('Filter By Component', 'componentName', componentNames),
      createFilterGroupParam('Filter By Status', 'status', statusOptions),
      createFilterGroupParam('Filter By Errors', 'errors', errorMessages),
    ];
  }

  private static getHeaderGroupsForReport(): ReportHeaderGroupParam[] {
    return [
      {
        header: [
          {
            name: 'Component Name',
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
            name: 'Diff',
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

  private static getCallToAction(lwcAssessmentInfos: LWCAssessmentInfo[]): CTASummary[] {
    // For LWC assessment, we'll create a simple call to action based on errors
    const hasErrors = lwcAssessmentInfos.some((info) => info.errors && info.errors.length > 0);

    if (hasErrors) {
      return [
        {
          name: 'LWC_MIGRATION_ERRORS',
          message: 'Some Lightning Web Components have errors that need to be addressed before migration.',
          link: '#', // Add appropriate documentation link here
        },
      ];
    }

    return [];
  }
}
