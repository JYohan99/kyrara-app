import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { CustomerWithHistory, getCustomer } from "@/features/customers/api";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCustomer(id)
      .then(setCustomer)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{ title: customer?.name || "Cliente", headerShown: true }}
      />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 40 }} />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      {customer && (
        <ThemedView style={{ padding: Spacing.four }}>
          <ThemedText type="title">
            {customer.name || "(sin nombre)"}
          </ThemedText>
          <ThemedText type="small">{customer.phone}</ThemedText>
          {customer.notes ? (
            <ThemedText style={{ marginTop: Spacing.two }}>
              {customer.notes}
            </ThemedText>
          ) : null}

          <ThemedText
            type="code"
            style={{ marginTop: Spacing.four, textTransform: "uppercase" }}
          >
            Historial de reservas
          </ThemedText>
        </ThemedView>
      )}

      <FlatList
        data={customer?.appointments ?? []}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{
          paddingHorizontal: Spacing.four,
          gap: Spacing.two,
        }}
        renderItem={({ item }) => (
          <ThemedView style={styles.row}>
            <ThemedText>{item.service_name}</ThemedText>
            <ThemedText type="small">
              {item.date} {item.start_time} · {item.status}
            </ThemedText>
          </ThemedView>
        )}
        ListEmptyComponent={
          customer && !loading ? (
            <ThemedText style={{ paddingHorizontal: Spacing.four }}>
              Sin reservas todavía.
            </ThemedText>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#00000022",
  },
  error: { color: "red", textAlign: "center", padding: Spacing.four },
});
