import type { CountryCode } from "libphonenumber-js";

export type PhoneFormat = "national" | "international" | "e164";

export interface PhoneInputUiOptions {
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral";
  variant?: "outline" | "soft" | "subtle" | "ghost" | "none";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

export interface ModuleOptions {
  defaultCountry?: CountryCode | string;
  preferredCountries?: string[];
  onlyCountries?: string[];
  ignoredCountries?: string[];
  useBrowserLocale?: boolean;
  format?: PhoneFormat;
  ui?: PhoneInputUiOptions;
}

export interface PhoneInputData {
  e164: string | null;
  countryCode: CountryCode | null;
  formatted: string;
  isValid: boolean;
}

export interface PhoneHelpers {
  formatPhone: (
    phone: string,
    countryCode?: CountryCode | string,
    format?: PhoneFormat,
  ) => string;
  validatePhone: (phone: string, countryCode?: CountryCode | string) => boolean;
  parsePhone: (
    phone: string,
    countryCode?: CountryCode | string,
  ) => PhoneInputData;
  defaults: Required<ModuleOptions>;
}
