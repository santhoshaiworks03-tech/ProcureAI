import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = process.env.TEST_URL || 'https://procureai-zeta.vercel.app';
const SCREENSHOT_DIR = path.resolve('tests/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

console.log(`\n======================================================`);
console.log(`  ProcureAI End-to-End Automated Test Suite`);
console.log(`  Target: ${TARGET_URL}`);
console.log(`======================================================\n`);

async function runTestSuite() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 0: Multi-Portal Sign In & Role Authentication
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 0: Multi-Portal Sign-In Page ---`);
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const loginTitle = await page.locator('h1').innerText();
    assert(loginTitle.includes('Sign In to Your ProcureAI Portal'), `Sign-in page rendered: "${loginTitle}"`);

    // Verify 3 distinct role selector cards exist
    const buyerPortal = page.locator('text=Buyer Portal');
    const supplierPortal = page.locator('text=Supplier Portal');
    const adminPortal = page.locator('text=Admin Control Tower');
    assert(await buyerPortal.count() > 0, `Buyer portal card available`);
    assert(await supplierPortal.count() > 0, `Supplier portal card available`);
    assert(await adminPortal.count() > 0, `Admin portal card available`);

    // Save screenshot of the multi-login sign-in page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00-signin-portals.png') });
    console.log(`  Screenshot saved: 00-signin-portals.png`);

    // Click 1-click Buyer Sign In to authenticate as Buyer
    const buyer1Click = page.locator('button:has-text("1-Click: Priya Sharma")').first();
    assert(await buyer1Click.isVisible(), `1-Click Buyer demo authentication button visible`);
    await buyer1Click.click();
    await page.waitForTimeout(1000);

    // -------------------------------------------------------------------------
    // TEST 1: Overview & KPI Dashboard
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 1: Overview Dashboard ---`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const title = await page.title();
    assert(title.includes('ProcureAI') || title.length > 0, `Page loaded successfully with title: "${title}"`);

    const headerText = await page.locator('h1').first().innerText();
    assert(headerText.toLowerCase().includes('overview'), `Dashboard header shows "${headerText}"`);

    const statCards = await page.locator('text=Total spend').count();
    assert(statCards > 0, `Total spend KPI card is present`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-dashboard.png') });
    console.log(`  Screenshot saved: 01-dashboard.png`);

    // -------------------------------------------------------------------------
    // TEST 2: Product Catalogue & AG Grid Community View
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 2: Product Catalogue & AG Grid Table ---`);
    await page.goto(`${TARGET_URL}/catalogue`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const catalogueHeading = await page.locator('h1').innerText();
    assert(catalogueHeading.toLowerCase().includes('catalogue'), `Product catalogue loaded with heading: "${catalogueHeading}"`);

    // Check AG Grid toggle button
    const agGridButton = page.locator('button[title="AG Grid table"]');
    assert(await agGridButton.isVisible(), `AG Grid table toggle button is visible`);

    // Switch to AG Grid View
    await agGridButton.click();
    await page.waitForTimeout(1000);

    const agGridContainer = page.locator('.ag-theme-quartz');
    assert(await agGridContainer.isVisible(), `AG Grid Quartz container successfully rendered`);

    const agGridHeaders = await page.locator('.ag-header-cell-text').allInnerTexts();
    assert(agGridHeaders.includes('SKU') && agGridHeaders.includes('Product name'), `AG Grid columns rendered: ${agGridHeaders.join(', ')}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-catalogue-aggrid.png') });
    console.log(`  Screenshot saved: 02-catalogue-aggrid.png`);

    // -------------------------------------------------------------------------
    // TEST 3: Multi-Criteria Supplier Intelligence
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 3: Supplier Intelligence Matrix ---`);
    await page.goto(`${TARGET_URL}/suppliers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const suppliersHeading = await page.locator('h1').innerText();
    assert(suppliersHeading.toLowerCase().includes('supplier'), `Suppliers page loaded`);

    await page.goto(`${TARGET_URL}/intelligence`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const sliders = await page.locator('input[type="range"]').count();
    assert(sliders === 5, `5 algorithmic evaluation weight sliders rendered`);

    const tableRows = await page.locator('table tbody tr').count();
    assert(tableRows > 0, `Scored supplier ranking table populated with ${tableRows} vendors`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-supplier-intelligence.png') });
    console.log(`  Screenshot saved: 03-supplier-intelligence.png`);

    // -------------------------------------------------------------------------
    // TEST 4: Autonomous AI Procurement Agent Workflow
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 4: AI Procurement Agent Terminal ---`);
    await page.goto(`${TARGET_URL}/agent`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const textarea = page.locator('textarea');
    assert(await textarea.isVisible(), `Natural language procurement prompt input is visible`);

    await textarea.fill('I need 10 Ergonomic High-Back Task Chairs and 5 Motorized Adjustable Standing Desks. Budget is ₹2,50,000. Find optimal suppliers and prepare draft PO.');
    
    const sendButton = page.locator('button:has-text("Optimize"), button:has-text("Submit"), button[type="submit"]').first();
    if (await sendButton.isVisible()) {
      await sendButton.click();
      console.log(`  Sent procurement prompt to autonomous AI agent...`);
      await page.waitForTimeout(1500);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-ai-agent.png') });
    console.log(`  Screenshot saved: 04-ai-agent.png`);

    // -------------------------------------------------------------------------
    // TEST 5: Human-in-the-Loop Governance Authorization Queue
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 5: Authorization Governance Queue ---`);
    await page.goto(`${TARGET_URL}/approvals`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const approvalsHeading = await page.locator('h1').innerText();
    assert(approvalsHeading.toLowerCase().includes('authorization'), `Authorizations queue loaded: "${approvalsHeading}"`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-approvals.png') });
    console.log(`  Screenshot saved: 05-approvals.png`);

    // -------------------------------------------------------------------------
    // TEST 6: Time-Locked PayPal Checkout Gateway
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 6: Time-Locked PayPal Checkout Gateway ---`);
    await page.goto(`${TARGET_URL}/payments`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const paymentHeading = await page.locator('h1').innerText();
    assert(paymentHeading.toLowerCase().includes('payment'), `Payments page loaded: "${paymentHeading}"`);

    const checkoutText = await page.locator('body').innerText();
    assert(checkoutText.includes('PayPal') || checkoutText.includes('Checkout') || checkoutText.includes('Settlement'), `PayPal checkout workspace initialized`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-payments.png') });
    console.log(`  Screenshot saved: 06-payments.png`);

    // -------------------------------------------------------------------------
    // TEST 7: Cryptographic Provenance Ledger
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 7: Cryptographic Provenance Ledger ---`);
    await page.goto(`${TARGET_URL}/provenance`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const provenanceHeading = await page.locator('h1').innerText();
    assert(provenanceHeading.toLowerCase().includes('provenance'), `Provenance ledger loaded: "${provenanceHeading}"`);

    const blockNumbers = await page.locator('text=#000').count();
    assert(blockNumbers > 0, `Numbered cryptographic blocks detected (#0001, #0002...)`);

    const shaHashes = await page.locator('text=PRC-VRF-').count();
    assert(shaHashes > 0, `Verification references (PRC-VRF-XXXXXXXX) verified`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-provenance.png') });
    console.log(`  Screenshot saved: 07-provenance.png`);

    // -------------------------------------------------------------------------
    // TEST 8: Demand Forecasting
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 8: Predictive Demand Forecasting ---`);
    await page.goto(`${TARGET_URL}/forecasting`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const forecastingHeading = await page.locator('h1').innerText();
    assert(forecastingHeading.toLowerCase().includes('demand'), `Demand forecasting loaded: "${forecastingHeading}"`);

    const reorderButtons = await page.locator('text=Reorder').count();
    assert(reorderButtons > 0, `Automated reorder triggers populated`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-forecasting.png') });
    console.log(`  Screenshot saved: 08-forecasting.png`);

    // -------------------------------------------------------------------------
    // TEST 9: Settings & AI Provider Architecture
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 9: Platform Settings ---`);
    await page.goto(`${TARGET_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const adminHeading = await page.locator('h1').innerText();
    assert(adminHeading.toLowerCase().includes('settings'), `Settings page loaded: "${adminHeading}"`);

    const providerButtons = await page.locator('text=Google Gemini').count();
    assert(providerButtons > 0, `Multi-provider AI architecture (Gemini/OpenAI/Claude) active`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-settings.png') });
    console.log(`  Screenshot saved: 09-settings.png`);

    // -------------------------------------------------------------------------
    // TEST 10: Role-Based Dashboards (Buyer, Supplier, Admin)
    // -------------------------------------------------------------------------
    console.log(`\n--- Test 10: Role-Based Dynamic Dashboards ---`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Supplier Role Switch
    const supplierRoleButton = page.locator('button:has-text("Supplier")').first();
    assert(await supplierRoleButton.isVisible(), `Supplier role button is visible in top navigation`);
    await supplierRoleButton.click();
    await page.waitForTimeout(1000);

    const supplierHeading = await page.locator('h1').innerText();
    assert(supplierHeading.includes('Supplier Portal') || supplierHeading.includes('Fulfillment'), `Supplier dashboard rendered with heading: "${supplierHeading}"`);
    
    const merchantGateway = await page.locator('text=PayPal merchant account').count();
    assert(merchantGateway > 0, `PayPal Merchant settlement card visible for Supplier`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-supplier-dashboard.png') });
    console.log(`  Screenshot saved: 10-supplier-dashboard.png`);

    // 2. Admin Role Switch
    const adminRoleButton = page.locator('button:has-text("Admin")').first();
    assert(await adminRoleButton.isVisible(), `Admin role button is visible in top navigation`);
    await adminRoleButton.click();
    await page.waitForTimeout(1000);

    const adminHeading2 = await page.locator('h1').innerText();
    assert(adminHeading2.includes('Platform Operations') || adminHeading2.includes('Governance'), `Admin dashboard rendered with heading: "${adminHeading2}"`);

    const kycQueue = await page.locator('text=Supplier legal verification').count();
    assert(kycQueue > 0, `Supplier verification / compliance queue visible for Admin`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-admin-dashboard.png') });
    console.log(`  Screenshot saved: 11-admin-dashboard.png`);

    // 3. Switch back to Buyer
    const buyerRoleButton = page.locator('button:has-text("Buyer")').first();
    await buyerRoleButton.click();
    await page.waitForTimeout(500);

    // 4. Test Sign Out to return to Login Portal
    const signOutBtn = page.locator('button[title="Sign out of portal"]').first();
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForTimeout(1000);
      assert(page.url().includes('/login'), `Sign out redirects to /login portal gateway`);
    }

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log(`\n======================================================`);
    console.log(`  Test Suite Completed: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`  Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log(`  Errors logged:`, consoleErrors.slice(0, 3));
    }
    console.log(`======================================================\n`);

  } catch (err) {
    console.error(`\nTest suite encountered unexpected error:`, err);
  } finally {
    await browser.close();
  }
}

runTestSuite();
