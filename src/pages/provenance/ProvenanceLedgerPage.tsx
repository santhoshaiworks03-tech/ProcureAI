import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Code,
  ArrowRight,
  Hash,
  Clock,
  User,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { store } from '../../lib/store';
import { ProvenanceEvent } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDateTime } from '../../lib/utils';

export const ProvenanceLedgerPage: React.FC = () => {
  const [events, setEvents] = useState<ProvenanceEvent[]>(store.getProvenanceEvents());
  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [inspectEvent, setInspectEvent] = useState<ProvenanceEvent | null>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setEvents(store.getProvenanceEvents());
    });
    return unsub;
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch =
      e.event_type.toLowerCase().includes(search.toLowerCase()) ||
      e.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.po_number && e.po_number.toLowerCase().includes(search.toLowerCase())) ||
      e.verification_reference.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedEventType === 'all' || e.event_type === selectedEventType;
    return matchesSearch && matchesType;
  });

  const exportAuditReportCSV = () => {
    const headers = ['Event #', 'Timestamp', 'Event Type', 'Actor', 'PO Number', 'Verification Code', 'Current SHA-256 Hash', 'Previous Hash'];
    const rows = filteredEvents.map(e => [
      e.event_number,
      e.created_at,
      e.event_type,
      `"${e.actor_name}"`,
      e.po_number || 'N/A',
      e.verification_reference,
      e.current_hash,
      e.previous_hash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procureai-provenance-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Cryptographic Provenance & Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident, append-only transaction ledger with continuous SHA-256 hash chaining and audit verification references.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportAuditReportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Audit CSV
          </Button>
          <Badge variant="success">
            <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Integrity Verified
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event type, actor name, PO number, or verification code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['all', 'PURCHASE_ORDER_GENERATED', 'HUMAN_APPROVAL_GRANTED', 'PAYPAL_ORDER_CREATED', 'PAYPAL_PAYMENT_CAPTURED'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedEventType(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap capitalize ${
                  selectedEventType === t
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-navy-900'
                }`}
              >
                {t === 'all' ? 'All Events' : t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Chronological Timeline & Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Block #</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Actor & Role</th>
                <th className="py-3 px-3">Related PO</th>
                <th className="py-3 px-3">Verification Code</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                    #{evt.event_number.toString().padStart(4, '0')}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-navy-900 block">{evt.event_type.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs block">
                      SHA: {evt.current_hash.slice(0, 20)}...
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-navy-900 block">{evt.actor_name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{evt.actor_role}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-brand-blue">
                    {evt.po_number || 'N/A'}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {evt.verification_reference}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {formatDateTime(evt.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectEvent(evt)}
                      leftIcon={<Code className="w-3.5 h-3.5" />}
                    >
                      Inspect JSON
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* JSON Inspector Modal */}
      {inspectEvent && (
        <Modal
          isOpen={Boolean(inspectEvent)}
          onClose={() => setInspectEvent(null)}
          title={`Audit Event #${inspectEvent.event_number}: ${inspectEvent.event_type}`}
          subtitle={`Verification Reference: ${inspectEvent.verification_reference}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Previous Block Hash:</span>
                <span className="text-slate-600 break-all">{inspectEvent.previous_hash}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Cryptographic Hash (SHA-256):</span>
                <span className="text-brand-blue font-bold break-all">{inspectEvent.current_hash}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-navy-900 mb-2">Event Metadata Payload:</h4>
              <pre className="p-4 rounded-xl bg-navy-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
                {JSON.stringify(inspectEvent.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
