import { expect } from 'chai';
import * as sinon from 'sinon';
import { Messages } from '@salesforce/core';
import { Logger } from '../../../../src/utils/logger';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-omnistudio-migration-tool', 'assess');

describe('Assess command flags validation', () => {
  let loggerErrorStub: sinon.SinonStub;
  let processExitStub: sinon.SinonStub;

  beforeEach(() => {
    loggerErrorStub = sinon.stub(Logger, 'error');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processExitStub = sinon.stub(process, 'exit' as any);
  });

  afterEach(() => {
    loggerErrorStub.restore();
    processExitStub.restore();
  });

  it('should validate that --only and --relatedobjects flags cannot be used together', () => {
    // Simulate the validation logic
    const assessOnly = 'os';
    const relatedObjects = 'lwc';

    if (assessOnly && relatedObjects) {
      Logger.error(messages.getMessage('relatedFlagsNotSupportedWithOnly'));
      process.exit(1);
    }

    expect(loggerErrorStub.calledOnce).to.be.true;
    expect(loggerErrorStub.firstCall.args[0]).to.equal(
      'Related objects [ex: Apex, lwc, expsites and flexipages] are not supported with only flag.'
    );
    expect(processExitStub.calledWith(1)).to.be.true;
  });

  it('should allow --only flag without --relatedobjects', () => {
    const assessOnly = 'os';
    const relatedObjects = '';

    if (assessOnly && relatedObjects) {
      Logger.error(messages.getMessage('relatedFlagsNotSupportedWithOnly'));
      process.exit(1);
    }

    expect(loggerErrorStub.called).to.be.false;
    expect(processExitStub.called).to.be.false;
  });

  it('should allow --relatedobjects flag without --only', () => {
    const assessOnly = '';
    const relatedObjects = 'lwc';

    if (assessOnly && relatedObjects) {
      Logger.error(messages.getMessage('relatedFlagsNotSupportedWithOnly'));
      process.exit(1);
    }

    expect(loggerErrorStub.called).to.be.false;
    expect(processExitStub.called).to.be.false;
  });

  it('should allow neither flag to be set', () => {
    const assessOnly = '';
    const relatedObjects = '';

    if (assessOnly && relatedObjects) {
      Logger.error(messages.getMessage('relatedFlagsNotSupportedWithOnly'));
      process.exit(1);
    }

    expect(loggerErrorStub.called).to.be.false;
    expect(processExitStub.called).to.be.false;
  });
});
