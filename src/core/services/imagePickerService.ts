import * as ImagePicker from "expo-image-picker";

export type PickImageResult = {
  cancelled: boolean;
  base64?: string | null;
  error?: string;
};

export async function pickSquareImageAsBase64(): Promise<PickImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      cancelled: true,
      error: "Necesitamos permiso para acceder a tus fotos",
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return { cancelled: true };
  }

  return {
    cancelled: false,
    base64: result.assets[0].base64,
  };
}
