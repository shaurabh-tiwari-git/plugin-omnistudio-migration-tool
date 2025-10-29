/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createPatch, diffLines } from 'diff';
import { Logger } from '../../../utils/logger';
import { DiffPair } from '../../interfaces';

export class FileDiffUtil {
  public static getDiffHTML(diff: string, name: string): string {
    if (!diff) {
      return '';
    }
    const diffArray: DiffPair[] = JSON.parse(diff) as DiffPair[];
    // Wrap everything in a positioned container so button positions correctly within table cell
    let result = '<div class="diff-content-wrapper">';
    result += '<div style="height: 120px; text-align: left; overflow-x: auto; padding: 0.5rem;">';
    if (diffArray.length <= 6) {
      result += this.getDiffContent(diff) + '</div>';
    } else {
      result +=
        this.getDiffContent(diff, 6) +
        '</div>' +
        `<button onclick="toggleDiffModal('${name}')" class="expandModalButton"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>`;
      result += `<div id="myModal_${name}" class="diffModal" style="display: none;">
              <div class="diffModalContent">
                <span onclick="toggleDiffModal('${name}')" class="closeButton">&times;</span>
                <h2 class="modalHeader">Summary</h2>
                <div class="modalContent">
                  ${this.getDiffContent(diff, -1)}
                </div>
        </div>
      </div>`;
    }
    result += '</div>'; // Close diff-content-wrapper
    return result;
  }

  /*
    This function provides the diff html based on the diff array recieved
    linelimit is the number of lines we want in the html, this is required as we are showing only few lines in the table not the entire diff
    For the entire diff we are using modal, hence the requirement of lineLimit
  */
  private static getDiffContent(diff: string, lineLimit = -1): string {
    const diffArray: DiffPair[] = JSON.parse(diff) as DiffPair[];
    let result = '';
    let originalLine = 1;
    let modifiedLine = 1;
    let linecount = 0;
    for (const { old: original, new: modified } of diffArray) {
      if (original === modified) {
        result += `<div style="color: black;">• Line ${modifiedLine}: ${this.escapeHtml(original).replace(
          / /g,
          '&nbsp;'
        )}</div>`;
        modifiedLine++;
        originalLine++;
        linecount++;
      } else if (original !== null && modified === null) {
        result += `<div style="color: red;">- Line ${originalLine}: ${this.escapeHtml(original).replace(
          / /g,
          '&nbsp;'
        )}</div>`;
        originalLine++;
        linecount++;
      } else if (original === null && modified !== null) {
        result += `<div style="color: green;">+ Line ${modifiedLine}: ${this.escapeHtml(modified).replace(
          / /g,
          '&nbsp;'
        )}</div>`;
        modifiedLine++;
        linecount++;
      }
      if (linecount >= lineLimit && lineLimit !== -1) {
        result += '<div style="color: black;">..........</div>';
        break;
      }
    }
    return result;
  }

  private static escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  public getFileDiff(filename: string, originalFileContent: string, modifiedFileContent: string): DiffPair[] {
    try {
      const originalLines = originalFileContent.split('\n');
      const modifiedLines = modifiedFileContent.split('\n');
      const patch: string = createPatch('', originalFileContent, modifiedFileContent);
      const patchLines = patch.split('\n');

      let origIdx = 0;
      let modIdx = 0;
      const result: DiffPair[] = [];

      // Skip the first line of the patch (the file header)
      let i = 0;
      while (i < patchLines.length) {
        const line = patchLines[i];
        const hunkHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/;
        const match = hunkHeader.exec(line);

        if (match) {
          // Move to the start of the hunk
          const origStart = parseInt(match[1], 10) - 1;
          const modStart = parseInt(match[3], 10) - 1;

          // Emit unchanged lines before the hunk
          while (origIdx < origStart && modIdx < modStart) {
            result.push({ old: originalLines[origIdx], new: modifiedLines[modIdx] });
            origIdx++;
            modIdx++;
          }

          i++;
          // Now process the hunk lines
          while (i < patchLines.length && !patchLines[i].startsWith('@@')) {
            const hunkLine = patchLines[i];
            if (hunkLine.startsWith('-')) {
              result.push({ old: originalLines[origIdx], new: null });
              origIdx++;
            } else if (hunkLine.startsWith('+')) {
              result.push({ old: null, new: modifiedLines[modIdx] });
              modIdx++;
            } else if (hunkLine.startsWith(' ')) {
              result.push({ old: originalLines[origIdx], new: modifiedLines[modIdx] });
              origIdx++;
              modIdx++;
            }
            i++;
          }
        } else {
          i++;
        }
      }

      // Emit any remaining unchanged lines at the end
      while (origIdx < originalLines.length && modIdx < modifiedLines.length) {
        result.push({ old: originalLines[origIdx], new: modifiedLines[modIdx] });
        origIdx++;
        modIdx++;
      }
      // If there are trailing additions or deletions
      while (origIdx < originalLines.length) {
        result.push({ old: originalLines[origIdx], new: null });
        origIdx++;
      }
      while (modIdx < modifiedLines.length) {
        result.push({ old: null, new: modifiedLines[modIdx] });
        modIdx++;
      }

      // Only return if there are any changes
      const hasChanges = result.some((diff) => diff.old !== diff.new);
      return hasChanges ? result : [];
    } catch (error) {
      Logger.error('Error in FileDiffUtil', error);
      return [];
    }
  }

  public getXMLDiff(originalFileContent: string, modifiedFileContent: string): DiffPair[] {
    const diff = diffLines(originalFileContent, modifiedFileContent, { stripTrailingCr: true });
    const result: DiffPair[] = [];
    for (const block of diff) {
      if (block.added) {
        block.value.split('\n').forEach((line) => {
          result.push({ old: null, new: line });
        });
      } else if (block.removed) {
        block.value.split('\n').forEach((line) => {
          result.push({ old: line, new: null });
        });
      } else {
        block.value.split('\n').forEach((line) => {
          result.push({ old: line, new: line });
        });
      }
    }
    return result;
  }
}
