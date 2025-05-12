import { delay } from '@/utils/delay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import Zeroconf from 'react-native-zeroconf';


const QUERY_KEY = ['servers'];
const zeroconf = new Zeroconf();

export function useScanServersQuery() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Remove previous listeners to avoid duplicates
        zeroconf.removeAllListeners();

        // Set up the update listener
        zeroconf.on("update", () => {
            const services = getServices();
            // Update query data
            queryClient.setQueryData(QUERY_KEY, services);
        });

        return () => {
            zeroconf.removeAllListeners();
        };
    }, [queryClient]);

    function scan() {
        console.log('Scanning for tuchoir-lightshow services...');
        zeroconf.scan('tuchoir-lightshow');
    }

    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            scan();
            // Scanning doesn't have a fixed amount of time, so we just wait for 2 seconds
            await delay(2000);
            return getServices();
        },
        initialData: []
    });
}

function getServices() {
    const currentServices = zeroconf.getServices();
    return Object.values(currentServices)
        .filter(s => s?.addresses?.length > 0 && s.port) // Ensure we have valid address and port
        .map(s => ({
            name: s.name,
            ip: s.addresses[0],
            socketUrl: `http://${s.addresses[0]}:${s.port}`,
            port: s.port
        }));

}

export type Service = ReturnType<typeof getServices>[number];
