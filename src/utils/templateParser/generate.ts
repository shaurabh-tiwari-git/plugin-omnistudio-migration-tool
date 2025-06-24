import { DashboardParam, ReportParam } from '../reportGenerator/reportInterfaces';
import { TemplateParserUtil } from './util';

export class TemplateParser {
  public static generate(template: string, data: ReportParam | DashboardParam): string {
    if (!data) {
      return template;
    }

    const node = TemplateParserUtil.parseHtmlToNode(template);
    const keypair = TemplateParserUtil.parseKeyPair(data);
    const html = node.toHtml(keypair);
    return html;
  }
}
