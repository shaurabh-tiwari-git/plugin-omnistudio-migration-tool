/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from '@salesforce/command/lib/test';
import { Connection } from '@salesforce/core';
import sinon = require('sinon');
import { OmniGlobalAutoNumberPrefManager } from '../../src/utils/OmniGlobalAutoNumberPrefManager';

describe('OmniGlobalAutoNumberPrefManager', () => {
  let prefManager: OmniGlobalAutoNumberPrefManager;
  let connection: Connection;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock connection
    connection = {
      metadata: {
        read: sandbox.stub(),
        update: sandbox.stub(),
      },
    } as unknown as Connection;

    prefManager = new OmniGlobalAutoNumberPrefManager(connection);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('isEnabled', () => {
    it('should return true when preference is enabled', async () => {
      // Arrange
      const mockMetadata = {
        enableOmniGlobalAutoNumberPref: 'true',
      };
      const readStub = connection.metadata.read as sinon.SinonStub;
      readStub.resolves(mockMetadata);

      // Act
      const result = await prefManager.isEnabled();

      // Assert
      expect(result).to.be.true;
      expect(readStub.calledOnce).to.be.true;
      expect(readStub.firstCall.args[0]).to.equal('OmniStudioSettings');
      expect(readStub.firstCall.args[1]).to.deep.equal(['OmniStudio']);
    });

    it('should return false when preference is disabled', async () => {
      // Arrange
      const mockMetadata = {
        enableOmniGlobalAutoNumberPref: 'false',
      };
      const readStub = connection.metadata.read as sinon.SinonStub;
      readStub.resolves(mockMetadata);

      // Act
      const result = await prefManager.isEnabled();

      // Assert
      expect(result).to.be.false;
    });

    it('should return false when preference is not set', async () => {
      // Arrange
      const mockMetadata = {};
      const readStub = connection.metadata.read as sinon.SinonStub;
      readStub.resolves(mockMetadata);

      // Act
      const result = await prefManager.isEnabled();

      // Assert
      expect(result).to.be.false;
    });

    it('should return false when metadata read fails', async () => {
      // Arrange
      const error = new Error('Metadata read failed');
      const readStub = connection.metadata.read as sinon.SinonStub;
      readStub.rejects(error);

      // Act
      const result = await prefManager.isEnabled();

      // Assert
      expect(result).to.be.false;
    });

    it('should return false when metadata is null', async () => {
      // Arrange
      const readStub = connection.metadata.read as sinon.SinonStub;
      readStub.resolves(null);

      // Act
      const result = await prefManager.isEnabled();

      // Assert
      expect(result).to.be.false;
    });
  });

  describe('enable', () => {
    it('should successfully enable the preference', async () => {
      // Arrange
      const mockResult = { success: true, fullName: 'OmniStudio' };
      const updateStub = connection.metadata.update as sinon.SinonStub;
      updateStub.resolves(mockResult);

      // Act
      const result = await prefManager.enable();

      // Assert
      expect(result).to.deep.equal(mockResult);
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
      // Arrange
      const error = new Error('Update failed');
      const updateStub = connection.metadata.update as sinon.SinonStub;
      updateStub.rejects(error);

      // Act & Assert
      try {
        await prefManager.enable();
        expect.fail('Expected an error to be thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('should handle update failure response', async () => {
      // Arrange
      const mockResult = { success: false, errors: ['Update failed'], fullName: 'OmniStudio' };
      const updateStub = connection.metadata.update as sinon.SinonStub;
      updateStub.resolves(mockResult);

      // Act
      const result = await prefManager.enable();

      // Assert
      expect(result).to.deep.equal(mockResult);
    });
  });

  describe('constructor', () => {
    it('should properly initialize with connection', () => {
      // Act
      const manager = new OmniGlobalAutoNumberPrefManager(connection);

      // Assert
      expect(manager).to.be.instanceOf(OmniGlobalAutoNumberPrefManager);
      expect((manager as any).connection).to.equal(connection);
    });
  });
});
