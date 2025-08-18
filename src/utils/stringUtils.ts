/**
 * Replaces placeholders in a string with corresponding values from arguments.
 * Placeholders are in the format {key}.
 *
 * @param formatString The string containing placeholders (e.g., "Hello, {name}!")
 * @param args Either an object where keys match placeholders, or a rest parameter array where indices match placeholders.
 * @returns The formatted string.
 */
export function formatUnicorn(
  formatString: string,
  ...args: Array<string | number | Record<string, string | number>>
): string {
  let str = formatString.toString();

  if (args.length > 0) {
    const actualArgs = typeof args[0] === 'string' || typeof args[0] === 'number' ? args : args[0];

    for (const key in actualArgs) {
      if (Object.prototype.hasOwnProperty.call(actualArgs, key)) {
        str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), String(actualArgs[key]));
      }
    }
  }

  return str;
}

export function getMigrationHeading(name: string): string {
  if (name.toLowerCase().includes('data')) {
    return 'DataMappers';
  } else if (name.toLowerCase().includes('flexcard')) {
    return 'Flexcards';
  } else if (name.toLowerCase().includes('omniscript')) {
    return 'Omniscripts';
  } else if (name.toLowerCase().includes('integration')) {
    return 'Integration Procedures';
  } else if (name.toLowerCase().includes('autonumber')) {
    return 'Global Auto Numbers';
  } else {
    return name;
  }
}

const AssessmentStatusPriority = {
  Failed: 0,
  'Needs Manual Intervention': 1,
  Warnings: 2,
  'Ready for migration': 3,
};

export function getUpdatedAssessmentStatus(
  currentStatus: 'Warnings' | 'Needs Manual Intervention' | 'Ready for migration' | 'Failed',
  newStatus: 'Warnings' | 'Needs Manual Intervention' | 'Ready for migration' | 'Failed'
): 'Warnings' | 'Needs Manual Intervention' | 'Ready for migration' | 'Failed' {
  const currentPriority = AssessmentStatusPriority[currentStatus];
  const newPriority = AssessmentStatusPriority[newStatus];
  return currentPriority > newPriority ? newStatus : currentStatus;
}
