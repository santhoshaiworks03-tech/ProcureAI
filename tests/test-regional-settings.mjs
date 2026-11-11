// tests/test-regional-settings.mjs
// Comprehensive test suite for Admin-Controlled Regional & Localization Settings

import assert from 'assert';

console.log('🧪 Starting Centralized Regional & Localization Settings Verification Suite...\n');

// 1. Test pure regional formatting module logic directly
import {
  CURRENCY_REGISTRY,
  TIMEZONE_REGISTRY,
  REGIONAL_PRESETS,
  DEFAULT_REGIONAL_SETTINGS,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatWeight,
  formatDimension
} from '../src/lib/regionalSettings.ts';

console.log('Step 1: Testing Defaults and Registry Registrations...');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.currency, 'INR');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.numberFormat, 'indian');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.dateFormat, 'DD/MM/YYYY');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.timeFormat, '24h');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.measurementSystem, 'metric');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.locale, 'en-IN');
assert.strictEqual(DEFAULT_REGIONAL_SETTINGS.timezone, 'Asia/Kolkata');
assert(CURRENCY_REGISTRY['USD'], 'USD must exist in currency registry');
assert(CURRENCY_REGISTRY['INR'], 'INR must exist in currency registry');
assert(CURRENCY_REGISTRY['EUR'], 'EUR must exist in currency registry');
assert(CURRENCY_REGISTRY['GBP'], 'GBP must exist in currency registry');
assert(TIMEZONE_REGISTRY.some(tz => tz.id === 'Asia/Kolkata'), 'Asia/Kolkata must exist');
assert(TIMEZONE_REGISTRY.some(tz => tz.id === 'America/New_York'), 'America/New_York must exist');
console.log('  ✅ Regional defaults and registries verified.\n');

console.log('Step 2: Testing Indian Configuration Formatting...');
const inSettings = { ...DEFAULT_REGIONAL_SETTINGS };
const inNum = formatNumber(1234567.89, inSettings);
console.log(`  formatNumber(1234567.89) = ${inNum}`);
assert(inNum.includes('12,34,567.89'), `Expected Indian numbering format (12,34,567.89), got ${inNum}`);

const inCurr = formatCurrency(1234.56, inSettings);
console.log(`  formatCurrency(1234.56) = ${inCurr}`);
assert(inCurr.includes('₹') && inCurr.includes('1,234.56'), `Expected ₹1,234.56, got ${inCurr}`);

const sampleDate = '2026-11-11T14:30:00Z';
const inDate = formatDate(sampleDate, inSettings);
console.log(`  formatDate(sampleDate) = ${inDate}`);
assert(inDate.includes('11/11/2026'), `Expected DD/MM/YYYY (11/11/2026), got ${inDate}`);

const inWeight = formatWeight(10, inSettings);
console.log(`  formatWeight(10) = ${inWeight}`);
assert.strictEqual(inWeight, '10.0 kg');

const inDim = formatDimension(140, 70, inSettings);
console.log(`  formatDimension(140, 70) = ${inDim}`);
assert.strictEqual(inDim, '140 × 70 cm');
console.log('  ✅ Indian configuration formatting tests passed.\n');

console.log('Step 3: Testing US Configuration Formatting...');
const usPreset = REGIONAL_PRESETS['us'].settings;
const usSettings = {
  ...DEFAULT_REGIONAL_SETTINGS,
  ...usPreset
};

const usNum = formatNumber(1234567.89, usSettings);
console.log(`  formatNumber(1234567.89) = ${usNum}`);
assert.strictEqual(usNum, '1,234,567.89', `Expected US numbering format (1,234,567.89), got ${usNum}`);

const usCurr = formatCurrency(1234.56, usSettings);
console.log(`  formatCurrency(1234.56) = ${usCurr}`);
assert(usCurr.includes('$') && usCurr.includes('1,234.56'), `Expected $1,234.56, got ${usCurr}`);

const usDate = formatDate(sampleDate, usSettings);
console.log(`  formatDate(sampleDate) = ${usDate}`);
assert(usDate.includes('11/11/2026'), `Expected MM/DD/YYYY, got ${usDate}`);

const usWeight = formatWeight(10, usSettings); // 10 kg -> lb
console.log(`  formatWeight(10 kg) = ${usWeight}`);
assert(usWeight.includes('lb'), `Expected lb, got ${usWeight}`);

const usDim = formatDimension(140, 70, usSettings); // cm -> in
console.log(`  formatDimension(140, 70 cm) = ${usDim}`);
assert(usDim.includes('in'), `Expected in, got ${usDim}`);
console.log('  ✅ US configuration formatting tests passed.\n');

console.log('Step 4: Testing European Configuration Formatting...');
const euPreset = REGIONAL_PRESETS['europe'].settings;
const euSettings = {
  ...DEFAULT_REGIONAL_SETTINGS,
  ...euPreset
};
const euNum = formatNumber(1234567.89, euSettings);
console.log(`  formatNumber(1234567.89) = ${euNum}`);
assert.strictEqual(euNum, '1.234.567,89', `Expected European numbering format (1.234.567,89), got ${euNum}`);

const euCurr = formatCurrency(1234.56, euSettings);
console.log(`  formatCurrency(1234.56) = ${euCurr}`);
assert(euCurr.includes('€') && euCurr.includes('1.234,56'), `Expected €1.234,56, got ${euCurr}`);
console.log('  ✅ European configuration formatting tests passed.\n');

console.log('🎉 All Regional & Localization Settings tests passed successfully!');

