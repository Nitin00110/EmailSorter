import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Clock, Eye, Loader2, Mail } from 'lucide-react';
import { emailApi } from '@/services/api';
import type { SentEmailStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

// Demo sent emails for when backend is unavailable
const demoSentEmails: SentEmailStatus[] = [
  {
    trackingId: '1',
    recipientEmail: 'client@company.com',
    subject: 'Project Proposal',
    isRead: true,
    readAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    trackingId: '2',
    recipientEmail: 'team@startup.io',
    subject: 'Weekly Report',
    isRead: true,
    readAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    trackingId: '3',
    recipientEmail: 'vendor@supplier.com',
    subject: 'Invoice #1234',
    isRead: false,
    readAt: null,
  },
  {
    trackingId: '4',
    recipientEmail: 'partner@business.com',
    subject: 'Partnership Agreement',
    isRead: false,
    readAt: null,
  },
];

const Sent: React.FC = () => {
  const { user } = useAuth();
  const [sentEmails, setSentEmails] = useState<SentEmailStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const isDemoMode = user?.email === 'demo@example.com';

  const fetchSentStatus = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSentEmails(demoSentEmails);
      } else {
        const data = await emailApi.getSentStatus();
        setSentEmails(data);
      }
    } catch (error) {
      addToast('Failed to load sent emails', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSentStatus();
  }, [isDemoMode]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not read yet';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sent / Tracking</h1>
          <p className="text-slate-500">Track read status of your sent emails</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSentStatus}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Demo Mode:</strong> Showing sample data. Connect your backend at localhost:8080 for real data.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sentEmails.length}</p>
              <p className="text-sm text-slate-500">Total Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sentEmails.filter((e) => e.isRead).length}
              </p>
              <p className="text-sm text-slate-500">Read</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sentEmails.filter((e) => !e.isRead).length}
              </p>
              <p className="text-sm text-slate-500">Unread</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : sentEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No sent emails</h3>
              <p className="text-slate-500 max-w-sm mt-1">
                Emails you send will appear here with their read status.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="divide-y divide-slate-100">
                {sentEmails.map((email) => (
                  <div
                    key={email.trackingId}
                    className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        email.isRead ? 'bg-green-100' : 'bg-amber-100'
                      }`}
                    >
                      {email.isRead ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900 truncate">
                          {email.recipientEmail}
                        </p>
                        <Badge
                          variant={email.isRead ? 'default' : 'secondary'}
                          className={
                            email.isRead
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }
                        >
                          {email.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 font-medium truncate mt-1">
                        {email.subject}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {email.isRead
                          ? `Read at: ${formatDate(email.readAt)}`
                          : 'Not opened yet'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sent;
