import { OSAssessmentInfo } from '../interfaces';
import { reportingHelper } from './reportingHelper';

export class OSAssesmentReporter {
  public static generateOSAssesment(osAssessmentInfos: OSAssessmentInfo[], instanceUrl: string): string {
    let tableBody = '';
    tableBody += '<div class="slds-text-heading_large">Omniscript Components Assessment</div>';

    for (const osAssessmentInfo of osAssessmentInfos) {
      const row = `
          <tr class="slds-hint_parent">
              <td style="word-wrap: break-word; white-space: normal; max-width: 200px;">
                  <div class="slds-truncate" title="${osAssessmentInfo.name}">${osAssessmentInfo.name}</div>
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 100px;">
                  <div class="slds-truncate" title="${osAssessmentInfo.id}">
                  <a href="${instanceUrl}/${osAssessmentInfo.id}">${osAssessmentInfo.id}</div>
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                  ${osAssessmentInfo.type}
              </td>
               <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                  ${reportingHelper.convertToBuletedList(osAssessmentInfo.warnings)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                  ${reportingHelper.decorate(osAssessmentInfo.dependenciesOS)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                   ${reportingHelper.decorate(osAssessmentInfo.dependenciesIP)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                   ${reportingHelper.decorate(osAssessmentInfo.dependenciesDR)}
              </td>
              <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                    ${reportingHelper.decorate(osAssessmentInfo.dependenciesRemoteAction)} 
              </td>
               <td style="word-wrap: break-word; white-space: normal; max-width: 60%; overflow: hidden;">
                    ${reportingHelper.decorate(osAssessmentInfo.dependenciesLWC)} 
              </td>
          </tr>`;
      tableBody += row;
    }

    return this.getOSAssessmentReport(tableBody);
  }

  private static getOSAssessmentReport(tableContent: string): string {
    const tableBody = `
  <div style="margin-block:15px">        
    <table style="width: 100%; table-layout: auto;" class="slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-table_col-bordered" aria-label="Results for OS updates">
    <thead>
        <tr class="slds-line-height_reset">
            <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div class="slds-truncate" title="Name">Name</div>
            </th>
            <th class="" scope="col" style="width: 15%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div class="slds-truncate" title="ID">ID</div>
            </th>
            <th class="" scope="col" style="width: 15%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div class="slds-truncate" title="Type">Type</div>
            </th>
            <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Warnings"> Summary </div>
            </th>
            <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Dependencies">Omniscript Dependencies</div>
            </th>
            <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Dependencies">Integration Procedures Dependencies</div>
            </th>
            <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Dependencies">Data Mapper Dependencies</div>
            </th>
            <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Dependencies">Remote Action dependencies</div>
            </th>
             <th class="" scope="col" style="width: 20%; word-wrap: break-word; white-space: normal; text-align: left;">
                <div title="Dependencies">custom LWC Dependencies</div>
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
