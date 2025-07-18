import { expect } from 'chai';
import sinon = require('sinon');
import { transformFlexipageBundle } from '../../../src/utils/flexipage/flexiPageTransformer';
import {
  Flexipage,
  FlexiPageRegion,
  FlexiItemInstance,
  FlexiComponentInstance,
  FlexiComponentInstanceProperty,
} from '../../../src/migration/interfaces';
import { StorageUtil } from '../../../src/utils/storageUtil';

describe('transformFlexipageBundle', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const namespace = 'clocity_ins';
  const lookupComponentName = 'vlocityLWCOmniWrapper';
  const targetComponentName = 'runtime_omnistudio:omniscript';
  const targetIdentifier = 'runtime_omnistudio_omniscript';

  function makeComponentInstance(props: FlexiComponentInstanceProperty[], name?: string): FlexiComponentInstance {
    return {
      componentInstanceProperties: props,
      componentName: name || `${namespace}:${lookupComponentName}`,
    };
  }

  function makeItemInstance(props: FlexiComponentInstanceProperty[], name?: string): FlexiItemInstance {
    return {
      componentInstance: makeComponentInstance(props, name),
    };
  }

  function makeRegion(itemInstances: FlexiItemInstance[]): FlexiPageRegion {
    return {
      itemInstances,
    };
  }

  it('transforms a matching component and returns a changed bundle', () => {
    // Mock StorageUtil
    const mockStorage = {
      osStorage: new Map([
        ['subtype', { type: 'OSForCustomLWC', subtype: 'OSForCustomLWC', language: 'English', isDuplicate: false }],
      ]),
      fcStorage: new Map(),
    };
    sandbox.stub(StorageUtil, 'getOmnistudioMigrationStorage').returns(mockStorage);

    const bundle: Flexipage = {
      flexiPageRegions: [
        makeRegion([
          makeItemInstance([
            { name: 'target', value: 'type:subtype' },
            { name: 'other', value: 'bar' },
          ]),
        ]),
      ],
    };
    const result = transformFlexipageBundle(bundle, namespace, 'migrate');
    expect(result).to.not.equal(false);
    const changed = result as Flexipage;
    const item = changed.flexiPageRegions[0].itemInstances[0];
    expect(item.componentInstance.componentName).to.equal(targetComponentName);
    expect(item.componentInstance.identifier).to.equal(targetIdentifier);
    // Should not have 'target' property
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'target')).to.be.undefined;
    // Should have new properties
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'language')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'type')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'subType')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'theme')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'inlineVariant')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'inlineLabel')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'display')).to.exist;
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'direction')).to.exist;
    // Should not keep other properties (implementation replaces all properties)
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'other')).to.be.undefined;
  });

  it('returns false if no matching component', () => {
    const bundle: Flexipage = {
      flexiPageRegions: [
        makeRegion([makeItemInstance([{ name: 'target', value: 'foo' }], 'othernamespace:otherComponent')]),
      ],
    };
    const result = transformFlexipageBundle(bundle, namespace, 'migrate');
    expect(result).to.equal(false);
  });

  it('throws if target property is missing', () => {
    const bundle: Flexipage = {
      flexiPageRegions: [makeRegion([makeItemInstance([{ name: 'other', value: 'bar' }])])],
    };
    expect(() => transformFlexipageBundle(bundle, namespace, 'migrate')).to.throw(
      'Target property not found for component clocity_ins:vlocityLWCOmniWrapper'
    );
  });

  it('does not mutate the original bundle', () => {
    // Mock StorageUtil
    const mockStorage = {
      osStorage: new Map([
        ['subtype', { type: 'OSForCustomLWC', subtype: 'OSForCustomLWC', language: 'English', isDuplicate: false }],
      ]),
      fcStorage: new Map(),
    };
    sandbox.stub(StorageUtil, 'getOmnistudioMigrationStorage').returns(mockStorage);

    const bundle: Flexipage = {
      flexiPageRegions: [
        makeRegion([
          makeItemInstance([
            { name: 'target', value: 'type:subtype' },
            { name: 'other', value: 'bar' },
          ]),
        ]),
      ],
    };
    const original = JSON.stringify(bundle);
    transformFlexipageBundle(bundle, namespace, 'migrate');
    expect(JSON.stringify(bundle)).to.equal(original);
  });
});
