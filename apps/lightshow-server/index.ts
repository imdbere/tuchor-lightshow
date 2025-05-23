import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SessionState, SocketData } from '@tuchor/lightshow-shared';
import { Bonjour } from 'bonjour-service';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const bonjour = new Bonjour()

// advertise an HTTP server on port 3000
bonjour.publish({ name: 'TUChoir Lightshow Server', type: 'tuchoir-lightshow', port: 3000 });

// Store active sessions
const activeSessions: Record<string, { name: string, hostId: string, state: SessionState }> = {};

app.get('/', (req, res) => {
  res.send('<h1>Choir Lightshow Server</h1>');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  function publishSessionList() {
    io.emit('sessionListUpdated', Object.entries(activeSessions).map(([sessionId, session]) => ({
      sessionId,
      sessionName: session.name
    })));
  }

  // Send active sessions to newly connected client
  publishSessionList();

  // Get session list when requested
  socket.on('getSessionList', (callback) => {
    console.log(`User ${socket.id} requested session list`);
    //publishSessionList();
    callback(Object.entries(activeSessions).map(([sessionId, session]) => ({
      sessionId,
      sessionName: session.name
    })));
  });

  socket.on('getSessionState', (sessionId: string, callback) => {
    console.log(`User ${socket.id} requested session state for ${sessionId}`);
    callback(activeSessions[sessionId].state);
  });

  // Host creates a new session/session
  socket.on('createSession', (sessionName: string, callback: (sessionId: string, state: SessionState) => void) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const state = {
      screenColor: 'black' as const // Default state
    };

    activeSessions[sessionId] = {
      name: sessionName,
      hostId: socket.id,
      state: state
    };

    socket.join(sessionId);
    console.log(`Session created: ${sessionId} (${sessionName}) by ${socket.id}`);

    // Broadcast updated session list to all clients
    publishSessionList();
    callback(sessionId, state);
  });

  socket.on('closeSession', (sessionId: string) => {
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
      socket.emit('sessionStateUpdated', sessionId, activeSessions[sessionId].state);
    }
  });

  // Host toggles the screen color
  socket.on('updateSessionState', (sessionId: string, state: SessionState) => {
    if (activeSessions[sessionId] && activeSessions[sessionId].hostId === socket.id) {
      activeSessions[sessionId].state = state;

      // Broadcast the new state to all clients in the session
      io.to(sessionId).emit('sessionStateUpdated', sessionId, state);
      console.log(`Session ${sessionId} state changed to ${JSON.stringify(state)}`);
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
        io.to(sessionId).emit('sessionClosed', sessionId);

        // Broadcast updated session list
        publishSessionList();
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

