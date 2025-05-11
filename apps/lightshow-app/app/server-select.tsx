import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Service, useScanServersQuery } from "@/hooks/useScanServersQuery";
import { useSocket } from "@/hooks/useSocket";

export default function ServerSelectScreen() {
  const { data: services, refetch } = useScanServersQuery();
  const { connect } = useSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Service | null>(null);
  const [initialScan, setInitialScan] = useState(true);

  useEffect(() => {
    // Set initial scan to false after 2 seconds
    const timer = setTimeout(() => {
      setInitialScan(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // When services are found, set initial scan to false
  useEffect(() => {
    if (services.length > 0 && initialScan) {
      setInitialScan(false);
    }
  }, [services]);

  // Auto-select the first server if none is selected
  useEffect(() => {
    if (services.length > 0 && !selectedServer) {
      setSelectedServer(services[0]);
    }
  }, [services, selectedServer]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleSelectServer = (server: Service) => {
    setSelectedServer(server);
  };

  const handleConnect = () => {
    if (selectedServer) {
      const serverUrl = `http://${selectedServer.ip}:${selectedServer.port}`;
      connect(serverUrl);
      router.replace("/"); // Use replace to prevent back navigation to this screen
    }
  };

  const renderItem = ({ item }: { item: Service }) => {
    const isSelected =
      selectedServer?.ip === item.ip && selectedServer?.port === item.port;
    return (
      <TouchableOpacity
        style={[styles.serverItem, isSelected && styles.selectedServerItem]}
        onPress={() => handleSelectServer(item)}
      >
        <View style={styles.serverItemContent}>
          <ThemedText style={styles.serverName}>{item.name}</ThemedText>
          <ThemedText style={styles.serverDetails}>
            {item.ip}:{item.port}
          </ThemedText>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <ThemedText style={styles.selectedIndicatorText}>✓</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Select a Server</ThemedText>
      </ThemedView>

      {initialScan ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4C96D7" />
          <ThemedText style={styles.loadingText}>
            Scanning for servers...
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.name}-${item.ip}-${item.port}`}
          style={styles.serverList}
          contentContainerStyle={
            services.length === 0 ? styles.emptyList : { paddingHorizontal: 5 }
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No servers found</ThemedText>
              <ThemedText style={styles.emptySubText}>
                Pull down to refresh or tap the button below
              </ThemedText>
            </ThemedView>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <ThemedView style={styles.buttonContainer}>
        {services.length === 0 && !initialScan ? (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.buttonText}>Scan Again</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, !selectedServer && styles.disabledButton]}
            onPress={handleConnect}
            disabled={!selectedServer}
          >
            <ThemedText style={styles.buttonText}>Connect</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  serverList: {
    flex: 1,
  },
  serverItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  selectedServerItem: {
    borderColor: "#60A5FA",
    borderWidth: 2,
    backgroundColor: "rgba(96, 165, 250, 0.2)",
  },
  serverItemContent: {
    flex: 1,
  },
  serverName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serverDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#4C96D7",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButton: {
    backgroundColor: "#50AF95",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  selectedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#60A5FA",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicatorText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});
