import { IPAssessmentInfo } from '../interfaces';
import { reportingHelper } from './reportingHelper';
import { generateHtmlTable } from '../reportGenerator/reportGenerator';
import { HeaderColumn, ReportHeaderFormat, TableColumn } from '../reportGenerator/reportInterfaces';

export class IPAssessmentReporter {
  public static generateIPAssesment(ipAssessmentInfos: IPAssessmentInfo[], instanceUrl: string, org: ReportHeaderFormat[], filters: Record<string, string> = {}): string {
    // Define multi-row headers
    const headerColumn: HeaderColumn[] = [
      {
        "label": "In Package",
        "colspan": 2,
        "subColumn": [
          {
            "label": "Name",
          },
          {
            "label": "Record ID",
          }
        ]
      },
      {
        "label": "In Core",
        "colspan": 1,
        "subColumn": [
          {
            "label": "Name",
          }
        ]
      },
      {
        "label": "Summary",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Integration Procedures Dependencies",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Data Mapper dependencies",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Remote Action Dependencies",
        "rowspan": 2,
        "subColumn": []
      }
    ];

    // Define columns
    const columns: TableColumn<IPAssessmentInfo>[] = [
      { key: 'oldName', cell: row => row.oldName, filterValue: row => row.oldName, title: row => row.oldName },
      { key: 'id', cell: row => row.id ? `<a href="${instanceUrl}/${row.id}">${row.id}</a>` : '', filterValue: row => row.id, title: row => row.id },
      { key: 'name', cell: row => row.name || '', filterValue: row => row.name, title: row => row.name },
      { key: 'Summary', cell: row => reportingHelper.convertToBuletedList(row.warnings || []), filterValue: row => row.warnings, title: row => row.warnings },
      { key: 'dependenciesIP', cell: row => reportingHelper.decorate(row.dependenciesIP) || '', filterValue: row => row.dependenciesIP },
      { key: 'dependenciesDR', cell: row => reportingHelper.decorate(row.dependenciesDR) || '', filterValue: row => row.dependenciesDR },
      { key: 'dependenciesRemoteAction', cell: row => reportingHelper.decorate(row.dependenciesRemoteAction) || '', filterValue: row => row.dependenciesRemoteAction },
    ];

    // Render table
    const tableHtml = generateHtmlTable(headerColumn, columns, ipAssessmentInfos, org, [], undefined, 'Integration Procedure Assessment');
    return `<div class="slds-text-heading_large">Integration Procedure Components Assessment</div>${tableHtml}`;
  }
}
