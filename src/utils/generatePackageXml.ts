import * as fs from 'fs';
import * as path from 'path';

export class generatePackageXml {
  // Method to generate package.xml with additional types
  public static createChangeList(apexClasses: string[], lwcComponents: string[]): void {
    const apexXml = generatePackageXml.getXmlElementforMembers(apexClasses, 'ApexClass');
    const lwcXml = generatePackageXml.getXmlElementforMembers(lwcComponents, 'LightningComponentBundle');

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
}
