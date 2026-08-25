import { API_BASE_URL } from "@/config/api";
import Constants from "expo-constants";
import * as Device from "expo-device";

// Desde el SDK 53 de Expo, Expo Go ya no soporta notificaciones push remotas
// en Android — hace falta un "development build" para probarlas de verdad.
// Esto detecta si estamos corriendo dentro de Expo Go y, si es así, se
// salta el registro en vez de romper la app.
const isExpoGo = Constants.appOwnership === "expo";

export async function registerForPushNotifications() {
  if (isExpoGo) {
    console.log(
      "Notificaciones push no disponibles en Expo Go (desde SDK 53). Hace falta un development build para probarlas.",
    );
    return;
  }

  if (!Device.isDevice) {
    console.log(
      "Las notificaciones push requieren un dispositivo físico o un emulador con Google Play Services.",
    );
    return;
  }

  const Notifications = await import("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permiso de notificaciones no otorgado.");
    return;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await fetch(`${API_BASE_URL}/appointments/business/push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    console.log("Token de notificaciones registrado:", token);
  } catch (err) {
    console.error("No se pudo registrar el token de notificaciones:", err);
  }
}
