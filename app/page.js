'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Rocket, Users, Zap, Shield, Code, Award } from 'lucide-react'
import Header from '@/components/Header'
import { useAuthStore } from '@/lib/store'

export default function Home() {
  const { user } = useAuthStore();

  const features = [
    {
      icon: <Rocket className="w-12 h-12 text-[#00ffff]" />,
      title: 'Project Nexus',
      description: 'Discover and join innovative projects. Find the perfect team to bring your ideas to life.'
    },
    {
      icon: <Users className="w-12 h-12 text-[#ff00ff]" />,
      title: 'Team Formation',
      description: 'Connect with hackers, founders, and creators. Build your dream team effortlessly.'
    },
    {
      icon: <Code className="w-12 h-12 text-[#00ffff]" />,
      title: 'Skill Genesis',
      description: 'Verify your skills through GitHub sync, portfolio review, or domain trials.'
    },
    {
      icon: <Shield className="w-12 h-12 text-[#ff00ff]" />,
      title: 'CollabSpace',
      description: 'Private team dashboard with task management, file sharing, and team chat.'
    },
    {
      icon: <Zap className="w-12 h-12 text-[#00ffff]" />,
      title: 'Real-time Collaboration',
      description: 'Stay synced with your team. Track progress, share updates, manage tasks.'
    },
    {
      icon: <Award className="w-12 h-12 text-[#ff00ff]" />,
      title: 'Showcase Success',
      description: 'Display your completed projects. Build your portfolio. Get recognized.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-[#00ffff]/10 rounded-full blur-3xl top-20 left-10 animate-pulse" />
          <div className="absolute w-96 h-96 bg-[#ff00ff]/10 rounded-full blur-3xl bottom-20 right-10 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Where Innovators
              <span className="block bg-gradient-to-r from-[#00ffff] to-[#ff00ff] text-transparent bg-clip-text mt-2">
                Build Together
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              The premier digital nexus for hackers, startup founders, and creators to form teams, 
              build groundbreaking projects, and showcase their success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/projects">
                  <Button size="lg" className="glass-strong border-[#00ffff]/50 hover:border-[#00ffff] text-[#00ffff] text-lg px-8 py-6">
                    Explore Projects
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-bold text-lg px-8 py-6">
                    Get Started Free
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button size="lg" variant="outline" className="glass border-white/20 hover:border-white/40 text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] text-transparent bg-clip-text">
                Build Great Things
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete platform designed for the modern builder. Collaborate, create, and ship faster.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="glass border-white/10 hover:border-white/20 h-full transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="glass-strong border-white/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff]/5 to-[#ff00ff]/5" />
              <CardContent className="p-12 relative z-10 text-center">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Start Building?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of innovators already collaborating on CollabHub.
                  Create your profile, verify your skills, and start building today.
                </p>
                {!user && (
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-bold text-lg px-10 py-6">
                      Join CollabHub Now
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 mt-20">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 CollabHub. Built for innovators, by innovators.</p>
        </div>
      </footer>
    </div>
  );
}