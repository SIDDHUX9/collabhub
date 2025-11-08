'use client'

import Link from 'next/link'
import { useAuthStore, useNotificationStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, LogOut, User, Settings, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Header() {
  const { user, logout, isLoading } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    logout();
    router.push('/');
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-[#00ffff]" />
          <span className="text-xl font-bold bg-gradient-to-r from-[#00ffff] to-[#ff00ff] text-transparent bg-clip-text">
            CollabHub
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/projects" className="text-sm hover:text-[#00ffff] transition">
            Projects
          </Link>
          {user && (
            <Link href="/profile" className="text-sm hover:text-[#00ffff] transition">
              Profile
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-sm hover:text-[#00ffff] transition">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#ff00ff] text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer border-2 border-[#00ffff]/30 hover:border-[#00ffff] transition">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-gradient-to-br from-[#00ffff] to-[#ff00ff] text-black font-bold">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-strong w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="hover:text-[#00ffff]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}