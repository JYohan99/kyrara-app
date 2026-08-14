import { Platform } from "react-native";

// Android emulador: 10.0.2.2 es una IP especial que apunta al localhost
// de la PC anfitriona (no es la IP real de tu PC, es un alias que solo
// funciona dentro del emulador).
// iPhone físico / web: usan la IP real de tu PC en la red WiFi.
const LAN_IP = "192.168.1.13"; // ej: 192.168.1.50 — la sacamos en el próximo paso

function resolveBaseUrl(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }
  // iOS físico vía Expo Go
  return `http://${LAN_IP}:3000`;
}

export const API_BASE_URL = resolveBaseUrl();
