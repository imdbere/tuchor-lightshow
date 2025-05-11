import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSessionsQuery } from "@/hooks/useSessionsQuery";
import { useSocket } from "@/hooks/useSocket";
export default function JoinScreen() {
  const { data: sessions, isLoading } = useSessionsQuery();
  const { socket } = useSocket();

  const handleJoinSession = (sessionId: string) => {
    // Join the session via socket
    socket?.emit("joinSession", sessionId);

    // Navigate to display screen with sessionId parameter
    router.push(`/display/${sessionId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Available Sessions</ThemedText>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4C96D7" style={styles.loader} />
      ) : sessions && sessions.length === 0 ? (
        <ThemedText style={styles.emptyText}>
          No active sessions found
        </ThemedText>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item, index) => item.sessionId || `session-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sessionItem}
              onPress={() => handleJoinSession(item.sessionId!)}
            >
              <ThemedText style={styles.sessionName}>
                {item.sessionName}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  listContent: {
    paddingBottom: 20,
  },
  sessionItem: {
    backgroundColor: "#4C96D7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
