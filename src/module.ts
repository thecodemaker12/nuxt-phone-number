import {
  addComponent,
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import type { ModuleOptions } from "./runtime/types";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-phone-number",
    configKey: "phoneInput",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },

  defaults: {
    defaultCountry: "SN",
    preferredCountries: ["SN", "FR"],
    onlyCountries: [],
    ignoredCountries: [],
    useBrowserLocale: true,
    format: "international",
    ui: {
      variant: "outline",
      size: "md",
      rounded: "lg",
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.public.phoneInput = {
      defaultCountry: options.defaultCountry,
      preferredCountries: options.preferredCountries,
      onlyCountries: options.onlyCountries,
      ignoredCountries: options.ignoredCountries,
      useBrowserLocale: options.useBrowserLocale,
      format: options.format,
      ui: options.ui,
    };

    addPlugin(resolver.resolve("./runtime/plugins/phone"));

    addImports([
      {
        name: "usePhone",
        as: "usePhone",
        from: resolver.resolve("./runtime/composables/usePhone"),
      },
    ]);

    addComponent({
      name: "UPhoneInput",
      filePath: resolver.resolve("./runtime/components/UPhoneInput.vue"),
    });
  },
});

export type {
  ModuleOptions,
  PhoneInputData,
  PhoneInputUiOptions,
  PhoneFormat,
} from "./runtime/types";
