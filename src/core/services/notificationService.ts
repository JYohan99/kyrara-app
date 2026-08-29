import { API_BASE_URL } from "@/config/api";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

export async function registerForPushNotifications(): Promise<string | null> {
  if (isExpoGo) {
    console.log(
      "Notificaciones push remotas no disponibles en Expo Go (desde SDK 53). Usa una compilación de desarrollo o APK standalone para probarlas.",
    );
    return null;
  }

  if (!Device.isDevice) {
    console.log(
      "Las notificaciones push requieren un dispositivo físico o un emulador con Google Play Services.",
    );
    return null;
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

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Citas y Alertas Kyrara",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8A4FFF",
      sound: "default",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permiso de notificaciones no otorgado por el usuario.");
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData.data;

    const res = await fetch(`${API_BASE_URL}/appointments/business/push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      console.error("Error al registrar el token en el servidor:", res.status);
    } else {
      console.log("Token de notificaciones registrado exitosamente:", token);
    }

    return token;
  } catch (err) {
    console.error("No se pudo registrar el token de notificaciones:", err);
    return null;
  }
}

export async function sendTestLocalNotification(title: string, body: string) {
  try {
    const Notifications = await import("expo-notifications");
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
      },
      trigger: null, // Inmediata
    });
  } catch (err) {
    console.error("Error enviando notificación local de prueba:", err);
  }
}
