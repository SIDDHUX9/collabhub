'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Users, Code } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: [],
    requiredRoles: []
  });
  const [currentTech, setCurrentTech] = useState('');
  const [currentRole, setCurrentRole] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter]);

  const fetchProjects = async () => {
    try {
      let url = '/api/projects?';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTech = () => {
    if (currentTech && !newProject.techStack.includes(currentTech)) {
      setNewProject({ ...newProject, techStack: [...newProject.techStack, currentTech] });
      setCurrentTech('');
    }
  };

  const addRole = () => {
    if (currentRole.title && currentRole.description) {
      setNewProject({ ...newProject, requiredRoles: [...newProject.requiredRoles, currentRole] });
      setCurrentRole({ title: '', description: '' });
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      toast.error('Please sign in to create a project');
      return;
    }

    setCreateLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Project created!');
        setCreateDialogOpen(false);
        fetchProjects();
        setNewProject({ title: '', description: '', techStack: [], requiredRoles: [] });
      } else {
        toast.error(data.error || 'Failed to create project');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-[#0f0f0f]\">
      <Header />
      
      <div className=\"pt-24 pb-12 px-4\">
        <div className=\"container mx-auto\">
          {/* Page Header */}
          <div className=\"flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4\">
            <div>
              <h1 className=\"text-4xl font-bold mb-2\">
                Project <span className=\"bg-gradient-to-r from-[#00ffff] to-[#ff00ff] text-transparent bg-clip-text\">Nexus</span>
              </h1>
              <p className=\"text-gray-400\">Discover projects and join amazing teams</p>
            </div>

            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className=\"bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold\">
                    <Plus className=\"w-4 h-4 mr-2\" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className=\"glass-strong border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto\">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Share your project idea and find collaborators</DialogDescription>
                  </DialogHeader>
                  <div className=\"space-y-4 py-4\">
                    <div className=\"space-y-2\">
                      <Label>Project Title</Label>
                      <Input
                        placeholder=\"My Awesome Project\"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className=\"glass border-white/20\"
                      />
                    </div>

                    <div className=\"space-y-2\">
                      <Label>Description</Label>
                      <Textarea
                        placeholder=\"Describe your project, goals, and vision...\"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className=\"glass border-white/20 min-h-[100px]\"
                      />
                    </div>

                    <div className=\"space-y-2\">
                      <Label>Tech Stack</Label>
                      <div className=\"flex gap-2\">
                        <Input
                          placeholder=\"Add technology\"
                          value={currentTech}
                          onChange={(e) => setCurrentTech(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                          className=\"glass border-white/20\"
                        />
                        <Button type=\"button\" onClick={addTech}>Add</Button>
                      </div>
                      <div className=\"flex flex-wrap gap-2\">
                        {newProject.techStack.map(tech => (
                          <Badge key={tech} className=\"glass-strong\">
                            {tech}
                            <button onClick={() => setNewProject({ ...newProject, techStack: newProject.techStack.filter(t => t !== tech) })} className=\"ml-2\">×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className=\"space-y-2\">
                      <Label>Required Roles</Label>
                      <div className=\"space-y-2 glass-strong p-4 rounded\">
                        <Input
                          placeholder=\"Role title (e.g., Frontend Developer)\"
                          value={currentRole.title}
                          onChange={(e) => setCurrentRole({ ...currentRole, title: e.target.value })}
                          className=\"glass border-white/20\"
                        />
                        <Textarea
                          placeholder=\"Role description and requirements\"
                          value={currentRole.description}
                          onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                          className=\"glass border-white/20\"
                        />
                        <Button type=\"button\" onClick={addRole} className=\"w-full\">Add Role</Button>
                      </div>
                      <div className=\"space-y-2\">
                        {newProject.requiredRoles.map((role, idx) => (
                          <div key={idx} className=\"glass-strong p-3 rounded\">
                            <div className=\"flex justify-between items-start\">
                              <div>
                                <h4 className=\"font-semibold\">{role.title}</h4>
                                <p className=\"text-sm text-gray-400\">{role.description}</p>
                              </div>
                              <button onClick={() => setNewProject({ ...newProject, requiredRoles: newProject.requiredRoles.filter((_, i) => i !== idx) })} className=\"text-red-400\">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateProject}
                      className=\"w-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff] hover:opacity-90 text-black font-semibold\"
                      disabled={createLoading || !newProject.title || !newProject.description}
                    >
                      {createLoading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Filters */}
          <div className=\"flex flex-col md:flex-row gap-4 mb-8\">
            <div className=\"relative flex-1\">
              <Search className=\"absolute left-3 top-3 h-4 w-4 text-muted-foreground\" />
              <Input
                placeholder=\"Search projects...\"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=\"pl-10 glass border-white/20\"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className=\"w-full md:w-[200px] glass border-white/20\">
                <SelectValue placeholder=\"Filter by status\" />
              </SelectTrigger>
              <SelectContent className=\"glass-strong border-white/20\">
                <SelectItem value=\"all\">All Projects</SelectItem>
                <SelectItem value=\"open\">Open</SelectItem>
                <SelectItem value=\"in-progress\">In Progress</SelectItem>
                <SelectItem value=\"completed\">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className=\"text-center py-12\">
              <div className=\"w-16 h-16 border-4 border-[#00ffff] border-t-transparent rounded-full animate-spin mx-auto mb-4\" />
              <p className=\"text-gray-400\">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card className=\"glass-strong border-white/20 text-center py-12\">
              <CardContent>
                <Code className=\"w-16 h-16 text-gray-600 mx-auto mb-4\" />
                <h3 className=\"text-xl font-bold mb-2\">No projects found</h3>
                <p className=\"text-gray-400 mb-4\">Be the first to create a project!</p>
              </CardContent>
            </Card>
          ) : (
            <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    className=\"glass border-white/10 hover:border-white/20 h-full transition-all cursor-pointer\"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <CardHeader>
                      <div className=\"flex items-start justify-between mb-2\">
                        <Badge className={
                          project.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>
                          {project.status}
                        </Badge>
                        <Users className=\"w-4 h-4 text-gray-400\" />
                      </div>
                      <CardTitle className=\"text-xl\">{project.title}</CardTitle>
                      <CardDescription className=\"line-clamp-2\">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className=\"space-y-4\">
                        {project.techStack && project.techStack.length > 0 && (
                          <div className=\"flex flex-wrap gap-2\">
                            {project.techStack.slice(0, 4).map(tech => (
                              <Badge key={tech} variant=\"secondary\" className=\"glass-strong text-xs\">
                                {tech}
                              </Badge>
                            ))}
                            {project.techStack.length > 4 && (
                              <Badge variant=\"secondary\" className=\"glass-strong text-xs\">
                                +{project.techStack.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                        {project.requiredRoles && project.requiredRoles.length > 0 && (
                          <div className=\"text-sm text-gray-400\">
                            <span className=\"font-semibold text-[#00ffff]\">{project.requiredRoles.length}</span> open roles
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
