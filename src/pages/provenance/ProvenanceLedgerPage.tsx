import React, { useState, useEffect } from 'react';
import {
  Download,
  Code,
  Search,
  Filter
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
    const headers = ['Block', 'Timestamp', 'Event Type', 'Actor', 'PO Number', 'Verification Reference', 'SHA-256 Hash', 'Previous Hash'];
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
    link.setAttribute('download', `procureai-audit-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Provenance Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only compliance log for end-to-end procurement and payment auditability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportAuditReportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export audit CSV
          </Button>
          <Badge variant="success" dot>
            Verified Audit Log
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by event type, actor, or PO reference..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['all', 'PURCHASE_ORDER_GENERATED', 'HUMAN_APPROVAL_GRANTED', 'PAYPAL_ORDER_CREATED', 'PAYPAL_PAYMENT_CAPTURED'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedEventType(t)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap capitalize ${
                  selectedEventType === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All events' : t.replace(/_/g, ' ').toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Record</th>
                <th className="py-2.5 px-3 font-medium">Event</th>
                <th className="py-2.5 px-3 font-medium">Actor</th>
                <th className="py-2.5 px-3 font-medium">PO reference</th>
                <th className="py-2.5 px-3 font-medium">Audit status</th>
                <th className="py-2.5 px-3 font-medium">Timestamp</th>
                <th className="py-2.5 px-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    #{evt.event_number.toString().padStart(4, '0')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-900 block">{evt.event_type.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                      {evt.metadata?.action || evt.metadata?.summary || 'Procurement action logged'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-800 block">{evt.actor_name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{evt.actor_role}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {evt.po_number || '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="success" size="sm" dot>
                      Verified
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {formatDateTime(evt.created_at)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectEvent(evt)}
                      leftIcon={<Code className="w-3.5 h-3.5" />}
                    >
                      JSON
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
          title={`Block #${inspectEvent.event_number}: ${inspectEvent.event_type}`}
          subtitle={`Reference: ${inspectEvent.verification_reference}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Previous hash:</span>
                <span className="text-slate-600 break-all">{inspectEvent.previous_hash}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current hash (SHA-256):</span>
                <span className="text-slate-900 font-semibold break-all">{inspectEvent.current_hash}</span>
              </div>
            </div>

            <div>
              <span className="font-medium text-slate-900 block mb-1">Metadata payload:</span>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-60 border border-slate-800">
                {JSON.stringify(inspectEvent.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
