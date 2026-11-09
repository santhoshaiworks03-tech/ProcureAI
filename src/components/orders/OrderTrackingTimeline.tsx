import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Truck,
  Building,
  AlertCircle
} from 'lucide-react';
import { PurchaseOrder } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDate, formatDateTime } from '../../lib/utils';

interface OrderTrackingTimelineProps {
  order: PurchaseOrder;
}

interface TrackingStep {
  stageNumber: number;
  label: string;
  subtext: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  icon: React.ElementType;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ order }) => {
  // Map Purchase Order status to 8 stages
  const statusToStageLevel: Record<string, number> = {
    draft: 1,
    pending_approval: 3,
    approved: 4,
    payment_pending: 4,
    paid: 5,
    issued: 6,
    processing: 6,
    shipped: 7,
    delivered: 8,
    cancelled: -1
  };

  const currentLevel = statusToStageLevel[order.status] || 3;
  const isCancelled = order.status === 'cancelled';

  const stages: TrackingStep[] = [
    {
      stageNumber: 1,
      label: 'Request Submitted',
      subtext: 'Procurement requirement parsed by AI',
      timestamp: order.created_at,
      isCompleted: currentLevel >= 1 && !isCancelled,
      isCurrent: currentLevel === 1 && !isCancelled,
      icon: FileText
    },
    {
      stageNumber: 2,
      label: 'Supplier Selected',
      subtext: order.supplier_name,
      timestamp: order.created_at,
      isCompleted: currentLevel >= 2 && !isCancelled,
      isCurrent: currentLevel === 2 && !isCancelled,
      icon: Building
    },
    {
      stageNumber: 3,
      label: 'Purchase Order Drafted',
      subtext: `PO Ref: ${order.po_number}`,
      timestamp: order.created_at,
      isCompleted: currentLevel >= 3 && !isCancelled,
      isCurrent: currentLevel === 3 && !isCancelled,
      icon: FileText
    },
    {
      stageNumber: 4,
      label: 'Governance Approval',
      subtext: ['approved', 'payment_completed', 'issued', 'delivered'].includes(order.status)
        ? 'Approved by Authorized Signatory'
        : 'Pending managerial limit review',
      timestamp: ['approved', 'payment_completed', 'issued', 'delivered'].includes(order.status) ? order.updated_at : undefined,
      isCompleted: currentLevel >= 4 && !isCancelled,
      isCurrent: currentLevel === 4 && !isCancelled,
      icon: CheckCircle2
    },
    {
      stageNumber: 5,
      label: 'PayPal Payment Settled',
      subtext: order.payment_reference ? `Capture Ref: ${order.payment_reference}` : 'Pending PayPal checkout capture',
      timestamp: order.payment_reference ? order.updated_at : undefined,
      isCompleted: currentLevel >= 5 && !isCancelled,
      isCurrent: currentLevel === 5 && !isCancelled,
      icon: CreditCard
    },
    {
      stageNumber: 6,
      label: 'Order Processing',
      subtext: 'Supplier allocated warehouse inventory',
      timestamp: currentLevel >= 6 ? order.updated_at : undefined,
      isCompleted: currentLevel >= 6 && !isCancelled,
      isCurrent: currentLevel === 6 && !isCancelled,
      icon: Package
    },
    {
      stageNumber: 7,
      label: 'Order Shipped',
      subtext: 'Carrier dispatched with tracking manifest',
      timestamp: currentLevel >= 7 ? order.updated_at : undefined,
      isCompleted: currentLevel >= 7 && !isCancelled,
      isCurrent: currentLevel === 7 && !isCancelled,
      icon: Truck
    },
    {
      stageNumber: 8,
      label: 'Order Delivered',
      subtext: 'Physical goods accepted at facility',
      timestamp: currentLevel >= 8 ? order.expected_delivery_date : undefined,
      isCompleted: currentLevel >= 8 && !isCancelled,
      isCurrent: currentLevel === 8 && !isCancelled,
      icon: CheckCircle2
    }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Procurement Fulfillment Lifecycle
            </h4>
            <Badge variant="outline" size="sm" className="font-mono">
              {order.po_number}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status tracking from autonomous quotation to physical enterprise receiving
          </p>
        </div>

        <Badge
          variant={
            order.status === 'delivered'
              ? 'success'
              : order.status === 'cancelled'
              ? 'danger'
              : 'info'
          }
          dot
          size="sm"
        >
          {order.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {isCancelled ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>This purchase order was cancelled during the governance review cycle.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stages.map(stage => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.stageNumber}
                className={`p-3.5 rounded-xl border transition-all ${
                  stage.isCurrent
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400 shadow-sm'
                    : stage.isCompleted
                    ? 'bg-slate-50 border-slate-200/90 text-slate-800'
                    : 'bg-white border-slate-100 opacity-60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    stage.isCurrent
                      ? 'bg-blue-600 text-white'
                      : stage.isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    Step {stage.stageNumber}/8
                  </span>
                </div>

                <p className="text-xs font-bold truncate text-slate-900">{stage.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  {stage.subtext}
                </p>

                {stage.timestamp && (
                  <p className="text-[10px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-200/60">
                    {formatDate(stage.timestamp)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
