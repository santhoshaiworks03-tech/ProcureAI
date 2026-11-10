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
  const previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4174', '--strictPort'], {
    shell: true,
    stdio: 'inherit'
  });

  // Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://localhost:4174');
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!serverReady) {
    throw new Error('Vite preview server failed to start on port 4174');
  }

  const TARGET_URL = 'http://localhost:4174';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;
  function check(cond, msg) {
    if (cond) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. TEST BUYER ROLE NOTIFICATIONS
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Buyer Notifications Box ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button:has-text("1-Click: Priya Sharma")').click();
    await page.waitForTimeout(1500);

    // Verify "Notifications" is NOT in the sidebar
    const buyerSidebarNotif = await page.locator('nav a:has-text("Notifications")').count();
    check(buyerSidebarNotif === 0, 'Buyer sidebar has NO separate Notifications menu item');

    // Click Notification Bell in the header
    const bellBtn = page.locator('button[title="Notifications"]').first();
    check(await bellBtn.isVisible(), 'Notification Bell button is visible in top header');
    await bellBtn.click();
    await page.waitForTimeout(500);

    // Verify Dropdown Box opened under bell
    const notifBox = page.locator('text=Notifications').first();
    check(await notifBox.isVisible(), 'Notification box opened directly under bell');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer-notification-box-open.png') });

    // Verify notifications exist and click one
    const firstNotif = page.locator('text=Payment Completed via PayPal').first();
    check(await firstNotif.isVisible(), 'Notification "Payment Completed via PayPal" is visible in box');

    await firstNotif.click();
    await page.waitForTimeout(1000);

    // Verify directed to respective process (/payments)
    const currentUrl = page.url();
    check(currentUrl.includes('/payments') || currentUrl.includes('/orders'), `Directed to respective operation: ${currentUrl}`);

    // Reopen bell to verify it was marked as read
    await page.locator('button[title="Notifications"]').first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer-notification-marked-read.png') });

    // -------------------------------------------------------------
    // 2. TEST SUPPLIER ROLE NOTIFICATIONS
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Supplier Notifications Box ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button:has-text("1-Click: Vikramaditya")').click();
    await page.waitForTimeout(1500);

    // Verify "Notifications" is NOT in the supplier sidebar
    const supplierSidebarNotif = await page.locator('nav a:has-text("Notifications")').count();
    check(supplierSidebarNotif === 0, 'Supplier sidebar has NO separate Notifications menu item');

    // Click Notification Bell
    await page.locator('button[title="Notifications"]').first().click();
    await page.waitForTimeout(500);

    const supNotif = page.locator('text=New RFQ Received from Apex Tech').first();
    check(await supNotif.isVisible(), 'Supplier RFQ notification visible in box');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'supplier-notification-box.png') });

    // Click RFQ notification
    await supNotif.click();
    await page.waitForTimeout(1000);

    const supplierUrl = page.url();
    check(supplierUrl.includes('/supplier/dashboard?tab=rfqs'), `Supplier directed to RFQ operation: ${supplierUrl}`);

    // -------------------------------------------------------------
    // 3. TEST ADMIN ROLE NOTIFICATIONS
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Admin Notifications Box ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('button:has-text("1-Click: Aditi Deshmukh")').click();
    await page.waitForTimeout(1500);

    const adminSidebarNotif = await page.locator('nav a:has-text("Notifications")').count();
    check(adminSidebarNotif === 0, 'Admin sidebar has NO separate Notifications menu item');

    // Click Notification Bell
    await page.locator('button[title="Notifications"]').first().click();
    await page.waitForTimeout(500);

    const adminNotif = page.locator('text=Supplier KYC Review Pending').first();
    check(await adminNotif.isVisible(), 'Admin KYC notification visible in box');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-notification-box.png') });

    // Click KYC notification
    await adminNotif.click();
    await page.waitForTimeout(1000);

    const adminUrl = page.url();
    check(adminUrl.includes('/admin/dashboard?tab=verifications'), `Admin directed to KYC verification operation: ${adminUrl}`);

    console.log(`\n======================================================`);
    console.log(`  Notification Box Tests: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    await browser.close();
    previewProcess.kill();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
