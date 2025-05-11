import { ClientToServerEvents, ServerToClientEvents } from '@tuchor/lightshow-shared';
import { atom, useAtom } from "jotai";
import { io, Socket } from "socket.io-client";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;

interface SocketState {
    host: string;
    connected: boolean;
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;
}

const socketStateAtom = atom<SocketState>({
    host: '',
    connected: false,
    socket: undefined
});

export function useSocket() {
    const [socketState, setSocketState] = useAtom(socketStateAtom);

    function handleConnect() {
        console.log('Connected to socketIO server')
        setSocketState(state => ({ ...state, connected: true }))
    }

    function handleDisconnect() {
        console.log('Disconnected from socketIO server');
        setSocketState(state => ({ ...state, connected: false }))
    }

    function connect(host: string) {
        if (socket) {
            socket.disconnect();
        }

        socket = io(host);
        setSocketState(state => ({ host, socket, connected: false }))
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
    }

    return {
        isConnected: socketState.connected,
        host: socketState.host,
        socket: socketState.socket,
        connect
    }
}

// function emitAndWait(eventName: string, ...args: any[]) {
//     return new Promise((resolve, reject) => {
//         socket?.emit(eventName, ...args, (response: any) => {
//             resolve(response);
//         })
//     })
// }

// async function createSession(sessionName: string) {
//     return await emitAndWait('createSession', sessionName);
// }

// function joinSession(sessionId: string) {

// }

// function deleteSession(sessionId: string) {

// }

// function setSessionState(sessionId: string, state: 'white' | 'black') {

// }