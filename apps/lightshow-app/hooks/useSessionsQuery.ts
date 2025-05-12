import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Session } from "@tuchor/lightshow-shared";
import { useEffect } from "react";
import { useSocket } from "./useSocket";


export function useSessionsQuery() {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    useEffect(() => {
        socket?.on('sessionListUpdated', (sessions: Session[]) => {
            queryClient.setQueryData(['sessionList'], sessions);
        });
    }, [queryClient, socket]);

    return useQuery({
        queryKey: ['sessionList'],
        queryFn: () => socket?.emitWithAck('getSessionList'),
    })
}