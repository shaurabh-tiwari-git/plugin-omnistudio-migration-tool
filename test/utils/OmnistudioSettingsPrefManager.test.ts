/* eslint-disable @typescript-eslint/unbound-method */
import { expect } from 'chai';
import { Connection, Messages } from '@salesforce/core';
import * as sinon from 'sinon';
import { OmnistudioSettingsPrefManager } from '../../src/utils/OmnistudioSettingsPrefManager';

describe('OmnistudioSettingsPrefManager', () => {
  let prefManager: OmnistudioSettingsPrefManager;
  let connection: Connection;
  let messages: Messages<string>;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    connection = {
      metadata: {
        read: sandbox.stub(),
        update: sandbox.stub(),
      },
    } as unknown as Connection;
    messages = {
      getMessage: sandbox.stub().returns('Mocked error message'),
    } as unknown as Messages<string>;
    prefManager = new OmnistudioSettingsPrefManager(connection, messages);
  });

  afterEach(() => {
    sandbox.restore();
  });

  // Omni Global Auto Number Tests
  describe('Omni Global Auto Number functionality', () => {
    describe('isGlobalAutoNumberEnabled()', () => {
      it('should return true when omni global auto number is enabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({ enableOmniGlobalAutoNumberPref: 'true' });

        const result = await prefManager.isGlobalAutoNumberEnabled();

        expect(result).to.be.true;
        expect(readStub.calledOnce).to.be.true;
        expect(readStub.firstCall.args[0]).to.equal('OmniStudioSettings');
        expect(readStub.firstCall.args[1]).to.deep.equal(['OmniStudio']);
      });

      it('should return false when omni global auto number is disabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({ enableOmniGlobalAutoNumberPref: 'false' });

        const result = await prefManager.isGlobalAutoNumberEnabled();

        expect(result).to.be.false;
      });

      it('should return false when omni global auto number preference is not set', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({});

        const result = await prefManager.isGlobalAutoNumberEnabled();

        expect(result).to.be.false;
      });

      it('should handle metadata read failures', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.rejects(new Error('Metadata read failed'));

        const result = await prefManager.isGlobalAutoNumberEnabled();

        expect(result).to.be.false;
      });

      it('should return false when metadata is null', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves(null);

        const result = await prefManager.isGlobalAutoNumberEnabled();

        expect(result).to.be.false;
      });
    });

    describe('enableGlobalAutoNumber()', () => {
      it('should enable omni global auto number preference', async () => {
        const updateStub = connection.metadata.update as sinon.SinonStub;
        const expectedResult = { success: true };
        updateStub.resolves(expectedResult);

        const result = await prefManager.enableGlobalAutoNumber();

        expect(result).to.deep.equal(expectedResult);
        expect(updateStub.calledOnce).to.be.true;
        expect(updateStub.firstCall.args[0]).to.equal('OmniStudioSettings');
        expect(updateStub.firstCall.args[1]).to.deep.equal([
          {
            fullName: 'OmniStudio',
            enableOmniGlobalAutoNumberPref: 'true',
          },
        ]);
      });

      it('should handle update errors', async () => {
        const updateStub = connection.metadata.update as sinon.SinonStub;
        const error = new Error('Update failed');
        updateStub.rejects(error);

        try {
          await prefManager.enableGlobalAutoNumber();
          expect.fail('Expected an error to be thrown');
        } catch (err) {
          expect(err).to.equal(error);
        }
      });

      it('should handle update failure response', async () => {
        const updateStub = connection.metadata.update as sinon.SinonStub;
        const failureResult = { success: false, errors: ['Update failed'] };
        updateStub.resolves(failureResult);

        const result = await prefManager.enableGlobalAutoNumber();

        expect(result).to.deep.equal(failureResult);
      });
    });

    describe('enableGlobalAutoNumberIfDisabled()', () => {
      it('should enable when disabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        readStub.resolves({ enableOmniGlobalAutoNumberPref: 'false' });
        updateStub.resolves({ success: true });

        const result = await prefManager.enableGlobalAutoNumberIfDisabled();

        expect(result).to.deep.equal({ success: true });
        expect(readStub.calledOnce).to.be.true;
        expect(updateStub.calledOnce).to.be.true;
      });

      it('should not enable when already enabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        readStub.resolves({ enableOmniGlobalAutoNumberPref: 'true' });

        const result = await prefManager.enableGlobalAutoNumberIfDisabled();

        expect(result).to.be.null;
        expect(readStub.calledOnce).to.be.true;
        expect(updateStub.called).to.be.false;
      });
    });

    describe('constructor', () => {
      it('should properly initialize with connection and messages', () => {
        const manager = new OmnistudioSettingsPrefManager(connection, messages);

        expect(manager).to.be.instanceOf(OmnistudioSettingsPrefManager);
        // Verify that the constructor doesn't throw an error and creates a valid instance
        expect(manager).to.not.be.undefined;
        expect(manager).to.not.be.null;
      });
    });
  });

  // Standard Runtime Tests
  describe('Standard Runtime functionality', () => {
    describe('isStandardRuntimeEnabled()', () => {
      it('should return true when standard runtime is enabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({ enableStandardOmniStudioRuntime: 'true' });

        const result = await prefManager.isStandardRuntimeEnabled();

        expect(result).to.be.true;
        expect(readStub.calledOnce).to.be.true;
      });

      it('should return false when standard runtime is disabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({ enableStandardOmniStudioRuntime: 'false' });

        const result = await prefManager.isStandardRuntimeEnabled();

        expect(result).to.be.false;
      });

      it('should return false when standard runtime preference is not set', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({});

        const result = await prefManager.isStandardRuntimeEnabled();

        expect(result).to.be.false;
      });

      it('should handle metadata read failures for Standard Runtime', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.rejects(new Error('Metadata read failed'));

        const result = await prefManager.isStandardRuntimeEnabled();

        expect(result).to.be.false;
      });
    });

    describe('enableStandardRuntime()', () => {
      it('should enable standard runtime preference', async () => {
        const updateStub = connection.metadata.update as sinon.SinonStub;
        const expectedResult = { success: true };
        updateStub.resolves(expectedResult);

        const result = await prefManager.enableStandardRuntime();

        expect(result).to.deep.equal(expectedResult);
        expect(updateStub.calledOnce).to.be.true;
        expect(updateStub.firstCall.args[0]).to.equal('OmniStudioSettings');
        expect(updateStub.firstCall.args[1]).to.deep.equal([
          {
            fullName: 'OmniStudio',
            enableStandardOmniStudioRuntime: 'true',
          },
        ]);
      });
    });

    describe('enableStandardRuntimeIfDisabled()', () => {
      it('should enable when disabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        readStub.resolves({ enableStandardOmniStudioRuntime: 'false' });
        updateStub.resolves({ success: true });

        const result = await prefManager.enableStandardRuntimeIfDisabled();

        expect(result).to.deep.equal({ success: true });
        expect(readStub.calledOnce).to.be.true;
        expect(updateStub.calledOnce).to.be.true;
      });

      it('should not enable when already enabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        readStub.resolves({ enableStandardOmniStudioRuntime: 'true' });

        const result = await prefManager.enableStandardRuntimeIfDisabled();

        expect(result).to.be.null;
        expect(readStub.calledOnce).to.be.true;
        expect(updateStub.called).to.be.false;
      });
    });
  });

  // OmniStudio Metadata Tests
  describe('OmniStudio Metadata functionality', () => {
    describe('isOmniStudioSettingsMetadataEnabled()', () => {
      it('should return true when omni studio metadata is enabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({ enableOmniStudioMetadata: 'true' });

        const result = await prefManager.isOmniStudioSettingsMetadataEnabled();

        expect(result).to.be.true;
        expect(readStub.calledOnce).to.be.true;
        expect(readStub.firstCall.args[0]).to.equal('OmniStudioSettings');
        expect(readStub.firstCall.args[1]).to.deep.equal(['OmniStudio']);
      });

      it('should return false when omni studio metadata is disabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({ enableOmniStudioMetadata: 'false' });

        const result = await prefManager.isOmniStudioSettingsMetadataEnabled();

        expect(result).to.be.false;
      });

      it('should return false when omni studio metadata preference is not set', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves({});

        const result = await prefManager.isOmniStudioSettingsMetadataEnabled();

        expect(result).to.be.false;
      });

      it('should handle metadata read failures', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.rejects(new Error('Metadata read failed'));

        const result = await prefManager.isOmniStudioSettingsMetadataEnabled();

        expect(result).to.be.false;
      });

      it('should return false when metadata is null', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        readStub.resolves(null);

        const result = await prefManager.isOmniStudioSettingsMetadataEnabled();

        expect(result).to.be.false;
      });
    });

    describe('enableOmniStudioSettingsMetadata()', () => {
      it('should return null when metadata is already enabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        readStub.resolves({ enableOmniStudioMetadata: 'true' });

        const result = await prefManager.enableOmniStudioSettingsMetadata();

        expect(result).to.be.null;
        expect(readStub.calledOnce).to.be.true;
        expect(updateStub.called).to.be.false;
      });

      it('should enable metadata when disabled', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        const expectedResult = { success: true };
        readStub.resolves({ enableOmniStudioMetadata: 'false' });
        updateStub.resolves(expectedResult);

        const result = await prefManager.enableOmniStudioSettingsMetadata();

        expect(result).to.deep.equal(expectedResult);
        expect(readStub.calledOnce).to.be.true;
        expect(updateStub.calledOnce).to.be.true;
        expect(updateStub.firstCall.args[0]).to.equal('OmniStudioSettings');
        expect(updateStub.firstCall.args[1]).to.deep.equal([
          {
            fullName: 'OmniStudio',
            enableOmniStudioMetadata: 'true',
          },
        ]);
      });

      it('should handle update errors', async () => {
        const readStub = connection.metadata.read as sinon.SinonStub;
        const updateStub = connection.metadata.update as sinon.SinonStub;
        const error = new Error('Update failed');
        readStub.resolves({ enableOmniStudioMetadata: 'false' });
        updateStub.rejects(error);

        try {
          await prefManager.enableOmniStudioSettingsMetadata();
          expect.fail('Expected an error to be thrown');
        } catch (err) {
          expect(err).to.equal(error);
        }
      });
    });
  });
});
