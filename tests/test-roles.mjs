import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve('tests/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('--- Starting Vite Preview Server ---');
  const previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    stdio: 'inherit'
  });

  // Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://localhost:4173');
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!serverReady) {
    throw new Error('Vite preview server failed to start on port 4173');
  }

  const TARGET_URL = 'http://localhost:4173';
  console.log(`Target: ${TARGET_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;
  function check(cond, msg) {
    if (cond) {
      console.log(` [PASS] ${msg}`);
      passed++;
    } else {
      console.error(` [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Visit Login Page
    console.log('\n--- 1. Testing Login Page & Role Portals ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const title = await page.locator('h1').innerText();
    check(title.includes('Sign In to Your ProcureAI Portal'), 'Login page heading verified');

    // 2. Test Buyer Login & Routing to /buyer/dashboard
    console.log('\n--- 2. Testing Buyer Login -> /buyer/dashboard ---');
    await page.locator('button[type="button"]:has-text("Buyer Portal")').click();
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const buyerUrl = page.url();
    check(buyerUrl.includes('/buyer/dashboard') || buyerUrl.includes('/dashboard'), `Buyer navigated to dashboard route: ${buyerUrl}`);
    const buyerHeading = await page.locator('h1').innerText();
    check(buyerHeading.includes('Procurement Overview') || buyerHeading.includes('Spend Overview'), `Buyer dashboard rendered: "${buyerHeading}"`);

    // Verify Buyer cannot access /supplier/dashboard
    console.log('\n--- 3. Testing Buyer Route Guard against /supplier/dashboard ---');
    await page.goto(`${TARGET_URL}/supplier/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const buyerForbidden = await page.locator('text=403 FORBIDDEN').isVisible();
    check(buyerForbidden, 'Buyer accessing /supplier/dashboard is blocked by 403 Forbidden Access Guard');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'role-guard-buyer-blocked-supplier.png') });

    // 4. Test Supplier Login & Routing to /supplier/dashboard
    console.log('\n--- 4. Testing Supplier Login -> /supplier/dashboard ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button[type="button"]:has-text("Supplier Portal")').click();
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const supplierUrl = page.url();
    check(supplierUrl.includes('/supplier/dashboard'), `Supplier navigated to supplier dashboard: ${supplierUrl}`);
    const supplierHeading = await page.locator('h1').innerText();
    check(supplierHeading.includes('Supplier Fulfillment Hub') || supplierHeading.includes('OmniOffice Direct'), `Supplier dashboard title: "${supplierHeading}"`);

    // Verify 8 Supplier KPIs on Overview
    check(await page.locator('text=Total Active Products').first().isVisible(), 'Supplier KPI 1: Total Active Products visible on Overview');
    check(await page.locator('text=Active Product Listings').first().isVisible(), 'Supplier KPI 2: Active Product Listings visible on Overview');
    check(await page.locator('text=Pending RFQs').first().isVisible(), 'Supplier KPI 3: Pending RFQs visible on Overview');
    check(await page.locator('text=Quotations Submitted').first().isVisible(), 'Supplier KPI 4: Quotations Submitted visible on Overview');
    check(await page.locator('text=Incoming Purchase Orders').first().isVisible(), 'Supplier KPI 5: Incoming Purchase Orders visible on Overview');
    check(await page.locator('text=Orders Awaiting Dispatch').first().isVisible(), 'Supplier KPI 6: Orders Awaiting Dispatch visible on Overview');
    check(await page.locator('text=Completed Orders').first().isVisible(), 'Supplier KPI 7: Completed Orders visible on Overview');
    check(await page.locator('text=Total Sales Revenue').first().isVisible(), 'Supplier KPI 8: Total Sales Revenue visible on Overview');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-supplier-dashboard.png') });

    // Verify Business Profile tab: has heading alone, NO horizontal tab bar, NO 8 KPI cards
    console.log('\n--- 4B. Testing Supplier Business Profile Menu (Heading Alone & No 8 KPIs) ---');
    await page.goto(`${TARGET_URL}/supplier/dashboard?tab=profile`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const profileHeading = await page.locator('h1').innerText();
    check(profileHeading === 'Business Profile', `Profile menu shows heading alone: "${profileHeading}"`);
    const kpiOnProfile = await page.locator('text=Total Active Products').isVisible();
    check(!kpiOnProfile, '8 KPI cards are HIDDEN on Business Profile menu (shown only to overview alone)');
    check(await page.locator('text=Business Legal Entity Profile').isVisible(), 'Business Profile content rendered');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-supplier-profile-heading-alone.png') });

    // Verify RFQ Management tab: has heading alone, NO 8 KPI cards
    console.log('\n--- 4C. Testing Supplier RFQ Management Menu (Heading Alone & No 8 KPIs) ---');
    await page.goto(`${TARGET_URL}/supplier/dashboard?tab=rfqs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const rfqHeading = await page.locator('h1').innerText();
    check(rfqHeading === 'RFQ Management', `RFQ menu shows heading alone: "${rfqHeading}"`);
    const kpiOnRfq = await page.locator('text=Total Active Products').isVisible();
    check(!kpiOnRfq, '8 KPI cards are HIDDEN on RFQ Management menu');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-supplier-rfqs-heading-alone.png') });

    // Verify Supplier cannot access /buyer/dashboard or /approvals
    console.log('\n--- 5. Testing Supplier Route Guard against /buyer/dashboard and /approvals ---');
    await page.goto(`${TARGET_URL}/buyer/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const supplierForbiddenBuyer = await page.locator('text=403 FORBIDDEN').isVisible();
    check(supplierForbiddenBuyer, 'Supplier accessing /buyer/dashboard is blocked by 403 Forbidden Guard');

    await page.goto(`${TARGET_URL}/approvals`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const supplierForbiddenApprovals = await page.locator('text=403 FORBIDDEN').isVisible();
    check(supplierForbiddenApprovals, 'Supplier accessing /approvals is blocked by 403 Forbidden Guard');

    // 6. Test Admin Login & Routing to /admin/dashboard
    console.log('\n--- 6. Testing Admin Login -> /admin/dashboard ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button[type="button"]:has-text("Admin Control Tower")').click();
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const adminUrl = page.url();
    check(adminUrl.includes('/admin/dashboard'), `Admin navigated to admin dashboard: ${adminUrl}`);
    const adminHeading = await page.locator('h1').innerText();
    check(adminHeading.includes('Operations & Governance') || adminHeading.includes('Admin Control Tower'), `Admin control tower title: "${adminHeading}"`);

    // Verify Admin Platform KPIs and KYC
    check(await page.locator('text=Platform GMV').first().isVisible(), 'Admin KPI: Platform GMV visible');
    check(await page.locator('text=Supplier legal verification & KYC queue').first().isVisible(), 'Admin: Supplier KYC Queue visible');
    check(await page.locator('text=Platform User Directory & Role Governance').first().isVisible(), 'Admin: User Directory visible');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-admin-dashboard.png') });

    console.log(`\n======================================================`);
    console.log(`  Tests Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
    previewProcess.kill();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
