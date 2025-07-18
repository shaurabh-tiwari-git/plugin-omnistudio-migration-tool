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
        count: lwcAssessmentInfos.filter((info) => info.errors && info.errors.length > 0).length,
        cssClass: 'text-warning',
      },
    ];
  }

  private static getRowsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): ReportRowParam[] {
    const rows: ReportRowParam[] = [];
    
    for (const lwcAssessmentInfo of lwcAssessmentInfos) {
      for (const fileChangeInfo of lwcAssessmentInfo.changeInfos) {
        rows.push({
          rowId: `${this.rowIdPrefix}${this.rowId++}`,
          data: [
            createRowDataParam('name', lwcAssessmentInfo.name, true, 1, 1, false),
            createRowDataParam('fileReference', fileChangeInfo.name, false, 1, 1, true, fileChangeInfo.path, fileChangeInfo.name),
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
            createRowDataParam(
              'comments',
              lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'Need Manual Intervention' : 'Can be Automated',
              false,
              1,
              1,
              false,
              undefined,
              reportingHelper.decorateStatus(lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'Need Manual Intervention' : 'Can be Automated'),
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
    }
    
    return rows;
  }

  private static getFilterGroupsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): FilterGroupParam[] {
    // Collect all errors from all LWC assessment infos
    const allErrors: string[] = [];
    for (const lwcAssessmentInfo of lwcAssessmentInfos) {
      if (lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0) {
        allErrors.push(...lwcAssessmentInfo.errors);
      }
    }

    return [
      createFilterGroupParam(
        'Filter By Comments',
        'comments',
        Array.from(new Set(allErrors))
      ),
      createFilterGroupParam(
        'Filter By Errors',
        'errors',
        Array.from(new Set(allErrors))
      ),
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
            name: 'Diff',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Comments',
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







// import { LWCAssessmentInfo } from '../interfaces';
// import { FileDiffUtil } from '../lwcparser/fileutils/FileDiffUtil';
// import { generateHtmlTable } from '../reportGenerator/reportGenerator';
// import {
//   Filter,
//   HeaderColumn,
//   ReportFrameworkParameters,
//   ReportHeaderFormat,
//   TableColumn,
// } from '../reportGenerator/reportInterfaces';

// type RowType = {
//   name: string;
//   filePath: string;
//   fileName: string;
//   diff: string;
//   migrationStatus: string;
//   errors: string;
// };

// export class LWCAssessmentReporter {
//   public static generateLwcAssesment(
//     lwcAssessmentInfos: LWCAssessmentInfo[],
//     instanceUrl: string,
//     org: ReportHeaderFormat[]
//   ): string {
//     // Header Columns
//     const headerColumn: HeaderColumn[] = [
//       {
//         label: 'Name',
//         key: 'name',
//         colspan: 1,
//         rowspan: 1,
//         subColumn: [],
//       },
//       {
//         label: 'File Path',
//         key: 'filePath',
//         colspan: 1,
//         rowspan: 1,
//         subColumn: [],
//       },
//       {
//         label: 'File Diff',
//         key: 'diff',
//         colspan: 1,
//         rowspan: 1,
//         subColumn: [],
//       },
//       {
//         label: 'Migration Status',
//         key: 'migrationStatus',
//         colspan: 1,
//         rowspan: 1,
//         subColumn: [],
//       },
//       {
//         label: 'Errors',
//         key: 'errors',
//         colspan: 1,
//         rowspan: 1,
//         subColumn: [],
//       },
//     ];

//     // Define columns
//     const columns: Array<TableColumn<RowType>> = [
//       {
//         key: 'name',
//         cell: (row: RowType): string => row.name,
//         filterValue: (row: RowType): string => row.name,
//         title: (row: RowType): string => row.name,
//       },
//       {
//         key: 'filePath',
//         cell: (row: RowType): string => `<span><a href="${row.filePath}">${row.fileName}</a></span>`,
//         filterValue: (row: RowType): string => row.fileName,
//         title: (row: RowType): string => row.fileName,
//       },
//       {
//         key: 'diff',
//         cell: (row: RowType): string => FileDiffUtil.getDiffHTML(row.diff, row.name),
//         filterValue: (row: RowType): string => `Diff_${row.fileName}`,
//         title: (row: RowType): string => `Diff_${row.fileName}`,
//       },
//       {
//         key: 'migrationStatus',
//         cell: (row: RowType): string => row.migrationStatus,
//         filterValue: (row: RowType): string => row.migrationStatus,
//         title: (row: RowType): string => row.migrationStatus,
//       },
//       {
//         key: 'errors',
//         cell: (row: RowType): string => row.errors,
//         filterValue: (row: RowType): string => row.errors,
//         title: (row: RowType): string => row.errors,
//       },
//     ];

//     const rows = this.generateRows(lwcAssessmentInfos);

//     const filters: Filter[] = [
//       {
//         label: 'Status',
//         key: 'status',
//         filterOptions: Array.from(new Set(rows.map((row: RowType) => row.migrationStatus))),
//       },
//       {
//         label: 'Errors',
//         key: 'errors',
//         filterOptions: Array.from(new Set(rows.map((row: RowType) => row.errors))),
//       },
//     ];

//     const reportFrameworkParameters: ReportFrameworkParameters<RowType> = {
//       headerColumns: headerColumn,
//       columns,
//       rows,
//       orgDetails: org,
//       filters,
//       ctaSummary: [],
//       reportHeaderLabel: 'LWC Assessment',
//       showMigrationBanner: true,
//     };
//     // Render table
//     const tableHtml = generateHtmlTable(reportFrameworkParameters);
//     return `${tableHtml}`;
//   }

//   private static generateRows(lwcAssessmentInfos: LWCAssessmentInfo[]): RowType[] {
//     const rows: RowType[] = [];
//     for (const lwcAssessmentInfo of lwcAssessmentInfos) {
//       for (const fileChangeInfo of lwcAssessmentInfo.changeInfos) {
//         rows.push({
//           name: lwcAssessmentInfo.name,
//           filePath: fileChangeInfo.path,
//           fileName: fileChangeInfo.name,
//           diff: fileChangeInfo.diff,
//           migrationStatus: '',
//           errors: lwcAssessmentInfo.errors.join(', '),
//         });
//       }
//     }
//     return rows;
//   }
// }
