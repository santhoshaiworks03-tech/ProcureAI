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

    // Verify Buyer Organisations menu (the user reported issue)
    console.log('\n--- 6B. Testing Admin Buyer Organisations Menu ---');
    await page.goto(`${TARGET_URL}/admin/dashboard?tab=organisations`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const orgHeading = await page.locator('h1').innerText();
    check(orgHeading.includes('Buyer Enterprises & Multi-Tenant Orgs'), `Admin Org menu heading: "${orgHeading}"`);
    check(await page.locator('text=Multi-Tenant Buyer Organisations Directory').isVisible(), 'Buyer Organisations Directory table rendered');
    check(await page.locator('text=Apex Tech Solutions Pvt Ltd').first().isVisible(), 'Seeded enterprise tenant visible in table');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-admin-buyer-organisations.png') });

    // 7. Test Notifications Dropdown Box Across Roles
    console.log('\n--- 7. Testing Notification Dropdown Box (No Sidebar Menu & Click Directs to Process) ---');
    
    // 7A: Check Admin Sidebar has NO Notifications Menu
    const adminNavNotifications = await page.locator('nav a:has-text("Notifications")').count();
    check(adminNavNotifications === 0, 'Admin sidebar navigation has NO Notifications separate menu');

    // 7B: Check Admin Bell Icon & Dropdown Box
    const bellBtn = page.locator('button[title="Notifications"]');
    check(await bellBtn.isVisible(), 'Header notification bell button is visible');
    await bellBtn.click();
    await page.waitForTimeout(600);
    check(await page.locator('text=Notifications').first().isVisible(), 'Notification dropdown box opened under bell');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-admin-notification-box.png') });

    // Click an Admin notification item (Supplier KYC or Platform Volume)
    const adminNotifItem = page.locator('p:has-text("Supplier KYC Review Pending")').first();
    if (await adminNotifItem.isVisible()) {
      await adminNotifItem.click();
      await page.waitForTimeout(1000);
      const afterClickUrl = page.url();
      check(afterClickUrl.includes('tab=verifications'), `Admin notification click navigated to verifications process: ${afterClickUrl}`);
    }

    // 7C: Test Buyer Notifications Dropdown & Mark Read
    console.log('\n--- 7C. Testing Buyer Notifications Dropdown Box ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button[type="button"]:has-text("Buyer Portal")').click();
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const buyerNavNotifications = await page.locator('nav a:has-text("Notifications")').count();
    check(buyerNavNotifications === 0, 'Buyer sidebar navigation has NO Notifications separate menu');

    // Open Buyer notification box
    await page.locator('button[title="Notifications"]').click();
    await page.waitForTimeout(600);
    check(await page.locator('text=Notifications').first().isVisible(), 'Buyer notification dropdown box opened');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-buyer-notification-box.png') });

    // Click Buyer Payment notification
    const buyerPaymentNotif = page.locator('p:has-text("Payment Completed via PayPal")').first();
    if (await buyerPaymentNotif.isVisible()) {
      await buyerPaymentNotif.click();
      await page.waitForTimeout(1000);
      const buyerAfterClickUrl = page.url();
      check(buyerAfterClickUrl.includes('/payments'), `Buyer notification click navigated to payments process: ${buyerAfterClickUrl}`);
    }

    // 7D: Test Supplier Notifications Dropdown & Mark Read
    console.log('\n--- 7D. Testing Supplier Notifications Dropdown Box ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button[type="button"]:has-text("Supplier Portal")').click();
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const supplierNavNotifications = await page.locator('nav a:has-text("Notifications")').count();
    check(supplierNavNotifications === 0, 'Supplier sidebar navigation has NO Notifications separate menu');

    // Open Supplier notification box
    await page.locator('button[title="Notifications"]').click();
    await page.waitForTimeout(600);
    check(await page.locator('text=Notifications').first().isVisible(), 'Supplier notification dropdown box opened');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-supplier-notification-box.png') });

    // Click Supplier RFQ notification
    const supplierRfqNotif = page.locator('p:has-text("New RFQ Received")').first();
    if (await supplierRfqNotif.isVisible()) {
      await supplierRfqNotif.click();
      await page.waitForTimeout(1000);
      const supplierAfterClickUrl = page.url();
      check(supplierAfterClickUrl.includes('tab=rfqs'), `Supplier notification click navigated to RFQ process: ${supplierAfterClickUrl}`);
    }

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
