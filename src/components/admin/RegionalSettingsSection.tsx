import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  DollarSign,
  Calendar,
  Clock,
  Scale,
  Languages,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { store } from '../../lib/store';
import {
  RegionalSettings,
  SupportedCurrency,
  NumberFormatType,
  DateFormatType,
  TimeFormatType,
  MeasurementSystem,
  SupportedLocale
} from '../../types';
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
} from '../../lib/regionalSettings';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const RegionalSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<RegionalSettings>(store.getRegionalSettings());
  const [activePreset, setActivePreset] = useState<string>('custom');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSettings(store.getRegionalSettings());
    });
    return unsub;
  }, []);

  const handleApplyPreset = (presetKey: string) => {
    if (!isAdmin) return;
    const preset = REGIONAL_PRESETS[presetKey];
    if (preset) {
      setSettings(prev => ({
        ...prev,
        ...preset.settings
      }));
      setActivePreset(presetKey);
      setErrorMessage(null);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setErrorMessage('Access Denied: Only administrators have permission to modify regional settings.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await store.updateRegionalSettings(settings);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to persist regional settings.');
    }
  };

  const handleReset = async () => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to reset all Regional & Localization settings to system default (India Standard)?')) {
      setIsSaving(true);
      try {
        const resetResult = await store.resetRegionalSettings();
        setSettings(resetResult);
        setActivePreset('india');
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } catch (err: any) {
        setIsSaving(false);
        setErrorMessage(err.message || 'Failed to reset settings.');
      }
    }
  };

  // Sample static reference date for consistent live preview
  const sampleTimestamp = '2026-11-11T14:30:00Z';
  const sampleAmount = 1234567.89;
  const sampleSmallAmount = 1234.56;
  const sampleWeightKg = 10;
  const sampleDeskWidthCm = 140;
  const sampleDeskDepthCm = 70;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#13110F] text-[#F2C8A8] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#13110F]">
              Regional & Localization Settings
            </h2>
            <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
              Global Scope
            </Badge>
          </div>
          <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
            Centralized platform configuration for currency, number notation, calendar formats, timezones, and measurement standards.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isAdmin || isSaving}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#8C847D]" />}
          >
            Reset to default
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!isAdmin}
            leftIcon={<Save className="w-3.5 h-3.5 text-[#F2C8A8]" />}
          >
            Save changes
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-subtle"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Settings Applied Successfully:</strong> Centralized regional formats are now actively serving all buyer, supplier, and admin dashboards.
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 bg-white/60 px-2 py-0.5 rounded border border-emerald-300">
              Zero-Refresh Live Sync
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RBAC Warning for Non-Admins */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Read-Only View: Administrator Privilege Required</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              You are currently authenticated as <strong>{currentUser.role}</strong> ({currentUser.full_name}). Only platform root administrators can alter global regional governance.
            </p>
          </div>
        </div>
      )}

      {/* 1-Click Quick Configuration Presets */}
      <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#BE123C]" />
            <h3 className="text-xs font-bold text-[#13110F]">1-Click Regional Presets</h3>
          </div>
          <span className="text-[11px] text-[#8C847D]">Rapidly load canonical national configurations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(REGIONAL_PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              disabled={!isAdmin}
              onClick={() => handleApplyPreset(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.currency === p.settings.currency && settings.numberFormat === p.settings.numberFormat
                  ? 'border-[#13110F] bg-[#FAF7F2] ring-2 ring-[#13110F]/10 shadow-sm'
                  : 'border-[rgba(19,17,15,0.08)] bg-white hover:border-[#13110F]/30 hover:bg-[#FAF7F2]/40'
              } ${!isAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#13110F]">{p.label}</span>
                {settings.currency === p.settings.currency && settings.numberFormat === p.settings.numberFormat && (
                  <span className="w-2 h-2 rounded-full bg-[#3E5C31]" />
                )}
              </div>
              <p className="text-[10px] text-[#6B6560] leading-snug line-clamp-2">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Interactive Verification & Formatting Preview */}
      <div className="p-5 rounded-2xl bg-[#13110F] text-[#EDE6DC] border border-[rgba(244,238,230,0.12)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F2C8A8]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(244,238,230,0.1)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F2C8A8]" />
            <h3 className="text-xs font-bold text-[#FAF7F2] tracking-wide">
              Live Regional Preview (Dynamic Presentation Output)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#F2C8A8]">
            <span className="w-2 h-2 rounded-full bg-[#B4C7A6] animate-pulse" />
            <span>Target Locale: {settings.locale}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Currency Sample */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <span className="text-[10px] text-[#8C847D] block font-medium">Standard Currency</span>
            <p className="text-base font-bold text-[#FAF7F2] font-mono mt-1 tabular-nums">
              {formatCurrency(sampleSmallAmount, settings)}
            </p>
            <span className="text-[9px] text-[#8C847D] font-mono">{settings.currency} ({settings.currencySymbol})</span>
          </div>

          {/* Large Number Sample */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <span className="text-[10px] text-[#8C847D] block font-medium">Number Notation</span>
            <p className="text-base font-bold text-[#F2C8A8] font-mono mt-1 tabular-nums">
              {formatNumber(sampleAmount, settings, 2)}
            </p>
            <span className="text-[9px] text-[#8C847D] capitalize">{settings.numberFormat} grouping</span>
          </div>

          {/* Formatted Date */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <span className="text-[10px] text-[#8C847D] block font-medium">Calendar Date</span>
            <p className="text-base font-bold text-[#FAF7F2] font-mono mt-1">
              {formatDate(sampleTimestamp, settings)}
            </p>
            <span className="text-[9px] text-[#8C847D] font-mono">{settings.dateFormat}</span>
          </div>

          {/* Formatted Time */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <span className="text-[10px] text-[#8C847D] block font-medium">Clock Time</span>
            <p className="text-base font-bold text-[#FAF7F2] font-mono mt-1">
              {formatDateTime(sampleTimestamp, settings).split(' at ')[1] || '02:30 PM'}
            </p>
            <span className="text-[9px] text-[#8C847D] font-mono">{settings.timeFormat} format</span>
          </div>

          {/* Weight */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <span className="text-[10px] text-[#8C847D] block font-medium">Package Weight</span>
            <p className="text-base font-bold text-[#FAF7F2] font-mono mt-1">
              {formatWeight(sampleWeightKg, settings)}
            </p>
            <span className="text-[9px] text-[#8C847D] capitalize">{settings.measurementSystem}</span>
          </div>

          {/* Dimension */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <span className="text-[10px] text-[#8C847D] block font-medium">Item Dimensions</span>
            <p className="text-xs font-bold text-[#FAF7F2] font-mono mt-1.5 leading-snug">
              {formatDimension(sampleDeskWidthCm, settings)} × {formatDimension(sampleDeskDepthCm, settings)}
            </p>
            <span className="text-[9px] text-[#8C847D]">Office Workstation</span>
          </div>
        </div>
      </div>

      {/* Detailed Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* A. Currency Configuration */}
        <Card className="p-4 space-y-3.5 bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#3E5C31]" />
              <h3 className="text-xs font-bold text-[#13110F]">A. Currency & Valuation</h3>
            </div>
            <Badge variant="neutral" size="sm">Monetary</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                Base Operating Currency
              </label>
              <select
                disabled={!isAdmin}
                value={settings.currency}
                onChange={e => {
                  const newCurr = e.target.value as SupportedCurrency;
                  const meta = CURRENCY_REGISTRY[newCurr];
                  setSettings(prev => ({
                    ...prev,
                    currency: newCurr,
                    currencySymbol: meta?.symbol || '$',
                    currencyPosition: meta?.defaultPosition || 'prefix'
                  }));
                }}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs font-medium text-[#13110F] focus:outline-none focus:ring-1 focus:ring-[#13110F]"
              >
                {Object.values(CURRENCY_REGISTRY).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} – {c.name} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                Currency Symbol Customization
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.currencySymbol}
                  onChange={e => setSettings(prev => ({ ...prev, currencySymbol: e.target.value }))}
                  placeholder="e.g. $, ₹, €"
                  className="px-3 py-1.5 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs font-mono font-bold text-[#13110F] focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                />
                <select
                  disabled={!isAdmin}
                  value={settings.currencyPosition}
                  onChange={e => setSettings(prev => ({ ...prev, currencyPosition: e.target.value as 'prefix' | 'suffix' }))}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs text-[#13110F] focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                >
                  <option value="prefix">Prefix ($100)</option>
                  <option value="suffix">Suffix (100 €)</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={settings.enableCurrencyConversion}
                  onChange={e => setSettings(prev => ({ ...prev, enableCurrencyConversion: e.target.checked }))}
                  className="rounded border-[rgba(19,17,15,0.2)] text-[#13110F] focus:ring-0"
                />
                <span className="text-[11px] font-medium text-[#13110F]">
                  Enable Live Exchange Rate Calculation
                </span>
              </label>
              <p className="text-[10px] text-[#8C847D] mt-1 pl-5 leading-snug">
                When enabled, canonical INR ledger values are dynamically recalculated at benchmark exchange rates ({CURRENCY_REGISTRY[settings.currency]?.rateToBaseINR || 1} INR/{settings.currency}).
              </p>
            </div>
          </div>
        </Card>

        {/* B. Number Format Configuration */}
        <Card className="p-4 space-y-3.5 bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#92400E]" />
              <h3 className="text-xs font-bold text-[#13110F]">B. Number Grouping Notation</h3>
            </div>
            <Badge variant="neutral" size="sm">Digits</Badge>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
              Digit Grouping Convention
            </label>

            {[
              { id: 'indian', name: 'Indian (Lakhs & Crores)', example: '12,34,567.89' },
              { id: 'us', name: 'US / International Standard', example: '1,234,567.89' },
              { id: 'european', name: 'European (Dot separators)', example: '1.234.567,89' }
            ].map(nf => (
              <label
                key={nf.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  settings.numberFormat === nf.id
                    ? 'border-[#13110F] bg-[#FAF7F2] font-semibold text-[#13110F]'
                    : 'border-[rgba(19,17,15,0.08)] bg-white text-[#6B6560] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="numberFormat"
                    value={nf.id}
                    disabled={!isAdmin}
                    checked={settings.numberFormat === nf.id}
                    onChange={() => setSettings(prev => ({ ...prev, numberFormat: nf.id as NumberFormatType }))}
                    className="text-[#13110F] focus:ring-0"
                  />
                  <span className="text-xs">{nf.name}</span>
                </div>
                <span className="font-mono text-[11px] text-[#8C847D]">{nf.example}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* C & D. Date and Time Format */}
        <Card className="p-4 space-y-3.5 bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#BE123C]" />
              <h3 className="text-xs font-bold text-[#13110F]">C & D. Date & Time Formats</h3>
            </div>
            <Badge variant="neutral" size="sm">Temporal</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                Calendar Date Format
              </label>
              <select
                disabled={!isAdmin}
                value={settings.dateFormat}
                onChange={e => setSettings(prev => ({ ...prev, dateFormat: e.target.value as DateFormatType }))}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs font-medium text-[#13110F] focus:outline-none focus:ring-1 focus:ring-[#13110F]"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK, India, Europe: 11/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard: 11/11/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601: 2026-11-11)</option>
                <option value="DD-MMM-YYYY">DD-MMM-YYYY (Alpha: 11-Nov-2026)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                Time Representation
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '12h', label: '12-Hour (AM/PM)', example: '02:30 PM' },
                  { id: '24h', label: '24-Hour (Military)', example: '14:30' }
                ].map(tf => (
                  <button
                    key={tf.id}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setSettings(prev => ({ ...prev, timeFormat: tf.id as TimeFormatType }))}
                    className={`p-2 rounded-xl border text-left transition-colors ${
                      settings.timeFormat === tf.id
                        ? 'border-[#13110F] bg-[#FAF7F2] font-semibold text-[#13110F]'
                        : 'border-[rgba(19,17,15,0.08)] bg-white text-[#6B6560] hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs block">{tf.label}</span>
                    <span className="text-[10px] font-mono text-[#8C847D]">{tf.example}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* E. Measurement Units Configuration */}
        <Card className="p-4 space-y-3.5 bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#1E3A8A]" />
              <h3 className="text-xs font-bold text-[#13110F]">E. Measurement Standards</h3>
            </div>
            <Badge variant="neutral" size="sm">Physical Units</Badge>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-semibold text-[#13110F] block">
              Unit System
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() =>
                  setSettings(prev => ({
                    ...prev,
                    measurementSystem: 'metric',
                    weightUnit: 'kg',
                    dimensionUnit: 'cm',
                    distanceUnit: 'km',
                    temperatureUnit: '°C'
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  settings.measurementSystem === 'metric'
                    ? 'border-[#13110F] bg-[#FAF7F2] font-semibold text-[#13110F]'
                    : 'border-[rgba(19,17,15,0.08)] bg-white text-[#6B6560] hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block">Metric System</span>
                <span className="text-[10px] text-[#8C847D] block mt-0.5">kg, g, cm, m, km, °C</span>
              </button>

              <button
                type="button"
                disabled={!isAdmin}
                onClick={() =>
                  setSettings(prev => ({
                    ...prev,
                    measurementSystem: 'us_customary',
                    weightUnit: 'lb',
                    dimensionUnit: 'in',
                    distanceUnit: 'mi',
                    temperatureUnit: '°F'
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  settings.measurementSystem === 'us_customary'
                    ? 'border-[#13110F] bg-[#FAF7F2] font-semibold text-[#13110F]'
                    : 'border-[rgba(19,17,15,0.08)] bg-white text-[#6B6560] hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block">US Customary</span>
                <span className="text-[10px] text-[#8C847D] block mt-0.5">lb, oz, in, ft, mi, °F</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-[#6B6560] space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Weight active unit:</span>
                <span className="font-bold text-[#13110F]">{settings.weightUnit}</span>
              </div>
              <div className="flex justify-between">
                <span>Length/Dimensions unit:</span>
                <span className="font-bold text-[#13110F]">{settings.dimensionUnit}</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature unit:</span>
                <span className="font-bold text-[#13110F]">{settings.temperatureUnit}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* F. Language and Locale */}
        <Card className="p-4 space-y-3.5 bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#7C3AED]" />
              <h3 className="text-xs font-bold text-[#13110F]">F. Language & Locale</h3>
            </div>
            <Badge variant="neutral" size="sm">Locale</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                Enterprise Language Tag (BCP 47)
              </label>
              <select
                disabled={!isAdmin}
                value={settings.locale}
                onChange={e => setSettings(prev => ({ ...prev, locale: e.target.value as SupportedLocale }))}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs font-medium text-[#13110F] focus:outline-none focus:ring-1 focus:ring-[#13110F]"
              >
                <option value="en-IN">English (India) – en-IN</option>
                <option value="en-US">English (United States) – en-US</option>
                <option value="en-GB">English (United Kingdom) – en-GB</option>
                <option value="de-DE">German (Germany) – de-DE</option>
                <option value="fr-FR">French (France) – fr-FR</option>
              </select>
            </div>

            <p className="text-[11px] text-[#6B6560] leading-relaxed">
              Sets the primary locale dictionary for accessibility labels, table header sorting, browser speech recognition, and automated document generation.
            </p>
          </div>
        </Card>

        {/* G. Timezone */}
        <Card className="p-4 space-y-3.5 bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0284C7]" />
              <h3 className="text-xs font-bold text-[#13110F]">G. Business Timezone</h3>
            </div>
            <Badge variant="neutral" size="sm">IANA</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                Primary Operational Timezone
              </label>
              <select
                disabled={!isAdmin}
                value={settings.timezone}
                onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs font-medium text-[#13110F] focus:outline-none focus:ring-1 focus:ring-[#13110F]"
              >
                {TIMEZONE_REGISTRY.map(tz => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-[#6B6560] font-mono">
              <span className="block text-[#8C847D]">Active IANA Identifier:</span>
              <span className="font-bold text-[#13110F]">{settings.timezone}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Governance & Audit Metadata Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6B6560]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#8C847D]" />
          <span>
            Last modified by <strong>{settings.updatedBy}</strong> on{' '}
            <span className="font-mono">{formatDateTime(settings.lastUpdated, settings)}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
            Database & LocalStorage Synchronized
          </span>
          <button
            onClick={handleSave}
            disabled={!isAdmin || isSaving}
            className="text-xs font-bold text-[#13110F] hover:text-[#92400E] hover:underline flex items-center gap-1"
          >
            Apply across all portals <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

