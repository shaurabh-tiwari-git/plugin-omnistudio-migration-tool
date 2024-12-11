/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createPatch } from 'diff';
import { Logger } from '../../../utils/logger';

export class FileDiffUtil {
  public getFileDiff(filename: string, originalFileContent: string, modifiedFileContent: string): string {
    const patch: string = createPatch('', originalFileContent, modifiedFileContent);
    try {
      // Split the patch into lines
      const patchLines = patch.split('\n');

      // Initialize variables to track line numbers
      let oldLineNumber = 1;
      let newLineNumber = 1;
      let firstPlusAlreadySkipped = false;
      let firstMinusAlreadySkipped = false;
      // Initialize result as HTML string
      let result = '';

      patchLines.forEach((line) => {
        // Parse the hunk header (e.g., @@ -2,3 +2,3 @@)
        const hunkHeader = /^@@ -(\d+),\d+ \+(\d+),\d+ @@/;
        const match = hunkHeader.exec(line);

        if (match) {
          oldLineNumber = parseInt(match[1], 10);
          newLineNumber = parseInt(match[2], 10);
        } else if (line.startsWith('-')) {
          // Skip the first line difference
          if (oldLineNumber === 1 && !firstMinusAlreadySkipped) {
            firstMinusAlreadySkipped = true;
            // Skip the first line difference
            oldLineNumber++;
            return;
          }
          result += `<div style="color: red;">- Line ${oldLineNumber}: ${this.escapeHtml(line.slice(1))}</div>`;
          oldLineNumber++;
        } else if (line.startsWith('+')) {
          // Skip the first line difference
          if (newLineNumber === 1 && !firstPlusAlreadySkipped) {
            firstPlusAlreadySkipped = true;
            newLineNumber++;
            return;
          }
          result += `<div style="color: green;">+ Line ${newLineNumber}: ${this.escapeHtml(line.slice(1))}</div>`;
          newLineNumber++;
        } else if (line.startsWith(' ')) {
          // Unchanged line, skip it
          oldLineNumber++;
          newLineNumber++;
        }
      });
      // Return the result string, or an empty string if no differences
      return result.trim() ? result : '';
    } catch (error) {
      Logger.logger.error('Error in FileDiffUtil', error.message);
    }
  }

  escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
