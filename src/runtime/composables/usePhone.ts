import type { PhoneHelpers } from "../types";

export function usePhone(): PhoneHelpers {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$phone as PhoneHelpers;
}
