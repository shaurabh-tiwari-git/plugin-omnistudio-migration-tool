import * as fs from 'fs';
import * as path from 'path';
import { ApexAssessmentInfo, FlexiPageAssessmentInfo, LWCAssessmentInfo } from './interfaces';

export class generatePackageXml {
  // Method to generate package.xml with additional types
  public static createChangeList(
    apexAssementInfos: ApexAssessmentInfo[],
    lwcAssessmentInfos: LWCAssessmentInfo[],
    flexipageAssessmentInfos: FlexiPageAssessmentInfo[]
  ): void {
    const apexXml = generatePackageXml.getXmlElementforMembers(this.getApexclasses(apexAssementInfos), 'ApexClass');
    const lwcXml = generatePackageXml.getXmlElementforMembers(
      this.getLwcs(lwcAssessmentInfos),
      'LightningComponentBundle'
    );

    const flexipageXml = generatePackageXml.getXmlElementforMembers(
      this.getFlexipageXml(flexipageAssessmentInfos),
      'FlexiPage'
    );

    const additionalTypes = `
    <types>
        <members>*</members>
        <name>OmniDataTransform</name>
    </types>
    <types>
        <members>*</members>
        <name>OmniIntegrationProcedure</name>
    </types>
    <types>
        <members>*</members>
        <name>OmniScript</name>
    </types>
    <types>
        <members>*</members>
        <name>OmniUiCard</name>
    </types>
  `;

    const packageXmlContent = `
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
      ${apexXml}
      ${lwcXml}
      ${flexipageXml}
      ${additionalTypes}
    <version>57.0</version>
</Package>
`;

    const filePath = path.join(__dirname, 'package.xml');
    fs.writeFileSync(filePath, packageXmlContent.trim());
  }

  // Backup method without additional types
  public static backupChangeList(apexClasses: string[], lwcComponents: string[]): void {
    const apexXml = generatePackageXml.getXmlElementforMembers(apexClasses, 'ApexClass');
    const lwcXml = generatePackageXml.getXmlElementforMembers(lwcComponents, 'LightningComponentBundle');

    const packageXmlContent = `
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
        ${apexXml}
        ${lwcXml}
    <version>57.0</version>
</Package>
`;

    const filePath = path.join(__dirname, 'backup-package.xml');
    fs.writeFileSync(filePath, packageXmlContent.trim());
  }

  private static getXmlElementforMembers(members: string[], type: string): string {
    if (!members || members.length === 0) return '';
    const membersTag = members.map((member) => `<members>${member}</members>`).join('\n        ');
    return `
    <types>
        ${membersTag}
        <name>${type}</name>
    </types> `;
  }

  private static getFlexipageXml(flexipageAssessmentInfos: FlexiPageAssessmentInfo[]): string[] {
    if (!flexipageAssessmentInfos || flexipageAssessmentInfos.length === 0) return [];
    return flexipageAssessmentInfos
      .filter((flexipageAssessmentInfo) => flexipageAssessmentInfo.status === 'Complete')
      .map((flexipageAssessmentInfo) => {
        return flexipageAssessmentInfo.name.replace('.flexipage-meta.xml', '');
      });
  }

  private static getApexclasses(apexAssessmentInfos: ApexAssessmentInfo[]): string[] {
    if (!apexAssessmentInfos || apexAssessmentInfos.length === 0) return [];
    return apexAssessmentInfos.map((apexAssessmentInfo) => {
      return apexAssessmentInfo.name;
    });
  }

  private static getLwcs(lwcAssessmentInfos: LWCAssessmentInfo[]): string[] {
    if (!lwcAssessmentInfos || lwcAssessmentInfos.length === 0) return [];
    return lwcAssessmentInfos.map((lwcAssessmentInfo) => {
      return lwcAssessmentInfo.name;
    });
  }
}
