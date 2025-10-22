/* eslint-disable camelcase */
import { expect } from '@salesforce/command/lib/test';
import { AnyJson } from '@salesforce/ts-types';
import { getReplacedString, populateRegexForFunctionMetadata } from '../../../src/utils/formula/FormulaUtil';

describe('FormulaUtilTest', () => {
  it('should generate new string with standard function format', () => {
    const namespacePrefix = 'test_namespace__';
    const mockedFunctionDefinitionMetadata = getMockedAllFunctionMetadata();
    populateRegexForFunctionMetadata(mockedFunctionDefinitionMetadata);
    const inputString = "TESTMETHODFIRST('hello','bye')";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = getReplacedString(namespacePrefix, inputString, mockedFunctionDefinitionMetadata);
    const expectedResult = 'FUNCTION("testClassFirst","testMethodFirst",\'hello\',\'bye\')';

    expect(result).to.be.equal(expectedResult);
  });

  it('should generate new string with standard function format with nested custom formula', () => {
    const namespacePrefix = 'test_namespace__';
    const mockedFunctionDefinitionMetadata = getMockedAllFunctionMetadata();
    populateRegexForFunctionMetadata(mockedFunctionDefinitionMetadata);
    const inputString = "TESTMETHODFIRST('hello',TESTMETHOD('bye'))";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = getReplacedString(namespacePrefix, inputString, mockedFunctionDefinitionMetadata);
    const expectedResult =
      'FUNCTION("testClassFirst","testMethodFirst",\'hello\',FUNCTION("testClass","testMethod",\'bye\'))';

    expect(result).to.be.equal(expectedResult);
  });

  it('should generate new string with standard function format with nested custom formula and a formula used more than Once', () => {
    const namespacePrefix = 'test_namespace__';
    const mockedFunctionDefinitionMetadata = getMockedAllFunctionMetadata();
    populateRegexForFunctionMetadata(mockedFunctionDefinitionMetadata);
    const inputString = "TESTMETHODFIRST('hello',TESTMETHOD(TESTMETHODFIRST('bye','check')))";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = getReplacedString(namespacePrefix, inputString, mockedFunctionDefinitionMetadata);
    const expectedResult =
      'FUNCTION("testClassFirst","testMethodFirst",\'hello\',FUNCTION("testClass","testMethod",FUNCTION("testClassFirst","testMethodFirst",\'bye\',\'check\')))';
    expect(result).to.be.equal(expectedResult);
  });

  it('should include namespace prefix in class name when function has namespace', () => {
    const namespacePrefix = 'test_namespace__';
    const mockedFunctionDefinitionMetadata = getMockedFunctionMetadataWithNamespace();
    populateRegexForFunctionMetadata(mockedFunctionDefinitionMetadata);
    const inputString = "NAMESPACEDMETHOD('param1')";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = getReplacedString(namespacePrefix, inputString, mockedFunctionDefinitionMetadata);
    const expectedResult = 'FUNCTION("pkg_namespace.NamespacedClass","namespacedMethod",\'param1\')';
    expect(result).to.be.equal(expectedResult);
  });

  it('should handle functions with and without namespace in same formula', () => {
    const namespacePrefix = 'test_namespace__';
    const mockedFunctionDefinitionMetadata = getMixedFunctionMetadata();
    populateRegexForFunctionMetadata(mockedFunctionDefinitionMetadata);
    const inputString = "TESTMETHOD('hello',NAMESPACEDMETHOD('world'))";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = getReplacedString(namespacePrefix, inputString, mockedFunctionDefinitionMetadata);
    const expectedResult =
      'FUNCTION("testClass","testMethod",\'hello\',FUNCTION("pkg_namespace.NamespacedClass","namespacedMethod",\'world\'))';
    expect(result).to.be.equal(expectedResult);
  });
});

function getMockedAllFunctionMetadata(): AnyJson[] {
  return [
    {
      DeveloperName: 'TESTMETHOD',
      test_namespace__ClassName__c: 'testClass',
      test_namespace__MethodName__c: 'testMethod',
      NamespacePrefix: null,
    },
    {
      DeveloperName: 'TESTMETHODFIRST',
      test_namespace__ClassName__c: 'testClassFirst',
      test_namespace__MethodName__c: 'testMethodFirst',
      NamespacePrefix: null,
    },
    {
      DeveloperName: 'TESTMETHODSECOND',
      test_namespace__ClassName__c: 'testClassSecond',
      test_namespace__MethodName__c: 'testMethodSecond',
      NamespacePrefix: null,
    },
    {
      DeveloperName: 'TESTMETHODTHIRD',
      test_namespace__ClassName__c: 'testClassThird',
      test_namespace__MethodName__c: 'testMethodThird',
      NamespacePrefix: null,
    },
  ];
}

function getMockedFunctionMetadataWithNamespace(): AnyJson[] {
  return [
    {
      DeveloperName: 'NAMESPACEDMETHOD',
      test_namespace__ClassName__c: 'NamespacedClass',
      test_namespace__MethodName__c: 'namespacedMethod',
      NamespacePrefix: 'pkg_namespace',
    },
  ];
}

function getMixedFunctionMetadata(): AnyJson[] {
  return [
    {
      DeveloperName: 'TESTMETHOD',
      test_namespace__ClassName__c: 'testClass',
      test_namespace__MethodName__c: 'testMethod',
      NamespacePrefix: null,
    },
    {
      DeveloperName: 'NAMESPACEDMETHOD',
      test_namespace__ClassName__c: 'NamespacedClass',
      test_namespace__MethodName__c: 'namespacedMethod',
      NamespacePrefix: 'pkg_namespace',
    },
  ];
}
