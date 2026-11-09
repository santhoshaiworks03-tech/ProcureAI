import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  Check,
  RotateCcw
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
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-brand-blue" />;
      case 'approval_needed':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time procurement alerts, approval requests, payment confirmations, and automated inventory triggers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => store.markAllNotificationsAsRead()}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'all' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'unread' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          Unread ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map(notif => (
          <Card
            key={notif.id}
            className={`p-4 transition-all border ${
              !notif.is_read ? 'bg-white border-brand-blue/30 shadow-card' : 'bg-slate-50/50 border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-navy-900">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand-blue inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
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
                      rightIcon={<ArrowRight className="w-3 h-3" />}
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
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
            No notifications in this view.
          </div>
        )}
      </div>
    </div>
  );
};
