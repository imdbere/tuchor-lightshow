import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active sessions
const activeSessions: Record<string, { name: string, hostId: string, state: 'white' | 'black' }> = {};

app.get('/', (req, res) => {
  res.send('<h1>Choir Lightshow Server</h1>');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  function publishSessionList() {
    io.emit('sessionList', Object.entries(activeSessions).map(([sessionId, session]) => ({
      ...session,
      sessionId
    })));
  }

  // Send active sessions to newly connected client
  publishSessionList();

  // Get session list when requested
  socket.on('getSessionList', () => {
    console.log(`User ${socket.id} requested session list`);
    publishSessionList();
  });

  // Host creates a new session/session
  socket.on('createSession', (sessionName: string) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    activeSessions[sessionId] = {
      name: sessionName,
      hostId: socket.id,
      state: 'white'
    };
    
    socket.join(sessionId);
    console.log(`Session created: ${sessionId} (${sessionName}) by ${socket.id}`);
    
    // Broadcast updated session list to all clients
    publishSessionList();
    
    // Confirm to the host
    socket.emit('sessionCreated', { sessionId, name: sessionName });
  });

  socket.on('deleteSession', (sessionId: string) => {
    console.log(`Session ${sessionId} deleted by ${socket.id}`);
    delete activeSessions[sessionId];
    publishSessionList();
  });

  // Member joins a session
  socket.on('joinSession', (sessionId: string) => {
    if (activeSessions[sessionId]) {
      socket.join(sessionId);
      console.log(`User ${socket.id} joined session ${sessionId}`);
      
      // Send current state to new member
      socket.emit('updateState', activeSessions[sessionId].state);
    } else {
      socket.emit('error', 'Session not found');
    }
  });

  // Host toggles the screen color
  socket.on('toggleLight', (data: { sessionId: string, state: 'white' | 'black' }) => {
    const { sessionId, state } = data;
    
    if (activeSessions[sessionId] && activeSessions[sessionId].hostId === socket.id) {
      activeSessions[sessionId].state = state;
      
      // Broadcast the new state to all clients in the session
      io.to(sessionId).emit('updateState', state);
      console.log(`Session ${sessionId} state changed to ${state}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up sessions if the host disconnects
    Object.entries(activeSessions).forEach(([sessionId, session]) => {
      if (session.hostId === socket.id) {
        delete activeSessions[sessionId];
        console.log(`Session ${sessionId} removed because host disconnected`);
        
        // Notify members that the session is closed
        io.to(sessionId).emit('sessionClosed', { sessionId });
        
        // Broadcast updated session list
        publishSessionList();
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

