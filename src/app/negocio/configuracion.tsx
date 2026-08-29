import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";
import {
  registerForPushNotifications,
  sendTestLocalNotification,
} from "@/core/services/notificationService";
import {
  OPCIONES_INTERVALO,
  useConfiguracionViewModel,
} from "@/features/appointments";

export default function ConfiguracionScreen() {
  const [testingNotif, setTestingNotif] = useState(false);
  const [syncingToken, setSyncingToken] = useState(false);

  const {
    business,
    loading,
    saving,
    error,
    name,
    phone,
    address,
    logoBase64,
    setName,
    setPhone,
    setAddress,
    pickLogo,
    handleSaveInfo,
    handleSelectMode,
    handleSelectInterval,
  } = useConfiguracionViewModel();

  const handleTestNotification = async () => {
    setTestingNotif(true);
    try {
      await sendTestLocalNotification(
        "💈 Kyrara Barber",
        "¡Notificación de prueba recibida con éxito en tu teléfono!"
      );
      Alert.alert(
        "Notificación Enviada",
        "Se ha enviado la alerta de prueba a la barra de notificaciones."
      );
    } catch {
      Alert.alert("Error", "No se pudo enviar la notificación de prueba.");
    } finally {
      setTestingNotif(false);
    }
  };

  const handleSyncPushToken = async () => {
    setSyncingToken(true);
    try {
      const token = await registerForPushNotifications();
      if (token) {
        Alert.alert(
          "Token Registrado",
          "Tu teléfono ha quedado vinculado exitosamente al servidor para recibir alertas de WhatsApp."
        );
      } else {
        Alert.alert(
          "Atención",
          "No se pudo obtener el token. Asegúrate de tener concedidos los permisos de notificaciones."
        );
      }
    } catch {
      Alert.alert("Error", "Ocurrió un problema al sincronizar el token.");
    } finally {
      setSyncingToken(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Configuración General",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.secondary} />
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* SECCIÓN 1: LOGO DEL NEGOCIO */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="image-outline" size={18} color={Palette.secondary} />
              <ThemedText style={styles.sectionTitle}>Logo del Negocio</ThemedText>
            </View>

            <View style={styles.logoRow}>
              <Pressable
                onPress={pickLogo}
                style={({ pressed }) => [styles.logoPicker, pressed && styles.pressed]}
              >
                {logoBase64 ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${logoBase64}` }}
                    style={styles.logoPreview}
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="camera-outline" size={28} color={Palette.textMuted} />
                    <ThemedText style={styles.logoPlaceholderText}>
                      Subir foto
                    </ThemedText>
                  </View>
                )}
              </Pressable>

              <View style={styles.logoDescription}>
                <ThemedText style={styles.logoHelpTitle}>
                  Imagen de Marca
                </ThemedText>
                <ThemedText style={styles.logoHelpText}>
                  Aparece en la cabecera de la app y en los mensajes automáticos para clientes.
                </ThemedText>
                <Pressable onPress={pickLogo} style={styles.changePhotoButton}>
                  <ThemedText style={styles.changePhotoText}>
                    {logoBase64 ? "Cambiar imagen" : "Seleccionar de la galería"}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* SECCIÓN 2: DATOS PRINCIPALES */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="business-outline" size={18} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionTitle}>Datos del Negocio</ThemedText>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.inputWrap}>
                <Ionicons name="storefront-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  placeholder="Nombre del negocio"
                  placeholderTextColor={Palette.textMuted}
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  placeholder="Teléfono comercial"
                  placeholderTextColor={Palette.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="location-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  placeholder="Dirección del local"
                  placeholderTextColor={Palette.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={handleSaveInfo}
                style={({ pressed }) => [
                  styles.saveInfoBtn,
                  saving && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ThemedText style={styles.saveInfoBtnText}>
                    Guardar Cambios de Perfil
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>

          {/* SECCIÓN 3: MODO DE RESERVA */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <ThemedText style={styles.sectionTitle}>
                Modo de Reserva por WhatsApp
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Define si el bot de WhatsApp confirma la cita inmediatamente o si requiere tu aprobación manual.
            </ThemedText>

            {business && (
              <View style={styles.optionsRow}>
                <Pressable
                  onPress={() => handleSelectMode("auto")}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.optionChip,
                    business.booking_mode === "auto" && styles.optionChipActivePrimary,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="flash-outline"
                    size={16}
                    color={
                      business.booking_mode === "auto"
                        ? "#ffffff"
                        : Palette.textMuted
                    }
                  />
                  <ThemedText
                    style={[
                      styles.optionChipText,
                      business.booking_mode === "auto" && styles.optionChipTextActive,
                    ]}
                  >
                    Automático
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectMode("approval")}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.optionChip,
                    business.booking_mode === "approval" && styles.optionChipActiveSecondary,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={
                      business.booking_mode === "approval"
                        ? "#ffffff"
                        : Palette.textMuted
                    }
                  />
                  <ThemedText
                    style={[
                      styles.optionChipText,
                      business.booking_mode === "approval" && styles.optionChipTextActive,
                    ]}
                  >
                    Con Aprobación
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>

          {/* SECCIÓN 4: INTERVALO DE TURNOS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="timer-outline" size={18} color={Palette.secondary} />
              <ThemedText style={styles.sectionTitle}>
                Intervalo de Horarios Ofrecidos
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Frecuencia temporal del motor de disponibilidad al calcular slots libres.
            </ThemedText>

            {business && (
              <View style={styles.optionsRow}>
                {OPCIONES_INTERVALO.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => handleSelectInterval(m)}
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.intervalChip,
                      business.slot_step_minutes === m && styles.intervalChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.intervalChipText,
                        business.slot_step_minutes === m && styles.intervalChipTextActive,
                      ]}
                    >
                      {m} min
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* SECCIÓN 5: NOTIFICACIONES Y ALERTAS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="notifications-outline" size={18} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionTitle}>
                Notificaciones y Alertas
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Configura y comprueba la recepción de avisos automáticos cuando los clientes agenden citas.
            </ThemedText>

            <View style={styles.notifBtnGroup}>
              <Pressable
                onPress={handleTestNotification}
                disabled={testingNotif}
                style={({ pressed }) => [
                  styles.notifBtnSecondary,
                  testingNotif && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {testingNotif ? (
                  <ActivityIndicator size="small" color={Palette.secondary} />
                ) : (
                  <>
                    <Ionicons name="volume-high-outline" size={18} color={Palette.secondary} />
                    <ThemedText style={styles.notifBtnSecondaryText}>
                      Probar Alerta en este Dispositivo
                    </ThemedText>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleSyncPushToken}
                disabled={syncingToken}
                style={({ pressed }) => [
                  styles.notifBtnPrimary,
                  syncingToken && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {syncingToken ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="sync-outline" size={18} color="#ffffff" />
                    <ThemedText style={styles.notifBtnPrimaryText}>
                      Vincular Teléfono para Alertas de WhatsApp
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: 60,
  },
  loadingContainer: {
    paddingVertical: Spacing.six,
    alignItems: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.errorContainer,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 13,
    color: Palette.textMuted,
    lineHeight: 18,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  logoPicker: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoPreview: {
    width: 90,
    height: 90,
  },
  logoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  logoPlaceholderText: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  logoDescription: {
    flex: 1,
    gap: 4,
  },
  logoHelpTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  logoHelpText: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 16,
  },
  changePhotoButton: {
    marginTop: 4,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.secondary,
  },
  formGroup: {
    gap: Spacing.three,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    height: 48,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  saveInfoBtn: {
    backgroundColor: Palette.primary,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.one,
  },
  saveInfoBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  optionsRow: {
    flexDirection: "row",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  optionChipActivePrimary: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  optionChipActiveSecondary: {
    backgroundColor: Palette.secondaryDark,
    borderColor: Palette.secondary,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Palette.textMuted,
  },
  optionChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  intervalChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  intervalChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  intervalChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  intervalChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
  notifBtnGroup: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  notifBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: Spacing.two,
  },
  notifBtnSecondaryText: {
    color: Palette.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  notifBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  notifBtnPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
