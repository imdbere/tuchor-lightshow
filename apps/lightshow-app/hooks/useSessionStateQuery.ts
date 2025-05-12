import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SessionState } from "@tuchor/lightshow-shared";
import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useSessionStateQuery(sessionId: string) {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    useEffect(() => {
        socket?.on('sessionStateUpdated', (sessionId: string, state: SessionState) => {
            queryClient.setQueryData(['sessionState', sessionId], state);
        });
    }, [queryClient, socket]);

    return useQuery({
        queryKey: ['sessionState', sessionId],
        queryFn: () => socket?.emitWithAck('getSessionState', sessionId),
    })
}