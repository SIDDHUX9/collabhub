'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { CheckCircle, Zap } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus('success');
          toast.success('Email verified!');
        } else {
          setStatus('error');
          toast.error(data.error || 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        toast.error('Something went wrong');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-[#00ffff]/10 rounded-full blur-3xl top-20 left-10 animate-pulse" />
        <div className="absolute w-96 h-96 bg-[#ff00ff]/10 rounded-full blur-3xl bottom-20 right-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Zap className="w-8 h-8 text-[#00ffff]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#00ffff] to-[#ff00ff] text-transparent bg-clip-text">
              CollabHub
            </span>
          </Link>
        </div>

        <Card className="glass-strong border-white/20">
          <CardContent className="pt-6 text-center">
            {status === 'verifying' && (
              <div>
                <div className="w-16 h-16 border-4 border-[#00ffff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Verifying Email</h2>
                <p className="text-muted-foreground">Please wait...</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <CheckCircle className="w-16 h-16 text-[#00ffff] mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
                <p className="text-muted-foreground mb-6">Your account is now active.</p>
                <Link href="/auth/signin">
                  <Button className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✗</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
                <p className="text-muted-foreground mb-6">The verification link is invalid or expired.</p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="glass border-white/20">
                    Try Again
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}