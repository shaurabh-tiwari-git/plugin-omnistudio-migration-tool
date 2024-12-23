import { DataRaptorAssessmentInfo } from '../interfaces';
import { reportingHelper } from './reportingHelper';

export class DRAssessmentReporter {
  public static generateDRAssesment(
    dataRaptorAssessmentInfos: DataRaptorAssessmentInfo[],
    instanceUrl: string
  ): string {
    let tableBody = '';
    tableBody += '<div class="slds-text-heading_large">Data Mapper Components Assessment</div>';
    for (const dr of dataRaptorAssessmentInfos) {
      const row = `
              <tr class="slds-hint_parent">
                  <td style="word-wrap: break-word; white-space: normal; max-width: 200px;">
                      <div class="slds-truncate" title="${dr.name}">${dr.name}</div>
                  </td>
                   <td style="word-wrap: break-word; white-space: normal; max-width: 100px;">
                      <div class="slds-truncate" title="${dr.id}">
                    <a href="${instanceUrl}/${dr.id}">${dr.id}</div>
                  </td>
                   <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                       ${reportingHelper.convertToBuletedList(dr.warnings)}
                  </td>
                   <td style="word-wrap: break-word; white-space: normal; max-width: 200px;">
                      <div> ${reportingHelper.decorateChanges(dr.formulaChanges, 'Formula')} </div>
                  </td>
                   <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                       ${reportingHelper.convertToBuletedList(dr.apexDependencies)}
                  </td>                      

              </tr>`;
      tableBody += row;
    }

    return DRAssessmentReporter.getDRAssessmentReport(tableBody);
  }

  private static getDRAssessmentReport(tableContent: string): string {
    const tableBody = `
        <div style="margin-block:15px">        
            <table style="width: 100%; table-layout: auto;" class="slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-table_col-bordered" aria-label="Results for Data Mapper updates">
            <thead>
                <tr class="slds-line-height_reset">
                    <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                        <div class="slds-truncate" title="Name">Name</div>
                    </th>
                    <th class="" scope="col" style="width: 10%; word-wrap: break-word; white-space: normal; text-align: left;">
                       <div class="slds-truncate" title="ID">ID</div>
                    </th>
                    <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                        <div class="slds-truncate" title="Summary">Summary</div>
                    </th>
                    <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                        <div class="slds-truncate" title="Custom Function Change">Custom Function Changes</div>
                    </th>
                    <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                        <div class="slds-truncate" title="Apex dependencies">Apex dependencies</div>
                    </th>
                </tr>
            </thead>
            <tbody>
            ${tableContent}
            </tbody>
            </table>
        </div>`;
    return tableBody;
  }
}
