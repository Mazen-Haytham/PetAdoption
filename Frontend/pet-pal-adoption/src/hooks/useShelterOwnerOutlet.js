import { useOutletContext } from "react-router-dom";

export function useShelterOwnerOutlet() {
  const ctx = useOutletContext();
  if (!ctx) {
    throw new Error("useShelterOwnerOutlet must be used under ShelterOwnerLayout");
  }
  return ctx;
}
