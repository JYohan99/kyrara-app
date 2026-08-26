import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  Business,
  fetchBusiness,
  updateBusiness,
  updateBusinessSettings,
} from "@/features/appointments/api";

const OPCIONES_INTERVALO = [15, 30, 45, 60];

export default function ConfiguracionScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  useEffect(() => {
    fetchBusiness()
      .then((data) => {
        setBusiness(data.business);
        setName(data.business.name);
        setPhone(data.business.phone ?? "");
        setAddress(data.business.address ?? "");
        setLogoBase64(data.business.logo_base64);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function pickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Necesitamos permiso para acceder a tus fotos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLogoBase64(result.assets[0].base64);
    }
  }

  async function handleSaveInfo() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusiness({
        name,
        phone,
        address,
        logo_base64: logoBase64 ?? undefined,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectMode(mode: "auto" | "approval") {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings({ booking_mode: mode });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectInterval(minutes: number) {
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

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four, gap: Spacing.four }}>
      {error && <ThemedText style={{ color: "red" }}>{error}</ThemedText>}

      <ThemedView>
        <ThemedText type="code" style={styles.label}>
          Logo del negocio
        </ThemedText>
        <Pressable onPress={pickLogo} style={styles.logoPicker}>
          {logoBase64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${logoBase64}` }}
              style={styles.logoPreview}
            />
          ) : (
            <ThemedText type="small">Tocar para elegir una imagen</ThemedText>
          )}
        </Pressable>
      </ThemedView>

      <ThemedView>
        <ThemedText type="code" style={styles.label}>
          Datos del negocio
        </ThemedText>
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
          placeholder="Dirección"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />

        <Pressable
          onPress={handleSaveInfo}
          style={styles.saveButton}
          disabled={saving}
        >
          <ThemedText style={{ color: "white" }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView>
        <ThemedText type="code" style={styles.label}>
          Intervalo de horarios ofrecidos
        </ThemedText>
        <ThemedText type="small" style={{ marginBottom: Spacing.two }}>
          Cada cuánto tiempo el motor de disponibilidad ofrece un horario nuevo.
        </ThemedText>

        <ThemedView>
          <ThemedText type="code" style={styles.label}>
            Modo de reserva por WhatsApp
          </ThemedText>
          <ThemedText type="small" style={{ marginBottom: Spacing.two }}>
            Automático: la reserva queda confirmada apenas el cliente la
            confirma. Con aprobación: vos la aceptás o rechazás después.
          </ThemedText>

          {business && (
            <ThemedView style={styles.optionsRow}>
              <Pressable
                onPress={() => handleSelectMode("auto")}
                disabled={saving}
                style={[
                  styles.chip,
                  business.booking_mode === "auto" && styles.chipActive,
                ]}
              >
                <ThemedText
                  style={
                    business.booking_mode === "auto"
                      ? { color: "white" }
                      : undefined
                  }
                >
                  Automático
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleSelectMode("approval")}
                disabled={saving}
                style={[
                  styles.chip,
                  business.booking_mode === "approval" && styles.chipActive,
                ]}
              >
                <ThemedText
                  style={
                    business.booking_mode === "approval"
                      ? { color: "white" }
                      : undefined
                  }
                >
                  Con aprobación
                </ThemedText>
              </Pressable>
            </ThemedView>
          )}
        </ThemedView>

        {business && (
          <ThemedView style={styles.optionsRow}>
            {OPCIONES_INTERVALO.map((m) => (
              <Pressable
                key={m}
                onPress={() => handleSelectInterval(m)}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  label: { textTransform: "uppercase", marginBottom: Spacing.two },
  logoPicker: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#00000011",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoPreview: { width: 100, height: 100 },
  input: {
    borderWidth: 1,
    borderColor: "#00000022",
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  saveButton: {
    backgroundColor: "#2563EB",
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  optionsRow: { flexDirection: "row", gap: Spacing.two, flexWrap: "wrap" },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    backgroundColor: "#00000011",
  },
  chipActive: { backgroundColor: "#2563EB" },
});
