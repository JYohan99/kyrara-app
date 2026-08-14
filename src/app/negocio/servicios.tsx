import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
    Service,
    createService,
    listServices,
    toggleServiceActive,
    updateService,
} from "@/features/services/api";

export default function ServiciosScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listServices()
      .then(setServices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Recarga cada vez que la pantalla vuelve a estar en foco (ej. al volver
  // de crear un servicio), no solo la primera vez que se monta.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openCreate() {
    setEditing(null);
    setName("");
    setDuration("");
    setPrice("");
    setModalVisible(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setName(service.name);
    setDuration(String(service.duration_minutes));
    setPrice(service.price ? String(service.price) : "");
    setModalVisible(true);
  }

  async function handleSave() {
    if (!name.trim() || !duration.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        duration_minutes: Number(duration),
        price: price.trim() ? Number(price) : undefined,
      };
      if (editing) {
        await updateService(editing.id, payload);
      } else {
        await createService(payload);
      }
      setModalVisible(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(service: Service) {
    try {
      await toggleServiceActive(service.id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <ThemedView style={styles.container}>
      {loading && <ActivityIndicator size="large" style={{ marginTop: 40 }} />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: Spacing.four, gap: Spacing.two }}
        renderItem={({ item }) => (
          <Pressable onPress={() => openEdit(item)} style={styles.row}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText
                style={!item.active ? styles.inactiveText : undefined}
              >
                {item.name}
              </ThemedText>
              <ThemedText type="small">
                {item.duration_minutes} min
                {item.price ? ` · $${item.price}` : ""}
              </ThemedText>
            </ThemedView>
            <Switch
              value={!!item.active}
              onValueChange={() => handleToggle(item)}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <ThemedText style={{ padding: Spacing.four }}>
              Sin servicios todavía.
            </ThemedText>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={openCreate}>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="title">
              {editing ? "Editar servicio" : "Nuevo servicio"}
            </ThemedText>

            <TextInput
              placeholder="Nombre (ej. Corte clásico)"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Duración en minutos"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Precio (opcional)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />

            <ThemedView style={styles.modalActions}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <ThemedText>Cancelar</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.modalButton, styles.saveButton]}
                disabled={saving}
              >
                <ThemedText style={{ color: "white" }}>
                  {saving ? "Guardando..." : "Guardar"}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: "#00000008",
  },
  inactiveText: { opacity: 0.4, textDecorationLine: "line-through" },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000055",
  },
  modalCard: {
    padding: Spacing.four,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    gap: Spacing.three,
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
});
