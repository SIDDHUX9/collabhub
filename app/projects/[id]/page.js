'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { ArrowLeft, Code, Users, Send } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
        setCreator(data.creator);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please sign in to apply');
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${params.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          coverLetter
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Application submitted!');
        setApplyDialogOpen(false);
        setCoverLetter('');
        fetchProject();
      } else {
        toast.error(data.error || 'Application failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Header />
        <div className="pt-24 flex items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-[#00ffff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Header />
        <div className="pt-24 container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link href="/projects">
            <Button variant="ghost" className="mb-6 hover:text-[#00ffff]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-strong border-white/20 mb-8">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge className={
                      project.status === 'open' ? 'bg-green-500/20 text-green-400 mb-3' :
                      project.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 mb-3' :
                      'bg-gray-500/20 text-gray-400 mb-3'
                    }>
                      {project.status}
                    </Badge>
                    <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                    {creator && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={creator.image} />
                          <AvatarFallback className="text-xs">{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>by {creator.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription className="text-base">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Code className="w-5 h-5 mr-2 text-[#00ffff]" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map(tech => (
                        <Badge key={tech} className="glass text-sm px-3 py-1">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {project.requiredRoles && project.requiredRoles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-[#ff00ff]" />
                  Open Roles
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.requiredRoles.map(role => (
                    <Card key={role.id} className="glass border-white/10 hover:border-white/20 transition">
                      <CardHeader>
                        <CardTitle className="text-xl">{role.title}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {role.applicants?.length || 0} applicants
                          </span>
                          {user && project.status === 'open' && (
                            <Dialog open={applyDialogOpen && selectedRole?.id === role.id} onOpenChange={(open) => {
                              setApplyDialogOpen(open);
                              if (open) setSelectedRole(role);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
                                  disabled={role.applicants?.includes(user.id)}
                                >
                                  {role.applicants?.includes(user.id) ? 'Applied' : 'Apply'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="glass-strong border-white/20">
                                <DialogHeader>
                                  <DialogTitle>Apply for {role.title}</DialogTitle>
                                  <DialogDescription>
                                    Tell the project creator why you're a great fit
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Cover Letter</Label>
                                    <Textarea
                                      placeholder="Explain your experience and why you want to join this project..."
                                      value={coverLetter}
                                      onChange={(e) => setCoverLetter(e.target.value)}
                                      className="glass border-white/20 min-h-[150px]"
                                    />
                                  </div>
                                  <Button
                                    onClick={handleApply}
                                    className="w-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold"
                                    disabled={applying || !coverLetter}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}