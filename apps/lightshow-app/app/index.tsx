import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import socketService from '@/services/socketService';

export default function HomeScreen() {
  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Clean up on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleHostSession = () => {
    router.push('/host');
  };

  const handleJoinSession = () => {
    router.push('/join');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Choir Lightshow</ThemedText>
      </ThemedView>

      <ThemedView style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleHostSession}
        >
          <ThemedText style={styles.buttonText}>Host a Session</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleJoinSession}
        >
          <ThemedText style={styles.buttonText}>Join a Session</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
  },
  button: {
    backgroundColor: '#4C96D7',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
}); 