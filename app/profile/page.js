'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Github, Award, CheckCircle, Link as LinkIcon, Edit, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter();
  const { user: currentUser, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    portfolioLinks: []
  });
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        bio: currentUser.bio || '',
        portfolioLinks: currentUser.portfolioLinks || []
      });
    }
  }, [currentUser]);

  const handleGithubSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/skills/github-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced ${data.skills.length} skills from GitHub!`);
        // Refresh user data
        const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userData.user) setUser(userData.user);
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async () => {
    try {
      const res = await fetch('/api/quiz/react-hooks');
      const data = await res.json();
      setQuiz(data.quiz);
      setAnswers({});
      setQuizResult(null);
    } catch (error) {
      toast.error('Failed to load quiz');
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: 'react-hooks',
          answers
        })
      });

      const data = await res.json();
      if (res.ok) {
        setQuizResult(data);
        if (data.passed) {
          toast.success('Congratulations! Skill verified.');
          // Refresh user data
          const userRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userRes.json();
          if (userData.user) setUser(userData.user);
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated!');
        setUser(data.user);
        setEditDialogOpen(false);
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Header />
        <div className="pt-24 container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Profile Header */}
            <Card className="glass-strong border-white/20 mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="w-24 h-24 border-4 border-[#00ffff]/30">
                    <AvatarImage src={currentUser.image} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-[#00ffff] to-[#ff00ff] text-black font-bold">
                      {currentUser.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold mb-1">{currentUser.name}</h1>
                        <p className="text-gray-400 mb-4">{currentUser.email}</p>
                        {currentUser.bio && (
                          <p className="text-gray-300">{currentUser.bio}</p>
                        )}
                      </div>
                      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="glass border-white/20">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-strong border-white/20">
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Bio</Label>
                              <Textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="glass border-white/20 min-h-[100px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Portfolio Links</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={newLink}
                                  onChange={(e) => setNewLink(e.target.value)}
                                  placeholder="Add a link"
                                  className="glass border-white/20"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newLink && !formData.portfolioLinks.includes(newLink)) {
                                      setFormData({ ...formData, portfolioLinks: [...formData.portfolioLinks, newLink] });
                                      setNewLink('');
                                    }
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {formData.portfolioLinks.map(link => (
                                  <div key={link} className="flex items-center justify-between glass p-2 rounded">
                                    <span className="text-sm truncate">{link}</span>
                                    <button
                                      onClick={() => setFormData({ ...formData, portfolioLinks: formData.portfolioLinks.filter(l => l !== link) })}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={handleUpdateProfile}
                              className="w-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
                              disabled={loading}
                            >
                              {loading ? 'Updating...' : 'Update Profile'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {currentUser.portfolioLinks && currentUser.portfolioLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {currentUser.portfolioLinks.map(link => (
                          <a
                            key={link}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#00ffff] hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {new URL(link).hostname}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="glass-strong border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-[#ff00ff]" />
                  Skills & Verification
                </CardTitle>
                <CardDescription>Verify your skills through multiple methods</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="glass w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="github" className="flex-1">GitHub Sync</TabsTrigger>
                    <TabsTrigger value="quiz" className="flex-1">Domain Trials</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 pt-4">
                    {currentUser.skills && currentUser.skills.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {currentUser.skills.map(skill => (
                          <Card key={skill.name} className="glass border-white/10">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{skill.name}</span>
                                {skill.verified && (
                                  <Badge className="bg-green-500/20 text-green-400 gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {skill.badge}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-8">No skills added yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="github" className="pt-4">
                    <div className="text-center py-8">
                      <Github className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Sync with GitHub (Mocked)</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Connect your GitHub account to auto-verify your coding skills based on your repositories.
                      </p>
                      <Button
                        onClick={handleGithubSync}
                        disabled={loading}
                        className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        {loading ? 'Syncing...' : 'Sync GitHub Skills'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz" className="pt-4">
                    {!quiz ? (
                      <div className="text-center py-8">
                        <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Take a Skills Quiz</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                          Prove your knowledge by taking a quiz. Pass with 80% or higher to earn a verified badge.
                        </p>
                        <Button
                          onClick={loadQuiz}
                          className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
                        >
                          Start React Hooks Quiz
                        </Button>
                      </div>
                    ) : quizResult ? (
                      <div className="text-center py-8">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl ${
                          quizResult.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {quizResult.passed ? '✓' : '×'}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {quizResult.passed ? 'Congratulations!' : 'Keep Trying!'}
                        </h3>
                        <p className="text-gray-400 mb-2">Score: {quizResult.score}/{quizResult.total}</p>
                        <p className="text-gray-300 mb-6">{quizResult.message}</p>
                        <Button onClick={() => { setQuiz(null); setQuizResult(null); }}>
                          {quizResult.passed ? 'Close' : 'Try Again'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold mb-4">{quiz.title}</h3>
                          {quiz.questions.map((q, idx) => (
                            <Card key={q.id} className="glass border-white/10 mb-4">
                              <CardContent className="p-4">
                                <p className="font-semibold mb-3">{idx + 1}. {q.question}</p>
                                <div className="space-y-2">
                                  {q.options.map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={option}
                                        checked={answers[q.id] === option}
                                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        className="text-[#00ffff]"
                                      />
                                      <span>{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <Button
                          onClick={submitQuiz}
                          disabled={loading || Object.keys(answers).length < quiz.questions.length}
                          className="w-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
                        >
                          {loading ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}