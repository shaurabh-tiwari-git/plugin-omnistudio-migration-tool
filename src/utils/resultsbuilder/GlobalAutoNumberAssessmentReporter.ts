import { GlobalAutoNumberAssessmentInfo } from '../interfaces';
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
import { reportingHelper } from './reportingHelper';

export class GlobalAutoNumberAssessmentReporter {
  private static rowId = 0;
  private static rowIdPrefix = 'gan-row-data-';

  public static getGlobalAutoNumberAssessmentData(
    globalAutoNumberAssessmentInfos: GlobalAutoNumberAssessmentInfo[],
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): ReportParam {
    Logger.captureVerboseData('GAN data', globalAutoNumberAssessmentInfos);
    return {
      title: 'Global Auto Number Migration Assessment',
      heading: 'Global Auto Number',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toString(),
      total: globalAutoNumberAssessmentInfos?.length || 0,
      filterGroups: this.getFilterGroupsForReport(globalAutoNumberAssessmentInfos),
      headerGroups: this.getHeaderGroupsForReport(),
      rows: this.getRowsForReport(globalAutoNumberAssessmentInfos, instanceUrl),
      rollbackFlags: undefined,
      callToAction: reportingHelper.getCallToAction(globalAutoNumberAssessmentInfos),
    };
  }

  public static getSummaryData(
    globalAutoNumberAssessmentInfos: GlobalAutoNumberAssessmentInfo[]
  ): SummaryItemDetailParam[] {
    return [
      {
        name: 'Can be Automated',
        count: globalAutoNumberAssessmentInfos.filter(
          (globalAutoNumberAssessmentInfo) =>
            !globalAutoNumberAssessmentInfo.warnings || globalAutoNumberAssessmentInfo.warnings.length === 0
        ).length,
        cssClass: 'text-success',
      },
      {
        name: 'Has Warnings',
        count: globalAutoNumberAssessmentInfos.filter(
          (globalAutoNumberAssessmentInfo) =>
            globalAutoNumberAssessmentInfo.warnings && globalAutoNumberAssessmentInfo.warnings.length > 0
        ).length,
        cssClass: 'text-warning',
      },
    ];
  }

  private static getFilterGroupsForReport(
    globalAutoNumberAssessmentInfos: GlobalAutoNumberAssessmentInfo[]
  ): FilterGroupParam[] {
    if (!globalAutoNumberAssessmentInfos || globalAutoNumberAssessmentInfos.length === 0) {
      return [];
    }

    // Create filter groups based on warning types
    const warningTypes = new Set<string>();
    globalAutoNumberAssessmentInfos.forEach((info) => {
      info.warnings.forEach((warning) => {
        if (warning.includes('duplicate')) {
          warningTypes.add('Duplicate Names');
        } else if (warning.includes('name change')) {
          warningTypes.add('Name Changes');
        }
      });
    });

    if (warningTypes.size > 0) {
      return [createFilterGroupParam('Filter By Warning Type', 'warningType', Array.from(warningTypes))];
    }
    return [];
  }

  private static getHeaderGroupsForReport(): ReportHeaderGroupParam[] {
    return [
      {
        header: [
          {
            name: 'In Managed Package',
            colspan: 2,
            rowspan: 1,
          },
          {
            name: 'In Core',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Migration Status',
            colspan: 1,
            rowspan: 2,
          },
          {
            name: 'Warnings',
            colspan: 1,
            rowspan: 2,
          },
          {
            name: 'Info',
            colspan: 1,
            rowspan: 2,
          },
        ],
      },
      {
        header: [
          {
            name: 'Name',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Record ID',
            colspan: 1,
            rowspan: 1,
          },
          {
            name: 'Name',
            colspan: 1,
            rowspan: 1,
          },
        ],
      },
    ];
  }

  private static getRowsForReport(
    globalAutoNumberAssessmentInfos: GlobalAutoNumberAssessmentInfo[],
    instanceUrl: string
  ): ReportRowParam[] {
    return globalAutoNumberAssessmentInfos.map((globalAutoNumberAssessmentInfo) => ({
      rowId: `${this.rowIdPrefix}${this.rowId++}`,
      data: [
        createRowDataParam('name', globalAutoNumberAssessmentInfo.name, true, 1, 1, false),
        createRowDataParam(
          'id',
          globalAutoNumberAssessmentInfo.id,
          false,
          1,
          1,
          true,
          `${instanceUrl}/${globalAutoNumberAssessmentInfo.id}`
        ),
        createRowDataParam('newName', globalAutoNumberAssessmentInfo.name, false, 1, 1, false),
        createRowDataParam(
          'migrationStatus',
          this.getMigrationStatus(globalAutoNumberAssessmentInfo),
          false,
          1,
          1,
          false,
          undefined,
          [],
          this.getMigrationStatusCssClass(globalAutoNumberAssessmentInfo)
        ),
        createRowDataParam(
          'warnings',
          globalAutoNumberAssessmentInfo.warnings ? globalAutoNumberAssessmentInfo.warnings.join(', ') : '',
          false,
          1,
          1,
          false,
          undefined,
          globalAutoNumberAssessmentInfo.warnings
            ? reportingHelper.decorateErrors(globalAutoNumberAssessmentInfo.warnings)
            : []
        ),
        createRowDataParam(
          'infos',
          globalAutoNumberAssessmentInfo.infos ? globalAutoNumberAssessmentInfo.infos.join(', ') : '',
          false,
          1,
          1,
          false,
          undefined,
          globalAutoNumberAssessmentInfo.infos || []
        ),
      ],
    }));
  }

  private static getMigrationStatus(globalAutoNumberAssessmentInfo: GlobalAutoNumberAssessmentInfo): string {
    if (globalAutoNumberAssessmentInfo.warnings.length > 0) {
      return 'Has Warnings';
    }
    return 'Ready';
  }

  private static getMigrationStatusCssClass(globalAutoNumberAssessmentInfo: GlobalAutoNumberAssessmentInfo): string {
    if (globalAutoNumberAssessmentInfo.warnings.length > 0) {
      return 'text-warning';
    }
    return 'text-success';
  }
}
