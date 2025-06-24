/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { ElementNode } from './model/elementNode';
import { NodeType } from './model/nodeTypes';

export class TemplateParserUtil {
  public static parseKeyPair(data: any, prefix?: string): Map<string, any> {
    prefix = prefix ? prefix + '.' : '';
    const keypair = new Map<string, any>();
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        keypair.set(`${prefix}${key}.length`, (data[key] as any[]).length.toString());
        keypair.set(`${prefix}${key}`, data[key]);
      } else if (data[key] instanceof Object) {
        this.parseKeyPair(data[key], `${prefix}${key}`).forEach((pairValue, pairKey) => {
          keypair.set(`${prefix}${pairKey}`, pairValue);
        });
      } else {
        keypair.set(`${prefix}${key}`, data[key]);
      }
    }
    return keypair;
  }

  public static parseHtmlToNode(html: string): ElementNode {
    // Remove leading/trailing whitespace
    html = html.trim();

    // Check for if condition using <c:if exp={js exp}></c:if> syntax
    const ifMatch = /^<c:if\s+exp=\{([^}]+)\}>(.*?)<\/c:if>$/s.exec(html);
    if (ifMatch) {
      const [, expression, content] = ifMatch;
      const children = this.parseChildren(content);
      return new ElementNode(NodeType.IF, expression.trim(), new Map(), children);
    }

    // Check for for loop using <c:for items=(itemsName) var="varName" index="indexName"></c:for> syntax
    const forLoopMatch = /^<c:for\s+items=\(([^)]+)\)([^>]*)>(.*?)<\/c:for>$/s.exec(html);
    if (forLoopMatch) {
      const [, itemsName, attributesStr, content] = forLoopMatch;
      const properties = this.parseForLoopAttributes(attributesStr);
      const children = this.parseChildren(content);
      return new ElementNode(NodeType.FOR_LOOP, itemsName, properties, children);
    }

    // Check for placeholder using {{name}} syntax
    const placeholderMatch = /^\{\{([^}]+)\}\}$/.exec(html);
    if (placeholderMatch) {
      const [, name] = placeholderMatch;
      return new ElementNode(NodeType.PLACEHOLDER, name.trim(), new Map(), []);
    }

    // Check if it's a c:for tag that wasn't caught by the full pattern
    const cForMatch = /^<c:for([^>]*)>(.*?)<\/c:for>$/s.exec(html);
    if (cForMatch) {
      const [, attributesStr, content] = cForMatch;
      // Extract items name from attributes
      const itemsMatch = /items=\(([^)]+)\)/.exec(attributesStr);
      const itemsName = itemsMatch ? itemsMatch[1] : 'items';
      const properties = this.parseForLoopAttributes(attributesStr);
      const children = this.parseChildren(content);
      return new ElementNode(NodeType.FOR_LOOP, itemsName, properties, children);
    }

    // Check if it's a c:if tag that wasn't caught by the full pattern
    const cIfMatch = /^<c:if([^>]*)>(.*?)<\/c:if>$/s.exec(html);
    if (cIfMatch) {
      const [, attributesStr, content] = cIfMatch;
      // Extract expression from attributes
      const expMatch = /exp=\{([^}]+)\}/.exec(attributesStr);
      const expression = expMatch ? expMatch[1] : 'true';
      const children = this.parseChildren(content);
      return new ElementNode(NodeType.IF, expression.trim(), new Map(), children);
    }

    // Parse as native HTML element
    return this.parseNativeElement(html);
  }

  private static parseNativeElement(html: string): ElementNode {
    // Find the first opening tag - updated to handle custom tags with colons
    const tagMatch = /^<([\w:]+)([^>]*)>/.exec(html);
    if (!tagMatch) {
      // If no tag found, treat as text content
      return new ElementNode(NodeType.NATIVE, 'text', new Map([['content', html]]), []);
    }

    const [, tagName, attributesStr] = tagMatch;
    const properties = this.parseAttributes(attributesStr);

    // Check if it's a self-closing tag - updated to handle custom tags with colons
    if (/^<([\w:]+)([^>]*)\/>/.exec(html)) {
      return new ElementNode(NodeType.NATIVE, tagName, properties, []);
    }

    // Find the closing tag
    const closingTag = `</${tagName}>`;
    const closingIndex = html.lastIndexOf(closingTag);

    if (closingIndex === -1) {
      // No closing tag found, treat as self-closing
      return new ElementNode(NodeType.NATIVE, tagName, properties, []);
    }

    // Extract content between opening and closing tags
    const contentStart = tagMatch[0].length;
    const content = html.substring(contentStart, closingIndex);

    // Parse children
    const children = this.parseChildren(content);

    return new ElementNode(NodeType.NATIVE, tagName, properties, children);
  }

  private static parseAttributes(attributesStr: string): Map<string, string> {
    const properties = new Map<string, string>();

    if (!attributesStr.trim()) {
      return properties;
    }

    // Comprehensive regex to match all possible HTML attributes:
    // 1. name="value" or name='value' (quoted values)
    // 2. name=value (unquoted values)
    // 3. name (boolean attributes without values)
    // const attrRegex = /(\w+)\s*=\s*["]([^"]*)["]|(\w+)\s*=\s*([^\s>]+)|(\w+)(?=\s|$)/g;
    // const attrRegex = /(\w+)\s*=\s*(["'])([\s\S]*?)\2|(\w+)\s*=\s*([^\s>]+)|(\w+)(?=\s|$)/g;
    const attrRegex = /([a-zA-Z0-9_-]+)\s*=\s*["]([^"]*)["]|([a-zA-Z0-9_-]+)\s*=\s*([^\s>]+)|([a-zA-Z0-9_-]+)(?=\s|$)/g;
    let match: string[] | null;

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      let name: string;
      let value: string;

      if (match[1] && match[2] !== undefined) {
        // Quoted attribute: name="value" or name='value'
        name = match[1];
        value = match[2];
      } else if (match[3] && match[4] !== undefined) {
        // Unquoted attribute: name=value
        name = match[3];
        value = match[4];
      } else if (match[5]) {
        // Boolean attribute: name (without value)
        name = match[5];
        value = null;
      } else {
        continue; // Skip invalid matches
      }
      // Store the attribute in properties
      properties.set(name, value);
    }

    return properties;
  }

  private static parseChildren(content: string): ElementNode[] {
    const children: ElementNode[] = [];

    if (!content.trim()) {
      return children;
    }

    // Split content by template tags and HTML tags
    const parts = this.splitContent(content);

    for (const part of parts) {
      if (part.trim()) {
        children.push(this.parseHtmlToNode(part));
      }
    }

    return children;
  }

  private static splitContent(content: string): string[] {
    const parts: string[] = [];
    let current = '';
    let i = 0;

    while (i < content.length) {
      // Check for placeholder tags first
      if (this.isPlaceholderStart(content, i)) {
        const placeholderPart = this.extractPlaceholder(content, i);
        if (placeholderPart) {
          if (current.trim()) {
            parts.push(current);
            current = '';
          }
          parts.push(placeholderPart.content);
          i = placeholderPart.endIndex;
          continue;
        }
      }

      // Check for template tags
      if (this.isTemplateTagStart(content, i)) {
        const templatePart = this.extractTemplateTag(content, i);
        if (templatePart) {
          if (current.trim()) {
            parts.push(current);
            current = '';
          }
          parts.push(templatePart.content);
          i = templatePart.endIndex;
          continue;
        }
      }

      // Check for HTML tags
      if (content[i] === '<') {
        const htmlPart = this.extractHtmlElement(content, i);
        if (htmlPart) {
          if (current.trim()) {
            parts.push(current);
            current = '';
          }
          parts.push(htmlPart.content);
          i = htmlPart.endIndex;
          continue;
        }
      }

      // Regular text content
      current += content[i];
      i++;
    }

    if (current.trim()) {
      parts.push(current);
    }

    return parts;
  }

  private static isPlaceholderStart(content: string, index: number): boolean {
    return content.substring(index, index + 2) === '{{';
  }

  private static extractPlaceholder(content: string, startIndex: number): { content: string; endIndex: number } | null {
    const endIndex = content.indexOf('}}', startIndex);
    if (endIndex === -1) {
      return null; // Malformed placeholder
    }

    return {
      content: content.substring(startIndex, endIndex + 2),
      endIndex: endIndex + 2,
    };
  }

  private static isTemplateTagStart(content: string, index: number): boolean {
    return content.substring(index, index + 4) === '<c:for' || content.substring(index, index + 4) === '<c:if';
  }

  private static extractTemplateTag(content: string, startIndex: number): { content: string; endIndex: number } | null {
    const tagType = content.substring(startIndex, startIndex + 4);
    const closingTag = tagType === '<c:for' ? '</c:for>' : '</c:if>';
    const endIndex = content.indexOf(closingTag, startIndex);

    if (endIndex === -1) {
      return null; // Malformed template tag
    }

    return {
      content: content.substring(startIndex, endIndex + closingTag.length),
      endIndex: endIndex + closingTag.length,
    };
  }

  private static extractHtmlElement(content: string, startIndex: number): { content: string; endIndex: number } | null {
    // Check for self-closing tags
    const selfClosingMatch = /^<([\w:]+)([^>]*)\/>/.exec(content.substring(startIndex));
    if (selfClosingMatch) {
      return {
        content: selfClosingMatch[0],
        endIndex: startIndex + selfClosingMatch[0].length,
      };
    }

    // Check for closing tags
    if (content.substring(startIndex, startIndex + 2) === '</') {
      return this.extractClosingTag(content, startIndex);
    }

    // Handle opening tags
    return this.extractOpeningTag(content, startIndex);
  }

  private static extractClosingTag(content: string, startIndex: number): { content: string; endIndex: number } | null {
    const endIndex = content.indexOf('>', startIndex);
    if (endIndex === -1) {
      return null; // Malformed closing tag
    }

    return {
      content: content.substring(startIndex, endIndex + 1),
      endIndex: endIndex + 1,
    };
  }

  private static extractOpeningTag(content: string, startIndex: number): { content: string; endIndex: number } | null {
    const tagMatch = /^<([\w:]+)([^>]*)>/.exec(content.substring(startIndex));
    if (!tagMatch) {
      return null; // Malformed opening tag
    }

    const tagName = tagMatch[1];
    const fullTag = tagMatch[0];
    const closingTag = `</${tagName}>`;

    // Look for the closing tag
    const endIndex = content.indexOf(closingTag, startIndex + fullTag.length);

    if (endIndex === -1) {
      // No closing tag found, treat as self-closing
      return {
        content: fullTag,
        endIndex: startIndex + fullTag.length,
      };
    }

    // Handle nested elements
    const nestedEndIndex = this.findNestedElementEnd(content, startIndex, tagName, closingTag);

    return {
      content: content.substring(startIndex, nestedEndIndex),
      endIndex: nestedEndIndex,
    };
  }

  private static findNestedElementEnd(
    content: string,
    startIndex: number,
    tagName: string,
    closingTag: string
  ): number {
    let nestedDepth = 0;
    let searchIndex = startIndex + 1;
    let endIndex = content.indexOf(closingTag, startIndex);

    while (searchIndex < content.length) {
      const nextOpenIndex = content.indexOf(`<${tagName}`, searchIndex);
      const nextCloseIndex = content.indexOf(closingTag, searchIndex);

      if (nextOpenIndex !== -1 && nextOpenIndex < nextCloseIndex) {
        // Found nested opening tag
        nestedDepth++;
        searchIndex = nextOpenIndex + 1;
      } else if (nextCloseIndex !== -1) {
        if (nestedDepth === 0) {
          // Found the matching closing tag
          endIndex = nextCloseIndex + closingTag.length;
          break;
        } else {
          // Found closing tag for nested element
          nestedDepth--;
          searchIndex = nextCloseIndex + 1;
        }
      } else {
        // No more tags found
        break;
      }
    }

    return endIndex;
  }

  private static parseForLoopAttributes(attributesStr: string): Map<string, string> {
    const properties = new Map<string, string>();

    // Default values
    properties.set('item', 'item');
    properties.set('index', 'index');

    if (!attributesStr.trim()) {
      return properties;
    }

    // Parse var attribute
    const varMatch = /var\s*=\s*["']([^"']*)["']/.exec(attributesStr);
    if (varMatch) {
      properties.set('item', varMatch[1]);
    }

    // Parse index attribute
    const indexMatch = /index\s*=\s*["']([^"']*)["']/.exec(attributesStr);
    if (indexMatch) {
      properties.set('index', indexMatch[1]);
    }

    return properties;
  }
}
