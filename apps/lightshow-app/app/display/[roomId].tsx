import * as Brightness from "expo-brightness";
import * as KeepAwake from "expo-keep-awake";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useSessionStateQuery } from "@/hooks/useSessionStateQuery";
import { useSessionsQuery } from "@/hooks/useSessionsQuery";

export default function DisplayScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [showBackButton, setShowBackButton] = useState(false);
  const { data: sessionState } = useSessionStateQuery(sessionId);
  const { data: sessions } = useSessionsQuery();
  const router = useRouter();

  // Adjust brightness based on session state
  useEffect(() => {
    if (sessionState) {
      adjustBrightness(sessionState.screenColor);
    }
  }, [sessionState]);

  // If the session is not found, go back
  useEffect(() => {
    if (sessions) {
      const session = sessions.find(
        (session) => session.sessionId === sessionId
      );
      if (!session) {
        router.back();
      }
    }
  }, [sessions]);

  // Keep the screen awake
  useEffect(() => {
    KeepAwake.activateKeepAwakeAsync();

    // Disable hardware back button (Android)
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Show back button on hardware back press
        setShowBackButton(true);
        return true;
      }
    );

    return () => {
      Brightness.restoreSystemBrightnessAsync();
      KeepAwake.deactivateKeepAwake();
      backHandler.remove();
    };
  }, [sessionId]);

  const adjustBrightness = async (state: "white" | "black") => {
    try {
      // Request permission if needed (Android)
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        // Set brightness to max for white, lower for black
        await Brightness.setBrightnessAsync(state === "white" ? 1 : 0.3);
      }
    } catch (error) {
      console.error("Failed to adjust brightness:", error);
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
        {
          backgroundColor:
            sessionState?.screenColor === "white" ? "#ffffff" : "#000000",
        },
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          animation: "none",
          gestureEnabled: false,
        }}
      />

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
            {
              backgroundColor:
                sessionState?.screenColor === "white"
                  ? "rgba(0,0,0,0.3)"
                  : "rgba(255,255,255,0.3)",
            },
          ]}
          onPress={handleBack}
        >
          <ThemedText
            style={[
              styles.backButtonText,
              {
                color: sessionState?.screenColor === "white" ? "#000" : "#fff",
              },
            ]}
          >
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
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenTouchArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 15,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
