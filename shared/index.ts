export interface ServerToClientEvents {
    sessionStateUpdated: (sessionId: string, state: SessionState) => void;
    sessionListUpdated: (sessions: Session[]) => void;
    sessionClosed: (sessionId: string) => void;
}
export interface ClientToServerEvents {
    getSessionList: (callback: (sessions: Session[]) => void) => void;
    getSessionState: (sessionId: string, callback: (state: SessionState) => void) => void;
    createSession: (sessionName: string, callback: (sessionId: string, state: SessionState) => void) => void;
    closeSession: (sessionId: string) => void;
    joinSession: (sessionId: string) => void;
    updateSessionState: (sessionId: string, state: SessionState) => void;
}

export interface InterServerEvents {

}

export interface SocketData {

}


export interface SessionState {
    screenColor: 'black' | 'white';
}

export interface Session {
    sessionId: string;
    sessionName: string;
}