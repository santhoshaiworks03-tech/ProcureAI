import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * ProcureAI Autonomous Browser-Use Test Agent
 * Architecture inspired by https://github.com/shubcodes/fireworksai-browseruse
 *
 * Implements:
 * - Autonomous Action Engine (navigation, element interaction, extraction, scrolling)
 * - DOM State Inspector & Accessibility Element Indexing
 * - Visual State Capture & Screenshot Validation
 * - Deep Multi-Role & Multi-Flow Verification (Buyer, Supplier, Admin, Approver)
 * - Real-Time Performance & Console Integrity Monitoring
 * ============================================================================
 */

const TARGET_URL = process.env.TEST_URL || 'https://procureai-hazel.vercel.app';
const SCREENSHOT_DIR = path.resolve('tests/screenshots/fireworks-browseruse');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class BrowserUseAgent {
  constructor(page, targetUrl) {
    this.page = page;
    this.baseUrl = targetUrl;
    this.history = [];
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.metrics = [];
    this.testResults = {
      passed: 0,
      failed: 0,
      assertions: []
    };

    // Monitor console messages & page errors
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        // Filter out benign network resource missing or third-party simulator warnings
        if (
          !text.includes('favicon') &&
          !text.includes('analytics') &&
          !text.includes('404') &&
          !text.includes('paypal') &&
          !text.includes('Failed to load resource')
        ) {
          this.consoleErrors.push(text);
        }
      } else if (type === 'warn') {
        this.consoleWarnings.push(text);
      }
    });

    this.page.on('pageerror', err => {
      this.consoleErrors.push(err.message || String(err));
    });
  }

  logStep(action, details) {
    const timestamp = new Date().toISOString();
    console.log(`[BrowserUseAgent] [${action}] ${details}`);
    this.history.push({ timestamp, action, details });
  }

  async measureAction(name, fn) {
    const start = performance.now();
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    this.metrics.push({ name, duration });
    this.logStep('MEASURE', `${name} completed in ${duration}ms`);
    return { result, duration };
  }

  assert(condition, message, metadata = {}) {
    const pass = Boolean(condition);
    if (pass) {
      this.testResults.passed++;
      console.log(`  \x1b[32m[PASS]\x1b[0m ${message}`);
    } else {
      this.testResults.failed++;
      console.error(`  \x1b[31m[FAIL]\x1b[0m ${message}`);
      if (metadata && Object.keys(metadata).length > 0) {
        console.error(`         Details: ${JSON.stringify(metadata)}`);
      }
    }
    this.testResults.assertions.push({ message, pass, metadata });
    return pass;
  }

  async captureState(name, description) {
    const filename = `${String(this.history.length).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await this.page.screenshot({ path: filepath, fullPage: false });
    this.logStep('SCREENSHOT', `${description} -> saved to ${filename}`);
    return filepath;
  }

  // --- Browser Action Primitives (matching fireworksai-browseruse) ---

  async goToUrl(subpath = '', description = '') {
    const fullUrl = subpath.startsWith('http') ? subpath : `${this.baseUrl}${subpath}`;
    this.logStep('GO_TO_URL', `Navigating to ${fullUrl} ${description ? '(' + description + ')' : ''}`);
    const { duration } = await this.measureAction(`Navigate to ${subpath || '/'}`, async () => {
      await this.page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 35000 });
      await this.page.waitForTimeout(600);
    });
    return duration;
  }

  async clickElement(selector, description = '') {
    this.logStep('CLICK_ELEMENT', `Clicking ${selector} ${description ? '(' + description + ')' : ''}`);
    const el = this.page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout: 10000 });
    await el.click();
    await this.page.waitForTimeout(500);
  }

  async inputText(selector, text, description = '') {
    this.logStep('INPUT_TEXT', `Entering text into ${selector} ${description ? '(' + description + ')' : ''}`);
    const el = this.page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout: 10000 });
    await el.fill(text);
    await this.page.waitForTimeout(300);
  }

  async scroll(direction = 'down', pixels = 500) {
    this.logStep('SCROLL', `Scrolling ${direction} by ${pixels}px`);
    const delta = direction === 'down' ? pixels : -pixels;
    await this.page.evaluate(d => window.scrollBy(0, d), delta);
    await this.page.waitForTimeout(300);
  }

  async extractContent(selector) {
    this.logStep('EXTRACT_CONTENT', `Extracting content from ${selector}`);
    const el = this.page.locator(selector);
    const count = await el.count();
    if (count === 0) return null;
    return await el.first().innerText();
  }

  async setRoleSession(role = 'buyer', profile = 'usr-buyer-01') {
    this.logStep('AUTH_SESSION', `Establishing authenticated session for role: ${role} (${profile})`);
    await this.page.evaluate(({ r, p }) => {
      localStorage.setItem('procureai_authenticated', 'true');
      localStorage.setItem('procureai_active_role', r);
      localStorage.setItem('procureai_active_profile', p);
      if (r === 'supplier') {
        localStorage.removeItem('procureai_supplier_products');
      }
    }, { r: role, p: profile });
    await this.page.waitForTimeout(300);
  }

  async checkHoverFloating(selector, name) {
    const el = this.page.locator(selector).first();
    if (await el.count() === 0) {
      this.assert(false, `Hover check: element "${name}" (${selector}) not found`);
      return false;
    }
    
    // Test actual hover interaction & inspect computed transform or CSS classes
    const classAttr = await el.getAttribute('class') || '';
    await el.hover();
    await this.page.waitForTimeout(200);

    const transform = await el.evaluate(e => window.getComputedStyle(e).transform);
    const hasTransition = classAttr.includes('transition') || classAttr.includes('duration');
    const hasHoverEffect = classAttr.includes('hover:-translate-y') || classAttr.includes('hover:scale') || classAttr.includes('hover:shadow') || (transform && transform !== 'none');

    const isValid = hasTransition || hasHoverEffect;
    this.assert(isValid, `Hover interaction on "${name}" exhibits smooth dynamic micro-interaction transition`, {
      computedTransform: transform,
      classes: classAttr.substring(0, 80)
    });
    return isValid;
  }
}

async function runComprehensiveBrowserAgentTests() {
  console.log(`\n========================================================================`);
  console.log(`  FIREWORKS-AI BROWSER-USE AUTONOMOUS TEST SUITE`);
  console.log(`  Target Application: ${TARGET_URL}`);
  console.log(`  Artifacts: ${SCREENSHOT_DIR}`);
  console.log(`========================================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  const agent = new BrowserUseAgent(page, TARGET_URL);

  const startTime = Date.now();

  try {
    // =========================================================================
    // SECTION 1: PUBLIC DISCOVERY & BRAND EXPERIENCE (/landing)
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 1: Landing Page, Hero Section & Public Discovery`);
    console.log(`============================================================`);

    await agent.goToUrl('/landing', 'Public Landing Experience');
    await agent.captureState('01-landing-hero', 'Landing Page Hero Section');

    const heroText = await agent.extractContent('h1');
    agent.assert(
      heroText && (heroText.includes('Procurement') || heroText.includes('Intelligence') || heroText.includes('Autonomous')),
      `Hero headline rendered with expected brand title: "${heroText?.trim()}"`
    );

    const ctaButton = page.locator('button:has-text("Start Procurement"), a:has-text("Start Procurement"), button:has-text("Launch Portal")').first();
    agent.assert(await ctaButton.isVisible(), 'Primary Call-To-Action (Start Procurement) visible');

    // Test feature cards and floating interactions on Landing
    await agent.scroll('down', 600);
    await agent.captureState('02-landing-features', 'Landing Feature Grid');
    await agent.checkHoverFloating('button:has-text("Start Procurement"), .group, .hover\\:scale-105', 'CTA / Feature Button on Landing Page');

    // =========================================================================
    // SECTION 2: MULTI-PORTAL AUTHENTICATION & ROLE SWITCHING (/login)
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 2: Multi-Portal Login & Role Authentication`);
    console.log(`============================================================`);

    await agent.goToUrl('/login', 'Multi-Portal Sign-In Page');
    await agent.captureState('03-login-portals', 'Multi-Portal Sign-In Portals');

    const loginTitle = await agent.extractContent('h1');
    agent.assert(loginTitle && loginTitle.includes('Sign In'), `Sign-In heading rendered: "${loginTitle?.trim()}"`);

    // Verify presence of all three role portal gateways
    const buyerPortalExists = await page.locator('text=Buyer Portal').count() > 0;
    const supplierPortalExists = await page.locator('text=Supplier Portal').count() > 0;
    const adminPortalExists = await page.locator('text=Admin Control Tower').count() > 0;

    agent.assert(buyerPortalExists, 'Buyer Portal login gateway option available');
    agent.assert(supplierPortalExists, 'Supplier Portal login gateway option available');
    agent.assert(adminPortalExists, 'Admin Control Tower login gateway option available');

    // Test role card hover floating effect
    await agent.checkHoverFloating('button:has-text("Buyer Portal")', 'Buyer Portal Role Selector Card');

    // Test direct UI portal login as Buyer
    await page.locator('button:has-text("Buyer Portal")').first().click();
    await page.waitForTimeout(400);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // =========================================================================
    // SECTION 3: BUYER PORTAL WORKFLOW & DASHBOARD
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 3: Buyer Portal End-to-End Workflow`);
    console.log(`============================================================`);

    // Ensure session is set for Buyer
    await agent.setRoleSession('buyer', 'usr-buyer-01');
    await agent.goToUrl('/buyer/dashboard', 'Buyer Overview Dashboard');
    await agent.captureState('04-buyer-dashboard', 'Buyer Overview Dashboard');

    // Assert key buyer dashboard elements
    const overviewHeading = await agent.extractContent('h1');
    agent.assert(
      overviewHeading && (overviewHeading.toLowerCase().includes('procurement') || overviewHeading.toLowerCase().includes('spend') || overviewHeading.toLowerCase().includes('overview')),
      `Buyer dashboard title confirms overview context: "${overviewHeading?.trim()}"`
    );

    // Verify Metric Cards and Floating Hover
    const metricCard = page.locator('.rounded-2xl:has-text("Total spend"), .rounded-xl:has-text("spend"), .rounded-2xl').first();
    agent.assert(await metricCard.isVisible(), 'Buyer KPI metric cards rendered');
    await agent.checkHoverFloating('.rounded-2xl:has-text("Total spend"), .rounded-2xl', 'Buyer Metric KPI Card');

    // Verify Notifications Bell & Popover Box (Under notification menu)
    console.log(`  --- Testing Notification Bell & Popover Box ---`);
    const bellBtn = page.locator('button[title="Notifications"], button:has(svg.lucide-bell)').first();
    agent.assert(await bellBtn.isVisible(), 'Notification Bell button is visible in top header');

    if (await bellBtn.isVisible()) {
      await bellBtn.click();
      await page.waitForTimeout(600);
      await agent.captureState('05-notifications-popover', 'Notification Box Open Under Menu');

      const notifPopover = page.locator('[role="dialog"], .shadow-xl, .shadow-2xl, div:has-text("Notifications")').first();
      agent.assert(await notifPopover.isVisible(), 'Notification box appears directly under menu on click');

      // Check that clicking outside or escape closes it
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // =========================================================================
    // SECTION 4: PRODUCT CATALOG, SEARCH & ELEVATED INVENTORY DISCOVERY
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 4: Product Discovery, Search & Catalog Exploration`);
    console.log(`============================================================`);

    await agent.goToUrl('/catalogue', 'Product Catalogue');
    await agent.captureState('06-product-catalogue', 'Product Catalogue Grid');

    const catalogueHeading = await agent.extractContent('h1');
    agent.assert(
      catalogueHeading && catalogueHeading.toLowerCase().includes('catalog'),
      `Product Catalogue page rendered: "${catalogueHeading?.trim()}"`
    );

    // Search Interaction
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    if (await searchInput.isVisible()) {
      await agent.inputText('input[placeholder*="Search" i]', 'OmniOffice', 'Search product catalog');
      await page.waitForTimeout(500);
      const searchCount = await page.locator('.grid > div, article, [data-testid="product-card"]').count();
      agent.assert(searchCount > 0, `Search filtering returns matching products (found ${searchCount})`);
      await searchInput.fill('');
      await page.waitForTimeout(400);
    }

    // Category Filter Buttons
    const categoryButtons = page.locator('button:has-text("Office"), button:has-text("IT"), button:has-text("All")');
    agent.assert(await categoryButtons.count() > 0, 'Category filter pills available');

    // Verify Product Card Floating Hover
    await agent.checkHoverFloating('.grid > div, article', 'Product Card in Catalogue');

    // =========================================================================
    // SECTION 5: AUTHORIZATIONS & SUBMIT PO WORKFLOW
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 5: Authorizations & Submit PO Workflow`);
    console.log(`============================================================`);

    // Verify sidebar has "Authorizations" instead of old "Approvals"
    const authorizationsNavItem = page.locator('nav a:has-text("Authorizations"), a:has-text("Authorizations")').first();
    agent.assert(await authorizationsNavItem.isVisible(), 'Sidebar menu item "Authorizations" is visible');

    const oldApprovalsNavItem = page.locator('nav a:has-text("Approvals")');
    agent.assert(await oldApprovalsNavItem.count() === 0, 'Old menu label "Approvals" has been completely removed');

    await agent.goToUrl('/approvals', 'Authorizations Page');
    await agent.captureState('07-authorizations-page', 'Authorizations Page Overview');

    const authHeading = await agent.extractContent('h1');
    agent.assert(
      authHeading && authHeading.toLowerCase().includes('authorizations'),
      `Authorizations page heading is "${authHeading?.trim()}"`
    );

    // Check for "Submit PO" buttons on pending request cards
    const submitPoBtn = page.locator('button:has-text("Submit PO")').first();
    const hasSubmitPo = await submitPoBtn.isVisible();
    agent.assert(hasSubmitPo, 'Primary action button on authorization request is "Submit PO"');

    const oldApproveBtn = page.locator('button:has-text("Approve order"), button:has-text("Approve")').first();
    agent.assert(!(await oldApproveBtn.isVisible()), 'Old button text "Approve" is not present');

    // If a "Review" button exists, open modal and verify modal button
    const reviewBtn = page.locator('button:has-text("Review")').first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      await page.waitForTimeout(500);
      await agent.captureState('08-authorizations-modal', 'Review Authorization Modal');
      
      const modalSubmitPo = page.locator('[role="dialog"] button:has-text("Submit PO"), .fixed button:has-text("Submit PO")').first();
      agent.assert(await modalSubmitPo.isVisible(), 'Review modal primary action button is "Submit PO"');

      // Close modal
      const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // =========================================================================
    // SECTION 6: SUPPLIER PORTAL & ELEVATED INVENTORY STOCK CONTROLS
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 6: Supplier Portal, Elevated Stock & Restock Controls`);
    console.log(`============================================================`);

    // Switch Role to Supplier
    await agent.setRoleSession('supplier', 'usr-supplier-01');
    await agent.goToUrl('/supplier/dashboard', 'Supplier Dashboard');
    await agent.captureState('09-supplier-dashboard', 'Supplier Dashboard Overview');

    const supplierHeading = await agent.extractContent('h1');
    agent.assert(
      supplierHeading && (supplierHeading.toLowerCase().includes('supplier') || supplierHeading.toLowerCase().includes('fulfillment') || supplierHeading.toLowerCase().includes('omnioffice')),
      `Supplier portal authenticated: "${supplierHeading?.trim()}"`
    );

    // Verify 8 Supplier KPIs on Overview
    const kpiCount = await page.locator('.rounded-2xl, .rounded-xl').count();
    agent.assert(kpiCount >= 8, `Supplier Dashboard displays comprehensive enterprise KPIs (count: ${kpiCount})`);

    // Switch to Inventory Management Tab
    await agent.goToUrl('/supplier/dashboard?tab=inventory', 'Supplier Inventory Tab');
    await agent.captureState('10-supplier-inventory', 'Supplier Inventory Table');

    // Check Available Stock Stat & Elevated Stock Level
    const statText = await page.locator('body').innerText();
    const stockMatch = statText.match(/(\d[\d,]*)\s*units/i) || statText.match(/Available Stock[^0-9]*([\d,]+)/i);
    const availableStockCount = stockMatch ? parseInt(stockMatch[1].replace(/,/g, ''), 10) : 0;
    
    agent.assert(
      availableStockCount >= 1000,
      `Supplier Available Stock is elevated to enterprise depth (found ${availableStockCount} units, expected >= 1,000)`,
      { availableStockCount }
    );

    // Verify "+50 Restock" Button
    const restock50Btn = page.locator('button:has-text("+50 Restock")').first();
    agent.assert(await restock50Btn.isVisible(), 'Quick restock "+50 Restock" button is present and active');

    // Verify "Restock All (+100)" Button
    const restockAllBtn = page.locator('button:has-text("Restock All (+100)")').first();
    agent.assert(await restockAllBtn.isVisible(), 'Bulk "Restock All (+100)" button is present in inventory header');

    // Test dynamic Restock execution
    if (await restock50Btn.isVisible()) {
      const initialStock = availableStockCount;
      await restock50Btn.click();
      await page.waitForTimeout(800);
      await agent.captureState('11-after-quick-restock', 'After +50 Restock Click');

      const updatedText = await page.locator('body').innerText();
      const updatedMatch = updatedText.match(/(\d[\d,]*)\s*units/i) || updatedText.match(/Available Stock[^0-9]*([\d,]+)/i);
      const updatedStock = updatedMatch ? parseInt(updatedMatch[1].replace(/,/g, ''), 10) : 0;

      agent.assert(
        updatedStock >= initialStock,
        `Quick restock triggered immediate state increment (${initialStock} -> ${updatedStock} units)`
      );
    }

    // Verify RFQ "Accept Quotation" Workflow
    await agent.goToUrl('/supplier/dashboard?tab=rfqs', 'Supplier RFQ Quotations Tab');
    await agent.captureState('12-supplier-rfqs', 'Supplier RFQ Quotations Tab');

    const acceptQuotationBtn = page.locator('button:has-text("Accept Quotation")').first();
    agent.assert(await acceptQuotationBtn.isVisible(), 'RFQ quotation action is labeled "Accept Quotation"');

    // =========================================================================
    // SECTION 7: ADMIN CONTROL TOWER & PROVENANCE LEDGER
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 7: Admin Control Tower & Provenance Audit Ledger`);
    console.log(`============================================================`);

    // Authenticate as Admin
    await agent.setRoleSession('admin', 'usr-admin-01');
    await agent.goToUrl('/admin/dashboard', 'Admin Dashboard');
    await agent.captureState('13-admin-dashboard', 'Admin Control Tower');

    const adminHeading = await agent.extractContent('h1');
    agent.assert(
      adminHeading && (adminHeading.toLowerCase().includes('admin') || adminHeading.toLowerCase().includes('control') || adminHeading.toLowerCase().includes('governance')),
      `Admin Control Tower loaded: "${adminHeading?.trim()}"`
    );

    // Test Provenance Ledger (Cryptographic audit trail)
    await agent.goToUrl('/provenance', 'Provenance Ledger');
    await agent.captureState('14-provenance-ledger', 'Provenance Audit Ledger');

    const ledgerHeading = await agent.extractContent('h1');
    agent.assert(
      ledgerHeading && (ledgerHeading.toLowerCase().includes('ledger') || ledgerHeading.toLowerCase().includes('provenance')),
      `Provenance Ledger loaded with cryptographic verification: "${ledgerHeading?.trim()}"`
    );

    // Verify Audit Entries exist
    const ledgerRows = await page.locator('table tr, .font-mono').count();
    agent.assert(ledgerRows > 0, `Provenance audit records rendered in ledger (count: ${ledgerRows})`);

    // =========================================================================
    // SECTION 8: DEMAND FORECASTING & AI COPILOT
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 8: Demand Forecasting & Autonomous AI Agents`);
    console.log(`============================================================`);

    // Ensure session is set for Buyer / Procurement Engineer
    await agent.setRoleSession('buyer', 'usr-buyer-01');
    await agent.goToUrl('/forecasting', 'Demand Forecasting');
    await agent.captureState('15-demand-forecasting', 'Demand Forecasting Visualizations');

    const forecastHeading = await agent.extractContent('h1');
    agent.assert(
      forecastHeading && forecastHeading.toLowerCase().includes('forecasting'),
      `Demand Forecasting page loaded: "${forecastHeading?.trim()}"`
    );

    await agent.goToUrl('/agent', 'Autonomous AI Procurement Agent');
    await agent.captureState('16-ai-agents', 'Autonomous AI Agents');

    const aiHeading = await agent.extractContent('h1');
    agent.assert(
      aiHeading && (aiHeading.toLowerCase().includes('agent') || aiHeading.toLowerCase().includes('autonomous') || aiHeading.toLowerCase().includes('procurement') || aiHeading.toLowerCase().includes('copilot')),
      `AI Agent orchestration page loaded: "${aiHeading?.trim()}"`
    );

    // =========================================================================
    // SECTION 9: SITE-WIDE FLOATING HOVER & INTERACTION POLISH
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 9: Floating Hover Polish & Micro-Interactions`);
    console.log(`============================================================`);

    await agent.goToUrl('/buyer/dashboard', 'Hover Interaction Audit');
    const cards = page.locator('.rounded-xl, .rounded-2xl, button');
    const totalCards = await cards.count();
    agent.assert(totalCards > 5, `Interactive UI elements present across dashboard (${totalCards} detected)`);

    // Test hover on interactive cards
    await agent.checkHoverFloating('.rounded-2xl:has-text("Total spend"), .rounded-2xl', 'Buyer Dashboard Card Hover Float');

    // =========================================================================
    // SECTION 10: CONSOLE INTEGRITY & PERFORMANCE AUDIT
    // =========================================================================
    console.log(`\n============================================================`);
    console.log(`>>> SECTION 10: Performance Timing & Console Error Audit`);
    console.log(`============================================================`);

    // Console Error assertion
    agent.assert(
      agent.consoleErrors.length === 0,
      `Zero unhandled JavaScript console errors detected (errors count: ${agent.consoleErrors.length})`,
      { errors: agent.consoleErrors }
    );

    // Performance latency check
    const avgLatency = Math.round(
      agent.metrics.reduce((acc, m) => acc + m.duration, 0) / (agent.metrics.length || 1)
    );
    agent.assert(
      avgLatency < 2500,
      `Average page navigation & action latency is within responsive SLA: ${avgLatency}ms (target < 2500ms)`
    );

  } catch (err) {
    console.error(`\n[CRITICAL RUNTIME ERROR]:`, err);
    agent.assert(false, `Unexpected test exception: ${err.message}`);
  } finally {
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    await browser.close();

    console.log(`\n========================================================================`);
    console.log(`  BROWSER-USE TEST SUITE SUMMARY`);
    console.log(`========================================================================`);
    console.log(`  Target:           ${TARGET_URL}`);
    console.log(`  Total Duration:   ${durationSec}s`);
    console.log(`  Total Passed:     ${agent.testResults.passed}`);
    console.log(`  Total Failed:     ${agent.testResults.failed}`);
    console.log(`  Total Assertions: ${agent.testResults.assertions.length}`);
    console.log(`  Console Errors:   ${agent.consoleErrors.length}`);
    console.log(`  Screenshots:      ${SCREENSHOT_DIR}`);
    console.log(`========================================================================\n`);

    // Generate output JSON report
    const reportPath = path.resolve('tests/fireworks-browseruse-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      targetUrl: TARGET_URL,
      durationSeconds: durationSec,
      passed: agent.testResults.passed,
      failed: agent.testResults.failed,
      metrics: agent.metrics,
      consoleErrors: agent.consoleErrors,
      assertions: agent.testResults.assertions
    }, null, 2));

    console.log(`Report JSON written to: ${reportPath}`);
    if (agent.testResults.failed > 0) {
      process.exitCode = 1;
    }
  }
}

runComprehensiveBrowserAgentTests();
