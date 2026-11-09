import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  CreditCard,
  ArrowRight,
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
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Procurement Authorization Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop governance. AI-generated purchase orders require authorized business approval before payment checkout.
          </p>
        </div>
        <Badge variant="success">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Human Approval Gate Active
        </Badge>
      </div>

      {/* Pending Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Approval Requests ({pendingApprovals.length})
          </h2>
          <span className="text-xs text-slate-500">Corporate Spending Limit: ₹2,50,000 threshold</span>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingApprovals.map(appr => {
              const po = appr.purchase_order;
              if (!po) return null;
              const isHighlighted = highlightPo === po.id || highlightPo === po.po_number;

              return (
                <Card
                  key={appr.id}
                  className={`p-5 border transition-all ${
                    isHighlighted ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-blue-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-brand-blue text-sm">{po.po_number}</span>
                        <Badge variant="warning">AWAITING AUTHORIZATION</Badge>
                        <span className="text-xs text-slate-400">• Created on {formatDateTime(appr.created_at)}</span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                        <span><strong>Supplier:</strong> {po.supplier_name}</span>
                        <span><strong>Line Items:</strong> {po.items.length} items ({po.items.map(i => i.product_name).join(', ')})</span>
                        <span><strong>Buyer:</strong> {appr.requested_by_name}</span>
                      </div>

                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{appr.comments || 'Autonomous order prepared for department requirement.'}"
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:border-slate-200 lg:pl-6 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Authorized Amount</span>
                        <span className="text-lg font-bold text-navy-900">{formatCurrency(po.total_amount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isSubmitting}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleApprove(appr.id)}
                        >
                          Approve Order
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApproval(appr)}
                        >
                          Review & Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500 bg-slate-50/50">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-navy-900">All procurement requests have been reviewed!</p>
            <p className="text-xs text-slate-500 mt-1">
              New purchase orders generated by the AI agent will appear here automatically for human authorization.
            </p>
          </Card>
        )}
      </div>

      {/* Historical Approvals Section */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold text-navy-900">Authorization History & Audit Records</h3>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">PO Number</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Decided</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicalApprovals.map(appr => {
                  const po = appr.purchase_order;
                  if (!po) return null;

                  return (
                    <tr key={appr.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-brand-blue">{po.po_number}</td>
                      <td className="py-3 px-3 font-medium text-navy-900">{po.supplier_name}</td>
                      <td className="py-3 px-3 font-bold text-navy-900">{formatCurrency(po.total_amount)}</td>
                      <td className="py-3 px-3">
                        <Badge variant={appr.status === 'approved' ? 'success' : 'danger'}>
                          {appr.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDateTime(appr.updated_at)}</td>
                      <td className="py-3 px-4 text-right">
                        {appr.status === 'approved' && po.status === 'approved' ? (
                          <Link to={`/payments?po=${po.id}`}>
                            <Button variant="paypal" size="sm">
                              Proceed to PayPal Checkout
                            </Button>
                          </Link>
                        ) : (
                          <Link to={`/orders?id=${po.id}`}>
                            <Button variant="ghost" size="sm">
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
          title={`Authorization Review: ${selectedApproval.purchase_order.po_number}`}
          subtitle={`Total Amount: ${formatCurrency(selectedApproval.purchase_order.total_amount)} | Supplier: ${selectedApproval.purchase_order.supplier_name}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Authorization Decision Notes</label>
              <textarea
                rows={3}
                placeholder="Enter audit approval remarks or reason for rejection..."
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="danger"
                isLoading={isSubmitting}
                onClick={() => handleReject(selectedApproval.id)}
              >
                Reject Order
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={() => handleApprove(selectedApproval.id)}
              >
                Approve & Grant Authorization
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
