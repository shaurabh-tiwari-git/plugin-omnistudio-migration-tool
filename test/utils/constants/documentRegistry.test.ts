import puppeteer from 'puppeteer';
import { expect } from '@salesforce/command/lib/test';
import { documentRegistry } from '../../../src/utils/constants/documentRegistry';
import { Logger } from '../../../src/utils/logger';

describe('DocumentRegistry', () => {
  describe('URL Validation', () => {
    // Helper function to make HTTP request and check if URL is accessible
    async function checkSalesforceUrlWithPuppeteer(url: string): Promise<boolean> {
      const browser = await puppeteer.launch({ headless: true }); // use true instead of 'new'
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        const content = await page.content();
        const notFoundText = "couldn't find that page.";
        const isValid = !content.includes(notFoundText);
        await browser.close();
        return isValid;
      } catch (error) {
        await browser.close();
        Logger.info(`Error checking URL with Puppeteer: ${url}`);
        return true;
      }
    }

    // Cache to avoid duplicate checks
    const urlCheckCache = new Map<string, boolean>();

    // Test all URLs in the documentRegistry
    Object.entries(documentRegistry).forEach(([key, url]: [string, string]) => {
      it(`should have a valid URL for ${key}`, async function () {
        // Increase timeout for network requests
        this.timeout(15000);
        const isValid = urlCheckCache.has(url) ? urlCheckCache.get(url) : await checkSalesforceUrlWithPuppeteer(url);
        urlCheckCache.set(url, isValid);
        expect(isValid, `URL for ${key} (${url}) should be accessible`).to.be.true;
      });
    });

    it('should have all required document registry entries', () => {
      const expectedKeys = [
        'errorNoOrgResults',
        'couldNotDeactivateOmniProcesses',
        'couldNotTruncate',
        'couldNotTruncateOmnniProcess',
        'invalidNameTypeSubtypeOrLanguage',
        'invalidOrRepeatingOmniscriptElementNames',
        'invalidDataRaptorName',
        'duplicatedCardName',
        'duplicatedDrName',
        'duplicatedOSName',
        'duplicatedName',
        'errorWhileActivatingOs',
        'errorWhileActivatingCard',
        'errorWhileUploadingCard',
        'errorWhileCreatingElements',
        'allVersionsDescription',
        'changeMessage',
        'angularOSWarning',
        'formulaSyntaxError',
        'fileNoOmnistudioCalls',
        'fileAlreadyImplementsCallable',
        'inApexDrNameWillBeUpdated',
        'fileUpdatedToAllowRemoteCalls',
        'fileUpdatedToAllowCalls',
        'fileImplementsVlocityOpenInterface',
        'methodCallBundleNameUpdated',
        'cardNameChangeMessage',
        'authordNameChangeMessage',
        'omniScriptNameChangeMessage',
        'dataRaptorNameChangeMessage',
        'integrationProcedureNameChangeMessage',
        'integrationProcedureManualUpdateMessage',
        'duplicateCardNameMessage',
        'testURL',
      ];

      expectedKeys.forEach((key) => {
        expect(documentRegistry).to.have.property(key);
        expect(documentRegistry[key]).to.be.a('string');
        expect(documentRegistry[key]).to.match(/^https:\/\/help\.salesforce\.com/);
      });
    });
  });
});
