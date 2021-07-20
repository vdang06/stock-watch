import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet } from "react-native";

export const Loading = () => (
    <SafeAreaView style={[styles.container, styles.horizontal]} edges={["top", "right", "left"]}>
        <ActivityIndicator size="large" />
    </SafeAreaView>
)

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center"
    },
    horizontal: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 10
    }
});