import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import Team from '@/lib/models/Team';
import Task from '@/lib/models/Task';
import Message from '@/lib/models/Message';
import Notification from '@/lib/models/Notification';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Helper function to handle errors
const handleError = (error, message = 'Internal server error') => {
  console.error(message, error);
  return handleCORS(NextResponse.json(
    { error: message, details: error.message },
    { status: 500 }
  ));
};

// Helper to verify auth token
const verifyAuth = async (request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    await connectDB();
    const user = await User.findOne({ id: token });
    return user;
  } catch (error) {
    return null;
  }
};

// GET handler
export async function GET(request, { params }) {
  try {
    const { path = [] } = params;
    const route = `/${path.join('/')}`;
    const endpoint = path[0] || '';

    await connectDB();

    // Root endpoint
    if (endpoint === '' || route === '/' || route === '/root') {
      return handleCORS(NextResponse.json({ message: 'CollabHub API is running' }));
    }

    // Health check
    if (endpoint === 'health') {
      return handleCORS(NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() }));
    }

    // Get current user
    if (endpoint === 'auth' && path[1] === 'me') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }
      return handleCORS(NextResponse.json({ user: { ...user.toObject(), password: undefined } }));
    }

    // Verify email
    if (endpoint === 'auth' && path[1] === 'verify') {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');
      
      if (!token) {
        return handleCORS(NextResponse.json({ error: 'Token required' }, { status: 400 }));
      }

      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Invalid token' }, { status: 400 }));
      }

      user.verified = true;
      user.verificationToken = '';
      await user.save();

      return handleCORS(NextResponse.json({ message: 'Email verified successfully' }));
    }

    // Get all projects
    if (endpoint === 'projects' && !path[1]) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search') || '';
      const tech = searchParams.get('tech') || '';
      const status = searchParams.get('status') || '';

      let query = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (tech) {
        query.techStack = { $in: [tech] };
      }
      if (status) {
        query.status = status;
      }

      const projects = await Project.find(query).sort({ createdAt: -1 });
      return handleCORS(NextResponse.json({ projects }));
    }

    // Get single project
    if (endpoint === 'projects' && path[1]) {
      const projectId = path[1];
      const project = await Project.findOne({ id: projectId });
      
      if (!project) {
        return handleCORS(NextResponse.json({ error: 'Project not found' }, { status: 404 }));
      }

      const creator = await User.findOne({ id: project.creator });
      
      return handleCORS(NextResponse.json({ 
        project: project.toObject(),
        creator: creator ? { id: creator.id, name: creator.name, image: creator.image } : null
      }));
    }

    // Get user profile
    if (endpoint === 'users' && path[1]) {
      const userId = path[1];
      const user = await User.findOne({ id: userId });
      
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }));
      }

      return handleCORS(NextResponse.json({ 
        user: { ...user.toObject(), password: undefined }
      }));
    }

    // Get team details
    if (endpoint === 'teams' && path[1] && !path[2]) {
      const teamId = path[1];
      const team = await Team.findOne({ id: teamId });
      
      if (!team) {
        return handleCORS(NextResponse.json({ error: 'Team not found' }, { status: 404 }));
      }

      const members = await User.find({ id: { $in: team.members } });
      
      return handleCORS(NextResponse.json({ 
        team: team.toObject(),
        members: members.map(m => ({ id: m.id, name: m.name, image: m.image, bio: m.bio }))
      }));
    }

    // Get team tasks
    if (endpoint === 'teams' && path[1] && path[2] === 'tasks') {
      const teamId = path[1];
      const tasks = await Task.find({ team: teamId }).sort({ order: 1 });
      
      return handleCORS(NextResponse.json({ tasks }));
    }

    // Get team messages
    if (endpoint === 'teams' && path[1] && path[2] === 'messages') {
      const teamId = path[1];
      const { searchParams } = new URL(request.url);
      const channel = searchParams.get('channel') || 'general';
      
      const messages = await Message.find({ team: teamId, channel }).sort({ timestamp: 1 }).limit(100);
      const authorIds = [...new Set(messages.map(m => m.author))];
      const authors = await User.find({ id: { $in: authorIds } });
      const authorMap = {};
      authors.forEach(a => {
        authorMap[a.id] = { id: a.id, name: a.name, image: a.image };
      });
      
      return handleCORS(NextResponse.json({ 
        messages: messages.map(m => ({
          ...m.toObject(),
          authorData: authorMap[m.author]
        }))
      }));
    }

    // Get notifications
    if (endpoint === 'notifications') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const notifications = await Notification.find({ user: user.id })
        .sort({ timestamp: -1 })
        .limit(50);
      
      return handleCORS(NextResponse.json({ notifications }));
    }

    // Admin: Get all users
    if (endpoint === 'admin' && path[1] === 'users') {
      const user = await verifyAuth(request);
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
      }

      const users = await User.find({}).sort({ createdAt: -1 });
      return handleCORS(NextResponse.json({ 
        users: users.map(u => ({ ...u.toObject(), password: undefined }))
      }));
    }

    // Admin: Get stats
    if (endpoint === 'admin' && path[1] === 'stats') {
      const user = await verifyAuth(request);
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
      }

      const totalUsers = await User.countDocuments();
      const totalProjects = await Project.countDocuments();
      const totalTeams = await Team.countDocuments();
      const activeProjects = await Project.countDocuments({ status: 'in-progress' });

      return handleCORS(NextResponse.json({
        stats: {
          totalUsers,
          totalProjects,
          totalTeams,
          activeProjects
        }
      }));
    }

    // Get quiz
    if (endpoint === 'quiz' && path[1]) {
      const quizType = path[1];
      
      // Simple React Hooks quiz
      if (quizType === 'react-hooks') {
        const quiz = {
          id: 'react-hooks',
          title: 'React Hooks Mastery',
          questions: [
            {
              id: 'q1',
              question: 'Which hook is used for side effects?',
              options: ['useState', 'useEffect', 'useContext', 'useReducer'],
              correct: 'useEffect'
            },
            {
              id: 'q2',
              question: 'What does useState return?',
              options: ['A value', 'A function', 'An array with value and setter', 'An object'],
              correct: 'An array with value and setter'
            },
            {
              id: 'q3',
              question: 'When does useEffect run by default?',
              options: ['Only on mount', 'Only on unmount', 'After every render', 'Never'],
              correct: 'After every render'
            },
            {
              id: 'q4',
              question: 'What is the purpose of the dependency array in useEffect?',
              options: ['To pass props', 'To control when effect runs', 'To declare state', 'To import modules'],
              correct: 'To control when effect runs'
            },
            {
              id: 'q5',
              question: 'Which hook is used for complex state logic?',
              options: ['useState', 'useEffect', 'useReducer', 'useMemo'],
              correct: 'useReducer'
            }
          ]
        };
        return handleCORS(NextResponse.json({ quiz }));
      }

      return handleCORS(NextResponse.json({ error: 'Quiz not found' }, { status: 404 }));
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }));

  } catch (error) {
    return handleError(error, 'GET request failed');
  }
}

// POST handler
export async function POST(request, { params }) {
  try {
    const { path = [] } = params;
    const endpoint = path[0] || '';
    const body = await request.json();

    await connectDB();

    // Register
    if (endpoint === 'auth' && path[1] === 'register') {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return handleCORS(NextResponse.json({ error: 'All fields required' }, { status: 400 }));
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return handleCORS(NextResponse.json({ error: 'Email already registered' }, { status: 400 }));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const verificationToken = uuidv4();

      const user = new User({
        id: userId,
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verified: false
      });

      await user.save();

      // Send verification email
      try {
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verificationToken}`;
        await resend.emails.send({
          from: 'CollabHub <onboarding@resend.dev>',
          to: email,
          subject: 'Verify your CollabHub account',
          html: `
            <h1>Welcome to CollabHub!</h1>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>Or copy this link: ${verificationUrl}</p>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return handleCORS(NextResponse.json({
        message: 'Registration successful. Check your email for verification.',
        userId
      }));
    }

    // Login
    if (endpoint === 'auth' && path[1] === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return handleCORS(NextResponse.json({ error: 'Email and password required' }, { status: 400 }));
      }

      const user = await User.findOne({ email });
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
      }

      if (!user.verified) {
        return handleCORS(NextResponse.json({ error: 'Please verify your email first' }, { status: 401 }));
      }

      return handleCORS(NextResponse.json({
        message: 'Login successful',
        token: user.id,
        user: { ...user.toObject(), password: undefined }
      }));
    }

    // Onboarding
    if (endpoint === 'auth' && path[1] === 'onboard') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const { bio, skills, portfolioLinks } = body;

      user.bio = bio || '';
      user.skills = (skills || []).map(skill => ({
        name: skill,
        verified: false,
        method: 'none',
        badge: ''
      }));
      user.portfolioLinks = portfolioLinks || [];
      user.onboarded = true;

      await user.save();

      return handleCORS(NextResponse.json({
        message: 'Onboarding complete',
        user: { ...user.toObject(), password: undefined }
      }));
    }

    // Create project
    if (endpoint === 'projects' && !path[1]) {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const { title, description, requiredRoles, techStack } = body;

      if (!title || !description) {
        return handleCORS(NextResponse.json({ error: 'Title and description required' }, { status: 400 }));
      }

      const projectId = uuidv4();
      const project = new Project({
        id: projectId,
        title,
        description,
        creator: user.id,
        requiredRoles: (requiredRoles || []).map(role => ({
          id: uuidv4(),
          title: role.title,
          description: role.description,
          applicants: []
        })),
        techStack: techStack || [],
        status: 'open'
      });

      await project.save();

      return handleCORS(NextResponse.json({
        message: 'Project created',
        project: project.toObject()
      }));
    }

    // Apply for role
    if (endpoint === 'projects' && path[1] && path[2] === 'apply') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const projectId = path[1];
      const { roleId, coverLetter } = body;

      const project = await Project.findOne({ id: projectId });
      if (!project) {
        return handleCORS(NextResponse.json({ error: 'Project not found' }, { status: 404 }));
      }

      const role = project.requiredRoles.find(r => r.id === roleId);
      if (!role) {
        return handleCORS(NextResponse.json({ error: 'Role not found' }, { status: 404 }));
      }

      if (role.applicants.includes(user.id)) {
        return handleCORS(NextResponse.json({ error: 'Already applied' }, { status: 400 }));
      }

      role.applicants.push(user.id);
      await project.save();

      // Create notification for project creator
      const notification = new Notification({
        id: uuidv4(),
        user: project.creator,
        type: 'application',
        content: `${user.name} applied for ${role.title} in ${project.title}`,
        link: `/projects/${projectId}`
      });
      await notification.save();

      return handleCORS(NextResponse.json({ message: 'Application submitted' }));
    }

    // Create team
    if (endpoint === 'teams' && !path[1]) {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const { name, projectId, members } = body;

      const teamId = uuidv4();
      const team = new Team({
        id: teamId,
        name,
        project: projectId,
        members: [user.id, ...(members || [])]
      });

      await team.save();

      // Update project
      await Project.updateOne({ id: projectId }, { team: teamId, status: 'in-progress' });

      return handleCORS(NextResponse.json({
        message: 'Team created',
        team: team.toObject()
      }));
    }

    // Create task
    if (endpoint === 'teams' && path[1] && path[2] === 'tasks') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const teamId = path[1];
      const { title, description, column, assignee } = body;

      const taskId = uuidv4();
      const task = new Task({
        id: taskId,
        title,
        description: description || '',
        column: column || 'To Do',
        team: teamId,
        assignee: assignee || null
      });

      await task.save();

      return handleCORS(NextResponse.json({
        message: 'Task created',
        task: task.toObject()
      }));
    }

    // Send message
    if (endpoint === 'teams' && path[1] && path[2] === 'messages') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const teamId = path[1];
      const { content, channel } = body;

      const messageId = uuidv4();
      const message = new Message({
        id: messageId,
        content,
        author: user.id,
        team: teamId,
        channel: channel || 'general'
      });

      await message.save();

      return handleCORS(NextResponse.json({
        message: 'Message sent',
        data: {
          ...message.toObject(),
          authorData: { id: user.id, name: user.name, image: user.image }
        }
      }));
    }

    // Upload file
    if (endpoint === 'upload') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const { file, teamId } = body;

      if (!file) {
        return handleCORS(NextResponse.json({ error: 'File required' }, { status: 400 }));
      }

      try {
        const result = await cloudinary.uploader.upload(file, {
          folder: `collabhub/team_${teamId}`,
          resource_type: 'auto'
        });

        return handleCORS(NextResponse.json({
          message: 'File uploaded',
          url: result.secure_url,
          publicId: result.public_id
        }));
      } catch (uploadError) {
        return handleError(uploadError, 'File upload failed');
      }
    }

    // Submit quiz
    if (endpoint === 'quiz' && path[1] === 'submit') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const { quizId, answers } = body;

      // Check answers for React Hooks quiz
      if (quizId === 'react-hooks') {
        const correctAnswers = {
          q1: 'useEffect',
          q2: 'An array with value and setter',
          q3: 'After every render',
          q4: 'To control when effect runs',
          q5: 'useReducer'
        };

        let score = 0;
        Object.keys(answers).forEach(qId => {
          if (answers[qId] === correctAnswers[qId]) {
            score++;
          }
        });

        const passed = score >= 4; // Need 80% to pass

        if (passed) {
          // Add verified skill
          const skillIndex = user.skills.findIndex(s => s.name === 'React Hooks');
          if (skillIndex >= 0) {
            user.skills[skillIndex].verified = true;
            user.skills[skillIndex].method = 'quiz';
            user.skills[skillIndex].badge = 'Trial Proven';
          } else {
            user.skills.push({
              name: 'React Hooks',
              verified: true,
              method: 'quiz',
              badge: 'Trial Proven'
            });
          }
          await user.save();
        }

        return handleCORS(NextResponse.json({
          passed,
          score,
          total: 5,
          message: passed ? 'Congratulations! Skill verified.' : 'Try again. Need 4/5 to pass.'
        }));
      }

      return handleCORS(NextResponse.json({ error: 'Quiz not found' }, { status: 404 }));
    }

    // Mock GitHub sync
    if (endpoint === 'skills' && path[1] === 'github-sync') {
      const user = await verifyAuth(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      // Mock verified skills from GitHub
      const mockSkills = ['JavaScript', 'React', 'Node.js', 'TypeScript'];
      
      mockSkills.forEach(skill => {
        const skillIndex = user.skills.findIndex(s => s.name === skill);
        if (skillIndex >= 0) {
          user.skills[skillIndex].verified = true;
          user.skills[skillIndex].method = 'github';
          user.skills[skillIndex].badge = 'Code Synced';
        } else {
          user.skills.push({
            name: skill,
            verified: true,
            method: 'github',
            badge: 'Code Synced'
          });
        }
      });

      await user.save();

      return handleCORS(NextResponse.json({
        message: 'GitHub sync complete',
        skills: mockSkills
      }));
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint not found' }, { status: 404 }));

  } catch (error) {
    return handleError(error, 'POST request failed');
  }
}

// PUT handler
export async function PUT(request, { params }) {
  try {
    const { path = [] } = params;
    const endpoint = path[0] || '';
    const body = await request.json();

    await connectDB();

    const user = await verifyAuth(request);
    if (!user) {
      return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    // Update profile
    if (endpoint === 'users' && path[1] === 'profile') {
      const { bio, portfolioLinks } = body;

      if (bio !== undefined) user.bio = bio;
      if (portfolioLinks !== undefined) user.portfolioLinks = portfolioLinks;

      await user.save();

      return handleCORS(NextResponse.json({
        message: 'Profile updated',
        user: { ...user.toObject(), password: undefined }
      }));
    }

    // Update task
    if (endpoint === 'tasks' && path[1]) {
      const taskId = path[1];
      const { title, description, column, assignee } = body;

      const task = await Task.findOne({ id: taskId });
      if (!task) {
        return handleCORS(NextResponse.json({ error: 'Task not found' }, { status: 404 }));
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (column !== undefined) task.column = column;
      if (assignee !== undefined) task.assignee = assignee;

      await task.save();

      return handleCORS(NextResponse.json({
        message: 'Task updated',
        task: task.toObject()
      }));
    }

    // Mark notification as read
    if (endpoint === 'notifications' && path[1] && path[2] === 'read') {
      const notificationId = path[1];

      const notification = await Notification.findOne({ id: notificationId });
      if (!notification) {
        return handleCORS(NextResponse.json({ error: 'Notification not found' }, { status: 404 }));
      }

      notification.read = true;
      await notification.save();

      return handleCORS(NextResponse.json({ message: 'Notification marked as read' }));
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint not found' }, { status: 404 }));

  } catch (error) {
    return handleError(error, 'PUT request failed');
  }
}

// DELETE handler
export async function DELETE(request, { params }) {
  try {
    const { path = [] } = params;
    const endpoint = path[0] || '';

    await connectDB();

    const user = await verifyAuth(request);
    if (!user) {
      return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    // Delete task
    if (endpoint === 'tasks' && path[1]) {
      const taskId = path[1];
      await Task.deleteOne({ id: taskId });
      return handleCORS(NextResponse.json({ message: 'Task deleted' }));
    }

    // Admin: Delete user
    if (endpoint === 'admin' && path[1] === 'users' && path[2]) {
      if (user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
      }

      const userId = path[2];
      await User.deleteOne({ id: userId });
      return handleCORS(NextResponse.json({ message: 'User deleted' }));
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint not found' }, { status: 404 }));

  } catch (error) {
    return handleError(error, 'DELETE request failed');
  }
}

export const PATCH = PUT;