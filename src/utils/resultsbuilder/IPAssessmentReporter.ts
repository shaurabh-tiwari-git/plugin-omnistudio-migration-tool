import { IPAssessmentInfo } from '../interfaces';
import { reportingHelper } from './reportingHelper';

export class IPAssessmentReporter {
  public static generateIPAssesment(ipAssessmentInfos: IPAssessmentInfo[], instanceUrl: string): string {
    let tableBody = '';
    tableBody += '<div class="slds-text-heading_large">Integration Procedure Components Assessment</div>';

    for (const ipAssessmentInfo of ipAssessmentInfos) {
      const row = `
          <tr class="slds-hint_parent">
              <td style="word-wrap: break-word; white-space: normal; max-width: 200px;">
                  <div class="slds-truncate" title="${ipAssessmentInfo.name}">${ipAssessmentInfo.name}</div>
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 100px;">
                  <div class="slds-truncate" title="${ipAssessmentInfo.id}"><a href="${instanceUrl}/${
        ipAssessmentInfo.id
      }">${ipAssessmentInfo.id}</div>
              </td>
               <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                  ${reportingHelper.convertToBuletedList(ipAssessmentInfo.warnings)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                  ${reportingHelper.decorate(ipAssessmentInfo.dependenciesIP)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                 ${reportingHelper.decorate(ipAssessmentInfo.dependenciesDR)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                 ${reportingHelper.decorate(ipAssessmentInfo.dependenciesRemoteAction)}
              </td>
          </tr>`;
      tableBody += row;
    }

    return this.getIPAssessmentReport(tableBody);
  }
  private static getIPAssessmentReport(tableContent: string): string {
    const tableBody = `
    <div style="margin-block:15px">        
        <table style="width: 100%; table-layout: auto;" class="slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-table_col-bordered" aria-label="Results for Integration Procedure updates">
        <thead>
            <tr class="slds-line-height_reset">
                <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                    <div class="slds-truncate" title="Name">Name</div>
                </th>
                <th class="" scope="col" style="width: 10%; word-wrap: break-word; white-space: normal; text-align: left;">
                    <div class="slds-truncate" title="ID">ID</div>
                </th>
                <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Warnings"> Summary </div>
                </th>
                <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                    <div title="Dependencies">Integration Procedures Dependencies</div>
                </th>
                <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                    <div title="Dependencies">Data Raptor dependencies</div>
                </th>
                <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                    <div title="Dependencies">Remote Action Dependencies</div>
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
