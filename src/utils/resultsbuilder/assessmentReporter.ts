/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import fs from 'fs';
import path from 'path';
import open from 'open';
import { Messages } from '@salesforce/core';
import { AssessmentInfo } from '../interfaces';
import { DashboardParam, SummaryItemDetailParam, SummaryItemParam } from '../reportGenerator/reportInterfaces';
import { OmnistudioOrgDetails } from '../orgUtils';
import { Constants } from '../constants/stringContants';
import { pushAssestUtilites } from '../file/fileUtil';
import { TemplateParser } from '../templateParser/generate';
import { getOrgDetailsForReport } from '../reportGenerator/reportUtil';
import { CustomLabelAssessmentInfo } from '../customLabels';
import { Logger } from '../logger';
import { isFoundationPackage, isStandardDataModelWithMetadataAPIEnabled } from '../dataModelService';
import { OSAssessmentReporter } from './OSAssessmentReporter';
import { ApexAssessmentReporter } from './ApexAssessmentReporter';
import { IPAssessmentReporter } from './IPAssessmentReporter';
import { DRAssessmentReporter } from './DRAssessmentReporter';
import { FlexcardAssessmentReporter } from './FlexcardAssessmentReporter';
import { LWCAssessmentReporter } from './LWCAssessmentReporter';
import { GlobalAutoNumberAssessmentReporter } from './GlobalAutoNumberAssessmentReporter';
import { FlexipageAssessmentReporter } from './FlexipageAssessmentReporter';
import { ExperienceSiteAssessmentReporter } from './ExperienceSiteAssessmentReporter';
import { CustomLabelAssessmentReporter } from './CustomLabelAssessmentReporter';

export class AssessmentReporter {
  private static basePath = path.join(process.cwd(), Constants.AssessmentReportsFolderName);
  private static omniscriptAssessmentFileName = 'omniscript_assessment.html';
  private static flexcardAssessmentFileName = 'flexcard_assessment.html';
  private static integrationProcedureAssessmentFileName = 'integration_procedure_assessment.html';
  private static dataMapperAssessmentFileName = 'datamapper_assessment.html';
  private static globalAutoNumberAssessmentFileName = 'globalautonumber_assessment.html';
  private static apexAssessmentFileName = 'apex_assessment.html';
  private static lwcAssessmentFileName = 'lwc_assessment.html';
  private static dashboardFileName = 'dashboard.html';
  private static templateDir = 'templates';
  private static experienceSiteAssessmentFileName = 'experience_site_assessment.html';
  private static flexipageAssessmentFileName = 'flexipage_assessment.html';
  private static customLabelAssessmentFileName = 'customlabel_assessment.html';
  private static dashboardTemplateName = 'dashboard.template';
  private static reportTemplateName = 'assessmentReport.template';
  private static dashboardTemplate = path.join(__dirname, '..', '..', this.templateDir, this.dashboardTemplateName);

  public static async generate(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    assessOnly: string,
    relatedObjects: string[],
    messages: Messages,
    userActionMessages: string[]
  ): Promise<void> {
    fs.mkdirSync(this.basePath, { recursive: true });

    const reports = [];
    const assessmentReportTemplate = fs.readFileSync(
      path.join(__dirname, '..', '..', this.templateDir, this.reportTemplateName),
      'utf8'
    );

    if (!assessOnly) {
      if (!isStandardDataModelWithMetadataAPIEnabled()) {
        reports.push(Constants.Omniscript, Constants.Flexcard, Constants.IntegrationProcedure, Constants.DataMapper);
      }

      reports.push(Constants.CustomLabel);

      // Only add GlobalAutoNumber if it's not a foundation package
      if (!isFoundationPackage()) {
        reports.push(Constants.GlobalAutoNumber);
      }

      this.generateOmniscriptDocument(result, instanceUrl, omnistudioOrgDetails, messages, assessmentReportTemplate);
      this.generateFlexcardDocument(result, instanceUrl, omnistudioOrgDetails, messages, assessmentReportTemplate);
      this.generateIntegrationProcedureDocument(
        result,
        instanceUrl,
        omnistudioOrgDetails,
        messages,
        assessmentReportTemplate
      );
      this.generateDataMapperDocument(result, instanceUrl, omnistudioOrgDetails, messages, assessmentReportTemplate);
      this.generateGlobalAutoNumberDocument(
        result,
        instanceUrl,
        omnistudioOrgDetails,
        messages,
        assessmentReportTemplate
      );
      this.generateCustomLabelDocument(result, instanceUrl, omnistudioOrgDetails, messages, assessmentReportTemplate);
    } else {
      switch (assessOnly) {
        case Constants.Omniscript:
          reports.push(Constants.Omniscript);
          this.generateOmniscriptDocument(
            result,
            instanceUrl,
            omnistudioOrgDetails,
            messages,
            assessmentReportTemplate
          );
          break;

        case Constants.Flexcard:
          reports.push(Constants.Flexcard);
          this.generateFlexcardDocument(result, instanceUrl, omnistudioOrgDetails, messages, assessmentReportTemplate);
          break;

        case Constants.IntegrationProcedure:
          reports.push(Constants.IntegrationProcedure);
          this.generateIntegrationProcedureDocument(
            result,
            instanceUrl,
            omnistudioOrgDetails,
            messages,
            assessmentReportTemplate
          );
          break;

        case Constants.DataMapper:
          reports.push(Constants.DataMapper);
          this.generateDataMapperDocument(
            result,
            instanceUrl,
            omnistudioOrgDetails,
            messages,
            assessmentReportTemplate
          );
          break;

        case Constants.GlobalAutoNumber:
          reports.push(Constants.GlobalAutoNumber);
          this.generateGlobalAutoNumberDocument(
            result,
            instanceUrl,
            omnistudioOrgDetails,
            messages,
            assessmentReportTemplate
          );
          break;

        case Constants.CustomLabel:
          reports.push(Constants.CustomLabel);
          this.generateCustomLabelDocument(
            result,
            instanceUrl,
            omnistudioOrgDetails,
            messages,
            assessmentReportTemplate
          );
          break;

        default:
      }
    }

    if (relatedObjects && relatedObjects.includes(Constants.Apex)) {
      reports.push(Constants.Apex);
      this.generateApexDocument(result, omnistudioOrgDetails, messages, assessmentReportTemplate);
    }

    if (relatedObjects && relatedObjects.includes(Constants.ExpSites)) {
      reports.push(Constants.ExpSites);
      this.generateExperienceSiteDocument(result, omnistudioOrgDetails, messages, assessmentReportTemplate);
    }

    if (relatedObjects && relatedObjects.includes(Constants.FlexiPage)) {
      reports.push(Constants.FlexiPage);
      this.generateFlexipageDocument(result, omnistudioOrgDetails, messages, assessmentReportTemplate);
    }

    if (relatedObjects && relatedObjects.includes(Constants.LWC)) {
      reports.push(Constants.LWC);
      this.generateLWCDocument(result, omnistudioOrgDetails, messages, assessmentReportTemplate);
    }

    // await this.createMasterDocument(nameUrls, basePath);
    this.createDashboard(this.basePath, result, omnistudioOrgDetails, messages, reports, userActionMessages);
    pushAssestUtilites('javascripts', this.basePath);
    pushAssestUtilites('styles', this.basePath);
    await open(path.join(this.basePath, this.dashboardFileName));
  }

  private static generateCustomLabelAssessmentReport(
    customLabels: CustomLabelAssessmentInfo[],
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    assessmentReportTemplate: string
  ): void {
    const pageSize = 1000;
    const totalLabels = customLabels.length;
    // Always generate at least 1 page, even if there are no labels with issues
    const totalPages = Math.max(1, Math.ceil(totalLabels / pageSize));

    // Generate paginated reports
    for (let page = 1; page <= totalPages; page++) {
      const data = CustomLabelAssessmentReporter.getCustomLabelAssessmentData(
        customLabels,
        instanceUrl,
        omnistudioOrgDetails,
        page,
        pageSize
      );

      const html = TemplateParser.generate(assessmentReportTemplate, data, messages);

      const fileName =
        totalPages > 1
          ? `customlabel_assessment_Page_${page}_of_${totalPages}.html`
          : this.customLabelAssessmentFileName;
      fs.writeFileSync(path.join(this.basePath, fileName), html);

      Logger.logVerbose(
        messages.getMessage('generatedCustomLabelAssessmentReportPage', [page, totalPages, data.rows.length])
      );
    }
  }

  private static getCustomLabelAssessmentFileName(totalLabels: number): string {
    const pageSize = 1000;
    // Always generate at least 1 page, even if there are no labels with issues
    const totalPages = Math.max(1, Math.ceil(totalLabels / pageSize));
    return totalPages > 1 ? `customlabel_assessment_Page_1_of_${totalPages}.html` : this.customLabelAssessmentFileName;
  }

  private static createDashboard(
    basePath: string,
    result: AssessmentInfo,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    reports: string[],
    userActionMessages: string[]
  ): void {
    const dashboardTemplate = fs.readFileSync(this.dashboardTemplate, 'utf8');
    this.createDocument(
      path.join(basePath, this.dashboardFileName),
      TemplateParser.generate(
        dashboardTemplate,
        this.createDashboardParam(result, omnistudioOrgDetails, reports, userActionMessages, messages),
        messages
      )
    );
  }
  private static createDashboardParam(
    result: AssessmentInfo,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    reports: string[],
    userActionMessages: string[],
    messages: Messages
  ): DashboardParam {
    const summaryItems: SummaryItemParam[] = [];

    if (reports.includes(Constants.DataMapper)) {
      summaryItems.push(this.createDataMapperSummaryItem(result, messages));
    }
    if (reports.includes(Constants.IntegrationProcedure)) {
      summaryItems.push(this.createIntegrationProcedureSummaryItem(result, messages));
    }
    if (reports.includes(Constants.Omniscript)) {
      summaryItems.push(this.createOmniscriptSummaryItem(result, messages));
    }
    if (reports.includes(Constants.Flexcard)) {
      summaryItems.push(this.createFlexcardSummaryItem(result, messages));
    }
    if (reports.includes(Constants.GlobalAutoNumber)) {
      summaryItems.push(this.createGlobalAutoNumberSummaryItem(result, messages, omnistudioOrgDetails));
    }
    if (reports.includes(Constants.Apex)) {
      summaryItems.push(this.createApexSummaryItem(result));
    }
    if (reports.includes(Constants.FlexiPage)) {
      summaryItems.push(this.createFlexipageSummaryItem(result));
    }
    if (reports.includes(Constants.ExpSites)) {
      summaryItems.push(this.createExperienceSiteSummaryItem(result));
    }
    if (reports.includes(Constants.LWC)) {
      summaryItems.push(this.createLWCSummaryItem(result));
    }
    if (reports.includes(Constants.CustomLabel)) {
      summaryItems.push(this.createCustomLabelSummaryItem(result));
    }

    return {
      title: 'Omnistudio Assessment Report Dashboard',
      heading: 'Omnistudio Assessment Report Dashboard',
      org: getOrgDetailsForReport(omnistudioOrgDetails),
      assessmentDate: new Date().toLocaleString(),
      summaryItems,
      mode: 'assess',
      actionItems: userActionMessages,
    };
  }

  // Summary item creation helper methods
  private static createDataMapperSummaryItem(result: AssessmentInfo, messages: Messages): SummaryItemParam {
    return this.createSummaryItem(
      'Data Mappers',
      result.dataRaptorAssessmentInfos,
      this.dataMapperAssessmentFileName,
      DRAssessmentReporter,
      messages.getMessage('processingNotRequired')
    );
  }

  private static createIntegrationProcedureSummaryItem(result: AssessmentInfo, messages: Messages): SummaryItemParam {
    return this.createSummaryItem(
      'Integration Procedures',
      result.omniAssessmentInfo.ipAssessmentInfos,
      this.integrationProcedureAssessmentFileName,
      IPAssessmentReporter,
      messages.getMessage('processingNotRequired')
    );
  }

  private static createOmniscriptSummaryItem(result: AssessmentInfo, messages: Messages): SummaryItemParam {
    return this.createSummaryItem(
      'Omniscripts',
      result.omniAssessmentInfo.osAssessmentInfos,
      this.omniscriptAssessmentFileName,
      OSAssessmentReporter,
      messages.getMessage('processingNotRequired')
    );
  }

  private static createFlexcardSummaryItem(result: AssessmentInfo, messages: Messages): SummaryItemParam {
    return this.createSummaryItem(
      'Flexcards',
      result.flexCardAssessmentInfos,
      this.flexcardAssessmentFileName,
      FlexcardAssessmentReporter,
      messages.getMessage('processingNotRequired')
    );
  }

  private static createGlobalAutoNumberSummaryItem(
    result: AssessmentInfo,
    messages: Messages,
    omnistudioOrgDetails: OmnistudioOrgDetails
  ): SummaryItemParam {
    const isFoundationPkg = omnistudioOrgDetails.isFoundationPackage;
    return {
      name: 'Omni Global Auto Numbers',
      total: isFoundationPkg ? 0 : result.globalAutoNumberAssessmentInfos.length,
      data: isFoundationPkg
        ? this.getSummaryDataWithCustomMessage(messages.getMessage('globalAutoNumberUnSupportedInOmnistudioPackage'))
        : GlobalAutoNumberAssessmentReporter.getSummaryData(result.globalAutoNumberAssessmentInfos),
      file: this.globalAutoNumberAssessmentFileName,
      showDetails: !isFoundationPkg,
    };
  }

  private static createApexSummaryItem(result: AssessmentInfo): SummaryItemParam {
    return {
      name: 'Apex Classes',
      total: result.apexAssessmentInfos.length,
      data: ApexAssessmentReporter.getSummaryData(result.apexAssessmentInfos),
      file: this.apexAssessmentFileName,
    };
  }

  private static createFlexipageSummaryItem(result: AssessmentInfo): SummaryItemParam {
    return {
      name: 'FlexiPages',
      total: result.flexipageAssessmentInfos.length,
      data: FlexipageAssessmentReporter.getSummaryData(result.flexipageAssessmentInfos),
      file: this.flexipageAssessmentFileName,
    };
  }

  private static createExperienceSiteSummaryItem(result: AssessmentInfo): SummaryItemParam {
    return {
      name: 'Experience Cloud Site Pages',
      total: result.experienceSiteAssessmentInfos.flatMap((info) => info.experienceSiteAssessmentPageInfos).length,
      data: ExperienceSiteAssessmentReporter.getSummaryData(result.experienceSiteAssessmentInfos),
      file: this.experienceSiteAssessmentFileName,
    };
  }

  private static createLWCSummaryItem(result: AssessmentInfo): SummaryItemParam {
    return {
      name: 'Lightning Web Components',
      total: result.lwcAssessmentInfos.length,
      data: LWCAssessmentReporter.getSummaryData(result.lwcAssessmentInfos),
      file: this.lwcAssessmentFileName,
    };
  }

  private static createCustomLabelSummaryItem(result: AssessmentInfo): SummaryItemParam {
    return {
      name: 'Custom Labels',
      total: result.customLabelStatistics.totalLabels,
      data: [
        {
          name: 'Ready for migration',
          count: result.customLabelStatistics.readyForMigration,
          cssClass: 'text-success',
        },
        {
          name: 'Warning',
          count: result.customLabelStatistics.warnings,
          cssClass: 'text-warning',
        },
        {
          name: 'Needs manual intervention',
          count: result.customLabelStatistics.needManualIntervention,
          cssClass: 'text-error',
        },
        {
          name: 'Failed',
          count: result.customLabelStatistics.failed,
          cssClass: 'text-error',
        },
      ],
      file: this.getCustomLabelAssessmentFileName(result.customLabelStatistics.needManualIntervention),
    };
  }

  private static createSummaryItem<T>(
    name: string,
    assessmentData: T[],
    fileName: string,
    reporter: { getSummaryData: (data: T[]) => SummaryItemDetailParam[] },
    customMessage: string
  ): SummaryItemParam {
    return {
      name,
      total: isStandardDataModelWithMetadataAPIEnabled() ? 0 : assessmentData.length,
      data: isStandardDataModelWithMetadataAPIEnabled()
        ? this.getSummaryDataWithCustomMessage(customMessage)
        : reporter.getSummaryData(assessmentData),
      file: fileName,
      showDetails: !isStandardDataModelWithMetadataAPIEnabled(),
    };
  }

  /**
   * Helper method to return "Feature not supported" data for summary items
   */
  private static getSummaryDataWithCustomMessage(customMessage?: string): SummaryItemDetailParam[] {
    return [{ name: customMessage, count: 0, cssClass: 'text-warning' }];
  }

  private static createDocument(filePath: string, htmlBody: string): void {
    fs.writeFileSync(filePath, htmlBody);
  }

  // Individual assessment document generation methods
  private static generateOmniscriptDocument(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    if (isStandardDataModelWithMetadataAPIEnabled()) {
      // For the Orgs having metadata API enabled, we do not need to generate the document
      return;
    }

    this.createDocument(
      path.join(this.basePath, this.omniscriptAssessmentFileName),
      TemplateParser.generate(
        template,
        OSAssessmentReporter.getOmniscriptAssessmentData(
          result.omniAssessmentInfo.osAssessmentInfos,
          instanceUrl,
          omnistudioOrgDetails
        ),
        messages
      )
    );
  }

  private static generateFlexcardDocument(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    if (isStandardDataModelWithMetadataAPIEnabled()) {
      // For the Orgs having metadata API enabled, we do not need to generate the document
      return;
    }

    this.createDocument(
      path.join(this.basePath, this.flexcardAssessmentFileName),
      TemplateParser.generate(
        template,
        FlexcardAssessmentReporter.getFlexcardAssessmentData(
          result.flexCardAssessmentInfos,
          instanceUrl,
          omnistudioOrgDetails
        ),
        messages
      )
    );
  }

  private static generateIntegrationProcedureDocument(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    if (isStandardDataModelWithMetadataAPIEnabled()) {
      // For the Orgs having metadata API enabled, we do not need to generate the document
      return;
    }

    this.createDocument(
      path.join(this.basePath, this.integrationProcedureAssessmentFileName),
      TemplateParser.generate(
        template,
        IPAssessmentReporter.getIntegrationProcedureAssessmentData(
          result.omniAssessmentInfo.ipAssessmentInfos,
          instanceUrl,
          omnistudioOrgDetails
        ),
        messages
      )
    );
  }

  private static generateDataMapperDocument(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    if (isStandardDataModelWithMetadataAPIEnabled()) {
      // For the Orgs having metadata API enabled, we do not need to generate the document
      return;
    }

    this.createDocument(
      path.join(this.basePath, this.dataMapperAssessmentFileName),
      TemplateParser.generate(
        template,
        DRAssessmentReporter.getDatamapperAssessmentData(
          result.dataRaptorAssessmentInfos,
          instanceUrl,
          omnistudioOrgDetails
        ),
        messages
      )
    );
  }

  private static generateGlobalAutoNumberDocument(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    // Only generate if not a foundation package
    if (!isFoundationPackage()) {
      this.createDocument(
        path.join(this.basePath, this.globalAutoNumberAssessmentFileName),
        TemplateParser.generate(
          template,
          GlobalAutoNumberAssessmentReporter.getGlobalAutoNumberAssessmentData(
            result.globalAutoNumberAssessmentInfos,
            instanceUrl,
            omnistudioOrgDetails
          ),
          messages
        )
      );
    }
  }

  private static generateApexDocument(
    result: AssessmentInfo,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    this.createDocument(
      path.join(this.basePath, this.apexAssessmentFileName),
      TemplateParser.generate(
        template,
        ApexAssessmentReporter.getApexAssessmentData(result.apexAssessmentInfos, omnistudioOrgDetails),
        messages
      )
    );
  }

  private static generateExperienceSiteDocument(
    result: AssessmentInfo,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    this.createDocument(
      path.join(this.basePath, this.experienceSiteAssessmentFileName),
      TemplateParser.generate(
        template,
        ExperienceSiteAssessmentReporter.getExperienceSiteAssessmentData(
          result.experienceSiteAssessmentInfos,
          omnistudioOrgDetails
        ),
        messages
      )
    );
  }

  private static generateFlexipageDocument(
    result: AssessmentInfo,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    this.createDocument(
      path.join(this.basePath, this.flexipageAssessmentFileName),
      TemplateParser.generate(
        template,
        FlexipageAssessmentReporter.getFlexipageAssessmentData(result.flexipageAssessmentInfos, omnistudioOrgDetails),
        messages
      )
    );
  }

  private static generateLWCDocument(
    result: AssessmentInfo,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    this.createDocument(
      path.join(this.basePath, this.lwcAssessmentFileName),
      TemplateParser.generate(
        template,
        LWCAssessmentReporter.getLwcAssessmentData(result.lwcAssessmentInfos, omnistudioOrgDetails),
        messages
      )
    );
  }

  private static generateCustomLabelDocument(
    result: AssessmentInfo,
    instanceUrl: string,
    omnistudioOrgDetails: OmnistudioOrgDetails,
    messages: Messages,
    template: string
  ): void {
    // Generate custom labels report with pagination
    const customLabels = result.customLabelAssessmentInfos || [];

    this.generateCustomLabelAssessmentReport(customLabels, instanceUrl, omnistudioOrgDetails, messages, template);
  }
}
