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
    console.log('\n--- 1. Testing Landing Page Opening Screen (2x Speed Video) ---');
    await page.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Verify Opening Screen is visible
    const openingScreen = page.locator('text=2.0x SPEED').first();
    check(await openingScreen.isVisible(), 'Brand Reveal Opening Screen is visible on Landing Page');

    // Verify video element and 2x playback rate
    const video = page.locator('video[src="/procureai-intro.mp4"]').first();
    check(await video.isVisible(), 'ProcureAI intro video element is rendered');

    const playbackRate = await page.evaluate(() => {
      const v = document.querySelector('video[src="/procureai-intro.mp4"]');
      return v ? v.playbackRate : 0;
    });
    check(playbackRate === 2.0, `Video playbackRate is strictly 2.0x (actual: ${playbackRate})`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-opening-screen-2x.png') });

    // Click "Skip Intro" to transition to landing page
    console.log('Skipping intro to reveal Landing Page...');
    await page.locator('button:has-text("Skip Intro")').first().click();
    await page.waitForTimeout(800);

    const landingHeading = await page.locator('h1').innerText();
    check(landingHeading.includes('Procurement, Powered by') || landingHeading.includes('Intelligence'), `Landing page revealed after intro: "${landingHeading}"`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-page-revealed.png') });

    // 2. Visit Login Page
    console.log('\n--- 2. Testing Login Page Opening Screen (2x Speed Video) ---');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const loginOpeningScreen = page.locator('text=2.0x SPEED').first();
    check(await loginOpeningScreen.isVisible(), 'Brand Reveal Opening Screen is visible on Login Page');

    const loginVideo = page.locator('video[src="/procureai-intro.mp4"]').first();
    check(await loginVideo.isVisible(), 'ProcureAI intro video element is rendered on Login Page');

    const loginPlaybackRate = await page.evaluate(() => {
      const v = document.querySelector('video[src="/procureai-intro.mp4"]');
      return v ? v.playbackRate : 0;
    });
    check(loginPlaybackRate === 2.0, `Login video playbackRate is strictly 2.0x (actual: ${loginPlaybackRate})`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-opening-screen-2x.png') });

    // Click "Enter Site" in bottom bar
    console.log('Entering site to reveal Login Page...');
    await page.locator('button:has-text("Enter Site")').first().click();
    await page.waitForTimeout(800);

    const loginHeading = await page.locator('h1').innerText();
    check(loginHeading.includes('Sign In to Your ProcureAI Portal'), `Login portal revealed after intro: "${loginHeading}"`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-page-revealed.png') });

    // 3. Test "Brand Reveal (2x)" re-trigger button on Login Page
    console.log('\n--- 3. Testing Re-triggering Brand Reveal (2x) ---');
    const replayBtn = page.locator('button:has-text("Brand Reveal (2x)")').first();
    check(await replayBtn.isVisible(), 'Re-trigger Brand Reveal (2x) button is visible on Login Page');
    await replayBtn.click();
    await page.waitForTimeout(600);

    check(await page.locator('text=2.0x SPEED').first().isVisible(), 'Opening Screen successfully re-opened upon clicking Brand Reveal');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-opening-screen-retriggered.png') });

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
