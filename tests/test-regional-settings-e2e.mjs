// tests/test-regional-settings-e2e.mjs
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
  const previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1', '--strictPort'], {
    shell: true,
    stdio: 'inherit'
  });

  // Wait for server
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4173');
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (err) {
      console.log(`[Attempt ${i+1}] connection pending: ${err.message}`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!serverReady) {
    throw new Error('Vite preview server failed to start on port 4173');
  }

  console.log('Target: http://127.0.0.1:4173');

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
    // 1. Log in as Root Administrator
    console.log('\n--- Step 1: Login as Admin & Navigate to Regional Settings ---');
    await page.goto('http://127.0.0.1:4173/login');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      localStorage.setItem('procureai_active_profile', 'usr-admin-01');
      localStorage.setItem('procureai_active_role', 'admin');
      localStorage.setItem('procureai_authenticated', 'true');
    });

    // Navigate to Admin Regional Settings tab
    await page.goto('http://127.0.0.1:4173/admin/dashboard?tab=settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify Heading
    const heading = await page.locator('h1, h2').filter({ hasText: 'Regional & Localization Settings' }).first();
    check(await heading.isVisible(), 'Regional & Localization Settings header is visible');

    // Verify Presets are present
    const indiaPreset = page.locator('button:has-text("India Standard")');
    const usPreset = page.locator('button:has-text("United States")');
    check(await indiaPreset.isVisible(), 'India Standard preset card is visible');
    check(await usPreset.isVisible(), 'United States preset card is visible');

    // Verify Live Preview Card is present
    const livePreview = page.locator('text=Live Regional Preview');
    check(await livePreview.isVisible(), 'Live Regional Preview card is visible');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-admin-regional-settings-default-india.png'), fullPage: true });
    console.log(' Saved screenshot: 01-admin-regional-settings-default-india.png');

    // 2. Select US Preset
    console.log('\n--- Step 2: Switch to United States Preset & Save ---');
    await usPreset.click();
    await page.waitForTimeout(600);

    // Verify that the preview switched to USD ($)
    const previewText = await page.locator('div').filter({ hasText: 'Live Regional Preview' }).first().innerText();
    check(previewText.includes('$') || previewText.includes('USD'), 'Live preview reflects US Dollar ($) format');
    check(previewText.includes('lb'), 'Live preview reflects US customary weight (lb)');

    // Click "Save changes"
    const saveBtn = page.locator('button:has-text("Save changes")').first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    const savedBadge = page.locator('text=Settings Applied Successfully');
    check(await savedBadge.isVisible(), 'Success indicator "Settings Applied Successfully" is visible');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-admin-regional-settings-saved-us.png'), fullPage: true });
    console.log(' Saved screenshot: 02-admin-regional-settings-saved-us.png');

    // 3. Navigate to Buyer Dashboard to verify dynamic global update
    console.log('\n--- Step 3: Verify Buyer Dashboard dynamically displays US Dollar ($) ---');
    await page.evaluate(() => {
      localStorage.setItem('procureai_active_profile', 'usr-buyer-01');
      localStorage.setItem('procureai_active_role', 'buyer');
    });
    await page.goto('http://127.0.0.1:4173/buyer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const buyerContent = await page.locator('body').innerText();
    check(buyerContent.includes('$'), 'Buyer Dashboard displays active regional currency ($)');
    check(!buyerContent.includes('₹'), 'Buyer Dashboard does not display obsolete currency symbol (₹)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-buyer-dashboard-with-us-settings.png'), fullPage: true });
    console.log(' Saved screenshot: 03-buyer-dashboard-with-us-settings.png');

    // 4. Navigate to Supplier Dashboard
    console.log('\n--- Step 4: Verify Supplier Dashboard dynamically displays US Dollar ($) ---');
    await page.evaluate(() => {
      localStorage.setItem('procureai_active_profile', 'usr-supplier-01');
      localStorage.setItem('procureai_active_role', 'supplier');
    });
    await page.goto('http://127.0.0.1:4173/supplier/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const supplierContent = await page.locator('body').innerText();
    check(supplierContent.includes('$'), 'Supplier Dashboard displays active regional currency ($)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-supplier-dashboard-with-us-settings.png'), fullPage: true });
    console.log(' Saved screenshot: 04-supplier-dashboard-with-us-settings.png');

    // 5. Navigate back to Regional Settings and switch back to India Standard
    console.log('\n--- Step 5: Switch back to India Standard Preset & Save ---');
    await page.evaluate(() => {
      localStorage.setItem('procureai_active_profile', 'usr-admin-01');
      localStorage.setItem('procureai_active_role', 'admin');
    });
    await page.goto('http://127.0.0.1:4173/admin/dashboard?tab=settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const indiaPresetBtn = page.locator('button:has-text("India Standard")');
    await indiaPresetBtn.click();
    await page.waitForTimeout(600);

    const saveBtn2 = page.locator('button:has-text("Save changes")').first();
    await saveBtn2.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-admin-regional-settings-reverted-india.png'), fullPage: true });
    console.log(' Saved screenshot: 05-admin-regional-settings-reverted-india.png');

    // 6. Verify Buyer Dashboard reverted to INR (₹)
    console.log('\n--- Step 6: Verify Buyer Dashboard reverted to INR (₹) ---');
    await page.evaluate(() => {
      localStorage.setItem('procureai_active_profile', 'usr-buyer-01');
      localStorage.setItem('procureai_active_role', 'buyer');
    });
    await page.goto('http://127.0.0.1:4173/buyer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const buyerContentReverted = await page.locator('body').innerText();
    check(buyerContentReverted.includes('₹'), 'Buyer Dashboard displays Indian Rupee (₹)');

    console.log(`\n========================================`);
    console.log(`Tests Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await browser.close();
    previewProcess.kill();
  }
}

run();

