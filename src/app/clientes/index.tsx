import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
    Customer,
    createCustomer,
    listCustomers,
} from "@/features/customers/api";

export default function ClientesScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback((query?: string) => {
    setLoading(true);
    listCustomers(query)
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(search || undefined);
    }, [load]),
  );

  function openCreate() {
    setName("");
    setPhone("");
    setNotes("");
    setFormError(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!phone.trim()) {
      setFormError("El teléfono es obligatorio");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await createCustomer({
        name: name.trim() || undefined,
        phone: phone.trim(),
        notes: notes.trim() || undefined,
      });
      setModalVisible(false);
      load(search || undefined);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <TextInput
        placeholder="Buscar por nombre o teléfono..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          load(text || undefined);
        }}
        style={styles.search}
      />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <FlatList
        data={customers}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: Spacing.four, gap: Spacing.two }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/clientes/[id]",
                params: { id: item.id },
              })
            }
            style={styles.row}
          >
            <ThemedText>{item.name || "(sin nombre)"}</ThemedText>
            <ThemedText type="small">{item.phone}</ThemedText>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <ThemedText style={{ padding: Spacing.four }}>
              Sin clientes todavía.
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
            <ThemedText type="title">Nuevo cliente</ThemedText>

            <TextInput
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Teléfono (ej. +59891234567)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Notas (opcional)"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
            />

            {formError && (
              <ThemedText style={styles.error}>{formError}</ThemedText>
            )}

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
  search: {
    margin: Spacing.four,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#00000022",
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  row: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: "#00000008",
  },
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
