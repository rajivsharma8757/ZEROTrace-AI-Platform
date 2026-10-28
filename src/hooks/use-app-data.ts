import { useCallback, useEffect, useState } from "react";
import { getData, saveData } from "@/lib/data";
import type { AppData } from "@/lib/models";
export function useAppData() { const [data, setData] = useState<AppData>(() => getData()); const refresh = useCallback(() => setData(getData()), []); const update = useCallback((mutate: (d: AppData) => void) => { const next = getData(); mutate(next); saveData(next); setData(next); }, []); useEffect(() => { window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, [refresh]); return { data, update, refresh }; }
