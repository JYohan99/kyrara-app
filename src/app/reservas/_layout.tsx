import { Stack } from "expo-router";
export default function ReservasLayout() {
  return (
    <Stack>
      {" "}
      <Stack.Screen name="index" options={{ headerShown: false }} />{" "}
      <Stack.Screen
        name="nueva"
        options={{ headerShown: true, title: "Nueva reserva" }}
      />{" "}
    </Stack>
  );
}
