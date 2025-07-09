/**
 * Field mappings for Global Auto Number migration from managed package to core
 * Maps fields from vlocity_ins__GlobalAutoNumberSetting__c to OmniGlobalAutoNumber__c
 */
/* eslint-disable camelcase */
const mappings = {
  // Standard fields
  CreatedById: 'CreatedById',
  CreatedDate: 'CreatedDate',
  CurrencyIsoCode: 'CurrencyIsoCode',
  Id: 'Id',
  IsDeleted: 'IsDeleted',
  LastModifiedById: 'LastModifiedById',
  LastModifiedDate: 'LastModifiedDate',
  Name: 'Name',
  SetupOwnerId: 'SetupOwnerId',
  SystemModstamp: 'SystemModstamp',

  // Managed package specific fields mapped to core fields
  Increment__c: 'Increment',
  LastGeneratedNumber__c: 'LastGeneratedNumber',
  LeftPadDigit__c: 'LeftPad',
  MinimumLength__c: 'MinimumLength',
  Prefix__c: 'Prefix',
  Separator__c: 'Separator',

  // Core fields with default values (not in managed package)
  IsActive__c: 'IsActive__c',
  IsEnabled__c: 'IsEnabled__c',
  Type__c: 'Type__c',
  NextValue__c: 'NextValue__c',

  // Migration metadata fields
  MigrationSourceId__c: 'MigrationSourceId__c',
  MigrationSourceObject__c: 'MigrationSourceObject__c',
  MigrationDate__c: 'MigrationDate__c',
};

export default mappings;
