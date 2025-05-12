import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSocket } from "@/hooks/useSocket";
export default function HostScreen() {
  const [sessionName, setSessionName] = useState("");
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string;
    name: string;
  } | null>(null);

  const [lightState, setLightState] = useState<"white" | "black">("white");
  const { socket } = useSocket();

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      Alert.alert("Error", "Please enter a session name");
      return;
    }

    socket?.emit("createSession", sessionName, (sessionId, state) => {
      console.log("Session created", sessionId, state);
      setCurrentSession({ sessionId, name: sessionName });
      setLightState(state.screenColor);
    });
  };

  // Delete the session when this page is closed
  useEffect(() => {
    return () => {
      if (currentSession) {
        console.log("Deleting session", currentSession.sessionId);
        socket?.emit("closeSession", currentSession.sessionId);
      }
    };
  }, [currentSession]);

  const toggleLight = () => {
    if (!currentSession) return;

    const newState = {
      screenColor: lightState === "white" ? "black" : "white",
    } as const;
    socket?.emit("updateSessionState", currentSession.sessionId, newState);
    setLightState(newState.screenColor);
  };

  return (
    <ThemedView style={styles.container}>
      {!currentSession ? (
        <>
          <ThemedText style={styles.label}>Enter Session Name:</ThemedText>
          <TextInput
            style={styles.input}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="My Choir Session"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateSession}
          >
            <ThemedText style={styles.buttonText}>Create Session</ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ThemedView style={styles.sessionInfo}>
            <ThemedText style={styles.sessionTitle}>
              Session: {currentSession.name}
            </ThemedText>
            <ThemedText>Current light state: {lightState}</ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: lightState === "white" ? "#222" : "#f0f0f0" },
            ]}
            onPress={toggleLight}
          >
            <ThemedText
              style={[
                styles.toggleButtonText,
                { color: lightState === "white" ? "#fff" : "#000" },
              ]}
            >
              Toggle to {lightState === "white" ? "BLACK" : "WHITE"}
            </ThemedText>
          </TouchableOpacity>
        </>
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
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
    backgroundColor: "#fff",
  },
  createButton: {
    backgroundColor: "#4C96D7",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  sessionInfo: {
    marginBottom: 30,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    height: 100,
    justifyContent: "center",
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
