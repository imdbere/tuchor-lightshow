import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSocket } from "@/hooks/useSocket";

export default function HomeScreen() {
  const { isConnected, host } = useSocket();

  const handleHostSession = () => {
    router.push("/host");
  };

  const handleJoinSession = () => {
    router.push("/join");
  };

  const handleSelectServer = () => {
    router.push("/server-select" as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.contentContainer}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Choir Lightshow</ThemedText>
        </ThemedView>

        <ThemedView style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.button, !isConnected && styles.disabledButton]}
            onPress={handleHostSession}
            disabled={!isConnected}
          >
            <ThemedText style={styles.buttonText}>Host a Session</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !isConnected && styles.disabledButton]}
            onPress={handleJoinSession}
            disabled={!isConnected}
          >
            <ThemedText style={styles.buttonText}>Join a Session</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.selectServerButton]}
            onPress={handleSelectServer}
          >
            <ThemedText style={styles.buttonText}>Select Server</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.serverInfoContainer}>
        <ThemedView style={styles.serverInfoRow}>
          <ThemedView style={styles.serverInfoTextContainer}>
            <ThemedText style={styles.serverInfoLabel}>
              Current Server:
            </ThemedText>
            <ThemedText style={styles.serverInfoValue}>
              {host ?? "Not connected"}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            style={styles.changeServerButton}
            onPress={handleSelectServer}
          >
            <ThemedText style={styles.changeServerButtonText}>
              Change
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
  },
  button: {
    backgroundColor: "#4C96D7",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  selectServerButton: {
    backgroundColor: "#50AF95",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  serverInfoContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  serverInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serverInfoTextContainer: {
    flex: 1,
  },
  serverInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serverInfoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  changeServerButton: {
    backgroundColor: "#50AF95",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  changeServerButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
});
