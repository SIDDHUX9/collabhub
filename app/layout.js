'use client'

import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'

export default function RootLayout({ children }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('authToken');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [setUser]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>CollabHub - Where Innovators Build Together</title>
        <meta name="description" content="The premier digital nexus for hackers, founders, and creators to form teams and build projects." />
      </head>
      <body className="min-h-screen bg-[#0f0f0f] text-white antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}