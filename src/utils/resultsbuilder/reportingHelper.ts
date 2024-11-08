import { nameLocation, oldNew } from '../interfaces';

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

  public static decorateChanges(changes: oldNew[], what: string): string {
    if (!changes || changes.length === 0) return '';
    let htmlContent = '<ul class="slds-list_dotted">';
    for (const change of changes) {
      htmlContent += `<li class="slds-item" title=" ${what} will change ${change.old} to ${change.new}"> ${what} will change ${change.old} to ${change.new}</li>`;

      return htmlContent;
    }
  }
}
