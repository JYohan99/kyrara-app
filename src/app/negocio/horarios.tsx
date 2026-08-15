import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  AvailabilityBlock,
  AvailabilityException,
  createAvailability,
  createException,
  deleteAvailability,
  deleteException,
  listAvailability,
  listExceptions,
  toggleAvailabilityActive,
} from "@/features/availability/api";

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function HorariosScreen() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blockModal, setBlockModal] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const [excModal, setExcModal] = useState(false);
  const [excDate, setExcDate] = useState("");
  const [excReason, setExcReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([listAvailability(), listExceptions()])
      .then(([b, e]) => {
        setBlocks(b);
        setExceptions(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCreateBlock() {
    try {
      await createAvailability({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      });
      setBlockModal(false);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleToggleBlock(b: AvailabilityBlock) {
    await toggleAvailabilityActive(b.id);
    load();
  }

  async function handleDeleteBlock(b: AvailabilityBlock) {
    await deleteAvailability(b.id);
    load();
  }

  async function handleCreateException() {
    if (!excDate.trim()) return;
    try {
      await createException({
        date: excDate.trim(),
        closed_all_day: true,
        reason: excReason.trim() || undefined,
      });
      setExcModal(false);
      setExcDate("");
      setExcReason("");
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDeleteException(exc: AvailabilityException) {
    await deleteException(exc.id);
    load();
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: Spacing.four, gap: Spacing.three }}
    >
      {loading && <ActivityIndicator size="large" />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="code" style={styles.sectionLabel}>
          Horario semanal
        </ThemedText>
        <Pressable onPress={() => setBlockModal(true)}>
          <Ionicons name="add-circle" size={26} color="#2563EB" />
        </Pressable>
      </ThemedView>

      {blocks.map((b) => (
        <ThemedView key={b.id} style={styles.row}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText style={!b.active ? styles.inactive : undefined}>
              {DIAS[b.day_of_week]}
            </ThemedText>
            <ThemedText type="small">
              {b.start_time} – {b.end_time}
            </ThemedText>
          </ThemedView>
          <Switch
            value={!!b.active}
            onValueChange={() => handleToggleBlock(b)}
          />
          <Pressable
            onPress={() => handleDeleteBlock(b)}
            style={styles.smallButton}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </ThemedView>
      ))}

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="code" style={styles.sectionLabel}>
          Excepciones (feriados / cierres)
        </ThemedText>
        <Pressable onPress={() => setExcModal(true)}>
          <Ionicons name="add-circle" size={26} color="#2563EB" />
        </Pressable>
      </ThemedView>

      {exceptions.map((e) => (
        <ThemedView key={e.id} style={styles.row}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText>{e.date}</ThemedText>
            {e.reason ? <ThemedText type="small">{e.reason}</ThemedText> : null}
          </ThemedView>
          <Pressable
            onPress={() => handleDeleteException(e)}
            style={styles.smallButton}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </ThemedView>
      ))}

      {/* Modal: nuevo bloque horario */}
      <Modal visible={blockModal} animationType="slide" transparent>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="title">Nuevo bloque horario</ThemedText>

            <ThemedText type="small">Día de la semana</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.two }}
            >
              {DIAS.map((d, i) => (
                <Pressable
                  key={i}
                  onPress={() => setDayOfWeek(i)}
                  style={[
                    styles.dayChip,
                    dayOfWeek === i && styles.dayChipActive,
                  ]}
                >
                  <ThemedText
                    style={dayOfWeek === i ? { color: "white" } : undefined}
                  >
                    {d}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            <TextInput
              placeholder="Hora inicio (ej. 09:00)"
              value={startTime}
              onChangeText={setStartTime}
              style={styles.input}
            />
            <TextInput
              placeholder="Hora fin (ej. 18:00)"
              value={endTime}
              onChangeText={setEndTime}
              style={styles.input}
            />

            <ThemedView style={styles.modalActions}>
              <Pressable
                onPress={() => setBlockModal(false)}
                style={styles.modalButton}
              >
                <ThemedText>Cancelar</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleCreateBlock}
                style={[styles.modalButton, styles.saveButton]}
              >
                <ThemedText style={{ color: "white" }}>Guardar</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Modal: nueva excepción */}
      <Modal visible={excModal} animationType="slide" transparent>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="title">Nueva excepción</ThemedText>

            <TextInput
              placeholder="Fecha (YYYY-MM-DD, ej. 2026-08-25)"
              value={excDate}
              onChangeText={setExcDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Motivo (opcional)"
              value={excReason}
              onChangeText={setExcReason}
              style={styles.input}
            />

            <ThemedView style={styles.modalActions}>
              <Pressable
                onPress={() => setExcModal(false)}
                style={styles.modalButton}
              >
                <ThemedText>Cancelar</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleCreateException}
                style={[styles.modalButton, styles.saveButton]}
              >
                <ThemedText style={{ color: "white" }}>Guardar</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginTop: Spacing.three, textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: "#00000008",
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.three,
  },
  inactive: { opacity: 0.4, textDecorationLine: "line-through" },
  smallButton: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.two },
  addButton: {
    backgroundColor: "#2563EB",
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  error: { color: "red", textAlign: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000055",
  },
  modalCard: {
    padding: Spacing.four,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: "#00000022",
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  saveButton: { backgroundColor: "#2563EB" },
  dayChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    backgroundColor: "#00000011",
    marginRight: Spacing.two,
  },
  dayChipActive: { backgroundColor: "#2563EB" },
});
