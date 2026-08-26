import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  CustomerWithHistory,
  deleteCustomer,
  getCustomer,
  updateCustomer,
} from "@/features/customers/api";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    getCustomer(id)
      .then(setCustomer)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openEdit() {
    if (!customer) return;
    setName(customer.name || "");
    setPhone(customer.phone);
    setNotes(customer.notes || "");
    setModalVisible(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateCustomer(id, { name, phone, notes });
      setModalVisible(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const router = useRouter();

  function handleDelete() {
    if (!customer) return;
    Alert.alert(
      "Eliminar cliente",
      `¿Eliminar a ${customer.name || "este cliente"}? Se conserva su historial de reservas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteCustomer(id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: customer?.name || "Cliente",
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={handleDelete} style={{ marginRight: 8 }}>
              <Ionicons name="trash-outline" size={22} color="#DC2626" />
            </Pressable>
          ),
        }}
      />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 40 }} />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      {customer && (
        <ThemedView style={{ padding: Spacing.four }}>
          <ThemedView style={styles.titleRow}>
            <ThemedText type="title">
              {customer.name || "(sin nombre)"}
            </ThemedText>
            <Pressable onPress={openEdit}>
              <Ionicons name="pencil-outline" size={20} color="#2563EB" />
            </Pressable>
          </ThemedView>
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="title">Editar cliente</ThemedText>

            <TextInput
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Teléfono"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
            />
            <TextInput
              placeholder="Notas"
              value={notes}
              onChangeText={setNotes}
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
  titleRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  row: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#00000022",
  },
  error: { color: "red", textAlign: "center", padding: Spacing.four },
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
