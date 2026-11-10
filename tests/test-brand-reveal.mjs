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
    // 1. Visit Landing Page
    console.log('\n--- 1. Testing Landing Page Full-Screen Loading Screen (~2.5s) ---');
    await page.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    // Verify fullscreen video loading screen is visible
    const video = page.locator('video[src="/procureai-intro.mp4"]').first();
    check(await video.isVisible(), 'ProcureAI intro video is playing as full-screen loading screen');

    // Verify NO details or player controls around the video
    const skipBtn = await page.locator('button:has-text("Skip Intro")').count();
    check(skipBtn === 0, 'No "Skip Intro" button or details around the video');

    const watermark = await page.locator('text=2.0x SPEED').count();
    check(watermark === 0, 'No "2.0x SPEED" watermark details around the video');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-fullscreen-loading-screen.png') });

    // Wait ~2.8s for video loading screen to complete and transition
    console.log('Waiting ~2.8s for loading screen to complete auto-transition...');
    await page.waitForTimeout(2800);

    const landingHeading = await page.locator('h1').innerText();
    check(landingHeading.includes('Procurement, Powered by') || landingHeading.includes('Intelligence'), `Landing page smoothly revealed: "${landingHeading}"`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-page-after-loading.png') });

    // 2. Visit Login Page - NO loading screen before login page
    console.log('\n--- 2. Testing Login Page: Direct Entry With ZERO Video Loading ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Verify NO video on login page
    const loginVideoCount = await page.locator('video[src="/procureai-intro.mp4"]').count();
    check(loginVideoCount === 0, 'ZERO video loading screen before login page (video removed as requested)');

    // Verify login portal is directly visible immediately
    const loginHeading = await page.locator('h1').innerText();
    check(loginHeading.includes('Sign In to Your ProcureAI Portal'), `Login portal directly loaded: "${loginHeading}"`);

    const emailInput = page.locator('input[type="email"]');
    check(await emailInput.isVisible(), 'Login email input directly visible');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-page-direct-entry.png') });

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
