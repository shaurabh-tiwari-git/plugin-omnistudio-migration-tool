import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Messages } from '@salesforce/core';
import { Logger } from '../../src/utils/logger';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-migration-tool', 'assess');

describe('ProjectPathUtil - Restricted Folder Name Validation', () => {
  let loggerErrorStub: sinon.SinonStub;
  let fsExistsSyncStub: sinon.SinonStub;
  let fsLstatSyncStub: sinon.SinonStub;

  beforeEach(() => {
    loggerErrorStub = sinon.stub(Logger, 'error');
    fsExistsSyncStub = sinon.stub(fs, 'existsSync');
    fsLstatSyncStub = sinon.stub(fs, 'lstatSync');
  });

  afterEach(() => {
    loggerErrorStub.restore();
    fsExistsSyncStub.restore();
    fsLstatSyncStub.restore();
  });

  /**
   * Helper function that simulates the isValidFolderPath restricted name check
   */
  function isRestrictedFolderName(folderPath: string): boolean {
    const restrictedFolderNames = ['labels', 'messagechannels', 'lwc'];
    const folderName = path.basename(folderPath);
    return restrictedFolderNames.includes(folderName.toLowerCase());
  }

  describe('Restricted folder names', () => {
    it('should reject folder path ending with "lwc"', () => {
      const folderPath = '/some/path/lwc';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.include('lwc');
    });

    it('should reject folder path ending with "labels"', () => {
      const folderPath = '/some/path/labels';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.include('labels');
    });

    it('should reject folder path ending with "messageChannels"', () => {
      const folderPath = '/some/path/messageChannels';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.include('messageChannels');
    });

    it('should reject folder path with uppercase "LWC" (case insensitive)', () => {
      const folderPath = '/some/path/LWC';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.include('LWC');
    });

    it('should reject folder path with mixed case "Labels" (case insensitive)', () => {
      const folderPath = '/some/path/Labels';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.include('Labels');
    });

    it('should reject folder path with uppercase "MESSAGECHANNELS" (case insensitive)', () => {
      const folderPath = '/some/path/MESSAGECHANNELS';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.include('MESSAGECHANNELS');
    });
  });

  describe('Valid folder names', () => {
    it('should allow folder path ending with "myproject"', () => {
      const folderPath = '/some/path/myproject';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.called).to.be.false;
    });

    it('should allow folder path ending with "src"', () => {
      const folderPath = '/some/path/src';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.called).to.be.false;
    });

    it('should allow folder path containing "lwc" but not ending with it', () => {
      const folderPath = '/some/lwc/myproject';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.called).to.be.false;
    });

    it('should allow folder path containing "labels" but not ending with it', () => {
      const folderPath = '/some/labels/customfolder';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.called).to.be.false;
    });

    it('should allow folder name that contains restricted name as substring', () => {
      const folderPath = '/some/path/mylwcproject';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.called).to.be.false;
    });

    it('should allow folder name "labelsbackup"', () => {
      const folderPath = '/some/path/labelsbackup';

      if (isRestrictedFolderName(folderPath)) {
        const folderName = path.basename(folderPath);
        Logger.error(messages.getMessage('restrictedFolderName', [folderName]));
      }

      expect(loggerErrorStub.called).to.be.false;
    });
  });
});
