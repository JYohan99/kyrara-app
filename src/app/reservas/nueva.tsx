import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
    createAppointment,
    getAvailableSlots,
} from "@/features/appointments/api";
import { Customer, listCustomers } from "@/features/customers/api";
import { Service, listServices } from "@/features/services/api";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NuevaReservaScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message));
    listServices()
      .then(setServices)
      .catch((e) => setError(e.message));
  }, []);

  // Cada vez que cambia el servicio o la fecha, volvemos a pedir los
  // horarios disponibles reales al motor de disponibilidad del backend.
  useEffect(() => {
    if (!selectedService || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailableSlots(date, selectedService.id)
      .then((res) => setSlots(res.slots))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, date]);

  async function handleConfirm() {
    if (!selectedCustomer || !selectedService || !selectedSlot) return;
    setSaving(true);
    setError(null);
    try {
      await createAppointment({
        customer_id: selectedCustomer.id,
        service_id: selectedService.id,
        date,
        start_time: selectedSlot,
      });
      router.back();
    } catch (e: any) {
      setError(e.message);
      // El horario que elegiste puede haber sido tomado por otra reserva
      // justo antes (Regla 004) — volvemos a pedir la lista actualizada.
      if (selectedService) {
        getAvailableSlots(date, selectedService.id).then((res) =>
          setSlots(res.slots),
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: Spacing.four, gap: Spacing.three }}
    >
      <ThemedText type="code" style={styles.label}>
        Cliente
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {customers.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelectedCustomer(c)}
            style={[
              styles.chip,
              selectedCustomer?.id === c.id && styles.chipActive,
            ]}
          >
            <ThemedText
              style={
                selectedCustomer?.id === c.id ? { color: "white" } : undefined
              }
            >
              {c.name || c.phone}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ThemedText type="code" style={styles.label}>
        Servicio
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {services
          .filter((s) => s.active)
          .map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSelectedService(s)}
              style={[
                styles.chip,
                selectedService?.id === s.id && styles.chipActive,
              ]}
            >
              <ThemedText
                style={
                  selectedService?.id === s.id ? { color: "white" } : undefined
                }
              >
                {s.name} ({s.duration_minutes}min)
              </ThemedText>
            </Pressable>
          ))}
      </ScrollView>

      <ThemedText type="code" style={styles.label}>
        Fecha
      </ThemedText>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
      />

      <ThemedText type="code" style={styles.label}>
        Horario disponible
      </ThemedText>
      {loadingSlots && <ActivityIndicator />}
      {!loadingSlots && selectedService && slots.length === 0 && (
        <ThemedText type="small">
          No hay horarios disponibles ese día.
        </ThemedText>
      )}
      <ThemedView style={styles.slotsWrap}>
        {slots.map((slot) => (
          <Pressable
            key={slot}
            onPress={() => setSelectedSlot(slot)}
            style={[
              styles.slotChip,
              selectedSlot === slot && styles.chipActive,
            ]}
          >
            <ThemedText
              style={selectedSlot === slot ? { color: "white" } : undefined}
            >
              {slot}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <Pressable
        style={[
          styles.confirmButton,
          (!selectedCustomer || !selectedService || !selectedSlot) && {
            opacity: 0.4,
          },
        ]}
        disabled={
          !selectedCustomer || !selectedService || !selectedSlot || saving
        }
        onPress={handleConfirm}
      >
        <ThemedText style={{ color: "white" }}>
          {saving ? "Guardando..." : "Confirmar reserva"}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { textTransform: "uppercase", marginTop: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    backgroundColor: "#00000011",
    marginRight: Spacing.two,
  },
  chipActive: { backgroundColor: "#2563EB" },
  input: {
    borderWidth: 1,
    borderColor: "#00000022",
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  slotsWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  slotChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: "#00000011",
  },
  error: { color: "red", textAlign: "center" },
  confirmButton: {
    backgroundColor: "#2563EB",
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
    marginTop: Spacing.two,
    marginBottom: Spacing.six ?? 60,
  },
});
