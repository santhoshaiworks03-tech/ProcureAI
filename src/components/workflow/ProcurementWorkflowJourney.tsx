import React, { useState } from 'react';
import {
  FileText,
  Bot,
  Search,
  SlidersHorizontal,
  CheckSquare,
  CreditCard,
  Truck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface WorkflowStage {
  id: number;
  label: string;
  shortDesc: string;
  icon: React.ElementType;
  status: 'completed' | 'active' | 'upcoming';
  detail: string;
  techBadge: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 1,
    label: 'Purchase Request',
    shortDesc: 'Natural language input',
    icon: FileText,
    status: 'completed',
    detail: 'Enterprise user specifies procurement requirements in conversational English.',
    techBadge: 'Structured Schema'
  },
  {
    id: 2,
    label: 'AI Analysis',
    shortDesc: 'Gemini 1.5 Pro parsing',
    icon: Bot,
    status: 'completed',
    detail: 'Autonomous LLM extracts SKU, GTIN, target specifications, and budget ceilings.',
    techBadge: 'Gemini 1.5 Pro'
  },
  {
    id: 3,
    label: 'Supplier Discovery',
    shortDesc: 'Database catalog search',
    icon: Search,
    status: 'completed',
    detail: 'Matches requirements strictly with verified vendors in PostgreSQL with Row Level Security.',
    techBadge: 'Supabase RLS'
  },
  {
    id: 4,
    label: 'Supplier Comparison',
    shortDesc: '5-factor scoring model',
    icon: SlidersHorizontal,
    status: 'completed',
    detail: 'Mathematical scoring across Price, Availability, Lead Time, SLA, and ESG compliance.',
    techBadge: 'Deterministic Math'
  },
  {
    id: 5,
    label: 'Purchase Approval',
    shortDesc: 'Human governance gate',
    icon: CheckSquare,
    status: 'completed',
    detail: 'Multi-tiered spend limit authorization prevents unauthorized financial outflow.',
    techBadge: 'Human-in-the-Loop'
  },
  {
    id: 6,
    label: 'PayPal Payment',
    shortDesc: 'Orders API v2 capture',
    icon: CreditCard,
    status: 'active',
    detail: '300-second tokenized session lock with SHA-256 price integrity capture.',
    techBadge: 'PayPal Orders v2'
  },
  {
    id: 7,
    label: 'Order Tracking',
    shortDesc: 'Real-time fulfillment',
    icon: Truck,
    status: 'upcoming',
    detail: 'Live status timeline from merchant dispatch to physical facility handover.',
    techBadge: 'Status Pipeline'
  },
  {
    id: 8,
    label: 'Audit Completion',
    shortDesc: 'SHA-256 block ledger',
    icon: CheckCircle2,
    status: 'upcoming',
    detail: 'Immutable tamper-evident record chained cryptographically with sequential hash block.',
    techBadge: 'SHA-256 Chained'
  }
];

interface ProcurementWorkflowJourneyProps {
  currentActiveStage?: number;
  interactive?: boolean;
}

export const ProcurementWorkflowJourney: React.FC<ProcurementWorkflowJourneyProps> = ({
  currentActiveStage = 6,
  interactive = true
}) => {
  const [selectedStageId, setSelectedStageId] = useState<number>(currentActiveStage);

  const selectedStage = WORKFLOW_STAGES.find(s => s.id === selectedStageId) || WORKFLOW_STAGES[0];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Autonomous Procurement & PayPal Settlement Journey
            </h3>
            <Badge variant="neutral" size="sm">ProcureAI 2.0</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end autonomous purchasing pipeline from natural language prompt to cryptographic ledger audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" dot size="sm">
            Stage {currentActiveStage} of {WORKFLOW_STAGES.length}
          </Badge>
        </div>
      </div>

      {/* Horizontal Connected Workflow Timeline */}
      <div className="relative overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center justify-between min-w-[760px] gap-2 px-1">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isCompleted = stage.id < currentActiveStage;
            const isActive = stage.id === currentActiveStage;
            const isSelected = selectedStageId === stage.id;
            const Icon = stage.icon;

            return (
              <React.Fragment key={stage.id}>
                <div
                  onClick={() => interactive && setSelectedStageId(stage.id)}
                  className={`flex flex-col items-center gap-2 group transition-all duration-200 ${
                    interactive ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                  title={`${stage.label}: ${stage.shortDesc}`}
                >
                  {/* Step Node */}
                  <div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500/40 ring-offset-2'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border border-slate-200/80 group-hover:border-slate-300'
                    } ${isSelected && !isActive ? 'ring-2 ring-slate-400 ring-offset-1' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white animate-ping"></span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="text-center w-20">
                    <span
                      className={`block text-[11px] font-semibold truncate ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-mono">
                      #{stage.id.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Connecting Line between steps */}
                {idx < WORKFLOW_STAGES.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 relative min-w-[20px]">
                    <div
                      className={`h-full transition-colors duration-300 ${
                        stage.id < currentActiveStage
                          ? 'bg-emerald-400'
                          : stage.id === currentActiveStage
                          ? 'bg-gradient-to-r from-blue-600 to-slate-200'
                          : 'bg-slate-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Card */}
      {selectedStage && (
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold flex-shrink-0 ${
              selectedStage.id === currentActiveStage
                ? 'bg-blue-600 text-white shadow-sm'
                : selectedStage.id < currentActiveStage
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {React.createElement(selectedStage.icon, { className: 'w-4 h-4' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Step {selectedStage.id}: {selectedStage.label}
                </span>
                <Badge
                  variant={
                    selectedStage.id === currentActiveStage
                      ? 'warning'
                      : selectedStage.id < currentActiveStage
                      ? 'success'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {selectedStage.id === currentActiveStage
                    ? 'In Progress'
                    : selectedStage.id < currentActiveStage
                    ? 'Verified & Complete'
                    : 'Upcoming Stage'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{selectedStage.detail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Engine:</span>
            <Badge variant="outline" size="sm" className="font-mono bg-white">
              {selectedStage.techBadge}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

