import { useSyncExternalStore } from "react";
import { getAllStatus, subscribeStatus, type StatusMap } from "@/lib/member-status";

export function useMemberStatus(): StatusMap {
  return useSyncExternalStore(
    subscribeStatus,
    getAllStatus,
    () => ({}) as StatusMap,
  );
}
