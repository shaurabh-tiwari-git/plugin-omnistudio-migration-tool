import { expect } from 'chai';
import { transformFlexipageBundle } from '../../../src/utils/flexipage/flexiPageTransformer';
import {
  Flexipage,
  FlexiPageRegion,
  FlexiItemInstance,
  FlexiComponentInstance,
  FlexiComponentInstanceProperty,
} from '../../../src/migration/interfaces';

describe('transformFlexipageBundle', () => {
  const namespace = 'runtime_omnistudio';
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
    const bundle: Flexipage = {
      flexiPageRegions: [
        makeRegion([
          makeItemInstance([
            { name: 'target', value: 'foo' },
            { name: 'other', value: 'bar' },
          ]),
        ]),
      ],
    };
    const result = transformFlexipageBundle(bundle, namespace);
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
    // Should keep other properties
    expect(item.componentInstance.componentInstanceProperties.find((p) => p.name === 'other')).to.exist;
  });

  it('returns false if no matching component', () => {
    const bundle: Flexipage = {
      flexiPageRegions: [
        makeRegion([makeItemInstance([{ name: 'target', value: 'foo' }], 'othernamespace:otherComponent')]),
      ],
    };
    const result = transformFlexipageBundle(bundle, namespace);
    expect(result).to.equal(false);
  });

  it('throws if target property is missing', () => {
    const bundle: Flexipage = {
      flexiPageRegions: [makeRegion([makeItemInstance([{ name: 'other', value: 'bar' }])])],
    };
    expect(() => transformFlexipageBundle(bundle, namespace)).to.throw('target property not found');
  });

  it('does not mutate the original bundle', () => {
    const bundle: Flexipage = {
      flexiPageRegions: [
        makeRegion([
          makeItemInstance([
            { name: 'target', value: 'foo' },
            { name: 'other', value: 'bar' },
          ]),
        ]),
      ],
    };
    const original = JSON.stringify(bundle);
    transformFlexipageBundle(bundle, namespace);
    expect(JSON.stringify(bundle)).to.equal(original);
  });
});
