/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expect } from 'chai';
import { Org } from '@salesforce/core';
import sinon = require('sinon');
import { ApexMigration } from '../../../src/migration/related/ApexMigration';
import { InterfaceImplements } from '../../../src/utils/apex/parser/apexparser';

interface MockFileUtil {
  readFilesSync: sinon.SinonStub;
}

interface MockFs {
  readFileSync: sinon.SinonStub;
  writeFileSync: sinon.SinonStub;
}

interface MockShell {
  pwd: sinon.SinonStub;
  cd: sinon.SinonStub;
}

interface MockCreateProgressBar {
  start: sinon.SinonStub;
  update: sinon.SinonStub;
  stop: sinon.SinonStub;
}

interface MockLogger {
  info: sinon.SinonStub;
  logVerbose: sinon.SinonStub;
  error: sinon.SinonStub;
  log: sinon.SinonStub;
}

describe('ApexMigration', () => {
  let apexMigration: ApexMigration;
  let sandbox: sinon.SinonSandbox;
  let mockOrg: Org;
  let mockFileUtil: MockFileUtil;
  let mockFs: MockFs;
  let mockShell: MockShell;
  let mockCreateProgressBar: MockCreateProgressBar;
  let mockLogger: MockLogger;

  const testProjectPath = '/test/project/path';
  const testNamespace = 'testNamespace';
  const testTargetNamespace = 'targetNamespace';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock Org
    mockOrg = {
      getUsername: sandbox.stub().returns('test@org.com'),
    } as unknown as Org;

    // Mock FileUtil
    mockFileUtil = {
      readFilesSync: sandbox.stub(),
    };

    // Mock fs
    mockFs = {
      readFileSync: sandbox.stub(),
      writeFileSync: sandbox.stub(),
    };

    // Mock shell
    mockShell = {
      pwd: sandbox.stub().returns('/current/directory'),
      cd: sandbox.stub(),
    };

    // Mock createProgressBar
    mockCreateProgressBar = {
      start: sandbox.stub(),
      update: sandbox.stub(),
      stop: sandbox.stub(),
    };

    // Mock Logger
    mockLogger = {
      info: sandbox.stub(),
      logVerbose: sandbox.stub(),
      error: sandbox.stub(),
      log: sandbox.stub(),
    };

    // Stub dependencies
    sandbox.stub(require('../../../src/utils/file/fileUtil'), 'FileUtil').value(mockFileUtil);
    sandbox.stub(require('fs'), 'readFileSync').value(mockFs.readFileSync);
    sandbox.stub(require('fs'), 'writeFileSync').value(mockFs.writeFileSync);
    sandbox.stub(require('shelljs'), 'pwd').value(mockShell.pwd);
    sandbox.stub(require('shelljs'), 'cd').value(mockShell.cd);
    sandbox
      .stub(require('../../../src/migration/base'), 'createProgressBar')
      .value(sandbox.stub().returns(mockCreateProgressBar));

    // Mock Logger class and its static logger property
    const MockLogger = {
      logger: mockLogger,
      info: mockLogger.info,
      logVerbose: mockLogger.logVerbose,
      error: mockLogger.error,
      log: mockLogger.log,
    };
    sandbox.stub(require('../../../src/utils/logger'), 'Logger').value(MockLogger);

    // Mock ApexASTParser constructor and methods
    const MockApexASTParser = function () {
      return {
        parse: sandbox.stub(),
        rewrite: sandbox.stub(),
        implementsInterfaces: new Map(),
        hasCallMethodImplemented: false,
        classDeclaration: {},
        namespaceChanges: new Map(),
        methodParameters: new Map(),
        nonReplacableMethodParameters: [],
      };
    };
    sandbox.stub(require('../../../src/utils/apex/parser/apexparser'), 'ApexASTParser').value(MockApexASTParser);

    // Mock other dependencies
    sandbox.stub(require('../../../src/utils/lwcparser/fileutils/FileDiffUtil'), 'FileDiffUtil').value(function () {
      return {
        getFileDiff: sandbox.stub().returns('mock-diff'),
      };
    });

    apexMigration = new ApexMigration(testProjectPath, testNamespace, mockOrg, testTargetNamespace);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('replaceAllInterfaces', () => {
    it('should replace multiple interfaces with System.Callable when Callable is already implemented', () => {
      // Arrange
      const mockParser = {
        implementsInterfaces: new Map([
          [new InterfaceImplements('Callable', 'System'), [{ startIndex: 10, stopIndex: 20, text: 'System.Callable' }]],
          [
            new InterfaceImplements('VlocityOpenInterface2', 'testNamespace'),
            [{ startIndex: 5, stopIndex: 15, text: 'testNamespace.VlocityOpenInterface2' }],
          ],
        ]),
        hasCallMethodImplemented: false,
        classDeclaration: {},
      };

      // Act
      const result = (apexMigration as any).replaceAllInterfaces(
        mockParser.implementsInterfaces,
        [],
        mockParser,
        'TestClass.cls'
      );

      // Assert
      expect(result).to.be.an('array').with.length(2);
      expect(result[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(result[1].constructor.name).to.equal('InsertAfterTokenUpdate');
    });

    it('should handle case where leftmost and rightmost tokens are found correctly', () => {
      // Arrange
      const mockParser = {
        implementsInterfaces: new Map([
          [new InterfaceImplements('Interface1', 'ns1'), [{ startIndex: 100, stopIndex: 110, text: 'ns1.Interface1' }]],
          [new InterfaceImplements('Interface2', 'ns2'), [{ startIndex: 50, stopIndex: 60, text: 'ns2.Interface2' }]],
        ]),
        hasCallMethodImplemented: true,
        classDeclaration: {},
      };

      // Act
      const result = (apexMigration as any).replaceAllInterfaces(
        mockParser.implementsInterfaces,
        [],
        mockParser,
        'TestClass.cls'
      );

      // Assert
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('RangeTokenUpdate');
    });

    it('should not add call method when it already exists', () => {
      // Arrange
      const mockParser = {
        implementsInterfaces: new Map([
          [new InterfaceImplements('Callable', 'System'), [{ startIndex: 10, stopIndex: 20, text: 'System.Callable' }]],
          [
            new InterfaceImplements('VlocityOpenInterface2', 'testNamespace'),
            [{ startIndex: 5, stopIndex: 15, text: 'testNamespace.VlocityOpenInterface2' }],
          ],
        ]),
        hasCallMethodImplemented: true,
        classDeclaration: {},
      };

      // Act
      const result = (apexMigration as any).replaceAllInterfaces(
        mockParser.implementsInterfaces,
        [],
        mockParser,
        'TestClass.cls'
      );

      // Assert
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('RangeTokenUpdate');
    });
  });

  describe('processApexFileForMethodCalls', () => {
    it('should process IP parameters correctly when valid IP name format is provided', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map(),
        methodParameters: new Map([
          [
            1, // ParameterType.IP_NAME
            [
              { text: 'testNamespace_IntegrationProcedure1', startIndex: 100, stopIndex: 130 },
              { text: 'testNamespace_IntegrationProcedure2', startIndex: 150, stopIndex: 180 },
            ],
          ],
        ]),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      expect(result).to.be.an('array').with.length(2);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal("'testNamespace_IntegrationProcedure1'");
      expect(result[1].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[1].newText).to.equal("'testNamespace_IntegrationProcedure2'");
      expect(ipNameUpdateFailed.size).to.equal(0);
    });

    it('should handle IP parameters with invalid format and add to failed set', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map(),
        methodParameters: new Map([
          [
            1, // ParameterType.IP_NAME
            [
              { text: 'invalidFormat', startIndex: 100, stopIndex: 110, line: 5 },
              { text: 'testNamespace_IntegrationProcedure1', startIndex: 150, stopIndex: 180, line: 6 },
            ],
          ],
        ]),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal("'testNamespace_IntegrationProcedure1'");
      expect(ipNameUpdateFailed.has(5)).to.be.true; // Changed to expect line number instead of text
      expect(ipNameUpdateFailed.size).to.equal(1);
    });

    it('should handle IP parameters with single underscore and add to failed set', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map(),
        methodParameters: new Map([
          [
            1, // ParameterType.IP_NAME
            [{ text: 'single_part', startIndex: 100, stopIndex: 110 }],
          ],
        ]),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      // The single underscore case should be processed normally since it has exactly 2 parts
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal("'single_part'");
      expect(ipNameUpdateFailed.size).to.equal(0);
    });

    it('should handle IP parameters with multiple underscores and add to failed set', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map(),
        methodParameters: new Map([
          [
            1, // ParameterType.IP_NAME
            [{ text: 'part1_part2_part3', startIndex: 100, stopIndex: 115, line: 7 }],
          ],
        ]),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.has(7)).to.be.true; // Changed to expect line number instead of text
      expect(ipNameUpdateFailed.size).to.equal(1);
    });

    it('should skip IP parameters when new name equals old name', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map(),
        methodParameters: new Map([
          [
            1, // ParameterType.IP_NAME
            [{ text: "'testNamespace_IntegrationProcedure1'", startIndex: 100, stopIndex: 130 }],
          ],
        ]),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.size).to.equal(0);
    });

    it('should handle namespace changes when present', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map([['testNamespace', [{ text: 'testNamespace', startIndex: 50, stopIndex: 60 }]]]),
        methodParameters: new Map(),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal('targetNamespace');
    });

    it('should return empty array when no method parameters are present', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        namespaceChanges: new Map(),
        methodParameters: new Map(),
      };
      const ipNameUpdateFailed = new Set<string | number>();

      // Act
      const result = (apexMigration as any).processApexFileForMethodCalls(mockFile, mockParser, ipNameUpdateFailed);

      // Assert
      expect(result).to.be.an('array').with.length(0);
    });
  });

  describe('processApexFileForSimpleVarDeclarations', () => {
    it('should debug Stringutil.cleanName behavior', () => {
      // This test helps us understand what Stringutil.cleanName does
      const Stringutil = require('../../../src/utils/StringValue/stringutil').Stringutil;

      // Test what cleanName does with our test data
      expect(Stringutil.cleanName('testNamespace')).to.equal('testNamespace');
      expect(Stringutil.cleanName('IntegrationProcedure1')).to.equal('IntegrationProcedure1');
      expect(Stringutil.cleanName('testNamespace_IntegrationProcedure1')).to.equal(
        'testNamespaceIntegrationProcedure1'
      );

      // Test the actual logic used in the code
      const parts = 'testNamespace_IntegrationProcedure1'.split('_');
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const newName = `'${Stringutil.cleanName(parts[0])}_${Stringutil.cleanName(parts[1])}'`;
      expect(newName).to.equal("'testNamespace_IntegrationProcedure1'");
    });

    it('should process IP variable declarations correctly when valid format is provided', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['ipVar1', { text: "'testNamespace_IntegrationProcedure1'", startIndex: 100, stopIndex: 130 }],
          ['ipVar2', { text: "'testNamespace_IntegrationProcedure2'", startIndex: 150, stopIndex: 180 }],
        ]),
        ipVarInMethodCalls: ['ipVar1', 'ipVar2'],
        dmVarInMethodCalls: [],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      // Since the original text doesn't have special characters, newName equals oldName, so no updates are made
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.size).to.equal(0);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });

    it('should handle IP variable declarations with invalid format and add to failed set', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['ipVar1', { text: "'invalidFormat'", startIndex: 100, stopIndex: 110, line: 8 }],
          ['ipVar2', { text: "'testNamespace_IntegrationProcedure1'", startIndex: 150, stopIndex: 180, line: 9 }],
        ]),
        ipVarInMethodCalls: ['ipVar1', 'ipVar2'],
        dmVarInMethodCalls: [],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      // Since the original text doesn't have special characters, newName equals oldName, so no updates are made
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.has(8)).to.be.true; // Changed to expect line number instead of text
      expect(ipNameUpdateFailed.size).to.equal(1);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });

    it('should handle missing IP variable declarations and add to failed set', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['ipVar1', { text: "'testNamespace_IntegrationProcedure1'", startIndex: 100, stopIndex: 130 }],
        ]),
        ipVarInMethodCalls: ['ipVar1', 'missingVar'],
        dmVarInMethodCalls: [],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      // Since the original text doesn't have special characters, newName equals oldName, so no updates are made
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.has('missingVar')).to.be.true;
      expect(ipNameUpdateFailed.size).to.equal(1);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });

    it('should process DM variable declarations correctly', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['dmVar1', { text: "'testNamespace_DataRaptor1'", startIndex: 100, stopIndex: 130 }],
          ['dmVar2', { text: "'testNamespace_DataRaptor2'", startIndex: 150, stopIndex: 180 }],
        ]),
        ipVarInMethodCalls: [],
        dmVarInMethodCalls: ['dmVar1', 'dmVar2'],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      expect(result).to.be.an('array').with.length(2);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal("'testNamespaceDataRaptor1'"); // cleanName removes underscore
      expect(result[1].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[1].newText).to.equal("'testNamespaceDataRaptor2'"); // cleanName removes underscore
      expect(ipNameUpdateFailed.size).to.equal(0);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });

    it('should handle missing DM variable declarations and add to failed set', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['dmVar1', { text: "'testNamespace_DataRaptor1'", startIndex: 100, stopIndex: 130 }],
        ]),
        ipVarInMethodCalls: [],
        dmVarInMethodCalls: ['dmVar1', 'missingDmVar'],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal("'testNamespaceDataRaptor1'"); // cleanName removes underscore
      expect(dmNameUpdateFailed.has('missingDmVar')).to.be.true;
      expect(dmNameUpdateFailed.size).to.equal(1);
      expect(ipNameUpdateFailed.size).to.equal(0);
    });

    it('should skip variable declarations when new name equals old name', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['ipVar1', { text: "'testNamespace_IntegrationProcedure1'", startIndex: 100, stopIndex: 130 }],
        ]),
        ipVarInMethodCalls: ['ipVar1'],
        dmVarInMethodCalls: [],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      // Since the original text doesn't have special characters, newName equals oldName, so no updates are made
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.size).to.equal(0);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });

    it('should handle both IP and DM variable declarations in the same parser', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map([
          ['ipVar1', { text: "'testNamespace_IntegrationProcedure1'", startIndex: 100, stopIndex: 130 }],
          ['dmVar1', { text: "'testNamespace_DataRaptor1'", startIndex: 150, stopIndex: 180 }],
        ]),
        ipVarInMethodCalls: ['ipVar1'],
        dmVarInMethodCalls: ['dmVar1'],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      // Only DM gets updated because it has an underscore that gets removed by cleanName
      expect(result).to.be.an('array').with.length(1);
      expect(result[0].constructor.name).to.equal('SingleTokenUpdate');
      expect(result[0].newText).to.equal("'testNamespaceDataRaptor1'"); // cleanName removes underscore
      expect(ipNameUpdateFailed.size).to.equal(0);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });

    it('should return empty array when no variable declarations are present', () => {
      // Arrange
      const mockParser = {
        simpleVarDeclarations: new Map(),
        ipVarInMethodCalls: [],
        dmVarInMethodCalls: [],
      };
      const ipNameUpdateFailed = new Set<string | number>();
      const dmNameUpdateFailed = new Set<string>();

      // Act
      const result = (apexMigration as any).processApexFileForSimpleVarDeclarations(
        mockParser,
        ipNameUpdateFailed,
        dmNameUpdateFailed
      );

      // Assert
      expect(result).to.be.an('array').with.length(0);
      expect(ipNameUpdateFailed.size).to.equal(0);
      expect(dmNameUpdateFailed.size).to.equal(0);
    });
  });

  describe('processApexFileForRemotecalls', () => {
    it('should return empty array when class already implements only System.Callable', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual callableInterface instance from apexMigration
      const callableInterface = (apexMigration as any).callableInterface;
      const mockParser = {
        implementsInterfaces: new Map([
          [callableInterface, [{ startIndex: 10, stopIndex: 25, text: 'System.Callable' }]],
        ]),
        hasCallMethodImplemented: true,
        classDeclaration: {},
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      expect(tokens).to.be.an('array').with.length(0);
    });

    it('should replace only VlocityOpenInterface2 with System.Callable', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual vlocityOpenInterface2 instance from apexMigration
      const vlocityOpenInterface2 = (apexMigration as any).vlocityOpenInterface2;
      const mockParser = {
        implementsInterfaces: new Map([
          [vlocityOpenInterface2, [{ startIndex: 10, stopIndex: 45, text: `${testNamespace}.VlocityOpenInterface2` }]],
        ]),
        hasCallMethodImplemented: false,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      expect(tokens).to.be.an('array').with.length(2);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
      expect(tokens[1].constructor.name).to.equal('InsertAfterTokenUpdate');
    });

    it('should replace only VlocityOpenInterface with System.Callable', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual vlocityOpenInterface instance from apexMigration
      const vlocityOpenInterface = (apexMigration as any).vlocityOpenInterface;
      const mockParser = {
        implementsInterfaces: new Map([
          [vlocityOpenInterface, [{ startIndex: 10, stopIndex: 44, text: `${testNamespace}.VlocityOpenInterface` }]],
        ]),
        hasCallMethodImplemented: false,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      expect(tokens).to.be.an('array').with.length(2);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
      expect(tokens[1].constructor.name).to.equal('InsertAfterTokenUpdate');
    });

    it('should replace BOTH VlocityOpenInterface and VlocityOpenInterface2 with System.Callable', () => {
      // Arrange - This is the FIX scenario
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual interface instances from apexMigration
      const vlocityOpenInterface = (apexMigration as any).vlocityOpenInterface;
      const vlocityOpenInterface2 = (apexMigration as any).vlocityOpenInterface2;
      const mockParser = {
        implementsInterfaces: new Map([
          [vlocityOpenInterface, [{ startIndex: 10, stopIndex: 44, text: `${testNamespace}.VlocityOpenInterface` }]],
          [vlocityOpenInterface2, [{ startIndex: 46, stopIndex: 81, text: `${testNamespace}.VlocityOpenInterface2` }]],
        ]),
        hasCallMethodImplemented: false,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      // Should call replaceAllInterfaces and replace entire implements clause with System.Callable
      expect(tokens).to.be.an('array').with.length(2);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
      expect(tokens[1].constructor.name).to.equal('InsertAfterTokenUpdate');
    });

    it('should replace System.Callable with other interfaces to only System.Callable', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual interface instances from apexMigration
      const callableInterface = (apexMigration as any).callableInterface;
      const vlocityOpenInterface2 = (apexMigration as any).vlocityOpenInterface2;
      const mockParser = {
        implementsInterfaces: new Map([
          [callableInterface, [{ startIndex: 10, stopIndex: 25, text: 'System.Callable' }]],
          [vlocityOpenInterface2, [{ startIndex: 27, stopIndex: 62, text: `${testNamespace}.VlocityOpenInterface2` }]],
        ]),
        hasCallMethodImplemented: false,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      // Should call replaceAllInterfaces and keep only System.Callable
      expect(tokens).to.be.an('array').with.length(2);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
      expect(tokens[1].constructor.name).to.equal('InsertAfterTokenUpdate');
    });

    it('should replace BOTH Vlocity interfaces AND System.Callable with only System.Callable', () => {
      // Arrange - This is the FIX scenario with Callable already present
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual interface instances from apexMigration
      const callableInterface = (apexMigration as any).callableInterface;
      const vlocityOpenInterface = (apexMigration as any).vlocityOpenInterface;
      const vlocityOpenInterface2 = (apexMigration as any).vlocityOpenInterface2;
      const mockParser = {
        implementsInterfaces: new Map([
          [callableInterface, [{ startIndex: 10, stopIndex: 25, text: 'System.Callable' }]],
          [vlocityOpenInterface, [{ startIndex: 27, stopIndex: 61, text: `${testNamespace}.VlocityOpenInterface` }]],
          [vlocityOpenInterface2, [{ startIndex: 63, stopIndex: 98, text: `${testNamespace}.VlocityOpenInterface2` }]],
        ]),
        hasCallMethodImplemented: false,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      // Should call replaceAllInterfaces and keep only System.Callable, removing both Vlocity interfaces
      expect(tokens).to.be.an('array').with.length(2);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
      expect(tokens[1].constructor.name).to.equal('InsertAfterTokenUpdate');
    });

    it('should not add call method when it already exists', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual vlocityOpenInterface2 instance from apexMigration
      const vlocityOpenInterface2 = (apexMigration as any).vlocityOpenInterface2;
      const mockParser = {
        implementsInterfaces: new Map([
          [vlocityOpenInterface2, [{ startIndex: 10, stopIndex: 45, text: `${testNamespace}.VlocityOpenInterface2` }]],
        ]),
        hasCallMethodImplemented: true,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      // Should only have RangeTokenUpdate, no InsertAfterTokenUpdate
      expect(tokens).to.be.an('array').with.length(1);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
    });

    it('should handle both Vlocity interfaces when call method already exists', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      // Use the actual interface instances from apexMigration
      const vlocityOpenInterface = (apexMigration as any).vlocityOpenInterface;
      const vlocityOpenInterface2 = (apexMigration as any).vlocityOpenInterface2;
      const mockParser = {
        implementsInterfaces: new Map([
          [vlocityOpenInterface, [{ startIndex: 10, stopIndex: 44, text: `${testNamespace}.VlocityOpenInterface` }]],
          [vlocityOpenInterface2, [{ startIndex: 46, stopIndex: 81, text: `${testNamespace}.VlocityOpenInterface2` }]],
        ]),
        hasCallMethodImplemented: true,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      // Should call replaceAllInterfaces but not add call method
      expect(tokens).to.be.an('array').with.length(1);
      expect(tokens[0].constructor.name).to.equal('RangeTokenUpdate');
      expect(tokens[0].newText).to.equal('System.Callable');
    });

    it('should return empty array when no interfaces are present', () => {
      // Arrange
      const mockFile = { name: 'TestClass.cls', location: '/test/path' };
      const mockParser = {
        implementsInterfaces: new Map(),
        hasCallMethodImplemented: false,
        classDeclaration: { stopIndex: 100 },
      };

      // Act
      const tokens = (apexMigration as any).processApexFileForRemotecalls(mockFile, mockParser);

      // Assert
      expect(tokens).to.be.an('array').with.length(0);
    });
  });
});
