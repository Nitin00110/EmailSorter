import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ChevronLeft, Calendar, User, Loader2, Sparkles, X } from 'lucide-react';
import { emailApi, aiApi } from '@/services/api';
import type { EmailSummary, EmailDetail } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

// Demo emails for when backend is unavailable
const demoEmails: EmailSummary[] = [
  { id: '1', from: 'john.doe@example.com', subject: 'Project Update - Q1 Review', date: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', from: 'sarah.smith@company.com', subject: 'Meeting Invitation: Team Sync', date: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', from: 'support@service.com', subject: 'Your subscription renewal', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', from: 'marketing@newsletter.com', subject: 'Weekly Newsletter - March 2025', date: new Date(Date.now() - 172800000).toISOString() },
];

const demoEmailDetails: Record<string, EmailDetail> = {
  '1': {
    id: '1',
    from: 'john.doe@example.com',
    subject: 'Project Update - Q1 Review',
    date: new Date(Date.now() - 3600000).toISOString(),
    body: 'Hi there,\n\nI wanted to share the latest updates on our Q1 project review. We\'ve made significant progress on the key milestones and are on track to complete the deliverables by the end of the month.\n\nKey highlights:\n- Backend API development: 90% complete\n- Frontend dashboard: 75% complete\n- Testing phase: Starting next week\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\nJohn',
  },
  '2': {
    id: '2',
    from: 'sarah.smith@company.com',
    subject: 'Meeting Invitation: Team Sync',
    date: new Date(Date.now() - 7200000).toISOString(),
    body: 'Hello Team,\n\nYou are invited to attend our weekly team sync meeting.\n\nDate: Tomorrow at 2:00 PM\nLocation: Conference Room B\n\nAgenda:\n1. Sprint retrospective\n2. Upcoming tasks\n3. Blockers discussion\n\nPlease confirm your attendance.\n\nThanks,\nSarah',
  },
  '3': {
    id: '3',
    from: 'support@service.com',
    subject: 'Your subscription renewal',
    date: new Date(Date.now() - 86400000).toISOString(),
    body: 'Dear Valued Customer,\n\nYour subscription is set to renew on March 15, 2025.\n\nPlan: Premium\nAmount: $29.99/month\n\nIf you wish to make any changes to your subscription, please visit your account settings.\n\nThank you for your continued support!\n\nCustomer Support Team',
  },
  '4': {
    id: '4',
    from: 'marketing@newsletter.com',
    subject: 'Weekly Newsletter - March 2025',
    date: new Date(Date.now() - 172800000).toISOString(),
    body: 'Welcome to this week\'s newsletter!\n\nIn this edition:\n- Industry trends and insights\n- New product announcements\n- Upcoming events\n- Tips and best practices\n\nRead more on our blog!\n\nUnsubscribe | Update Preferences',
  },
};

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyIntent, setReplyIntent] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const { addToast } = useToast();

  const isDemoMode = user?.email === 'demo@example.com';

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setEmails(demoEmails);
      } else {
        const data = await emailApi.getInbox();
        setEmails(data);
      }
    } catch (error) {
      addToast('Failed to load emails', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [isDemoMode]);

  const handleEmailClick = async (email: EmailSummary) => {
    setIsLoadingDetail(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSelectedEmail(demoEmailDetails[email.id] || null);
      } else {
        const detail = await emailApi.getEmailById(email.id);
        setSelectedEmail(detail);
      }
      setShowReplyForm(false);
      setReplyIntent('');
      setGeneratedReply('');
    } catch (error) {
      addToast('Failed to load email details', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!replyIntent.trim() || !selectedEmail) {
      addToast('Please enter your reply intent', 'error');
      return;
    }

    setIsGeneratingReply(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGeneratedReply(`Dear ${selectedEmail.from.split('@')[0].replace('.', ' ')},\n\nThank you for your email regarding "${selectedEmail.subject}".\n\nBased on your request to "${replyIntent}", I would be happy to help. Let me know if you need any further assistance.\n\nBest regards,\nDemo User`);
      } else {
        const reply = await aiApi.generateReply({
          originalEmail: selectedEmail.body,
          intent: replyIntent,
        });
        setGeneratedReply(reply);
      }
      addToast('Reply generated!', 'success');
    } catch (error) {
      addToast('Failed to generate reply', 'error');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEmailForIframe = (body: string) => {
    if (!body) return '';
    // If it looks like real HTML, leave it alone
    if (body.includes('<html') || body.includes('<body') || body.includes('<div')) {
      return body;
    }
    // If it is plain text, wrap it so the browser preserves the spacing and line breaks
    return `<pre style="font-family: sans-serif; padding: 20px; white-space: pre-wrap; font-size: 14px;">${body}</pre>`;
  };

  if (selectedEmail) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedEmail(null);
              setShowReplyForm(false);
              setReplyIntent('');
              setGeneratedReply('');
            }}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Inbox
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{selectedEmail.subject}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <User className="w-4 h-4" />
                  <span>From: {selectedEmail.from}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedEmail.date)}</span>
                </div>
              </div>
              <Button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI Reply
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="w-full min-h-[600px] bg-white rounded-md overflow-hidden border border-slate-200">
                {/* The iframe creates an isolated environment. 
                  srcDoc safely injects the HTML without Tailwind CSS ruining the formatting.
                  sandbox protects your app from malicious scripts inside the email.
                */}
                <iframe
                  title="Email Content"
                  srcDoc={formatEmailForIframe(selectedEmail.body)}
                  className="w-full h-full min-h-[600px] border-none"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Reply Form */}
        {showReplyForm && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI-Powered Reply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>What would you like to say? (e.g., "tell them yes", "decline politely")</Label>
                <Input
                  placeholder="Enter your reply intent..."
                  value={replyIntent}
                  onChange={(e) => setReplyIntent(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerateReply}
                disabled={isGeneratingReply || !replyIntent.trim()}
                className="gap-2"
              >
                {isGeneratingReply ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Reply
              </Button>

              {generatedReply && (
                <div className="space-y-2">
                  <Label>Generated Reply:</Label>
                  <Textarea
                    value={generatedReply}
                    onChange={(e) => setGeneratedReply(e.target.value)}
                    className="min-h-[150px] bg-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReply);
                        addToast('Copied to clipboard!', 'success');
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGeneratedReply('');
                        setReplyIntent('');
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
          <p className="text-slate-500">Your recent emails</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEmails}
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

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No emails yet</h3>
              <p className="text-slate-500 max-w-sm mt-1">
                Your inbox is empty. New emails will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="divide-y divide-slate-100">
                {emails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900 truncate">
                          {email.from}
                        </p>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium truncate mt-1">
                        {email.subject}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inbox;
