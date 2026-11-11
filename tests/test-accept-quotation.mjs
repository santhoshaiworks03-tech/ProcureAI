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
    stdio: 'ignore'
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
      await new Promise(r => setTimeout(r, 800));
    }
  }

  if (!serverReady) {
    throw new Error('Vite preview server failed to start on port 4173');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://localhost:4173/login');
    await page.evaluate(() => {
      localStorage.setItem('procureai_authenticated', 'true');
      localStorage.setItem('procureai_active_role', 'supplier');
      localStorage.setItem('procureai_active_profile', 'usr-supplier-01');
      localStorage.setItem('procureai_rfqs', JSON.stringify([
        {
          id: 'rfq-01',
          rfq_number: 'RFQ-2024-001',
          organisation_id: 'org-01',
          organisation_name: 'Apex Tech Solutions Pvt Ltd',
          title: 'Q1 Executive Workstations & Ergonomic Seating',
          items: [
            {
              product_id: 'prod-01',
              product_name: 'AeroPro Ergonomic High-Back Mesh Chair',
              quantity: 25,
              target_price: 15000,
              specifications: '3D adjustable armrests, lumbar support, breathable mesh, black'
            },
            {
              product_id: 'prod-02',
              product_name: 'Dual-Motor Electric Standing Desk (140x70cm)',
              quantity: 10,
              target_price: 32000,
              specifications: 'Memory keypad, anti-collision sensor, walnut top'
            }
          ],
          max_budget: 700000,
          delivery_deadline: '2026-03-25',
          delivery_location: 'Apex Tech Park, Tower B, Whitefield, Bengaluru',
          status: 'pending',
          created_at: '2026-03-01T10:00:00Z'
        }
      ]));
      localStorage.setItem('procureai_quotations', JSON.stringify([]));
    });

    await page.goto('http://localhost:4173/supplier/dashboard?tab=rfqs');
    await page.waitForSelector('text=RFQ Management');

    // Verify "Accept Quotation" button
    const acceptBtn = page.locator('button:has-text("Accept Quotation")').first();
    await acceptBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[PASS] "Accept Quotation" button is visible on RFQ card');

    // Take screenshot of the RFQ card
    const rfqCard = page.locator('.rounded-2xl:has-text("RFQ-2024-001")').first();
    await rfqCard.screenshot({ path: 'tests/screenshots/verified-accept-quotation.png' });
    console.log('[PASS] Screenshot saved to tests/screenshots/verified-accept-quotation.png');

    // Click Accept Quotation to test opening the modal
    await acceptBtn.click();
    await page.waitForSelector('text=Accept Commercial Quotation');
    console.log('[PASS] Modal title says "Accept Commercial Quotation"');

    const modalSubmitBtn = page.locator('button:has-text("Confirm & Accept Quotation")');
    await modalSubmitBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[PASS] Modal button says "Confirm & Accept Quotation"');

    console.log('ALL ACCEPT QUOTATION TESTS PASSED!');
  } finally {
    await browser.close();
    previewProcess.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
