import { AppWindow, Calendar, Users } from "lucide-react";

export const DEFAULT_PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:3000";

export const STORAGE_KEYS = {
  baseUrl: "bca_url",
  apiKey:  "bca_api_key",
  tab:     "bca_active_tab",
};

export const TABS = [
  { id: "apps",     label: "Apps",     icon: AppWindow },
  { id: "sessions", label: "Sessions", icon: Calendar },
  { id: "users",    label: "Users",    icon: Users },
];
