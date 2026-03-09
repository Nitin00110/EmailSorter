import React, { useState } from 'react';
import { Send, Sparkles, Loader2, Check } from 'lucide-react';
import { emailApi, aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

const Compose: React.FC = () => {
  const { user } = useAuth();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToast } = useToast();

  const isDemoMode = user?.email === 'demo@example.com';

  const handleSend = async () => {
    if (!to || !subject || !body) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setIsSending(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await emailApi.sendEmail({ to, subject, body });
      }
      setShowSuccess(true);
      addToast('Email sent successfully!', 'success');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setTo('');
        setSubject('');
        setBody('');
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      addToast('Failed to send email', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefine = async () => {
    if (!body.trim()) {
      addToast('Please write something to refine', 'error');
      return;
    }

    setIsRefining(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 800));
        // Simple demo refinement
        setBody(body 
          + '\n\n[Demo: AI would refine this text to be more professional and polished.]');
      } else {
        const refined = await aiApi.refine({ draft: body });
        setBody(refined);
      }
      addToast('Email refined with AI!', 'success');
    } catch (error) {
      addToast('Failed to refine email', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Email Sent!</h2>
            <p className="text-slate-500">Your email has been sent successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compose Email</h1>
        <p className="text-slate-500">Write and send emails with AI assistance</p>
      </div>

      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Demo Mode:</strong> Emails won't actually be sent. Connect your backend at localhost:8080 for real functionality.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* To Field */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Message</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefine}
                disabled={isRefining || !body.trim()}
                className="gap-2"
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI Refine
              </Button>
            </div>
            <Textarea
              id="body"
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <p className="text-xs text-slate-500">
              Use AI Refine to improve your writing, fix grammar, and make your message more professional.
            </p>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={isSending || !to || !subject || !body}
              className="gap-2 min-w-[120px]"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compose;
