import { nameLocation } from '../interfaces';

export class reportingHelper {
  public static decorate(nameLocations: nameLocation[]): string {
    let htmlContent = '<ul class="slds-list_dotted">';
    for (const nameLoc of nameLocations) {
      htmlContent += `<li class="slds-item" title="Used in ${nameLoc.location}">${nameLoc.name}</li>`;
    }
    htmlContent += '</ul>';
    return htmlContent;
  }

  public static convertToBuletedList(messages: string[]): string {
    let htmlContent = '<ul class="slds-list_dotted">';
    for (const msg of messages) {
      htmlContent += `<li class="slds-item" title="${msg}">${msg}</li>`;
    }
    htmlContent += '</ul>';
    return htmlContent;
  }
}
