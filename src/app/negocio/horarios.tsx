import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  DIAS_SEMANA,
  useHorariosViewModel,
} from "@/features/availability";

export default function HorariosScreen() {
  const {
    blocks,
    exceptions,
    loading,
    error,
    blockModal,
    dayOfWeek,
    startTime,
    endTime,
    excModal,
    excDate,
    excReason,
    setDayOfWeek,
    setStartTime,
    setEndTime,
    setExcDate,
    setExcReason,
    openBlockModal,
    closeBlockModal,
    handleCreateBlock,
    handleToggleBlock,
    handleDeleteBlock,
    openExcModal,
    closeExcModal,
    handleCreateException,
    handleDeleteException,
  } = useHorariosViewModel();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Horarios y Disponibilidad",
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
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.secondary} />
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* SECCIÓN 1: HORARIO SEMANAL */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="calendar-outline" size={18} color={Palette.primaryLight} />
                <ThemedText style={styles.sectionTitle}>Horario Semanal</ThemedText>
              </View>
              <Pressable
                onPress={openBlockModal}
                style={({ pressed }) => [styles.addSectionBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <Ionicons name="add" size={20} color={Palette.primaryLight} />
                <ThemedText style={styles.addBtnText}>Agregar</ThemedText>
              </Pressable>
            </View>

            <View style={styles.cardsList}>
              {blocks.map((b) => (
                <View key={b.id} style={styles.card}>
                  <View style={styles.blockInfo}>
                    <ThemedText
                      style={[
                        styles.dayText,
                        !b.active && styles.inactiveText,
                      ]}
                    >
                      {DIAS_SEMANA[b.day_of_week]}
                    </ThemedText>
                    <ThemedText style={styles.timeRangeText}>
                      {b.start_time} – {b.end_time}
                    </ThemedText>
                  </View>

                  <View style={styles.cardActions}>
                    <Switch
                      value={!!b.active}
                      onValueChange={() => handleToggleBlock(b)}
                      trackColor={{
                        false: Palette.surfaceContainerHighest,
                        true: Palette.primary,
                      }}
                      thumbColor="#ffffff"
                    />
                    <Pressable
                      onPress={() => handleDeleteBlock(b)}
                      style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={Palette.error} />
                    </Pressable>
                  </View>
                </View>
              ))}

              {blocks.length === 0 && !loading && (
                <View style={styles.emptyCard}>
                  <ThemedText style={styles.emptyCardText}>
                    No hay bloques horarios configurados. Toca "+ Agregar" para añadir el primero.
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* SECCIÓN 2: EXCEPCIONES Y FERIADOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="pause-circle-outline" size={18} color={Palette.secondary} />
                <ThemedText style={styles.sectionTitle}>
                  Feriados / Cierres
                </ThemedText>
              </View>
              <Pressable
                onPress={openExcModal}
                style={({ pressed }) => [styles.addSectionBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <Ionicons name="add" size={20} color={Palette.secondary} />
                <ThemedText style={[styles.addBtnText, { color: Palette.secondary }]}>
                  Agregar
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.cardsList}>
              {exceptions.map((e) => (
                <View key={e.id} style={styles.card}>
                  <View style={styles.blockInfo}>
                    <ThemedText style={styles.dayText}>{e.date}</ThemedText>
                    {e.reason ? (
                      <ThemedText style={styles.timeRangeText}>
                        {e.reason}
                      </ThemedText>
                    ) : (
                      <ThemedText style={styles.timeRangeText}>
                        Cerrado todo el día
                      </ThemedText>
                    )}
                  </View>

                  <Pressable
                    onPress={() => handleDeleteException(e)}
                    style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={Palette.error} />
                  </Pressable>
                </View>
              ))}

              {exceptions.length === 0 && !loading && (
                <View style={styles.emptyCard}>
                  <ThemedText style={styles.emptyCardText}>
                    Sin excepciones de cierre configuradas.
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* MODAL NUEVO BLOQUE HORARIO */}
          <Modal visible={blockModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Nuevo Bloque Horario</ThemedText>
                  <Pressable onPress={closeBlockModal} hitSlop={8}>
                    <Ionicons name="close" size={24} color={Palette.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.inputLabel}>Día de la semana</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dayChipsWrap}
                  >
                    {DIAS_SEMANA.map((d, i) => (
                      <Pressable
                        key={i}
                        onPress={() => setDayOfWeek(i)}
                        style={[
                          styles.dayChip,
                          dayOfWeek === i && styles.dayChipSelected,
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.dayChipText,
                            dayOfWeek === i && styles.dayChipTextSelected,
                          ]}
                        >
                          {d}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={styles.modalInputWrap}>
                    <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Hora inicio (ej. 09:00)"
                      placeholderTextColor={Palette.textMuted}
                      value={startTime}
                      onChangeText={setStartTime}
                      style={styles.modalInput}
                    />
                  </View>

                  <View style={styles.modalInputWrap}>
                    <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Hora fin (ej. 18:00)"
                      placeholderTextColor={Palette.textMuted}
                      value={endTime}
                      onChangeText={setEndTime}
                      style={styles.modalInput}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={closeBlockModal}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateBlock}
                    style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.saveBtnText}>Guardar Horario</ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* MODAL NUEVA EXCEPCIÓN */}
          <Modal visible={excModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Nueva Excepción de Cierre</ThemedText>
                  <Pressable onPress={closeExcModal} hitSlop={8}>
                    <Ionicons name="close" size={24} color={Palette.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.modalInputWrap}>
                    <Ionicons name="calendar-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Fecha (YYYY-MM-DD, ej. 2026-12-25)"
                      placeholderTextColor={Palette.textMuted}
                      value={excDate}
                      onChangeText={setExcDate}
                      style={styles.modalInput}
                    />
                  </View>

                  <View style={styles.modalInputWrap}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Motivo (ej. Navidad / Mantenimiento)"
                      placeholderTextColor={Palette.textMuted}
                      value={excReason}
                      onChangeText={setExcReason}
                      style={styles.modalInput}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={closeExcModal}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateException}
                    style={({ pressed }) => [
                      styles.saveBtn,
                      { backgroundColor: Palette.secondary },
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText style={[styles.saveBtnText, { color: Palette.surfaceContainerLowest }]}>
                      Guardar Excepción
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
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
    gap: Spacing.five,
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
  section: {
    gap: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleWrap: {
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
  addSectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.primaryLight,
  },
  cardsList: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  blockInfo: {
    flex: 1,
    gap: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  timeRangeText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  inactiveText: {
    opacity: 0.45,
    textDecorationLine: "line-through",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyCard: {
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: BorderRadius.card,
    padding: Spacing.four,
    alignItems: "center",
  },
  emptyCardText: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000088",
  },
  modalCard: {
    backgroundColor: Palette.surfaceContainer,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.one,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  formGroup: {
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayChipsWrap: {
    gap: 8,
    paddingVertical: 4,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  dayChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Palette.textPrimary,
  },
  dayChipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  modalInputWrap: {
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
  modalInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  cancelBtnText: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.primary,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
