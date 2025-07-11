import { Flexipage, FlexiComponentInstanceProperty } from '../../migration/interfaces';

const attrsToRemove = ['target'];

const lookupComponentName = 'vlocityLWCOmniWrapper';
const targetComponentName = 'runtime_omnistudio:omniscript';
const targetIdentifier = 'runtime_omnistudio_omniscript';

export function transformFlexipageBundle(ogBundle: Flexipage, namespace: string): Flexipage | boolean {
  const bundle: Flexipage = JSON.parse(JSON.stringify(ogBundle)) as Flexipage;
  let changes = false;

  const propRemover = (item: FlexiComponentInstanceProperty): boolean => {
    return !attrsToRemove.includes(item.name);
  };

  for (const region of bundle.flexiPageRegions) {
    if (!region.itemInstances) {
      continue;
    }
    for (const item of region.itemInstances) {
      if (
        item.componentInstance.componentName?.split(':')[0] !== namespace ||
        item.componentInstance.componentName?.split(':')[1] !== lookupComponentName
      ) {
        continue;
      }

      const typeSubtypeLanguage = item.componentInstance?.componentInstanceProperties?.find?.(
        (prop) => prop.name === 'target'
      )?.value;
      if (!typeSubtypeLanguage) {
        throw new Error('target property not found for component ' + item.componentInstance.componentName);
      }
      const newProps = createNewProps(typeSubtypeLanguage);
      const leftProps = item.componentInstance.componentInstanceProperties?.filter?.(propRemover) ?? [];
      const replacedProps = [
        ...leftProps,
        ...Object.entries(newProps).map(([key, value]: [string, string]) => ({ name: key, value })),
      ];
      changes = true;
      item.componentInstance.componentInstanceProperties = replacedProps;
      item.componentInstance.componentName = targetComponentName;
      item.componentInstance.identifier = targetIdentifier;
    }
  }

  return changes ? bundle : false;
}

// will change after Aastha's utility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createNewProps(_property: string): Record<string, string> {
  return {
    language: 'English',
    subType: 'OSForCustomLWC',
    theme: 'lightning',
    type: 'OSForCustomLWC',
  };
}
