import { XMLParser, XMLBuilder } from 'fast-xml-parser';

class XMLUtil {
  private parser: XMLParser;
  private builder: XMLBuilder;

  public constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      isArray: (_tagName: string, jPath: string): boolean => {
        return ['FlexiPage.flexiPageRegions', 'FlexiPage.flexiPageRegions.itemInstances'].includes(jPath);
      },
    });
    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      format: true,
      indentBy: '    ',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parse(xml: string): any {
    return this.parser.parse(xml);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public build(json: any): string {
    return this.builder.build(json);
  }
}

export const xmlUtil = new XMLUtil();
