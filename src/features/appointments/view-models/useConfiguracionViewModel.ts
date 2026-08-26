import { pickSquareImageAsBase64 } from "@/core/services/imagePickerService";
import { useEffect, useState } from "react";
import {
  fetchBusiness,
  updateBusiness,
  updateBusinessSettings,
} from "../api";
import { Business } from "../models";

export const OPCIONES_INTERVALO = [15, 30, 45, 60];

export function useConfiguracionViewModel() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  useEffect(() => {
    fetchBusiness()
      .then((data) => {
        setBusiness(data.business);
        setName(data.business.name);
        setPhone(data.business.phone ?? "");
        setAddress(data.business.address ?? "");
        setLogoBase64(data.business.logo_base64);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const pickLogo = async () => {
    const res = await pickSquareImageAsBase64();
    if (res.error) {
      setError(res.error);
      return;
    }
    if (!res.cancelled && res.base64) {
      setLogoBase64(res.base64);
    }
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusiness({
        name,
        phone,
        address,
        logo_base64: logoBase64 ?? undefined,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectMode = async (mode: "auto" | "approval") => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings({ booking_mode: mode });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectInterval = async (minutes: number) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings({
        slot_step_minutes: minutes,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
