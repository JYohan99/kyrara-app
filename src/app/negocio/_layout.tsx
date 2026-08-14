import { Stack } from "expo-router";

export default function NegocioLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Negocio" }} />
      <Stack.Screen name="servicios" options={{ title: "Servicios" }} />
      <Stack.Screen name="horarios" options={{ title: "Horarios" }} />
    </Stack>
  );
}
