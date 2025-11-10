/**
 * Utility functions for record prioritization based on name characteristics
 */

import { AnyJson } from '@salesforce/ts-types';

/**
 * Checks if a string is a valid alphanumeric name for migration:
 * - Must start with a letter (a-z, A-Z)
 * - Can contain letters and numbers (a-z, A-Z, 0-9) after the first character
 * - Cannot start with a number
 * - Cannot contain special characters
 *
 * @param str - The string to check
 * @returns true if the string is valid (starts with letter, alphanumeric only), false otherwise
 *
 * @example
 * hasOnlyAlphanumericCharacters('MyName123') // true
 * hasOnlyAlphanumericCharacters('Test1') // true
 * hasOnlyAlphanumericCharacters('123Test') // false - starts with number
 * hasOnlyAlphanumericCharacters('My-Name') // false - contains special character
 */
export function hasOnlyAlphanumericCharacters(str: string): boolean {
  // Must start with a letter, followed by any number of alphanumeric characters
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Prioritizes records by partitioning them into two groups:
 * - Group 1: Records with valid migration names (start with letter, alphanumeric only)
 * - Group 2: Records with names that need cleaning (start with number or contain special characters)
 *
 * Returns Group 1 followed by Group 2, effectively prioritizing cleaner names
 * for processing first. This helps avoid naming conflicts during migration when
 * special characters are cleaned/removed or numbers are prefixed.
 * This prevents the error in standard data model as when we try to update a record with special chars first
 * which already has clean name record in database we get FIELD_INTEGRITY_EXCEPTION as we cannot create a duplicate record with the same identifier
 *
 * @param records - Array of records to prioritize
 * @param fieldNames - Single field name or array of field names to check for each record
 * @returns Array with records reordered (valid migration names first, then others)
 *
 * @example
 * // Single field
 * prioritizeCleanNamesFirst(flexCards, 'Name')
 *
 * // Multiple fields (all must be valid)
 * prioritizeCleanNamesFirst(omniScripts, ['Type__c', 'SubType__c'])
 */
export function prioritizeCleanNamesFirst<T extends AnyJson>(records: T[], fieldNames: string | string[]): T[] {
  const cleanNameRecords: T[] = []; // Only alphanumeric in names
  const specialCharRecords: T[] = []; // Has special characters in names

  const fieldsToCheck = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

  for (const record of records) {
    // Extract values for all specified fields
    const namesToCheck = fieldsToCheck.map((field) => (record[field] as string) || '');

    // Check if all names are valid (start with letter, alphanumeric only)
    const allAlphanumeric = namesToCheck.every((name) => name && hasOnlyAlphanumericCharacters(name));

    if (allAlphanumeric) {
      cleanNameRecords.push(record);
    } else {
      specialCharRecords.push(record);
    }
  }

  // Return clean names first, then names with special characters
  return [...cleanNameRecords, ...specialCharRecords];
}
