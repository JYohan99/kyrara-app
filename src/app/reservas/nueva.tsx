import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
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
import { useNuevaReservaViewModel } from "@/features/appointments";

function getInitials(name?: string | null, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (phone) return phone.slice(-2);
  return "?";
}

export default function NuevaReservaScreen() {
  const router = useRouter();
  const {
    customers,
    services,
    selectedCustomer,
    selectedService,
    date,
    slots,
    selectedSlot,
    loadingSlots,
    saving,
    error,
    isConfirmDisabled,
    handleSelectCustomer,
    handleSelectService,
    handleDateChange,
    handleSelectSlot,
    handleConfirm,
  } = useNuevaReservaViewModel();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Nueva Reserva",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECCIÓN 1: CLIENTE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={16} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionLabel}>1. Seleccionar Cliente</ThemedText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChipsWrap}
            >
              {customers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCustomer(c)}
                    style={({ pressed }) => [
                      styles.customerCard,
                      isSelected && styles.customerCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        isSelected && styles.avatarCircleSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.avatarText,
                          isSelected && styles.avatarTextSelected,
                        ]}
                      >
                        {getInitials(c.name, c.phone)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {c.name || c.phone}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* SECCIÓN 2: SERVICIO */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cut-outline" size={16} color={Palette.secondary} />
              <ThemedText style={styles.sectionLabel}>2. Seleccionar Servicio</ThemedText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChipsWrap}
            >
              {services
                .filter((s) => s.active)
                .map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => handleSelectService(s)}
                      style={({ pressed }) => [
                        styles.serviceCard,
                        isSelected && styles.serviceCardSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.serviceTitle,
                          isSelected && styles.serviceTitleSelected,
                        ]}
                      >
                        {s.name}
                      </ThemedText>
                      <View style={styles.serviceMetaRow}>
                        <ThemedText style={styles.serviceDuration}>
                          {s.duration_minutes} min
                        </ThemedText>
                        {s.price !== null && (
                          <View style={styles.priceBadge}>
                            <ThemedText style={styles.priceBadgeText}>
                              ${s.price}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
            </ScrollView>
          </View>

          {/* SECCIÓN 3: FECHA */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={16} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionLabel}>3. Fecha de Reserva</ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="today-outline" size={18} color={Palette.textMuted} />
              <TextInput
                value={date}
                onChangeText={handleDateChange}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Palette.textMuted}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* SECCIÓN 4: HORARIOS DISPONIBLES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={16} color={Palette.secondary} />
              <ThemedText style={styles.sectionLabel}>4. Horario Disponible</ThemedText>
            </View>

            {loadingSlots && (
              <View style={styles.slotsLoadingWrap}>
                <ActivityIndicator size="small" color={Palette.secondary} />
                <ThemedText style={styles.slotsLoadingText}>
                  Consultando disponibilidad en tiempo real...
                </ThemedText>
              </View>
            )}

            {!loadingSlots && selectedService && slots.length === 0 && (
              <View style={styles.noSlotsCard}>
                <Ionicons name="information-circle-outline" size={20} color={Palette.warning} />
                <ThemedText style={styles.noSlotsText}>
                  No hay horarios disponibles para la fecha seleccionada.
                </ThemedText>
              </View>
            )}

            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => handleSelectSlot(slot)}
                    style={({ pressed }) => [
                      styles.slotChip,
                      isSelected && styles.slotChipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.slotText,
                        isSelected && styles.slotTextSelected,
                      ]}
                    >
                      {slot}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* MENSAJE DE ERROR */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* BOTÓN CONFIRMAR */}
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              isConfirmDisabled && styles.confirmButtonDisabled,
              pressed && !isConfirmDisabled && styles.pressed,
            ]}
            disabled={isConfirmDisabled}
            onPress={handleConfirm}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.confirmButtonContent}>
                <ThemedText style={styles.confirmButtonText}>
                  Confirmar Reserva
                </ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </View>
            )}
          </Pressable>
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
    paddingBottom: 40,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  horizontalChipsWrap: {
    gap: Spacing.two,
    paddingVertical: 4,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: 8,
  },
  customerCardSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircleSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  avatarTextSelected: {
    color: "#ffffff",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: Palette.textPrimary,
  },
  chipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  serviceCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.card,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    minWidth: 140,
    gap: 6,
  },
  serviceCardSelected: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderColor: Palette.secondary,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  serviceTitleSelected: {
    color: Palette.secondary,
  },
  serviceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  serviceDuration: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  priceBadge: {
    backgroundColor: Palette.surfaceContainerLowest,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.secondary,
  },
  inputContainer: {
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
  textInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  slotsLoadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  slotsLoadingText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  noSlotsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  noSlotsText: {
    fontSize: 13,
    color: Palette.textSecondary,
    flex: 1,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  slotChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    minWidth: 72,
    alignItems: "center",
  },
  slotChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  slotText: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  slotTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
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
  confirmButton: {
    backgroundColor: Palette.primary,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
