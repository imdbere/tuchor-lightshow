import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Session } from "@tuchor/lightshow-shared";
import { useEffect } from "react";
import { useSocket } from "./useSocket";

// const sessionListAtom = atom<Session[] | undefined>(undefined);
// const sessionListLoadingAtom = atom<boolean>(false);
// export function useSessionList() {
//     const data = useSocketData('sessionList', sessionListAtom);
//     const [isLoading, setIsLoading] = useAtom(sessionListLoadingAtom);
//     function fetch() {
//         setIsLoading(true);
//         socketService.requestSessionList();
//     }

//     useEffect(() => {
//         if (data) {
//             setIsLoading(false);
//         }
//     }, [data]);

//     return {data, fetch, isLoading}
// }

export function useSessionsQuery() {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    useEffect(() => {
        socket?.on('sessionListUpdated', (sessions: Session[]) => {
            queryClient.setQueryData(['sessionList'], sessions);
        });
    }, [queryClient]);

    return useQuery({
        queryKey: ['sessionList'],
        queryFn: () => socket?.emitWithAck('getSessionList'),
    })
}