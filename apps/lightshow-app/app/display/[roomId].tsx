import React, { useState, useEffect } from 'react';
import { StyleSheet, View, BackHandler, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Brightness from 'expo-brightness';
import * as KeepAwake from 'expo-keep-awake';

import { ThemedText } from '@/components/ThemedText';
import socketService from '@/services/socketService';

export default function DisplayScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [displayState, setDisplayState] = useState<'white' | 'black'>('white');
  const [showBackButton, setShowBackButton] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Listen for state updates
    const updateStateCleanup = socketService.onUpdateState((state) => {
      console.log('Received state update:', state);
      setDisplayState(state);
      
      // Set screen brightness based on state
      adjustBrightness(state);
    });

    const sessionListCleanup = socketService.onSessionList((sessionList) => {
      if (!sessionList.find((session) => session.sessionId === sessionId)) {
        console.log('Session not found, redirecting to join');
        router.back();
      }
    });
    
    // Set screen brightness on mount
    adjustBrightness(displayState);
    
    // Keep the screen awake
    KeepAwake.activateKeepAwakeAsync();
    
    // Disable hardware back button (Android)
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Show back button on hardware back press
      setShowBackButton(true);
      return true;
    });
    
    return () => {
      Brightness.restoreSystemBrightnessAsync();
      KeepAwake.deactivateKeepAwake();
      backHandler.remove();
      updateStateCleanup();
      sessionListCleanup();
    };
  }, [sessionId]);
  
  const adjustBrightness = async (state: 'white' | 'black') => {
    try {
      // Request permission if needed (Android)
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        // Set brightness to max for white, lower for black
        await Brightness.setBrightnessAsync(state === 'white' ? 1 : 0.3);
      }
    } catch (error) {
      console.error('Failed to adjust brightness:', error);
    }
  };
  
  const handleBack = () => {
    // Clean up before leaving
    Brightness.restoreSystemBrightnessAsync();
    KeepAwake.deactivateKeepAwake();
    
    // Go back
    router.back();
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: displayState === 'white' ? '#ffffff' : '#000000' }
      ]}
    >
      <Stack.Screen options={{ 
        headerShown: false,
        animation: 'none',
        gestureEnabled: false
      }} />
      
      {/* Touch area for showing/hiding back button */}
      <TouchableOpacity 
        style={styles.fullScreenTouchArea}
        onPress={() => setShowBackButton(!showBackButton)}
        activeOpacity={1}
      />
      
      {showBackButton && (
        <TouchableOpacity 
          style={[
            styles.backButton,
            { backgroundColor: displayState === 'white' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }
          ]} 
          onPress={handleBack}
        >
          <ThemedText style={[
            styles.backButtonText,
            { color: displayState === 'white' ? '#000' : '#fff' }
          ]}>
            ← Back
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 15,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 