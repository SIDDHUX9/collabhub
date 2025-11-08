'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Zap, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    portfolioLinks: []
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLink, setCurrentLink] = useState('');

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, currentSkill] });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addLink = () => {
    if (currentLink && !formData.portfolioLinks.includes(currentLink)) {
      setFormData({ ...formData, portfolioLinks: [...formData.portfolioLinks, currentLink] });
      setCurrentLink('');
    }
  };

  const removeLink = (link) => {
    setFormData({ ...formData, portfolioLinks: formData.portfolioLinks.filter(l => l !== link) });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Profile setup complete!');
        router.push('/projects');
      } else {
        toast.error(data.error || 'Setup failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-[#00ffff]/10 rounded-full blur-3xl top-20 left-10 animate-pulse" />
        <div className="absolute w-96 h-96 bg-[#ff00ff]/10 rounded-full blur-3xl bottom-20 right-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
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
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>Tell us about yourself to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="glass border-white/20 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., React, Python, Design)"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="glass border-white/20"
                />
                <Button type="button" onClick={addSkill} className="glass-strong border-[#00ffff]/50">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="glass-strong px-3 py-1 text-sm">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Portfolio Links</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a portfolio link (GitHub, LinkedIn, etc.)"
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                  className="glass border-white/20"
                />
                <Button type="button" onClick={addLink} className="glass-strong border-[#00ffff]/50">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-3">
                {formData.portfolioLinks.map(link => (
                  <div key={link} className="flex items-center justify-between glass-strong p-2 rounded">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00ffff] hover:underline truncate">
                      {link}
                    </a>
                    <button onClick={() => removeLink(link)} className="ml-2 text-red-400 hover:text-red-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}