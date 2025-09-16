import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Store active users and their socket connections
const activeUsers = new Map();
const studyRooms = new Map();

// Authenticate socket connections
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication failed: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication failed: Invalid user'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed: Invalid token'));
  }
};

// Setup Socket.IO event handlers
export const setupSocketIO = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.fullName} (${socket.user._id})`);
    
    // Store active user
    activeUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      joinedAt: new Date(),
      status: 'online'
    });

    // Notify others about user coming online
    socket.broadcast.emit('user:online', {
      userId: socket.user._id,
      firstName: socket.user.firstName,
      lastName: socket.user.lastName,
      avatar: socket.user.avatar
    });

    // Join user to their personal room
    socket.join(`user:${socket.user._id}`);

    // Join study groups rooms
    if (socket.user.studyGroups && socket.user.studyGroups.length > 0) {
      socket.user.studyGroups.forEach(groupId => {
        socket.join(`study-group:${groupId}`);
      });
    }

    // Handle study group events
    socket.on('study-group:join', (groupId) => {
      socket.join(`study-group:${groupId}`);
      socket.to(`study-group:${groupId}`).emit('study-group:user-joined', {
        userId: socket.user._id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        avatar: socket.user.avatar
      });
    });

    socket.on('study-group:leave', (groupId) => {
      socket.leave(`study-group:${groupId}`);
      socket.to(`study-group:${groupId}`).emit('study-group:user-left', {
        userId: socket.user._id
      });
    });

    // Handle chat messages
    socket.on('chat:message', (data) => {
      const { groupId, message, type = 'text' } = data;
      
      const messageData = {
        id: Date.now(),
        userId: socket.user._id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        avatar: socket.user.avatar,
        message,
        type,
        timestamp: new Date(),
        groupId
      };

      // Send to all users in the study group
      io.to(`study-group:${groupId}`).emit('chat:new-message', messageData);
    });

    // Handle study session events
    socket.on('study-session:start', (data) => {
      const { groupId, sessionData } = data;
      
      const sessionInfo = {
        id: Date.now(),
        hostId: socket.user._id,
        hostName: socket.user.fullName,
        ...sessionData,
        startedAt: new Date(),
        participants: [socket.user._id]
      };

      // Store session
      studyRooms.set(sessionInfo.id, sessionInfo);

      // Join host to session room
      socket.join(`session:${sessionInfo.id}`);

      // Notify group members
      socket.to(`study-group:${groupId}`).emit('study-session:started', sessionInfo);
    });

    socket.on('study-session:join', (sessionId) => {
      const session = studyRooms.get(sessionId);
      if (session && !session.participants.includes(socket.user._id)) {
        session.participants.push(socket.user._id);
        socket.join(`session:${sessionId}`);
        
        // Notify other participants
        socket.to(`session:${sessionId}`).emit('study-session:participant-joined', {
          userId: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          avatar: socket.user.avatar
        });

        // Send updated participant list to all
        io.to(`session:${sessionId}`).emit('study-session:participants-updated', {
          sessionId,
          participants: session.participants
        });
      }
    });

    socket.on('study-session:leave', (sessionId) => {
      const session = studyRooms.get(sessionId);
      if (session) {
        session.participants = session.participants.filter(id => id.toString() !== socket.user._id.toString());
        socket.leave(`session:${sessionId}`);
        
        // Notify other participants
        socket.to(`session:${sessionId}`).emit('study-session:participant-left', {
          userId: socket.user._id
        });

        // If no participants left, end session
        if (session.participants.length === 0) {
          studyRooms.delete(sessionId);
          io.to(`study-group:${session.groupId}`).emit('study-session:ended', { sessionId });
        } else {
          // Send updated participant list
          io.to(`session:${sessionId}`).emit('study-session:participants-updated', {
            sessionId,
            participants: session.participants
          });
        }
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(`study-group:${data.groupId}`).emit('typing:user-started', {
        userId: socket.user._id,
        firstName: socket.user.firstName
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`study-group:${data.groupId}`).emit('typing:user-stopped', {
        userId: socket.user._id
      });
    });

    // Handle quiz collaboration
    socket.on('quiz:start-together', (data) => {
      const { groupId, quizId } = data;
      socket.to(`study-group:${groupId}`).emit('quiz:invitation', {
        quizId,
        invitedBy: {
          id: socket.user._id,
          name: socket.user.fullName
        }
      });
    });

    // Handle screen sharing (for study sessions)
    socket.on('screen:share-start', (sessionId) => {
      socket.to(`session:${sessionId}`).emit('screen:share-started', {
        userId: socket.user._id,
        userName: socket.user.fullName
      });
    });

    socket.on('screen:share-stop', (sessionId) => {
      socket.to(`session:${sessionId}`).emit('screen:share-stopped', {
        userId: socket.user._id
      });
    });

    // Handle progress updates
    socket.on('progress:update', (data) => {
      // Broadcast to user's friends or study group members
      if (data.shareWith === 'friends') {
        // Emit to friends (would need to implement friend system)
        socket.user.friends?.forEach(friend => {
          if (activeUsers.has(friend.user.toString())) {
            socket.to(`user:${friend.user}`).emit('progress:friend-update', {
              userId: socket.user._id,
              firstName: socket.user.firstName,
              lastName: socket.user.lastName,
              progress: data.progress
            });
          }
        });
      }
    });

    // Handle user status updates
    socket.on('status:update', (status) => {
      if (activeUsers.has(socket.user._id.toString())) {
        activeUsers.get(socket.user._id.toString()).status = status;
      }

      // Notify friends and study group members
      socket.broadcast.emit('status:user-updated', {
        userId: socket.user._id,
        status
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.fullName}`);
      
      // Remove from active users
      activeUsers.delete(socket.user._id.toString());

      // Clean up study sessions
      for (const [sessionId, session] of studyRooms.entries()) {
        if (session.participants.includes(socket.user._id)) {
          session.participants = session.participants.filter(id => id.toString() !== socket.user._id.toString());
          
          if (session.participants.length === 0) {
            studyRooms.delete(sessionId);
          } else {
            // Notify remaining participants
            socket.to(`session:${sessionId}`).emit('study-session:participant-left', {
              userId: socket.user._id
            });
          }
        }
      }

      // Notify others about user going offline
      socket.broadcast.emit('user:offline', {
        userId: socket.user._id
      });
    });

    // Send current online users to newly connected user
    socket.emit('users:online-list', Array.from(activeUsers.values()).map(userData => ({
      userId: userData.user._id,
      firstName: userData.user.firstName,
      lastName: userData.user.lastName,
      avatar: userData.user.avatar,
      status: userData.status
    })));
  });

  return io;
};

// Helper functions to emit to specific users/groups
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToStudyGroup = (io, groupId, event, data) => {
  io.to(`study-group:${groupId}`).emit(event, data);
};

export const getActiveUsers = () => {
  return Array.from(activeUsers.values());
};

export const isUserOnline = (userId) => {
  return activeUsers.has(userId.toString());
};

export default {
  setupSocketIO,
  emitToUser,
  emitToStudyGroup,
  getActiveUsers,
  isUserOnline
};
