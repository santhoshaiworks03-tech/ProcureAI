import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { store } from '../../lib/store';
import { ApprovalRequest, PurchaseOrder } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const ApprovalsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightPo = searchParams.get('po');
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(store.getApprovalRequests());
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setApprovals(store.getApprovalRequests());
    });
    return unsub;
  }, []);

  const handleApprove = async (approvalId: string) => {
    setIsSubmitting(true);
    try {
      await store.approvePurchaseOrder(approvalId, actionNotes || 'Authorized for procurement checkout.');
      setActionNotes('');
      setSelectedApproval(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!actionNotes.trim()) {
      alert('Please specify a rejection reason in the notes field.');
      return;
    }
    setIsSubmitting(true);
    try {
      await store.rejectPurchaseOrder(approvalId, actionNotes);
      setActionNotes('');
      setSelectedApproval(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const historicalApprovals = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">Authorizations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Human governance gate. Purchase orders require authorized sign-off before payment checkout
          </p>
        </div>
        <Badge variant="neutral">
          Approval threshold: ₹2,50,000
        </Badge>
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink-950 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Pending authorization requests ({pendingApprovals.length})
          </h2>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {pendingApprovals.map(appr => {
              const po = appr.purchase_order;
              if (!po) return null;
              const isHighlighted = highlightPo === po.id || highlightPo === po.po_number;

              return (
                <Card
                  key={appr.id}
                  className={`p-4 border transition-colors ${
                    isHighlighted ? 'border-blue-500/80 ring-1 ring-blue-500/20 bg-blue-50/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-ink-950 text-xs">{po.po_number}</span>
                        <Badge variant="warning" dot size="sm">Awaiting sign-off</Badge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDateTime(appr.created_at)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                        <span><strong>Vendor:</strong> {po.supplier_name}</span>
                        <span><strong>Items:</strong> {po.items.length} items ({po.items.map(i => i.product_name).join(', ')})</span>
                        <span><strong>Requester:</strong> {appr.requested_by_name}</span>
                      </div>

                      <p className="text-xs text-slate-500 bg-slate-50/70 p-2 rounded-md border border-slate-100">
                        {appr.comments || 'Order prepared for operational procurement.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:border-slate-200/80 lg:pl-6 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-slate-400 block">Total amount</span>
                        <span className="text-base font-semibold text-ink-950 tabular-nums font-mono">{formatCurrency(po.total_amount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApproval(appr)}
                        >
                          Review
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isSubmitting}
                          onClick={() => handleApprove(appr.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500 bg-slate-50/50 border border-slate-200/80">
            <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-ink-950">No pending authorizations</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              New purchase orders generated by the procurement agent will appear here for sign-off
            </p>
          </Card>
        )}
      </div>

      {/* Historical Approvals Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <h3 className="text-xs font-semibold text-ink-950">Authorization history</h3>
        <Card className="overflow-hidden p-0 border border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3.5 font-medium">PO number</th>
                  <th className="py-2.5 px-3 font-medium">Supplier</th>
                  <th className="py-2.5 px-3 font-medium">Amount</th>
                  <th className="py-2.5 px-3 font-medium">Decision</th>
                  <th className="py-2.5 px-3 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicalApprovals.map(appr => {
                  const po = appr.purchase_order;
                  if (!po) return null;

                  return (
                    <tr key={appr.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3.5 font-mono font-medium text-ink-950">{po.po_number}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{po.supplier_name}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink-950 tabular-nums">{formatCurrency(po.total_amount)}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={appr.status === 'approved' ? 'success' : 'danger'} dot size="sm">
                          {appr.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] tabular-nums">{formatDateTime(appr.updated_at)}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        {appr.status === 'approved' && po.status === 'approved' ? (
                          <Link to={`/payments?po=${po.id}`}>
                            <Button variant="primary" size="sm">
                              Checkout
                            </Button>
                          </Link>
                        ) : (
                          <Link to={`/orders?id=${po.id}`}>
                            <Button variant="outline" size="sm">
                              View PO
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Review & Notes Modal */}
      {selectedApproval && selectedApproval.purchase_order && (
        <Modal
          isOpen={Boolean(selectedApproval)}
          onClose={() => setSelectedApproval(null)}
          title={`Authorization review: ${selectedApproval.purchase_order.po_number}`}
          subtitle={`Total: ${formatCurrency(selectedApproval.purchase_order.total_amount)} · Vendor: ${selectedApproval.purchase_order.supplier_name}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Audit remarks</label>
              <textarea
                rows={3}
                placeholder="Enter audit approval remarks or reason for rejection"
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200/90 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                isLoading={isSubmitting}
                onClick={() => handleReject(selectedApproval.id)}
              >
                Reject order
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={() => handleApprove(selectedApproval.id)}
              >
                Approve order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
