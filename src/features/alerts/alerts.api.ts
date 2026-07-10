// Compat shim — the implementation now lives in alerts.service.ts.
export {
  listAlerts,
  createAlert,
  setAlertActive,
  deleteAlert,
} from "@/features/alerts/alerts.service";
