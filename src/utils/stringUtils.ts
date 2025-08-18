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
    return 'Data Mapper';
  } else if (name.toLowerCase().includes('flexcard')) {
    return 'Flexcard';
  } else if (name.toLowerCase().includes('omniscript')) {
    return 'OmniScript';
  } else if (name.toLowerCase().includes('integration')) {
    return 'Integration Procedure';
  } else if (name.toLowerCase().includes('apex')) {
    return 'Apex File';
  } else {
    return name;
  }
}

/**
 * Escapes HTML special characters to prevent XSS and ensure content is displayed as plain text.
 * Converts characters like <, >, &, ", ' to their HTML entity equivalents.
 *
 * @param text - The text to escape
 * @returns The escaped HTML string
 */
export function escapeHtml(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
