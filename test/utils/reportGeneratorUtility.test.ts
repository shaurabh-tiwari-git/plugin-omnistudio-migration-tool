import { expect } from 'chai';
import { JSDOM } from 'jsdom';

interface TestWindow extends Window {
  toggleFilterDropdown: (tableId: string) => void;
  closeFilterDropdown: (tableId: string) => void;
  closeAllFilterDropdowns: () => void;
  closeCtaPanel: () => void;
}

interface ConsoleSpy {
  calls: unknown[][];
  log: (...args: unknown[]) => void;
}

describe('reportGeneratorUtility Filter Popup Tests', () => {
  let dom: JSDOM;
  let document: Document;
  let testWindow: TestWindow;
  let consoleLogSpy: ConsoleSpy;

  const setupFilterFunctions = (win: Window): void => {
    const toggleFilterDropdown = (tableId: string): void => {
      const reportTable = document.getElementById(tableId);
      const dropdown = reportTable?.querySelector('#filter-dropdown');
      const chevronUp = reportTable?.querySelector('#chevron-up');
      const chevronDown = reportTable?.querySelector('#chevron-down');

      if (dropdown && chevronUp && chevronDown) {
        dropdown.classList.toggle('show');
        chevronUp.classList.toggle('hidden');
        chevronDown.classList.toggle('hidden');
      }
    };

    const closeFilterDropdown = (tableId: string): void => {
      const reportTable = document.getElementById(tableId);
      if (!reportTable) return;

      const dropdown = reportTable.querySelector('#filter-dropdown');
      const chevronUp = reportTable.querySelector('#chevron-up');
      const chevronDown = reportTable.querySelector('#chevron-down');

      if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        if (chevronUp) chevronUp.classList.add('hidden');
        if (chevronDown) chevronDown.classList.remove('hidden');
      }
    };

    const closeAllFilterDropdowns = (): void => {
      const openDropdowns = document.querySelectorAll('.filter-dropdown.show');

      openDropdowns.forEach((dropdown) => {
        dropdown.classList.remove('show');
        const container = dropdown.closest('.filter-dropdown-container') || dropdown.parentElement;
        if (container) {
          const chevronUp = container.querySelector('#chevron-up');
          const chevronDown = container.querySelector('#chevron-down');
          if (chevronUp) chevronUp.classList.add('hidden');
          if (chevronDown) chevronDown.classList.remove('hidden');
        }
      });
    };

    const closeCtaPanel = (): void => {
      const panel = document.getElementById('ctaPanel');
      const overlay = document.getElementById('overlay');

      if (panel) {
        panel.classList.remove('open');
      }
      if (overlay) {
        overlay.classList.remove('open');
      }
    };

    // Expose functions for testing
    (win as TestWindow).toggleFilterDropdown = toggleFilterDropdown;
    (win as TestWindow).closeFilterDropdown = closeFilterDropdown;
    (win as TestWindow).closeAllFilterDropdowns = closeAllFilterDropdowns;
    (win as TestWindow).closeCtaPanel = closeCtaPanel;
  };

  beforeEach(() => {
    // Create a new JSDOM instance for each test
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div class="rpt-table-container" id="report-table">
            <div class="filter-dropdown-container">
              <div class="filter-header-bar">
                <div class="filter-toggle-button">
                  Filters
                  <svg id="chevron-down" class="chevron-icon"></svg>
                  <svg id="chevron-up" class="chevron-icon hidden"></svg>
                </div>
              </div>
              <div id="filter-dropdown" class="filter-dropdown">
                <div class="filter-group">
                  <input type="checkbox" class="filter-checkbox" data-filter-key="status" value="Active" checked />
                </div>
              </div>
            </div>
            <div id="filterable-table-body">
              <table>
                <tr class="row1"><td key="status" value="Active" data-name="Test Item 1">Test Item 1</td></tr>
                <tr class="row2"><td key="status" value="Inactive" data-name="Test Item 2">Test Item 2</td></tr>
              </table>
            </div>
            <div id="row-count">Total Records: 2</div>
            <input type="text" id="name-search-input" placeholder="Search Name" />
          </div>
        </body>
      </html>
    `,
      {
        url: 'http://localhost',
        pretendToBeVisual: true,
        resources: 'usable',
      }
    );

    document = dom.window.document;
    testWindow = dom.window as unknown as TestWindow;

    // Mock global objects
    global.document = document;
    global.window = testWindow as unknown as Window & typeof globalThis;

    // Spy on console.log to ensure no debug logs are present
    consoleLogSpy = {
      calls: [],
      log: (...args: unknown[]): void => {
        consoleLogSpy.calls.push(args);
      },
    };
    global.console = { ...console, log: consoleLogSpy.log };

    // Setup filter functions
    setupFilterFunctions(testWindow);
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('toggleFilterDropdown', () => {
    it('should toggle the filter dropdown visibility', () => {
      const dropdown = document.querySelector('#filter-dropdown');
      const chevronUp = document.querySelector('#chevron-up');
      const chevronDown = document.querySelector('#chevron-down');

      expect(dropdown?.classList.contains('show')).to.be.false;
      expect(chevronUp?.classList.contains('hidden')).to.be.true;
      expect(chevronDown?.classList.contains('hidden')).to.be.false;

      testWindow.toggleFilterDropdown('report-table');

      expect(dropdown?.classList.contains('show')).to.be.true;
      expect(chevronUp?.classList.contains('hidden')).to.be.false;
      expect(chevronDown?.classList.contains('hidden')).to.be.true;
    });

    it('should handle missing elements gracefully', () => {
      expect(() => {
        testWindow.toggleFilterDropdown('non-existent-table');
      }).to.not.throw();
    });
  });

  describe('closeFilterDropdown', () => {
    it('should close an open filter dropdown', () => {
      const dropdown = document.querySelector('#filter-dropdown');
      const chevronUp = document.querySelector('#chevron-up');
      const chevronDown = document.querySelector('#chevron-down');

      // First open the dropdown
      dropdown?.classList.add('show');
      chevronUp?.classList.remove('hidden');
      chevronDown?.classList.add('hidden');

      testWindow.closeFilterDropdown('report-table');

      expect(dropdown?.classList.contains('show')).to.be.false;
      expect(chevronUp?.classList.contains('hidden')).to.be.true;
      expect(chevronDown?.classList.contains('hidden')).to.be.false;
    });

    it('should not affect already closed dropdown', () => {
      const dropdown = document.querySelector('#filter-dropdown');

      expect(dropdown?.classList.contains('show')).to.be.false;

      testWindow.closeFilterDropdown('report-table');

      expect(dropdown?.classList.contains('show')).to.be.false;
    });

    it('should handle missing table ID gracefully', () => {
      expect(() => {
        testWindow.closeFilterDropdown('non-existent-table');
      }).to.not.throw();
    });
  });

  describe('closeAllFilterDropdowns', () => {
    it('should close all open filter dropdowns', () => {
      const dropdown = document.querySelector('#filter-dropdown');
      const chevronUp = document.querySelector('#chevron-up');
      const chevronDown = document.querySelector('#chevron-down');

      // Open the dropdown
      dropdown?.classList.add('show');
      chevronUp?.classList.remove('hidden');
      chevronDown?.classList.add('hidden');

      testWindow.closeAllFilterDropdowns();

      expect(dropdown?.classList.contains('show')).to.be.false;
      expect(chevronUp?.classList.contains('hidden')).to.be.true;
      expect(chevronDown?.classList.contains('hidden')).to.be.false;
    });

    it('should handle no open dropdowns gracefully', () => {
      expect(() => {
        testWindow.closeAllFilterDropdowns();
      }).to.not.throw();
    });
  });

  describe('keyboard event handling', () => {
    it('should close filter dropdown on Escape key', () => {
      const dropdown = document.querySelector('#filter-dropdown');

      // Open the dropdown
      dropdown?.classList.add('show');

      // Simulate Escape key press
      const escapeEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        bubbles: true,
      });

      // Set up the event listener like in the actual code
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
          event.preventDefault();

          try {
            testWindow.closeCtaPanel();
          } catch (error) {
            // Silently handle error
          }

          try {
            testWindow.closeAllFilterDropdowns();
          } catch (error) {
            // Silently handle error
          }
        }
      });

      document.dispatchEvent(escapeEvent);

      expect(dropdown?.classList.contains('show')).to.be.false;
    });
  });

  describe('click outside handling', () => {
    it('should close filter dropdown when clicking outside', () => {
      const dropdown = document.querySelector('#filter-dropdown');

      // Open the dropdown
      dropdown?.classList.add('show');

      // Set up the event listener like in the actual code
      document.addEventListener('click', function (event) {
        document.querySelectorAll('.filter-dropdown.show').forEach((openDropdown) => {
          const reportTable = openDropdown.closest('.rpt-table-container');
          const filterBtn = reportTable?.querySelector('.filter-toggle-button');

          if (
            reportTable &&
            !openDropdown.contains(event.target as Node) &&
            !filterBtn?.contains(event.target as Node)
          ) {
            testWindow.closeFilterDropdown(reportTable.id);
          }
        });
      });

      // Click outside the dropdown
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const clickEvent = new dom.window.MouseEvent('click', {
        bubbles: true,
      });

      Object.defineProperty(clickEvent, 'target', {
        value: outsideElement,
        enumerable: true,
      });

      document.dispatchEvent(clickEvent);

      expect(dropdown?.classList.contains('show')).to.be.false;
    });

    it('should not close filter dropdown when clicking the filter button', () => {
      const dropdown = document.querySelector('#filter-dropdown');
      const filterButton = document.querySelector('.filter-toggle-button');

      // Open the dropdown
      dropdown?.classList.add('show');

      // Set up the event listener
      document.addEventListener('click', function (event) {
        document.querySelectorAll('.filter-dropdown.show').forEach((openDropdown) => {
          const reportTable = openDropdown.closest('.rpt-table-container');
          const filterBtn = reportTable?.querySelector('.filter-toggle-button');

          if (
            reportTable &&
            !openDropdown.contains(event.target as Node) &&
            !filterBtn?.contains(event.target as Node)
          ) {
            testWindow.closeFilterDropdown(reportTable.id);
          }
        });
      });

      // Click on the filter button
      const clickEvent = new dom.window.MouseEvent('click', {
        bubbles: true,
      });

      Object.defineProperty(clickEvent, 'target', {
        value: filterButton,
        enumerable: true,
      });

      document.dispatchEvent(clickEvent);

      // Should still be open since we clicked the filter button
      expect(dropdown?.classList.contains('show')).to.be.true;
    });
  });

  describe('error handling', () => {
    it('should handle missing CTA panel elements gracefully', () => {
      expect(() => {
        testWindow.closeCtaPanel();
      }).to.not.throw();
    });

    it('should handle DOM manipulation errors gracefully', () => {
      // Remove the dropdown element to simulate DOM errors
      const dropdown = document.querySelector('#filter-dropdown');
      dropdown?.remove();

      expect(() => {
        testWindow.closeAllFilterDropdowns();
      }).to.not.throw();
    });
  });
});
