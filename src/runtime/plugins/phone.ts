import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import type { CountryCode } from "libphonenumber-js";
import { defineNuxtPlugin, useRuntimeConfig } from "#imports";
import type { ModuleOptions, PhoneFormat, PhoneHelpers, PhoneInputData } from "../types";

function normalizeCountryCode(code?: CountryCode | string): CountryCode | undefined {
  if (!code) return undefined;
  return String(code).toUpperCase() as CountryCode;
}

function parsePhone(
  phone: string,
  countryCode?: CountryCode | string,
): PhoneInputData {
  const normalizedCountry = normalizeCountryCode(countryCode);

  try {
    const parsed = parsePhoneNumberFromString(phone, normalizedCountry);
    if (!parsed) {
      return {
        e164: null,
        countryCode: normalizedCountry ?? null,
        formatted: phone,
        isValid: false,
      };
    }

    return {
      e164: parsed.number ?? null,
      countryCode: (parsed.country as CountryCode | undefined) ?? normalizedCountry ?? null,
      formatted: parsed.formatInternational(),
      isValid: parsed.isValid(),
    };
  } catch {
    return {
      e164: null,
      countryCode: normalizedCountry ?? null,
      formatted: phone,
      isValid: false,
    };
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const defaults: Required<ModuleOptions> = {
    defaultCountry: config.public.phoneInput?.defaultCountry ?? "SN",
    preferredCountries: config.public.phoneInput?.preferredCountries ?? ["SN", "FR"],
    onlyCountries: config.public.phoneInput?.onlyCountries ?? [],
    ignoredCountries: config.public.phoneInput?.ignoredCountries ?? [],
    useBrowserLocale: config.public.phoneInput?.useBrowserLocale ?? true,
    format: config.public.phoneInput?.format ?? "international",
    ui: {
      color: config.public.phoneInput?.ui?.color ?? "primary",
      variant: config.public.phoneInput?.ui?.variant ?? "outline",
      size: config.public.phoneInput?.ui?.size ?? "md",
      rounded: config.public.phoneInput?.ui?.rounded ?? "lg",
    },
  };

  const phoneHelpers: PhoneHelpers = {
    formatPhone(phone: string, countryCode?: CountryCode | string, format: PhoneFormat = defaults.format) {
      const parsed = parsePhone(phone, countryCode);
      if (!parsed.e164) return phone;
      if (format === "e164") return parsed.e164;

      try {
        const phoneNumber = parsePhoneNumberFromString(
          parsed.e164,
          normalizeCountryCode(countryCode),
        );
        if (!phoneNumber) return parsed.formatted;
        return format === "national"
          ? phoneNumber.formatNational()
          : phoneNumber.formatInternational();
      } catch {
        return parsed.formatted;
      }
    },
    validatePhone(phone: string, countryCode?: CountryCode | string) {
      return parsePhone(phone, countryCode).isValid;
    },
    parsePhone,
    defaults,
  };

  return {
    provide: {
      phone: phoneHelpers,
    },
  };
});
