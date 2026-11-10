import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Clock,
  ArrowRight,
  Check
} from 'lucide-react';
import { store } from '../../lib/store';
import { NotificationItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(store.getNotifications());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setNotifications(store.getNotifications());
    });
    return unsub;
  }, []);

  const filtered = notifications.filter(n => filter === 'all' || !n.is_read);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'payment_success':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case 'approved':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#3E5C31]" />;
      case 'approval_needed':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Procurement events, approval requests, payment confirmations, and stock alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => store.markAllNotificationsAsRead()}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
            filter === 'all' ? 'bg-ink-900 text-white' : 'text-slate-600 hover:text-ink-950'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
            filter === 'unread' ? 'bg-ink-900 text-white' : 'text-slate-600 hover:text-ink-950'
          }`}
        >
          Unread ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.map(notif => (
          <Card
            key={notif.id}
            className={`p-3.5 transition-colors border ${
              !notif.is_read ? 'bg-white border-blue-500/30' : 'bg-slate-50/60 border-slate-200/80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-slate-100 flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-ink-950">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13110F] inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] font-mono text-slate-400 block pt-0.5 tabular-nums">
                    {formatDateTime(notif.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {notif.link_url && (
                  <Link to={notif.link_url}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => store.markNotificationAsRead(notif.id)}
                      rightIcon={<ArrowRight className="w-3 h-3 text-slate-400" />}
                    >
                      View
                    </Button>
                  </Link>
                )}
                {!notif.is_read && (
                  <button
                    onClick={() => store.markNotificationAsRead(notif.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
