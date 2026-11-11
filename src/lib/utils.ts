import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { store } from './store';
import {
  formatCurrency as formatCurrencyInternal,
  formatDate as formatDateInternal,
  formatDateTime as formatDateTimeInternal,
  formatNumber as formatNumberInternal,
  formatWeight as formatWeightInternal,
  formatDimension as formatDimensionInternal,
  DEFAULT_REGIONAL_SETTINGS
} from './regionalSettings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount using centralized Admin Regional Settings
 * Respects selected currency ($ / ₹ / € / £ / etc.), number formatting (US / Indian / European), and symbol placement.
 */
export function formatCurrency(amount: number, overrideCurrency?: string): string {
  try {
    const settings = store.getRegionalSettings();
    return formatCurrencyInternal(amount, settings, overrideCurrency);
  } catch (e) {
    return formatCurrencyInternal(amount, DEFAULT_REGIONAL_SETTINGS, overrideCurrency);
  }
}

/**
 * Format date string using centralized Admin Regional Settings
 * Formats according to selected date convention (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MMM-YYYY) in selected timezone.
 */
export function formatDate(dateString: string): string {
  try {
    const settings = store.getRegionalSettings();
    return formatDateInternal(dateString, settings);
  } catch (e) {
    return formatDateInternal(dateString, DEFAULT_REGIONAL_SETTINGS);
  }
}

/**
 * Format timestamp string into localized date and time (12h AM/PM or 24h) in configured timezone.
 */
export function formatDateTime(dateString: string): string {
  try {
    const settings = store.getRegionalSettings();
    return formatDateTimeInternal(dateString, settings);
  } catch (e) {
    return formatDateTimeInternal(dateString, DEFAULT_REGIONAL_SETTINGS);
  }
}

/**
 * Format a number using the active regional number formatting (US: 1,234,567.89, Indian: 12,34,567.89, European: 1.234.567,89).
 */
export function formatNumber(value: number, decimals: number = 2): string {
  try {
    const settings = store.getRegionalSettings();
    return formatNumberInternal(value, settings, decimals);
  } catch (e) {
    return formatNumberInternal(value, DEFAULT_REGIONAL_SETTINGS, decimals);
  }
}

/**
 * Format product/order weights dynamically (kg vs lb) based on active measurement system.
 */
export function formatWeight(kgValue: number): string {
  try {
    const settings = store.getRegionalSettings();
    return formatWeightInternal(kgValue, settings);
  } catch (e) {
    return formatWeightInternal(kgValue, DEFAULT_REGIONAL_SETTINGS);
  }
}

/**
 * Format dimensions (cm vs in) based on active measurement system.
 */
export function formatDimension(cmValue: number): string {
  try {
    const settings = store.getRegionalSettings();
    return formatDimensionInternal(cmValue, settings);
  } catch (e) {
    return formatDimensionInternal(cmValue, DEFAULT_REGIONAL_SETTINGS);
  }
}

/**
 * Retrieve current active currency symbol (e.g. '$', '₹', '€', '£')
 */
export function getCurrencySymbol(): string {
  try {
    return store.getRegionalSettings().currencySymbol;
  } catch (e) {
    return '₹';
  }
}
