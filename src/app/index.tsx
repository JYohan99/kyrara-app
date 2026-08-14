import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { Business, fetchBusiness, Service } from "@/features/appointments/api";

export default function HomeScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness()
      .then((data) => {
        setBusiness(data.business);
        setServices(data.services);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        )}

        {error && (
          <ThemedText style={styles.error}>
            No se pudo conectar con el backend: {error}
          </ThemedText>
        )}

        {business && (
          <ThemedView style={styles.card}>
            <ThemedText type="title">{business.name}</ThemedText>
            <ThemedText type="small" style={{ marginTop: Spacing.one }}>
              {business.address}
            </ThemedText>

            <ThemedText type="code" style={styles.sectionLabel}>
              Servicios
            </ThemedText>

            {services.map((s) => (
              <ThemedView key={s.id} style={styles.serviceRow}>
                <ThemedText>{s.name}</ThemedText>
                <ThemedText type="small">
                  {s.duration_minutes} min{s.price ? ` · $${s.price}` : ""}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "stretch",
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  sectionLabel: {
    marginTop: Spacing.four,
    textTransform: "uppercase",
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#00000022",
  },
  error: {
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },
});
