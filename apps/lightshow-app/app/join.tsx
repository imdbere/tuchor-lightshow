import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import socketService, { Session } from '@/services/socketService';

export default function JoinScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for session list updates
    socketService.requestSessionList();
    return socketService.onSessionList((sessionList) => {
      console.log('Received session list:', sessionList);
      setSessions(sessionList);
      setLoading(false);
    });

  }, []);

  const handleJoinSession = (sessionId: string) => {
    // Join the session via socket
    socketService.joinSession(sessionId);
    
    // Navigate to display screen with sessionId parameter
    router.push(`/display/${sessionId}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Available Sessions</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4C96D7" style={styles.loader} />
      ) : sessions.length === 0 ? (
        <ThemedText style={styles.emptyText}>No active sessions found</ThemedText>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item, index) => item.sessionId || `session-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.sessionItem} 
              onPress={() => handleJoinSession(item.sessionId!)}
            >
              <ThemedText style={styles.sessionName}>{item.name}</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  listContent: {
    paddingBottom: 20,
  },
  sessionItem: {
    backgroundColor: '#4C96D7',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
