import { ClientToServerEvents, ServerToClientEvents } from '@tuchor/lightshow-shared';
import { atom, useAtom } from "jotai";
import { io, Socket } from "socket.io-client";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;

interface SocketState {
    host?: string;
    isConnected: boolean;
    isConnecting: boolean;
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;
}

const socketStateAtom = atom<SocketState>({
    host: undefined,
    isConnected: false,
    isConnecting: false,
    socket: undefined
});

export function useSocket() {
    const [socketState, setSocketState] = useAtom(socketStateAtom);

    async function handleConnect() {
        console.log('Connected to socketIO server')
        setSocketState(state => ({ ...state, isConnected: true, isConnecting: false }))
    }

    function handleDisconnect() {
        console.log('Disconnected from socketIO server');
        setSocketState(state => ({ ...state, isConnected: false, isConnecting: false }))
    }

    function connect(host: string) {
        if (socket) {
            socket.disconnect();
        }

        socket = io(host);
        setSocketState(state => ({ host, socket, isConnected: false, isConnecting: true }))
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
    }

    return {
        isConnected: socketState.isConnected,
        isConnecting: socketState.isConnecting,
        host: socketState.host,
        socket: socketState.socket,
        connect
    }
}