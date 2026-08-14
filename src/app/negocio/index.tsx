import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NegocioScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 20, gap: 16 }}>
        <Link href="/negocio/servicios">
          <ThemedText type="link">Servicios →</ThemedText>
        </Link>
        <Link href="/negocio/horarios">
          <ThemedText type="link">Horarios →</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}
