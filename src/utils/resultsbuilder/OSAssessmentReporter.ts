import { OSAssessmentInfo } from '../interfaces';
import { reportingHelper } from './reportingHelper';
import { generateHtmlTable } from '../reportGenerator/reportGenerator';
import { Filter, HeaderColumn, ReportHeaderFormat, TableColumn } from '../reportGenerator/reportInterfaces';

export class OSAssessmentReporter {
  public static generateOSAssesment(
    osAssessmentInfos: OSAssessmentInfo[],
    instanceUrl: string,
    org: ReportHeaderFormat[],
  ): string {

    //Header Column
    const headerColumn: HeaderColumn[] = [
      {
        "label": "In Package",
        "colspan": 2,
        "styles": 'color: purple;',
        "subColumn": [
          {
            "label": "Name",
            "key": "oldName",
          },
          {
            "label": "Record ID",
            "key": "id",
          }
        ]
      },
      {
        "label": "In Core",
        "colspan": 1,
        "subColumn": [
          {
            "label": "Name",
            "key": "name",
          }
        ]
      },
      {
        "label": "Type",
        "key": "type",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Migration Status",
        "key": "migrationStatus",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Summary",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Omniscript Dependencies",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Integration Procedures Dependencies",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Data Mapper Dependencies",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Remote Action Dependencies",
        "rowspan": 2,
        "subColumn": []
      },
      {
        "label": "Custom LWCs Dependencies",
        "rowspan": 2,
        "subColumn": []
      }
    ];

    // Define columns
    const columns: Array<TableColumn<OSAssessmentInfo>> = [
      { key: 'oldName', cell: row => row.oldName, filterValue: row => row.oldName, title: row => row.oldName },
      { key: 'id', cell: row => row.id ? `<a href="${instanceUrl}/${row.id}">${row.id}</a>` : '', filterValue: row => row.id, title: row => row.id },
      { key: 'name', cell: row => row.name || '', filterValue: row => row.name, title: row => row.name },
      { key: 'type', cell: row => row.type, filterValue: row => row.type, title: row => row.type },
      { key: 'migrationStatus', cell: row => row.migrationStatus, filterValue: row => row.migrationStatus, styles: row => this.getMigrationStatusStyles(row.migrationStatus) },
      { key: 'Summary', cell: row => reportingHelper.convertToBuletedList(row.warnings || []), filterValue: row => row.warnings, title: row => row.warnings },
      { key: 'dependenciesOS', cell: row => reportingHelper.decorate(row.dependenciesOS) || '', filterValue: row => row.dependenciesOS },
      { key: 'dependenciesIP', cell: row => reportingHelper.decorate(row.dependenciesIP) || '', filterValue: row => row.dependenciesIP },
      { key: 'dependenciesDR', cell: row => reportingHelper.decorate(row.dependenciesDR) || '', filterValue: row => row.dependenciesDR },
      { key: 'dependenciesRemoteAction', cell: row => reportingHelper.decorate(row.dependenciesRemoteAction) || '', filterValue: row => row.dependenciesRemoteAction },
      { key: 'dependenciesLWC', cell: row => reportingHelper.decorate(row.dependenciesLWC) || '', filterValue: row => row.dependenciesLWC },
    ];

    const filters: Filter[] = [
      { label: 'Type', filterOptions: ['Angular', 'LWC'], key: 'type' },
      { label: 'Migration Status', filterOptions: ['Can be Automated', 'Need Manual Intervention'], key: 'migrationStatus' },
    ]
    // Render table
    const tableHtml = generateHtmlTable(
      headerColumn,
      columns,
      osAssessmentInfos,
      org,
      filters,
      undefined,
      'OmniScript Assessment'
    );
    return `<div class="slds-text-heading_large">Omniscript Assessment Report</div>${tableHtml}`;
  }

  private static getMigrationStatusStyles(migrationStatus: string): string {
      return migrationStatus === 'Can be Automated'? 'color:green; font-weight:500;' : 'color:red; font-weight:500;'
  }

}