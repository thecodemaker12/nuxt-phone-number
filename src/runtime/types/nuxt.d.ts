import type { PhoneHelpers } from "./index";

declare module "#app" {
  interface NuxtApp {
    $phone: PhoneHelpers;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $phone: PhoneHelpers;
  }
}

export {};
