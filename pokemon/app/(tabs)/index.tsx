import {
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  FlatList,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePokemon, Pokemon } from "@/hooks/usePokemon";
import { ActivityIndicator } from "react-native";

export default function HomeScreen() {
  const { pokemon, loadMore } = usePokemon();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HelloWave />
      <FlatList
        windowSize={20}
        removeClippedSubviews
        data={pokemon}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <ThemedView style={styles.stepContainer}>
            <ThemedText>{item.name}</ThemedText>
            <Image source={{ uri: item.sprite }} style={{ height: 100, width: 100 }} />
          </ThemedView>
        )}
        onEndReached={loadMore}
        ListFooterComponent={() => (
          <ThemedView style={styles.stepContainer}>
            <ActivityIndicator size="large" />
          </ThemedView>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
