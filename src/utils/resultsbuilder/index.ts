import fs from 'fs';
import path from 'path';
import open from 'open';
import { Messages } from '@salesforce/core';
import { pushAssestUtilites } from '../file/fileUtil';
import {
  ApexAssessmentInfo,
  LWCAssessmentInfo,
  MigratedObject,
  MigratedRecordInfo,
  RelatedObjectAssesmentInfo,
  ExperienceSiteAssessmentInfo,
  FlexiPageAssessmentInfo,
} from '../interfaces';
import {
  ReportParam,
  ReportRowParam,
  SummaryItemDetailParam,
  SummaryItemParam,
  DashboardParam,
} from '../reportGenerator/reportInterfaces';
import { OmnistudioOrgDetails } from '../orgUtils';
import { TemplateParser } from '../templateParser/generate';
import { createFilterGroupParam, createRowDataParam } from '../reportGenerator/reportUtil';
import { FileDiffUtil } from '../lwcparser/fileutils/FileDiffUtil';
import { Logger } from '../logger';
import { getMigrationHeading } from '../stringUtils';
import { Constants } from '../constants/stringContants';
import { reportingHelper } from './reportingHelper';
const resultsDir = path.join(process.cwd(), 'migration_report');
const migrationReportHTMLfileName = 'dashboard.html';
const flexipageFileName = 'flexipage.html';
const templateDir = 'templates';
const reportTemplateName = 'migrationReport.template';
const dashboardTemplateName = 'dashboard.template';
const reportTemplateFilePath = path.join(__dirname, '..', '..', templateDir, reportTemplateName);
const dashboardTemplateFilePath = path.join(__dirname, '..', '..', templateDir, dashboardTemplateName);
const apexFileName = 'apex.html';
const experienceSiteFileName = 'experienceSite.html';
const lwcFileName = 'lwc.html';

export class ResultsBuilder {
  private static rowClass = 'data-row-';
  private static rowId = 0;

  private static flexiPageFileSuffix = '.flexipage-meta.xml';

  public static async generateReport(
    results: MigratedObject[],
    relatedObjectMigrationResult: RelatedObjectAssesmentInfo,
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages,
    actionItems: string[],
    objectsToProcess: string[]
  ): Promise<void> {
    fs.mkdirSync(resultsDir, { recursive: true });
    Logger.info(messages.getMessage('generatingComponentReports'));
    for (const result of results) {
      this.generateReportForResult(result, instanceUrl, orgDetails, messages);
    }
    Logger.info(messages.getMessage('generatingRelatedObjectReports'));
    this.generateReportForRelatedObject(
      relatedObjectMigrationResult,
      instanceUrl,
      orgDetails,
      messages,
      objectsToProcess
    );

    Logger.info(messages.getMessage('generatingMigrationReportDashboard'));
    this.generateMigrationReportDashboard(
      orgDetails,
      results,
      relatedObjectMigrationResult,
      messages,
      actionItems,
      objectsToProcess
    );
    pushAssestUtilites('javascripts', resultsDir);
    pushAssestUtilites('styles', resultsDir);
    await open(path.join(resultsDir, migrationReportHTMLfileName));
  }

  private static generateReportForResult(
    result: MigratedObject,
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages
  ): void {
    Logger.captureVerboseData(`${result.name} data`, result);
    // Determine which rollback flag to use based on component type
    let rollbackFlagNames: string[] = [];
    const componentName = result.name.toLowerCase();
    if (componentName.includes('datamapper') || componentName.includes('data mapper')) {
      rollbackFlagNames = ['RollbackDRChanges'];
    } else if (componentName.includes('omniscript') || componentName.includes('integration procedure')) {
      rollbackFlagNames = ['RollbackOSChanges', 'RollbackIPChanges'];
    } else if (componentName.includes('global auto number') || componentName.includes('globalautonumber')) {
      rollbackFlagNames = ['RollbackDRChanges', 'RollbackIPChanges'];
    }
    const rollbackFlags = orgDetails.rollbackFlags || [];
    const flags = rollbackFlagNames.filter((flag) => rollbackFlags.includes(flag));
    const data: ReportParam = {
      title: `${getMigrationHeading(result.name)} Migration Report`,
      heading: `${getMigrationHeading(result.name)} Migration Report`,
      org: {
        name: orgDetails.orgDetails.Name,
        id: orgDetails.orgDetails.Id,
        namespace: orgDetails.packageDetails.namespace,
        dataModel: orgDetails.dataModel,
      },
      assessmentDate: new Date().toLocaleString(),
      total: result.data?.length || 0,
      filterGroups: [
        createFilterGroupParam('Filter By Status', 'status', ['Successfully migrated', 'Failed', 'Skipped']),
      ],
      headerGroups: [
        {
          header: [
            {
              name: 'Managed Package',
              colspan: 2,
              rowspan: 1,
            },
            {
              name: 'Standard',
              colspan: 2,
              rowspan: 1,
            },
            {
              name: 'Status',
              colspan: 1,
              rowspan: 2,
            },
            {
              name: 'Errors',
              colspan: 1,
              rowspan: 2,
            },
            {
              name: 'Summary',
              colspan: 1,
              rowspan: 2,
            },
          ],
        },
        {
          header: [
            {
              name: 'ID',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Name',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'ID',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Name',
              colspan: 1,
              rowspan: 1,
            },
          ],
        },
      ],
      rows: [
        ...(result.data || []).map((item) => ({
          rowId: `${this.rowClass}${this.rowId++}`,
          data: [
            createRowDataParam('id', item.id, false, 1, 1, true, `${instanceUrl}/${item.id}`),
            createRowDataParam('name', item.name, true, 1, 1, false),
            createRowDataParam('migratedId', item.migratedId, false, 1, 1, true, `${instanceUrl}/${item.migratedId}`),
            createRowDataParam('migratedName', item.migratedName, false, 1, 1, false),
            createRowDataParam(
              'status',
              item.status === 'Complete' ? 'Successfully migrated' : item.status,
              false,
              1,
              1,
              false,
              undefined,
              reportingHelper.decorateStatus(item.status)
            ),
            createRowDataParam(
              'errors',
              item.errors ? 'Failed' : 'Has No Errors',
              false,
              1,
              1,
              false,
              undefined,
              item.errors ? reportingHelper.decorateErrors(item.errors) : []
            ),
            createRowDataParam(
              'summary',
              item.warnings ? 'Warnings' : 'Has No Warnings',
              false,
              1,
              1,
              false,
              undefined,
              item.warnings ? reportingHelper.decorateErrors(item.warnings) : []
            ),
          ],
        })),
      ],
      rollbackFlags: flags.length > 0 ? flags : undefined,
    };

    const reportTemplate = fs.readFileSync(reportTemplateFilePath, 'utf8');
    const html = TemplateParser.generate(reportTemplate, data, messages);
    fs.writeFileSync(path.join(resultsDir, result.name.replace(/ /g, '_').replace(/\//g, '_') + '.html'), html);
  }

  private static generateReportForRelatedObject(
    result: RelatedObjectAssesmentInfo,
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages,
    objectsToProcess: string[]
  ): void {
    if (objectsToProcess.includes(Constants.Apex)) {
      this.generateReportForApex(result.apexAssessmentInfos, instanceUrl, orgDetails, messages);
    }
    if (objectsToProcess.includes(Constants.ExpSites)) {
      this.generateReportForExperienceSites(result.experienceSiteAssessmentInfos, instanceUrl, orgDetails, messages);
    }
    if (objectsToProcess.includes(Constants.FlexiPage)) {
      this.generateReportForFlexipage(result.flexipageAssessmentInfos, instanceUrl, orgDetails, messages);
    }
    if (objectsToProcess.includes(Constants.LWC)) {
      this.generateReportForLwc(result.lwcAssessmentInfos, instanceUrl, orgDetails, messages);
    }
  }

  private static generateReportForExperienceSites(
    result: ExperienceSiteAssessmentInfo[],
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages
  ): void {
    Logger.logVerbose('Generating experience site report');
    const data: ReportParam = {
      title: 'Experience Site',
      heading: 'Experience Site',
      org: {
        name: orgDetails.orgDetails.Name,
        id: orgDetails.orgDetails.Id,
        namespace: orgDetails.packageDetails.namespace,
        dataModel: orgDetails.dataModel,
      },
      assessmentDate: new Date().toString(),
      total: result.length,
      filterGroups: [createFilterGroupParam('Filter by Status', 'status', ['Complete', 'Failed'])],
      headerGroups: [
        {
          header: [
            {
              name: 'ExperienceSite Name',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'File Reference',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Status',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Differences',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Errors',
              colspan: 1,
              rowspan: 1,
            },
          ],
        },
      ],
      rows: result.map((item) => ({
        rowId: `${this.rowClass}${this.rowId++}`,
        data: [
          createRowDataParam('name', item.name, true, 1, 1, false),
          createRowDataParam('path', item.path, false, 1, 1, false),
          createRowDataParam(
            'status',
            item.warnings && item.warnings.length > 0 ? 'Failed' : 'Complete',
            false,
            1,
            1,
            false,
            undefined,
            item.warnings && item.warnings.length > 0 ? 'Failed' : 'Complete'
          ),
          createRowDataParam(
            'diff',
            item.name + 'diff',
            false,
            1,
            1,
            false,
            undefined,
            FileDiffUtil.getDiffHTML(item.diff, this.rowId.toString())
          ),
          createRowDataParam(
            'errors',
            item.warnings && item.warnings.length > 0 ? 'Failed' : 'Complete',
            false,
            1,
            1,
            false,
            undefined,
            item.warnings,
            item.warnings ? 'text-error' : 'text-success'
          ),
        ],
      })),
    };

    const reportTemplate = fs.readFileSync(reportTemplateFilePath, 'utf8');
    const html = TemplateParser.generate(reportTemplate, data, messages);
    Logger.logVerbose('Generating experience site file ' + experienceSiteFileName);
    fs.writeFileSync(path.join(resultsDir, experienceSiteFileName), html);
  }

  private static generateReportForFlexipage(
    result: FlexiPageAssessmentInfo[],
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages
  ): void {
    Logger.captureVerboseData('flexipage data', result);
    const data: ReportParam = {
      title: 'Flexipages',
      heading: 'Flexipages',
      org: {
        name: orgDetails.orgDetails.Name,
        id: orgDetails.orgDetails.Id,
        namespace: orgDetails.packageDetails.namespace,
        dataModel: orgDetails.dataModel,
      },
      assessmentDate: new Date().toString(),
      total: result.length,
      filterGroups: [createFilterGroupParam('Filter by Status', 'status', ['Complete', 'Failed'])],
      headerGroups: [
        {
          header: [
            {
              name: 'Flexipage Name',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'File Reference',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Status',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Code Difference',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Summary',
              colspan: 1,
              rowspan: 1,
            },
          ],
        },
      ],
      rows: result.map((item) => ({
        rowId: `${this.rowClass}${this.rowId++}`,
        data: [
          createRowDataParam(
            'name',
            item.name.substring(0, item.name.length - this.flexiPageFileSuffix.length),
            true,
            1,
            1,
            false
          ),
          createRowDataParam('path', item.name, false, 1, 1, true, item.path),
          createRowDataParam(
            'status',
            item.status,
            false,
            1,
            1,
            false,
            undefined,
            undefined,
            item.status === 'Failed' ? 'text-error' : 'text-success'
          ),
          createRowDataParam('diff', '', false, 1, 1, false, undefined, FileDiffUtil.getDiffHTML(item.diff, item.name)),
          createRowDataParam('error', 'error', false, 1, 1, false, undefined, item.errors, 'text-error'),
        ],
      })),
    };

    const reportTemplate = fs.readFileSync(reportTemplateFilePath, 'utf8');
    const html = TemplateParser.generate(reportTemplate, data, messages);
    fs.writeFileSync(path.join(resultsDir, flexipageFileName), html);
  }

  private static generateReportForApex(
    result: ApexAssessmentInfo[],
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages
  ): void {
    Logger.captureVerboseData('apex data', result);
    const data: ReportParam = {
      title: 'Apex File Migration Report',
      heading: 'Apex File Migration Report',
      org: {
        name: orgDetails.orgDetails.Name,
        id: orgDetails.orgDetails.Id,
        namespace: orgDetails.packageDetails.namespace,
        dataModel: orgDetails.dataModel,
      },
      assessmentDate: new Date().toLocaleString(),
      total: result.length,
      filterGroups: [createFilterGroupParam('Filter by Errors', 'warnings', ['Failed', 'Successfully Completed'])],
      headerGroups: [
        {
          header: [
            {
              name: 'Name',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'File Reference',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Code Difference',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Summary',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Errors',
              colspan: 1,
              rowspan: 1,
            },
          ],
        },
      ],
      rows: result.map((item) => ({
        rowId: `${this.rowClass}${this.rowId++}`,
        data: [
          createRowDataParam('name', item.name, true, 1, 1, false),
          createRowDataParam('path', item.name, false, 1, 1, true, item.path, item.name + '.cls'),
          createRowDataParam(
            'diff',
            item.name + 'diff',
            false,
            1,
            1,
            false,
            undefined,
            FileDiffUtil.getDiffHTML(item.diff, item.name)
          ),
          createRowDataParam(
            'infos',
            item.infos ? item.infos.join(', ') : '',
            false,
            1,
            1,
            false,
            undefined,
            item.infos
          ),
          createRowDataParam(
            'warnings',
            item.warnings.length > 0 ? 'Failed' : 'Successfully Completed',
            false,
            1,
            1,
            false,
            undefined,
            item.warnings.length > 0 ? 'Failed' : 'Successfully Completed',
            item.warnings.length > 0 ? 'text-error' : 'text-success'
          ),
        ],
      })),
    };

    const reportTemplate = fs.readFileSync(reportTemplateFilePath, 'utf8');
    const html = TemplateParser.generate(reportTemplate, data, messages);
    fs.writeFileSync(path.join(resultsDir, apexFileName), html);

    // call generate html from template
  }

  private static generateReportForLwc(
    result: LWCAssessmentInfo[],
    instanceUrl: string,
    orgDetails: OmnistudioOrgDetails,
    messages: Messages
  ): void {
    Logger.captureVerboseData('lwc data', result);
    const data: ReportParam = {
      title: 'LWC Migration Report',
      heading: 'LWC Migration Report',
      org: {
        name: orgDetails.orgDetails.Name,
        id: orgDetails.orgDetails.Id,
        namespace: orgDetails.packageDetails.namespace,
        dataModel: orgDetails.dataModel,
      },
      assessmentDate: new Date().toLocaleString(),
      total: result.length,
      filterGroups: [
        createFilterGroupParam('Filter By Migration Status', 'comments', ['Successfully Completed', 'Failed']),
      ],
      headerGroups: [
        {
          header: [
            {
              name: 'Name',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'File Reference',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'File Diff',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Migration Status',
              colspan: 1,
              rowspan: 1,
            },
            {
              name: 'Errors',
              colspan: 1,
              rowspan: 1,
            },
          ],
        },
      ],
      rows: this.getLwcRowsForReport(result),
    };

    const reportTemplate = fs.readFileSync(reportTemplateFilePath, 'utf8');
    const html = TemplateParser.generate(reportTemplate, data, messages);
    fs.writeFileSync(path.join(resultsDir, lwcFileName), html);
  }

  private static getLwcRowsForReport(lwcAssessmentInfos: LWCAssessmentInfo[]): ReportRowParam[] {
    const rows: ReportRowParam[] = [];

    for (const lwcAssessmentInfo of lwcAssessmentInfos) {
      for (const fileChangeInfo of lwcAssessmentInfo.changeInfos) {
        rows.push({
          rowId: `${this.rowClass}${this.rowId++}`,
          data: [
            createRowDataParam('name', lwcAssessmentInfo.name, true, 1, 1, false),
            createRowDataParam(
              'fileReference',
              fileChangeInfo.name,
              false,
              1,
              1,
              true,
              fileChangeInfo.path,
              fileChangeInfo.name
            ),
            createRowDataParam(
              'diff',
              fileChangeInfo.name + 'diff',
              false,
              1,
              1,
              false,
              undefined,
              FileDiffUtil.getDiffHTML(fileChangeInfo.diff, fileChangeInfo.name)
            ),
            createRowDataParam(
              'comments',
              lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'Failed' : 'Successfully Completed',
              false,
              1,
              1,
              false,
              undefined,
              lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'Failed' : 'Successfully Completed',
              lwcAssessmentInfo.errors && lwcAssessmentInfo.errors.length > 0 ? 'text-error' : 'text-success'
            ),
            createRowDataParam(
              'errors',
              lwcAssessmentInfo.errors ? lwcAssessmentInfo.errors.join(', ') : '',
              false,
              1,
              1,
              false,
              undefined,
              lwcAssessmentInfo.errors ? reportingHelper.decorateErrors(lwcAssessmentInfo.errors) : []
            ),
          ],
        });
      }
    }

    return rows;
  }

  private static generateMigrationReportDashboard(
    orgDetails: OmnistudioOrgDetails,
    results: MigratedObject[],
    relatedObjectMigrationResult: RelatedObjectAssesmentInfo,
    messages: Messages,
    actionItems: string[],
    objectsToProcess: string[]
  ): void {
    const relatedObjectSummaryItems: SummaryItemParam[] = [];
    if (objectsToProcess.includes(Constants.Apex)) {
      relatedObjectSummaryItems.push({
        name: 'Apex File Migration',
        total: relatedObjectMigrationResult.apexAssessmentInfos?.length || 0,
        data: this.getDifferentStatusDataForApex(relatedObjectMigrationResult.apexAssessmentInfos),
        file: apexFileName,
      });
    }
    if (objectsToProcess.includes(Constants.ExpSites)) {
      relatedObjectSummaryItems.push({
        name: 'ExperienceSites',
        total: relatedObjectMigrationResult.experienceSiteAssessmentInfos?.length || 0,
        data: this.getDifferentStatusDataForApex(relatedObjectMigrationResult.experienceSiteAssessmentInfos), // TODO - NEED TO UPDATE
        file: experienceSiteFileName,
      });
    }
    if (objectsToProcess.includes(Constants.FlexiPage)) {
      relatedObjectSummaryItems.push({
        name: 'Flexipage',
        total: relatedObjectMigrationResult.flexipageAssessmentInfos?.length || 0,
        data: this.getDifferentStatusDataForFlexipage(relatedObjectMigrationResult.flexipageAssessmentInfos),
        file: flexipageFileName,
      });
    }
    if (objectsToProcess.includes(Constants.LWC)) {
      relatedObjectSummaryItems.push({
        name: 'Lightning Web Components',
        total: relatedObjectMigrationResult.lwcAssessmentInfos?.length || 0,
        data: this.getDifferentStatusDataForLwc(relatedObjectMigrationResult.lwcAssessmentInfos),
        file: lwcFileName,
      });
    }

    const data: DashboardParam = {
      title: 'Migration Report Dashboard',
      heading: 'Migration Report Dashboard',
      org: {
        name: orgDetails.orgDetails.Name,
        id: orgDetails.orgDetails.Id,
        namespace: orgDetails.packageDetails.namespace,
        dataModel: orgDetails.dataModel,
      },
      assessmentDate: new Date().toLocaleString(),
      summaryItems: [
        ...results.map((result) => ({
          name: `${getMigrationHeading(result.name)} Migration`,
          total: result.data?.length || 0,
          data: this.getDifferentStatusDataForResult(result.data),
          file: result.name.replace(/ /g, '_').replace(/\//g, '_') + '.html',
        })),
        ...relatedObjectSummaryItems,
      ],
      actionItems,
      mode: 'migrate',
    };

    const dashboardTemplate = fs.readFileSync(dashboardTemplateFilePath, 'utf8');
    const html = TemplateParser.generate(dashboardTemplate, data, messages);
    fs.writeFileSync(path.join(resultsDir, 'dashboard.html'), html);
  }

  private static getDifferentStatusDataForResult(
    data: MigratedRecordInfo[]
  ): Array<{ name: string; count: number; cssClass: string }> {
    let complete = 0;
    let error = 0;
    let skip = 0;
    data.forEach((item) => {
      if (item.status === 'Complete') complete++;
      if (item.status === 'Failed') error++;
      if (item.status === 'Skipped') skip++;
    });
    return [
      { name: 'Successfully migrated', count: complete, cssClass: 'text-success' },
      { name: 'Failed', count: error, cssClass: 'text-error' },
      { name: 'Skipped', count: skip, cssClass: 'text-warning' },
    ];
  }

  private static getDifferentStatusDataForApex(
    data: ApexAssessmentInfo[] | ExperienceSiteAssessmentInfo[]
  ): Array<{ name: string; count: number; cssClass: string }> {
    let complete = 0;
    let error = 0;
    data.forEach((item: ApexAssessmentInfo | ExperienceSiteAssessmentInfo) => {
      if (!item.warnings || item.warnings.length === 0) complete++;
      else error++;
    });
    return [
      { name: 'Successfully migrated', count: complete, cssClass: 'text-success' },
      { name: 'Failed', count: error, cssClass: 'text-error' },
    ];
  }

  private static getDifferentStatusDataForFlexipage(data: FlexiPageAssessmentInfo[]): SummaryItemDetailParam[] {
    let completed = 0;
    let failed = 0;
    data.forEach((item) => {
      if (item.status === 'Complete') completed++;
      else failed++;
    });

    return [
      { name: 'Completed', count: completed, cssClass: 'text-success' },
      { name: 'Failed', count: failed, cssClass: 'text-error' },
    ];
  }

  private static getDifferentStatusDataForLwc(data: LWCAssessmentInfo[]): SummaryItemDetailParam[] {
    let completed = 0;
    let failed = 0;
    data.forEach((item) => {
      if (!item.errors || item.errors.length === 0) {
        completed++;
      } else {
        failed++;
      }
    });

    return [
      { name: 'Successfully Completed', count: completed, cssClass: 'text-success' },
      { name: 'Failed', count: failed, cssClass: 'text-error' },
    ];
  }
}
