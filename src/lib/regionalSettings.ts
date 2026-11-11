import {
  RegionalSettings,
  SupportedCurrency,
  NumberFormatType,
  DateFormatType,
  TimeFormatType,
  MeasurementSystem,
  SupportedLocale
} from '../types';

export interface CurrencyMeta {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateToBaseINR: number; // 1 Foreign Currency = X INR. E.g. 1 USD = 83.5 INR
  defaultPosition: 'prefix' | 'suffix';
}

export const CURRENCY_REGISTRY: Record<SupportedCurrency, CurrencyMeta> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToBaseINR: 1.0, defaultPosition: 'prefix' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToBaseINR: 83.50, defaultPosition: 'prefix' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToBaseINR: 90.20, defaultPosition: 'prefix' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToBaseINR: 105.40, defaultPosition: 'prefix' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToBaseINR: 0.55, defaultPosition: 'prefix' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToBaseINR: 61.20, defaultPosition: 'prefix' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateToBaseINR: 54.60, defaultPosition: 'prefix' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToBaseINR: 62.10, defaultPosition: 'prefix' },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateToBaseINR: 22.73, defaultPosition: 'prefix' }
};

export interface TimezoneMeta {
  id: string;
  label: string;
  offset: string;
  region: string;
}

export const TIMEZONE_REGISTRY: TimezoneMeta[] = [
  { id: 'Asia/Kolkata', label: 'India Standard Time (IST) - Kolkata, Mumbai, New Delhi', offset: 'UTC+05:30', region: 'Asia' },
  { id: 'America/New_York', label: 'Eastern Time (ET) - New York, Washington D.C., Toronto', offset: 'UTC-05:00 / UTC-04:00', region: 'Americas' },
  { id: 'America/Chicago', label: 'Central Time (CT) - Chicago, Dallas, Mexico City', offset: 'UTC-06:00 / UTC-05:00', region: 'Americas' },
  { id: 'America/Denver', label: 'Mountain Time (MT) - Denver, Phoenix, Calgary', offset: 'UTC-07:00 / UTC-06:00', region: 'Americas' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles, San Francisco, Seattle', offset: 'UTC-08:00 / UTC-07:00', region: 'Americas' },
  { id: 'Europe/London', label: 'Greenwich Mean Time / BST - London, Edinburgh, Dublin', offset: 'UTC+00:00 / UTC+01:00', region: 'Europe' },
  { id: 'Europe/Berlin', label: 'Central European Time (CET) - Berlin, Paris, Frankfurt, Zurich', offset: 'UTC+01:00 / UTC+02:00', region: 'Europe' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai, Abu Dhabi, Muscat', offset: 'UTC+04:00', region: 'Middle East' },
  { id: 'Asia/Singapore', label: 'Singapore Standard Time (SGT) - Singapore, Kuala Lumpur', offset: 'UTC+08:00', region: 'Asia' },
  { id: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo, Osaka', offset: 'UTC+09:00', region: 'Asia' },
  { id: 'Australia/Sydney', label: 'Australian Eastern Time (AET) - Sydney, Melbourne', offset: 'UTC+10:00 / UTC+11:00', region: 'Australia' },
  { id: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+00:00', region: 'Global' }
];

// --- Default Configuration (India Standard) ---
export const DEFAULT_REGIONAL_SETTINGS: RegionalSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  currencyPosition: 'prefix',
  enableCurrencyConversion: false,
  numberFormat: 'indian',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  measurementSystem: 'metric',
  weightUnit: 'kg',
  dimensionUnit: 'cm',
  distanceUnit: 'km',
  temperatureUnit: '°C',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Platform System Default'
};

// --- Presets for Instant Configuration ---
export const REGIONAL_PRESETS: Record<string, { label: string; description: string; settings: Partial<RegionalSettings> }> = {
  india: {
    label: 'India Standard (Default)',
    description: 'INR (₹), Lakhs/Crores numbering (12,34,567.89), DD/MM/YYYY, Metric (kg/cm), IST timezone',
    settings: {
      currency: 'INR',
      currencySymbol: '₹',
      currencyPosition: 'prefix',
      enableCurrencyConversion: false,
      numberFormat: 'indian',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      measurementSystem: 'metric',
      weightUnit: 'kg',
      dimensionUnit: 'cm',
      distanceUnit: 'km',
      temperatureUnit: '°C',
      locale: 'en-IN',
      timezone: 'Asia/Kolkata'
    }
  },
  us: {
    label: 'United States',
    description: 'USD ($), Standard US commas (1,234,567.89), MM/DD/YYYY, US Customary (lb/in), Eastern Time',
    settings: {
      currency: 'USD',
      currencySymbol: '$',
      currencyPosition: 'prefix',
      enableCurrencyConversion: false,
      numberFormat: 'us',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      measurementSystem: 'us_customary',
      weightUnit: 'lb',
      dimensionUnit: 'in',
      distanceUnit: 'mi',
      temperatureUnit: '°F',
      locale: 'en-US',
      timezone: 'America/New_York'
    }
  },
  uk: {
    label: 'United Kingdom',
    description: 'GBP (£), Standard thousands (1,234,567.89), DD/MM/YYYY, 24-hour time, Metric, London time',
    settings: {
      currency: 'GBP',
      currencySymbol: '£',
      currencyPosition: 'prefix',
      enableCurrencyConversion: false,
      numberFormat: 'us',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      measurementSystem: 'metric',
      weightUnit: 'kg',
      dimensionUnit: 'cm',
      distanceUnit: 'km',
      temperatureUnit: '°C',
      locale: 'en-GB',
      timezone: 'Europe/London'
    }
  },
  europe: {
    label: 'European Union (German)',
    description: 'EUR (€), European decimals (1.234.567,89), DD/MM/YYYY, 24-hour time, Metric, Berlin time',
    settings: {
      currency: 'EUR',
      currencySymbol: '€',
      currencyPosition: 'prefix',
      enableCurrencyConversion: false,
      numberFormat: 'european',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      measurementSystem: 'metric',
      weightUnit: 'kg',
      dimensionUnit: 'cm',
      distanceUnit: 'km',
      temperatureUnit: '°C',
      locale: 'de-DE',
      timezone: 'Europe/Berlin'
    }
  }
};

/**
 * Format a number according to the active regional number format
 * - 'indian': 12,34,567.89
 * - 'us': 1,234,567.89
 * - 'european': 1.234.567,89
 */
export function formatNumber(
  value: number,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }

  const locale =
    settings.numberFormat === 'indian'
      ? 'en-IN'
      : settings.numberFormat === 'european'
      ? 'de-DE'
      : 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } catch (e) {
    return value.toFixed(decimals);
  }
}

/**
 * Format currency amount with accurate presentation
 * - Respects database numeric fidelity (never modifies stored values)
 * - Supports currency symbol prefix/suffix
 * - Optional exchange-rate calculation when explicitly enabled
 */
export function formatCurrency(
  amount: number,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS,
  overrideCurrency?: string
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${settings.currencySymbol}0.00`;
  }

  const activeCurrency = (overrideCurrency || settings.currency) as SupportedCurrency;
  const meta = CURRENCY_REGISTRY[activeCurrency] || CURRENCY_REGISTRY.INR;
  const symbol = settings.currencySymbol || meta.symbol;

  // Determine effective display amount
  let displayAmount = amount;
  if (settings.enableCurrencyConversion && activeCurrency !== 'INR') {
    // If base canonical currency is INR and conversion is explicitly requested
    displayAmount = amount / meta.rateToBaseINR;
  }

  // Format the numerical part
  const formattedNumber = formatNumber(displayAmount, settings, 2);

  // Position symbol
  if (settings.currencyPosition === 'suffix') {
    return `${formattedNumber} ${symbol.trim()}`;
  }
  return `${symbol}${formattedNumber}`;
}

/**
 * Format a date string in the configured timezone and date format
 * Options: 'MM/DD/YYYY' (US), 'DD/MM/YYYY' (UK/India), 'YYYY-MM-DD' (ISO), 'DD-MMM-YYYY'
 */
export function formatDate(
  dateString: string,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const timeZone = settings.timezone || 'Asia/Kolkata';

    // Extract localized calendar parts in the target timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const parts = formatter.formatToParts(d);
    let day = '01';
    let month = '01';
    let year = '2026';

    for (const part of parts) {
      if (part.type === 'day') day = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'year') year = part.value;
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNum = parseInt(month, 10);
    const monthShort = monthNum >= 1 && monthNum <= 12 ? monthNames[monthNum - 1] : month;

    switch (settings.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MMM-YYYY':
        return `${day}-${monthShort}-${year}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (e) {
    return dateString;
  }
}

/**
 * Format date and time string in configured timezone, date format, and 12h/24h time format
 */
export function formatDateTime(
  dateString: string,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const formattedDate = formatDate(dateString, settings);
    const timeZone = settings.timezone || 'Asia/Kolkata';
    const is12Hour = settings.timeFormat === '12h';

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: is12Hour
    });

    const formattedTime = timeFormatter.format(d);
    return `${formattedDate} at ${formattedTime}`;
  } catch (e) {
    return dateString;
  }
}

/**
 * Format weights (canonical in kg) converted to lb when US customary is active
 */
export function formatWeight(
  kgValue: number,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  if (kgValue === null || kgValue === undefined || isNaN(kgValue)) return '0 kg';

  if (settings.measurementSystem === 'us_customary' || settings.weightUnit === 'lb') {
    const lbValue = kgValue * 2.20462;
    return `${formatNumber(lbValue, settings, 1)} lb`;
  }
  return `${formatNumber(kgValue, settings, 1)} kg`;
}

/**
 * Format dimensions (canonical in cm) converted to inches when US customary is active
 */
export function formatDimension(
  cmValue: number,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  if (cmValue === null || cmValue === undefined || isNaN(cmValue)) return '0 cm';

  if (settings.measurementSystem === 'us_customary' || settings.dimensionUnit === 'in') {
    const inValue = cmValue / 2.54;
    return `${formatNumber(inValue, settings, 1)} in`;
  }
  return `${formatNumber(cmValue, settings, 1)} cm`;
}

