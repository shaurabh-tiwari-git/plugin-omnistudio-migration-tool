/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { expect } from 'chai';
import { JavaScriptParser } from '../../../../src/utils/lwcparser/jsParser/JavaScriptParser';

describe('JavaScriptParser', () => {
  let parser: JavaScriptParser;
  let tempDir: string;
  let tempFiles: string[];

  beforeEach(() => {
    parser = new JavaScriptParser();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'js-parser-test-'));
    tempFiles = [];
  });

  afterEach(() => {
    // Clean up temp files
    tempFiles.forEach((file) => {
      try {
        fs.unlinkSync(file);
      } catch {
        // Ignore errors
      }
    });
    try {
      fs.rmdirSync(tempDir);
    } catch {
      // Ignore errors
    }
  });

  // Helper to create a temp file with content
  const createTempFile = (filename: string, content: string): string => {
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    tempFiles.push(filePath);
    return filePath;
  };

  describe('Basic functionality', () => {
    it('should return null when file contains "Generated class DO NOT MODIFY"', () => {
      const mockFileContent = '// Generated class DO NOT MODIFY\nimport something from "test/module";';
      const testFile = createTempFile('test1.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'test');

      expect(result).to.be.null;
    });

    it('should return null when file does not contain the namespace', () => {
      const mockFileContent = 'import something from "other/module";';
      const testFile = createTempFile('test2.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'vlocity_ins');

      expect(result).to.be.null;
    });
  });

  describe('PubSub module replacement', () => {
    it('should replace pubsub module with lightning/omnistudioPubsub', () => {
      const mockFileContent = `import pubsub from 'vlocity_ins/pubsub';
import OtherModule from 'vlocity_ins/otherModule';`;

      const testFile = createTempFile('test3.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'vlocity_ins');

      expect(result).to.not.be.null;
      const modifiedContent = result.get('modified');

      expect(modifiedContent).to.include("import pubsub from 'lightning/omnistudioPubsub'");
      expect(modifiedContent).to.include("import OtherModule from 'c/otherModule'");
    });

    it('should handle multiple pubsub imports correctly', () => {
      const mockFileContent = `import pubsub from 'vlocity_cmt/pubsub';
import { something } from 'vlocity_cmt/utils';
import anotherPubsub from 'vlocity_cmt/pubsub';`;

      const testFile = createTempFile('test4.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'vlocity_cmt');

      expect(result).to.not.be.null;
      const modifiedContent = result.get('modified');

      expect(modifiedContent).to.include("import pubsub from 'lightning/omnistudioPubsub'");
      expect(modifiedContent).to.include("import anotherPubsub from 'lightning/omnistudioPubsub'");
      expect(modifiedContent).to.include("import { something } from 'c/utils'");
    });

    it('should handle different quote styles in imports', () => {
      const mockFileContent = `import pubsub from "vlocity_ins/pubsub";
import OtherModule from 'vlocity_ins/otherModule';`;

      const testFile = createTempFile('test5.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'vlocity_ins');

      expect(result).to.not.be.null;
      const modifiedContent = result.get('modified');

      expect(modifiedContent).to.include('lightning/omnistudioPubsub');
      expect(modifiedContent).to.include('c/otherModule');
    });
  });

  describe('Namespace replacement', () => {
    it('should replace namespace with "c" for non-pubsub modules', () => {
      const mockFileContent = `import { something } from 'vlocity_ins/utils';
import OtherModule from 'vlocity_ins/otherModule';`;

      const testFile = createTempFile('test6.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'vlocity_ins');

      expect(result).to.not.be.null;
      const modifiedContent = result.get('modified');

      expect(modifiedContent).to.include("import { something } from 'c/utils'");
      expect(modifiedContent).to.include("import OtherModule from 'c/otherModule'");
    });

    it('should not modify imports that do not match the namespace', () => {
      const mockFileContent = `import pubsub from 'vlocity_ins/pubsub';
import OtherModule from 'different_namespace/module';`;

      const testFile = createTempFile('test7.js', mockFileContent);

      const result = parser.replaceImportSource(testFile, 'vlocity_ins');

      expect(result).to.not.be.null;
      const modifiedContent = result.get('modified');

      expect(modifiedContent).to.include("import pubsub from 'lightning/omnistudioPubsub'");
      expect(modifiedContent).to.include("import OtherModule from 'different_namespace/module'");
    });
  });

  describe('File saving', () => {
    it('should save modified content to file', () => {
      const testContent = 'test content';
      const testFile = createTempFile('test8.js', '');

      parser.saveToFile(testFile, testContent);

      const savedContent = fs.readFileSync(testFile, 'utf-8');
      expect(savedContent).to.equal(testContent);
    });

    it('should throw error when file write fails', () => {
      const testContent = 'test content';
      const invalidPath = '/invalid/path/that/does/not/exist/test.js';

      expect(() => parser.saveToFile(invalidPath, testContent)).to.throw();
    });
  });
});
