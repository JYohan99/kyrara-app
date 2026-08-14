import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClientesScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <ThemedText type="title">Clientes</ThemedText>
        <ThemedText style={{ marginTop: 10 }}>
          Próximamente: listado y búsqueda.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}
