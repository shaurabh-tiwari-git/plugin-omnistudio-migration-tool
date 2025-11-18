import { expect } from 'chai';
import {
  ApexASTParser,
  InterfaceImplements,
  MethodCall,
  MethodParameter,
  ParameterType,
} from '../../../../src/utils/apex/parser/apexparser';

describe('ApexASTParser', () => {
  it('should parse the Apex file and collect interface implementations, method calls, and class names', () => {
    const apexFileContent = `global with sharing class FormulaParserService implements vlocity_ins.VlocityOpenInterface2, Callable
{

        global void justForTest(String kkdbk) {
        /* Specify Data Mapper extract or transform to call */
        String DRName = 'DataMapperNewName'; 
        /* Populate the input JSON */ 
        Map<String, Object> myTransformData = new Map<String, Object>{'MyKey'=>'MyValue'}; 
        /* Call the Data Mapper */ 
        vlocity_ins.DRProcessResult result1 = vlocity_ins.DRGlobal.process(myTransformData, 'DRName');
    }
    }`;
    // const vlocityOpenInterface2 = 'vlocity_ins.VlocityOpenInterface2';
    const namespace = 'vlocity_ins';
    const interfaces: InterfaceImplements[] = [];
    const vlocityOpenInterface = new InterfaceImplements('VlocityOpenInterface', namespace);
    const vlocityOpenInterface2 = new InterfaceImplements('VlocityOpenInterface2', namespace);
    interfaces.push(vlocityOpenInterface, vlocityOpenInterface2, new InterfaceImplements('Callable'));
    const methodCalls = new Set<MethodCall>();
    const drNameParameter = new MethodParameter(2, ParameterType.DR_NAME);
    const ipNameParameter = new MethodParameter(1, ParameterType.IP_NAME);
    methodCalls.add(new MethodCall('DRGlobal', 'process', namespace, drNameParameter));
    methodCalls.add(new MethodCall('DRGlobal', 'processObjectsJSON', namespace, drNameParameter));
    methodCalls.add(new MethodCall('DRGlobal', 'processString', namespace, drNameParameter));
    methodCalls.add(new MethodCall('DRGlobal', 'processFromApex', namespace, drNameParameter));
    methodCalls.add(new MethodCall('IntegrationProcedureService', 'runIntegrationService', namespace, ipNameParameter));

    const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
    apexParser.parse();
    const implementsInterface = apexParser.implementsInterfaces;
    // const callsMethods = apexParser.getCallsMethods();
    // const className = apexParser.getClassName();
    // const pos = implementsInterface.get(vlocityOpenInterface2);

    // Add your assertions here based on the expected results
    // implementsInterface.get(interfaceName);
    expect(implementsInterface.get(vlocityOpenInterface2)[0].charPositionInLine).to.be.equal(58);
    expect(implementsInterface.get(vlocityOpenInterface2)[1].line).to.be.equal(1);
    // expect(callsMethods).to.not.be.empty;
    // expect(className).to.equal('YourClass');
  });

  describe('System.Callable interface handling', () => {
    const namespace = 'vlocity_ins';
    const methodCalls = new Set<MethodCall>();

    it('should parse class implementing only System.Callable', () => {
      const apexFileContent = `global class MyCallableClass implements System.Callable {
        public Object call(String action, Map<String, Object> args) {
            return null;
        }
      }`;

      const interfaces: InterfaceImplements[] = [];
      const systemCallable = new InterfaceImplements('Callable', 'System');
      interfaces.push(systemCallable);

      const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
      apexParser.parse();
      const implementsInterface = apexParser.implementsInterfaces;

      // Verify System.Callable is detected
      expect(implementsInterface.has(systemCallable)).to.be.true;
      const tokens = implementsInterface.get(systemCallable);
      expect(tokens).to.have.lengthOf(2); // System and Callable tokens
      expect(apexParser.hasCallMethodImplemented).to.be.true;
    });

    it('should parse class implementing System.Callable and VlocityOpenInterface', () => {
      const apexFileContent = `global class MyClass implements System.Callable, vlocity_ins.VlocityOpenInterface {
        public Object call(String action, Map<String, Object> args) {
            return null;
        }
      }`;

      const interfaces: InterfaceImplements[] = [];
      const systemCallable = new InterfaceImplements('Callable', 'System');
      const vlocityOpenInterface = new InterfaceImplements('VlocityOpenInterface', namespace);
      interfaces.push(systemCallable, vlocityOpenInterface);

      const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
      apexParser.parse();
      const implementsInterface = apexParser.implementsInterfaces;

      // Verify both interfaces are detected
      expect(implementsInterface.has(systemCallable)).to.be.true;
      expect(implementsInterface.has(vlocityOpenInterface)).to.be.true;

      // Verify System.Callable has correct tokens
      const callableTokens = implementsInterface.get(systemCallable);
      expect(callableTokens).to.have.lengthOf(2);

      // Verify VlocityOpenInterface has correct tokens
      const vlocityTokens = implementsInterface.get(vlocityOpenInterface);
      expect(vlocityTokens).to.have.lengthOf(2);

      expect(apexParser.hasCallMethodImplemented).to.be.true;
    });

    it('should parse class implementing VlocityOpenInterface and System.Callable (reversed order)', () => {
      const apexFileContent = `global class MyClass implements vlocity_ins.VlocityOpenInterface, System.Callable {
        public Object call(String action, Map<String, Object> args) {
            return null;
        }
      }`;

      const interfaces: InterfaceImplements[] = [];
      const systemCallable = new InterfaceImplements('Callable', 'System');
      const vlocityOpenInterface = new InterfaceImplements('VlocityOpenInterface', namespace);
      interfaces.push(systemCallable, vlocityOpenInterface);

      const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
      apexParser.parse();
      const implementsInterface = apexParser.implementsInterfaces;

      // Verify both interfaces are detected regardless of order
      expect(implementsInterface.has(systemCallable)).to.be.true;
      expect(implementsInterface.has(vlocityOpenInterface)).to.be.true;

      // Verify System.Callable has correct tokens
      const callableTokens = implementsInterface.get(systemCallable);
      expect(callableTokens).to.have.lengthOf(2);

      // Verify VlocityOpenInterface has correct tokens
      const vlocityTokens = implementsInterface.get(vlocityOpenInterface);
      expect(vlocityTokens).to.have.lengthOf(2);

      expect(apexParser.hasCallMethodImplemented).to.be.true;
    });

    it('should parse class implementing all three interfaces (VlocityOpenInterface, VlocityOpenInterface2, System.Callable)', () => {
      const apexFileContent = `global class MyClass implements vlocity_ins.VlocityOpenInterface, vlocity_ins.VlocityOpenInterface2, System.Callable {
        public Object call(String action, Map<String, Object> args) {
            return null;
        }
      }`;

      const interfaces: InterfaceImplements[] = [];
      const systemCallable = new InterfaceImplements('Callable', 'System');
      const vlocityOpenInterface = new InterfaceImplements('VlocityOpenInterface', namespace);
      const vlocityOpenInterface2 = new InterfaceImplements('VlocityOpenInterface2', namespace);
      interfaces.push(systemCallable, vlocityOpenInterface, vlocityOpenInterface2);

      const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
      apexParser.parse();
      const implementsInterface = apexParser.implementsInterfaces;

      // Verify all three interfaces are detected
      expect(implementsInterface.has(systemCallable)).to.be.true;
      expect(implementsInterface.has(vlocityOpenInterface)).to.be.true;
      expect(implementsInterface.has(vlocityOpenInterface2)).to.be.true;

      // Verify System.Callable appears only once
      const callableTokens = implementsInterface.get(systemCallable);
      expect(callableTokens).to.have.lengthOf(2);

      // Verify each interface has correct number of tokens
      expect(implementsInterface.get(vlocityOpenInterface)).to.have.lengthOf(2);
      expect(implementsInterface.get(vlocityOpenInterface2)).to.have.lengthOf(2);

      expect(apexParser.hasCallMethodImplemented).to.be.true;
    });

    it('should ensure System.Callable is detected only once even if class implements it multiple times', () => {
      // This is an edge case - malformed Apex, but we should handle it gracefully
      const apexFileContent = `global class MyClass implements System.Callable, vlocity_ins.VlocityOpenInterface {
        public Object call(String action, Map<String, Object> args) {
            return null;
        }
      }`;

      const interfaces: InterfaceImplements[] = [];
      const systemCallable = new InterfaceImplements('Callable', 'System');
      const vlocityOpenInterface = new InterfaceImplements('VlocityOpenInterface', namespace);
      interfaces.push(systemCallable, vlocityOpenInterface);

      const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
      apexParser.parse();
      const implementsInterface = apexParser.implementsInterfaces;

      // Verify System.Callable is in the map only once
      expect(implementsInterface.has(systemCallable)).to.be.true;
      const callableTokens = implementsInterface.get(systemCallable);

      // Should have exactly 2 tokens (System and Callable)
      expect(callableTokens).to.have.lengthOf(2);

      // Count how many times System.Callable appears in the interface map
      let systemCallableCount = 0;
      for (const [key] of implementsInterface) {
        if (key.name === 'Callable' && key.namespace === 'System') {
          systemCallableCount++;
        }
      }
      expect(systemCallableCount).to.equal(1, 'System.Callable should appear only once in the interface map');
    });

    it('should not detect System.Callable if call method has incorrect signature', () => {
      const apexFileContent = `global class MyClass implements System.Callable {
        public Object call(String action) {
            return null;
        }
      }`;

      const interfaces: InterfaceImplements[] = [];
      const systemCallable = new InterfaceImplements('Callable', 'System');
      interfaces.push(systemCallable);

      const apexParser = new ApexASTParser(apexFileContent, interfaces, methodCalls, namespace);
      apexParser.parse();

      // Interface should still be detected
      expect(apexParser.implementsInterfaces.has(systemCallable)).to.be.true;

      // But hasCallMethod should be false due to incorrect signature (only 1 param instead of 2)
      expect(apexParser.hasCallMethodImplemented).to.be.false;
    });
  });
});
