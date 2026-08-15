import { getDisplayStatus } from "@/utils/appointmentStatus";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  Appointment,
  cancelAppointment,
  listAppointments,
} from "@/features/appointments/api";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function formatLabel(dateStr: string): string {
  if (dateStr === todayStr()) return "Hoy";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default function ReservasScreen() {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listAppointments(date)
      .then(setAppointments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleCancel(a: Appointment) {
    Alert.alert(
      "Cancelar reserva",
      `¿Cancelar la reserva de ${a.customer_name}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            await cancelAppointment(a.id);
            load();
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => setDate((d) => addDays(d, -1))}>
          <Ionicons name="chevron-back" size={26} />
        </Pressable>

        <Pressable
          onPress={() => setDate(todayStr())}
          style={{ alignItems: "center" }}
        >
          <ThemedText
            style={{
              textTransform: "capitalize",
              fontWeight: "700",
              fontSize: date === todayStr() ? 23 : 17,
            }}
          >
            {formatLabel(date)}
          </ThemedText>
          {date !== todayStr() && (
            <ThemedText type="small" style={{ color: "#2563EB" }}>
              volver a hoy
            </ThemedText>
          )}
        </Pressable>

        <Pressable onPress={() => setDate((d) => addDays(d, 1))}>
          <Ionicons name="chevron-forward" size={26} />
        </Pressable>
      </ThemedView>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <FlatList
        data={appointments}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: Spacing.four, gap: Spacing.two }}
        renderItem={({ item }) => {
          const displayStatus = getDisplayStatus(
            item.date,
            item.start_time,
            item.end_time,
            item.status,
          );
          const canCancel =
            item.status === "CONFIRMED" || item.status === "PENDING_APPROVAL";

          return (
            <ThemedView style={styles.row}>
              <ThemedText style={styles.time}>{item.start_time}</ThemedText>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText>{item.customer_name}</ThemedText>
                <ThemedText type="small">{item.service_name}</ThemedText>
              </ThemedView>
              <ThemedView
                style={[styles.badge, { backgroundColor: displayStatus.color }]}
              >
                <ThemedText style={styles.badgeText}>
                  {displayStatus.label}
                </ThemedText>
              </ThemedView>
              {canCancel && (
                <Pressable onPress={() => handleCancel(item)}>
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#DC2626"
                  />
                </Pressable>
              )}
            </ThemedView>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <ThemedText style={{ padding: Spacing.four }}>
              Sin reservas ese día.
            </ThemedText>
          ) : null
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/reservas/nueva")}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: "#00000008",
  },
  time: { fontWeight: "600", width: 50 },
  error: { color: "red", textAlign: "center", padding: Spacing.three },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "white", fontSize: 28, lineHeight: 30 },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
});
