/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Logger } from '../../logger';
import { TemplateParserUtil } from '../util';
import { NodeType } from './nodeTypes';

export class ElementNode {
  public type: NodeType;
  public name: string;
  public properties: Map<string, string>;
  public children: ElementNode[];

  public constructor(type: NodeType, name: string, properties: Map<string, string>, children: ElementNode[]) {
    this.type = type;
    this.name = name;
    this.properties = properties;
    this.children = children;
  }

  public toHtml(props: Map<string, any>): string {
    switch (this.type) {
      case NodeType.NATIVE:
        return this.nativeToHtml(props);
      case NodeType.FOR_LOOP:
        return this.forLoopToHtml(props);
      case NodeType.PLACEHOLDER:
        return this.placeholderToHtml(props);
      case NodeType.IF:
        return this.ifToHtml(props);
    }
  }

  public nativeToHtml(props: Map<string, any>): string {
    if (this.name === 'text') {
      return this.properties.get('content') || '';
    }
    let html = `<${this.name}`;
    for (const [key, value] of this.properties) {
      if (value == null) {
        html += ` ${key}`;
        continue;
      }
      if (value.startsWith('(')) {
        html += ` ${key}="${props.get(value.slice(1, -1))}"`;
      } else {
        html += ` ${key}="${value}"`;
      }
    }
    html += '>';
    for (const child of this.children) {
      html += child.toHtml(props);
    }
    html += `</${this.name}>`;
    return html;
  }

  public forLoopToHtml(props: Map<string, any>): string {
    let html = '';
    const array = props.get(this.name) as any[];
    if (!array) {
      return '';
    }

    // Get custom variable and index names from properties
    const itemVarName = this.properties.get('item') || 'item';
    const indexVarName = this.properties.get('index') || 'index';

    array.forEach((item, index) => {
      this.addProps(props, index.toString(), item, itemVarName, indexVarName);
      html += this.children.map((child) => child.toHtml(props)).join('');
      this.removeProps(props, item, itemVarName, indexVarName);
    });
    return html;
  }

  public ifToHtml(props: Map<string, any>): string {
    // Evaluate the JavaScript expression
    const expression = this.name;
    const isTrue = this.evaluateExpression(expression, props);

    if (isTrue) {
      // Render children if condition is true
      return this.children.map((child) => child.toHtml(props)).join('');
    }

    // Return empty string if condition is false
    return '';
  }

  public placeholderToHtml(props: Map<string, any>): string {
    return props.get(this.name) as string;
  }

  private addProps(props: Map<string, any>, ind: string, value: any, itemVarName: string, indexVarName: string): void {
    props.set(indexVarName, ind);
    if (typeof value === 'string' || Array.isArray(value)) {
      props.set(itemVarName, value);
      return;
    }
    TemplateParserUtil.parseKeyPair(value, itemVarName).forEach((val, key) => {
      props.set(key, val);
    });
  }

  private removeProps(props: Map<string, any>, value: any, itemVarName: string, indexVarName: string): void {
    props.delete(indexVarName);
    if (typeof value === 'string' || Array.isArray(value)) {
      props.delete(itemVarName);
      return;
    }
    TemplateParserUtil.parseKeyPair(value, itemVarName).forEach((_value, key) => {
      props.delete(key);
    });
  }

  private evaluateExpression(expression: string, props: Map<string, any>): boolean {
    props.forEach((value, key) => {
      expression = expression.replace(`$${key}`, JSON.stringify(value));
    });

    try {
      return eval(expression) as boolean;
    } catch (error) {
      Logger.logger.error('Error evaluating expression:', expression, error);
      return false;
    }
  }
}
