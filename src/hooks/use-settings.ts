import { useEffect, useState } from "react";
import { KEYS, lsGet, lsSet, defaultSettings, type Settings } from "@/lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(lsGet<Settings>(KEYS.settings, defaultSettings));
    setLoaded(true);
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      lsSet(KEYS.settings, next);
      return next;
    });
  };

  return { settings, update, loaded };
}
