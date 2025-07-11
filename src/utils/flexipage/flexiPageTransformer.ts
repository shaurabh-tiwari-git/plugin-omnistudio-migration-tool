/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flexipage, FlexiComponentInstanceProperty } from '../../migration/interfaces';

/** Attributes to remove during transformation */
const attrsToRemove = ['target'];

/** Component name to look for during transformation */
const lookupComponentName = 'vlocityLWCOmniWrapper';
/** Target component name after transformation */
const targetComponentName = 'runtime_omnistudio:omniscript';
/** Target identifier after transformation */
const targetIdentifier = 'runtime_omnistudio_omniscript';

/**
 * Transforms a Flexipage bundle by replacing vlocityLWCOmniWrapper components
 * with runtime_omnistudio:omniscript components and updating their properties.
 *
 * This function performs the following transformations:
 * - Identifies vlocityLWCOmniWrapper components within the specified namespace
 * - Removes the 'target' property from component instance properties
 * - Creates new properties for language, subType, theme, and type
 * - Updates the component name and identifier to the target runtime component
 *
 * @param ogBundle - The original Flexipage bundle to transform
 * @param namespace - The namespace to filter components by
 * @returns The transformed Flexipage bundle if changes were made, or false if no changes were needed
 * @throws Error if the 'target' property is not found for a component
 */
export function transformFlexipageBundle(ogBundle: Flexipage, namespace: string): Flexipage | boolean {
  const bundle: Flexipage = JSON.parse(JSON.stringify(ogBundle)) as Flexipage;
  let changes = false;

  /**
   * Filters out properties that should be removed during transformation
   *
   * @param item - The component instance property to check
   * @returns true if the property should be kept, false if it should be removed
   */
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

/**
 * Creates new properties for the transformed component.
 * TODO: This function will be updated after Aastha's utility is available.
 *
 * @param _property - The original property value (currently unused)
 * @returns Object containing the new properties for the transformed component
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createNewProps(_property: string): Record<string, string> {
  return {
    language: 'English',
    subType: 'OSForCustomLWC',
    theme: 'lightning',
    type: 'OSForCustomLWC',
  };
}
