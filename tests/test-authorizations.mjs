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
    // 1. Login as Buyer
    console.log('\n--- 1. Login as Buyer ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.locator('button[type="button"]:has-text("Buyer Portal")').click();
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 2. Verify Sidebar menu has "Authorizations" and NOT "Approvals"
    console.log('\n--- 2. Checking Sidebar Navigation for "Authorizations" ---');
    const authMenuItem = page.locator('nav a:has-text("Authorizations")').first();
    check(await authMenuItem.isVisible(), 'Sidebar menu item "Authorizations" is visible');

    const oldApprovalsItemCount = await page.locator('nav a:has-text("Approvals")').count();
    check(oldApprovalsItemCount === 0, 'Sidebar menu has NO old "Approvals" menu item');

    // 3. Navigate to Authorizations Page
    console.log('\n--- 3. Navigating to Authorizations Page ---');
    await authMenuItem.click();
    await page.waitForTimeout(1000);

    const pageHeading = await page.locator('h1').innerText();
    check(pageHeading.includes('Authorizations'), `Page heading is "${pageHeading}"`);

    // 4. Verify "Submit PO" buttons exist and NO "Approve" button
    console.log('\n--- 4. Checking "Submit PO" Buttons on Authorizations Page ---');
    const allButtons = await page.locator('button').allInnerTexts();
    console.log('All buttons on page:', allButtons);
    const headings = await page.locator('h2').allInnerTexts();
    console.log('H2 headings on page:', headings);
    const submitPoBtn = page.locator('button:has-text("Submit PO")').first();
    check(await submitPoBtn.isVisible(), 'Primary action button is labeled "Submit PO"');

    const oldApproveBtnCount = await page.locator('button:has-text("Approve")').count();
    check(oldApproveBtnCount === 0, 'No buttons labeled with old text "Approve"');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-authorizations-submit-po.png') });

    // 5. Test Review Modal "Submit PO" button
    console.log('\n--- 5. Checking Review Modal "Submit PO" Button ---');
    const reviewBtn = page.locator('button:has-text("Review")').first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      await page.waitForTimeout(500);

      const modalSubmitBtn = page.locator('div[role="dialog"] button:has-text("Submit PO"), .fixed button:has-text("Submit PO")').first();
      check(await modalSubmitBtn.isVisible(), 'Modal primary action button is labeled "Submit PO"');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'verified-modal-submit-po.png') });
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
