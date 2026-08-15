import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
    Business,
    fetchBusiness,
    updateBusinessSettings,
} from "@/features/appointments/api";

const OPCIONES = [15, 30, 45, 60];

export default function ConfiguracionScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusiness()
      .then((data) => setBusiness(data.business))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(minutes: number) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings({
        slot_step_minutes: minutes,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="code" style={{ textTransform: "uppercase" }}>
        Intervalo de horarios ofrecidos
      </ThemedText>
      <ThemedText
        type="small"
        style={{ marginTop: Spacing.one, marginBottom: Spacing.three }}
      >
        Cada cuánto tiempo el motor de disponibilidad ofrece un horario nuevo al
        calcular reservas.
      </ThemedText>

      {loading && <ActivityIndicator />}
      {error && <ThemedText style={{ color: "red" }}>{error}</ThemedText>}

      {business && (
        <ThemedView style={styles.optionsRow}>
          {OPCIONES.map((m) => (
            <Pressable
              key={m}
              onPress={() => handleSelect(m)}
              disabled={saving}
              style={[
                styles.chip,
                business.slot_step_minutes === m && styles.chipActive,
              ]}
            >
              <ThemedText
                style={
                  business.slot_step_minutes === m
                    ? { color: "white" }
                    : undefined
                }
              >
                {m} min
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  optionsRow: { flexDirection: "row", gap: Spacing.two, flexWrap: "wrap" },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    backgroundColor: "#00000011",
  },
  chipActive: { backgroundColor: "#2563EB" },
});
