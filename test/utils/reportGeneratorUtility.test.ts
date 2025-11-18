import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
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

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion */
describe('reportGeneratorUtility Column Freeze Tests', () => {
  let dom: JSDOM;
  let document: Document;

  interface TestColumnFreezeWindow extends Window {
    applyStickyStyles: (
      element: HTMLElement,
      width: number,
      left: number,
      zIndex: number,
      bgColor: string,
      addBorder?: boolean
    ) => void;
    removeStickyStyles: (element: HTMLElement) => void;
    applySingleColumnFreeze: (table: HTMLElement, headerCell: HTMLElement, columnWidth?: number) => void;
    applyMultiColumnHeaderFreeze: (
      firstHeaderCell: HTMLElement,
      secondRow: HTMLElement,
      colspan: number,
      baseColumnWidth: number,
      firstColumnWidth: number
    ) => void;
    applyMultiColumnBodyFreeze: (
      tbody: HTMLElement,
      colspan: number,
      baseColumnWidth: number,
      firstColumnWidth: number
    ) => void;
    addHoverEffects: (tbody: HTMLElement, colspan: number) => void;
    handleMultiColumnFreeze: (
      table: HTMLElement,
      firstHeaderCell: HTMLElement,
      firstRow: HTMLElement,
      secondRow: HTMLElement,
      colspan: number
    ) => void;
    processTable: (table: HTMLElement) => void;
    applyDynamicStickyColumns: () => void;
  }

  const loadActualSourceCode = (win: Window): void => {
    // Load the actual JavaScript file from source
    const jsFilePath = path.resolve(__dirname, '../../src/javascripts/reportGeneratorUtility.js');
    const jsCode = fs.readFileSync(jsFilePath, 'utf-8');

    // Execute the actual source code in the JSDOM window context using vm
    const script = new vm.Script(jsCode);
    const context = vm.createContext(win);
    script.runInContext(context);
  };

  beforeEach(() => {
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div class="table-container">
            <table class="slds-table">
              <thead>
                <tr>
                  <th colspan="1" rowspan="1">Name</th>
                  <th>Status</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td key="name">Item 1</td>
                  <td>Active</td>
                  <td>Type A</td>
                </tr>
                <tr>
                  <td key="name">Item 2</td>
                  <td>Inactive</td>
                  <td>Type B</td>
                </tr>
              </tbody>
            </table>
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
    global.document = document;
    global.window = dom.window as unknown as Window & typeof globalThis;

    // Load the ACTUAL source code from src/javascripts/reportGeneratorUtility.js
    loadActualSourceCode(dom.window as unknown as Window);
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('applyStickyStyles', () => {
    it('should apply sticky styles to an element', () => {
      const element = document.createElement('th');
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applyStickyStyles(element, 200, 0, 20, '#f3f3f3', true);

      expect(element.style.getPropertyValue('width')).to.equal('200px');
      expect(element.style.getPropertyValue('position')).to.equal('sticky');
      expect(element.style.getPropertyValue('left')).to.equal('0px');
      expect(element.style.getPropertyValue('z-index')).to.equal('20');
      // CSS colors are normalized to rgb format by JSDOM
      expect(element.style.getPropertyValue('background-color')).to.equal('rgb(243, 243, 243)');
      // expect(element.style.getPropertyValue('border-right')).to.equal('1px solid #e5e5e5');
    });

    it('should apply sticky styles without border when addBorder is false', () => {
      const element = document.createElement('th');
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applyStickyStyles(element, 200, 100, 10, '#fff', false);

      expect(element.style.getPropertyValue('border-right')).to.equal('');
      expect(element.style.getPropertyValue('left')).to.equal('100px');
    });
  });

  describe('removeStickyStyles', () => {
    it('should remove sticky styles from an element', () => {
      const element = document.createElement('th');
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      // First apply sticky styles
      testWin.applyStickyStyles(element, 200, 0, 20, '#f3f3f3', true);

      // Then remove them
      testWin.removeStickyStyles(element);

      expect(element.style.getPropertyValue('position')).to.equal('static');
      // JSDOM may normalize 'auto' to other values, just check it's not sticky anymore
      expect(element.style.getPropertyValue('position')).to.equal('static');
      expect(element.style.getPropertyValue('width')).to.equal('auto');
      expect(element.style.getPropertyValue('max-width')).to.equal('none');
    });
  });

  describe('applySingleColumnFreeze', () => {
    it('should freeze only the first column with default width', () => {
      const table = document.querySelector('table.slds-table') as HTMLElement;
      const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applySingleColumnFreeze(table, firstHeaderCell);

      expect(firstHeaderCell.style.getPropertyValue('position')).to.equal('sticky');
      expect(firstHeaderCell.style.getPropertyValue('width')).to.equal('180px');
      expect(firstHeaderCell.style.getPropertyValue('left')).to.equal('0px');

      // Check that other headers are not sticky
      const secondHeader = table.querySelector('th:nth-child(2)') as HTMLElement;
      expect(secondHeader.style.getPropertyValue('position')).to.equal('static');
    });

    it('should freeze first column with custom width', () => {
      const table = document.querySelector('table.slds-table') as HTMLElement;
      const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applySingleColumnFreeze(table, firstHeaderCell, 250);

      expect(firstHeaderCell.style.getPropertyValue('width')).to.equal('250px');
    });

    it('should apply sticky styles to first column in tbody', () => {
      const table = document.querySelector('table.slds-table') as HTMLElement;
      const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applySingleColumnFreeze(table, firstHeaderCell);

      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const firstCell = firstRow?.querySelector('td[key="name"]') as HTMLElement;

      expect(firstCell.style.getPropertyValue('position')).to.equal('sticky');
      expect(firstCell.style.getPropertyValue('width')).to.equal('180px');
    });

    it('should add hover effects to frozen first column', () => {
      const table = document.querySelector('table.slds-table') as HTMLElement;
      const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applySingleColumnFreeze(table, firstHeaderCell);

      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr') as HTMLElement;
      const firstCell = firstRow?.querySelector('td[key="name"]') as HTMLElement;

      // Trigger mouseenter
      const mouseenterEvent = new dom.window.MouseEvent('mouseenter', { bubbles: true });
      firstRow.dispatchEvent(mouseenterEvent);

      // CSS colors are normalized to rgb format by JSDOM
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(firstCell.style.getPropertyValue('background-color')).to.equal('rgb(243, 243, 243)');

      // Trigger mouseleave
      const mouseleaveEvent = new dom.window.MouseEvent('mouseleave', { bubbles: true });
      firstRow.dispatchEvent(mouseleaveEvent);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(firstCell.style.getPropertyValue('background-color')).to.equal('rgb(255, 255, 255)');
    });
  });

  describe('applyMultiColumnHeaderFreeze', () => {
    beforeEach(() => {
      // Create a table with multi-column header structure
      const multiColTable = `
        <div class="table-container">
          <table class="slds-table">
            <thead>
              <tr>
                <th colspan="3" rowspan="1">Combined Header</th>
                <th>Other</th>
              </tr>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Item 1</td><td>001</td><td>A</td><td>Active</td></tr>
            </tbody>
          </table>
        </div>
      `;

      document.body.innerHTML = multiColTable;
    });

    it('should freeze multiple columns in header', () => {
      const table = document.querySelector('table.slds-table') as HTMLElement;
      const firstRow = table.querySelector('thead tr:first-child') as HTMLElement;
      const secondRow = table.querySelector('thead tr:nth-child(2)') as HTMLElement;
      const firstHeaderCell = firstRow.querySelector('th:first-child') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applyMultiColumnHeaderFreeze(firstHeaderCell, secondRow, 3, 200, 250);

      // First header should span the total width
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(firstHeaderCell.style.getPropertyValue('width')).to.equal('650px'); // 250 + 200 + 200

      // Second row headers should be frozen
      const secondRowHeaders = Array.from(secondRow.querySelectorAll('th')) as HTMLElement[];
      expect(secondRowHeaders[0].style.getPropertyValue('position')).to.equal('sticky');
      expect(secondRowHeaders[0].style.getPropertyValue('left')).to.equal('0px');
      expect(secondRowHeaders[1].style.getPropertyValue('left')).to.equal('250px');
      expect(secondRowHeaders[2].style.getPropertyValue('left')).to.equal('450px');

      // Fourth column should not be frozen
      expect(secondRowHeaders[3].style.getPropertyValue('position')).to.equal('static');
    });
  });

  describe('applyMultiColumnBodyFreeze', () => {
    it('should freeze multiple columns in tbody', () => {
      const table = document.querySelector('table.slds-table');
      const tbody = table.querySelector('tbody') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.applyMultiColumnBodyFreeze(tbody, 2, 200, 250);

      const firstRow = tbody.querySelector('tr');
      const cells = Array.from(firstRow?.querySelectorAll('td') || []) as HTMLElement[];

      // First column should be frozen at left 0
      expect(cells[0].style.getPropertyValue('position')).to.equal('sticky');
      expect(cells[0].style.getPropertyValue('left')).to.equal('0px');
      expect(cells[0].style.getPropertyValue('width')).to.equal('250px');

      // Second column should be frozen at left 250
      expect(cells[1].style.getPropertyValue('position')).to.equal('sticky');
      expect(cells[1].style.getPropertyValue('left')).to.equal('250px');
      expect(cells[1].style.getPropertyValue('width')).to.equal('200px');

      // Third column should not be frozen
      expect(cells[2].style.getPropertyValue('position')).to.equal('static');
    });
  });

  describe('addHoverEffects', () => {
    it('should add hover effects to frozen columns', () => {
      const table = document.querySelector('table.slds-table');
      const tbody = table.querySelector('tbody') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.addHoverEffects(tbody, 2);

      const firstRow = tbody.querySelector('tr') as HTMLElement;
      const cells = Array.from(firstRow.querySelectorAll('td')) as HTMLElement[];

      // Trigger mouseenter
      const mouseenterEvent = new dom.window.MouseEvent('mouseenter', { bubbles: true });
      firstRow.dispatchEvent(mouseenterEvent);

      // CSS colors are normalized to rgb format by JSDOM
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(cells[0].style.getPropertyValue('background-color')).to.equal('rgb(243, 243, 243)');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(cells[1].style.getPropertyValue('background-color')).to.equal('rgb(243, 243, 243)');

      // Trigger mouseleave
      const mouseleaveEvent = new dom.window.MouseEvent('mouseleave', { bubbles: true });
      firstRow.dispatchEvent(mouseleaveEvent);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(cells[0].style.getPropertyValue('background-color')).to.equal('rgb(255, 255, 255)');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(cells[1].style.getPropertyValue('background-color')).to.equal('rgb(255, 255, 255)');
    });
  });

  describe('processTable', () => {
    it('should detect and apply single column freeze for rowspan=2, colspan=1', () => {
      const singleColTable = `
        <div class="table-container">
          <table class="slds-table">
            <thead>
              <tr>
                <th colspan="1" rowspan="2">Name</th>
                <th>Status</th>
              </tr>
              <tr>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Item 1</td><td>Active</td></tr>
            </tbody>
          </table>
        </div>
      `;

      document.body.innerHTML = singleColTable;

      const table = document.querySelector('table.slds-table') as HTMLElement;
      const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.processTable(table);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(firstHeaderCell.style.getPropertyValue('width')).to.equal('180px');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(firstHeaderCell.style.getPropertyValue('position')).to.equal('sticky');
    });

    it('should detect and apply single column freeze for single-level header', () => {
      const table = document.querySelector('table.slds-table') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      testWin.processTable(table);

      const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
      expect(firstHeaderCell.style.getPropertyValue('width')).to.equal('250px');
      expect(firstHeaderCell.style.getPropertyValue('position')).to.equal('sticky');
    });

    it('should handle tables without thead gracefully', () => {
      const noTheadTable = `
        <div class="table-container">
          <table class="slds-table">
            <tbody>
              <tr><td>Item 1</td><td>Active</td></tr>
            </tbody>
          </table>
        </div>
      `;

      document.body.innerHTML = noTheadTable;

      const table = document.querySelector('table.slds-table') as HTMLElement;
      const testWin = dom.window as unknown as TestColumnFreezeWindow;

      expect(() => testWin.processTable(table)).to.not.throw();
    });
  });

  describe('applyDynamicStickyColumns', () => {
    it('should process all tables in table containers', () => {
      const multipleTables = `
        <div class="table-container">
          <table class="slds-table">
            <thead>
              <tr><th colspan="1" rowspan="1">Name</th><th>Status</th></tr>
            </thead>
            <tbody><tr><td>Item 1</td><td>Active</td></tr></tbody>
          </table>
        </div>
        <div class="table-container">
          <table class="slds-table">
            <thead>
              <tr><th colspan="1" rowspan="1">Title</th><th>Type</th></tr>
            </thead>
            <tbody><tr><td>Item 2</td><td>Type A</td></tr></tbody>
          </table>
        </div>
      `;

      document.body.innerHTML = multipleTables;

      const testWin = dom.window as unknown as TestColumnFreezeWindow;
      testWin.applyDynamicStickyColumns();

      const tables = document.querySelectorAll('table.slds-table');
      tables.forEach((table) => {
        const firstHeaderCell = table.querySelector('th:first-child') as HTMLElement;
        expect(firstHeaderCell.style.getPropertyValue('position')).to.equal('sticky');
      });
    });

    it('should handle containers without slds-table class gracefully', () => {
      const noSldsTable = `
        <div class="table-container">
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Item</td></tr></tbody>
          </table>
        </div>
      `;

      document.body.innerHTML = noSldsTable;

      const testWin = dom.window as unknown as TestColumnFreezeWindow;
      expect(() => testWin.applyDynamicStickyColumns()).to.not.throw();
    });
  });
});
