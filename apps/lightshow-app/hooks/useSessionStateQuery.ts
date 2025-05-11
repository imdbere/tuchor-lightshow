import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SessionState } from "@tuchor/lightshow-shared";
import { useEffect } from "react";
import { useSocket } from "./useSocket";

// const sessionStateAtom = atom<SessionState | undefined>(undefined);
// export function useSessionState() {
//     const data = useSocketData('updateState', sessionStateAtom);
//     return { data }
// }

// export function useSocketData<T>(event: string, atom: PrimitiveAtom<T | undefined>) {
//     const [data, setData] = useAtom(atom);

//     useEffect(() => {
//         socket.on(event, (data: T) => {
//             setData(data);
//         });
//         socket.on('disconnect', () => {
//             setData(undefined);
//         });
//         return () => {
//             socket.off(event);
//         };
//     }, []);

//     return data;
// }


export function useSessionStateQuery(sessionId: string) {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    useEffect(() => {
        socket?.on('sessionStateUpdated', (sessionId: string, state: SessionState) => {
            queryClient.setQueryData(['sessionState', sessionId], state);
        });
    }, [queryClient]);

    return useQuery({
        queryKey: ['sessionState', sessionId],
        queryFn: () => socket?.emitWithAck('getSessionState', sessionId),
    })
}