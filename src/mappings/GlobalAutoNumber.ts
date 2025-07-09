/**
 * Field mappings for Global Auto Number migration from managed package to core
 * Maps fields from vlocity_cmt__GlobalAutoNumberSetting__c to OmniGlobalAutoNumber__c
 */
/* eslint-disable camelcase */
const mappings = {
  // Business logic fields only (following same pattern as OS, DR, FC)
  Name: 'Name',
  Increment__c: 'Increment',
  LastGeneratedNumber__c: 'LastGeneratedNumber',
  LeftPadDigit__c: 'LeftPad',
  MinimumLength__c: 'MinimumLength',
  Prefix__c: 'Prefix',
  Separator__c: 'Separator',
};

export default mappings;
