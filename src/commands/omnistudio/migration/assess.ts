import * as os from 'os';
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import OmniStudioBaseCommand from '../../basecommand';
import { AssessmentInfo } from '../../../utils/interfaces';
import { AssessmentReporter } from '../../../utils/resultsbuilder/assessmentReporter';
import { LwcMigration } from '../../../migration/related/LwcMigration';
import { ApexMigration } from '../../../migration/related/ApexMigration';
import { OmniScriptExportType, OmniScriptMigrationTool } from '../../../migration/omniscript';
import { CardMigrationTool } from '../../../migration/flexcard';
import { DataRaptorMigrationTool } from '../../../migration/dataraptor';
import { DebugTimer, DataRaptorAssessmentInfo, FlexCardAssessmentInfo } from '../../../utils';

import { Logger } from '../../../utils/logger';
import OmnistudioRelatedObjectMigrationFacade from '../../../migration/related/OmnistudioRelatedObjectMigrationFacade';
import { OmnistudioOrgDetails, OrgUtils } from '../../../utils/orgUtils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-migration-tool', 'assess');

export default class Assess extends OmniStudioBaseCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    namespace: flags.string({
      char: 'n',
      description: messages.getMessage('namespaceFlagDescription'),
    }),
    only: flags.string({
      char: 'o',
      description: messages.getMessage('onlyFlagDescription'),
    }),
    allversions: flags.boolean({
      char: 'a',
      description: messages.getMessage('allVersionsDescription'),
      required: false,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async run(): Promise<any> {
    DebugTimer.getInstance().start();
    const namespace = (this.flags.namespace || 'vlocity_ins') as string;
    const apiVersion = (this.flags.apiversion || '55.0') as string;
    const allVersions = (this.flags.allversions || false) as boolean;
    const conn = this.org.getConnection();
    const orgs: OmnistudioOrgDetails = await OrgUtils.getOrgDetails(conn, namespace);

    if (orgs.packageDetails.length === 0) {
      this.ux.log('No package installed on given org.');
      return;
    }

    if (orgs.omniStudioOrgPermissionEnabled) {
      this.ux.log('The org is already on standard data model.');
      return;
    }

    Logger.initialiseLogger(this.ux, this.logger);
    const projectDirectory = OmnistudioRelatedObjectMigrationFacade.intializeProject();
    conn.setApiVersion(apiVersion);
    // const lwcparser = new LwcMigration(projectDirectory, namespace, this.org);
    // const apexMigrator = new ApexMigration(projectDirectory, namespace, this.org);
    // const osMigrator = new OmniScriptMigrationTool(
    //   OmniScriptExportType.All,
    //   namespace,
    //   conn,
    //   this.logger,
    //   messages,
    //   this.ux,
    //   allVersions
    // );
    // const flexMigrator = new CardMigrationTool(namespace, conn, this.logger, messages, this.ux, allVersions);
    // const drMigrator = new DataRaptorMigrationTool(namespace, conn, this.logger, messages, this.ux);
    // this.logger.info(namespace);
    // this.ux.log(`Using Namespace: ${namespace}`);

    // const dataRaptorAssessmentInfos: DataRaptorAssessmentInfo[] = await drMigrator.assess();
    // if (dataRaptorAssessmentInfos) {
    //   this.ux.log('dataRaptorAssessmentInfos');
    //   this.ux.log(dataRaptorAssessmentInfos.toString());
    // }
    // const flexCardAssessmentInfos: FlexCardAssessmentInfo[] = await flexMigrator.assess();
    // const omniAssessmentInfo = await osMigrator.assess(dataRaptorAssessmentInfos, flexCardAssessmentInfos);

    // const assesmentInfo: AssessmentInfo = {
    //   lwcAssessmentInfos: lwcparser.assessment(),
    //   apexAssessmentInfos: apexMigrator.assess(),
    //   dataRaptorAssessmentInfos,
    //   flexCardAssessmentInfos,
    //   omniAssessmentInfo,
    // };
    const assesmentInfo: AssessmentInfo = {
  lwcAssessmentInfos: [
    {
      name: "lwcSimpleBseMixin",
      changeInfos: [
        {
          path: "/Users/pranav.varshney/Documents/fork_migration/plugin-omnistudio-migration-tool/omnistudio_migration/force-app/main/default/lwc/lwcSimpleBseMixin/lwcSimpleBseMixin.js",
          name: "lwcSimpleBseMixin.js",
          diff: "<div style=\"color: red;\">- Line 2: import { OmniscriptBaseMixin } from &#039;vlocity_ins/omniscriptBaseMixin&#039;;</div><div style=\"color: green;\">+ Line 2: import { OmniscriptBaseMixin } from &#039;c/omniscriptBaseMixin&#039;;</div>",
        },
      ],
      errors: [
      ],
    },
    {
      name: "myFirstComponent",
      changeInfos: [
        {
          path: "/Users/pranav.varshney/Documents/fork_migration/plugin-omnistudio-migration-tool/omnistudio_migration/force-app/main/default/lwc/myFirstComponent/myFirstComponent.js-meta.xml",
          name: "myFirstComponent.js-meta.xml",
          diff: "<div style=\"color: red;\">- Line 10:     &lt;runtimeNamespace>vlocity_ins&lt;/runtimeNamespace></div><div style=\"color: green;\">+ Line 10:     </div>",
        },
      ],
      errors: [
      ],
    },
  ],
  apexAssessmentInfos: [
    {
      name: "GetContentNoteAsStory",
      warnings: [
      ],
      infos: [
        "File has been updated to allow remote calls from the Omnistudio components",
      ],
      path: "/Users/pranav.varshney/Documents/fork_migration/plugin-omnistudio-migration-tool/omnistudio_migration/force-app/main/default/classes/GetContentNoteAsStory.cls",
      diff: "<div style=\"color: red;\">- Line 2: global with sharing class GetContentNoteAsStory implements vlocity_ins.VlocityOpenInterface2</div><div style=\"color: green;\">+ Line 2: global with sharing class GetContentNoteAsStory implements Callable</div><div style=\"color: green;\">+ Line 4:             public Object call(String action, Map&lt;String,Object> args)</div><div style=\"color: green;\">+ Line 5:             {</div><div style=\"color: green;\">+ Line 6:                 Map&lt;String,Object> inputMap = (Map&lt;String,Object>)args.get(&#039;input&#039;);</div><div style=\"color: green;\">+ Line 7:                 Map&lt;String,Object> outMap = (Map&lt;String,Object>)args.get(&#039;output&#039;);</div><div style=\"color: green;\">+ Line 8:                 Map&lt;String,Object> options = (Map&lt;String,Object>)args.get(&#039;options&#039;);</div><div style=\"color: green;\">+ Line 9: </div><div style=\"color: green;\">+ Line 10:                 return invokeMethod(action, inputMap, outMap, options);</div><div style=\"color: green;\">+ Line 11:             }</div><div style=\"color: green;\">+ Line 12:     </div>",
    },
    {
      name: "UserSecurityService",
      warnings: [
      ],
      infos: [
        "File has been updated to allow remote calls from the Omnistudio components",
      ],
      path: "/Users/pranav.varshney/Documents/fork_migration/plugin-omnistudio-migration-tool/omnistudio_migration/force-app/main/default/classes/UserSecurityService.cls",
      diff: "<div style=\"color: red;\">- Line 1: global with sharing class UserSecurityService implements vlocity_ins.VlocityOpenInterface2 </div><div style=\"color: green;\">+ Line 1: global with sharing class UserSecurityService implements Callable </div><div style=\"color: green;\">+ Line 3:             public Object call(String action, Map&lt;String,Object> args)</div><div style=\"color: green;\">+ Line 4:             {</div><div style=\"color: green;\">+ Line 5:                 Map&lt;String,Object> inputMap = (Map&lt;String,Object>)args.get(&#039;input&#039;);</div><div style=\"color: green;\">+ Line 6:                 Map&lt;String,Object> outMap = (Map&lt;String,Object>)args.get(&#039;output&#039;);</div><div style=\"color: green;\">+ Line 7:                 Map&lt;String,Object> options = (Map&lt;String,Object>)args.get(&#039;options&#039;);</div><div style=\"color: green;\">+ Line 8: </div><div style=\"color: green;\">+ Line 9:                 return invokeMethod(action, inputMap, outMap, options);</div><div style=\"color: green;\">+ Line 10:             }</div><div style=\"color: green;\">+ Line 11:     </div>",
    },
    {
      name: "UserSecurityService2",
      warnings: [
      ],
      infos: [
        "File has been updated to allow remote calls from the Omnistudio components",
      ],
      path: "/Users/pranav.varshney/Documents/fork_migration/plugin-omnistudio-migration-tool/omnistudio_migration/force-app/main/default/classes/UserSecurityService2.cls",
      diff: "<div style=\"color: red;\">- Line 1: global with sharing class UserSecurityService2 implements vlocity_ins.VlocityOpenInterface2</div><div style=\"color: green;\">+ Line 1: global with sharing class UserSecurityService2 implements Callable</div><div style=\"color: green;\">+ Line 3:             public Object call(String action, Map&lt;String,Object> args)</div><div style=\"color: green;\">+ Line 4:             {</div><div style=\"color: green;\">+ Line 5:                 Map&lt;String,Object> inputMap = (Map&lt;String,Object>)args.get(&#039;input&#039;);</div><div style=\"color: green;\">+ Line 6:                 Map&lt;String,Object> outMap = (Map&lt;String,Object>)args.get(&#039;output&#039;);</div><div style=\"color: green;\">+ Line 7:                 Map&lt;String,Object> options = (Map&lt;String,Object>)args.get(&#039;options&#039;);</div><div style=\"color: green;\">+ Line 8: </div><div style=\"color: green;\">+ Line 9:                 return invokeMethod(action, inputMap, outMap, options);</div><div style=\"color: green;\">+ Line 10:             }</div><div style=\"color: green;\">+ Line 11:     </div>",
    },
  ],
  dataRaptorAssessmentInfos: [
    {
      name: "TestAccount",
      id: "a1dWs000001F1HlIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "DRFormula",
      id: "a1dWs000001F1HmIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "DRFormulaQueryAcct",
      id: "a1dWs000001F1HnIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ins_postCensusForEnrollment_OSold",
      id: "a1dWs000001F1HoIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_postCensusForEnrollment_OSold to inspostCensusForEnrollmentOSold",
      ],
    },
    {
      name: "AccloadPooja",
      id: "a1dWs000001F1HpIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "OSMultilineDR",
      id: "a1dWs000001F1HqIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "addRootProductToQuoteTransformer",
      id: "a1dWs000001F1HrIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformQuotePolicyJson-OS",
      id: "a1dWs000001F1HsIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformQuotePolicyJson-OS to TransformQuotePolicyJsonOS",
      ],
    },
    {
      name: "TransformQuoteJson-OS",
      id: "a1dWs000001F1HtIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformQuoteJson-OS to TransformQuoteJsonOS",
      ],
    },
    {
      name: "ExtractUserDetails",
      id: "a1dWs000001F1HuIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "INSBlitzTransformToCreatePolicy",
      id: "a1dWs000001F1HvIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsReinstatedPolicyDetails",
      id: "a1dWs000001F1HwIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TravelersInsuranceCreateQuotePolicyJson-OS",
      id: "a1dWs000001F1HxIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TravelersInsuranceCreateQuotePolicyJson-OS to TravelersInsuranceCreateQuotePolicyJsonOS",
      ],
    },
    {
      name: "OS-PolicyDetailsTransform",
      id: "a1dWs000001F1HyIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from OS-PolicyDetailsTransform to OSPolicyDetailsTransform",
      ],
    },
    {
      name: "GetUserPermissionsSetGroupDetails",
      id: "a1dWs000001F1HzIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getCensusMemberIds",
      id: "a1dWs000001F1I0IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGQuoteGetBrokerInfo",
      id: "a1dWs000001F1I1IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGCreateGroupAndCensus",
      id: "a1dWs000001F1I2IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_ReadPolicyInsuredVehciles_FSCClaimFNOLOS",
      id: "a1dWs000001F1I3IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ReadPolicyInsuredVehciles_FSCClaimFNOLOS to autoReadPolicyInsuredVehcilesFSCClaimFNOLOS",
      ],
    },
    {
      name: "readPolicyLwc",
      id: "a1dWs000001F1I4IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToQuotePolicyCreationLWC",
      id: "a1dWs000001F1I5IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preTransformMultiCarDriver",
      id: "a1dWs000001F1I6IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "demoRecoveryInitiate",
      id: "a1dWs000001F1I7IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_TransToCreatePolicy_IssueOS",
      id: "a1dWs000001F1I8IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransToCreatePolicy_IssueOS to InsTransToCreatePolicyIssueOS",
      ],
    },
    {
      name: "TransformtoCreateMultiRoot",
      id: "a1dWs000001F1I9IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "AccountSearch",
      id: "a1dWs000001F1IAIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
      id: "a1dWs000001F1IBIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP to insClaimsReadInvolvedPropertyOpenCoverageProductRulesIP",
      ],
    },
    {
      name: "CancelPolicy",
      id: "a1dWs000001F1ICIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ModifyAutoQuote-TransformForCreateLWC",
      id: "a1dWs000001F1IDIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyAutoQuote-TransformForCreateLWC to ModifyAutoQuoteTransformForCreateLWC",
      ],
    },
    {
      name: "ModifyAutoQuote-TransformForUpdateLWC",
      id: "a1dWs000001F1IEIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyAutoQuote-TransformForUpdateLWC to ModifyAutoQuoteTransformForUpdateLWC",
      ],
    },
    {
      name: "11 Docu Transform 1016 Clone V2",
      id: "a1dWs000001F1IFIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from 11 Docu Transform 1016 Clone V2 to 11DocuTransform1016CloneV2",
      ],
    },
    {
      name: "transformForQuoteToTemplateLWC",
      id: "a1dWs000001F1IGIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "readQuoteLwc",
      id: "a1dWs000001F1IHIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preTransformMultiCarDriverTwoLists",
      id: "a1dWs000001F1IIIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "acctQuote-PreFill",
      id: "a1dWs000001F1IJIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from acctQuote-PreFill to acctQuotePreFill",
      ],
    },
    {
      name: "ins_readAccountContractDetails_OS",
      id: "a1dWs000001F1IKIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readAccountContractDetails_OS to insreadAccountContractDetailsOS",
      ],
    },
    {
      name: "ins_postCensusForEnrollment_OS",
      id: "a1dWs000001F1ILIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_postCensusForEnrollment_OS to inspostCensusForEnrollmentOS",
      ],
    },
    {
      name: "getTransformCensusMembers",
      id: "a1dWs000001F1IMIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGTransformForQuoteLWC",
      id: "a1dWs000001F1INIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGCreateGroupAndCensusNew",
      id: "a1dWs000001F1IOIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGQuoteGetBrokerInfoNew",
      id: "a1dWs000001F1IPIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transUserInputCM",
      id: "a1dWs000001F1IQIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetUserInputsFromGCMembers",
      id: "a1dWs000001F1IRIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ins_transformInputs_bulkCalculation",
      id: "a1dWs000001F1ISIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_transformInputs_bulkCalculation to instransformInputsbulkCalculation",
      ],
    },
    {
      name: "ExtractCensusMemberRatingFactsStd",
      id: "a1dWs000001F1ITIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preparePolicyJsonFromQuotePolicyJson",
      id: "a1dWs000001F1IUIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToCreatePolicyVersionForModal",
      id: "a1dWs000001F1IVIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getQuoteDetailsforPolicyVersion",
      id: "a1dWs000001F1IWIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionContact",
      id: "a1dWs000001F1IZIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ReadInsurancePolicyTermRecordId",
      id: "a1dWs000001F1IaIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractAccOppFromQuote",
      id: "a1dWs000001F1IbIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetPolicyDetailsPostTransform",
      id: "a1dWs000001F1IcIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_PostInjured_ClaimInjuredIP",
      id: "a1dWs000001F1IdIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostInjured_ClaimInjuredIP to autoPostInjuredClaimInjuredIP",
      ],
    },
    {
      name: "auto_ReadInsuredItem_ClaimFNOLOS",
      id: "a1dWs000001F1IeIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ReadInsuredItem_ClaimFNOLOS to autoReadInsuredItemClaimFNOLOS",
      ],
    },
    {
      name: "auto_ReadPolicyInsuredVehicles_ClaimFNOLOS",
      id: "a1dWs000001F1IfIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ReadPolicyInsuredVehicles_ClaimFNOLOS to autoReadPolicyInsuredVehiclesClaimFNOLOS",
      ],
    },
    {
      name: "readPolicyLWC-OS",
      id: "a1dWs000001F1IgIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from readPolicyLWC-OS to readPolicyLWCOS",
      ],
    },
    {
      name: "testCommission_IP",
      id: "a1dWs000001F1IhIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from testCommission_IP to testCommissionIP",
      ],
    },
    {
      name: "testCommission_IP_2",
      id: "a1dWs000001F1IiIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from testCommission_IP_2 to testCommissionIP2",
      ],
    },
    {
      name: "auto_Trn1PartyVehUpdtClaim_1PartyVehIP",
      id: "a1dWs000001F1IjIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_Trn1PartyVehUpdtClaim_1PartyVehIP to autoTrn1PartyVehUpdtClaim1PartyVehIP",
      ],
    },
    {
      name: "auto_Trn3PartyVehUpdtClaim_3PartyVehIP",
      id: "a1dWs000001F1IkIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_Trn3PartyVehUpdtClaim_3PartyVehIP to autoTrn3PartyVehUpdtClaim3PartyVehIP",
      ],
    },
    {
      name: "auto_Trn3PartyVehUpdtClaim_3PartyVehIPEdit",
      id: "a1dWs000001F1IlIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_Trn3PartyVehUpdtClaim_3PartyVehIPEdit to autoTrn3PartyVehUpdtClaim3PartyVehIPEdit",
      ],
    },
    {
      name: "auto_TrnInjPrsnUpdtClaim_InjPersonIP",
      id: "a1dWs000001F1ImIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TrnInjPrsnUpdtClaim_InjPersonIP to autoTrnInjPrsnUpdtClaimInjPersonIP",
      ],
    },
    {
      name: "QuoteFieldsMappings",
      id: "a1dWs000001F1InIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_Post3PartyDriver_Claim3PartyIP",
      id: "a1dWs000001F1IoIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_Post3PartyDriver_Claim3PartyIP to autoPost3PartyDriverClaim3PartyIP",
      ],
    },
    {
      name: "InsClaim_ReadClaimByClaimId_FNOLOS",
      id: "a1dWs000001F1IpIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from InsClaim_ReadClaimByClaimId_FNOLOS to InsClaimReadClaimByClaimIdFNOLOS",
      ],
    },
    {
      name: "Ins_TransForOptionalParameter_propIP",
      id: "a1dWs000001F1IqIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForOptionalParameter_propIP to InsTransForOptionalParameterpropIP",
      ],
    },
    {
      name: "ModifyLifeQuote-TransformForCreateLWC",
      id: "a1dWs000001F1IrIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyLifeQuote-TransformForCreateLWC to ModifyLifeQuoteTransformForCreateLWC",
      ],
    },
    {
      name: "TransformToCreatePolicyVersion",
      id: "a1dWs000001F1IsIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "opportunitycreate-os",
      id: "a1dWs000001F1ItIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from opportunitycreate-os to opportunitycreateos",
      ],
    },
    {
      name: "CommercialTransformToPolicy",
      id: "a1dWs000001F1IuIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToCreatePolicyVersionOOSEDaily",
      id: "a1dWs000001F1IvIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "prepareAutoDriverDetails",
      id: "a1dWs000001F1IwIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "readAssetLwc",
      id: "a1dWs000001F1IxIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "DR_GetExpectedPolicyVersion",
      id: "a1dWs000001F1IyIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DR_GetExpectedPolicyVersion to DRGetExpectedPolicyVersion",
      ],
    },
    {
      name: "TransformToPolicyVersionCreateModify-OS-For-OOSE-CLONE",
      id: "a1dWs000001F1IzIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformToPolicyVersionCreateModify-OS-For-OOSE-CLONE to TransformToPolicyVersionCreateModifyOSForOOSECLONE",
      ],
    },
    {
      name: "DR_GetReferencePolicyNumber",
      id: "a1dWs000001F1J0IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DR_GetReferencePolicyNumber to DRGetReferencePolicyNumber",
      ],
    },
    {
      name: "DRToGetSourceQuoteFromPolicy",
      id: "a1dWs000001F1J1IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToPolicyVersionRemoveII-OS-For-OOSE",
      id: "a1dWs000001F1J2IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformToPolicyVersionRemoveII-OS-For-OOSE to TransformToPolicyVersionRemoveIIOSForOOSE",
      ],
    },
    {
      name: "updateQuotePolicyJsonWithQuoteId",
      id: "a1dWs000001F1J3IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToCreatePolicyVersionOOSEModal",
      id: "a1dWs000001F1J4IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "MapRatingFactAttributeFromCensusMemberQuote",
      id: "a1dWs000001F1J5IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformQuotePolicyJson-OS-Partner",
      id: "a1dWs000001F1J6IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformQuotePolicyJson-OS-Partner to TransformQuotePolicyJsonOSPartner",
      ],
    },
    {
      name: "prepareUserInputs-AutoOS",
      id: "a1dWs000001F1J7IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prepareUserInputs-AutoOS to prepareUserInputsAutoOS",
      ],
    },
    {
      name: "readInsurancePolicyLwc",
      id: "a1dWs000001F1J8IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "FetchAccountFromUser",
      id: "a1dWs000001F1J9IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformPolicyJSON-OSPartner",
      id: "a1dWs000001F1JAIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformPolicyJSON-OSPartner to TransformPolicyJSONOSPartner",
      ],
    },
    {
      name: "TransformPolicyJSON-OSCC",
      id: "a1dWs000001F1JBIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformPolicyJSON-OSCC to TransformPolicyJSONOSCC",
      ],
    },
    {
      name: "TransformToPolicyVersionCreateModify-OS",
      id: "a1dWs000001F1JCIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformToPolicyVersionCreateModify-OS to TransformToPolicyVersionCreateModifyOS",
      ],
    },
    {
      name: "GetPolicyPremiumDR-OS-CC",
      id: "a1dWs000001F1JDIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from GetPolicyPremiumDR-OS-CC to GetPolicyPremiumDROSCC",
      ],
    },
    {
      name: "InsReadPolicyForReinstatement",
      id: "a1dWs000001F1JEIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToPolicyVersionRemoveII-OS",
      id: "a1dWs000001F1JFIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformToPolicyVersionRemoveII-OS to TransformToPolicyVersionRemoveIIOS",
      ],
    },
    {
      name: "populateInsuredItemsList-removeInsuredOS",
      id: "a1dWs000001F1JGIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from populateInsuredItemsList-removeInsuredOS to populateInsuredItemsListremoveInsuredOS",
      ],
    },
    {
      name: "TravelersInsuranceTransformInputs",
      id: "a1dWs000001F1JHIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TravelersInsuranceTransformInsuredItems",
      id: "a1dWs000001F1JIIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformGroupCensusMember",
      id: "a1dWs000001F1JKIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "MCUSD_CreateProspectAccount",
      id: "a1dWs000001F1JLIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from MCUSD_CreateProspectAccount to MCUSDCreateProspectAccount",
      ],
    },
    {
      name: "TransformToCreateQuoteAutomation",
      id: "a1dWs000001F1JMIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformDataRaptor",
      id: "a1dWs000001F1JNIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsAccountTransactions",
      id: "a1dWs000001F1JOIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsExtractAccountBillingDetails",
      id: "a1dWs000001F1JPIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsExtractAccountDetails",
      id: "a1dWs000001F1JQIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetAccountDetails",
      id: "a1dWs000001F1JRIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetAccountInsurancePolicyList",
      id: "a1dWs000001F1JSIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetAccountPolicyList",
      id: "a1dWs000001F1JTIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetAccountQuoteList",
      id: "a1dWs000001F1JUIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetAssetDetails",
      id: "a1dWs000001F1JVIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetInsurancePolicyDetails",
      id: "a1dWs000001F1JWIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetPolicyClaimList",
      id: "a1dWs000001F1JXIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetPolicyDetails",
      id: "a1dWs000001F1JYIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetPolicyTransactionDetails",
      id: "a1dWs000001F1JZIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetPolicyTransactionList",
      id: "a1dWs000001F1JaIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetQuoteByProducer",
      id: "a1dWs000001F1JbIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetQuoteDetails",
      id: "a1dWs000001F1JcIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsReadAccountContactDetails",
      id: "a1dWs000001F1JdIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsReadAccountDetails",
      id: "a1dWs000001F1JeIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsReadAccountPolicies",
      id: "a1dWs000001F1JfIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsReadAccountPolicyClaims",
      id: "a1dWs000001F1JgIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetContract",
      id: "a1dWs000001F1JkIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetContractAndLineItem",
      id: "a1dWs000001F1JlIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetDocumentTemplateId",
      id: "a1dWs000001F1JmIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetDocumentTemplates",
      id: "a1dWs000001F1JnIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetDocumentTemplatesForType",
      id: "a1dWs000001F1JoIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_ReadAccountDetails_CreateContractOS",
      id: "a1dWs000001F1JpIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadAccountDetails_CreateContractOS to InsReadAccountDetailsCreateContractOS",
      ],
    },
    {
      name: "Ins_ReadAccountDetails_PaymentPlanOS",
      id: "a1dWs000001F1JqIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadAccountDetails_PaymentPlanOS to InsReadAccountDetailsPaymentPlanOS",
      ],
    },
    {
      name: "Ins_ReadDocumentTemplateId_ContractProposalOS",
      id: "a1dWs000001F1JrIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadDocumentTemplateId_ContractProposalOS to InsReadDocumentTemplateIdContractProposalOS",
      ],
    },
    {
      name: "Ins_ReadPolicyDetails_CreateUpdatePolicyIP",
      id: "a1dWs000001F1JsIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadPolicyDetails_CreateUpdatePolicyIP to InsReadPolicyDetailsCreateUpdatePolicyIP",
      ],
    },
    {
      name: "Ins_ReadProductIdForConditionCheck_OS",
      id: "a1dWs000001F1JtIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadProductIdForConditionCheck_OS to InsReadProductIdForConditionCheckOS",
      ],
    },
    {
      name: "UpdateOrderDiscountDate",
      id: "a1dWs000001F1JuIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "UpdatePolicyPreTransform",
      id: "a1dWs000001F1JvIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "UpdateQuoteDiscountDate",
      id: "a1dWs000001F1JwIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "UpdateQuoteStatus",
      id: "a1dWs000001F1JxIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPL-ClaimDocsUpload-104-1",
      id: "a1dWs000001F1JyIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-ClaimDocsUpload-104-1 to VPLClaimDocsUpload1041",
      ],
    },
    {
      name: "DocxExtracter - 1564368962551",
      id: "a1dWs000001F1JzIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocxExtracter - 1564368962551 to DocxExtracter1564368962551",
      ],
    },
    {
      name: "DocxMapper - 1550027066435",
      id: "a1dWs000001F1K0IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocxMapper - 1550027066435 to DocxMapper1550027066435",
      ],
    },
    {
      name: "DocxMapper - 1564368962551",
      id: "a1dWs000001F1K1IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocxMapper - 1564368962551 to DocxMapper1564368962551",
      ],
    },
    {
      name: "ExtrBundleCon1 - 1545187678218",
      id: "a1dWs000001F1K2IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ExtrBundleCon1 - 1545187678218 to ExtrBundleCon11545187678218",
      ],
    },
    {
      name: "ExtrBundleCon1 - 1556511675734",
      id: "a1dWs000001F1K3IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ExtrBundleCon1 - 1556511675734 to ExtrBundleCon11556511675734",
      ],
    },
    {
      name: "Ins_TransVisionProductForEnrollment_IP",
      id: "a1dWs000001F1K4IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransVisionProductForEnrollment_IP to InsTransVisionProductForEnrollmentIP",
      ],
    },
    {
      name: "Ins_TransWcOptionalPremiums_RatingIP",
      id: "a1dWs000001F1K5IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransWcOptionalPremiums_RatingIP to InsTransWcOptionalPremiumsRatingIP",
      ],
    },
    {
      name: "Ins_TransforOneTimePaymentCalc_ApplyIssuePaymentIP",
      id: "a1dWs000001F1K6IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransforOneTimePaymentCalc_ApplyIssuePaymentIP to InsTransforOneTimePaymentCalcApplyIssuePaymentIP",
      ],
    },
    {
      name: "Ins_UpdateClaimName",
      id: "a1dWs000001F1K7IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_UpdateClaimName to InsUpdateClaimName",
      ],
    },
    {
      name: "Ins_UpdateDependentContact_memberEnrollmentIP",
      id: "a1dWs000001F1K8IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_UpdateDependentContact_memberEnrollmentIP to InsUpdateDependentContactmemberEnrollmentIP",
      ],
    },
    {
      name: "DocEXTRACT-64193",
      id: "a1dWs000001F1K9IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocEXTRACT-64193 to DocEXTRACT64193",
      ],
    },
    {
      name: "DocGenSample-ExtractDocumentTemplatesLWC",
      id: "a1dWs000001F1KAIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocGenSample-ExtractDocumentTemplatesLWC to DocGenSampleExtractDocumentTemplatesLWC",
      ],
    },
    {
      name: "DocGenSample-GetDocumentTemplatesForType",
      id: "a1dWs000001F1KBIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocGenSample-GetDocumentTemplatesForType to DocGenSampleGetDocumentTemplatesForType",
      ],
    },
    {
      name: "DocMAPPING-15987",
      id: "a1dWs000001F1KCIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocMAPPING-15987 to DocMAPPING15987",
      ],
    },
    {
      name: "DocxExtracter - 1550027066435",
      id: "a1dWs000001F1KDIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DocxExtracter - 1550027066435 to DocxExtracter1550027066435",
      ],
    },
    {
      name: "CreateLineItems",
      id: "a1dWs000001F1KEIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateOpportunity",
      id: "a1dWs000001F1KFIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateOpportunity-ExistingAccount",
      id: "a1dWs000001F1KGIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CreateOpportunity-ExistingAccount to CreateOpportunityExistingAccount",
      ],
    },
    {
      name: "CreatePolicyAttachment",
      id: "a1dWs000001F1KHIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreatePolicyRenewalAttachment",
      id: "a1dWs000001F1KIIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "MapBundleCon1 - 1545187678218",
      id: "a1dWs000001F1KJIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from MapBundleCon1 - 1545187678218 to MapBundleCon11545187678218",
      ],
    },
    {
      name: "MapBundleCon1 - 1556511675734",
      id: "a1dWs000001F1KKIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from MapBundleCon1 - 1556511675734 to MapBundleCon11556511675734",
      ],
    },
    {
      name: "MapBundleCon1 - 1564466863572",
      id: "a1dWs000001F1KLIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from MapBundleCon1 - 1564466863572 to MapBundleCon11564466863572",
      ],
    },
    {
      name: "MapRatingFactAttributeFromCensusMember",
      id: "a1dWs000001F1KMIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "MapToPlanCreateInterface",
      id: "a1dWs000001F1KNIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateContractVersionLines",
      id: "a1dWs000001F1KOIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteraction",
      id: "a1dWs000001F1KPIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionForAccount",
      id: "a1dWs000001F1KQIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionForContact",
      id: "a1dWs000001F1KRIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionForPolicy",
      id: "a1dWs000001F1KSIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentCategoriesClaim",
      id: "a1dWs000001F1KTIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentCategoriesClaimLineItem",
      id: "a1dWs000001F1KUIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentCategoriesContacts",
      id: "a1dWs000001F1KVIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentPlaceholders",
      id: "a1dWs000001F1KWIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentPlaceholdersClaim",
      id: "a1dWs000001F1KXIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionForPolicyHolder",
      id: "a1dWs000001F1KYIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionForPolicyHolderPrimary",
      id: "a1dWs000001F1KZIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionForPolicyPrimary",
      id: "a1dWs000001F1KaIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInteractionTopics",
      id: "a1dWs000001F1KbIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateInvolvedPropertyforClaim",
      id: "a1dWs000001F1KcIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ModifyRentersAutoQuote-TransformForCreateLWC",
      id: "a1dWs000001F1KdIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyRentersAutoQuote-TransformForCreateLWC to ModifyRentersAutoQuoteTransformForCreateLWC",
      ],
    },
    {
      name: "ModifyRentersQuote-TransformForUpdateLWC",
      id: "a1dWs000001F1KeIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyRentersQuote-TransformForUpdateLWC to ModifyRentersQuoteTransformForUpdateLWC",
      ],
    },
    {
      name: "NYLPaymentExtract",
      id: "a1dWs000001F1KfIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "OSIntegrationTransformCurrencyDropdown",
      id: "a1dWs000001F1KgIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "PricebookEntryToQuoteLineItem",
      id: "a1dWs000001F1KhIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGCreateRenewalOpportunity",
      id: "a1dWs000001F1KiIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGExtractSystemCensus",
      id: "a1dWs000001F1KjIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGGetCensusRateType",
      id: "a1dWs000001F1KkIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGGetQuoteHeader",
      id: "a1dWs000001F1KlIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGGetRecordTypes",
      id: "a1dWs000001F1KmIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_readAccountDetails_MemberEnrollmentOS",
      id: "a1dWs000001F1KnIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_readAccountDetails_MemberEnrollmentOS to InsreadAccountDetailsMemberEnrollmentOS",
      ],
    },
    {
      name: "Ins_transClaim_fscCreateClaimIP",
      id: "a1dWs000001F1KoIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_transClaim_fscCreateClaimIP to InstransClaimfscCreateClaimIP",
      ],
    },
    {
      name: "Ins_transRatingWorkerComp_IP",
      id: "a1dWs000001F1KpIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_transRatingWorkerComp_IP to InstransRatingWorkerCompIP",
      ],
    },
    {
      name: "JsonExtracter - 1540515806391",
      id: "a1dWs000001F1KqIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from JsonExtracter - 1540515806391 to JsonExtracter1540515806391",
      ],
    },
    {
      name: "JsonMapper - 1540515806391",
      id: "a1dWs000001F1KrIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from JsonMapper - 1540515806391 to JsonMapper1540515806391",
      ],
    },
    {
      name: "Fsc_ReadPolicyDetails",
      id: "a1dWs000001F1KsIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Fsc_ReadPolicyDetails to FscReadPolicyDetails",
      ],
    },
    {
      name: "GenerateAutoNumber",
      id: "a1dWs000001F1KtIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GenericDocuSignGetContacts",
      id: "a1dWs000001F1KuIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GenericDocuSignGetDocuments",
      id: "a1dWs000001F1KvIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GenericDocuSignTransformDocuments",
      id: "a1dWs000001F1KwIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ACORDResponseTransform",
      id: "a1dWs000001F1KxIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ACORDSubmit",
      id: "a1dWs000001F1KyIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Account_BusinessSetUp",
      id: "a1dWs000001F1KzIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Account_BusinessSetUp to AccountBusinessSetUp",
      ],
    },
    {
      name: "AmendFrameContract-CreateOppty",
      id: "a1dWs000001F1L0IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from AmendFrameContract-CreateOppty to AmendFrameContractCreateOppty",
      ],
    },
    {
      name: "VPL-ClaimFNOLCreateContact-104-1",
      id: "a1dWs000001F1L1IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-ClaimFNOLCreateContact-104-1 to VPLClaimFNOLCreateContact1041",
      ],
    },
    {
      name: "VPL-ClaimPostIncident-104-1",
      id: "a1dWs000001F1L2IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-ClaimPostIncident-104-1 to VPLClaimPostIncident1041",
      ],
    },
    {
      name: "VPL-ClaimTransformToInjured-104-1",
      id: "a1dWs000001F1L3IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-ClaimTransformToInjured-104-1 to VPLClaimTransformToInjured1041",
      ],
    },
    {
      name: "VPL-CreateNewIndividualAccount-104-1",
      id: "a1dWs000001F1L4IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-CreateNewIndividualAccount-104-1 to VPLCreateNewIndividualAccount1041",
      ],
    },
    {
      name: "VPL-CreateNewProviderAccount-104-1",
      id: "a1dWs000001F1L5IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-CreateNewProviderAccount-104-1 to VPLCreateNewProviderAccount1041",
      ],
    },
    {
      name: "GetActivePortalUsers",
      id: "a1dWs000001F1L6IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetAutoNumber",
      id: "a1dWs000001F1L7IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetBrokerAndInsured",
      id: "a1dWs000001F1L8IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetCensusMembersDetail",
      id: "a1dWs000001F1L9IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetClaimNumber",
      id: "a1dWs000001F1LAIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CalculateTotals",
      id: "a1dWs000001F1LBIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CancelPolicyGetPolicyDetails",
      id: "a1dWs000001F1LCIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CancelTransformtoCreateVersion",
      id: "a1dWs000001F1LDIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CancellingPolicyPretransform",
      id: "a1dWs000001F1LEIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentPlaceholdersClaimLineItem",
      id: "a1dWs000001F1LFIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "DRE_getPolicyDetails_MTA_Reversal",
      id: "a1dWs000001F1LGIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DRE_getPolicyDetails_MTA_Reversal to DREgetPolicyDetailsMTAReversal",
      ],
    },
    {
      name: "DRGetContact",
      id: "a1dWs000001F1LHIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "DRP_InsPolicyUndoReversal",
      id: "a1dWs000001F1LIIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from DRP_InsPolicyUndoReversal to DRPInsPolicyUndoReversal",
      ],
    },
    {
      name: "DeactivatePortalUsers",
      id: "a1dWs000001F1LJIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_UpdateQuoteStatus_IssuePolicy",
      id: "a1dWs000001F1LKIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_UpdateQuoteStatus_IssuePolicy to InsUpdateQuoteStatusIssuePolicy",
      ],
    },
    {
      name: "Ins_getCensusMemberDetails",
      id: "a1dWs000001F1LLIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_getCensusMemberDetails to InsgetCensusMemberDetails",
      ],
    },
    {
      name: "Ins_postContactToCencusMember",
      id: "a1dWs000001F1LMIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_postContactToCencusMember to InspostContactToCencusMember",
      ],
    },
    {
      name: "Ins_postContractUniqueName_createContract",
      id: "a1dWs000001F1LNIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_postContractUniqueName_createContract to InspostContractUniqueNamecreateContract",
      ],
    },
    {
      name: "Ins_postQuoteStatus_createContractOS",
      id: "a1dWs000001F1LOIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_postQuoteStatus_createContractOS to InspostQuoteStatuscreateContractOS",
      ],
    },
    {
      name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
      id: "a1dWs000001F1LPIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP to insClaimsReadInvolvedInsuredPropertyOpenCoverageProductRulesIP",
      ],
    },
    {
      name: "insClaims_ReadParticipant_ParticipantIP",
      id: "a1dWs000001F1LQIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadParticipant_ParticipantIP to insClaimsReadParticipantParticipantIP",
      ],
    },
    {
      name: "insClaims_ReadPartyIdByAccountId_ClaimFNOLOS",
      id: "a1dWs000001F1LRIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPartyIdByAccountId_ClaimFNOLOS to insClaimsReadPartyIdByAccountIdClaimFNOLOS",
      ],
    },
    {
      name: "insClaims_ReadPartyRelationshipType_FNOLOS",
      id: "a1dWs000001F1LSIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPartyRelationshipType_FNOLOS to insClaimsReadPartyRelationshipTypeFNOLOS",
      ],
    },
    {
      name: "KBBGetMakesRequest",
      id: "a1dWs000001F1LTIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetMakesResponse",
      id: "a1dWs000001F1LUIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetModelsRequest",
      id: "a1dWs000001F1LVIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetModelsResponse",
      id: "a1dWs000001F1LWIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetTrimsRequest",
      id: "a1dWs000001F1LXIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "AutoAddVehicleSetAutosTransform",
      id: "a1dWs000001F1LYIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "BenefitsEnrollmentPMCreateGroupCensus",
      id: "a1dWs000001F1LZIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CC_TransformToOpptyQuotePolicyCreation",
      id: "a1dWs000001F1LaIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CC_TransformToOpptyQuotePolicyCreation to CCTransformToOpptyQuotePolicyCreation",
      ],
    },
    {
      name: "CPQ - Get Order Members",
      id: "a1dWs000001F1LbIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CPQ - Get Order Members to CPQGetOrderMembers",
      ],
    },
    {
      name: "CPQ - Lock Group and Members",
      id: "a1dWs000001F1LcIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CPQ - Lock Group and Members to CPQLockGroupandMembers",
      ],
    },
    {
      name: "KBBGetTrimsResponse",
      id: "a1dWs000001F1LdIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetValuationsResponse",
      id: "a1dWs000001F1LeIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetYearsRequest",
      id: "a1dWs000001F1LfIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBGetYearsResponse",
      id: "a1dWs000001F1LgIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "KBBValuationsRequest",
      id: "a1dWs000001F1LhIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ClaimFNOL-PostLawsuit",
      id: "a1dWs000001F1LiIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ClaimFNOL-PostLawsuit to ClaimFNOLPostLawsuit",
      ],
    },
    {
      name: "ClaimFNOL-TransformVerification",
      id: "a1dWs000001F1LjIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ClaimFNOL-TransformVerification to ClaimFNOLTransformVerification",
      ],
    },
    {
      name: "ClaimLineitemsDocUpload",
      id: "a1dWs000001F1LkIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CombineMembersAndDentalProduct",
      id: "a1dWs000001F1LlIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CombineMembersAndMedicalProduct",
      id: "a1dWs000001F1LmIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_TransForGetRatedProducts_QuoteOS",
      id: "a1dWs000001F1LnIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransForGetRatedProducts_QuoteOS to autoTransForGetRatedProductsQuoteOS",
      ],
    },
    {
      name: "auto_TransInjuredPersonUpdateClaim_ClaimInjuredPersonIP",
      id: "a1dWs000001F1LoIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransInjuredPersonUpdateClaim_ClaimInjuredPersonIP to autoTransInjuredPersonUpdateClaimClaimInjuredPersonIP",
      ],
    },
    {
      name: "auto_TransInjuredPersonUpdateFSCClaim_ClaimInjuredPersonIP",
      id: "a1dWs000001F1LpIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransInjuredPersonUpdateFSCClaim_ClaimInjuredPersonIP to autoTransInjuredPersonUpdateFSCClaimClaimInjuredPersonIP",
      ],
    },
    {
      name: "auto_TransInjuredPersonUpdateFSCClaim_ClaimInjuredPersonIPEdit",
      id: "a1dWs000001F1LqIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransInjuredPersonUpdateFSCClaim_ClaimInjuredPersonIPEdit to autoTransInjuredPersonUpdateFSCClaimClaimInjuredPersonIPEdit",
      ],
    },
    {
      name: "auto_TransThirdPartyVehicleUpdateClaim_ClaimThirdPartyVehicleIP",
      id: "a1dWs000001F1LrIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransThirdPartyVehicleUpdateClaim_ClaimThirdPartyVehicleIP to autoTransThirdPartyVehicleUpdateClaimClaimThirdPartyVehicleIP",
      ],
    },
    {
      name: "auto_TransDriversforDiscounts_ReusableDriverInputOS",
      id: "a1dWs000001F1LsIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransDriversforDiscounts_ReusableDriverInputOS to autoTransDriversforDiscountsReusableDriverInputOS",
      ],
    },
    {
      name: "auto_TransFirstPartyInjuryUpdateFSCClaim_CreateAutoClaimIP",
      id: "a1dWs000001F1LtIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransFirstPartyInjuryUpdateFSCClaim_CreateAutoClaimIP to autoTransFirstPartyInjuryUpdateFSCClaimCreateAutoClaimIP",
      ],
    },
    {
      name: "auto_TransFirstPartyVehicleUpdateClaim_ClaimFirstPartyVehicleIP",
      id: "a1dWs000001F1LuIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransFirstPartyVehicleUpdateClaim_ClaimFirstPartyVehicleIP to autoTransFirstPartyVehicleUpdateClaimClaimFirstPartyVehicleIP",
      ],
    },
    {
      name: "auto_TransFirstPartyVehicleUpdateFSCClaim_ClaimFirstPartyVehicleIP",
      id: "a1dWs000001F1LvIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransFirstPartyVehicleUpdateFSCClaim_ClaimFirstPartyVehicleIP to autoTransFirstPartyVehicleUpdateFSCClaimClaimFirstPartyVehicleIP",
      ],
    },
    {
      name: "auto_TransForCreateQuote_CreateUpdateQuoteIP",
      id: "a1dWs000001F1LwIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransForCreateQuote_CreateUpdateQuoteIP to autoTransForCreateQuoteCreateUpdateQuoteIP",
      ],
    },
    {
      name: "GetTestContract",
      id: "a1dWs000001F1LxIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetTrailingDocRequirements",
      id: "a1dWs000001F1LyIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetTrailingDocRequirementsClaim",
      id: "a1dWs000001F1LzIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ModifyAutoQuote-TransformForCreate",
      id: "a1dWs000001F1M0IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyAutoQuote-TransformForCreate to ModifyAutoQuoteTransformForCreate",
      ],
    },
    {
      name: "ModifyAutoQuote-TransformForUpdate",
      id: "a1dWs000001F1M1IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyAutoQuote-TransformForUpdate to ModifyAutoQuoteTransformForUpdate",
      ],
    },
    {
      name: "ModifyLifeQuote-TransformForUpdateLWC",
      id: "a1dWs000001F1M2IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ModifyLifeQuote-TransformForUpdateLWC to ModifyLifeQuoteTransformForUpdateLWC",
      ],
    },
    {
      name: "insClaims_ReadPolicyolderClaimantId_ClaimFNOLOS",
      id: "a1dWs000001F1M3IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPolicyolderClaimantId_ClaimFNOLOS to insClaimsReadPolicyolderClaimantIdClaimFNOLOS",
      ],
    },
    {
      name: "insClaims_ReadProduct2_ClaimFNOLOS",
      id: "a1dWs000001F1M4IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadProduct2_ClaimFNOLOS to insClaimsReadProduct2ClaimFNOLOS",
      ],
    },
    {
      name: "insClaims_UpdateAccountClaimPartyRelationship_ParticipantIP",
      id: "a1dWs000001F1M5IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_UpdateAccountClaimPartyRelationship_ParticipantIP to insClaimsUpdateAccountClaimPartyRelationshipParticipantIP",
      ],
    },
    {
      name: "insClaims_UpdateClaimParticipant_ParticipantIP",
      id: "a1dWs000001F1M6IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_UpdateClaimParticipant_ParticipantIP to insClaimsUpdateClaimParticipantParticipantIP",
      ],
    },
    {
      name: "insClaims_UpdateContact",
      id: "a1dWs000001F1M7IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_UpdateContact to insClaimsUpdateContact",
      ],
    },
    {
      name: "GetEnrollingCensusMemberId",
      id: "a1dWs000001F1M8IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetLastTestUser",
      id: "a1dWs000001F1M9IAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetMultiDocumentTemplatesForType",
      id: "a1dWs000001F1MAIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetNewContactDetailsFromId",
      id: "a1dWs000001F1MBIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetOpenEnrollmentContractAndContact",
      id: "a1dWs000001F1MCIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getOriginalPolicyVersion",
      id: "a1dWs000001F1MDIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getPolicyForTransactionCreation",
      id: "a1dWs000001F1MEIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getProductId",
      id: "a1dWs000001F1MFIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getRatingFactSpec",
      id: "a1dWs000001F1MGIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getUserForContact",
      id: "a1dWs000001F1MHIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateAccount",
      id: "a1dWs000001F1MIIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateAcctOpptyContact",
      id: "a1dWs000001F1MJIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateAssetTransaction2",
      id: "a1dWs000001F1MKIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateClaimTransaction",
      id: "a1dWs000001F1MLIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateContactInteractionTopic",
      id: "a1dWs000001F1MMIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "insClaims_ReadParty_OpenCoverageProductRulesIP",
      id: "a1dWs000001F1MNIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadParty_OpenCoverageProductRulesIP to insClaimsReadPartyOpenCoverageProductRulesIP",
      ],
    },
    {
      name: "insClaims_ReadPolicyCoverages_AddPolicyAssetsIP",
      id: "a1dWs000001F1MOIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPolicyCoverages_AddPolicyAssetsIP to insClaimsReadPolicyCoveragesAddPolicyAssetsIP",
      ],
    },
    {
      name: "insClaims_ReadPolicyProperty_FSCClaimFNOLOS",
      id: "a1dWs000001F1MPIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPolicyProperty_FSCClaimFNOLOS to insClaimsReadPolicyPropertyFSCClaimFNOLOS",
      ],
    },
    {
      name: "insClaims_ReadPolicy_ClaimFNOLOS",
      id: "a1dWs000001F1MQIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPolicy_ClaimFNOLOS to insClaimsReadPolicyClaimFNOLOS",
      ],
    },
    {
      name: "insClaims_ReadPolicy_FSCClaimFNOLOS",
      id: "a1dWs000001F1MRIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadPolicy_FSCClaimFNOLOS to insClaimsReadPolicyFSCClaimFNOLOS",
      ],
    },
    {
      name: "auto_TransThirdPartyVehicleUpdateFSCClaim_ClaimThirdPartyVehicleIP",
      id: "a1dWs000001F1MSIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransThirdPartyVehicleUpdateFSCClaim_ClaimThirdPartyVehicleIP to autoTransThirdPartyVehicleUpdateFSCClaimClaimThirdPartyVehicleIP",
      ],
    },
    {
      name: "auto_TransThirdPartyVehicleUpdateFSCClaim_ClaimThirdPartyVehicleIPEdit",
      id: "a1dWs000001F1MTIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransThirdPartyVehicleUpdateFSCClaim_ClaimThirdPartyVehicleIPEdit to autoTransThirdPartyVehicleUpdateFSCClaimClaimThirdPartyVehicleIPEdit",
      ],
    },
    {
      name: "auto_TranstoMergeAutosAndDrivers_MergeDriversInsuredItemsIP",
      id: "a1dWs000001F1MUIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TranstoMergeAutosAndDrivers_MergeDriversInsuredItemsIP to autoTranstoMergeAutosAndDriversMergeDriversInsuredItemsIP",
      ],
    },
    {
      name: "auto_TurboReadStateJurisdiction_ReusableAddDriversOS",
      id: "a1dWs000001F1MVIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TurboReadStateJurisdiction_ReusableAddDriversOS to autoTurboReadStateJurisdictionReusableAddDriversOS",
      ],
    },
    {
      name: "auto_postWitness_IP",
      id: "a1dWs000001F1MWIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_postWitness_IP to autopostWitnessIP",
      ],
    },
    {
      name: "getFSCPolicyRevenue",
      id: "a1dWs000001F1MXIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getGroupCensusMemberIds",
      id: "a1dWs000001F1MYIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getGroupContactId",
      id: "a1dWs000001F1MZIA0",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getImageDocumentId",
      id: "a1dWs000001F1MaIAK",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getInsuredItemsPostTransformModify",
      id: "a1dWs000001F1eLIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGUpdateQuoteDetails",
      id: "a1dWs000001F1eMIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SICTypeAhead",
      id: "a1dWs000001F1eNIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SaveCensusMemberAndContact",
      id: "a1dWs000001F1eOIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SavePrimaryMemberAndContact",
      id: "a1dWs000001F1ePIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SetClaimLineItemStatusToPaymentApproved",
      id: "a1dWs000001F1eQIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_PostThirdPartyDriverContact_ClaimThirdPartyVehicleIPEdit",
      id: "a1dWs000001F1eRIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostThirdPartyDriverContact_ClaimThirdPartyVehicleIPEdit to autoPostThirdPartyDriverContactClaimThirdPartyVehicleIPEdit",
      ],
    },
    {
      name: "auto_ReadInsuredItem_FSCClaimFNOLOS",
      id: "a1dWs000001F1eSIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ReadInsuredItem_FSCClaimFNOLOS to autoReadInsuredItemFSCClaimFNOLOS",
      ],
    },
    {
      name: "auto_ReadQuote_QuoteOS",
      id: "a1dWs000001F1eTIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ReadQuote_QuoteOS to autoReadQuoteQuoteOS",
      ],
    },
    {
      name: "auto_ReadStateJurisdiction_ReusableAddDriversOS",
      id: "a1dWs000001F1eUIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ReadStateJurisdiction_ReusableAddDriversOS to autoReadStateJurisdictionReusableAddDriversOS",
      ],
    },
    {
      name: "extractInsuredItems",
      id: "a1dWs000001F1eVIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "extractInvolvedProperty",
      id: "a1dWs000001F1eWIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "extractQLIProductSpec",
      id: "a1dWs000001F1eXIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "formularyDrugPriceSearch",
      id: "a1dWs000001F1eYIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "formularySearchPreTransform",
      id: "a1dWs000001F1eZIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "insClaim_PostAuthorityReport_ClaimFNOLOS",
      id: "a1dWs000001F1eaIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaim_PostAuthorityReport_ClaimFNOLOS to insClaimPostAuthorityReportClaimFNOLOS",
      ],
    },
    {
      name: "insClaim_PostWitnessContact_ClaimWitnessIP",
      id: "a1dWs000001F1ebIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaim_PostWitnessContact_ClaimWitnessIP to insClaimPostWitnessContactClaimWitnessIP",
      ],
    },
    {
      name: "insClaim_ReadFSCClaimByClaimId_FNOLOS",
      id: "a1dWs000001F1ecIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaim_ReadFSCClaimByClaimId_FNOLOS to insClaimReadFSCClaimByClaimIdFNOLOS",
      ],
    },
    {
      name: "insClaim_ReadInsuranceParticipantId_FNOLOS",
      id: "a1dWs000001F1edIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaim_ReadInsuranceParticipantId_FNOLOS to insClaimReadInsuranceParticipantIdFNOLOS",
      ],
    },
    {
      name: "insClaim_ReadPartyIdByContactId_ClaimFNOLOS",
      id: "a1dWs000001F1eeIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaim_ReadPartyIdByContactId_ClaimFNOLOS to insClaimReadPartyIdByContactIdClaimFNOLOS",
      ],
    },
    {
      name: "VPL-UpdateIndividualAccountwithContact-104-1",
      id: "a1dWs000001F1efIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-UpdateIndividualAccountwithContact-104-1 to VPLUpdateIndividualAccountwithContact1041",
      ],
    },
    {
      name: "VPL-readQuoteConfirmation-103-1",
      id: "a1dWs000001F1egIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-readQuoteConfirmation-103-1 to VPLreadQuoteConfirmation1031",
      ],
    },
    {
      name: "VPLAccountQuotePreFill1021",
      id: "a1dWs000001F1ehIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPLClaimFNOL-CreateContact-RespParty1021",
      id: "a1dWs000001F1eiIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPLClaimFNOL-CreateContact-RespParty1021 to VPLClaimFNOLCreateContactRespParty1021",
      ],
    },
    {
      name: "VPLCreateAccount1021",
      id: "a1dWs000001F1ejIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGTransformToCreateContract",
      id: "a1dWs000001F1ekIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGTransformToCreateQuote",
      id: "a1dWs000001F1elIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGTransformToRenewQuote",
      id: "a1dWs000001F1emIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGUpdateGroupDetails",
      id: "a1dWs000001F1enIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "insClaim_TransWitnessUpdateClaim_ClaimWitnessIP",
      id: "a1dWs000001F1eoIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaim_TransWitnessUpdateClaim_ClaimWitnessIP to insClaimTransWitnessUpdateClaimClaimWitnessIP",
      ],
    },
    {
      name: "insClaims_PostParticipantAsAccountToFSCClaim_ClaimIPs",
      id: "a1dWs000001F1epIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_PostParticipantAsAccountToFSCClaim_ClaimIPs to insClaimsPostParticipantAsAccountToFSCClaimClaimIPs",
      ],
    },
    {
      name: "insClaims_PostParticipantAsContactToFSCClaim_ClaimIPs",
      id: "a1dWs000001F1eqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_PostParticipantAsContactToFSCClaim_ClaimIPs to insClaimsPostParticipantAsContactToFSCClaimClaimIPs",
      ],
    },
    {
      name: "insClaims_PostUpdateClaimPartyRelatiopnshipName_FNOLOS",
      id: "a1dWs000001F1erIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_PostUpdateClaimPartyRelatiopnshipName_FNOLOS to insClaimsPostUpdateClaimPartyRelatiopnshipNameFNOLOS",
      ],
    },
    {
      name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
      id: "a1dWs000001F1esIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP to insClaimsReadAssetCoverageOpenCoverageProductRulesIP",
      ],
    },
    {
      name: "insClaims_ReadClaimPartyRelationshipById",
      id: "a1dWs000001F1etIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadClaimPartyRelationshipById to insClaimsReadClaimPartyRelationshipById",
      ],
    },
    {
      name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
      id: "a1dWs000001F1euIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadClaim_OpenCoverageProductRulesIP to insClaimsReadClaimOpenCoverageProductRulesIP",
      ],
    },
    {
      name: "insClaims_ReadExistingUniqueClaimCoverages_FNOLOS",
      id: "a1dWs000001F1evIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadExistingUniqueClaimCoverages_FNOLOS to insClaimsReadExistingUniqueClaimCoveragesFNOLOS",
      ],
    },
    {
      name: "insClaims_ReadFSCParticipant_ParticipantIP",
      id: "a1dWs000001F1ewIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadFSCParticipant_ParticipantIP to insClaimsReadFSCParticipantParticipantIP",
      ],
    },
    {
      name: "insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP",
      id: "a1dWs000001F1exIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP to insClaimsReadInvolvedInjuryOpenCoverageProductRulesIP",
      ],
    },
    {
      name: "A202_User",
      id: "a1dWs000001F1eyIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from A202_User to A202User",
      ],
    },
    {
      name: "VPL-ReadAccount-100-1",
      id: "a1dWs000001F1ezIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-ReadAccount-100-1 to VPLReadAccount1001",
      ],
    },
    {
      name: "VPL-UpdateIndividualAccount-104-2",
      id: "a1dWs000001F1f0IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-UpdateIndividualAccount-104-2 to VPLUpdateIndividualAccount1042",
      ],
    },
    {
      name: "VPLCreateOpportunity1021",
      id: "a1dWs000001F1f1IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPLHomeownerPreReCalc1011",
      id: "a1dWs000001F1f2IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPLHomeownerProductTransform1011",
      id: "a1dWs000001F1f3IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPLHomeownerProductTransformForPolicy1011",
      id: "a1dWs000001F1f4IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPLHomeownersTransformforQuote1011",
      id: "a1dWs000001F1f5IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_PostInjuredPersonContact_ClaimInjuredPersonIP",
      id: "a1dWs000001F1f6IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostInjuredPersonContact_ClaimInjuredPersonIP to autoPostInjuredPersonContactClaimInjuredPersonIP",
      ],
    },
    {
      name: "auto_PostInjuredPersonContact_ClaimInjuredPersonIPEdit",
      id: "a1dWs000001F1f7IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostInjuredPersonContact_ClaimInjuredPersonIPEdit to autoPostInjuredPersonContactClaimInjuredPersonIPEdit",
      ],
    },
    {
      name: "auto_PostOppty_QuoteOS",
      id: "a1dWs000001F1f8IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostOppty_QuoteOS to autoPostOpptyQuoteOS",
      ],
    },
    {
      name: "auto_PostPolicyholderToClaim_ClaimFNOLOS",
      id: "a1dWs000001F1f9IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostPolicyholderToClaim_ClaimFNOLOS to autoPostPolicyholderToClaimClaimFNOLOS",
      ],
    },
    {
      name: "auto_PostThirdPartyDriverContact_ClaimThirdPartyVehicleIP",
      id: "a1dWs000001F1fAIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostThirdPartyDriverContact_ClaimThirdPartyVehicleIP to autoPostThirdPartyDriverContactClaimThirdPartyVehicleIP",
      ],
    },
    {
      name: "auto_ExtRecordType",
      id: "a1dWs000001F1fBIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ExtRecordType to autoExtRecordType",
      ],
    },
    {
      name: "auto_ExtrPersAcctDetails_QuoteOS",
      id: "a1dWs000001F1fCIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ExtrPersAcctDetails_QuoteOS to autoExtrPersAcctDetailsQuoteOS",
      ],
    },
    {
      name: "auto_ExtrProducer_QuoteOS",
      id: "a1dWs000001F1fDIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_ExtrProducer_QuoteOS to autoExtrProducerQuoteOS",
      ],
    },
    {
      name: "auto_PostAcctOppty_ReusableDriverInputOS",
      id: "a1dWs000001F1fEIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostAcctOppty_ReusableDriverInputOS to autoPostAcctOpptyReusableDriverInputOS",
      ],
    },
    {
      name: "auto_PostDriverContact_IP",
      id: "a1dWs000001F1fFIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_PostDriverContact_IP to autoPostDriverContactIP",
      ],
    },
    {
      name: "TransformToTrim",
      id: "a1dWs000001F1fGIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformforRenewals",
      id: "a1dWs000001F1fHIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformforTPA",
      id: "a1dWs000001F1fIIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformforTempHousing",
      id: "a1dWs000001F1fJIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "UpdateContractAndLine",
      id: "a1dWs000001F1fKIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractPolicyInfo",
      id: "a1dWs000001F1fLIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractPolicyInfoForPayment",
      id: "a1dWs000001F1fMIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "FSC_PostUniqueValuesAndSourceQuote_CreateUpdatePolicyIP",
      id: "a1dWs000001F1fNIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from FSC_PostUniqueValuesAndSourceQuote_CreateUpdatePolicyIP to FSCPostUniqueValuesAndSourceQuoteCreateUpdatePolicyIP",
      ],
    },
    {
      name: "FSC_ReadPolicyDetails_CreateUpdatePolicyIP",
      id: "a1dWs000001F1fOIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from FSC_ReadPolicyDetails_CreateUpdatePolicyIP to FSCReadPolicyDetailsCreateUpdatePolicyIP",
      ],
    },
    {
      name: "FSC_TransToCreatePolicy_CreateUpdatePolicyIP",
      id: "a1dWs000001F1fPIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from FSC_TransToCreatePolicy_CreateUpdatePolicyIP to FSCTransToCreatePolicyCreateUpdatePolicyIP",
      ],
    },
    {
      name: "SetClaimLineItemStatusToPaymentPending",
      id: "a1dWs000001F1fQIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SetLastTestUser",
      id: "a1dWs000001F1fRIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SetTestContractToNewAccountCensus",
      id: "a1dWs000001F1fSIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Trans_getSelectedItemsData_claimsOS",
      id: "a1dWs000001F1fTIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Trans_getSelectedItemsData_claimsOS to TransgetSelectedItemsDataclaimsOS",
      ],
    },
    {
      name: "TransformHomeToQuotePolicyCreate",
      id: "a1dWs000001F1fUIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_transCreatePolicyVersion",
      id: "a1dWs000001F1fVIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_transCreatePolicyVersion to autotransCreatePolicyVersion",
      ],
    },
    {
      name: "auto_transWitness_IP",
      id: "a1dWs000001F1fWIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_transWitness_IP to autotransWitnessIP",
      ],
    },
    {
      name: "bopConfigureProduct-Pre",
      id: "a1dWs000001F1fXIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from bopConfigureProduct-Pre to bopConfigureProductPre",
      ],
    },
    {
      name: "bopGetProducts-Pre-new",
      id: "a1dWs000001F1fYIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from bopGetProducts-Pre-new to bopGetProductsPrenew",
      ],
    },
    {
      name: "bopTransformForPolicyCreation",
      id: "a1dWs000001F1fZIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "auto_TransAutoAndDriverInsuredItems_MergeAutoInsuredItemsIP",
      id: "a1dWs000001F1faIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransAutoAndDriverInsuredItems_MergeAutoInsuredItemsIP to autoTransAutoAndDriverInsuredItemsMergeAutoInsuredItemsIP",
      ],
    },
    {
      name: "auto_TransAutoAndDriverInsuredItems_MergeAutoInsuredItemsIPManual",
      id: "a1dWs000001F1fbIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransAutoAndDriverInsuredItems_MergeAutoInsuredItemsIPManual to autoTransAutoAndDriverInsuredItemsMergeAutoInsuredItemsIPManual",
      ],
    },
    {
      name: "auto_TransCreateFSCClaim_CreateClaimIP",
      id: "a1dWs000001F1fcIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransCreateFSCClaim_CreateClaimIP to autoTransCreateFSCClaimCreateClaimIP",
      ],
    },
    {
      name: "auto_TransDriverInput_MergeDriversInsuredItemsIP",
      id: "a1dWs000001F1fdIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransDriverInput_MergeDriversInsuredItemsIP to autoTransDriverInputMergeDriversInsuredItemsIP",
      ],
    },
    {
      name: "auto_TransDriverUserInputs_ReusableDriverInputOS",
      id: "a1dWs000001F1feIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from auto_TransDriverUserInputs_ReusableDriverInputOS to autoTransDriverUserInputsReusableDriverInputOS",
      ],
    },
    {
      name: "VPLReadPolicyConfirmation1021",
      id: "a1dWs000001F1ffIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "VPLReadQuoteConfirmation1021",
      id: "a1dWs000001F1fgIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "WholeLife-Illustration-Pre",
      id: "a1dWs000001F1fhIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from WholeLife-Illustration-Pre to WholeLifeIllustrationPre",
      ],
    },
    {
      name: "WholeLifeInsuredTransform",
      id: "a1dWs000001F1fiIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "WholeLife_ConfigRePrice_Pre",
      id: "a1dWs000001F1fjIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from WholeLife_ConfigRePrice_Pre to WholeLifeConfigRePricePre",
      ],
    },
    {
      name: "bopTransformationForQuoteCreation",
      id: "a1dWs000001F1fkIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "claimPolicyPrefill",
      id: "a1dWs000001F1flIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "createPaymentMethodpolicy",
      id: "a1dWs000001F1fmIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "createPolicyStatement",
      id: "a1dWs000001F1fnIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "doc_ReadForContract_CreateContractOS",
      id: "a1dWs000001F1foIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from doc_ReadForContract_CreateContractOS to docReadForContractCreateContractOS",
      ],
    },
    {
      name: "TransformInputsforOneTimePayment",
      id: "a1dWs000001F1fpIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformNewInteraction",
      id: "a1dWs000001F1fqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformPolicyforOneTimePayment",
      id: "a1dWs000001F1frIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToPolicyModify",
      id: "a1dWs000001F1fsIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToPolicyModifyLWC",
      id: "a1dWs000001F1ftIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_PostBillingAccount_PaymentPlanOS",
      id: "a1dWs000001F1fuIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostBillingAccount_PaymentPlanOS to InsPostBillingAccountPaymentPlanOS",
      ],
    },
    {
      name: "Ins_PostOldPolicyVersion_FscOS",
      id: "a1dWs000001F1fvIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostOldPolicyVersion_FscOS to InsPostOldPolicyVersionFscOS",
      ],
    },
    {
      name: "Ins_PostPaymentMethod_PaymentPlansOS",
      id: "a1dWs000001F1fwIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPaymentMethod_PaymentPlansOS to InsPostPaymentMethodPaymentPlansOS",
      ],
    },
    {
      name: "Ins_PostPolicyDetailsTerm_IP",
      id: "a1dWs000001F1fxIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPolicyDetailsTerm_IP to InsPostPolicyDetailsTermIP",
      ],
    },
    {
      name: "Ins_PostPolicyDetails_Additional",
      id: "a1dWs000001F1fyIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPolicyDetails_Additional to InsPostPolicyDetailsAdditional",
      ],
    },
    {
      name: "Ins_PostPolicyDetails_Dental",
      id: "a1dWs000001F1fzIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPolicyDetails_Dental to InsPostPolicyDetailsDental",
      ],
    },
    {
      name: "Ins_PostPolicyDetails_Vision",
      id: "a1dWs000001F1g0IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPolicyDetails_Vision to InsPostPolicyDetailsVision",
      ],
    },
    {
      name: "Ins_PostPolicyDetails_memberEnrollmentMed",
      id: "a1dWs000001F1g1IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPolicyDetails_memberEnrollmentMed to InsPostPolicyDetailsmemberEnrollmentMed",
      ],
    },
    {
      name: "Ins_PostPolicy_IssuePmtIP",
      id: "a1dWs000001F1g2IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostPolicy_IssuePmtIP to InsPostPolicyIssuePmtIP",
      ],
    },
    {
      name: "Ins_ReadAccountAndOpportunityDetails_QuoteCreationOS",
      id: "a1dWs000001F1g3IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadAccountAndOpportunityDetails_QuoteCreationOS to InsReadAccountAndOpportunityDetailsQuoteCreationOS",
      ],
    },
    {
      name: "GetOriginalPolicyDetails",
      id: "a1dWs000001F1g4IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetPartyIdByContactId",
      id: "a1dWs000001F1g5IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetPartyIdsForDrivers",
      id: "a1dWs000001F1g6IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetProducts",
      id: "a1dWs000001F1g7IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "GetProfileIdCustomerCommunityPlus",
      id: "a1dWs000001F1g8IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Quote Discount Extract - Create",
      id: "a1dWs000001F1g9IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Quote Discount Extract - Create to QuoteDiscountExtractCreate",
      ],
    },
    {
      name: "Quote Discount Extract - Update",
      id: "a1dWs000001F1gAIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Quote Discount Extract - Update to QuoteDiscountExtractUpdate",
      ],
    },
    {
      name: "ReadPersonWholeLife",
      id: "a1dWs000001F1gBIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "RenewTransformtoCreate",
      id: "a1dWs000001F1gCIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ins_ReadAccountContextType_GetQuoteContextIP",
      id: "a1dWs000001F1gDIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadAccountContextType_GetQuoteContextIP to insReadAccountContextTypeGetQuoteContextIP",
      ],
    },
    {
      name: "ins_ReadBusinessAccount_GetQuoteContextIP",
      id: "a1dWs000001F1gEIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadBusinessAccount_GetQuoteContextIP to insReadBusinessAccountGetQuoteContextIP",
      ],
    },
    {
      name: "ins_ReadCensusMemberError_OS",
      id: "a1dWs000001F1gFIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadCensusMemberError_OS to insReadCensusMemberErrorOS",
      ],
    },
    {
      name: "ins_ReadContactByContactId",
      id: "a1dWs000001F1gGIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadContactByContactId to insReadContactByContactId",
      ],
    },
    {
      name: "ins_ReadContactByPartyId",
      id: "a1dWs000001F1gHIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadContactByPartyId to insReadContactByPartyId",
      ],
    },
    {
      name: "ins_CensusContact_Load",
      id: "a1dWs000001F1gIIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_CensusContact_Load to insCensusContactLoad",
      ],
    },
    {
      name: "ins_ExtDocumentTemplateId_QuoteProposalOS",
      id: "a1dWs000001F1gJIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ExtDocumentTemplateId_QuoteProposalOS to insExtDocumentTemplateIdQuoteProposalOS",
      ],
    },
    {
      name: "ins_ExtQuoteDetails_QuoteWrapUpOS",
      id: "a1dWs000001F1gKIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ExtQuoteDetails_QuoteWrapUpOS to insExtQuoteDetailsQuoteWrapUpOS",
      ],
    },
    {
      name: "ins_FSCGetPolicyInfo_CreateIP",
      id: "a1dWs000001F1gLIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_FSCGetPolicyInfo_CreateIP to insFSCGetPolicyInfoCreateIP",
      ],
    },
    {
      name: "prop_TransScheduledItemUpdateFSCClaim_FSCFNOL",
      id: "a1dWs000001F1gMIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransScheduledItemUpdateFSCClaim_FSCFNOL to propTransScheduledItemUpdateFSCClaimFSCFNOL",
      ],
    },
    {
      name: "prop_TransThirdPartyPropertyUpdateClaim_FNOLOS",
      id: "a1dWs000001F1gNIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransThirdPartyPropertyUpdateClaim_FNOLOS to propTransThirdPartyPropertyUpdateClaimFNOLOS",
      ],
    },
    {
      name: "prop_TransUpdateClaimFirstPartyDamages_CreateClaimIP",
      id: "a1dWs000001F1gOIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransUpdateClaimFirstPartyDamages_CreateClaimIP to propTransUpdateClaimFirstPartyDamagesCreateClaimIP",
      ],
    },
    {
      name: "prop_TransVerifyCoverageResults_ClaimFNOLOS",
      id: "a1dWs000001F1gPIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransVerifyCoverageResults_ClaimFNOLOS to propTransVerifyCoverageResultsClaimFNOLOS",
      ],
    },
    {
      name: "prop_TransWitnessNewUpdate_ClaimInjuredPersonIP",
      id: "a1dWs000001F1gQIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransWitnessNewUpdate_ClaimInjuredPersonIP to propTransWitnessNewUpdateClaimInjuredPersonIP",
      ],
    },
    {
      name: "ins_UpdateCensusMember",
      id: "a1dWs000001F1gRIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_UpdateCensusMember to insUpdateCensusMember",
      ],
    },
    {
      name: "ins_createProducer_issuePolicy",
      id: "a1dWs000001F1gSIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_createProducer_issuePolicy to inscreateProducerissuePolicy",
      ],
    },
    {
      name: "ins_filterProducts_createContract",
      id: "a1dWs000001F1gTIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_filterProducts_createContract to insfilterProductscreateContract",
      ],
    },
    {
      name: "ins_getPolicyParticipants",
      id: "a1dWs000001F1gUIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_getPolicyParticipants to insgetPolicyParticipants",
      ],
    },
    {
      name: "ins_getPolicyholderContactId_ClaimFNOL",
      id: "a1dWs000001F1gVIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_getPolicyholderContactId_ClaimFNOL to insgetPolicyholderContactIdClaimFNOL",
      ],
    },
    {
      name: "multiAutoPreReprice",
      id: "a1dWs000001F1gWIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "participant_AccountSearch",
      id: "a1dWs000001F1gXIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from participant_AccountSearch to participantAccountSearch",
      ],
    },
    {
      name: "payment_PostPaymentMethod_OTPIssueOS",
      id: "a1dWs000001F1gYIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from payment_PostPaymentMethod_OTPIssueOS to paymentPostPaymentMethodOTPIssueOS",
      ],
    },
    {
      name: "pet_PostAccountOppty_QuoteOS",
      id: "a1dWs000001F1gZIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from pet_PostAccountOppty_QuoteOS to petPostAccountOpptyQuoteOS",
      ],
    },
    {
      name: "pet_TransCreateInsuredItems_QuoteOS",
      id: "a1dWs000001F1gaIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from pet_TransCreateInsuredItems_QuoteOS to petTransCreateInsuredItemsQuoteOS",
      ],
    },
    {
      name: "prop_ReadAssetCoverages_ClaimLineItemIP",
      id: "a1dWs000001F1gbIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_ReadAssetCoverages_ClaimLineItemIP to propReadAssetCoveragesClaimLineItemIP",
      ],
    },
    {
      name: "prop_ReadPolicyInsuredItem_ClaimFNOLOS",
      id: "a1dWs000001F1gcIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_ReadPolicyInsuredItem_ClaimFNOLOS to propReadPolicyInsuredItemClaimFNOLOS",
      ],
    },
    {
      name: "prop_TransCreateClaim_CreateClaimIP",
      id: "a1dWs000001F1gdIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransCreateClaim_CreateClaimIP to propTransCreateClaimCreateClaimIP",
      ],
    },
    {
      name: "prop_TransFirstPartyPropertyUpdateFSCClaim_ClaimFirstPartyPropertyIP",
      id: "a1dWs000001F1geIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransFirstPartyPropertyUpdateFSCClaim_ClaimFirstPartyPropertyIP to propTransFirstPartyPropertyUpdateFSCClaimClaimFirstPartyPropertyIP",
      ],
    },
    {
      name: "prop_TransHO3UserInputs_QuoteTransForConfigIP",
      id: "a1dWs000001F1gfIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransHO3UserInputs_QuoteTransForConfigIP to propTransHO3UserInputsQuoteTransForConfigIP",
      ],
    },
    {
      name: "property_postOtherPropertyContactEdit_claimFSCEdit",
      id: "a1dWs000001F1ggIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from property_postOtherPropertyContactEdit_claimFSCEdit to propertypostOtherPropertyContactEditclaimFSCEdit",
      ],
    },
    {
      name: "property_postWitnessContact_CreateClaimIP",
      id: "a1dWs000001F1ghIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from property_postWitnessContact_CreateClaimIP to propertypostWitnessContactCreateClaimIP",
      ],
    },
    {
      name: "quoteUpdate",
      id: "a1dWs000001F1giIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "readPolicyConfirmation",
      id: "a1dWs000001F1gjIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getAccountDetails",
      id: "a1dWs000001F1gkIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getContractNumber",
      id: "a1dWs000001F1glIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getFSCPolicyDetail",
      id: "a1dWs000001F1gmIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_ReadQuoteDetails_CreationIP",
      id: "a1dWs000001F1gnIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadQuoteDetails_CreationIP to InsReadQuoteDetailsCreationIP",
      ],
    },
    {
      name: "Ins_ReadQuoteLineItems_IP",
      id: "a1dWs000001F1goIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadQuoteLineItems_IP to InsReadQuoteLineItemsIP",
      ],
    },
    {
      name: "Ins_TransAdditionalProductForEnrollment_IP",
      id: "a1dWs000001F1gpIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransAdditionalProductForEnrollment_IP to InsTransAdditionalProductForEnrollmentIP",
      ],
    },
    {
      name: "Ins_TransDentalProductForEnrollment_IP",
      id: "a1dWs000001F1gqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransDentalProductForEnrollment_IP to InsTransDentalProductForEnrollmentIP",
      ],
    },
    {
      name: "Ins_TransForContract_CreateContractOS",
      id: "a1dWs000001F1grIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForContract_CreateContractOS to InsTransForContractCreateContractOS",
      ],
    },
    {
      name: "transformForQuoteToTemplateGrant",
      id: "a1dWs000001F1gsIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformForTemplate",
      id: "a1dWs000001F1gtIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformforLossCLIs",
      id: "a1dWs000001F1guIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformtest",
      id: "a1dWs000001F1gvIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ins_ReadPartyByAccountId",
      id: "a1dWs000001F1gwIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadPartyByAccountId to insReadPartyByAccountId",
      ],
    },
    {
      name: "ins_ReadPartyByContactId",
      id: "a1dWs000001F1gxIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadPartyByContactId to insReadPartyByContactId",
      ],
    },
    {
      name: "ins_ReadPersonAccountDetails_GetQuoteContextIP",
      id: "a1dWs000001F1gyIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadPersonAccountDetails_GetQuoteContextIP to insReadPersonAccountDetailsGetQuoteContextIP",
      ],
    },
    {
      name: "ins_ReadProducer_GetQuoteContextIP",
      id: "a1dWs000001F1gzIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadProducer_GetQuoteContextIP to insReadProducerGetQuoteContextIP",
      ],
    },
    {
      name: "ins_TransForCreateQuote_CreateQuoteIP",
      id: "a1dWs000001F1h0IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_TransForCreateQuote_CreateQuoteIP to insTransForCreateQuoteCreateQuoteIP",
      ],
    },
    {
      name: "readProducer",
      id: "a1dWs000001F1h1IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "readQuoteConfirmation",
      id: "a1dWs000001F1h2IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterGetSelectedValuePretransform",
      id: "a1dWs000001F1h3IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterPreReCalc",
      id: "a1dWs000001F1h4IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ins_PostContact",
      id: "a1dWs000001F1h5IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_PostContact to insPostContact",
      ],
    },
    {
      name: "ins_PostPersonAccount_createPersonAccountOS",
      id: "a1dWs000001F1h6IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_PostPersonAccount_createPersonAccountOS to insPostPersonAccountcreatePersonAccountOS",
      ],
    },
    {
      name: "ins_ReadAccountByAccountId",
      id: "a1dWs000001F1h7IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadAccountByAccountId to insReadAccountByAccountId",
      ],
    },
    {
      name: "ins_ReadAccountByPartyId",
      id: "a1dWs000001F1h8IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadAccountByPartyId to insReadAccountByPartyId",
      ],
    },
    {
      name: "ins_readCensusMemberPlans",
      id: "a1dWs000001F1h9IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readCensusMemberPlans to insreadCensusMemberPlans",
      ],
    },
    {
      name: "ins_readInsuredPartySpecId_IP",
      id: "a1dWs000001F1hAIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readInsuredPartySpecId_IP to insreadInsuredPartySpecIdIP",
      ],
    },
    {
      name: "ins_readPolicyparticipantsById",
      id: "a1dWs000001F1hBIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readPolicyparticipantsById to insreadPolicyparticipantsById",
      ],
    },
    {
      name: "ins_transCensusMemberPlans",
      id: "a1dWs000001F1hCIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_transCensusMemberPlans to instransCensusMemberPlans",
      ],
    },
    {
      name: "ins_updateQuote",
      id: "a1dWs000001F1hDIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_updateQuote to insupdateQuote",
      ],
    },
    {
      name: "transformDamagedProperty",
      id: "a1dWs000001F1hEIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformForGetModifiedPolicy",
      id: "a1dWs000001F1hFIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformForQuoteForRentersLWC",
      id: "a1dWs000001F1hGIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformForQuoteToLifeTemplate",
      id: "a1dWs000001F1hHIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "transformForQuoteToLifeTemplateLWC",
      id: "a1dWs000001F1hIIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "UpdateContractDiscounts - Oppty",
      id: "a1dWs000001F1hJIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from UpdateContractDiscounts - Oppty to UpdateContractDiscountsOppty",
      ],
    },
    {
      name: "UpdateContractDiscounts - Order",
      id: "a1dWs000001F1hKIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from UpdateContractDiscounts - Order to UpdateContractDiscountsOrder",
      ],
    },
    {
      name: "UpdateContractDiscounts - Quote",
      id: "a1dWs000001F1hLIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from UpdateContractDiscounts - Quote to UpdateContractDiscountsQuote",
      ],
    },
    {
      name: "UpdateContractVersion",
      id: "a1dWs000001F1hMIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "UpdateOpptyDiscountDate",
      id: "a1dWs000001F1hNIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getFSCPolicyDetailGeneric",
      id: "a1dWs000001F1hOIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "prop_PostContact_AddThirdPartyPropertyToClaimIP",
      id: "a1dWs000001F1hPIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_PostContact_AddThirdPartyPropertyToClaimIP to propPostContactAddThirdPartyPropertyToClaimIP",
      ],
    },
    {
      name: "prop_PostInjuredPartyContact_ClaimInjuredPersonNew",
      id: "a1dWs000001F1hQIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_PostInjuredPartyContact_ClaimInjuredPersonNew to propPostInjuredPartyContactClaimInjuredPersonNew",
      ],
    },
    {
      name: "prop_PostInjuredPersonContact_ClaimInjuredPersonIP",
      id: "a1dWs000001F1hRIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_PostInjuredPersonContact_ClaimInjuredPersonIP to propPostInjuredPersonContactClaimInjuredPersonIP",
      ],
    },
    {
      name: "prop_PostPolicyholderToClaim_CreateClaimIP",
      id: "a1dWs000001F1hSIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_PostPolicyholderToClaim_CreateClaimIP to propPostPolicyholderToClaimCreateClaimIP",
      ],
    },
    {
      name: "prop_TransHO4UserInputs_QuoteTransForConfigIP",
      id: "a1dWs000001F1hTIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransHO4UserInputs_QuoteTransForConfigIP to propTransHO4UserInputsQuoteTransForConfigIP",
      ],
    },
    {
      name: "prop_TransInjuredPersonNewUpdate_ClaimInjuredPersonIP",
      id: "a1dWs000001F1hUIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransInjuredPersonNewUpdate_ClaimInjuredPersonIP to propTransInjuredPersonNewUpdateClaimInjuredPersonIP",
      ],
    },
    {
      name: "prop_TransInjuredPersonUpdateClaim_ClaimInjuredPersonIP",
      id: "a1dWs000001F1hVIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransInjuredPersonUpdateClaim_ClaimInjuredPersonIP to propTransInjuredPersonUpdateClaimClaimInjuredPersonIP",
      ],
    },
    {
      name: "prop_TransInsuredItemsRental_QuoteTransForConfigIP",
      id: "a1dWs000001F1hWIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransInsuredItemsRental_QuoteTransForConfigIP to propTransInsuredItemsRentalQuoteTransForConfigIP",
      ],
    },
    {
      name: "prop_TransInsuredItems_QuoteTransForConfigIP",
      id: "a1dWs000001F1hXIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_TransInsuredItems_QuoteTransForConfigIP to propTransInsuredItemsQuoteTransForConfigIP",
      ],
    },
    {
      name: "updateFSCPolicyDetailGeneric",
      id: "a1dWs000001F1hYIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "updateFSCPolicyRevenue",
      id: "a1dWs000001F1hZIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "updatePolicyforOneTimePaymentAccount",
      id: "a1dWs000001F1haIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "watercraftPrefRecCalc",
      id: "a1dWs000001F1hbIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "watercraftProductTransform-ExistingCustomer",
      id: "a1dWs000001F1hcIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from watercraftProductTransform-ExistingCustomer to watercraftProductTransformExistingCustomer",
      ],
    },
    {
      name: "prop_addScheduledItemsCreateAsset_ScheduledItemIP",
      id: "a1dWs000001F1hdIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_addScheduledItemsCreateAsset_ScheduledItemIP to propaddScheduledItemsCreateAssetScheduledItemIP",
      ],
    },
    {
      name: "prop_createInjuredParticipants_claimIP",
      id: "a1dWs000001F1heIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_createInjuredParticipants_claimIP to propcreateInjuredParticipantsclaimIP",
      ],
    },
    {
      name: "prop_createInsuranceParticipants_claimCreateIP",
      id: "a1dWs000001F1hfIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_createInsuranceParticipants_claimCreateIP to propcreateInsuranceParticipantsclaimCreateIP",
      ],
    },
    {
      name: "prop_createWitnessParticipantId_claimsIP",
      id: "a1dWs000001F1hgIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_createWitnessParticipantId_claimsIP to propcreateWitnessParticipantIdclaimsIP",
      ],
    },
    {
      name: "prop_otherPropertyUpdateClaimEdit_addOtherPropertyDamagetoClaimIP",
      id: "a1dWs000001F1hhIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_otherPropertyUpdateClaimEdit_addOtherPropertyDamagetoClaimIP to propotherPropertyUpdateClaimEditaddOtherPropertyDamagetoClaimIP",
      ],
    },
    {
      name: "renterProductTransformForPolicyLWC",
      id: "a1dWs000001F1hiIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterProductTransformLWC",
      id: "a1dWs000001F1hjIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "retrieveTransactions",
      id: "a1dWs000001F1hkIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "smartcommXMLRenewaltransform",
      id: "a1dWs000001F1hlIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "smartcommXMLtransform",
      id: "a1dWs000001F1hmIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterPreReCalcFromQuote",
      id: "a1dWs000001F1hnIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterPreRemote",
      id: "a1dWs000001F1hoIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterPreRemoteWithProducts",
      id: "a1dWs000001F1hpIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterProductTransform",
      id: "a1dWs000001F1hqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "renterProductTransformForPolicy",
      id: "a1dWs000001F1hrIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preTransformMultiPersonInputs",
      id: "a1dWs000001F1hsIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preTransformSimple",
      id: "a1dWs000001F1htIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preTransformThreePersonInputs",
      id: "a1dWs000001F1huIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "prop_ExtractInvolvedPartyTypeAhead_FNOLOS",
      id: "a1dWs000001F1hvIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from prop_ExtractInvolvedPartyTypeAhead_FNOLOS to propExtractInvolvedPartyTypeAheadFNOLOS",
      ],
    },
    {
      name: "TransformToPolicyNoInsuredItem",
      id: "a1dWs000001F1hwIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToQuoteJSONForAdditionalFields",
      id: "a1dWs000001F1hxIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToQuotePolicyCreation",
      id: "a1dWs000001F1hyIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToSmallGroupCompositeRating",
      id: "a1dWs000001F1hzIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_TransForQuote_CreationIP",
      id: "a1dWs000001F1i0IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForQuote_CreationIP to InsTransForQuoteCreationIP",
      ],
    },
    {
      name: "Ins_TransMedicalProductForEnrollment_IP",
      id: "a1dWs000001F1i1IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransMedicalProductForEnrollment_IP to InsTransMedicalProductForEnrollmentIP",
      ],
    },
    {
      name: "Ins_TransProductDetails_CreateContractOS",
      id: "a1dWs000001F1i2IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransProductDetails_CreateContractOS to InsTransProductDetailsCreateContractOS",
      ],
    },
    {
      name: "Ins_TransTermLifeProductForEnrollment_IP",
      id: "a1dWs000001F1i3IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransTermLifeProductForEnrollment_IP to InsTransTermLifeProductForEnrollmentIP",
      ],
    },
    {
      name: "pet_TransCreateQuote_QuoteOS",
      id: "a1dWs000001F1i4IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from pet_TransCreateQuote_QuoteOS to petTransCreateQuoteQuoteOS",
      ],
    },
    {
      name: "pet_TransUserInputs_QuoteOS",
      id: "a1dWs000001F1i5IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from pet_TransUserInputs_QuoteOS to petTransUserInputsQuoteOS",
      ],
    },
    {
      name: "phil_AccountSearch",
      id: "a1dWs000001F1i6IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from phil_AccountSearch to philAccountSearch",
      ],
    },
    {
      name: "postFSCPolicyDetailGeneric",
      id: "a1dWs000001F1i7IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "postFSCPolicyRevenue",
      id: "a1dWs000001F1i8IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "postFSCPolicyTransaction",
      id: "a1dWs000001F1i9IAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "postNewBusinessQuote",
      id: "a1dWs000001F1iAIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "postTransformMultiAutoVehicleData",
      id: "a1dWs000001F1iBIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "postVersionFSCPolicyDetailGeneric",
      id: "a1dWs000001F1iCIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "AmendFrameContract-CreateOrder",
      id: "a1dWs000001F1iDIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from AmendFrameContract-CreateOrder to AmendFrameContractCreateOrder",
      ],
    },
    {
      name: "AmendFrameContract-CreateQuote",
      id: "a1dWs000001F1iEIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from AmendFrameContract-CreateQuote to AmendFrameContractCreateQuote",
      ],
    },
    {
      name: "AmendFrameContractExtract-Oppty",
      id: "a1dWs000001F1iFIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from AmendFrameContractExtract-Oppty to AmendFrameContractExtractOppty",
      ],
    },
    {
      name: "AmendFrameContractExtract-Order",
      id: "a1dWs000001F1iGIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from AmendFrameContractExtract-Order to AmendFrameContractExtractOrder",
      ],
    },
    {
      name: "AmendFrameContractExtract-Quote",
      id: "a1dWs000001F1iHIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from AmendFrameContractExtract-Quote to AmendFrameContractExtractQuote",
      ],
    },
    {
      name: "Ins_ExtractPolicyInfoForPayment_IssuePaymentIP",
      id: "a1dWs000001F1iIIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ExtractPolicyInfoForPayment_IssuePaymentIP to InsExtractPolicyInfoForPaymentIssuePaymentIP",
      ],
    },
    {
      name: "VPL-CreatePartyForClaim-104-1",
      id: "a1dWs000001F1iJIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-CreatePartyForClaim-104-1 to VPLCreatePartyForClaim1041",
      ],
    },
    {
      name: "VPL-GetAssetCoverages-104-1",
      id: "a1dWs000001F1iKIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-GetAssetCoverages-104-1 to VPLGetAssetCoverages1041",
      ],
    },
    {
      name: "VPL-GetPayeeRecordType-104-1",
      id: "a1dWs000001F1iLIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-GetPayeeRecordType-104-1 to VPLGetPayeeRecordType1041",
      ],
    },
    {
      name: "VPL-GetPolicyInfo-104-1",
      id: "a1dWs000001F1iMIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-GetPolicyInfo-104-1 to VPLGetPolicyInfo1041",
      ],
    },
    {
      name: "CreateContactsForDrivers",
      id: "a1dWs000001F1iNIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateContractDiscounts - Oppty",
      id: "a1dWs000001F1iOIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CreateContractDiscounts - Oppty to CreateContractDiscountsOppty",
      ],
    },
    {
      name: "CreateContractDiscounts - Order",
      id: "a1dWs000001F1iPIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CreateContractDiscounts - Order to CreateContractDiscountsOrder",
      ],
    },
    {
      name: "CreateContractDiscounts - Quote",
      id: "a1dWs000001F1iQIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from CreateContractDiscounts - Quote to CreateContractDiscountsQuote",
      ],
    },
    {
      name: "CreateContractVersion",
      id: "a1dWs000001F1iRIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateQuoteAttachment",
      id: "a1dWs000001F1iSIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateReinstatementTransactionandUpdatestatus",
      id: "a1dWs000001F1iTIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateSoldPolicyTransaction",
      id: "a1dWs000001F1iUIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractFrameContractForActivation",
      id: "a1dWs000001F1iVIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "Ins_ExtrQuoteDetails_IssueOS",
      id: "a1dWs000001F1iWIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ExtrQuoteDetails_IssueOS to InsExtrQuoteDetailsIssueOS",
      ],
    },
    {
      name: "ins_postPolicyParticipantsInsuredSpec",
      id: "a1dWs000001F1iXIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_postPolicyParticipantsInsuredSpec to inspostPolicyParticipantsInsuredSpec",
      ],
    },
    {
      name: "ins_readAdditionaPlanQlIdClId_OS",
      id: "a1dWs000001F1iYIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readAdditionaPlanQlIdClId_OS to insreadAdditionaPlanQlIdClIdOS",
      ],
    },
    {
      name: "watercraftQuoteTransform",
      id: "a1dWs000001F1iZIAS",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "wholeLifeMulti_getProducts_Pre",
      id: "a1dWs000001F1iaIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from wholeLifeMulti_getProducts_Pre to wholeLifeMultigetProductsPre",
      ],
    },
    {
      name: "VPL-InduvidualAccountTypeAhead-104-1",
      id: "a1dWs000001F1ibIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from VPL-InduvidualAccountTypeAhead-104-1 to VPLInduvidualAccountTypeAhead1041",
      ],
    },
    {
      name: "WholeLife_ConfigRePrice_Pre_Quote",
      id: "a1dWs000001F1icIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from WholeLife_ConfigRePrice_Pre_Quote to WholeLifeConfigRePricePreQuote",
      ],
    },
    {
      name: "WholeLife_CreateQuote_Pre",
      id: "a1dWs000001F1idIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from WholeLife_CreateQuote_Pre to WholeLifeCreateQuotePre",
      ],
    },
    {
      name: "WholeLife_CreateQuote_Pre_LWC",
      id: "a1dWs000001F1ieIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from WholeLife_CreateQuote_Pre_LWC to WholeLifeCreateQuotePreLWC",
      ],
    },
    {
      name: "ExtrBundleCon1 - 1564466863572",
      id: "a1dWs000001F1ifIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ExtrBundleCon1 - 1564466863572 to ExtrBundleCon11564466863572",
      ],
    },
    {
      name: "ExtractAccountFromContact",
      id: "a1dWs000001F1igIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractAssetBasedOnAccount",
      id: "a1dWs000001F1ihIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractContractLine",
      id: "a1dWs000001F1iiIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocPlaceholdersContacts",
      id: "a1dWs000001F1ijIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CreateTrailingDocumentCategories",
      id: "a1dWs000001F1ikIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "InsGetAccountDetails_back",
      id: "a1dWs000001F1ilIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from InsGetAccountDetails_back to InsGetAccountDetailsback",
      ],
    },
    {
      name: "insClaims_UpdateContactClaimPartyRelationship_ParticipantIP",
      id: "a1dWs000001F1imIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_UpdateContactClaimPartyRelationship_ParticipantIP to insClaimsUpdateContactClaimPartyRelationshipParticipantIP",
      ],
    },
    {
      name: "insClaims_postInsurancePolicyAsset_addPolicyAssetsIP",
      id: "a1dWs000001F1inIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from insClaims_postInsurancePolicyAsset_addPolicyAssetsIP to insClaimspostInsurancePolicyAssetaddPolicyAssetsIP",
      ],
    },
    {
      name: "ins_postContractEnrollmentCensus_OS",
      id: "a1dWs000001F1ioIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_postContractEnrollmentCensus_OS to inspostContractEnrollmentCensusOS",
      ],
    },
    {
      name: "Z_RatingInputTransform",
      id: "a1dWs000001F1ipIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Z_RatingInputTransform to ZRatingInputTransform",
      ],
    },
    {
      name: "transformCreateClaimInsuredItem",
      id: "a1dWs000001F1iqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "claims_PostParticipantToClaim_ClaimIPs",
      id: "a1dWs000001F1irIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from claims_PostParticipantToClaim_ClaimIPs to claimsPostParticipantToClaimClaimIPs",
      ],
    },
    {
      name: "claims_PostParticipantToClaimWithAccountId_ClaimIP",
      id: "a1dWs000001F1isIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from claims_PostParticipantToClaimWithAccountId_ClaimIP to claimsPostParticipantToClaimWithAccountIdClaimIP",
      ],
    },
    {
      name: "WholeLife-Illustration-Post",
      id: "a1dWs000001F1itIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from WholeLife-Illustration-Post to WholeLifeIllustrationPost",
      ],
    },
    {
      name: "Ins_TransForEnrolment_MemberEnrollmentVision",
      id: "a1dWs000001F1kgIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForEnrolment_MemberEnrollmentVision to InsTransForEnrolmentMemberEnrollmentVision",
      ],
    },
    {
      name: "Ins_TransUserInputs_MemberEnrollmentAdditional_OS",
      id: "a1dWs000001F1khIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransUserInputs_MemberEnrollmentAdditional_OS to InsTransUserInputsMemberEnrollmentAdditionalOS",
      ],
    },
    {
      name: "Ins_TransUserInputs_MemberEnrollmentDental",
      id: "a1dWs000001F1kiIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransUserInputs_MemberEnrollmentDental to InsTransUserInputsMemberEnrollmentDental",
      ],
    },
    {
      name: "Ins_TransUserInputs_MemberEnrollmentOSMedical",
      id: "a1dWs000001F1kjIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransUserInputs_MemberEnrollmentOSMedical to InsTransUserInputsMemberEnrollmentOSMedical",
      ],
    },
    {
      name: "Ins_TransUserInputs_MemberEnrollmentOSVision",
      id: "a1dWs000001F1kkIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransUserInputs_MemberEnrollmentOSVision to InsTransUserInputsMemberEnrollmentOSVision",
      ],
    },
    {
      name: "ins_createAccountOppty_CreateQuote",
      id: "a1dWs000001F1klIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_createAccountOppty_CreateQuote to inscreateAccountOpptyCreateQuote",
      ],
    },
    {
      name: "Ins_GetQuoteLineItemsMedical",
      id: "a1dWs000001F1kmIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_GetQuoteLineItemsMedical to InsGetQuoteLineItemsMedical",
      ],
    },
    {
      name: "Ins_GetQuoteLineItemsVision",
      id: "a1dWs000001F1knIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_GetQuoteLineItemsVision to InsGetQuoteLineItemsVision",
      ],
    },
    {
      name: "Ins_PostAccountBillingAddress_UpdateBillingAddressOS",
      id: "a1dWs000001F1koIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostAccountBillingAddress_UpdateBillingAddressOS to InsPostAccountBillingAddressUpdateBillingAddressOS",
      ],
    },
    {
      name: "Ins_PostAccountUpdate_UpdateContactMethodsOS",
      id: "a1dWs000001F1kpIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_PostAccountUpdate_UpdateContactMethodsOS to InsPostAccountUpdateUpdateContactMethodsOS",
      ],
    },
    {
      name: "createGroupAccount",
      id: "a1dWs000001F1kqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "group_extractRecordType",
      id: "a1dWs000001F1krIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from group_extractRecordType to groupextractRecordType",
      ],
    },
    {
      name: "InsGetQuoteLineItemsDental",
      id: "a1dWs000001F1ksIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ins_AccountSearchCommercial",
      id: "a1dWs000001F1ktIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_AccountSearchCommercial to insAccountSearchCommercial",
      ],
    },
    {
      name: "Ins_ReadAccountBillingAddress_UpdateBillingAddressOS",
      id: "a1dWs000001F1kuIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadAccountBillingAddress_UpdateBillingAddressOS to InsReadAccountBillingAddressUpdateBillingAddressOS",
      ],
    },
    {
      name: "Ins_ReadUpdateAccount_UpdateContactMethodsOS",
      id: "a1dWs000001F1kvIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_ReadUpdateAccount_UpdateContactMethodsOS to InsReadUpdateAccountUpdateContactMethodsOS",
      ],
    },
    {
      name: "Ins_TransForEnrolment_MemberEnrollmentAdditional",
      id: "a1dWs000001F1kwIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForEnrolment_MemberEnrollmentAdditional to InsTransForEnrolmentMemberEnrollmentAdditional",
      ],
    },
    {
      name: "Ins_TransForEnrolment_MemberEnrollmentDental",
      id: "a1dWs000001F1kxIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForEnrolment_MemberEnrollmentDental to InsTransForEnrolmentMemberEnrollmentDental",
      ],
    },
    {
      name: "Ins_TransForEnrolment_MemberEnrollmentMedical",
      id: "a1dWs000001F1kyIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransForEnrolment_MemberEnrollmentMedical to InsTransForEnrolmentMemberEnrollmentMedical",
      ],
    },
    {
      name: "ins_readCensusMemberPolicies",
      id: "a1dWs000001F1lsIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readCensusMemberPolicies to insreadCensusMemberPolicies",
      ],
    },
    {
      name: "ins_transCensusMemberPoliciesForFlex",
      id: "a1dWs000001F1ltIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_transCensusMemberPoliciesForFlex to instransCensusMemberPoliciesForFlex",
      ],
    },
    {
      name: "ins_postCensusForEnrollment_OSStd",
      id: "a1dWs000001F1ngIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_postCensusForEnrollment_OSStd to inspostCensusForEnrollmentOSStd",
      ],
    },
    {
      name: "ins_ReadCensusMemberError_OSStd",
      id: "a1dWs000001F1nhIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_ReadCensusMemberError_OSStd to insReadCensusMemberErrorOSStd",
      ],
    },
    {
      name: "ins_readCensusMemberPlansStd",
      id: "a1dWs000001F1niIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_readCensusMemberPlansStd to insreadCensusMemberPlansStd",
      ],
    },
    {
      name: "SGGetCensusRateTypeNew",
      id: "a1dWs000001F1njIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGGetRecordTypesNew",
      id: "a1dWs000001F1nkIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "SGTransformForQuoteLWCNew",
      id: "a1dWs000001F1nlIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformProductCalculationResults",
      id: "a1dWs000001F1nmIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "getRatingFactSpecNew",
      id: "a1dWs000001F1nnIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractCensusMemberRatingFacts",
      id: "a1dWs000001F1noIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "preTransformLocationsBuildings",
      id: "a1dWs000001F1npIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "CommercialTransformToCreate",
      id: "a1dWs000001F1nqIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "ExtractAccountFromOpportunity",
      id: "a1dWs000001F1nrIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "TransformToCreateQuoteAutomation-MultiAuto",
      id: "a1dWs000001F1nsIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from TransformToCreateQuoteAutomation-MultiAuto to TransformToCreateQuoteAutomationMultiAuto",
      ],
    },
    {
      name: "TransformToCreatePolicyVersionForDaily",
      id: "a1dWs000001F1ntIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
      ],
    },
    {
      name: "FSC_TransPolicyDetails_CancelPolicyOS",
      id: "a1dWs000001F1nuIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from FSC_TransPolicyDetails_CancelPolicyOS to FSCTransPolicyDetailsCancelPolicyOS",
      ],
    },
    {
      name: "Ins_TransforPolicyDetails_CancelPolicyOS",
      id: "a1dWs000001F1nvIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from Ins_TransforPolicyDetails_CancelPolicyOS to InsTransforPolicyDetailsCancelPolicyOS",
      ],
    },
    {
      name: "ins_updatePolicy_uniqueName",
      id: "a1dWs000001F1nwIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from ins_updatePolicy_uniqueName to insupdatePolicyuniqueName",
      ],
    },
    {
      name: "port_ReadAccountDetails_Card",
      id: "a1dWs000001F1nxIAC",
      formulaChanges: [
      ],
      infos: [
      ],
      apexDependencies: [
      ],
      warnings: [
        " name will be changed from port_ReadAccountDetails_Card to portReadAccountDetailsCard",
      ],
    },
  ],
  flexCardAssessmentInfos: [
    {
      name: "Flex_ClaimConfirmationScreenForOS",
      id: "a6IWs0000006C4vMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insYourAgent_nds",
      id: "a6IWs0000006C4wMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsReadAccountContactDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Opportunity_ActionsOS_Automation",
      id: "a6IWs0000006C4yMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "LexAllPolicyActions",
      id: "a6IWs0000006C4zMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "falcontest",
      id: "a6IWs0000006C50MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Quote_ActionsOS_Automation",
      id: "a6IWs0000006C51MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "flexpublish_test",
      id: "a6IWs0000006C52MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "swetanyc",
      id: "a6IWs0000006C53MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "sktest",
      id: "a6IWs0000006C55MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "FlyoutValidationchildCard",
      id: "a6IWs0000006C59MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "FlyoutValidation",
      id: "a6IWs0000006C5AMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insMTANewHireBulkEnrollmentCard",
      id: "a6IWs0000006C5CMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "W14950704Issue",
      id: "a6IWs0000006C5DMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountAssetHeader",
      id: "a6IWs0000006C6GMAU",
      dependenciesIP: [
        "InsRecordHeaderAsset_getDetails",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountClaimsChildMobile_nds",
      id: "a6IWs0000006C6HMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsReadAccountPolicyClaims",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountClaimsChild_nds",
      id: "a6IWs0000006C6IMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsReadAccountPolicyClaims",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountClaimsMobile_nds",
      id: "a6IWs0000006C6JMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountClaims_nds",
      id: "a6IWs0000006C6KMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountHeader",
      id: "a6IWs0000006C6LMAU",
      dependenciesIP: [
        "InsRecordHeader_getDetails",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountInsurancePolicyList",
      id: "a6IWs0000006C6MMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetAccountInsurancePolicyList",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountPolicyList",
      id: "a6IWs0000006C6NMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetAccountPolicyList",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountPolicyListFlyout",
      id: "a6IWs0000006C6OMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAccountQuoteList",
      id: "a6IWs0000006C6PMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetAccountQuoteList",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insAgentAccountHomeActions",
      id: "a6IWs0000006C6QMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insArticlesChild_nds",
      id: "a6IWs0000006C6RMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insArticles_nds",
      id: "a6IWs0000006C6SMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insBillingDescriptionChild_nds",
      id: "a6IWs0000006C6TMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsExtractAccountBillingDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insBillingDescription_nds",
      id: "a6IWs0000006C6UMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insBillingStrategyChild_nds",
      id: "a6IWs0000006C6VMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insClaimParticipantsCard",
      id: "a6IWs0000006C6WMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insFooterMobile_nds",
      id: "a6IWs0000006C6XMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insFooter_nds",
      id: "a6IWs0000006C6YMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insHeaderBillingInfoMobile_nds",
      id: "a6IWs0000006C6ZMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsExtractAccountDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insHeaderBillingInfo_nds",
      id: "a6IWs0000006C6aMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsExtractAccountDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insHeaderHomeMobile_nds",
      id: "a6IWs0000006C6bMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsExtractAccountDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insHeaderHome_nds",
      id: "a6IWs0000006C6cMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsExtractAccountDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insHeaderPolicyMobile_nds",
      id: "a6IWs0000006C6dMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insHeaderPolicy_nds",
      id: "a6IWs0000006C6eMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insInsurancePolicyHeader",
      id: "a6IWs0000006C6fMAE",
      dependenciesIP: [
        "InsRecordHeaderInsurancePolicy_getDetails",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insManageAccountMobile_nds",
      id: "a6IWs0000006C6gMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insManageAccount_nds",
      id: "a6IWs0000006C6hMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insManagePolicyMobile_nds",
      id: "a6IWs0000006C6iMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insManagePolicy_nds",
      id: "a6IWs0000006C6jMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyBillingChild_nds",
      id: "a6IWs0000006C6kMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsExtractAccountBillingDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyBillingTransactions_nds",
      id: "a6IWs0000006C6lMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyTransactionDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyClaimsChild_nds",
      id: "a6IWs0000006C6mMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyClaimList",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyClaimsContainer_nds",
      id: "a6IWs0000006C6nMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyIcon_nds",
      id: "a6IWs0000006C6oMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyItemsDetail_nds",
      id: "a6IWs0000006C6pMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyItemsFscDetail_nds",
      id: "a6IWs0000006C6qMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyListChildMobile_nds",
      id: "a6IWs0000006C6rMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsReadAccountPolicies",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyListChild_nds",
      id: "a6IWs0000006C6sMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsReadAccountPolicies",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyListFlyout_nds",
      id: "a6IWs0000006C6tMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyListMobile_nds",
      id: "a6IWs0000006C6uMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyList_nds",
      id: "a6IWs0000006C6vMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyOverview_nds",
      id: "a6IWs0000006C6wMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyDetails",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyTransactionsChild_nds",
      id: "a6IWs0000006C6xMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetPolicyTransactionList",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insPolicyTransactionsContainer_nds",
      id: "a6IWs0000006C6yMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insQuoteHeader",
      id: "a6IWs0000006C6zMAE",
      dependenciesIP: [
        "InsRecordHeaderQuote_getDetails",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insQuoteListCard",
      id: "a6IWs0000006C70MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "InsGetQuoteByProducer",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insRecentActivityChildMobile_nds",
      id: "a6IWs0000006C71MAE",
      dependenciesIP: [
        "InsAccount_GetStories",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insRecentActivityChild_nds",
      id: "a6IWs0000006C72MAE",
      dependenciesIP: [
        "InsAccount_GetStories",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insRecentActivityContainerMobile_nds",
      id: "a6IWs0000006C73MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insRecentActivityContainer_nds",
      id: "a6IWs0000006C74MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "insSummaryInfoCard",
      id: "a6IWs0000006C75MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_SelectInsuredVehicle_OS",
      id: "a6IWs0000006C7oMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_EnrollmentPoliciesGroupContainer",
      id: "a6IWs0000006C7qMAE",
      dependenciesIP: [
        "InsEnrollment_censusMembersPolciies",
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_AccountEnrollmentSummary",
      id: "a6IWs0000006C7rMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_EnrollmentPoliciesGroupListChild",
      id: "a6IWs0000006C7sMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_EnrolledPoliciesGroupChild",
      id: "a6IWs0000006C7tMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "EnrollmentMemberSelection",
      id: "a6IWs0000006C7uMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_BenefitEnrollmentDependants",
      id: "a6IWs0000006C7wMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_EnrollmentCMListReview_OS",
      id: "a6IWs0000006C7xMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_AccountActionsCard",
      id: "a6IWs0000006C7yMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
        "port_ReadAccountDetails_Card",
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Account_ActionsOS_Automation",
      id: "a6IWs0000006C7zMAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Get_Quote_Quick_Action_CC",
      id: "a6IWs0000006C80MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Get_Quote_Quick_Action_Partner",
      id: "a6IWs0000006C81MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Get_Quote_Actions_CC",
      id: "a6IWs0000006C83MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Get_TravelerQuote_Quick_Action_CC",
      id: "a6IWs0000006C84MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Policy_Actions_CC1",
      id: "a6IWs0000006C85MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Policy_ActionsOS_Automation",
      id: "a6IWs0000006C86MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "New_FLEXCARD",
      id: "a6IWs0000006C88MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "ABC_FlexEnrollmentPoliciesContainer_Test",
      id: "a6IWs0000006C89MAE",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "test_childchard",
      id: "a6IWs0000006C8BMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Parent_test_Card",
      id: "a6IWs0000006C8CMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_vlocityaction",
      id: "a6IWs0000006C8EMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "Flex_vlocityaction_bond",
      id: "a6IWs0000006C8GMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "NewTestVlocityAction",
      id: "a6IWs0000006C8HMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "OpportunityActions",
      id: "a6IWs0000006C8IMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "INSBlitz_Policy_Actions_Portal",
      id: "a6IWs0000006C8LMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "INSBlitz_Policy_Actions_WithRatingDate_Portal",
      id: "a6IWs0000006C8MMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
    {
      name: "TestOSActionForGuestPortal",
      id: "a6IWs0000006C8OMAU",
      dependenciesIP: [
      ],
      dependenciesDR: [
      ],
      dependenciesOS: [
      ],
      infos: [
      ],
      warnings: [
      ],
    },
  ],
  omniAssessmentInfo: {
    osAssessmentInfos: [
      {
        name: "lwcbasemixintest_lwctest_English_1",
        type: "LWC",
        oldName: "lwcbasemixintest_lwctest_English_1",
        id: "a3eOt000000GhKLIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "lwctestBaseMixin",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "simpleBaseMixin_simpleBaseMixin_English_1",
        type: "LWC",
        oldName: "simpleBaseMixin_simpleBaseMixin_English_1",
        id: "a3eOt000000GhQoIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "lwcSimpleBseMixin",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CreateOppQuotePolicyPartner_English_1",
        type: "LWC",
        oldName: "INSBlitz_CreateOppQuotePolicy_Partner_English_1",
        id: "a3eWs000000F2mHIAS",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "ExtractQuoteConfirm",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "ExtractPolicyConfirm",
          },
          {
            name: "FetchAccountFromUser",
            location: "ExtractAccountFromUser",
          },
          {
            name: "ExtractUserDetails",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "UserSecurityService.decryptIfNecessary",
            location: "DecryptOppId",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "ConfigureProduct",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC2",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from CreateOppQuotePolicy_Partner to CreateOppQuotePolicyPartner",
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_ModifyPolicyInsuredItemsOOSEAndNonOOSE_English_4",
        type: "LWC",
        oldName: "INSBlitz_ModifyPolicyInsuredItemsOOSEAndNonOOSE_English_4",
        id: "a3eWs000000F2mIIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "DR_GetExpectedPolicyVersion",
            location: "getExpectedPolicyVersion",
          },
          {
            name: "DR_GetReferencePolicyNumber",
            location: "getReferencePolicyNumber",
          },
          {
            name: "DRToGetSourceQuoteFromPolicy",
            location: "GetSourceQuoteFromPolicy",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsPolicyService.getModifiedPolicy",
            location: "getModifiedPolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createOutOfSequencePolicyVersion",
            location: "CreateOutOfSequencePolicyVersion",
          },
          {
            name: "InsPolicyService.getOutOfSequenceEndorsementStatus",
            location: "getOutOfSequenceEndorsementStatus",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "YamahaTest_MultiCurrency_English_1",
        type: "LWC",
        oldName: "YamahaTest_MultiCurrency_English_1",
        id: "a3eWs000000F2mKIAS",
        dependenciesIP: [
          {
            name: "investigate_createQuoteAutoRootUSD",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Quoting_OS_English_2",
        type: "LWC",
        oldName: "Quoting_OS_English_2",
        id: "a3eWs000000F2mLIAS",
        dependenciesIP: [
          {
            name: "QuotingLWC_GetUserInputsAndRatedProducts",
            location: "GetUserInputs",
          },
          {
            name: "SmallGroup_MergeSelectedPlans",
            location: "prepareForQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "SGQuoteGetBrokerInfoNew",
            location: "getBrokerInfo",
          },
          {
            name: "SGGetRecordTypesNew",
            location: "getRecordTypes",
          },
          {
            name: "SICTypeAhead",
            location: "SICExtract",
          },
          {
            name: "SGCreateGroupAndCensusNew",
            location: "createGroupAndCensus",
          },
          {
            name: "getRatingFactSpecNew",
            location: "getRatingFactSpec",
          },
          {
            name: "SGGetCensusRateTypeNew",
            location: "getCensusRateType",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.updateCensus",
            location: "UpdateCensus",
          },
          {
            name: "InsCensusServiceStd.setMemberRatingFacts",
            location: "setMembersRatingMap",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsGroupCensus",
            location: "CensusUpload",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "MedicalPlanSelection",
          },
          {
            name: "insOsGridProductSelection",
            location: "DentalPlanSection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "VisionPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridCartSummary",
            location: "cartSummary",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "sweta_q3_Multi-Language_1",
        type: "LWC",
        oldName: "sweta_q3_Multi-Language_1",
        id: "a3eWs000000F2mMIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_Renters_English_2",
        type: "LWC",
        oldName: "lwcquote_Renters_English_2",
        id: "a3eWs000000F2mNIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuoteAction",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "UpdateQuoteAction",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsSingleInstance",
            location: "RentersLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "TestAuto_TestAuto_English_1",
        type: "LWC",
        oldName: "TestAuto_TestAuto_English_1",
        id: "a3eWs000000F2mPIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "samplescript_samplescript_English_1",
        type: "LWC",
        oldName: "samplescript_samplescript_English_1",
        id: "a3eWs000000F2mQIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "VBT1_ReusableScript1_English_1",
        type: "LWC",
        oldName: "VBT1_ReusableScript1_English_1",
        id: "a3eWs000000F2mRIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "VBT2_ReusableScript2_English_1",
        type: "LWC",
        oldName: "VBT2_ReusableScript2_English_1",
        id: "a3eWs000000F2mSIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "VBT3_ReusableScript3_English_1",
        type: "LWC",
        oldName: "VBT3_ReusableScript3_English_1",
        id: "a3eWs000000F2mTIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "VBT4_ReusableScript4_English_1",
        type: "LWC",
        oldName: "VBT4_ReusableScript4_English_1",
        id: "a3eWs000000F2mUIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "VBT_OSMigration_English_1",
        type: "LWC",
        oldName: "VBT_OSMigration_English_1",
        id: "a3eWs000000F2mVIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "VBT3_ReusableScript3_English",
            location: "ReusableScript3",
          },
          {
            name: "VBT1_ReusableScript1_English",
            location: "VBT-ReusableScript1",
          },
          {
            name: "VBT2_ReusableScript2_English",
            location: "VBT-ReusableScript2",
          },
          {
            name: "VBT4_ReusableScript4_English",
            location: "VBTReusableScript4",
          },
        ],
        missingOS: [
          "ReusableScript3",
          "VBT-ReusableScript1",
          "VBT-ReusableScript2",
          "VBTReusableScript4",
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "aa_t3_English_1",
        type: "LWC",
        oldName: "aa_t3_English_1",
        id: "a3eWs000000F2mXIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "os_multiselect_English_1",
        type: "LWC",
        oldName: "os_multiselect_English_1",
        id: "a3eWs000000F2mYIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcauto_AutoAXA_English_1",
        type: "LWC",
        oldName: "lwcauto_AutoAXA_English_1",
        id: "a3eWs000000F2maIAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "DataRaptorExtractAction2",
          },
          {
            name: "ExtractAccountFromOpportunity",
            location: "Fetch Account",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
          {
            name: "UserSecurityService2.decryptifNecessary",
            location: "deCryptQuote",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "AutoLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "policyConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "policyRules",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "customerinsurance_Test_English_1",
        type: "LWC",
        oldName: "customerinsurance_Test_English_1",
        id: "a3eWs000000F2mbIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "PolicyUser_Test_English_1",
        type: "LWC",
        oldName: "PolicyUser_Test_English_1",
        id: "a3eWs000000F2mcIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "OSActivate_TestinPatch1_English_2",
        type: "LWC",
        oldName: "OSActivate_TestinPatch1_English_2",
        id: "a3eWs000000F2mdIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_GetQuoteDetails_English_2",
        type: "LWC",
        oldName: "lwcquote_GetQuoteDetails_English_2",
        id: "a3eWs000000F2meIAC",
        dependenciesIP: [
          {
            name: "GuestUser_EncryptId1",
            location: "encryptQuoteId",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "test-getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createUpdateQuote",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "FSCPolicy_reinstate_English_1",
        type: "LWC",
        oldName: "FSCPolicy_reinstate_English_1",
        id: "a3eWs000000F2mfIAC",
        dependenciesIP: [
          {
            name: "InsPolicy_ReinstatePolicy",
            location: "PolicyReinstateAndReadVersion",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReadPolicyForReinstatement",
            location: "readCancelledPolicyDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "ins_SetupPaymentPlan_English",
            location: "PaymentPlanSetUp",
          },
          {
            name: "ins_IssuePayment_English",
            location: "IssuePayment",
          },
        ],
        missingOS: [
          "PaymentPlanSetUp",
          "IssuePayment",
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Property_HomeQuote_English_2",
        type: "LWC",
        oldName: "Property_HomeQuote_English_2",
        id: "a3eWs000000F2mgIAC",
        dependenciesIP: [
          {
            name: "ins_GetQuoteContext",
            location: "ipGetQuoteContext",
          },
          {
            name: "property_QuoteCountyLookup",
            location: "ipLookupCounty",
          },
          {
            name: "property_QuoteProductCodeLookup",
            location: "ipLookupProductCode",
          },
          {
            name: "property_QuoteTransForConfig",
            location: "ipTransformForConfig",
          },
          {
            name: "ins_CreateQuote",
            location: "ipCreateOpportunityQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getImageDocumentId",
            location: "FetchImageDocumentId",
          },
          {
            name: "ins_updateQuote",
            location: "updateQuote",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "ins_createPersonAccount_English",
            location: "CreatePersonAccountforQuote",
          },
          {
            name: "ins_QuoteProposal_English",
            location: "QuoteProposal",
          },
          {
            name: "ins_QuoteWrapUp_English",
            location: "QuoteWrapUp",
          },
        ],
        missingOS: [
          "CreatePersonAccountforQuote",
          "QuoteProposal",
          "QuoteWrapUp",
        ],
        dependenciesRemoteAction: [
          {
            name: "UniqueIdGeneratorService.generateUniqueId",
            location: "uniqueIdGenerator",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsSingleInstance",
            location: "configureProduct",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcrenters_RunRules_English_2",
        type: "LWC",
        oldName: "lwcrenters_RunRules_English_2",
        id: "a3eWs000000F2mhIAC",
        dependenciesIP: [
          {
            name: "Homeowners_PolicySubmit",
            location: "Bind Policy",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "acctQuote-PreFill",
            location: "readAccount",
          },
          {
            name: "CreateAccount",
            location: "createAccount",
          },
          {
            name: "GetDocumentTemplateId",
            location: "GetDocumentTemplateId",
          },
          {
            name: "CreateOpportunity",
            location: "createOpportunity",
          },
          {
            name: "readPolicyConfirmation",
            location: "readPolicyConfirmation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Quote_SelectPayment_English",
            location: "SelectPaymentTerms1",
          },
        ],
        missingOS: [
          "SelectPaymentTerms1",
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "GetListOfProducts",
          },
          {
            name: "ObjectDocumentService.createObjectDocument",
            location: "CreateObjDoc",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createPolicy",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsProductSelection",
            location: "RentersProductSelection",
          },
          {
            name: "vlocity_ins__insOsSingleInstance",
            location: "SingleInstanceConfigLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "YamahaTestAUD_MulticurrencyAUD_English_1",
        type: "LWC",
        oldName: "YamahaTestAUD_MulticurrencyAUD_English_1",
        id: "a3eWs000000F2miIAC",
        dependenciesIP: [
          {
            name: "investigate_createQuoteAutoRootAUD",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_Commercial_English_2",
        type: "LWC",
        oldName: "lwcquote_Commercial_English_2",
        id: "a3eWs000000F2mjIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "DataRaptorExtractAction3",
          },
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readPolicyLwc",
            location: "DataRaptorExtractAction2",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "insFSC_IssuePolicy_English_2",
        type: "LWC",
        oldName: "insFSC_IssuePolicy_English_2",
        id: "a3eWs000000F2mkIAC",
        dependenciesIP: [
          {
            name: "insFSC_CreatePolicyIP",
            location: "createUpdatePolicy",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ExtrQuoteDetails_IssueOS",
            location: "getQuoteInformation",
          },
          {
            name: "Ins_UpdateQuoteStatus_IssuePolicy",
            location: "updateQuoteStatus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "ins_SetupPaymentPlan_English",
            location: "PaymentPlanSetUp1",
          },
          {
            name: "ins_IssuePayment_English",
            location: "IssuePayment2",
          },
        ],
        missingOS: [
          "PaymentPlanSetUp1",
          "IssuePayment2",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "confirmation",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwclife_RunRules_English_2",
        type: "LWC",
        oldName: "lwclife_RunRules_English_2",
        id: "a3eWs000000F2mlIAC",
        dependenciesIP: [
          {
            name: "Quote_WholeLifeMergePolicyInsureds",
            location: "MergePolicyInsureds",
          },
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "ExtractAccountFromOpp",
          },
          {
            name: "ReadPersonWholeLife",
            location: "DRGetAccountDetails",
          },
          {
            name: "readAssetLwc",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Whole Life_eApp_English",
            location: "WL_GenericHealth_eApp1",
          },
        ],
        missingOS: [
          "WL_GenericHealth_eApp1",
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "GetRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "Create Quote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createPolicy",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "generateTrailingDocs",
          },
          {
            name: "sendQuoteEmail.SendEmail",
            location: "RASendEmail",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstance",
            location: "LifeLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "claims_CreatePayee_English_2",
        type: "LWC",
        oldName: "claims_CreatePayee_English_2",
        id: "a3eWs000000F2mmIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "IndividualAccountTypeAheadNew",
            location: "getAccountDetails",
          },
          {
            name: "VPL-UpdateIndividualAccount-104-2",
            location: "UpdateIndividualAccount1",
          },
          {
            name: "VPL-UpdateIndividualAccountwithContact-104-1",
            location: "UpdateIndividualAccount2",
          },
          {
            name: "VPL-CreateNewIndividualAccount-104-1",
            location: "CreateIndividualAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "claims_ManagePaymentMethodsForAddPayee_English_2",
        type: "LWC",
        oldName: "claims_ManagePaymentMethodsForAddPayee_English_2",
        id: "a3eWs000000F2mnIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ReadAccountPaymentMethods-100-1",
            location: "ReadPaymentMethods",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "DefaultOmniScriptEditBlock.new",
            location: "PaymentMethods-New",
          },
          {
            name: "DefaultOmniScriptEditBlock.edit",
            location: "PaymentMethods-Edit",
          },
          {
            name: "DefaultOmniScriptEditBlock.delete",
            location: "PaymentMethods-Delete",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_IssuePayment_English_1",
        type: "LWC",
        oldName: "ins_IssuePayment_English_1",
        id: "a3eWs000000F2moIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "payment_PostPaymentMethod_OTPIssueOS",
            location: "CreatePaymentMethod",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_QuoteProposal_English_2",
        type: "LWC",
        oldName: "ins_QuoteProposal_English_2",
        id: "a3eWs000000F2mpIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_ExtDocumentTemplateId_QuoteProposalOS",
            location: "drGetTemplateId",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__clmOsDocxGenerateDocument",
            location: "GenerateDocumentWord",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "claims_AddPayee_English_1",
        type: "LWC",
        oldName: "claims_AddPayee_English_1",
        id: "a3eWs000000F2mqIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-GetPayeeRecordType-104-1",
            location: "getPayeeId",
          },
          {
            name: "VPL-GetAccountRecordType-104-1",
            location: "getAccountRecordType",
          },
          {
            name: "VPL-CreatePartyForClaimForAccount-104-1",
            location: "updateClaimPayee",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "claims_CreatePayee_English",
            location: "VPL-AccountSetUpforPayee-104-21",
          },
          {
            name: "claims_ManagePaymentMethodsForAddPayee_English",
            location: "ManagePaymentMethod-AddPayee1",
          },
        ],
        missingOS: [
          "VPL-AccountSetUpforPayee-104-21",
          "ManagePaymentMethod-AddPayee1",
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Claim_ParticipantAdd_English_1",
        type: "LWC",
        oldName: "Claim_ParticipantAdd_English_1",
        id: "a3eWs000000F2mrIAC",
        dependenciesIP: [
          {
            name: "Claim_Participant",
            location: "createClaimParticpant",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "phil_AccountSearch",
            location: "getAccounts",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Claim_ParticipantEdit_English_1",
        type: "LWC",
        oldName: "Claim_ParticipantEdit_English_1",
        id: "a3eWs000000F2msIAC",
        dependenciesIP: [
          {
            name: "Claim_ParticipantExtract",
            location: "getClaimParticipant",
          },
          {
            name: "Claim_ParticipantUpdate",
            location: "updateClaimParticipant",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Auto_FNOLfsc_English_9",
        type: "LWC",
        oldName: "Auto_FNOLfsc_English_9",
        id: "a3eWs000000F2muIAC",
        dependenciesIP: [
          {
            name: "Auto_CreateClaim",
            location: "createClaimProcess",
          },
          {
            name: "Auto_ClaimFirstPartyVehicle",
            location: "createDamageVehicle",
          },
          {
            name: "Auto_ClaimThirdPartyVehicle",
            location: "PostThirdPartyVehicle-New",
          },
          {
            name: "Auto_ClaimThirdPartyVehicleEdit",
            location: "PostThirdPartyVehicle-Edit",
          },
          {
            name: "Claim_delete3rdPartyVehicle",
            location: "PostThirdPartyVehicle-Delete",
          },
          {
            name: "Auto_ClaimInjuredPerson",
            location: "postInjuredParties-New",
          },
          {
            name: "Auto_ClaimInjuredPersonEdit",
            location: "postInjuredParties-Edit",
          },
          {
            name: "Claim_deleteInvolvedInjury",
            location: "postInjuredParties-Delete",
          },
          {
            name: "Auto_CreateWitnessOS",
            location: "witnessContactCreation-New",
          },
          {
            name: "Auto_CreateWitnessOS",
            location: "witnessContactCreation-Edit",
          },
          {
            name: "Auto_deleteWitnessOs",
            location: "witnessContactCreation-Delete",
          },
          {
            name: "insClaim_autoFNOLEvaluateProductRules",
            location: "evaluateClaimProductRules",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_getPolicyholderContactId_ClaimFNOL",
            location: "getPolicyholderContactId",
          },
          {
            name: "insClaims_ReadPolicy_FSCClaimFNOLOS",
            location: "getPolicyNumber",
          },
          {
            name: "insClaims_ReadProduct2_ClaimFNOLOS",
            location: "getPolicyVehicleProductId",
          },
          {
            name: "ins_readPolicyparticipantsById",
            location: "getPolicyParticipants",
          },
          {
            name: "auto_ReadPolicyInsuredVehciles_FSCClaimFNOLOS",
            location: "readVehicleData",
          },
          {
            name: "auto_ReadInsuredItem_FSCClaimFNOLOS",
            location: "extractInsuredAuto",
          },
          {
            name: "Ins_UpdateClaimName",
            location: "updateClaimName",
          },
          {
            name: "insClaim_ReadFSCClaimByClaimId_FNOLOS",
            location: "getClaimNumber",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "cfFlex_SelectInsuredVehicle_OS",
            location: "selectVehicle",
          },
          {
            name: "cfFlex_ClaimConfirmationScreenForOS",
            location: "confirmation",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcauto_Auto_English_17",
        type: "LWC",
        oldName: "lwcauto_Auto_English_17",
        id: "a3eWs000000F2mvIAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "Fetch Account",
          },
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "DataRaptorExtractAction2",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "UserSecurityService2.decryptifNecessary",
            location: "deCryptQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "AutoLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "policyConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "policyRules",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "renewPolicy_prepareToRenewPolicy_English_5",
        type: "LWC",
        oldName: "renewPolicy_prepareToRenewPolicy_English_5",
        id: "a3eWs000000F2mxIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.prepareToRenewPolicy",
            location: "Prepare to renew policy",
          },
          {
            name: "InsPolicyService.prepareToRenewPolicy",
            location: "Prepare to renew policy with effective date but not expiration date",
          },
          {
            name: "InsPolicyService.prepareToRenewPolicy",
            location: "Prepare to renew policy without effective date",
          },
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "Create Renewal Policy",
          },
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "Create Renewal Policy With Options",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Account_MatchOrCreateAccount_English_1",
        type: "LWC",
        oldName: "Account_MatchOrCreateAccount_English_1",
        id: "a3eWs000000F2mzIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_AccountSearchCommercial",
            location: "getAccounts",
          },
          {
            name: "group_extractRecordType",
            location: "extractAccountRecordType",
          },
          {
            name: "createGroupAccount",
            location: "creatematchAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_LifeGerman_English_3",
        type: "LWC",
        oldName: "lwcquote_LifeGerman_English_3",
        id: "a3eWs000000F2n0IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getTransformCensusMembers",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "CensusTemplate",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "MedicalPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "DentalPlanSection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "VisionPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridCart",
            location: "Cart",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsAccountServicing_UpdateContactMethods_English_1",
        type: "LWC",
        oldName: "InsAccountServicing_UpdateContactMethods_English_1",
        id: "a3eWs000000F2n1IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadUpdateAccount_UpdateContactMethodsOS",
            location: "Read Account Attributes",
          },
          {
            name: "Ins_PostAccountUpdate_UpdateContactMethodsOS",
            location: "Update Account Attributes",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsAccount_UpdateBillingAddress_English_1",
        type: "LWC",
        oldName: "InsAccount_UpdateBillingAddress_English_1",
        id: "a3eWs000000F2n2IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadAccountBillingAddress_UpdateBillingAddressOS",
            location: "DataRaptorExtractBillingAddress",
          },
          {
            name: "Ins_PostAccountBillingAddress_UpdateBillingAddressOS",
            location: "DataRaptorUpdateBillingAddress",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_EnrolmentAdditional_English_1",
        type: "LWC",
        oldName: "ins_EnrolmentAdditional_English_1",
        id: "a3eWs000000F2n3IAC",
        dependenciesIP: [
          {
            name: "ins_EnrollmentMemberTransformAdditionalInput",
            location: "transformForEnrollmentAdditional",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readAdditionaPlanQlIdClId_OS",
            location: "getAdditionalPlansQlClId",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "AdditionalProductsLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_EnrolmentDental_English_1",
        type: "LWC",
        oldName: "ins_EnrolmentDental_English_1",
        id: "a3eWs000000F2n4IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "InsGetQuoteLineItemsDental",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "dentalProductsLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_EnrolmentMedical_English_1",
        type: "LWC",
        oldName: "ins_EnrolmentMedical_English_1",
        id: "a3eWs000000F2n5IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_GetQuoteLineItemsMedical",
            location: "getQuoteLineItems",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "medicalProductsLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_EnrolmentVision_English_1",
        type: "LWC",
        oldName: "ins_EnrolmentVision_English_1",
        id: "a3eWs000000F2n6IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_GetQuoteLineItemsVision",
            location: "getQuoteLineItemsVision",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "visionProductsLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsGVB_CreateContract_English_4",
        type: "LWC",
        oldName: "InsGVB_CreateContract_English_4",
        id: "a3eWs000000F2n7IAC",
        dependenciesIP: [
          {
            name: "ins_contractMergeAttributes",
            location: "MergeProductNodesForContract",
          },
          {
            name: "createContractAndCensus_Contract",
            location: "createContractAndCensusIp",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadAccountDetails_CreateContractOS",
            location: "getAccountDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "InsGVB_ContractProposal_English",
            location: "ContractProposal1",
          },
        ],
        missingOS: [
          "ContractProposal1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsContractDocumentProductDataFormatter",
            location: "CIAndSHFormatter",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "insBroker_CreateQuote_English_1",
        type: "LWC",
        oldName: "insBroker_CreateQuote_English_1",
        id: "a3eWs000000F2n8IAC",
        dependenciesIP: [
          {
            name: "insQuote_Creation",
            location: "createQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_createAccountOppty_CreateQuote",
            location: "createAccountOppty",
          },
          {
            name: "Ins_ReadAccountAndOpportunityDetails_QuoteCreationOS",
            location: "getAccOppInformation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Account_MatchOrCreateAccount_English",
            location: "LWCMatchorCreateAccount1",
          },
        ],
        missingOS: [
          "LWCMatchorCreateAccount1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProductsDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmationScreen",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "SmallGroup_LWC_English_2",
        type: "LWC",
        oldName: "SmallGroup_LWC_English_2",
        id: "a3eWs000000F2n9IAC",
        dependenciesIP: [
          {
            name: "SmallGroup_MergeSelectedPlans",
            location: "prepareForQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "SGQuoteGetBrokerInfo",
            location: "getBrokerInfo",
          },
          {
            name: "SGGetRecordTypes",
            location: "getRecordTypes",
          },
          {
            name: "SICTypeAhead",
            location: "SICExtract",
          },
          {
            name: "SGCreateGroupAndCensus",
            location: "createGroupAndCensus",
          },
          {
            name: "getRatingFactSpec",
            location: "getRatingFactSpec",
          },
          {
            name: "SGGetCensusRateType",
            location: "getCensusRateType",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.setMemberRatingFacts",
            location: "setMembersRatingMap",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "CensusUpload",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "MedicalPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "DentalPlanSection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "VisionPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridCartSummary",
            location: "cartSummary",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcrenters_Renters_English_2",
        type: "LWC",
        oldName: "lwcrenters_Renters_English_2",
        id: "a3eWs000000F2nAIAS",
        dependenciesIP: [
          {
            name: "Homeowners_PolicySubmit",
            location: "Bind Policy",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "acctQuote-PreFill",
            location: "readAccount",
          },
          {
            name: "CreateAccount",
            location: "createAccount",
          },
          {
            name: "CreateOpportunity",
            location: "createOpportunity",
          },
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction3",
          },
          {
            name: "readAssetLwc",
            location: "DataRaptorExtractAction4",
          },
          {
            name: "readPolicyConfirmation",
            location: "readPolicyConfirmation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Quote_SelectPayment_English",
            location: "SelectPaymentTerms1",
          },
        ],
        missingOS: [
          "SelectPaymentTerms1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createPolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsProductSelection",
            location: "RentersProductSelection",
          },
          {
            name: "vlocity_ins__insOsSingleInstance",
            location: "SingleInstanceConfigLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRulesReview",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "policyConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "policyRules",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsEnrollment_Bulk_English_6",
        type: "LWC",
        oldName: "InsEnrollment_Bulk_English_6",
        id: "a3eWs000000F2nBIAS",
        dependenciesIP: [
          {
            name: "InsEnrollment_bulkGetCMErrors",
            location: "checkCMError",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readAccountContractDetails_OS",
            location: "getAccountContractDetails",
          },
          {
            name: "ins_postCensusForEnrollment_OS",
            location: "createCensus",
          },
          {
            name: "ins_postContractEnrollmentCensus_OS",
            location: "updateContractCensus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.setMemberRatingFacts",
            location: "setMemberRatingFacts",
          },
          {
            name: "InsCensusService.createContacts",
            location: "createContacts",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "createPolicies",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "censusLwc",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "ErrorList",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "CensusMemberDetails",
          },
          {
            name: "cfFlex_BulkEnrollmentSummary_OS",
            location: "ConfirmationCard",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "reinstatePolicy_reinstate_English_1",
        type: "LWC",
        oldName: "reinstatePolicy_reinstate_English_1",
        id: "a3eWs000000F2nDIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createReinstatementPolicy",
            location: "Reinstate Policy",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Quoting_OSForChangesAndTesting_English_6",
        type: "LWC",
        oldName: "Quoting_OSForChangesAndTesting_English_6",
        id: "a3eWs000000F2nGIAS",
        dependenciesIP: [
          {
            name: "SmallGroup_MergeSelectedPlans",
            location: "prepareForQuote",
          },
          {
            name: "QuotingLWC_GetUserInputsAndRatedProducts",
            location: "GetUserInputs",
          },
          {
            name: "InsQuoteStep_transformCalculationResultToUpdateMemberInput",
            location: "TransformProductCalculationResults",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "SGQuoteGetBrokerInfoNew",
            location: "getBrokerInfo",
          },
          {
            name: "SGGetRecordTypesNew",
            location: "getRecordTypes",
          },
          {
            name: "SICTypeAhead",
            location: "SICExtract",
          },
          {
            name: "SGCreateGroupAndCensusNew",
            location: "createGroupAndCensus",
          },
          {
            name: "getRatingFactSpecNew",
            location: "getRatingFactSpec",
          },
          {
            name: "SGGetCensusRateTypeNew",
            location: "getCensusRateType",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsCensusServiceStd.setMemberRatingFacts",
            location: "setMembersRatingMap",
          },
          {
            name: "InsCensusServiceStd.updateMembers",
            location: "UpdateMembersById",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "MedicalPlanSelection",
          },
          {
            name: "insOsGridProductSelection",
            location: "DentalPlanSection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "VisionPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridCartSummary",
            location: "cartSummary",
          },
          {
            name: "vlocity_ins__insOsGroupCensus",
            location: "CensusUpload",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_RatingQuoting_English_3",
        type: "LWC",
        oldName: "lwcquote_RatingQuoting_English_3",
        id: "a3eWs000000F2nHIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "DataRaptorExtractAction2",
          },
          {
            name: "ExtractAccountFromOpportunity",
            location: "DataRaptorExtractAction3",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsGVB_CreateContractNew_English_3",
        type: "LWC",
        oldName: "InsGVB_CreateContractNew_English_3",
        id: "a3eWs000000F2nIIAS",
        dependenciesIP: [
          {
            name: "ins_contractMergeAttributes",
            location: "MergeProductNodesForContract",
          },
          {
            name: "createContractAndCensus_Contract",
            location: "createContractAndCensusIp",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadAccountDetails_CreateContractOS",
            location: "getAccountDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsContractDocumentProductDataFormatter",
            location: "CIAndSHFormatter",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquoteTravel_242Demo_English_1",
        type: "LWC",
        oldName: "lwcquoteTravel_242Demo_English_1",
        id: "a3eWs000000F2nKIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readPolicyLwc",
            location: "DataRaptorExtractAction2",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwclife_Life_English_3",
        type: "LWC",
        oldName: "lwclife_Life_English_3",
        id: "a3eWs000000F2nLIAS",
        dependenciesIP: [
          {
            name: "Quote_WholeLifeMergePolicyInsureds",
            location: "MergePolicyInsureds",
          },
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "DRGetAccountDetails",
          },
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction2",
          },
          {
            name: "readAssetLwc",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "GetRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "Create Quote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createPolicy",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "generateTrailingDocs",
          },
          {
            name: "sendQuoteEmail.SendEmail",
            location: "RASendEmail",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstance",
            location: "LifeLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "policyConfirmationLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmationLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSService_getPolicyDetails_English_1",
        type: "LWC",
        oldName: "INSService_getPolicyDetails_English_1",
        id: "a3eWs000000F2nMIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePolicyService.getPolicyDetails",
            location: "getPolicyDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CreateOppQuotePolicyCC_English_4",
        type: "LWC",
        oldName: "INSBlitz_CreateOppQuotePolicy_CC_English_4",
        id: "a3eWs000000F2nNIAS",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractUserDetails",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "FetchAccountFromUser",
            location: "ExtractAccountFromUser",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "ExtractPolicyConfirm",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "RemoteAction1",
          },
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "DecryptOppId",
          },
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "DecryptQuoteId",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "ConfigureProduct",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC2",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from CreateOppQuotePolicy_CC to CreateOppQuotePolicyCC",
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSService_getRatedProducts_English_1",
        type: "LWC",
        oldName: "INSService_getRatedProducts_English_1",
        id: "a3eWs000000F2nOIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CancelPolicy_English_2",
        type: "LWC",
        oldName: "INSBlitz_CancelPolicy_English_2",
        id: "a3eWs000000F2nPIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_updatePolicy_uniqueName",
            location: "UpdatePolicyUniqueName",
          },
          {
            name: "GetPolicyPremiumDR-OS-CC",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.prepareToCancelPolicy",
            location: "prepareToCancel",
          },
          {
            name: "InsPolicyService.cancelPolicy",
            location: "cancelPolicyService",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_reinstate_English_2",
        type: "LWC",
        oldName: "INSBlitz_reinstate_English_2",
        id: "a3eWs000000F2nQIAS",
        dependenciesIP: [
          {
            name: "InsPolicy_ReinstatePolicy",
            location: "PolicyReinstateAndReadVersion",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReadPolicyForReinstatement",
            location: "readCancelledPolicyDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_RenewAutoPolicy_English_2",
        type: "LWC",
        oldName: "INSBlitz_RenewAutoPolicy_English_2",
        id: "a3eWs000000F2nRIAS",
        dependenciesIP: [
          {
            name: "INSAutomation_createRenewalPolicy",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_RemoveAutoInsuredItem_English_1",
        type: "LWC",
        oldName: "INSBlitz_RemoveAutoInsuredItem_English_1",
        id: "a3eWs000000F2nSIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "RemoteAction1",
          },
          {
            name: "InsPolicyService.removeInsuredItem",
            location: "RemoteAction2",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "RemoteAction3",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_ModifyPolicyInsuredItems_English_2",
        type: "LWC",
        oldName: "INSBlitz_ModifyPolicyInsuredItems_English_2",
        id: "a3eWs000000F2nTIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsPolicyService.getModifiedPolicy",
            location: "getModifiedPolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_PITravelRootRatingQuoting_English_1",
        type: "LWC",
        oldName: "lwcquote_PITravelRootRatingQuoting_English_1",
        id: "a3eWs000000F2nUIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "DataRaptorExtractAction2",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz244_reinstate_English_1",
        type: "LWC",
        oldName: "INSBlitz244_reinstate_English_1",
        id: "a3eWs000000F2nVIAS",
        dependenciesIP: [
          {
            name: "InsPolicy_ReinstatePolicy244",
            location: "PolicyReinstateAndReadVersion",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReadPolicyForReinstatement",
            location: "readCancelledPolicyDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_TongCommercial_English_1",
        type: "LWC",
        oldName: "lwcquote_TongCommercial_English_1",
        id: "a3eWs000000F2nWIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "Pre240Test",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "CC_Traveller2GC_English_1",
        type: "LWC",
        oldName: "CC_Traveller2GC_English_1",
        id: "a3eWs000000F2nXIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "DataRaptorExtractAction2",
          },
          {
            name: "ExtractUserDetails",
            location: "DataRaptorExtractAction3",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Yamahalwcquote_ModifyQuote_English_2",
        type: "LWC",
        oldName: "Yamahalwcquote_ModifyQuote_English_2",
        id: "a3eWs000000F2nZIAS",
        dependenciesIP: [
          {
            name: "GuestOrCCUser_EncryptIdIfNecessary",
            location: "encryptQuoteIdIfNecessary",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuoteAction",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "UpdateQuoteAction",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "AutoLWC",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitzCreatePolicyVersion_FromQuote_English_1",
        type: "LWC",
        oldName: "INSBlitzCreatePolicyVersion_FromQuote_English_1",
        id: "a3eWs000000F2naIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitzCreateUpdatePolicy_FromQuote_English_1",
        type: "LWC",
        oldName: "INSBlitzCreateUpdatePolicy_FromQuote_English_1",
        id: "a3eWs000000F2nbIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "NestedFlex_PatchTest_English_1",
        type: "LWC",
        oldName: "NestedFlex_PatchTest_English_1",
        id: "a3eWs000000F2ncIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "cfGet_Quote_Quick_Action_CC",
            location: "CustomLWC1",
          },
          {
            name: "cfParent_test_Card",
            location: "CustomLWC2",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_Auto_English_2",
        type: "LWC",
        oldName: "lwcquote_Auto_English_2",
        id: "a3eWs000000F2ndIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccOppFromQuote",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuoteAction",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "UpdateQuoteAction",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "AutoLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CreatePolicy_English_1",
        type: "LWC",
        oldName: "INSBlitz_CreatePolicy_English_1",
        id: "a3eWs000000F2neIAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "FetchAccount",
          },
          {
            name: "readQuoteLwc",
            location: "ExtractQuoteConfirm",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "ExtractPolicyConfirm",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "invokeFSCPolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "ConfigureProduct",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC2",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwccc_Commercial_English_1",
        type: "LWC",
        oldName: "lwccc_Commercial_English_1",
        id: "a3eWs000000F2nfIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "opportunitycreate-os",
            location: "CreateOpp",
          },
          {
            name: "ExtractAccountFromOpportunity",
            location: "DataRaptorExtractAction3",
          },
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readPolicyLWC-OS",
            location: "DataRaptorExtractAction2",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CreateOppQuotePolicyWithRatingDateCC_English_1",
        type: "LWC",
        oldName: "INSBlitz_CreateOppQuotePolicyWithRatingDate_CC_English_1",
        id: "a3eWs000000F2ngIAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractUserDetails",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "FetchAccountFromUser",
            location: "ExtractAccountFromUser",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "ExtractPolicyConfirm",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "RemoteAction1",
          },
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "DecryptOppId",
          },
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "DecryptQuoteId",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "ConfigureProduct",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC2",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from CreateOppQuotePolicyWithRatingDate_CC to CreateOppQuotePolicyWithRatingDateCC",
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CreateOppQuotePolicyWithRatingDatePartner_English_1",
        type: "LWC",
        oldName: "INSBlitz_CreateOppQuotePolicyWithRatingDate_Partner_English_1",
        id: "a3eWs000000F2nhIAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractUserDetails",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "FetchAccountFromUser",
            location: "ExtractAccountFromUser",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "ExtractPolicyConfirm",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "RemoteAction1",
          },
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "DecryptOppId",
          },
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "DecryptQuoteId",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "ConfigureProduct",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC2",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from CreateOppQuotePolicyWithRatingDate_Partner to CreateOppQuotePolicyWithRatingDatePartner",
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_ProductWithMultiChildSpecsOnly_English_2",
        type: "LWC",
        oldName: "lwcquote_ProductWithMultiChildSpecsOnly_English_2",
        id: "a3eWs000000F2niIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "Pre240Test",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "navigation_webpage_English_1",
        type: "LWC",
        oldName: "navigation_webpage_English_1",
        id: "a3eWs000000F2njIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "core_AddMembers_English_1",
        type: "LWC",
        oldName: "core_AddMembers_English_1",
        id: "a3eWs000000F33xIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.getFields",
            location: "RemoteAction1",
          },
          {
            name: "InsCensusServiceStd.getFields",
            location: "RemoteAction3",
          },
          {
            name: "InsCensusServiceStd.addMembers",
            location: "AddMembersCore",
          },
          {
            name: "InsCensusServiceStd.addMembers",
            location: "RemoteAction2",
          },
          {
            name: "InsCensusServiceStd.addMembers",
            location: "RemoteAction1 AddMembersCore2",
          },
          {
            name: "InsCensusService.updateMembersV2",
            location: "UpdateMembersCore",
          },
          {
            name: "InsCensusService.updateMembersV2",
            location: "UpdateMembersCore2",
          },
          {
            name: "InsCensusService.UpdateMembersWithPlansV2",
            location: "UpdateMembersWithPlansCore",
          },
          {
            name: "InsCensusServiceStd.UpdateMembers",
            location: "UpdateMembersWithoutPlansCore2",
          },
          {
            name: "InsCensusServiceStd.UpdateMembers",
            location: "UpdateMembersForPatchTest-NameFieldTest",
          },
          {
            name: "InsCensusServiceStd.UpdateMembers",
            location: "UpdateMembersForPatchTest-CustomFieldTest",
          },
          {
            name: "EnrollmentHandler.enrollPlansV2",
            location: "EnrollPlans",
          },
          {
            name: "InsCensusServiceStd.setMemberRatingFacts",
            location: "setMemberRatingFacts",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "core_EnrollPlans_English_1",
        type: "LWC",
        oldName: "core_EnrollPlans_English_1",
        id: "a3eWs000000F33yIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "EnrollmentHandler.enrollPlansV2",
            location: "EnrollPlans",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "insFSC_PolicyCancellation_English_2",
        type: "LWC",
        oldName: "insFSC_PolicyCancellation_English_2",
        id: "a3eWs000000F33zIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Fsc_ReadPolicyDetails",
            location: "setPolicyDisplayValues",
          },
          {
            name: "ins_updatePolicy_uniqueName",
            location: "UpdatePolicyUniqueName",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "InsPolicyService.prepareToCancelPolicy",
            location: "prepareToCancel",
          },
          {
            name: "InsPolicyService.cancelPolicy",
            location: "cancelPolicyService",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "YamahaTestSimpleAUD_MultiCurrency_English_1",
        type: "LWC",
        oldName: "YamahaTestSimpleAUD_MultiCurrency_English_1",
        id: "a3eWs000000F340IAC",
        dependenciesIP: [
          {
            name: "investigate_createQuote_simpleRootAUD",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "qeLwcAuto_CensusWithPlans_English_1",
        type: "LWC",
        oldName: "qeLwcAuto_CensusWithPlans_English_1",
        id: "a3eWs000000F341IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "insProductService_getRatedProducts_English_1",
        type: "LWC",
        oldName: "insProductService_getRatedProducts_English_1",
        id: "a3eWs000000F342IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Renew_Quote_English_6",
        type: "LWC",
        oldName: "Renew_Quote_English_6",
        id: "a3eWs000000F343IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalQuote",
            location: "createRenewQuote",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "SmallGroup_Enrollment_English_5",
        type: "LWC",
        oldName: "SmallGroup_Enrollment_English_5",
        id: "a3eWs000000F344IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getCensusMemberIds",
            location: "getMemberIds",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.createContacts",
            location: "CreateContacts",
          },
          {
            name: "InsCensusService.setMemberRatingFacts",
            location: "PopulateCensusMemberWithRFFact",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "MembersEnrollments",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "MembersEnrollmentsFSC",
          },
          {
            name: "InsEnrollmentService.getMemberEnrollments",
            location: "GetMemberEnrollments",
          },
          {
            name: "InsEnrollmentService.modifyEnrollment",
            location: "UpdateEnrollments",
          },
          {
            name: "InsEnrollmentService.getEligibleMemberProducts",
            location: "GetEligibleMemberProducts",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "CensusUpload",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "FSC_Modification_English_1",
        type: "Angular",
        oldName: "FSC_Modification_English_1",
        id: "a3eWs000000F345IAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsPolicyService.getModifiedPolicy",
            location: "getModifiedPolicy",
          },
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiItem",
            location: "SelectableItems1",
          },
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "qeLwcAuto_Census_English_2",
        type: "LWC",
        oldName: "qeLwcAuto_Census_English_2",
        id: "a3eWs000000F346IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "insWC_IssuePolicy_English_2",
        type: "LWC",
        oldName: "insWC_IssuePolicy_English_2",
        id: "a3eWs000000F347IAC",
        dependenciesIP: [
          {
            name: "Insurance_CreatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "Insurance_IssuePayment",
            location: "applyPremiumPayment",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ExtrQuoteDetails_IssueOS",
            location: "getQuoteInformation",
          },
          {
            name: "readPolicyLwc",
            location: "readPolicyforconfirmation",
          },
          {
            name: "UpdateQuoteStatus",
            location: "UpdateQuoteStatus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "ins_SetupPaymentPlan_English",
            location: "PaymentPlanSetUp1",
          },
          {
            name: "insWC_IssuePayment_English",
            location: "IssuePayment1",
          },
        ],
        missingOS: [
          "PaymentPlanSetUp1",
          "IssuePayment1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuoteHandler.getQuoteDetail",
            location: "getQuoteDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "autoWC_Quote_English_3",
        type: "LWC",
        oldName: "autoWC_Quote_English_3",
        id: "a3eWs000000F348IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePolicyService.prepareToCancelPolicy",
            location: "PrepateToCancelPolicy",
          },
          {
            name: "InsurancePolicyService.cancelPolicy",
            location: "CancelPolicy",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_ModifyPaymentSchedule_English_2",
        type: "LWC",
        oldName: "INSBlitz_ModifyPaymentSchedule_English_2",
        id: "a3eWs000000F349IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.modifyPaymentSchedule",
            location: "ModifyPaymentSchedule",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Property_MultiInstance_English_2",
        type: "LWC",
        oldName: "Property_MultiInstance_English_2",
        id: "a3eWs000000F34AIAS",
        dependenciesIP: [
          {
            name: "ins_GetQuoteContext",
            location: "ipGetQuoteContext",
          },
          {
            name: "ins_CreateQuote",
            location: "ipCreateOpportunityQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getAccountDetails",
            location: "getAcctDetails",
          },
          {
            name: "getImageDocumentId",
            location: "FetchImageDocumentId",
          },
          {
            name: "ins_updateQuote",
            location: "updateQuote",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UniqueIdGeneratorService.generateUniqueId",
            location: "uniqueIdGenerator",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "configureProduct",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "YamahaTestAUDCCUser_MultiCurrency_English_1",
        type: "LWC",
        oldName: "YamahaTestAUDCCUser_MultiCurrency_English_1",
        id: "a3eWs000000F34BIAS",
        dependenciesIP: [
          {
            name: "investigate_createQuoteAutoRootAUDCCUser",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsEnrollmentStd_NewDatamodelWithBatchMode_English_1",
        type: "LWC",
        oldName: "InsEnrollmentStd_NewDatamodelWithBatchMode_English_1",
        id: "a3eWs000000F34CIAS",
        dependenciesIP: [
          {
            name: "InsEnrollment_bulkGetCMErrors",
            location: "checkCMError",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readAccountContractDetails_OS",
            location: "getAccountContractDetails",
          },
          {
            name: "ins_postCensusForEnrollment_OSStd",
            location: "createCensusId",
          },
          {
            name: "ins_postCensusForEnrollment_OSStd",
            location: "createCensus",
          },
          {
            name: "ins_postContractEnrollmentCensus_OS",
            location: "updateContractCensus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.setMemberRatingFacts",
            location: "setMemberRatingFacts",
          },
          {
            name: "InsCensusServiceStd.createContacts",
            location: "createAccounts",
          },
          {
            name: "InsEnrollmentServiceStd.enrollMembers",
            location: "createPolicies",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsEnrollmentCensus",
            location: "censusLwc",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "ErrorList",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "CensusMemberDetails",
          },
          {
            name: "cfFlex_BulkEnrollmentSummary_OS",
            location: "ConfirmationCard",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcauto_RunRules_English_2",
        type: "LWC",
        oldName: "lwcauto_RunRules_English_2",
        id: "a3eWs000000F34FIAS",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "AutoLWC",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "policyRules",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "YamahaTestUSCCUser_MultiCurrency_English_3",
        type: "LWC",
        oldName: "YamahaTestUSCCUser_MultiCurrency_English_3",
        id: "a3eWs000000F34GIAS",
        dependenciesIP: [
          {
            name: "investigate_createQuoteAutoRootUSDCCUser",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "YamahaTestSimpleAUDCCuser_MultiCurrency_English_1",
        type: "LWC",
        oldName: "YamahaTestSimpleAUDCCuser_MultiCurrency_English_1",
        id: "a3eWs000000F34IIAS",
        dependenciesIP: [
          {
            name: "investigate_createQuote_simpleRootAUD_CCuser",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "FSCPolicy_Issue_English_2",
        type: "Angular",
        oldName: "FSCPolicy_Issue_English_2",
        id: "a3eWs000000F34JIAS",
        dependenciesIP: [
          {
            name: "FSCPolicy_Create",
            location: "createUpdatepolicy",
          },
          {
            name: "GeneralLedger_Post",
            location: "postTransactionFinancialSystems",
          },
          {
            name: "Document_PolicyGeneration",
            location: "generatePolicyDocuments",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "One Time Payment_Issue_English",
            location: "OneTimePayment1",
          },
        ],
        missingOS: [
          "OneTimePayment1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "InsEnrollmentStd_NewDatamodel_English_3",
        type: "LWC",
        oldName: "InsEnrollmentStd_NewDatamodel_English_3",
        id: "a3eWs000000F34KIAS",
        dependenciesIP: [
          {
            name: "InsEnrollment_bulkGetCMErrors",
            location: "checkCMError",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readAccountContractDetails_OS",
            location: "getAccountContractDetails",
          },
          {
            name: "ins_postCensusForEnrollment_OSStd",
            location: "createCensusId",
          },
          {
            name: "ins_postCensusForEnrollment_OSStd",
            location: "createCensus",
          },
          {
            name: "ins_postContractEnrollmentCensus_OS",
            location: "updateContractCensus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.setMemberRatingFacts",
            location: "setMemberRatingFacts",
          },
          {
            name: "InsCensusServiceStd.createContacts",
            location: "createAccounts",
          },
          {
            name: "InsEnrollmentServiceStd.enrollMembers",
            location: "createPolicies",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsEnrollmentCensus",
            location: "censusLwc",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "ErrorList",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "CensusMemberDetails",
          },
          {
            name: "cfFlex_BulkEnrollmentSummary_OS",
            location: "ConfirmationCard",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcquote_Life_English_2",
        type: "LWC",
        oldName: "lwcquote_Life_English_2",
        id: "a3eWs000000F34LIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "ReadLWCQuote",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuoteAction",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "UpdateQuoteAction",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstance",
            location: "LifeLWC",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsEnrollmentStd_NewDatamodelBackUp_English_2",
        type: "LWC",
        oldName: "InsEnrollmentStd_NewDatamodelBackUp_English_2",
        id: "a3eWs000000F34NIAS",
        dependenciesIP: [
          {
            name: "InsEnrollmentStd_bulkGetCMErrors",
            location: "checkCMError",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readAccountContractDetails_OS",
            location: "getAccountContractDetails",
          },
          {
            name: "ins_postCensusForEnrollment_OS",
            location: "createCensusId",
          },
          {
            name: "ins_postCensusForEnrollment_OSStd",
            location: "createCensus",
          },
          {
            name: "ins_postContractEnrollmentCensus_OS",
            location: "updateContractCensus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.setMemberRatingFacts",
            location: "setMemberRatingFacts",
          },
          {
            name: "InsCensusServiceStd.createContacts",
            location: "createContacts",
          },
          {
            name: "InsEnrollmentServiceStd.enrollMembers",
            location: "createPolicies",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsEnrollmentCensus",
            location: "censusLwc",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "ErrorList",
          },
          {
            name: "cfFlex_EnrollmentCMListReview_OS",
            location: "CensusMemberDetails",
          },
          {
            name: "cfFlex_BulkEnrollmentSummary_OS",
            location: "ConfirmationCard",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "FSC_Auto_English_3",
        type: "Angular",
        oldName: "FSC_Auto_English_3",
        id: "a3eWs000000F34OIAS",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "FetchAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "invokeFSCPolicyRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "remoteAction_remoteAction_English_6",
        type: "LWC",
        oldName: "remoteAction_remoteAction_English_6",
        id: "a3eWs000000F34lIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "LWCTest.apurv",
            location: "RemoteAction1",
          },
          {
            name: "CreatingAccountSJ.createAccount",
            location: "RemoteAction2",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "AccountServicing_NewBusinessQuote_English_2",
        type: "Angular",
        oldName: "Account Servicing_NewBusinessQuote_English_2",
        id: "a3eWs000000F353IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "postNewBusinessQuote",
            location: "postNewBusinessQuote",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from Account Servicing to AccountServicing",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "VPL_PolicyServicingManagePaymentMethods_English_1",
        type: "Angular",
        oldName: "VPL_PolicyServicingManagePaymentMethods_English_1",
        id: "a3eWs000000F354IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ReadPaymentMethods-100-3",
            location: "ReadPaymentMethods",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "DefaultOmniScriptEditBlock.new",
            location: "PaymentMethods-New",
          },
          {
            name: "DefaultOmniScriptEditBlock.edit",
            location: "PaymentMethods-Edit",
          },
          {
            name: "DefaultOmniScriptEditBlock.delete",
            location: "PaymentMethods-Delete",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "AccountServicing_NewBusiness_English_1",
        type: "Angular",
        oldName: "Account Servicing_NewBusiness_English_1",
        id: "a3eWs000000F355IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Account_BusinessSetUp",
            location: "postNewBusinessAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from Account Servicing to AccountServicing",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "ins_QuoteWrapUp_English_1",
        type: "LWC",
        oldName: "ins_QuoteWrapUp_English_1",
        id: "a3eWs000000F35AIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_ExtQuoteDetails_QuoteWrapUpOS",
            location: "drGetQuoteDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.invokeProductRules",
            location: "raUnderwritingCheck",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmation",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "underwritingRules",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "autooa_sanity_English_2",
        type: "LWC",
        oldName: "autooa_sanity_English_2",
        id: "a3eWs000000F35BIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "insOpptunity_QuoteCreation_English_2",
        type: "LWC",
        oldName: "insOpptunity_QuoteCreation_English_2",
        id: "a3eWs000000F35DIAS",
        dependenciesIP: [
          {
            name: "insQuote_Creation",
            location: "createQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadAccountAndOpportunityDetails_QuoteCreationOS",
            location: "getAccOppInformation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProductsDetails",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmationScreen",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Provider_ProviderRecruitment_English_2",
        type: "LWC",
        oldName: "Provider_ProviderRecruitment_English_2",
        id: "a3eWs000000F35FIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProviderRecruitmentService.convertLeadAndCreatePortalUser",
            location: "Submit",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "CC_GetQuote_English_1",
        type: "LWC",
        oldName: "CC_GetQuote_English_1",
        id: "a3eWs000000F35IIAS",
        dependenciesIP: [
          {
            name: "CCUser_EncryptId",
            location: "encryptQuoteId",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "test-getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createUpdateQuote",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "SmallGroup_BenefitsEnrollmentPM_English_1",
        type: "Angular",
        oldName: "SmallGroup_BenefitsEnrollmentPM_English_1",
        id: "a3eWs000000F35JIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetTestContract",
            location: "GetTestContract",
          },
          {
            name: "GetProfileIdCustomerCommunityPlus",
            location: "GetProfileIdCustomerCommunityPlus",
          },
          {
            name: "GenerateAutoNumber",
            location: "GenerateAutoNumber",
          },
          {
            name: "GetAutoNumber",
            location: "GetAutoNumber",
          },
          {
            name: "SGGetRecordTypes",
            location: "getRecordTypes",
          },
          {
            name: "GetActivePortalUsers",
            location: "GetActivePortalUsers",
          },
          {
            name: "DeactivatePortalUsers",
            location: "DeactivatePortalUsers",
          },
          {
            name: "GetLastTestUser",
            location: "GetLastTestUser1",
          },
          {
            name: "SetLastTestUser",
            location: "SetLastTestUser1",
          },
          {
            name: "GetLastTestUser",
            location: "GetLastTestUser2",
          },
          {
            name: "SetLastTestUser",
            location: "SetLastTestUser2",
          },
          {
            name: "BenefitsEnrollmentPMCreateGroupCensus",
            location: "CreateBenefitsEnrollmentPMCreateGroupCensus",
          },
          {
            name: "SetTestContractToNewAccountCensus",
            location: "SetTestContractToNewAccountCensus",
          },
          {
            name: "GetCensusMemberAndPlans",
            location: "GetCensusMemberAndPlans",
          },
          {
            name: "GetNewContactDetailsFromId",
            location: "GetNewContactDetailsFromId",
          },
          {
            name: "GetEnrollingCensusMemberId",
            location: "GetEnrollingCensusMemberId",
          },
          {
            name: "getGroupContactId",
            location: "getGroupContactId",
          },
          {
            name: "getGroupCensusMemberIds",
            location: "getGroupCensusMemberIds",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.createContacts",
            location: "CreateContactsFromCensusId",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "MembersEnrollmentsFromCensusId",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "MembersEnrollmentsFromSelected",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "MembersEnrollmentsFromCensusIdBatchMode",
          },
          {
            name: "InsCensusService.createContacts",
            location: "CreateContactsFromList",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Asset_Transaction_English_2",
        type: "Angular",
        oldName: "Asset_Transaction_English_2",
        id: "a3eWs000000F35MIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: ".",
            location: "Submit",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "ActivateFrameAgreement_Oppty_English_1",
        type: "Angular",
        oldName: "ActivateFrameAgreement_Oppty_English_1",
        id: "a3eWs000000F35OIAS",
        dependenciesIP: [
          {
            name: "ActivateFrameAgreement_Oppty",
            location: "ActivateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractFrameContractForActivation",
            location: "ExtractContractDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Watercraft_ReinstatePolicy_English_1",
        type: "Angular",
        oldName: "Watercraft_ReinstatePolicy_English_1",
        id: "a3eWs000000F35QIAS",
        dependenciesIP: [
          {
            name: "Watercraft_Reinstatement",
            location: "createNewPolicyVersion",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getOriginalPolicyVersion",
            location: "getPolicyInformation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "getPolicyDetails",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "SmallGroup_Quoting_English_1",
        type: "Angular",
        oldName: "SmallGroup_Quoting_English_1",
        id: "a3eWs000000F35SIAS",
        dependenciesIP: [
          {
            name: "SmallGroup_MergeSelectedPlans",
            location: "prepareForQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "SGQuoteGetBrokerInfo",
            location: "getBrokerInfo",
          },
          {
            name: "SGGetRecordTypes",
            location: "getRecordTypes",
          },
          {
            name: "SICTypeAhead",
            location: "SICExtract",
          },
          {
            name: "SGCreateGroupAndCensus",
            location: "createGroupAndCensus",
          },
          {
            name: "getRatingFactSpec",
            location: "getRatingFactSpec",
          },
          {
            name: "SGGetCensusRateType",
            location: "getCensusRateType",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.setMemberRatingFacts",
            location: "setMembersRatingMap",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Policy_Modification_English_1",
        type: "Angular",
        oldName: "Policy_Modification_English_1",
        id: "a3eWs000000F35VIAS",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsuranceQuotePolicyService.getModifiedPolicy",
            location: "getModifiedPolicy",
          },
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsuranceQuotePolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "LargeGroupQuote_Test_English_1",
        type: "Angular",
        oldName: "LargeGroupQuote_Test_English_1",
        id: "a3eWs000000F35XIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getProductSpecs",
            location: "GetProductSpecs",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "GetRatedProducts",
          },
          {
            name: "InsProductService.getCoverages",
            location: "GetCoveragesForSpec",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "GetCoverageStructure",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "GetPlansForSpec",
          },
          {
            name: "InsQuoteService.updateQuotePlans",
            location: "CreateUpdatePlans",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Claim_AddPayee_English_1",
        type: "Angular",
        oldName: "Claim_AddPayee_English_1",
        id: "a3eWs000000F35bIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-CreatePartyForClaim-104-1",
            location: "updateClaimPayee",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Claim_CreatePayee_English",
            location: "VPL-AccountSetUpforPayee-104-21",
          },
          {
            name: "Claim_CreateProviderPayee_English",
            location: "VPL-AccountSetUpforProviderPayee-104-11",
          },
          {
            name: "VPL_PolicyServicingManagePaymentMethods_English",
            location: "VPL-PolicyServicingManagePaymentMethod-100-31",
          },
        ],
        missingOS: [
          "VPL-AccountSetUpforPayee-104-21",
          "VPL-AccountSetUpforProviderPayee-104-11",
          "VPL-PolicyServicingManagePaymentMethod-100-31",
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "propertylwc_ClaimFNOL_English_1",
        type: "LWC",
        oldName: "propertylwc_ClaimFNOL_English_1",
        id: "a3eWs000000F35jIAC",
        dependenciesIP: [
          {
            name: "Property_CreateClaim",
            location: "createClaimProcess",
          },
          {
            name: "Property_ClaimOtherProperty",
            location: "otherProperties-New",
          },
          {
            name: "Property_ClaimInjuredPerson",
            location: "injuredParty-New",
          },
          {
            name: "Property_AddClaimLineItem",
            location: "injury-New",
          },
          {
            name: "insClaim_ClaimWitness",
            location: "postWitnesses",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadPolicy_ClaimFNOLOS",
            location: "getPolicyNumber",
          },
          {
            name: "insClaims_ReadProduct2_ClaimFNOLOS",
            location: "getPolicyPrimaryPropertyProductId",
          },
          {
            name: "prop_ReadPolicyInsuredItem_ClaimFNOLOS",
            location: "getPolicyData",
          },
          {
            name: "prop_ExtractInvolvedPartyTypeAhead_FNOLOS",
            location: "GetInvolvedParty",
          },
          {
            name: "insClaim_PostAuthorityReport_ClaimFNOLOS",
            location: "postReport",
          },
          {
            name: "InsClaim_ReadClaimByClaimId_FNOLOS",
            location: "GetClaimNumber",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "CoverageVerificationService.verifyCoverage",
            location: "verifyCoverage",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "evaluateClaimProductRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsMember_Enrollment_English_3",
        type: "LWC",
        oldName: "InsMember_Enrollment_English_3",
        id: "a3eWs000000F365IAC",
        dependenciesIP: [
          {
            name: "ins_EditBlockCensusMember",
            location: "censusMember-Edit",
          },
          {
            name: "ins_EnrollmentMemberCreateContact",
            location: "createContactsForMembers",
          },
          {
            name: "InsEnrollmentAdditional_EnrollPlan",
            location: "enrollPlansForAdditional",
          },
          {
            name: "InsEnrollmentDental_EnrollPlan",
            location: "enrollPlansForDental",
          },
          {
            name: "InsEnrollmentVision_EnrollPlan",
            location: "enrollPlansForVision",
          },
          {
            name: "InsEnrollmentTerm_EnrollPlan",
            location: "enrollPlansForTerm",
          },
          {
            name: "InsEnrollmentMedical_EnrollPlan",
            location: "enrollPlansForMedical",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_readAccountDetails_MemberEnrollmentOS",
            location: "FetchAccountDetails",
          },
          {
            name: "Ins_getCensusMemberDetails",
            location: "getCensusMembers",
          },
          {
            name: "Ins_ReadProductIdForConditionCheck_OS",
            location: "getProductIdForConditionalView",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "DefaultOmniScriptEditBlock.new",
            location: "censusMember-New",
          },
          {
            name: "DefaultOmniScriptEditBlock.delete",
            location: "censusMember-Delete",
          },
          {
            name: ".",
            location: "MedicalErrorMessagePopUp",
          },
        ],
        dependenciesLWC: [
          {
            name: "cfOpenEnrollmentContainer",
            location: "medicalPlan",
          },
          {
            name: "cfFlex_EnrollmentCartContainer",
            location: "cartMedical",
          },
          {
            name: "cfOpenEnrollmentContainer",
            location: "dentalPlan",
          },
          {
            name: "cfFlex_EnrollmentCartContainer",
            location: "cartMedicalDental",
          },
          {
            name: "cfOpenEnrollmentContainer",
            location: "visionPlan",
          },
          {
            name: "cfFlex_EnrollmentCartContainer",
            location: "cartMedicalDentalVision",
          },
          {
            name: "cfOpenEnrollmentContainer",
            location: "termPlan",
          },
          {
            name: "cfFlex_EnrollmentCartContainer",
            location: "cartAllProducts",
          },
          {
            name: "cfOpenAdditionaPlanEnrollmentContainer",
            location: "additionalPlan",
          },
          {
            name: "cfFlex_EnrollmentCartContainer",
            location: "cartAllProductsAndAdditional",
          },
          {
            name: "cfFlex_EnrollmentReviewContainer",
            location: "reviewScreen",
          },
          {
            name: "cfFlex_EnrollmentStatementScreenOSWrapper",
            location: "ConfirmationScreen",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Claim_CreatePayee_English_1",
        type: "Angular",
        oldName: "Claim_CreatePayee_English_1",
        id: "a3eWs000000F36VIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-InduvidualAccountTypeAhead-104-1",
            location: "getAccountDetails",
          },
          {
            name: "VPL-UpdateIndividualAccount-104-2",
            location: "UpdateIndividualAccount1",
          },
          {
            name: "VPL-UpdateIndividualAccountwithContact-104-1",
            location: "UpdateIndividualAccount2",
          },
          {
            name: "VPL-CreateNewBusinessAccount-104-1",
            location: "CreateIndividualAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "SmallGroup_BenefitsEnrollment_English_4",
        type: "Angular",
        oldName: "SmallGroup_BenefitsEnrollment_English_4",
        id: "a3eWs000000F36WIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getCensusMemberIds",
            location: "getMemberIds",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.createContacts",
            location: "CreateContacts",
          },
          {
            name: "InsEnrollmentService.enrollMembers",
            location: "MembersEnrollments",
          },
          {
            name: "InsEnrollmentService.getMemberEnrollments",
            location: "GetMemberEnrollments",
          },
          {
            name: "InsEnrollmentService.modifyEnrollment",
            location: "UpdateEnrollments",
          },
          {
            name: "InsEnrollmentService.getEligibleMemberProducts",
            location: "GetEligibleMemberProducts",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "LargeContract_Renewal_English_2",
        type: "Angular",
        oldName: "Large Contract_Renewal_English_2",
        id: "a3eWs000000F36XIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsContractService.createLargeSizeRenewQuoteInBatch",
            location: "LargeContractRenewal",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from Large Contract to LargeContract",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "FSC_RemoveInsuredItem_English_2",
        type: "Angular",
        oldName: "FSC_RemoveInsuredItem_English_2",
        id: "a3eWs000000F36YIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "RemoteAction3",
          },
          {
            name: "InsPolicyService.removeInsuredItem",
            location: "removeInsuredItem",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "FSC_Cancellation_English_2",
        type: "Angular",
        oldName: "FSC_Cancellation_English_2",
        id: "a3eWs000000F36ZIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getPolicyDetails",
            location: "GetPolicyDetails",
          },
          {
            name: "InsPolicyService.prepareToCancelPolicy",
            location: "PrepareToCancel",
          },
          {
            name: "InsPolicyService.cancelPolicy",
            location: "CancelPolicyAction",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Claim_CreateProviderPayee_English_1",
        type: "Angular",
        oldName: "Claim_CreateProviderPayee_English_1",
        id: "a3eWs000000F36aIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-InduvidualAccountTypeAhead-104-1",
            location: "getAccountDetails",
          },
          {
            name: "VPL-UpdateIndividualAccount-104-2",
            location: "UpdateIndividualAccount1",
          },
          {
            name: "VPL-UpdateIndividualAccountwithContact-104-1",
            location: "UpdateIndividualAccount2",
          },
          {
            name: "VPL-CreateNewProviderAccount-104-1",
            location: "CreateIndividualAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "ListofContracts_Renewal_English_2",
        type: "Angular",
        oldName: "List of Contracts_Renewal_English_2",
        id: "a3eWs000000F36bIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsContractService.createRenewQuoteInBatch",
            location: "createRenewalContactBatch",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from List of Contracts to ListofContracts",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "CreateFrameAgreement_Oppty_English_1",
        type: "Angular",
        oldName: "CreateFrameAgreement_Oppty_English_1",
        id: "a3eWs000000F36cIAC",
        dependenciesIP: [
          {
            name: "CreateFrameAgreement_Oppty",
            location: "CreateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "CreateFrameAgreement_Order_English_1",
        type: "Angular",
        oldName: "CreateFrameAgreement_Order_English_1",
        id: "a3eWs000000F36dIAC",
        dependenciesIP: [
          {
            name: "CreateFrameAgreement_Order",
            location: "CreateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "CreateFrameAgreement_Quote_English_1",
        type: "Angular",
        oldName: "CreateFrameAgreement_Quote_English_1",
        id: "a3eWs000000F36eIAC",
        dependenciesIP: [
          {
            name: "CreateFrameAgreement_Quote",
            location: "CreateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Enrollment_SelectProducts_English_2",
        type: "Angular",
        oldName: "Enrollment_SelectProducts_English_2",
        id: "a3eWs000000F36fIAC",
        dependenciesIP: [
          {
            name: "Merge_Lists",
            location: "MergeLists",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetOpenEnrollmentContractAndContact",
            location: "GetEnrollmentContractAndContact",
          },
          {
            name: "GetCensusMembersDetail",
            location: "GetCensusMembersDetail",
          },
          {
            name: "SavePrimaryMemberAndContact",
            location: "SavePrimaryMember",
          },
          {
            name: "SaveCensusMemberAndContact",
            location: "SaveDependents",
          },
          {
            name: "GetCensusMembersDetail",
            location: "GetMembersForMedical",
          },
          {
            name: "GetCensusMembersDetail",
            location: "GetMembersForDental",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "EnrollmentHandler.getRatedProducts",
            location: "getRatedMedicalProducts",
          },
          {
            name: "EnrollmentHandler.getRatedProducts",
            location: "GetDentalProducts",
          },
          {
            name: "EnrollmentHandler.enrollPlans",
            location: "CreatePlans",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "UpdateFrameAgreement_Quote_English_1",
        type: "Angular",
        oldName: "UpdateFrameAgreement_Quote_English_1",
        id: "a3eWs000000F36gIAC",
        dependenciesIP: [
          {
            name: "UpdateFrameAgreement_Quote",
            location: "UpdateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Auto_ReusableDriverInput_English_3",
        type: "Angular",
        oldName: "Auto_ReusableDriverInput_English_3",
        id: "a3eWs000000F36hIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_ReadStateJurisdiction_ReusableAddDriversOS",
            location: "getJurisdiction",
          },
          {
            name: "auto_PostAcctOppty_ReusableDriverInputOS",
            location: "createAccountOppty",
          },
          {
            name: "auto_PostOppty_QuoteOS",
            location: "createOppty",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Quote_additionalFields_English_2",
        type: "Angular",
        oldName: "Quote_additionalFields_English_2",
        id: "a3eWs000000F36jIAC",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsProductJSONService.trimOffAttributeCategory",
            location: "TrimAttributes",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "OneTimePayment_Issue_English_1",
        type: "Angular",
        oldName: "One Time Payment_Issue_English_1",
        id: "a3eWs000000F36kIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "createPaymentMethodpolicy",
            location: "CreatePaymentMethod",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from One Time Payment to OneTimePayment",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "OneTimePayment_Policy_English_1",
        type: "Angular",
        oldName: "One Time Payment_Policy_English_1",
        id: "a3eWs000000F36lIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractPolicyInfo",
            location: "getpolicyAccount",
          },
          {
            name: "createPaymentMethodpolicy",
            location: "CreatePaymentMethod",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from One Time Payment to OneTimePayment",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Policy_Home_English_2",
        type: "Angular",
        oldName: "Policy_Home_English_2",
        id: "a3eWs000000F36mIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "GetHomeProduct",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicyInsuredItemsRelationships",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
          {
            name: "InsPolicyService.getInsuredItems",
            location: "GetInsuredItems",
          },
          {
            name: "InsPolicyService.removeInsuredItem",
            location: "RemoveInsuredItem",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.getPolicyDetails",
            location: "GetPolicyDetails",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "UpdateFrameAgreement_Oppty_English_1",
        type: "Angular",
        oldName: "UpdateFrameAgreement_Oppty_English_1",
        id: "a3eWs000000F36nIAC",
        dependenciesIP: [
          {
            name: "UpdateFrameAgreement_Oppty",
            location: "UpdateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "INSBlitzCreateOOSEPolicy_FromQuote_English_1",
        type: "LWC",
        oldName: "INSBlitzCreateOOSEPolicy_FromQuote_English_1",
        id: "a3eWs000000F36pIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createOutOfSequencePolicyVersion",
            location: "CreateOOSEPolicyVersion",
          },
          {
            name: "InsPolicyService.getOutOfSequenceEndorsementStatus",
            location: "getOutOfSequenceEndorsementStatus",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_RemoveAutoInsuredItemForOOSE_English_1",
        type: "LWC",
        oldName: "INSBlitz_RemoveAutoInsuredItemForOOSE_English_1",
        id: "a3eWs000000F36qIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "DR_GetExpectedPolicyVersion",
            location: "getExpectedPolicyVersion",
          },
          {
            name: "DR_GetReferencePolicyNumber",
            location: "getReferencePolicyNumber",
          },
          {
            name: "DRToGetSourceQuoteFromPolicy",
            location: "GetSourceQuoteFromPolicy",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsPolicyService.removeInsuredItem",
            location: "RemoteAction2",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "createPolicyVersion",
          },
          {
            name: "InsPolicyService.createOutOfSequencePolicyVersion",
            location: "CreateOutOfSequencePolicyVersion",
          },
          {
            name: "InsPolicyService.getOutOfSequenceEndorsementStatus",
            location: "getOutOfSequenceEndorsementStatus",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "INSBlitz_CreateQuotePolicyTICC_English_1",
        type: "LWC",
        oldName: "INSBlitz_CreateQuotePolicy_TI_CC_English_1",
        id: "a3eWs000000F36yIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readQuoteLwc",
            location: "DataRaptorExtractAction1",
          },
          {
            name: "readInsurancePolicyLwc",
            location: "DataRaptorExtractAction2",
          },
          {
            name: "ExtractUserDetails",
            location: "DataRaptorExtractAction3",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC4",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceChildProducts",
            location: "CustomLWC2",
          },
          {
            name: "vlocity_ins__insOsMultiInstanceProducts",
            location: "CustomLWC1",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "CustomLWC3",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "quoteRules",
          },
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "CustomLWC5",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from CreateQuotePolicy_TI_CC to CreateQuotePolicyTICC",
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "InsGVB_ContractProposal_English_5",
        type: "LWC",
        oldName: "InsGVB_ContractProposal_English_5",
        id: "a3eWs000000F36zIAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadDocumentTemplateId_ContractProposalOS",
            location: "drGetTemplateId",
          },
          {
            name: "doc_ReadForContract_CreateContractOS",
            location: "drGetContractDetail",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__clmOsDocxGenerateDocument",
            location: "GenerateDocumentWord",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Insurance_DisasterLookup_English_1",
        type: "Angular",
        oldName: "Insurance_DisasterLookup_English_1",
        id: "a3eWs000000F379IAC",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Payments_ManagePaymentMethods_English_1",
        type: "Angular",
        oldName: "Payments_ManagePaymentMethods_English_1",
        id: "a3eWs000000F37AIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "NYLPaymentExtract",
            location: "readPaymentMethods",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "NYLChangeBeneOps.newPaymentOp",
            location: "PaymentMethods-New",
          },
          {
            name: "NYLChangeBeneOps.editPaymentOp",
            location: "PaymentMethods-Edit",
          },
          {
            name: "NYLChangeBeneOps.deletePaymentOp",
            location: "PaymentMethods-Delete",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Quote_recalculaterollupprice_English_1",
        type: "Angular",
        oldName: "Quote_recalculate rollup price_English_1",
        id: "a3eWs000000F37CIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.reCalculateRollupFormulas",
            location: "RecalculateRollupPrice",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " sub type will be changed from recalculate rollup price to recalculaterollupprice",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "UpdateFrameAgreement_Order_English_1",
        type: "Angular",
        oldName: "UpdateFrameAgreement_Order_English_1",
        id: "a3eWs000000F37DIAS",
        dependenciesIP: [
          {
            name: "UpdateFrameAgreement_Order",
            location: "UpdateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "autoWC_ReusableDriverInput_English_1",
        type: "Angular",
        oldName: "autoWC_ReusableDriverInput_English_1",
        id: "a3eWs000000F37EIAS",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_ReadStateJurisdiction_ReusableAddDriversOS",
            location: "getJurisdiction",
          },
          {
            name: "auto_PostAcctOppty_ReusableDriverInputOS",
            location: "createAccountOppty",
          },
          {
            name: "auto_PostOppty_QuoteOS",
            location: "createOppty",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "autoWC_ReusableVehicleInput_English_1",
        type: "Angular",
        oldName: "autoWC_ReusableVehicleInput_English_1",
        id: "a3eWs000000F3ATIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "ins_SetupPaymentPlan_English_1",
        type: "LWC",
        oldName: "ins_SetupPaymentPlan_English_1",
        id: "a3eWs000000F3AUIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadAccountDetails_PaymentPlanOS",
            location: "getAccountInformation",
          },
          {
            name: "Ins_PostPaymentMethod_PaymentPlansOS",
            location: "createPaymentMethod",
          },
          {
            name: "Ins_PostBillingAccount_PaymentPlanOS",
            location: "createBillingAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "ins_createPersonAccount_English_1",
        type: "LWC",
        oldName: "ins_createPersonAccount_English_1",
        id: "a3eWs000000F3AVIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_PostPersonAccount_createPersonAccountOS",
            location: "drPostPersonAccount",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "CPQ_CreateOrder_English_1",
        type: "Angular",
        oldName: "CPQ_CreateOrder_English_1",
        id: "a3eWs000000F3AWIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "vlocity_ins.CPQAppHandler.checkout",
            location: "Create Order",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "CPQ_CreateQuote_English_1",
        type: "Angular",
        oldName: "CPQ_CreateQuote_English_1",
        id: "a3eWs000000F3AYIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "vlocity_ins.CPQAppHandler.checkout",
            location: "Create Quote",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "genericDocuSign_sendEsignature_English_2",
        type: "LWC",
        oldName: "genericDocuSign_sendEsignature_English_2",
        id: "a3eWs000000F3AZIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GenericDocuSignGetContacts",
            location: "GetContacts",
          },
          {
            name: "GenericDocuSignGetDocuments",
            location: "GetDocuments",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__clmOsSelectRecipients",
            location: "PickSigners",
          },
          {
            name: "vlocity_ins__clmOsGenericSelectableItems",
            location: "PickDocuments",
          },
          {
            name: "vlocity_ins__clmOsGenericDocuSignSendEnvelope",
            location: "FinalizeDocuSignEnvelope",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Policy_ModifyCoverage_English_1",
        type: "Angular",
        oldName: "Policy_ModifyCoverage_English_1",
        id: "a3eWs000000F3AaIAK",
        dependenciesIP: [
          {
            name: "Policy_Modify",
            location: "PolicyModificationTransaction",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetPolicyInfo",
            location: "PrefillDateInformation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "GetPolicyCoverages",
          },
          {
            name: "InsuranceQuotePolicyService.CreateUpdatePolicy",
            location: "UpdatePolicy",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Policy_RemoveInsuredItem_English_1",
        type: "Angular",
        oldName: "Policy_RemoveInsuredItem_English_1",
        id: "a3eWs000000F3AbIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.removeInsuredItem",
            location: "removeInsuredItem",
          },
          {
            name: "InsuranceQuotePolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Watercraft_PolicyCancellation_English_1",
        type: "Angular",
        oldName: "Watercraft_PolicyCancellation_English_1",
        id: "a3eWs000000F3AcIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "InsuranceQuotePolicyService.prepareToCancelPolicy",
            location: "prepareToCancel",
          },
          {
            name: "InsuranceQuotePolicyService.cancelPolicy",
            location: "cancelPolicyService",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "InsProductJSONService_getCoverages_English_1",
        type: "Angular",
        oldName: "InsProductJSONService_getCoverages_English_1",
        id: "a3eWs000000F3AdIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductJSONService.getCoverages",
            location: "getCoverages",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "MACD_Move_English_1",
        type: "Angular",
        oldName: "MACD_Move_English_1",
        id: "a3eWs000000F3AeIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "OmniMoveAssetWrapper.getAccountIds",
            location: "SubstringIds",
          },
          {
            name: "OmniMoveAssetWrapper.createOrder",
            location: "CreateMoveInOrder",
          },
          {
            name: "OmniMoveAssetWrapper.getAssets",
            location: "RetrieveAllAssets",
          },
          {
            name: "OmniMoveAssetWrapper.checkAvailableAssets",
            location: "CheckAvailableAssets",
          },
          {
            name: "OmniMoveAssetWrapper.validateSelectedAsset",
            location: "ValidateSelectedAsset",
          },
          {
            name: "OmniMoveAssetWrapper.moveAssets",
            location: "Submit",
          },
          {
            name: "OmniMoveAssetWrapper.moveNewAssets",
            location: "SubmitNewAssets",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "lwcquote_SmallGroup_English_1",
        type: "LWC",
        oldName: "lwcquote_SmallGroup_English_1",
        id: "a3eWs000000F3AgIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsCensus",
            location: "CensusTemplate",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "MedicalPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "DentalPlanSection",
          },
          {
            name: "vlocity_ins__insOsGridProductSelection",
            location: "VisionPlanSelection",
          },
          {
            name: "vlocity_ins__insOsGridCartSummary",
            location: "Cart",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "CPQ_Submit_English_1",
        type: "Angular",
        oldName: "CPQ_Submit_English_1",
        id: "a3eWs000000F3AhIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "vlocity_ins.CPQAppHandler.checkout",
            location: "Create Assets",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "SmallGroup_Issue_English_1",
        type: "Angular",
        oldName: "SmallGroup_Issue_English_1",
        id: "a3eWs000000F3AjIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "getContractNumber",
            location: "getContractNumber",
          },
          {
            name: "SGUpdateGroupDetails",
            location: "updateGroupRateType",
          },
          {
            name: "SGUpdateQuoteDetails",
            location: "updateQuoteStatus",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsContractService.createUpdateContract",
            location: "createContract",
          },
          {
            name: "InsCensusService.cloneCensus",
            location: "cloneCensus",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "BPDLibrary_NewBenefitPlan_English_1",
        type: "Angular",
        oldName: "BPD Library_NewBenefitPlan_English_1",
        id: "a3eWs000000F3AkIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "RA-GetProduct",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdateQuote",
            location: "RA-ProductServiceNewQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdateQuote",
            location: "RA-ProductServiceNewRoot",
          },
          {
            name: "InsuranceQuoteHandler.getQuoteDetail",
            location: "RA-GetQuoteData",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdateQuote",
            location: "RA-QuoteService",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from BPD Library to BPDLibrary",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "insQuote_AddEdit_English_1",
        type: "LWC",
        oldName: "insQuote_AddEdit_English_1",
        id: "a3eWs000000F3AlIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.updateQuoteLine",
            location: "EditRootProduct",
          },
          {
            name: "InsurancePCRuntimeHandler.addInsuredItem",
            location: "AddPrimaryInsuredItem",
          },
          {
            name: "InsQuoteService.updateQuoteLine",
            location: "EditInsuredItem",
          },
          {
            name: "InsQuoteService.addInsuredItem",
            location: "AddGrandChild",
          },
          {
            name: "InsQuoteService.updateQuoteLine",
            location: "EditGrandChild",
          },
          {
            name: "InsurancePCRuntimeHandler.updateChildLine",
            location: "EditGrandChildDebug",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "NetworkProvider_Search_English_1",
        type: "Angular",
        oldName: "NetworkProvider_Search_English_1",
        id: "a3eWs000000F3AmIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceProviderNetworkService.getProviders",
            location: "getProviders",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "pet_Quote_English_2",
        type: "LWC",
        oldName: "pet_Quote_English_2",
        id: "a3eWs000000F3AnIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "pet_PostAccountOppty_QuoteOS",
            location: "createNewAccount",
          },
          {
            name: "readQuoteLwc",
            location: "readQuoteConfirmation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "configureProduct",
          },
          {
            name: "vlocity_ins__insOsConfirmation",
            location: "quoteConfirmation",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Contract_Renew_English_1",
        type: "Angular",
        oldName: "Contract_Renew_English_1",
        id: "a3eWs000000F3AoIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetContractAndLineItem",
            location: "GetContractAndLineItems",
          },
          {
            name: "UpdateContract",
            location: "UpdateContract",
          },
          {
            name: "UpdateContractAndLine",
            location: "CreateNewContractAndLines",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "SmallGroup_Renewal_English_1",
        type: "Angular",
        oldName: "SmallGroup_Renewal_English_1",
        id: "a3eWs000000F3ApIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "updateQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getFinalQuoteDetail",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "docGenerationSample_singleDocxLwcGuestUser_English_2",
        type: "LWC",
        oldName: "docGenerationSample_singleDocxLwcGuestUser_English_2",
        id: "a3eWs000000F3AsIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GuestUser-DocGenSample-ExtractDocumentTemplatesLWC",
            location: "GetDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__clmSelectableItems",
            location: "SelectTemplate",
          },
          {
            name: "vlocity_ins__clmOsDocxGenerateDocument",
            location: "GeneratePdfDocument",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "MACD_ChangeToQuote_English_1",
        type: "Angular",
        oldName: "MACD_ChangeToQuote_English_1",
        id: "a3eWs000000F3AtIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "OmniChangeToQuoteWrapper.changeToQuote",
            location: "Change To Quote",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "AQEDocuSignKrishna_Docu_English_1",
        type: "Angular",
        oldName: "AQE DocuSign Krishna_Docu_English_1",
        id: "a3eWs000000F3AuIAK",
        dependenciesIP: [
          {
            name: "",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "",
            location: "DataRaptorExtractAction1",
          },
          {
            name: undefined,
            location: "DataRaptorPostAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "undefined.undefined",
            location: "RemoteAction1",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from AQE DocuSign Krishna to AQEDocuSignKrishna",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "policyfsc_fscget_English_1",
        type: "Angular",
        oldName: "policyfsc_fscget_English_1",
        id: "a3eWs000000F3AvIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.invokeProductRules",
            location: "InvokeRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Policy_Cancellation_English_1",
        type: "Angular",
        oldName: "Policy_Cancellation_English_1",
        id: "a3eWs000000F3AwIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "GetPolicyDetails",
          },
          {
            name: "InsuranceQuotePolicyService.prepareToCancelPolicy",
            location: "Prepate to Cancel",
          },
          {
            name: "InsuranceQuotePolicyService.cancelPolicy",
            location: "Cancel Policy",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "MACD_FDO_English_1",
        type: "Angular",
        oldName: "MACD_FDO_English_1",
        id: "a3eWs000000F3AxIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "OmniFDOWrapper.getAccountId",
            location: "GetAccountId",
          },
          {
            name: "OmniFDOWrapper.canCreateFDO",
            location: "CanCreate",
          },
          {
            name: "OmniFDOWrapper.createFDO",
            location: "CreateFDO",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "docGenerationSample_singleDocxLwc_English_1",
        type: "LWC",
        oldName: "docGenerationSample_singleDocxLwc_English_1",
        id: "a3eWs000000F3AyIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "DocGenSample-ExtractDocumentTemplatesLWC",
            location: "GetDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__clmSelectableItems",
            location: "SelectTemplate",
          },
          {
            name: "vlocity_ins__clmOsDocxGenerateDocument",
            location: "GenerateDocumentWord",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "lwcclaim_claim_English_1",
        type: "LWC",
        oldName: "lwcclaim_claim_English_1",
        id: "a3eWs000000F3AzIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.invokeProductRules",
            location: "RemoteAction1",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsProductRulesReview",
            location: "claimsRule",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Test_Clone_English_1",
        type: "Angular",
        oldName: "Test_Clone_English_1",
        id: "a3eWs000000F3B0IAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.cloneProduct",
            location: "InvokeProductClone",
          },
          {
            name: "InsQuoteService.cloneQuote",
            location: "InvokeQuoteClone",
          },
          {
            name: "InsProviderNetworkService.cloneNetwork",
            location: "InvokeProviderNetworkClone",
          },
          {
            name: "InsCensusService.cloneCensus",
            location: "InvokeCensusClone",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "CC_invokeRules_English_1",
        type: "LWC",
        oldName: "CC_invokeRules_English_1",
        id: "a3eWs000000F3B2IAK",
        dependenciesIP: [
          {
            name: "CCUser_EncryptId",
            location: "encryptQuoteId",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createUpdateQuote",
          },
          {
            name: "InsQuoteService.invokeRules",
            location: "test-invokeRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "Test_ServicesTest_English_1",
        type: "Angular",
        oldName: "Test_Services Test_English_1",
        id: "a3eWs000000F3B4IAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getPlanSpecs",
            location: "getPlanSpecs",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " sub type will be changed from Services Test to ServicesTest",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "FormularyDrug_Search_English_1",
        type: "Angular",
        oldName: "FormularyDrug_Search_English_1",
        id: "a3eWs000000F3B5IAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "FormularyServiceHandler.getListOfDrugs",
            location: "searchDrugsInMarket",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Policy_CoverageVerification_English_1",
        type: "Angular",
        oldName: "Policy_CoverageVerification_English_1",
        id: "a3eWs000000F3B6IAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "CoverageVerificationService.verifyCoverage",
            location: "getCoverage",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "InsProductJSONService_getCoverageChanges_English_1",
        type: "Angular",
        oldName: "InsProductJSONService_getCoverageChanges_English_1",
        id: "a3eWs000000F3B7IAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductJSONService.getCoverageChanges",
            location: "getCoverageChanges",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Claim_Transaction_English_2",
        type: "Angular",
        oldName: "Claim_Transaction_English_2",
        id: "a3eWs000000F3BAIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: ".",
            location: "Submit",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Asset_Transaction2_English_2",
        type: "Angular",
        oldName: "Asset_Transaction2_English_2",
        id: "a3eWs000000F3BBIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: ".",
            location: "Submit",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Asset_Transaction3_English_2",
        type: "Angular",
        oldName: "Asset_Transaction3_English_2",
        id: "a3eWs000000F3BCIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: ".",
            location: "Submit",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "ActivateFrameAgreement_Order_English_1",
        type: "Angular",
        oldName: "ActivateFrameAgreement_Order_English_1",
        id: "a3eWs000000F3BDIA0",
        dependenciesIP: [
          {
            name: "ActivateFrameAgreement_Order",
            location: "ActivateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractFrameContractForActivation",
            location: "ExtractContractDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "ActivateFrameAgreement_Quote_English_1",
        type: "Angular",
        oldName: "ActivateFrameAgreement_Quote_English_1",
        id: "a3eWs000000F3BEIA0",
        dependenciesIP: [
          {
            name: "ActivateFrameAgreement_Quote",
            location: "ActivateFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractFrameContractForActivation",
            location: "ExtractContractDetails",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "AmendFrameAgreement_Oppty_English_1",
        type: "Angular",
        oldName: "AmendFrameAgreement_Oppty_English_1",
        id: "a3eWs000000F3BFIA0",
        dependenciesIP: [
          {
            name: "AmendFrameAgreement_Oppty",
            location: "AmendFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "AmendFrameAgreement_Order_English_1",
        type: "Angular",
        oldName: "AmendFrameAgreement_Order_English_1",
        id: "a3eWs000000F3BGIA0",
        dependenciesIP: [
          {
            name: "AmendFrameAgreement_Order",
            location: "AmendFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "LargeGroupPlanDesign_UpdateAttribute_English_1",
        type: "Angular",
        oldName: "LargeGroupPlanDesign_UpdateAttribute_English_1",
        id: "a3eWs000000F3BHIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "extractQLIProductSpec",
            location: "extractQLIProductSpecId",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsProductJSONService.getAttributes",
            location: "getAttributes",
          },
          {
            name: "InsQuoteService.updateQuotePlans",
            location: "RemoteAction3",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "docGenerationSample_singleDocxVF_English_1",
        type: "Angular",
        oldName: "docGenerationSample_singleDocxVF_English_1",
        id: "a3eWs000000F3BIIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "DocGenSample-GetDocumentTemplatesForType",
            location: "GetDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "LargeGroupQuote_RemoveCoverage_English_1",
        type: "Angular",
        oldName: "LargeGroupQuote_RemoveCoverage_English_1",
        id: "a3eWs000000F3BKIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getProductSpecs",
            location: "getProductSpecs",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsProductJSONService.getCoverages",
            location: "getCoverages",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuotePlans",
          },
          {
            name: "InsQuoteService.removeCoverage",
            location: "removeCoverage",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "AmendFrameAgreement_Quote_English_1",
        type: "Angular",
        oldName: "AmendFrameAgreement_Quote_English_1",
        id: "a3eWs000000F3BLIA0",
        dependenciesIP: [
          {
            name: "AmendFrameAgreement_Quote",
            location: "AmendFrameAgreementIP",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "CC_QuoteAuto_English_1",
        type: "Angular",
        oldName: "CC_Quote Auto_English_1",
        id: "a3eWs000000F3BMIA0",
        dependenciesIP: [
          {
            name: "CCUser_EncryptId",
            location: "EncryptOpptyId",
          },
          {
            name: "CCUser_EncryptId",
            location: "EncryptQuoteId",
          },
          {
            name: "CCUser_DecryptId",
            location: "DecryptQuoteId",
          },
          {
            name: "GuestUser_DecryptId",
            location: "DecryptClonedQuoteId",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateUpdateQuote",
          },
          {
            name: "InsQuoteService.cloneQuote",
            location: "CloneQuote",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " sub type will be changed from Quote Auto to QuoteAuto",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "docGenerationSample_singleWebVF_English_1",
        type: "Angular",
        oldName: "docGenerationSample_singleWebVF_English_1",
        id: "a3eWs000000F3BNIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "DocGenSample-GetDocumentTemplatesForType",
            location: "GetDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "ObjectDocumentService.createObjectDocument",
            location: "CreateObjDocument",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "GenericDocument_Generation_English_1",
        type: "Angular",
        oldName: "Generic Document_Generation_English_1",
        id: "a3eWs000000F3BOIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetDocumentTemplatesForType",
            location: "GetDocumentTemplates",
          },
          {
            name: "GetMultiDocumentTemplatesForType",
            location: "GetMultiDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "ObjectDocumentService.createObjectDocument",
            location: "CreateObjDocument",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " type will be changed from Generic Document to GenericDocument",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "VPL1011_HomeownersBroker_English_1",
        type: "Angular",
        oldName: "VPL1011_Homeowners (Broker)_English_1",
        id: "a3eWs000000F3BPIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readProducer",
            location: "readProducer",
          },
          {
            name: "VPLCreateAccount1021",
            location: "createAccount",
          },
          {
            name: "VPLCreateOpportunity1021",
            location: "createOpportunity",
          },
          {
            name: "GetDocumentTemplateId",
            location: "extractTemplate",
          },
          {
            name: "VPLReadQuoteConfirmation1021",
            location: "readQuoteConfirmation",
          },
          {
            name: "VPLReadPolicyConfirmation1021",
            location: "readPolicyConfirmation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "GetListOfProducts",
          },
          {
            name: "ObjectDocumentService.createObjectDocument",
            location: "createDoc",
          },
          {
            name: "InsuranceQuotePolicyService.createQuote",
            location: "createQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "createPolicy",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " sub type will be changed from Homeowners (Broker) to HomeownersBroker",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Auto_ClaimFNOL_English_1",
        type: "Angular",
        oldName: "Auto_ClaimFNOL_English_1",
        id: "a3eWs000000F3BQIA0",
        dependenciesIP: [
          {
            name: "Auto_CreateClaim",
            location: "createClaimProcess",
          },
          {
            name: "Auto_ClaimFirstPartyVehicle",
            location: "createDamageVehicle",
          },
          {
            name: "Auto_ClaimThirdPartyVehicle",
            location: "PostThirdPartyVehicle-New",
          },
          {
            name: "Auto_ClaimInjuredPerson",
            location: "postInjuredParties-New",
          },
          {
            name: "insClaim_ClaimWitness",
            location: "postWitnesses",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadPolicy_ClaimFNOLOS",
            location: "getPolicyNumber",
          },
          {
            name: "insClaims_ReadProduct2_ClaimFNOLOS",
            location: "getPolicyVehicleProductId",
          },
          {
            name: "auto_ReadPolicyInsuredVehicles_ClaimFNOLOS",
            location: "readVehicleData",
          },
          {
            name: "auto_ReadInsuredItem_ClaimFNOLOS",
            location: "extractInsuredAuto",
          },
          {
            name: "insClaim_PostAuthorityReport_ClaimFNOLOS",
            location: "postReport",
          },
          {
            name: "InsClaim_ReadClaimByClaimId_FNOLOS",
            location: "getClaimNumber",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "CoverageVerificationService.verifyCoverage",
            location: "VerifyCoverage",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "evaluateClaimProductRules",
          },
        ],
        dependenciesLWC: [
          {
            name: "selectableVehicles",
            location: "CustomLWC1",
          },
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Policy_Auto_English_1",
        type: "Angular",
        oldName: "Policy_Auto_English_1",
        id: "a3eWs000000F3BSIA0",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "RemoteAction6",
          },
          {
            name: "InsQuoteService.reCalculateRollupFormulas",
            location: "RecalculateRollupPrice",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokeQuoteRules",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "InvokePolicyRules",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "docGenerationSample_multiDocxVF_English_1",
        type: "Angular",
        oldName: "docGenerationSample_multiDocxVF_English_1",
        id: "a3eWs000000F3BTIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "DocGenSample-GetDocumentTemplatesForType",
            location: "GetDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Watercraft_Issue_English_1",
        type: "Angular",
        oldName: "Watercraft_Issue_English_1",
        id: "a3eWs000000F3BUIA0",
        dependenciesIP: [
          {
            name: "CreatePolicy_Watercraft",
            location: "createUpdatepolicy",
          },
          {
            name: "GeneralLedger_Post",
            location: "postTransactionFinancialSystems",
          },
          {
            name: "Document_PolicyGeneration",
            location: "generatePolicyDocuments",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ReadQuote-100-1",
            location: "getQuoteInformation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "One Time Payment_Issue_English",
            location: "OneTimePayment1",
          },
        ],
        missingOS: [
          "OneTimePayment1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuoteHandler.getQuoteDetail",
            location: "getQuoteDetail",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Watercraft_PolicyRenewal_English_1",
        type: "Angular",
        oldName: "Watercraft_PolicyRenewal_English_1",
        id: "a3eWs000000F3BVIA0",
        dependenciesIP: [
          {
            name: "Watercraft_Renewal",
            location: "IntegrationProcedureAction1",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetOriginalPolicyDetails",
            location: "GetRenewalInformation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Payments_Renewal_English",
            location: "Policy-RenewalPayment1",
          },
        ],
        missingOS: [
          "Policy-RenewalPayment1",
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "GetPolicyDetails",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "lwcpolicy_Auto_English_1",
        type: "LWC",
        oldName: "lwcpolicy_Auto_English_1",
        id: "a3eWs000000F3BWIA0",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsPolicyService.getModifiedPolicy",
            location: "getModifiedPolicy",
          },
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        dependenciesLWC: [
          {
            name: "vlocity_ins__insOsMultiInstanceGrandchildren",
            location: "AutoLWC",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        migrationStatus: "Can be Automated",
      },
      {
        name: "SmallGroup_GenerateRenewal_English_1",
        type: "Angular",
        oldName: "SmallGroup_GenerateRenewal_English_1",
        id: "a3eWs000000F3BXIA0",
        dependenciesIP: [
          {
            name: "SmallGroup_Renewal",
            location: "createRenewalQuote",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Quote_BOP_English_1",
        type: "Angular",
        oldName: "Quote_BOP_English_1",
        id: "a3eWs000000F3BYIA0",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readProducer",
            location: "readProducer",
          },
          {
            name: "acctQuote-PreFill",
            location: "readAccount",
          },
          {
            name: "GetDocumentTemplateId",
            location: "GetDocumentTemplateId",
          },
          {
            name: "readQuoteConfirmation",
            location: "readQuoteConfirmation",
          },
          {
            name: "readPolicyConfirmation",
            location: "readPolicyConfirmation",
          },
          {
            name: "getPolicyForTransactionCreation",
            location: "getPolicyInformation",
          },
          {
            name: "CreateSoldPolicyTransaction",
            location: "CreateSoldPolicyTransaction",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Account Servicing_NewBusiness_English",
            location: "NewBusinessAccount1",
          },
          {
            name: "Account Servicing_NewBusinessQuote_English",
            location: "NewBusinessQuote1",
          },
        ],
        missingOS: [
          "NewBusinessAccount1",
          "NewBusinessQuote1",
        ],
        dependenciesRemoteAction: [
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getEligibleProducts",
          },
          {
            name: "InsuranceQuotePolicyService.createQuote",
            location: "CreateQuote",
          },
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "referToUnderwriting",
          },
          {
            name: "ObjectDocumentService.createObjectDocument",
            location: "createObjDoc",
          },
          {
            name: "InsPolicyRevenueScheduleService.create",
            location: "CreatePolicyRevenueRecognition",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Watercraft_Quote_English_1",
        type: "Angular",
        oldName: "Watercraft_Quote_English_1",
        id: "a3eWs000000F3BZIA0",
        dependenciesIP: [
          {
            name: "UpdateQuote_Watercraft",
            location: "createUpdateQuote",
          },
          {
            name: "Document_QuoteGeneration",
            location: "GenerateQuoteDocuments",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "readProducer",
            location: "readProducer",
          },
          {
            name: "CreateAcctOpptyContact",
            location: "createAcctOpptyContact",
          },
          {
            name: "GetDocumentTemplateId",
            location: "extractTemplate",
          },
          {
            name: "quoteUpdate",
            location: "updateQuote",
          },
          {
            name: "VPL-readQuoteConfirmation-103-1",
            location: "readQuoteConfirmation",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getWatercraft",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "rulesDecline",
          },
          {
            name: "ObjectDocumentService.createObjectDocument",
            location: "createDoc",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "InteractionLauncher_AccountSearch_English_1",
        type: "Angular",
        oldName: "InteractionLauncher_AccountSearch_English_1",
        id: "a3eWs000000F3BaIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "AccountSearch",
            location: "DataRaptorExtractAction1",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Claim_PropertyFNOLPeril_English_1",
        type: "Angular",
        oldName: "Claim_Property FNOL Peril_English_1",
        id: "a3eWs000000F3BbIAK",
        dependenciesIP: [
          {
            name: "NewClaimLineItemTemporaryHousing_Create",
            location: "CreateTemphousinglineItem",
          },
          {
            name: "NewClaimLineItemTPA_Create",
            location: "CreateThirdPartyAdjustorLineItem",
          },
          {
            name: "NewClaimLineItemLoss_Create",
            location: "CreateLossLineItem-New",
          },
          {
            name: "NewClaimLineItemLoss_Create",
            location: "CreateLossLineItem-Edit",
          },
          {
            name: "ClaimItem_DamagedProperty",
            location: "createDamageProperty",
          },
          {
            name: "ClaimItem_OtherDamagedProperty",
            location: "otherProperties-New",
          },
          {
            name: "ClaimItem_OtherDamagedProperty",
            location: "otherProperties-Edit",
          },
          {
            name: "ClaimItem_InjuredPerson104",
            location: "injuredParty-New",
          },
          {
            name: "ClaimItem_InjuredPerson104",
            location: "injuredParty-Edit",
          },
          {
            name: "ClaimItem_ResponsibleParty",
            location: "postResponsibleParty",
          },
          {
            name: "ClaimItem_Witness",
            location: "postWitnesses",
          },
          {
            name: "TrailingDocumentRequirementsClaimDemo_Create",
            location: "createTrailingDocPlaceholders",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "claimPolicyPrefill",
            location: "readPolicyData",
          },
          {
            name: "claimPolicyPrefillFromInteraction",
            location: "readPolicyDataIfInteraction",
          },
          {
            name: "getProductId",
            location: "extractPerilIds",
          },
          {
            name: "VPL-GetPolicyInfo-104-1",
            location: "GetPolicyInfo",
          },
          {
            name: "extractInsuredItems",
            location: "GetinsuredItemDetails",
          },
          {
            name: "VPL-ClaimDocsUpload-104-1",
            location: "claimDocsUpload",
          },
          {
            name: "CreateInvolvedPropertyforClaim",
            location: "CreateInsuredProperty",
          },
          {
            name: "VPL-GetAssetCoverages-104-1",
            location: "ExtractAssetCoverages",
          },
          {
            name: "extractInvolvedProperty",
            location: "ExtractInvolvedProperty",
          },
          {
            name: "",
            location: "getInvolvedPartyDetails",
          },
          {
            name: "GetClaimNumber",
            location: "DRGetClaimName",
          },
          {
            name: "VPL-ClaimPostIncident-104-1",
            location: "postReport",
          },
          {
            name: "ClaimFNOL-PostLawsuit",
            location: "postLawsuit",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
          {
            name: "Insurance_DisasterLookup_English",
            location: "DisasterLookup2",
          },
        ],
        missingOS: [
          "DisasterLookup2",
        ],
        dependenciesRemoteAction: [
          {
            name: "CoverageVerificationService.verifyCoverage",
            location: "verifyCoverageInsuredItem",
          },
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "createClaim",
          },
          {
            name: "DefaultOmniScriptEditBlock.delete",
            location: "otherPropertyDelete",
          },
          {
            name: "CoverageVerificationService.verifyCoverage",
            location: "verifyCoverage",
          },
          {
            name: "DefaultOmniScriptEditBlock.delete",
            location: "injuredPartyDelete",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "customerAssist",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "autoAdjudicate",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
          " sub type will be changed from Property FNOL Peril to PropertyFNOLPeril",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Quote_Modify_English_1",
        type: "Angular",
        oldName: "Quote_Modify_English_1",
        id: "a3eWs000000F3BcIAK",
        dependenciesIP: [
          {
            name: "InsuredParty_Merge",
            location: "PluginParty",
          },
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetail",
          },
          {
            name: "InsPolicyService.getInsuredItems",
            location: "getInsuredItems",
          },
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "AttributeRatingHandler.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsuranceQuotePolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "CreateQuoteAction",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "UpdateQuoteAction",
          },
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Auto_ReusableVehicleInput_English_1",
        type: "Angular",
        oldName: "Auto_ReusableVehicleInput_English_1",
        id: "a3eWs000000F3BdIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
      {
        name: "Contract_Amend_English_1",
        type: "Angular",
        oldName: "Contract_Amend_English_1",
        id: "a3eWs000000F3BeIAK",
        dependenciesIP: [
        ],
        missingIP: [
        ],
        dependenciesDR: [
          {
            name: "GetContract",
            location: "GetContract",
          },
          {
            name: "GetProducts",
            location: "GetProducts",
          },
          {
            name: "CreateContractVersion",
            location: "CreateNewContractVersion",
          },
          {
            name: "CreateLineItems",
            location: "CreateNewContractLines",
          },
          {
            name: "CreateContractVersionLines",
            location: "CreateNewContractAndVersionAndLine",
          },
          {
            name: "UpdateContractVersion",
            location: "UpdateContractVersionType",
          },
          {
            name: "GetDocumentTemplates",
            location: "GetDocumentTemplates",
          },
        ],
        missingDR: [
        ],
        dependenciesOS: [
        ],
        missingOS: [
        ],
        dependenciesRemoteAction: [
        ],
        dependenciesLWC: [
        ],
        infos: [
        ],
        warnings: [
          " Angular OmniScript will not be migrated, please convert this to LWC based Omniscript",
        ],
        errors: [
        ],
        migrationStatus: "Need Manual Intervention",
      },
    ],
    ipAssessmentInfos: [
      {
        name: "InsuredParty_Merge_Procedure_28",
        id: "a3eWs000000F2nkIAC",
        oldName: "InsuredParty_Merge_Procedure_28",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateContactsForDrivers",
            location: "CreateContacts",
          },
          {
            name: "GetPartyIdsForDrivers",
            location: "GetParties",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreateAutoClaimFromPolicy_Procedure_2",
        id: "a3eWs000000F2nlIAC",
        oldName: "INSAutomation_CreateAutoClaimFromPolicy_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "CreateClaim",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreatePolicyFromQuote_Procedure_1",
        id: "a3eWs000000F2nrIAC",
        oldName: "INSAutomation_CreatePolicyFromQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "createContractAndCensus_Contractold_Procedure_1",
        id: "a3eWs000000F2nyIAC",
        oldName: "createContractAndCensus_Contractold_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_postContractUniqueName_createContract",
            location: "PostContractUniqueName",
          },
          {
            name: "Ins_postQuoteStatus_createContractOS",
            location: "PostQuoteStatus",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusService.cloneCensus",
            location: "cloneCensus",
          },
          {
            name: "InsContractService.createUpdateContract",
            location: "createContract",
          },
          {
            name: "UniqueIdGeneratorService.generateUniqueId",
            location: "UniqueIdGeneratorService",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsAccount_GetStories_Procedure_4",
        id: "a3eWs000000F2o1IAC",
        oldName: "InsAccount_GetStories_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsAccountTransactions",
            location: "activities",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsIntelligence_offers_Procedure_4",
        id: "a3eWs000000F2o2IAC",
        oldName: "InsIntelligence_offers_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReadAccountDetails",
            location: "ReadAccountDetails",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsRecordHeaderAsset_getDetails_Procedure_4",
        id: "a3eWs000000F2o3IAC",
        oldName: "InsRecordHeaderAsset_getDetails_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsGetAssetDetails",
            location: "GetAccountDR",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsRecordHeaderInsurancePolicy_getDetails_Procedure_4",
        id: "a3eWs000000F2o4IAC",
        oldName: "InsRecordHeaderInsurancePolicy_getDetails_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsGetInsurancePolicyDetails",
            location: "GetAccountDR",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsRecordHeaderQuote_getDetails_Procedure_4",
        id: "a3eWs000000F2o5IAC",
        oldName: "InsRecordHeaderQuote_getDetails_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsGetQuoteDetails",
            location: "GetAccountDR",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsRecordHeader_getDetails_Procedure_4",
        id: "a3eWs000000F2o6IAC",
        oldName: "InsRecordHeader_getDetails_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsGetAccountDetails",
            location: "GetAccountDR",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_PrimaryPartyHealthPlan_Procedure_1",
        id: "a3eWs000000F2oAIAS",
        oldName: "INSAutomation_PrimaryPartyHealthPlan_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ReadInsurancePolicyTermRecordId",
            location: "GetPolicyTermRecordId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_MultiAutoQuotePolicy_Procedure_4",
        id: "a3eWs000000F2oCIAS",
        oldName: "INSAutomation_MultiAutoQuotePolicy_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "ExtractAccount",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.CreateUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "GeneralLedger_Post_Procedure_2",
        id: "a3eWs000000F2oDIAS",
        oldName: "GeneralLedger_Post_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "retrieveTransactions",
            location: "RetrieveTransactions",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_CancelPolicy_Procedure_2",
        id: "a3eWs000000F2oEIAS",
        oldName: "Test_CancelPolicy_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.cancelPolicy",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreatePolicyComission_Procedure_2",
        id: "a3eWs000000F2oFIAS",
        oldName: "INSAutomation_CreatePolicyComission_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "GuestOrCCUser_EncryptIdIfNecessary_Procedure_2",
        id: "a3eWs000000F2oGIAS",
        oldName: "GuestOrCCUser_EncryptIdIfNecessary_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService.encryptIfNecessary",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createRenewalPolicyDailyWithIsPaid_Procedure_1",
        id: "a3eWs000000F2oHIAS",
        oldName: "INSAutomation_createRenewalPolicyDailyWithIsPaid_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CCUser_EncryptId_Procedure_3",
        id: "a3eWs000000F2oIIAS",
        oldName: "CCUser_EncryptId_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService.encryptIfNecessary",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreatePolicyForMultiAuto_Procedure_1",
        id: "a3eWs000000F2oJIAS",
        oldName: "INSAutomation_CreatePolicyForMultiAuto_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_getRuleLogs_Procedure_1",
        id: "a3eWs000000F2oKIAS",
        oldName: "INSAutomation_getRuleLogs_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "StateRuleService.getRuleLogs",
            location: "getRuleLogs",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_PrepareToCancelPolicy_Procedure_1",
        id: "a3eWs000000F2oLIAS",
        oldName: "Test_PrepareToCancelPolicy_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.prepareToCancelPolicy",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_AddQuoteLineItem_Procedure_1",
        id: "a3eWs000000F2oMIAS",
        oldName: "INSAutomation_AddQuoteLineItem_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePCRuntimeHandler.addInsuredItem",
            location: "addChildInsuredItem",
          },
          {
            name: "InsurancePCRuntimeHandler.addInsuredItem",
            location: "AddGrandChild",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_MultiAutoQuotePolicyCoolingOffPeriod_Procedure_1",
        id: "a3eWs000000F2oNIAS",
        oldName: "INSAutomation_MultiAutoQuotePolicyCoolingOffPeriod_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "ExtractAccount",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.CreateUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "sample_iptest_Procedure_1",
        id: "a3eWs000000F2oOIAS",
        oldName: "sample_iptest_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "DataRaptorExtractAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Document_PolicyGeneration_Procedure_2",
        id: "a3eWs000000F2oQIAS",
        oldName: "Document_PolicyGeneration_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ReadAccount-100-1",
            location: "GetAccountDetails",
          },
          {
            name: "CreatePolicyAttachment",
            location: "drPostToAttachment",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "EncodeJSON.Encode",
            location: "baseEncodeRootNode",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreateRenewalQuote_Procedure_1",
        id: "a3eWs000000F2oRIAS",
        oldName: "INSAutomation_CreateRenewalQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalQuote",
            location: "RenewQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "core_deleteMembers_Procedure_1",
        id: "a3eWs000000F2oSIAS",
        oldName: "core_deleteMembers_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.deleteMembers",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_AutoRootQuotePolicyWithEffectiveDate_Procedure_1",
        id: "a3eWs000000F2oTIAS",
        oldName: "INSAutomation_AutoRootQuotePolicyWithEffectiveDate_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "ExtractAccount",
          },
          {
            name: "readQuoteLwc",
            location: "getQuoteDeails",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.CreateUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "investigate_createQuoteAutoRootAUDCCUser_Procedure_1",
        id: "a3eWs000000F2oUIAS",
        oldName: "investigate_createQuoteAutoRootAUDCCUser_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "MCUSD_CreateProspectAccount",
            location: "DataRaptorPostAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService2.encryptIfNecessary",
            location: "encryptAccount",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RemoteAction3",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CancelPolicyWithAdditionalFees_Procedure_1",
        id: "a3eWs000000F2oVIAS",
        oldName: "INSAutomation_CancelPolicyWithAdditionalFees_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.cancelPolicy",
            location: "cancelpolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_ReinstateCancelledPolicy_Procedure_1",
        id: "a3eWs000000F2oWIAS",
        oldName: "INSAutomation_ReinstateCancelledPolicy_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReinstatedPolicyDetails",
            location: "getReinstatedPolicy",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createReinstatementPolicy",
            location: "reinstatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createRenewalPolicyWithIsPaid_Procedure_2",
        id: "a3eWs000000F2oXIAS",
        oldName: "INSAutomation_createRenewalPolicyWithIsPaid_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_GetQuoteDetailsForMultiAuto_Procedure_1",
        id: "a3eWs000000F2oYIAS",
        oldName: "INSAutomation_GetQuoteDetailsForMultiAuto_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "FSCPolicy_CancelRevenue_Procedure_2",
        id: "a3eWs000000F2oZIAS",
        oldName: "FSCPolicy_CancelRevenue_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyRevenueScheduleService.cancelRevenueSchedule",
            location: "CancelRevenue",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_ReinstateCancelledPolicyWithIsPaid_Procedure_2",
        id: "a3eWs000000F2oaIAC",
        oldName: "INSAutomation_ReinstateCancelledPolicyWithIsPaid_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReinstatedPolicyDetails",
            location: "getReinstatedPolicy",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createReinstatementPolicy",
            location: "reinstatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insFSC_CreatePolicyIP_Procedure_2",
        id: "a3eWs000000F2obIAC",
        oldName: "insFSC_CreatePolicyIP_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "FSC_ReadPolicyDetails_CreateUpdatePolicyIP",
            location: "GetPolicyDetails",
          },
          {
            name: "ins_createProducer_issuePolicy",
            location: "ProducerPolicy",
          },
          {
            name: "FSC_PostUniqueValuesAndSourceQuote_CreateUpdatePolicyIP",
            location: "updatePolicyNameAndQuote",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createTransaction",
            location: "createChargeTransaction",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "investigate_createQuoteAutoRootUSD_Procedure_2",
        id: "a3eWs000000F2ocIAC",
        oldName: "investigate_createQuoteAutoRootUSD_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "MCUSD_CreateProspectAccount",
            location: "DataRaptorPostAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService2.encryptIfNecessary",
            location: "encryptAccount",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RemoteAction3",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CancelPolicyWithoutAdditionalFees_Procedure_1",
        id: "a3eWs000000F2odIAC",
        oldName: "INSAutomation_CancelPolicyWithoutAdditionalFees_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.cancelPolicy",
            location: "cancelpolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "FSCPolicy_Create_Procedure_3",
        id: "a3eWs000000F2oeIAC",
        oldName: "FSCPolicy_Create_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_FSCGetPolicyInfo_CreateIP",
            location: "GetPolicyNumber",
          },
          {
            name: "createPolicyStatement",
            location: "createStatementRecord",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_HealthGoldPLanCreateClaim_Procedure_2",
        id: "a3eWs000000F2ofIAC",
        oldName: "INSAutomation_HealthGoldPLanCreateClaim_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "CreateClaim",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "investigate_createQuoteAutoRootAUD_Procedure_1",
        id: "a3eWs000000F2ogIAC",
        oldName: "investigate_createQuoteAutoRootAUD_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "MCUSD_CreateProspectAccount",
            location: "DataRaptorPostAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService2.encryptIfNecessary",
            location: "encryptAccount",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RemoteAction3",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "FSCPolicy_ModifyRevenue_Procedure_1",
        id: "a3eWs000000F2ohIAC",
        oldName: "FSCPolicy_ModifyRevenue_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyRevenueScheduleService.modifyRevenueSchedule",
            location: "ModifyPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "investigate_createQuoteAutoRootUSDCCUser_Procedure_4",
        id: "a3eWs000000F2oiIAC",
        oldName: "investigate_createQuoteAutoRootUSDCCUser_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "MCUSD_CreateProspectAccount",
            location: "DataRaptorPostAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService2.encryptIfNecessary",
            location: "encryptAccount",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RemoteAction3",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_UFAPayment_Procedure_2",
        id: "a3eWs000000F2ojIAC",
        oldName: "INSAutomation_UFAPayment_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.claimCoverageValuation",
            location: "FinancialAuthorityCheck",
          },
          {
            name: "InsClaimItemService.createPayments",
            location: "CreatePayments",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsPolicyAutoRoot_createRenewalPolicy_Procedure_1",
        id: "a3eWs000000F2okIAC",
        oldName: "InsPolicyAutoRoot_createRenewalPolicy_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "investigate_createQuotesimpleRootAUD_Procedure_1",
        id: "a3eWs000000F2olIAC",
        oldName: "investigate_createQuote_simpleRootAUD_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "MCUSD_CreateProspectAccount",
            location: "DataRaptorPostAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RemoteAction3",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from createQuote_simpleRootAUD to createQuotesimpleRootAUD",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "investigate_createQuotesimpleRootAUDCCuser_Procedure_1",
        id: "a3eWs000000F2omIAC",
        oldName: "investigate_createQuote_simpleRootAUD_CCuser_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "MCUSD_CreateProspectAccount",
            location: "DataRaptorPostAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction1",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RemoteAction2",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RemoteAction3",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from createQuote_simpleRootAUD_CCuser to createQuotesimpleRootAUDCCuser",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_AddRootProductInQuote_Procedure_1",
        id: "a3eWs000000F2onIAC",
        oldName: "INSAutomation_AddRootProductInQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePCRuntimeHandler.addRootItem",
            location: "addRootProduct",
          },
          {
            name: "InsurancePCRuntimeHandler.getAllLines",
            location: "getRootProductDetails",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreatePolicyVersionDaily_Procedure_2",
        id: "a3eWs000000F2ooIAC",
        oldName: "INSAutomation_CreatePolicyVersionDaily_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyDaily_Procedure_2",
        id: "a3eWs000000F2opIAC",
        oldName: "INSAutomation_createUpdatePolicyDaily_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "createContractAndCensus_ContractStd_Procedure_1",
        id: "a3eWs000000F2oqIAC",
        oldName: "createContractAndCensus_ContractStd_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_postContractUniqueName_createContract",
            location: "PostContractUniqueName",
          },
          {
            name: "Ins_postQuoteStatus_createContractOS",
            location: "PostQuoteStatus",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.cloneCensus",
            location: "cloneCensus",
          },
          {
            name: "InsContractServiceStd.createUpdateContract",
            location: "createContract",
          },
          {
            name: "UniqueIdGeneratorService.generateUniqueId",
            location: "UniqueIdGeneratorService",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "240ModalIsPaidFlag_CreatePolicyVersion_Procedure_1",
        id: "a3eWs000000F2orIAC",
        oldName: "240ModalIsPaidFlag_CreatePolicyVersion_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_AutoRootQuotePolicy_Procedure_1",
        id: "a3eWs000000F2osIAC",
        oldName: "INSAutomation_AutoRootQuotePolicy_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "ExtractAccount",
          },
          {
            name: "readQuoteLwc",
            location: "getQuoteDeails",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.CreateUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyWithCoolingOffPeriod_Procedure_1",
        id: "a3eWs000000F2ouIAC",
        oldName: "INSAutomation_createUpdatePolicyWithCoolingOffPeriod_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_ClaimFirstPartyVehicle_Procedure_5",
        id: "a3eWs000000F2owIAC",
        oldName: "Auto_ClaimFirstPartyVehicle_Procedure_5",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreateQuoteFromPreviousPolicy_Procedure_1",
        id: "a3eWs000000F2oxIAC",
        oldName: "INSAutomation_CreateQuoteFromPreviousPolicy_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuoteHandler.issueQuote",
            location: "CreateEndorsementQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "MultipleContracts_Renewal_Procedure_1",
        id: "a3eWs000000F2oyIAC",
        oldName: "MultipleContracts_Renewal_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getUserForContact",
            location: "getUserForContact",
          },
          {
            name: "SGCreateRenewalOpportunity",
            location: "createOpportunity",
          },
          {
            name: "SGExtractSystemCensus",
            location: "extractToRenewQuote",
          },
          {
            name: "SGGetQuoteHeader",
            location: "getQuoteName",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsContractService.getContractDetail",
            location: "getContractDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_AutoRootQuotePolicyCoolingOffPeriod_Procedure_1",
        id: "a3eWs000000F2ozIAC",
        oldName: "INSAutomation_AutoRootQuotePolicyCoolingOffPeriod_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractAccountFromOpportunity",
            location: "ExtractAccount",
          },
          {
            name: "readQuoteLwc",
            location: "getQuoteDeails",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsQuoteService.CreateUpdateQuote",
            location: "createQuote",
          },
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "CreatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Rating_CommercialAuto_Procedure_2",
        id: "a3eWs000000F2p0IAC",
        oldName: "Rating_CommercialAuto_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insRating_Medical_Procedure_3",
        id: "a3eWs000000F2p1IAC",
        oldName: "insRating_Medical_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_ClaimInjuredPersonEdit_Procedure_2",
        id: "a3eWs000000F2p2IAC",
        oldName: "Auto_ClaimInjuredPersonEdit_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_PostInjured_ClaimInjuredIP",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_OutofSequenceEndorsementDaily_Procedure_1",
        id: "a3eWs000000F2p3IAC",
        oldName: "INSAutomation_OutofSequenceEndorsementDaily_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createOutOfSequencePolicyVersion",
            location: "createOutOfSequencePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_Commission_Procedure_1",
        id: "a3eWs000000F2p4IAC",
        oldName: "Test_Commission_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_ClaimThirdPartyVehicle_Procedure_3",
        id: "a3eWs000000F2p5IAC",
        oldName: "Auto_ClaimThirdPartyVehicle_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_PostThirdPartyDriverContact_ClaimThirdPartyVehicleIP",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyAnnual_Procedure_1",
        id: "a3eWs000000F2p6IAC",
        oldName: "INSAutomation_createUpdatePolicyAnnual_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "createContractAndCensus_Contract_Procedure_6",
        id: "a3eWs000000F2p7IAC",
        oldName: "createContractAndCensus_Contract_Procedure_6",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_postContractUniqueName_createContract",
            location: "PostContractUniqueName",
          },
          {
            name: "Ins_postQuoteStatus_createContractOS",
            location: "PostQuoteStatus",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.cloneCensus",
            location: "cloneCensus",
          },
          {
            name: "InsContractService.createUpdateContract",
            location: "createContract",
          },
          {
            name: "UniqueIdGeneratorService.generateUniqueId",
            location: "UniqueIdGeneratorService",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_ClaimThirdPartyVehicleEdit_Procedure_3",
        id: "a3eWs000000F2p8IAC",
        oldName: "Auto_ClaimThirdPartyVehicleEdit_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_Post3PartyDriver_Claim3PartyIP",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreatePolicyVersionAnnual_Procedure_1",
        id: "a3eWs000000F2p9IAC",
        oldName: "INSAutomation_CreatePolicyVersionAnnual_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "240DevBlitz_CreatePolicyVersionFromQuote_Procedure_1",
        id: "a3eWs000000F2pAIAS",
        oldName: "240DevBlitz_CreatePolicyVersionFromQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "240DevBlitz_CreateUpdatePolicyFromQuote_Procedure_1",
        id: "a3eWs000000F2pBIAS",
        oldName: "240DevBlitz_CreateUpdatePolicyFromQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "HomeRating_Superior_Procedure_4",
        id: "a3eWs000000F2pCIAS",
        oldName: "HomeRating_Superior_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insRating_propertyOwner_Procedure_2",
        id: "a3eWs000000F2pDIAS",
        oldName: "insRating_propertyOwner_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Quote_WholeLifeMergePolicyInsureds_Procedure_11",
        id: "a3eWs000000F2pFIAS",
        oldName: "Quote_WholeLifeMergePolicyInsureds_Procedure_11",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_OutofSequenceEndorsementModal_Procedure_1",
        id: "a3eWs000000F2pLIAS",
        oldName: "INSAutomation_OutofSequenceEndorsementModal_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createOutOfSequencePolicyVersion",
            location: "createOutOfSequencePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createPolicyVersionModal_Procedure_2",
        id: "a3eWs000000F2pMIAS",
        oldName: "INSAutomation_createPolicyVersionModal_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createRenewalPolicy_Procedure_3",
        id: "a3eWs000000F2pNIAS",
        oldName: "INSAutomation_createRenewalPolicy_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.prepareToRenewPolicy",
            location: "PrepareRenewPolicy",
          },
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_OutofSequenceEndorsementStatus_Procedure_1",
        id: "a3eWs000000F2pPIAS",
        oldName: "INSAutomation_OutofSequenceEndorsementStatus_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getOutOfSequenceEndorsementStatus",
            location: "GetOOSEStatus",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CancelPolicy_Procedure_1",
        id: "a3eWs000000F2pQIAS",
        oldName: "INSAutomation_CancelPolicy_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.cancelPolicy",
            location: "cancelpolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimLineItem_InitiatePayments_Procedure_2",
        id: "a3eWs000000F2pXIAS",
        oldName: "ClaimLineItem_InitiatePayments_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.createPayments",
            location: "createPayments",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_CreateClaim_Procedure_10",
        id: "a3eWs000000F2q4IAC",
        oldName: "Auto_CreateClaim_Procedure_10",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_PostDriverContact_IP",
            location: "createDriver",
          },
          {
            name: "insClaim_ReadInsuranceParticipantId_FNOLOS",
            location: "getNamedInsuredPolicyParticipantId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "createClaim",
          },
          {
            name: "InsClaimService.createUpdateClaim",
            location: "updateClaimForInjuredFirstParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_delete3rdPartyVehicle_Procedure_7",
        id: "a3eWs000000F2q5IAC",
        oldName: "Claim_delete3rdPartyVehicle_Procedure_7",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_deleteInvolvedInjury_Procedure_7",
        id: "a3eWs000000F2q6IAC",
        oldName: "Claim_deleteInvolvedInjury_Procedure_7",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insClaim_autoFNOLEvaluateProductRules_Procedure_9",
        id: "a3eWs000000F2q7IAC",
        oldName: "insClaim_autoFNOLEvaluateProductRules_Procedure_9",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.invokeProductRules",
            location: "EvaluateClaimProductRulesForAuto",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Renewal_Renew_Procedure_2",
        id: "a3eWs000000F2qDIAS",
        oldName: "Renewal_Renew_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewalService",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_rePriceProductIssue_Procedure_1",
        id: "a3eWs000000F2qKIAS",
        oldName: "INSAutomation_rePriceProductIssue_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "RA_GetQuoteDetails",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RA_RepriceProduct",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RA_CreateUpdateQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyModal_Procedure_3",
        id: "a3eWs000000F2qLIAS",
        oldName: "INSAutomation_createUpdatePolicyModal_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createRenewalPolicyTIWithIsPaid_Procedure_1",
        id: "a3eWs000000F2qMIAS",
        oldName: "INSAutomation_createRenewalPolicyTIWithIsPaid_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insRating_Dental_Procedure_5",
        id: "a3eWs000000F2qNIAS",
        oldName: "insRating_Dental_Procedure_5",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimItem_OtherDamagedProperty_Procedure_1",
        id: "a3eWs000000F2qUIAS",
        oldName: "ClaimItem_OtherDamagedProperty_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "",
            location: "uploadfile",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Asset_PreTransaction_Procedure_1",
        id: "a3eWs000000F2qVIAS",
        oldName: "Asset_PreTransaction_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_CreatePaymentSchedule_Procedure_1",
        id: "a3eWs000000F2qXIAS",
        oldName: "Test_CreatePaymentSchedule_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createPaymentSchedule",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "OtherPropertyDamageDelete_claimUpdateFSC_Procedure_1",
        id: "a3eWs000000F2qaIAC",
        oldName: "OtherPropertyDamageDelete_claimUpdateFSC_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimItem_ResponsibleParty_Procedure_1",
        id: "a3eWs000000F2qcIAC",
        oldName: "ClaimItem_ResponsibleParty_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "VPLClaimFNOL-CreateContact-RespParty1021",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_deleteWitnessOs_Procedure_1",
        id: "a3eWs000000F2qdIAC",
        oldName: "Auto_deleteWitnessOs_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Policy_Cancellation_Procedure_1",
        id: "a3eWs000000F2qhIAC",
        oldName: "Policy_Cancellation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CancelPolicy",
            location: "CreatePolicyTransaction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyRevenueScheduleService.cancel",
            location: "RevenueSchedule",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Policy_InitiateLapseGracePeriodJob_Procedure_1",
        id: "a3eWs000000F2qoIAC",
        oldName: "Policy_InitiateLapseGracePeriodJob_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.initiateLapseGracePeriod",
            location: "InitiateLapseGracePeriod",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_CreateWitnessOS_Procedure_1",
        id: "a3eWs000000F2qpIAC",
        oldName: "Auto_CreateWitnessOS_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_postWitness_IP",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Policy_Modify_Procedure_1",
        id: "a3eWs000000F2qrIAC",
        oldName: "Policy_Modify_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "PolicyModicationTransaction",
            location: "CreatePolicyTransaction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyRevenueScheduleService.modify",
            location: "ModifyRevenue",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "PropClaim_deleteInvolvedInjury_Procedure_1",
        id: "a3eWs000000F2qsIAC",
        oldName: "PropClaim_deleteInvolvedInjury_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "FSCPolicy_CreateRevenue_Procedure_1",
        id: "a3eWs000000F2qtIAC",
        oldName: "FSCPolicy_CreateRevenue_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyRevenueScheduleService.createRevenueSchedule",
            location: "CreateRevenue",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "FSCPolicy_CreateTransaction_Procedure_1",
        id: "a3eWs000000F2quIAC",
        oldName: "FSCPolicy_CreateTransaction_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createTransaction",
            location: "CreateTransaction",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimLineItem_InitiateCancelPayments_Procedure_1",
        id: "a3eWs000000F2qvIAC",
        oldName: "ClaimLineItem_InitiateCancelPayments_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.cancelPayments",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_PriceMultiRootQuote_Procedure_1",
        id: "a3eWs000000F2qxIAC",
        oldName: "Test_PriceMultiRootQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePCRuntimeHandler.priceMultiRootQuote",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_QuoteProductCodeLookup_Procedure_1",
        id: "a3eWs000000F2r5IAC",
        oldName: "Property_QuoteProductCodeLookup_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Asset_PostTransaction_Procedure_1",
        id: "a3eWs000000F2zHIAS",
        oldName: "Asset_PostTransaction_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateAssetTransaction2",
            location: "CreateTransaction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.saveAssetTransaction",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "PropClaim_propFNOLEvaluateProductRules_Procedure_2",
        id: "a3eWs000000F2zIIAS",
        oldName: "PropClaim_propFNOLEvaluateProductRules_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.invokeProductRules",
            location: "evaluateClaimProductRules",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CustomerInteractionAccount_Creation_Procedure_1",
        id: "a3eWs000000F2zJIAS",
        oldName: "CustomerInteractionAccount_Creation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateInteraction",
            location: "CreateInteraction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CustomerInteractionContact_Creation_Procedure_1",
        id: "a3eWs000000F2zLIAS",
        oldName: "CustomerInteractionContact_Creation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateInteractionContact",
            location: "CreateInteraction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "TrailingDocumentRequirementsClaimDemo_Create_Procedure_1",
        id: "a3eWs000000F2zPIAS",
        oldName: "TrailingDocumentRequirementsClaimDemo_Create_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "GetTrailingDocsCategoriesClaim",
            location: "GetTrailingDocumentCategories",
          },
          {
            name: "CreateTrailingDocumentCategoriesClaim",
            location: "CreateTrailingDocumentCategories",
          },
          {
            name: "GetTrailingDocRequirementsClaim",
            location: "GetTrailingDocumentRequirements",
          },
          {
            name: "CreateTrailingDocumentPlaceholdersClaim",
            location: "CreateTrailignDocPlaceholders",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "prop_witnessCreateNew_Procedure_1",
        id: "a3eWs000000F2zXIAS",
        oldName: "prop_witnessCreateNew_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "property_postWitnessContact_CreateClaimIP",
            location: "createContact",
          },
          {
            name: "prop_createWitnessParticipantId_claimsIP",
            location: "createWitnessParticipantId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "LargeContract_Renew_Procedure_1",
        id: "a3eWs000000F2zaIAC",
        oldName: "LargeContract_Renew_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getUserForContact",
            location: "getUserForContact",
          },
          {
            name: "SGExtractSystemCensus",
            location: "extractToRenewQuote",
          },
          {
            name: "SGGetQuoteHeader",
            location: "getQuoteName",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsContractService.getContractDetail",
            location: "getContractDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_AddClaimLineItem_Procedure_1",
        id: "a3eWs000000F2zcIAC",
        oldName: "Property_AddClaimLineItem_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "prop_ReadAssetCoverages_ClaimLineItemIP",
            location: "getPolicyCoverageId",
          },
          {
            name: "insClaims_ReadExistingUniqueClaimCoverages_FNOLOS",
            location: "verifyClaimCoverageExists",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "addClaimCoverage",
          },
          {
            name: "InsClaimItemService.add",
            location: "addClaimLineItemNewClaimCoverage",
          },
          {
            name: "InsClaimItemService.add",
            location: "addClaimLineItemExistingClaimCoverage",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_ClaimOtherProperty_Procedure_1",
        id: "a3eWs000000F2zdIAC",
        oldName: "Property_ClaimOtherProperty_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "prop_PostContact_AddThirdPartyPropertyToClaimIP",
            location: "createContact",
          },
          {
            name: "insClaim_ReadPartyIdByContactId_ClaimFNOLOS",
            location: "getContactPartyId",
          },
          {
            name: "insClaims_PostUpdateClaimPartyRelatiopnshipName_FNOLOS",
            location: "updateClaimPartyRelationshipName",
          },
          {
            name: "",
            location: "uploadfile",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insQuote_Creation_Procedure_1",
        id: "a3eWs000000F2zfIAC",
        oldName: "insQuote_Creation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadQuoteDetails_CreationIP",
            location: "readQuoteDetails",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createUpdateQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimItem_DamagedProperty_Procedure_2",
        id: "a3eWs000000F2zgIAC",
        oldName: "ClaimItem_DamagedProperty_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Asset_Transaction_Procedure_2",
        id: "a3eWs000000F2ziIAC",
        oldName: "Asset_Transaction_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Merge_Lists_Procedure_2",
        id: "a3eWs000000F2zjIAC",
        oldName: "Merge_Lists_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "prop_addScheduledItemsToClaim_Procedure_2",
        id: "a3eWs000000F2zkIAC",
        oldName: "prop_addScheduledItemsToClaim_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "prop_addScheduledItemsCreateAsset_ScheduledItemIP",
            location: "insuranceAssetCreation",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "postDamageProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "prop_ClaimInjuredPerson_Procedure_1",
        id: "a3eWs000000F2zlIAC",
        oldName: "prop_ClaimInjuredPerson_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "prop_PostInjuredPartyContact_ClaimInjuredPersonNew",
            location: "createContact",
          },
          {
            name: "prop_createInjuredParticipants_claimIP",
            location: "createParticipantId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "OtherPropertyDamageEdit_claimUpdateFSC_Procedure_1",
        id: "a3eWs000000F2zmIAC",
        oldName: "OtherPropertyDamageEdit_claimUpdateFSC_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "property_postOtherPropertyContactEdit_claimFSCEdit",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_CreateClaim_Procedure_1",
        id: "a3eWs000000F2zoIAC",
        oldName: "Property_CreateClaim_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadPartyIdByAccountId_ClaimFNOLOS",
            location: "getPolicyholderPartyId",
          },
          {
            name: "insClaims_ReadPartyRelationshipType_FNOLOS",
            location: "getInsuredPartyRelationshipTypeId",
          },
          {
            name: "prop_PostPolicyholderToClaim_CreateClaimIP",
            location: "addPolicyholderasPayee",
          },
          {
            name: "insClaims_ReadPolicyolderClaimantId_ClaimFNOLOS",
            location: "getPolicyholderClaimantId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "createClaim",
          },
          {
            name: "InsClaimService.createUpdateClaim",
            location: "updateClaimFirstPartyDamageProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "UpdateFrameAgreement_Order_Procedure_1",
        id: "a3eWs000000F2zqIAC",
        oldName: "UpdateFrameAgreement_Order_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Order Discount Extract - Update",
            location: "SourceData",
          },
          {
            name: "UpdateOrderDiscountDate",
            location: "UpdateOrderDiscountDate",
          },
          {
            name: "UpdateContractDiscounts - Order",
            location: "UpdateFrameAgreementAndDiscounts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "TelcoUpdateFrameContract.copyOldContractDocuments",
            location: "CopyOldContractDocuments",
          },
          {
            name: "TelcoUpdateFrameContract.calculateDiscountDates",
            location: "CalculateDiscountDates",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "SmallGroup_Renewal_Procedure_2",
        id: "a3eWs000000F304IAC",
        oldName: "SmallGroup_Renewal_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getUserForContact",
            location: "getUserForContact",
          },
          {
            name: "SGCreateRenewalOpportunity",
            location: "createOpportunity",
          },
          {
            name: "SGExtractSystemCensus",
            location: "extractToRenewQuote",
          },
          {
            name: "SGGetQuoteHeader",
            location: "getQuoteName",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsContractService.getContractDetail",
            location: "getContractDetail",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollmentDental_EnrollPlan_Procedure_1",
        id: "a3eWs000000F309IAC",
        oldName: "InsEnrollmentDental_EnrollPlan_Procedure_1",
        dependenciesIP: [
          {
            name: "InsEnrollment_updatePolicyDetailsDental",
            location: "updatePolicyDetailsDental",
          },
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadQuoteLineItems_IP",
            location: "getQuoteLineItems",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsEnrollmentService.enrollPlans",
            location: "enrolldentalPlan",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "AmendFrameAgreement_Quote_Procedure_2",
        id: "a3eWs000000F30DIAS",
        oldName: "AmendFrameAgreement_Quote_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "AmendFrameContractExtract-Quote",
            location: "ExtractFrameAgreement",
          },
          {
            name: "AmendFrameContract-CreateQuote",
            location: "CreateQuote",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Insurance_IssuePayment_Procedure_1",
        id: "a3eWs000000F30EIAS",
        oldName: "Insurance_IssuePayment_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ExtractPolicyInfoForPayment_IssuePaymentIP",
            location: "GetPolicyInfo",
          },
          {
            name: "Ins_PostPolicy_IssuePmtIP",
            location: "UpdatePolicyValues",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.createPolicyTransaction",
            location: "CreateTransaction",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "SmallGroup_VisionRating_Procedure_1",
        id: "a3eWs000000F30JIAS",
        oldName: "SmallGroup_VisionRating_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "TrailingDocumentRequirementsContacts_Contacts_Procedure_1",
        id: "a3eWs000000F30KIAS",
        oldName: "TrailingDocumentRequirementsContacts_Contacts_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "GetTrailingDocumentCategories",
            location: "GetTrailingDocumentCategories",
          },
          {
            name: "CreateTrailingDocumentCategoriesContacts",
            location: "CreateTrailingDocumentCategoriesContacts",
          },
          {
            name: "GetTrailingDocRequirements",
            location: "GetTrailingDocumentRequirements",
          },
          {
            name: "CreateTrailingDocPlaceholdersContacts",
            location: "CreateTrailingDocPlaceholdersContacts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "autoqeoaregression_calcproc_Procedure_2",
        id: "a3eWs000000F30RIAS",
        oldName: "auto_qeoaregression_calcproc_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
          " type will be changed from auto_qeoaregression to autoqeoaregression",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "TravelRating_Test_Procedure_1",
        id: "a3eWs000000F30XIAS",
        oldName: "TravelRating_Test_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_updatePolicyDetailsAdditional_Procedure_1",
        id: "a3eWs000000F30ZIAS",
        oldName: "InsEnrollment_updatePolicyDetailsAdditional_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_PostPolicyDetails_Additional",
            location: "updatePolicyDetailsAdditional",
          },
          {
            name: "ins_getPolicyParticipants",
            location: "getParticipantsId",
          },
          {
            name: "ins_postPolicyParticipantsInsuredSpec",
            location: "updateParticipant",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_MultiInstanceRating_Procedure_1",
        id: "a3eWs000000F30aIAC",
        oldName: "Auto_MultiInstanceRating_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_PostTransaction_Procedure_1",
        id: "a3eWs000000F30bIAC",
        oldName: "Claim_PostTransaction_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateClaimTransaction",
            location: "CreateTransaction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimHandler.upsertClaimTransaction",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ins_GetQuoteContext_Procedure_2",
        id: "a3eWs000000F30cIAC",
        oldName: "ins_GetQuoteContext_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_ReadAccountContextType_GetQuoteContextIP",
            location: "getContextType",
          },
          {
            name: "ins_ReadPersonAccountDetails_GetQuoteContextIP",
            location: "getPersonAccountDetails",
          },
          {
            name: "ins_ReadProducer_GetQuoteContextIP",
            location: "getProducerDetails",
          },
          {
            name: "ins_ReadBusinessAccount_GetQuoteContextIP",
            location: "getBusinessAccountDetails",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ins_CreateQuote_Procedure_2",
        id: "a3eWs000000F30dIAC",
        oldName: "ins_CreateQuote_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "raCreateQuote",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimProductRules_OpenPDCoverage_Procedure_3",
        id: "a3eWs000000F30gIAC",
        oldName: "ClaimProductRules_OpenPDCoverage_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedProperty",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredProperty",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaim",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverage",
          },
          {
            name: "insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP",
            location: "getInvolvedInjury",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredPropertyForInjury",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaimForInjury",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverageForInjury",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoveragePropertyItem",
          },
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoverageInjury",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimProductRules_OpenCoverage_Procedure_1",
        id: "a3eWs000000F30kIAC",
        oldName: "ClaimProductRules_OpenCoverage_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedProperty",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredProperty",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaim",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverage",
          },
          {
            name: "insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP",
            location: "getInvolvedInjury",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredPropertyForInjury",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaimForInjury",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverageForInjury",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoveragePropertyItem",
          },
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoverageInjury",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "calcProcedure_getRatedProducts_Procedure_2",
        id: "a3eWs000000F30lIAC",
        oldName: "calcProcedure_getRatedProducts_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Interaction_handleInteractionFieldClick_Procedure_1",
        id: "a3eWs000000F30mIAC",
        oldName: "Interaction_handleInteractionFieldClick_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "CardCanvasController.createInteractionTopic",
            location: "createInteractionTopic",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_ClaimInjuredPerson_Procedure_2",
        id: "a3eWs000000F30nIAC",
        oldName: "Auto_ClaimInjuredPerson_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "auto_PostInjuredPersonContact_ClaimInjuredPersonIP",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "KBB_GetYears_Procedure_2",
        id: "a3eWs000000F30oIAC",
        oldName: "KBB_GetYears_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimProductRules_OpenRentalCarCoverage_Procedure_2",
        id: "a3eWs000000F30pIAC",
        oldName: "ClaimProductRules_OpenRentalCarCoverage_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedProperty",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredProperty",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaim",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverage",
          },
          {
            name: "insClaims_ReadParty_OpenCoverageProductRulesIP",
            location: "getParty",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoveragePropertyItem",
          },
          {
            name: "InsClaimItemService.add",
            location: "createClaimLineItem",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Batch_getRatedProducts_Procedure_2",
        id: "a3eWs000000F30qIAC",
        oldName: "Batch_getRatedProducts_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_InsClaimService_Procedure_2",
        id: "a3eWs000000F30rIAC",
        oldName: "Test_InsClaimService_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "CreateUpdateClaim",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "SmallGroup_DentalRating_Procedure_1",
        id: "a3eWs000000F30sIAC",
        oldName: "SmallGroup_DentalRating_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_CreateUpdateQuote_Procedure_3",
        id: "a3eWs000000F30tIAC",
        oldName: "Auto_CreateUpdateQuote_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "createUpdateQuote",
          },
          {
            name: "InsQuoteService.invokeProductRules",
            location: "referToUnderwriting",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "GuestUser_EncryptId1_Procedure_2",
        id: "a3eWs000000F30uIAC",
        oldName: "GuestUser_EncryptId1_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService.encryptIfNecessary",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insClaim_ClaimWitness_Procedure_3",
        id: "a3eWs000000F30vIAC",
        oldName: "insClaim_ClaimWitness_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaim_PostWitnessContact_ClaimWitnessIP",
            location: "createContact",
          },
          {
            name: "insClaim_ReadPartyIdByContactId_ClaimFNOLOS",
            location: "getContactPartyId",
          },
          {
            name: "insClaims_PostUpdateClaimPartyRelatiopnshipName_FNOLOS",
            location: "updateClaimPartyRelationshipName",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_FSCRefactors_Procedure_3",
        id: "a3eWs000000F30wIAC",
        oldName: "Test_FSCRefactors_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getInsuredItemRecords",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "KBB_GetMakes_Procedure_1",
        id: "a3eWs000000F30xIAC",
        oldName: "KBB_GetMakes_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimLineItem_Payments_Procedure_1",
        id: "a3eWs000000F30yIAC",
        oldName: "ClaimLineItem_Payments_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "UpdateClaimLineItemsStatus",
            location: "UpdatePaidAmountAndStatus",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.createTransactions",
            location: "CreateTransaction",
          },
          {
            name: "InsClaimItemService.checkPaymentCreationMode",
            location: "CheckPaymentCreationMode",
          },
          {
            name: "InsClaimItemService.createPayments",
            location: "CreatePayments",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "prop_claimFirstPartyProperty_Procedure_1",
        id: "a3eWs000000F30zIAC",
        oldName: "prop_claimFirstPartyProperty_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "postDamagedProperty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_ClaimInjuredPerson_Procedure_2",
        id: "a3eWs000000F310IAC",
        oldName: "Property_ClaimInjuredPerson_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "prop_PostInjuredPersonContact_ClaimInjuredPersonIP",
            location: "createContact",
          },
          {
            name: "insClaim_ReadPartyIdByContactId_ClaimFNOLOS",
            location: "getPartyIdByContactId",
          },
          {
            name: "insClaims_PostUpdateClaimPartyRelatiopnshipName_FNOLOS",
            location: "updateClaimPartyRelationshipName",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimProductRules_OpenCollisionCoverage_Procedure_1",
        id: "a3eWs000000F314IAC",
        oldName: "ClaimProductRules_OpenCollisionCoverage_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedProperty",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredProperty",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaim",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverage",
          },
          {
            name: "insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP",
            location: "getInvolvedInjury",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredPropertyForInjury",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaimForInjury",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverageForInjury",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoveragePropertyItem",
          },
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoverageInjury",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ins_EditBlockCensusMember_Procedure_2",
        id: "a3eWs000000F315IAC",
        oldName: "ins_EditBlockCensusMember_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_UpdateCensusMember",
            location: "UpdateCensusMember",
          },
          {
            name: "ins_CensusContact_Load",
            location: "UpdateContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_GenerateTaxAndFee_Procedure_2",
        id: "a3eWs000000F316IAC",
        oldName: "Auto_GenerateTaxAndFee_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.calculateTaxesAndFees",
            location: "GenerateTaxesAndFees",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CCUser_DecryptId_Procedure_2",
        id: "a3eWs000000F317IAC",
        oldName: "CCUser_DecryptId_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "UserSecurityService2.decryptIfNecessary",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimProductRules_OpenBICoverage_Procedure_1",
        id: "a3eWs000000F318IAC",
        oldName: "ClaimProductRules_OpenBICoverage_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedProperty",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredProperty",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaim",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverage",
          },
          {
            name: "insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP",
            location: "getInvolvedInjury",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredPropertyForInjury",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaimForInjury",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverageForInjury",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoveragePropertyItem",
          },
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoverageInjury",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_Transaction_Procedure_1",
        id: "a3eWs000000F31AIAS",
        oldName: "Claim_Transaction_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "UpdateFrameAgreement_Oppty_Procedure_2",
        id: "a3eWs000000F31BIAS",
        oldName: "UpdateFrameAgreement_Oppty_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Oppty Discount Extract - Update",
            location: "SourceData",
          },
          {
            name: "UpdateOpptyDiscountDate",
            location: "UpdateOpptyDiscountDate",
          },
          {
            name: "UpdateContractDiscounts - Oppty",
            location: "UpdateFrameAgreementAndDiscounts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "TelcoUpdateFrameContract.copyOldContractDocuments",
            location: "CopyOldContractDocuments",
          },
          {
            name: "TelcoUpdateFrameContract.calculateDiscountDates",
            location: "CalculateDiscountDates",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "KBB_GetModelsByYearAndMake_Procedure_1",
        id: "a3eWs000000F31CIAS",
        oldName: "KBB_GetModelsByYearAndMake_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "prop_deleteWitness_Procedure_1",
        id: "a3eWs000000F31DIAS",
        oldName: "prop_deleteWitness_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "AccountPayments_OneTimePayment_Procedure_1",
        id: "a3eWs000000F31FIAS",
        oldName: "AccountPayments_OneTimePayment_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ExtractPolicyInfoForPayment",
            location: "GetPolicyInfo",
          },
          {
            name: "updatePolicyforOneTimePaymentAccount",
            location: "UpdatePolicyValues",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.createPolicyTransaction",
            location: "CreatePremiumTransaction",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimItem_Witness_Procedure_3",
        id: "a3eWs000000F31HIAS",
        oldName: "ClaimItem_Witness_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "VPLClaimFNOL-CreateContact-Witness1021",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_updatePolicyDetailsDental_Procedure_1",
        id: "a3eWs000000F31IIAS",
        oldName: "InsEnrollment_updatePolicyDetailsDental_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_PostPolicyDetails_Dental",
            location: "updatePolicyDetailsDental",
          },
          {
            name: "ins_getPolicyParticipants",
            location: "getParticipantsId",
          },
          {
            name: "ins_postPolicyParticipantsInsuredSpec",
            location: "updateParticipant",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_QuoteCountyLookup_Procedure_1",
        id: "a3eWs000000F31JIAS",
        oldName: "Property_QuoteCountyLookup_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_MergeDriverInsuredItemsAddDriversEndorsement_Procedure_3",
        id: "a3eWs000000F31KIAS",
        oldName: "Auto_MergeDriverInsuredItems-AddDriversEndorsement_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from MergeDriverInsuredItems-AddDriversEndorsement to MergeDriverInsuredItemsAddDriversEndorsement",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimItem_InjuredPerson104_Procedure_3",
        id: "a3eWs000000F31LIAS",
        oldName: "ClaimItem_InjuredPerson104_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ClaimFNOLCreateContact-104-1",
            location: "createContact",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceClaimService.createUpdateClaim",
            location: "addClaimParty",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ins_EnrollmentMemberCreateContact_Procedure_2",
        id: "a3eWs000000F31MIAS",
        oldName: "ins_EnrollmentMemberCreateContact_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_UpdateDependentContact_memberEnrollmentIP",
            location: "createContact",
          },
          {
            name: "Ins_postContactToCencusMember",
            location: "MapContactToCensus",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Auto_MergeInsuredItems_Procedure_2",
        id: "a3eWs000000F31NIAS",
        oldName: "Auto_MergeInsuredItems_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_TransactionService_Procedure_2",
        id: "a3eWs000000F31OIAS",
        oldName: "Test_TransactionService_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsurancePolicyTransactionService.reverseTransaction",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "UpdateFrameAgreement_Quote_Procedure_2",
        id: "a3eWs000000F31PIAS",
        oldName: "UpdateFrameAgreement_Quote_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Quote Discount Extract - Update",
            location: "SourceData",
          },
          {
            name: "UpdateQuoteDiscountDate",
            location: "UpdateQuoteDiscountDate",
          },
          {
            name: "UpdateContractDiscounts - Quote",
            location: "UpdateFrameAgreementAndDiscounts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "TelcoUpdateFrameContract.copyOldContractDocuments",
            location: "CopyOldContractDocuments",
          },
          {
            name: "TelcoUpdateFrameContract.calculateDiscountDates",
            location: "CalculateDiscountDates",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CreatePolicy_Watercraft_Procedure_3",
        id: "a3eWs000000F31QIAS",
        oldName: "CreatePolicy_Watercraft_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "GetPolicyInfo",
            location: "GetPolicyNumber",
          },
          {
            name: "createPolicyStatement",
            location: "createStatementRecord",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insRating_WorkersCompensationNCCi_Procedure_1",
        id: "a3eWs000000F31RIAS",
        oldName: "insRating_WorkersCompensationNCCi_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ClaimProductRules_OpenBIPDCoverage_Procedure_1",
        id: "a3eWs000000F31SIAS",
        oldName: "ClaimProductRules_OpenBIPDCoverage_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadInvolvedProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedProperty",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredProperty",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaim",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverage",
          },
          {
            name: "insClaims_ReadInvolvedInjury_OpenCoverageProductRulesIP",
            location: "getInvolvedInjury",
          },
          {
            name: "insClaims_ReadInvolvedInsuredProperty_OpenCoverageProductRulesIP",
            location: "getInvolvedInsuredPropertyForInjury",
          },
          {
            name: "insClaims_ReadClaim_OpenCoverageProductRulesIP",
            location: "getClaimForInjury",
          },
          {
            name: "insClaims_ReadAssetCoverage_OpenCoverageProductRulesIP",
            location: "getPolicyCoverageForInjury",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoveragePropertyItem",
          },
          {
            name: "InsClaimCoverageService.createUpdateCoverage",
            location: "openCoverageInjury",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Document_QuoteGeneration_Procedure_1",
        id: "a3eWs000000F31TIAS",
        oldName: "Document_QuoteGeneration_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ReadAccount-100-1",
            location: "GetAccountDetails",
          },
          {
            name: "CreateQuoteAttachment",
            location: "drPostToAttachment",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "HelloWorld.hello",
            location: "TestOneHelloWorld",
          },
          {
            name: "EncodeJSON.Encode",
            location: "baseEncodeRootNode",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "propertyClaim_CreateClaimFSC_Procedure_1",
        id: "a3eWs000000F31VIAS",
        oldName: "propertyClaim_CreateClaimFSC_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readInsuredPartySpecId_IP",
            location: "getInsuredPartySpecId",
          },
          {
            name: "prop_createInsuranceParticipants_claimCreateIP",
            location: "createParticipantId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimService.createUpdateClaim",
            location: "createClaim",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "KBB_GetTrimsAndVehicleIdsByYearAndModel_Procedure_3",
        id: "a3eWs000000F31WIAS",
        oldName: "KBB_GetTrimsAndVehicleIdsByYearAndModel_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "UpdateQuote_Watercraft_Procedure_1",
        id: "a3eWs000000F31XIAS",
        oldName: "UpdateQuote_Watercraft_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "updateQuote",
          },
          {
            name: "InsuranceProductRuleService.invokeProductRules",
            location: "referToUnderwriting",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Property_QuoteTransForConfig_Procedure_1",
        id: "a3eWs000000F31aIAC",
        oldName: "Property_QuoteTransForConfig_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CreateFrameAgreement_Quote_Procedure_1",
        id: "a3eWs000000F31bIAC",
        oldName: "CreateFrameAgreement_Quote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Quote Discount Extract - Create",
            location: "SourceData",
          },
          {
            name: "UpdateQuoteDiscountDate",
            location: "UpdateQuoteDiscountDate",
          },
          {
            name: "CreateContractDiscounts - Quote",
            location: "CreateFrameAgreementAndDiscounts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AddContractTermsForContractId.addContractTerms",
            location: "AddGeneralTermsForContract",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Test_getPaymentSchedule_Procedure_3",
        id: "a3eWs000000F31cIAC",
        oldName: "Test_getPaymentSchedule_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getPaymentSchedule",
            location: "RemoteAction1",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "NewClaimLineItemTemporaryHousing_Create_Procedure_1",
        id: "a3eWs000000F31dIAC",
        oldName: "NewClaimLineItemTemporaryHousing_Create_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "extractInvolvedProperty",
            location: "ExtractInvolvedProperty",
          },
          {
            name: "VPL-GetAssetCoverages-104-1",
            location: "getCoverageId",
          },
          {
            name: "GetTrailingDocsCategoriesClaim",
            location: "GetTrailingDocumentCategories",
          },
          {
            name: "CreateTrailingDocumentCategoriesClaimLineItem",
            location: "CreateTrailingDocumentCategories",
          },
          {
            name: "GetTrailingDocRequirementsClaim",
            location: "GetTrailingDocumentRequirements",
          },
          {
            name: "CreateTrailingDocumentPlaceholdersClaimLineItem",
            location: "CreateTrailignDocPlaceholders",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.calculateCoverages",
            location: "calculateCoverages",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Document_PolicyRenewalGeneration_Procedure_2",
        id: "a3eWs000000F31eIAC",
        oldName: "Document_PolicyRenewalGeneration_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "VPL-ReadAccount-100-1",
            location: "GetAccountDetails",
          },
          {
            name: "CreatePolicyRenewalAttachment",
            location: "drPostToAttachment",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.getPolicyDetails",
            location: "getPolicyDetails",
          },
          {
            name: "EncodeJSON.Encode",
            location: "baseEncodeRootNode",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollmentAdditional_EnrollPlan_Procedure_1",
        id: "a3eWs000000F31hIAC",
        oldName: "InsEnrollmentAdditional_EnrollPlan_Procedure_1",
        dependenciesIP: [
          {
            name: "InsEnrollment_updatePolicyDetailsAdditional",
            location: "updatePolicyDetailsAdditional",
          },
        ],
        dependenciesDR: [
          {
            name: "ins_readAdditionaPlanQlIdClId_OS",
            location: "getAdditionalPlansQlClId",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsEnrollmentService.enrollPlans",
            location: "enrolladditionalPlan",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "KBB_GetValuationSummaries_Procedure_2",
        id: "a3eWs000000F31iIAC",
        oldName: "KBB_GetValuationSummaries_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsPolicy_createVersionForAddDriver_Procedure_2",
        id: "a3eWs000000F31lIAC",
        oldName: "InsPolicy_createVersionForAddDriver_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_PostOldPolicyVersion_FscOS",
            location: "UpdateOldVersion",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "autoqeoaregression_ipgetContactDetails_Procedure_2",
        id: "a3eWs000000F31nIAC",
        oldName: "auto_qeoaregression_ipgetContactDetails_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "DRGetContact",
            location: "DataRaptorExtractAction",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
          " type will be changed from auto_qeoaregression to autoqeoaregression",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Insurance_CreatePolicy_Procedure_2",
        id: "a3eWs000000F31oIAC",
        oldName: "Insurance_CreatePolicy_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadPolicyDetails_CreateUpdatePolicyIP",
            location: "GetPolicyNumber",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Watercraft_Renewal_Procedure_1",
        id: "a3eWs000000F31pIAC",
        oldName: "Watercraft_Renewal_Procedure_1",
        dependenciesIP: [
          {
            name: "Document_PolicyRenewalGeneration",
            location: "DocGenPolicyRenewal",
          },
        ],
        dependenciesDR: [
          {
            name: "GetOriginalPolicyDetails",
            location: "GetRenewalInfo",
          },
          {
            name: "PostBilingDetailsforNewPolicy-Renewal",
            location: "PostBillingDetails",
          },
          {
            name: "PostBillingDetailsforRenewal2",
            location: "PostBillingDetails2",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceAssetHandler.getPolicyDetails",
            location: "GetPolicyDetails",
          },
          {
            name: "InsuranceQuotePolicyService.createPolicyVersion",
            location: "createPolicyVersion",
          },
          {
            name: "InsuranceQuotePolicyService.createPolicyTransaction",
            location: "CreateRenewalTransaction",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "AmendFrameAgreement_Oppty_Procedure_2",
        id: "a3eWs000000F31qIAC",
        oldName: "AmendFrameAgreement_Oppty_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "AmendFrameContractExtract-Oppty",
            location: "ExtractFrameAgreement",
          },
          {
            name: "AmendFrameContract-CreateOppty",
            location: "CreateOppty",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "TrailingDocumentRequirements_Create_Procedure_1",
        id: "a3eWs000000F31rIAC",
        oldName: "TrailingDocumentRequirements_Create_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "GetTrailingDocumentCategories",
            location: "GetTrailingDocumentCategories",
          },
          {
            name: "CreateTrailingDocumentCategories",
            location: "CreateTrailingDocumentCategories",
          },
          {
            name: "GetTrailingDocRequirements",
            location: "GetTrailingDocumentRequirements",
          },
          {
            name: "CreateTrailingDocumentPlaceholders",
            location: "CreateTrailignDocPlaceholders",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "AmendFrameAgreement_Order_Procedure_2",
        id: "a3eWs000000F31sIAC",
        oldName: "AmendFrameAgreement_Order_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "AmendFrameContractExtract-Order",
            location: "ExtractFrameAgreement",
          },
          {
            name: "AmendFrameContract-CreateOrder",
            location: "CreateOrder",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_updatePolicyDetailsMedical_Procedure_1",
        id: "a3eWs000000F31tIAC",
        oldName: "InsEnrollment_updatePolicyDetailsMedical_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_PostPolicyDetails_memberEnrollmentMed",
            location: "updatePolicyDetailsMedical",
          },
          {
            name: "ins_getPolicyParticipants",
            location: "getParticipantsId",
          },
          {
            name: "ins_postPolicyParticipantsInsuredSpec",
            location: "updateParticipant",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insClaim_addPolicyAssetsToPolicyCoverages_Procedure_1",
        id: "a3eWs000000F31uIAC",
        oldName: "insClaim_addPolicyAssetsToPolicyCoverages_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadPolicyCoverages_AddPolicyAssetsIP",
            location: "getPolicyCoverages",
          },
          {
            name: "insClaims_postInsurancePolicyAsset_addPolicyAssetsIP",
            location: "postInsurancePolicyAsset",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CustomerInteractionAccountCMT_Creation_Procedure_1",
        id: "a3eWs000000F31vIAC",
        oldName: "CustomerInteractionAccountCMT_Creation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateInteraction",
            location: "CreateInteraction",
          },
          {
            name: "ExtractAssetBasedOnAccount",
            location: "ExtractAssetBasedOnAccount",
          },
          {
            name: "CreateInteractionTopics",
            location: "CreateCMTInteractionTopic",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "NewClaimLineItemLoss_Create_Procedure_1",
        id: "a3eWs000000F31wIAC",
        oldName: "NewClaimLineItemLoss_Create_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ClaimLineitemsDocUpload",
            location: "LossDocUpload",
          },
          {
            name: "VPL-GetAssetCoverages-104-1",
            location: "getCoverageId",
          },
          {
            name: "GetTrailingDocsCategoriesClaim",
            location: "GetTrailingDocumentCategories",
          },
          {
            name: "CreateTrailingDocumentCategoriesClaimLineItem",
            location: "CreateTrailingDocumentCategories",
          },
          {
            name: "GetTrailingDocRequirementsClaim",
            location: "GetTrailingDocumentRequirements",
          },
          {
            name: "CreateTrailingDocumentPlaceholdersClaimLineItem",
            location: "CreateTrailignDocPlaceholders",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.calculateCoverages",
            location: "calculateCoverages",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_updatePolicyDetailsTerm_Procedure_1",
        id: "a3eWs000000F31xIAC",
        oldName: "InsEnrollment_updatePolicyDetailsTerm_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_PostPolicyDetailsTerm_IP",
            location: "updatePolicyDetailsTerm",
          },
          {
            name: "ins_getPolicyParticipants",
            location: "getParticipantsId",
          },
          {
            name: "ins_postPolicyParticipantsInsuredSpec",
            location: "updateParticipant",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_updatePolicyDetailsVision_Procedure_1",
        id: "a3eWs000000F31yIAC",
        oldName: "InsEnrollment_updatePolicyDetailsVision_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Ins_PostPolicyDetails_Vision",
            location: "updatePolicyDetailsVision",
          },
          {
            name: "ins_getPolicyParticipants",
            location: "getParticipantsId",
          },
          {
            name: "ins_postPolicyParticipantsInsuredSpec",
            location: "updateParticipant",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "NewClaimLineItemTPA_Create_Procedure_1",
        id: "a3eWs000000F31zIAC",
        oldName: "NewClaimLineItemTPA_Create_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "extractInvolvedProperty",
            location: "ExtractInvolvedProperty",
          },
          {
            name: "VPL-GetAssetCoverages-104-1",
            location: "getCoverageId",
          },
          {
            name: "GetTrailingDocsCategoriesClaim",
            location: "GetTrailingDocumentCategories",
          },
          {
            name: "CreateTrailingDocumentCategoriesClaimLineItem",
            location: "CreateTrailingDocumentCategories",
          },
          {
            name: "GetTrailingDocRequirementsClaim",
            location: "GetTrailingDocumentRequirements",
          },
          {
            name: "CreateTrailingDocumentPlaceholdersClaimLineItem",
            location: "CreateTrailignDocPlaceholders",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsClaimItemService.calculateCoverages",
            location: "calculateCoverages",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CreateFrameAgreement_Oppty_Procedure_1",
        id: "a3eWs000000F320IAC",
        oldName: "CreateFrameAgreement_Oppty_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Oppty Discount Extract - Create",
            location: "SourceData",
          },
          {
            name: "UpdateOpptyDiscountDate",
            location: "UpdateOpptyDiscountDate",
          },
          {
            name: "CreateContractDiscounts - Oppty",
            location: "CreateFrameAgreementAndDiscounts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AddContractTermsForContractId.addContractTerms",
            location: "AddGeneralTermsForContract",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CustomerInteractionContactCMT_Creation_Procedure_1",
        id: "a3eWs000000F321IAC",
        oldName: "CustomerInteractionContactCMT_Creation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateInteractionContact",
            location: "CreateInteraction",
          },
          {
            name: "ExtractAccountFromContact",
            location: "ExtractAccountFromContact",
          },
          {
            name: "ExtractAssetBasedOnAccount",
            location: "ExtractAssetBasedOnAccount",
          },
          {
            name: "CreateContactInteractionTopic",
            location: "CreateCMTInteractionTopic",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Watercraft_Reinstatement_Procedure_1",
        id: "a3eWs000000F322IAC",
        oldName: "Watercraft_Reinstatement_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "CreateReinstatementTransactionandUpdatestatus",
            location: "updatePolicyStatus",
          },
          {
            name: "GetPolicyInfo",
            location: "getPolicyInfo",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsuranceQuotePolicyService.createPolicyVersion",
            location: "createPolicyVersion",
          },
          {
            name: "InsuranceQuotePolicyService.createPolicyTransaction",
            location: "createReinstatementTransaction",
          },
          {
            name: "InsPolicyRevenueScheduleService.create",
            location: "generateRevenueSchedule",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CreateFrameAgreement_Order_Procedure_1",
        id: "a3eWs000000F323IAC",
        oldName: "CreateFrameAgreement_Order_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "Order Discount Extract - Create",
            location: "SourceData",
          },
          {
            name: "UpdateOrderDiscountDate",
            location: "UpdateOrderDiscountDate",
          },
          {
            name: "CreateContractDiscounts - Order",
            location: "CreateFrameAgreementAndDiscounts",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "AddContractTermsForContractId.addContractTerms",
            location: "AddGeneralTermsForContract",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollmentMedical_EnrollPlan_Procedure_1",
        id: "a3eWs000000F324IAC",
        oldName: "InsEnrollmentMedical_EnrollPlan_Procedure_1",
        dependenciesIP: [
          {
            name: "InsEnrollment_updatePolicyDetailsMedical",
            location: "updatePolicyDetailsMedical",
          },
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadQuoteLineItems_IP",
            location: "getQuoteLineItems",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsEnrollmentService.enrollPlans",
            location: "enrollmedicalPlan",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollmentTerm_EnrollPlan_Procedure_1",
        id: "a3eWs000000F325IAC",
        oldName: "InsEnrollmentTerm_EnrollPlan_Procedure_1",
        dependenciesIP: [
          {
            name: "InsEnrollment_updatePolicyDetailsTerm",
            location: "updatePolicyDetailsTerm",
          },
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadQuoteLineItems_IP",
            location: "getQuoteLineItems",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsEnrollmentService.enrollPlans",
            location: "enrollTermPlan",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollmentVision_EnrollPlan_Procedure_1",
        id: "a3eWs000000F326IAC",
        oldName: "InsEnrollmentVision_EnrollPlan_Procedure_1",
        dependenciesIP: [
          {
            name: "InsEnrollment_updatePolicyDetailsVision",
            location: "updatePolicyDetailsVision",
          },
        ],
        dependenciesDR: [
          {
            name: "Ins_ReadQuoteLineItems_IP",
            location: "getQuoteLineItems",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsEnrollmentService.enrollPlans",
            location: "enrollvisionPlan",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_Participant_Procedure_3",
        id: "a3eWs000000F327IAC",
        oldName: "Claim_Participant_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_PostContact",
            location: "createContact",
          },
          {
            name: "claims_PostParticipantToClaim_ClaimIPs",
            location: "createClaimPartyRelationshipForClaim",
          },
          {
            name: "insClaims_ReadPartyRelationshipType_FNOLOS",
            location: "getParticipantRole",
          },
          {
            name: "GetPartyIdByContactId",
            location: "getPartyByContactId",
          },
          {
            name: "ins_ReadPartyByAccountId",
            location: "getPartyByAccountId",
          },
          {
            name: "claims_PostParticipantToClaimWithAccountId_ClaimIP",
            location: "createClaimPartyRelationshipForAccount",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_ParticipantExtract_Procedure_3",
        id: "a3eWs000000F328IAC",
        oldName: "Claim_ParticipantExtract_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_ReadParticipant_ParticipantIP",
            location: "getClaimParticipant",
          },
          {
            name: "ins_ReadAccountByPartyId",
            location: "getAccount",
          },
          {
            name: "ins_ReadContactByPartyId",
            location: "getContact",
          },
          {
            name: "insClaims_ReadClaimPartyRelationshipById",
            location: "getParticipantRoleName",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Claim_ParticipantUpdate_Procedure_4",
        id: "a3eWs000000F329IAC",
        oldName: "Claim_ParticipantUpdate_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "insClaims_UpdateContact",
            location: "updateContact",
          },
          {
            name: "insClaims_UpdateAccountClaimPartyRelationship_ParticipantIP",
            location: "updateAccountParticipantRole",
          },
          {
            name: "insClaims_ReadPartyRelationshipType_FNOLOS",
            location: "getParticipantRole",
          },
          {
            name: "ins_ReadPartyByContactId",
            location: "getPartyByContactId",
          },
          {
            name: "ins_ReadPartyByAccountId",
            location: "getPartyByAccountId",
          },
          {
            name: "insClaims_UpdateContactClaimPartyRelationship_ParticipantIP",
            location: "updateContactParticipantRole",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "Homeowners_PolicySubmit_Procedure_6",
        id: "a3eWs000000F32RIAS",
        oldName: "Homeowners_Policy Submit_Procedure_6",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "GetBrokerAndInsured",
            location: "GetBrokerAndInsured",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from Policy Submit to PolicySubmit",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "PaymentDetailAction_InitiateRecovery_Procedure_1",
        id: "a3eWs000000F32dIAC",
        oldName: "PaymentDetailAction_InitiateRecovery_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "demoRecoveryInitiate",
            location: "postRecovery",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ins_EnrollmentMemberTransformAdditionalInput_Procedure_1",
        id: "a3eWs000000F32iIAC",
        oldName: "ins_EnrollmentMemberTransformAdditionalInput_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_censusMembersPolciies_Procedure_3",
        id: "a3eWs000000F32mIAC",
        oldName: "InsEnrollment_censusMembersPolciies_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_readCensusMemberPolicies",
            location: "getCMPolcies",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollmentStd_bulkGetCMErrors_Procedure_1",
        id: "a3eWs000000F32qIAC",
        oldName: "InsEnrollmentStd_bulkGetCMErrors_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_ReadCensusMemberError_OSStd",
            location: "getCMError",
          },
          {
            name: "ins_readCensusMemberPlansStd",
            location: "getPlans",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CreateUpdatePolicy_ModalPaymentCalculation_Procedure_1",
        id: "a3eWs000000F32xIAC",
        oldName: "CreateUpdatePolicy_ModalPaymentCalculation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "createPolicyVersion_ModalPaymentCalculation_Procedure_1",
        id: "a3eWs000000F32yIAC",
        oldName: "createPolicyVersion_ModalPaymentCalculation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "CreateUpdatePolicy_DailyPaymentCalculation_Procedure_1",
        id: "a3eWs000000F32zIAC",
        oldName: "CreateUpdatePolicy_DailyPaymentCalculation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "createPolicyVersion_DailyPaymentCalculation_Procedure_1",
        id: "a3eWs000000F330IAC",
        oldName: "createPolicyVersion_DailyPaymentCalculation_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "SmallGroup_MedicalRating_Procedure_3",
        id: "a3eWs000000F33CIAS",
        oldName: "SmallGroup_MedicalRating_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insRatingDental_DentalStd_Procedure_1",
        id: "a3eWs000000F33DIAS",
        oldName: "insRatingDental_DentalStd_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "insRating_MedicalHDHP_Procedure_1",
        id: "a3eWs000000F33GIAS",
        oldName: "insRating_MedicalHDHP_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "ins_contractMergeAttributes_Procedure_4",
        id: "a3eWs000000F33HIAS",
        oldName: "ins_contractMergeAttributes_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsEnrollment_bulkGetCMErrors_Procedure_4",
        id: "a3eWs000000F33JIAS",
        oldName: "InsEnrollment_bulkGetCMErrors_Procedure_4",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "ins_ReadCensusMemberError_OS",
            location: "getCMError",
          },
          {
            name: "ins_readCensusMemberPlans",
            location: "getPlans",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsPolicy_ReinstatePolicy244_Procedure_1",
        id: "a3eWs000000F33KIAS",
        oldName: "InsPolicy_ReinstatePolicy244_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReinstatedPolicyDetails",
            location: "getReinstatedPolicy",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createReinstatementPolicy",
            location: "reinstatePolicy244",
          },
          {
            name: "InsPolicyService.createReinstatementPolicy",
            location: "reinstatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "SmallGroup_MergeSelectedPlans_Procedure_3",
        id: "a3eWs000000F33LIAS",
        oldName: "SmallGroup_MergeSelectedPlans_Procedure_3",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "QuotingLWC_GetUserInputsAndRatedProducts_Procedure_2",
        id: "a3eWs000000F33MIAS",
        oldName: "Quoting LWC_GetUserInputsAndRatedProducts_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "GetUserInputsFromGCMembers",
            location: "GetUserInputsFromGCMembers",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsProductService.getRatedProducts",
            location: "getRatedProducts",
          },
          {
            name: "InsProductService.getRatedProducts",
            location: "RemoteAction2",
          },
        ],
        infos: [
        ],
        warnings: [
          " type will be changed from Quoting LWC to QuotingLWC",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsQuoteStep_transformCalculationResultToUpdateMemberInput_Procedure_2",
        id: "a3eWs000000F33NIAS",
        oldName: "InsQuoteStep_transformCalculationResultToUpdateMemberInput_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsCensusServiceStd.getFields",
            location: "GetHeaders",
          },
          {
            name: "InsCensusServiceStd.updateMembers",
            location: "updateMembersById",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "InsPolicy_ReinstatePolicy_Procedure_2",
        id: "a3eWs000000F33UIAS",
        oldName: "InsPolicy_ReinstatePolicy_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsReinstatedPolicyDetails",
            location: "getReinstatedPolicy",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createReinstatementPolicy",
            location: "reinstatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_rePriceProductIssueTravelFlat_Procedure_1",
        id: "a3eWs000000F33aIAC",
        oldName: "INSAutomation_rePriceProductIssue_Travel_Flat_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "RA_GetQuoteDetails",
          },
          {
            name: "InsProductService.repriceProduct",
            location: "RA_RepriceProduct",
          },
          {
            name: "InsQuoteService.createUpdateQuote",
            location: "RA_CreateUpdateQuote",
          },
        ],
        infos: [
        ],
        warnings: [
          " sub type will be changed from rePriceProductIssue_Travel_Flat to rePriceProductIssueTravelFlat",
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createPolicyVersionModalWithRatingDate_Procedure_1",
        id: "a3eWs000000F33eIAC",
        oldName: "INSAutomation_createPolicyVersionModalWithRatingDate_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createRenewalPolicyModalWithRatingDate_Procedure_2",
        id: "a3eWs000000F33fIAC",
        oldName: "INSAutomation_createRenewalPolicyModalWithRatingDate_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createRenewalPolicyWithRatingDate_Procedure_2",
        id: "a3eWs000000F33gIAC",
        oldName: "INSAutomation_createRenewalPolicyWithRatingDate_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "InsGetInsurancePolicyDetails",
            location: "DataRaptorExtractAction1",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsPolicyService.prepareToRenewPolicy",
            location: "PrepareRenewPolicy",
          },
          {
            name: "InsPolicyService.createRenewalPolicy",
            location: "RenewPolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyModalWithRatingDate_Procedure_1",
        id: "a3eWs000000F33hIAC",
        oldName: "INSAutomation_createUpdatePolicyModalWithRatingDate_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreateUpdatePolicyFromQuote_Procedure_1",
        id: "a3eWs000000F33jIAC",
        oldName: "INSAutomation_CreateUpdatePolicyFromQuote_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_CreatePolicyVersionFromQuote_Procedure_2",
        id: "a3eWs000000F33kIAC",
        oldName: "INSAutomation_CreatePolicyVersionFromQuote_Procedure_2",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyAnnualWithTransaction_Procedure_1",
        id: "a3eWs000000F33lIAC",
        oldName: "INSAutomation_createUpdatePolicyAnnualWithTransaction_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
      {
        name: "INSAutomation_createUpdatePolicyDailyWithoutPT_Procedure_1",
        id: "a3eWs000000F33mIAC",
        oldName: "INSAutomation_createUpdatePolicyDailyWithoutPT_Procedure_1",
        dependenciesIP: [
        ],
        dependenciesDR: [
          {
            name: "getQuoteDetailsforPolicyVersion",
            location: "getQuoteFields",
          },
        ],
        dependenciesOS: [
        ],
        dependenciesRemoteAction: [
          {
            name: "InsQuoteService.getQuoteDetail",
            location: "getQuoteDetails",
          },
          {
            name: "InsPolicyService.createUpdatePolicy",
            location: "createUpdatePolicy",
          },
          {
            name: "InsPolicyService.createPolicyVersion",
            location: "CreatePolicyVersion",
          },
        ],
        infos: [
        ],
        warnings: [
        ],
        errors: [
        ],
        path: "",
      },
    ],
  },
    }

    await AssessmentReporter.generate(assesmentInfo, conn.instanceUrl, orgs);
    return assesmentInfo;
  }
}
