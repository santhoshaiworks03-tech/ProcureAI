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
    // 1. Test Login Page Role Selector Cards Hover Float
    console.log('\n--- 1. Testing Login Page: Floating on Cursor Hover ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const buyerRoleBtn = page.locator('button:has-text("Buyer Portal")').first();
    check(await buyerRoleBtn.isVisible(), 'Login role card visible');

    // Hover over buyer role card
    await buyerRoleBtn.hover();
    await page.waitForTimeout(300);

    const buyerTransform = await buyerRoleBtn.evaluate(el => window.getComputedStyle(el).transform);
    console.log('Buyer role card hover transform:', buyerTransform);
    check(buyerTransform.includes('matrix') || buyerTransform !== 'none', 'Login role card floats with CSS transform on hover');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-role-card-hover-float.png') });

    // 2. Test Buyer Dashboard Cards Hover Float
    console.log('\n--- 2. Testing Buyer Dashboard: Floating on Cursor Hover ---');
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);

    // Test Total Spend Card hover
    const totalSpendCard = page.locator('.rounded-2xl:has-text("Total spend")').last();
    check(await totalSpendCard.isVisible(), 'Buyer Total Spend card is visible');
    await totalSpendCard.hover();
    await page.waitForTimeout(300);

    const spendTransform = await totalSpendCard.evaluate(el => window.getComputedStyle(el).transform);
    console.log('Buyer Total Spend hover transform:', spendTransform);
    check(spendTransform.includes('matrix') || spendTransform !== 'none', 'Buyer Total Spend card floats on hover');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer-dashboard-hover-float.png') });

    // 3. Test Supplier Dashboard 8 KPI Cards Hover Float
    console.log('\n--- 3. Testing Supplier Dashboard: 8 KPI Cards Floating on Hover ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.locator('button:has-text("Supplier Portal")').first().click();
    await page.waitForTimeout(200);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const supplierKpiCard = page.locator('.rounded-2xl:has-text("Total Active Products")').last();
    check(await supplierKpiCard.isVisible(), 'Supplier KPI card is visible');
    await supplierKpiCard.hover();
    await page.waitForTimeout(300);

    const supplierTransform = await supplierKpiCard.evaluate(el => window.getComputedStyle(el).transform);
    console.log('Supplier KPI hover transform:', supplierTransform);
    check(supplierTransform.includes('matrix') || supplierTransform !== 'none', 'Supplier KPI card floats on hover');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'supplier-dashboard-hover-float.png') });

    // 4. Test Admin Dashboard Cards Hover Float
    console.log('\n--- 4. Testing Admin Dashboard: Cards Floating on Hover ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.locator('button:has-text("Admin Control Tower")').first().click();
    await page.waitForTimeout(200);
    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const adminGmvCard = page.locator('.rounded-2xl:has-text("Platform GMV")').last();
    check(await adminGmvCard.isVisible(), 'Admin GMV card is visible');
    await adminGmvCard.hover();
    await page.waitForTimeout(300);

    const adminTransform = await adminGmvCard.evaluate(el => window.getComputedStyle(el).transform);
    console.log('Admin GMV hover transform:', adminTransform);
    check(adminTransform.includes('matrix') || adminTransform !== 'none', 'Admin GMV card floats on hover');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-dashboard-hover-float.png') });

    // 5. Test Button Hover Float
    console.log('\n--- 5. Testing Interactive Button Floating on Hover ---');
    const headerBtn = page.locator('button[title="Notifications"]').first();
    check(await headerBtn.isVisible(), 'Header notification bell button is visible');
    await headerBtn.hover();
    await page.waitForTimeout(300);
    const btnTransform = await headerBtn.evaluate(el => window.getComputedStyle(el).transform);
    console.log('Button hover transform:', btnTransform);
    check(btnTransform.includes('matrix') || btnTransform !== 'none', 'Button floats with transform on cursor hover');

    console.log(`\n======================================================`);
    console.log(`  Floating Tests Completed: ${passed} PASSED, ${failed} FAILED`);
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
