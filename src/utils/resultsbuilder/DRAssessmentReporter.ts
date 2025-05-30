import { DataRaptorAssessmentInfo } from '../interfaces';
import { Filter, ReportHeader, TableColumn, TableHeaderCell } from '../reportGenerator/reportInterfaces';
import { generateHtmlTable } from '../reportGenerator/reportGenerator';
import { reportingHelper } from './reportingHelper';

export class DRAssessmentReporter {
  public static generateDRAssesment(
    dataRaptorAssessmentInfos: DataRaptorAssessmentInfo[],
    instanceUrl: string,
    org: ReportHeader[]
  ): string {
    // Define multi-row headers
    const headerRows: TableHeaderCell[][] = [
      [
        { label: 'In Package', colspan: 2, key: 'inPackage' },
        { label: 'In Core', colspan: 1, key: 'inCore' },
        { label: 'Type of DM Action', rowspan: 2, key: 'type' },
        { label: 'Summary', rowspan: 2, key: 'summary' },
        { label: 'Custom Function Changes', rowspan: 2, key: 'customFunctionChanges' },
        { label: 'Apex Dependencies', rowspan: 2, key: 'apexDependencies' },
      ],
      [
        { label: 'Name', key: 'oldName' },
        { label: 'Record ID', key: 'id' },
        { label: 'Name', key: 'name' },
      ],
    ];

    // Define columns
    const columns: Array<TableColumn<DataRaptorAssessmentInfo>> = [
      {
        key: 'oldName',
        cell: (row: DataRaptorAssessmentInfo): string => row.oldName,
        filterValue: (row: DataRaptorAssessmentInfo): string => row.oldName,
        title: (row: DataRaptorAssessmentInfo): string => row.oldName,
      },
      {
        key: 'id',
        cell: (row: DataRaptorAssessmentInfo): string =>
          row.id ? `<a href="${instanceUrl}/${row.id}">${row.id}</a>` : '',
        filterValue: (row: DataRaptorAssessmentInfo): string => row.id,
        title: (row: DataRaptorAssessmentInfo): string => row.id,
      },
      {
        key: 'name',
        cell: (row: DataRaptorAssessmentInfo): string => row.name,
        filterValue: (row: DataRaptorAssessmentInfo): string => row.name,
        title: (row: DataRaptorAssessmentInfo): string => row.name,
      },
      {
        key: 'type',
        cell: (row: DataRaptorAssessmentInfo): string => row.type,
        filterValue: (row: DataRaptorAssessmentInfo): string => row.type,
        title: (row: DataRaptorAssessmentInfo): string => row.type,
      },
      {
        key: 'Summary',
        cell: (row: DataRaptorAssessmentInfo): string => reportingHelper.convertToBuletedList(row.warnings || []),
        filterValue: (row: DataRaptorAssessmentInfo): string[] => row.warnings,
        title: (row: DataRaptorAssessmentInfo): string[] => row.warnings,
      },
      {
        key: 'customFunctionChanges',
        cell: (row: DataRaptorAssessmentInfo): string =>
          reportingHelper.decorateChanges(row.formulaChanges, 'Formula') || '',
        filterValue: (row: DataRaptorAssessmentInfo): typeof row.formulaChanges => row.formulaChanges,
      },
      {
        key: 'apexDependencies',
        cell: (row: DataRaptorAssessmentInfo): string =>
          reportingHelper.convertToBuletedList(row.apexDependencies || []),
        filterValue: (row: DataRaptorAssessmentInfo): string[] => row.apexDependencies,
      },
    ];

    const filters: Filter[] = [];
    // Render table
    const tableHtml = generateHtmlTable(
      headerRows,
      columns,
      dataRaptorAssessmentInfos,
      org,
      filters,
      undefined,
      'Data Mapper Assessment Report'
    );
    return `<div class="slds-text-heading_large">Data Mapper Assessment Report</div>${tableHtml}`;
  }
}
