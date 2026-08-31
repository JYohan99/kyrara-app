import { pickSquareImageAsBase64 } from "@/core/services/imagePickerService";
import { useEffect, useState } from "react";
import {
  fetchBusiness,
  updateBusiness,
  updateBusinessSettings,
} from "../api";
import { Business } from "../models";

export const OPCIONES_INTERVALO = [15, 30, 45, 60];

// ============================================================================
// VIEW MODEL: CONFIGURACIÓN DEL NEGOCIO Y NOTIFICACIONES
// ============================================================================

export function useConfiguracionViewModel() {
  // --------------------------------------------------------------------------
  // ESTADOS PRINCIPALES DE CARGA Y DATOS
  // --------------------------------------------------------------------------
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos del perfil de la barbería
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Estado del interruptor de notificación (5 min antes del turno)
  const [notifyUpcoming, setNotifyUpcoming] = useState(true);

  // --------------------------------------------------------------------------
  // CARGA INICIAL DE DATOS
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchBusiness()
      .then((data) => {
        setBusiness(data.business);
        setName(data.business.name);
        setPhone(data.business.phone ?? "");
        setAddress(data.business.address ?? "");
        setLogoBase64(data.business.logo_base64);

        // Si notify_upcoming_appointments es 0 o false está apagado, por defecto encendido (1)
        const isNotifyActive =
          data.business.notify_upcoming_appointments !== 0 &&
          data.business.notify_upcoming_appointments !== false;
        setNotifyUpcoming(isNotifyActive);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // --------------------------------------------------------------------------
  // ACCIONES: SELECCIÓN DE LOGO
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // ACCIONES: GUARDAR DATOS DEL PERFIL
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // ACCIONES: MODO DE RESERVA (AUTO O APROBACIÓN)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // ACCIONES: INTERVALO DE TURNOS (15, 30, 45, 60 MIN)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // ACCIONES: ACTIVAR / DESACTIVAR AVISO 5 MIN ANTES DEL TURNO
  // --------------------------------------------------------------------------
  const handleToggleNotifyUpcoming = async (value: boolean) => {
    setNotifyUpcoming(value);
    try {
      const updated = await updateBusinessSettings({
        notify_upcoming_appointments: value ? 1 : 0,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
      setNotifyUpcoming(!value); // Revertir en caso de error
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
    notifyUpcoming,
    setName,
    setPhone,
    setAddress,
    pickLogo,
    handleSaveInfo,
    handleSelectMode,
    handleSelectInterval,
    handleToggleNotifyUpcoming,
  };
}
