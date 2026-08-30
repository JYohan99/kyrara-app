import { API_BASE_URL } from "@/config/api";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

export type PushRegistrationResult = {
  success: boolean;
  token?: string;
  error?: string;
};

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (isExpoGo) {
    return {
      success: false,
      error: "Las notificaciones remotas requieren un APK / build independiente (no Expo Go).",
    };
  }

  if (!Device.isDevice) {
    return {
      success: false,
      error: "Las notificaciones push requieren un dispositivo físico real.",
    };
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
    return {
      success: false,
      error: "Permiso de notificaciones denegado en el sistema del teléfono.",
    };
  }

  try {
    let token: string | undefined;

    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = deviceToken.data;
    } catch {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = tokenData.data;
    }

    if (!token) {
      return {
        success: false,
        error: "No se pudo generar el token de notificaciones del dispositivo.",
      };
    }

    const res = await fetch(`${API_BASE_URL}/appointments/business/push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      return {
        success: false,
        token,
        error: `Servidor respondió con error HTTP ${res.status}`,
      };
    }

    console.log("Token de notificaciones registrado exitosamente:", token);
    return { success: true, token };
  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    console.error("No se pudo registrar el token de notificaciones:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
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
