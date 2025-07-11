/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { XMLParser, XMLBuilder } from 'fast-xml-parser';

/**
 * XMLUtil provides XML parsing and building functionality using the fast-xml-parser library.
 *
 * This class handles:
 * - Parsing XML strings into JavaScript objects
 * - Building XML strings from JavaScript objects
 * - Configuring parser options for Salesforce metadata XML structures
 * - Handling arrays for specific FlexiPage elements
 */
class XMLUtil {
  /** XML parser instance configured for Salesforce metadata */
  private parser: XMLParser;
  /** XML builder instance configured for formatted output */
  private builder: XMLBuilder;

  /**
   * Initializes the XMLUtil with configured parser and builder instances.
   *
   * The parser is configured to:
   * - Preserve attributes with '@' prefix
   * - Handle arrays for FlexiPage regions and item instances
   * - Parse Salesforce metadata XML structures
   *
   * The builder is configured to:
   * - Format output with proper indentation
   * - Preserve attributes with '@' prefix
   */
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

  /**
   * Parses an XML string into a JavaScript object.
   *
   * @param xml - The XML string to parse
   * @returns JavaScript object representation of the XML structure
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parse(xml: string): any {
    return this.parser.parse(xml);
  }

  /**
   * Builds an XML string from a JavaScript object.
   *
   * @param json - The JavaScript object to convert to XML
   * @returns Formatted XML string
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public build(json: any): string {
    return this.builder.build(json);
  }
}

export const xmlUtil = new XMLUtil();
