import React from 'react';
import { Mail, Chrome, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const Login: React.FC = () => {
  const { login } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Protected by Google OAuth2 with encrypted sessions',
    },
    {
      icon: Zap,
      title: 'AI-Powered Features',
      description: 'Smart email refinement and context-aware replies',
    },
    {
      icon: Lock,
      title: 'Read Receipt Tracking',
      description: 'Know when your emails are opened and read',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold">MailDash</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Modern Email Management with{' '}
            <span className="text-blue-400">AI Intelligence</span>
          </h1>

          <p className="text-slate-400 text-lg">
            Streamline your email workflow with smart composition, read tracking,
            and AI-powered assistance.
          </p>

          <div className="space-y-4 pt-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400">
                Sign in to access your email dashboard
              </p>
            </div>

            <Button
              onClick={login}
              className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-lg gap-3"
            >
              <Chrome className="w-6 h-6" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">
                  Secure Connection
                </span>
              </div>
            </div>

            <p className="text-center text-slate-400 text-sm">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your session is secured with encrypted cookies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
