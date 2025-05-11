import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import Zeroconf from 'react-native-zeroconf';

export interface Service {
    name: string,
    ip: string,
    port: number
}

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
        queryFn: () => {
            scan();
            return getServices();
        },
        initialData: [],
    });
}

function getServices() {
    const currentServices = zeroconf.getServices();
    return Object.values(currentServices)
        .filter(s => s?.addresses?.length > 0 && s.port) // Ensure we have valid address and port
        .map(s => ({
            name: s.name,
            ip: s.addresses[0],
            port: s.port
        }));

}
