import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@salesforce/command/lib/test';
import { stubMethod } from '@salesforce/ts-sinon';
import * as sinon from 'sinon';
import { AnyJson } from '@salesforce/ts-types';
import { assert } from 'chai';
import { DataRaptorMigrationTool } from '../../../../migration/dataraptor';
import { CardMigrationTool } from '../../../../migration/flexcard';
import { OmniScriptMigrationTool } from '../../../../migration/omniscript';
import OmnistudioRelatedObjectMigrationFacade from '../../../../migration/related/OmnistudioRelatedObjectMigrationFacade';
import { OrgUtils } from '../../../../utils/orgUtils';

describe('omnistudio:migration:assess', () => {
  let sandbox: sinon.SinonSandbox;
  const assessmentReportsDir = path.join(process.cwd(), 'assessment_reports');

  // Mock org details
  const mockOrgDetailsStandardModel: AnyJson = {
    packageDetails: ['Hello'],
    omniStudioOrgPermissionEnabled: false,
  };

  // Sample data for DataRaptor assessment
  const sampleDataRaptorAssessment = [
    {
      name: 'DR_Test_Extract',
      id: 'a0B1x0000000001',
      formulaChanges: [],
      infos: ['Using standard objects'],
      warnings: ['Consider using standard objects instead of custom objects'],
      apexDependencies: [],
    },
    {
      name: 'DR_Test_Transform',
      id: 'a0B1x0000000002',
      formulaChanges: [],
      infos: ['Using new API methods'],
      warnings: ['Uses deprecated functions'],
      apexDependencies: [],
    },
  ];

  // Sample data for FlexCard assessment
  const sampleFlexCardAssessment = [
    {
      name: 'FC_Test_Card',
      id: 'a0B1x0000000003',
      dependenciesIP: ['IP_Test_Procedure'],
      dependenciesDR: ['DR_Test_Extract'],
      dependenciesOS: ['OS_Test_Script'],
      infos: ['Using Lightning Web Components'],
      warnings: ['Consider using Lightning Web Components'],
    },
    {
      name: 'FC_Test_Form',
      id: 'a0B1x0000000004',
      dependenciesIP: [],
      dependenciesDR: [],
      dependenciesOS: [],
      infos: ['Using new Lightning components'],
      warnings: ['Uses deprecated components'],
    },
  ];

  // Sample data for OmniScript assessment
  const sampleOmniScriptAssessment = {
    osAssessmentInfos: [
      {
        name: 'OS_Test_Script',
        id: 'a0B1x0000000005',
        type: 'LWC',
        dependenciesIP: [],
        missingIP: [],
        dependenciesDR: ['DR_Test_Extract'],
        missingDR: [],
        dependenciesOS: [],
        missingOS: [],
        dependenciesRemoteAction: [],
        dependenciesLWC: [],
        infos: ['Using Lightning Web Components'],
        warnings: ['Consider using Lightning Web Components'],
        errors: [],
      },
    ],
    ipAssessmentInfos: [
      {
        name: 'IP_Test_Procedure',
        id: 'a0B1x0000000006',
        dependenciesIP: [],
        dependenciesDR: ['DR_Test_Transform'],
        dependenciesOS: ['OS_Test_Script'],
        dependenciesRemoteAction: [],
        infos: ['Using new API methods'],
        warnings: ['Uses deprecated methods'],
        errors: [],
        path: '/path/to/ip',
      },
    ],
  };

  // Sample data for Apex assessment
  const sampleApexAssessment = [
    {
      name: 'TestApexClass',
      path: '/path/to/TestApexClass.cls',
      diff: 'Updated to use new API methods',
      warnings: ['Consider using Lightning Web Components'],
      infos: ['File has been updated to allow calls to Omnistudio components'],
    },
  ];

  // Sample data for LWC assessment
  const sampleLwcAssessment = [
    {
      name: 'testLwcComponent',
      changeInfos: [
        {
          name: 'testLwcComponent.js',
          path: '/path/to/testLwcComponent.js',
          diff: 'Updated import statements',
        },
        {
          name: 'testLwcComponent.html',
          path: '/path/to/testLwcComponent.html',
          diff: 'Updated template syntax',
        },
      ],
      errors: ['Uses deprecated methods'],
    },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Mock the assessment tools with sample data
    stubMethod(sandbox, DataRaptorMigrationTool.prototype, 'assess').resolves(sampleDataRaptorAssessment);
    stubMethod(sandbox, CardMigrationTool.prototype, 'assess').resolves(sampleFlexCardAssessment);
    stubMethod(sandbox, OmniScriptMigrationTool.prototype, 'assess').resolves(sampleOmniScriptAssessment);
    // Mock the facade to use our stubbed methods
    stubMethod(sandbox, OmnistudioRelatedObjectMigrationFacade.prototype, 'assessAll').callsFake(
      (relatedObjects: string[]) => {
        const result = {
          apexAssessmentInfos: relatedObjects.includes('apex') ? sampleApexAssessment : [],
          lwcAssessmentInfos: relatedObjects.includes('lwc') ? sampleLwcAssessment : [],
        };
        return result;
      }
    );

    // Mock OrgUtils.getOrgDetails
    stubMethod(sandbox, OrgUtils, 'getOrgDetails').resolves(mockOrgDetailsStandardModel);
  });

  afterEach(() => {
    if (sandbox) {
      sandbox.restore();
    }
    // Clean up assessment reports directory if it exists
    if (fs.existsSync(assessmentReportsDir)) {
      fs.rmSync(assessmentReportsDir, { recursive: true, force: true });
    }
  });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess'])
    .it('generates all assessment files with content for all components', () => {
      // Read and verify DataRaptor assessment file content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.include('Data Mapper Components Assessment');
      expect(dataRaptorContent).to.include('DR_Test_Extract');
      expect(dataRaptorContent).to.include('DR_Test_Transform');

      // Read and verify FlexCard assessment file content
      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.include('Flexcard Components Assessment');
      expect(flexCardContent).to.include('FC_Test_Card');
      expect(flexCardContent).to.include('FC_Test_Form');

      // Read and verify OmniScript assessment file content
      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.include('Omniscript Components Assessment');
      expect(omniScriptContent).to.include('OS_Test_Script');

      // Read and verify Integration Procedure assessment file content
      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.include('Integration Procedure Components Assessment');
      expect(ipContent).to.include('IP_Test_Procedure');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-o', 'dr'])
    .it('generates assessment files with content only for DataRaptor components', () => {
      // Verify DataRaptor assessment file exists and has content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.include('Data Mapper Components Assessment');
      expect(dataRaptorContent).to.include('DR_Test_Extract');
      expect(dataRaptorContent).to.include('DR_Test_Transform');

      // Verify other files exist but have no content
      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.not.include('FC_Test_Card');
      expect(flexCardContent).to.not.include('FC_Test_Form');

      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.not.include('OS_Test_Script');

      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.not.include('IP_Test_Procedure');

      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.not.include('TestApexClass');

      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.not.include('testLwcComponent');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-o', 'fc'])
    .it('generates assessment files with content only for FlexCard components', () => {
      // Verify FlexCard assessment file exists and has content
      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.include('Flexcard Components Assessment');
      expect(flexCardContent).to.include('FC_Test_Card');
      expect(flexCardContent).to.include('FC_Test_Form');

      // Verify other files exist but have no content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.not.include('DR_Test_Extract');
      expect(dataRaptorContent).to.not.include('DR_Test_Transform');

      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.not.include('OS_Test_Script');

      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.not.include('IP_Test_Procedure');

      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.not.include('TestApexClass');

      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.not.include('testLwcComponent');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-o', 'os'])
    .it('generates assessment files with content only for OmniScript components', () => {
      // Verify OmniScript assessment file exists and has content
      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.include('Omniscript Components Assessment');
      expect(omniScriptContent).to.include('OS_Test_Script');

      // Verify other files exist but have no content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.not.include('DR_Test_Extract');
      expect(dataRaptorContent).to.not.include('DR_Test_Transform');

      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.not.include('FC_Test_Card');
      expect(flexCardContent).to.not.include('FC_Test_Form');

      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.include('IP_Test_Procedure');

      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.not.include('TestApexClass');

      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.not.include('testLwcComponent');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-o', 'ip'])
    .it('generates assessment files with content only for Integration Procedure components', () => {
      // Verify Integration Procedure assessment file exists and has content
      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.include('Integration Procedure Components Assessment');
      expect(ipContent).to.include('IP_Test_Procedure');

      // Verify other files exist but have no content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.not.include('DR_Test_Extract');
      expect(dataRaptorContent).to.not.include('DR_Test_Transform');

      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.not.include('FC_Test_Card');
      expect(flexCardContent).to.not.include('FC_Test_Form');

      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.include('OS_Test_Script');

      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.not.include('TestApexClass');

      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.not.include('testLwcComponent');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-o', 'ro'])
    .it('does not generate any assessment files when ro option is passed', () => {
      // Verify that no assessment reports directory exists
      assert.isFalse(fs.existsSync(assessmentReportsDir));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-r', 'apex'])
    .it('generates assessment files with content only for Apex components', () => {
      // Verify Apex assessment file exists and has content
      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.include('Apex Assessment');
      expect(apexContent).to.include('TestApexClass');

      // Verify LWC assessment file exists but has no content
      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.not.include('testLwcComponent');

      // Verify other files exist but have no content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.include('DR_Test_Extract');
      expect(dataRaptorContent).to.include('DR_Test_Transform');

      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.include('FC_Test_Card');
      expect(flexCardContent).to.include('FC_Test_Form');

      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.include('OS_Test_Script');

      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.include('IP_Test_Procedure');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-r', 'lwc'])
    .it('generates assessment files with content only for LWC components', () => {
      // Verify LWC assessment file exists and has content
      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.include('LWC Assessment');
      expect(lwcContent).to.include('testLwcComponent');

      // Verify Apex assessment file exists but has no content
      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.not.include('TestApexClass');

      // Verify other files exist but have no content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.include('DR_Test_Extract');
      expect(dataRaptorContent).to.include('DR_Test_Transform');

      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.include('FC_Test_Card');
      expect(flexCardContent).to.include('FC_Test_Form');

      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.include('OS_Test_Script');

      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.include('IP_Test_Procedure');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['omnistudio:migration:assess', '-r', 'apex,lwc'])
    .it('generates assessment files with content for both Apex and LWC components', () => {
      // Verify Apex assessment file exists and has content
      const apexContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/apex_assessment.html'), 'utf8');
      expect(apexContent).to.include('Apex Assessment');
      expect(apexContent).to.include('TestApexClass');

      // Verify LWC assessment file exists and has content
      const lwcContent = fs.readFileSync(path.join(process.cwd(), 'assessment_reports/lwc_assessment.html'), 'utf8');
      expect(lwcContent).to.include('LWC Assessment');
      expect(lwcContent).to.include('testLwcComponent');

      // Verify other files exist but have no content
      const dataRaptorContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/datamapper_assessment.html'),
        'utf8'
      );
      expect(dataRaptorContent).to.include('DR_Test_Extract');
      expect(dataRaptorContent).to.include('DR_Test_Transform');

      const flexCardContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/flexcard_assessment.html'),
        'utf8'
      );
      expect(flexCardContent).to.include('FC_Test_Card');
      expect(flexCardContent).to.include('FC_Test_Form');

      const omniScriptContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/omniscript_assessment.html'),
        'utf8'
      );
      expect(omniScriptContent).to.include('OS_Test_Script');

      const ipContent = fs.readFileSync(
        path.join(process.cwd(), 'assessment_reports/integration_procedure_assessment.html'),
        'utf8'
      );
      expect(ipContent).to.include('IP_Test_Procedure');
    });
});
