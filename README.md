# nuxt-phone-number

[![npm version](https://img.shields.io/npm/v/nuxt-phone-number.svg)](https://www.npmjs.com/package/nuxt-phone-number)
[![npm downloads](https://img.shields.io/npm/dm/nuxt-phone-number.svg)](https://www.npmjs.com/package/nuxt-phone-number)

`nuxt-phone-number` is a Nuxt-first phone input module built around a simple DX:

- auto-registered `<UPhoneInput />`
- `usePhone()` composable
- global defaults through `nuxt.config.ts`
- live formatting and validation with `libphonenumber-js`
- UI props inspired by Nuxt UI conventions

## Features

- Auto-imported `UPhoneInput` component
- Country selector with flags and search
- Live formatting while typing
- E.164, national or international output
- Global module config with `phoneInput`
- `usePhone()` helpers for parsing, formatting and validation
- UI props for `color`, `variant`, `size` and `rounded`
- Better edit-form UX: prefilled values no longer show `Invalid phone number` immediately on open

## Installation

```bash
npm install nuxt-phone-number libphonenumber-js
```

## Quick Start

Add the module to your Nuxt config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-phone-number"],
});
```

Then use the component anywhere without importing it manually:

```vue
<script setup lang="ts">
const phone = ref("");
</script>

<template>
  <UPhoneInput v-model="phone" />
</template>
```

## Nuxt Config

You can configure app-wide defaults with the `phoneInput` key:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-phone-number"],

  phoneInput: {
    defaultCountry: "SN",
    preferredCountries: ["SN", "FR"],
    onlyCountries: [],
    ignoredCountries: [],
    useBrowserLocale: true,
    format: "international",
    ui: {
      color: "primary",
      variant: "outline",
      size: "md",
      rounded: "lg",
    },
  },
});
```

## Basic Usage

```vue
<script setup lang="ts">
const phone = ref("");
</script>

<template>
  <UPhoneInput
    v-model="phone"
    color="primary"
    variant="outline"
    size="md"
    rounded="lg"
  />
</template>
```

## Edit Form Example

When you use the component in an update form with an existing phone number, the component now avoids showing an error immediately on load before the user interacts with the field:

```vue
<script setup lang="ts">
const form = reactive({
  phone: "+221772233284",
});
</script>

<template>
  <UPhoneInput
    v-model="form.phone"
    default-country="SN"
    variant="outline"
  />
</template>
```

## Output Format

The `format` prop controls what `v-model` receives:

- `international`
- `national`
- `e164`

Example:

```vue
<UPhoneInput
  v-model="phone"
  format="e164"
/>
```

## UI Props

### `color`

Accepted values:

- `primary`
- `secondary`
- `success`
- `info`
- `warning`
- `error`
- `neutral`

Example:

```vue
<UPhoneInput
  v-model="phone"
  color="success"
/>
```

### `variant`

Accepted values:

- `outline`
- `soft`
- `subtle`
- `ghost`
- `none`

Example:

```vue
<UPhoneInput
  v-model="phone"
  variant="subtle"
/>
```

### `size`

Accepted values:

- `xs`
- `sm`
- `md`
- `lg`
- `xl`

Example:

```vue
<UPhoneInput
  v-model="phone"
  size="xl"
/>
```

### `rounded`

Accepted values:

- `none`
- `sm`
- `md`
- `lg`
- `xl`
- `full`

Example:

```vue
<UPhoneInput
  v-model="phone"
  rounded="full"
/>
```

## Component Props

### Value and country

- `modelValue?: string`
- `countryCode?: CountryCode | string`
- `defaultCountry?: string`

### Country list behavior

- `preferredCountries?: string[]`
- `onlyCountries?: string[]`
- `ignoredCountries?: string[]`
- `useBrowserLocale?: boolean`

### Display and validation

- `placeholder?: string`
- `disabled?: boolean`
- `error?: string | boolean`
- `locale?: string`
- `searchPlaceholder?: string`
- `noResultsText?: string`
- `invalidMessage?: string`
- `format?: "national" | "international" | "e164"`

### UI

- `color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"`
- `variant?: "outline" | "soft" | "subtle" | "ghost" | "none"`
- `size?: "xs" | "sm" | "md" | "lg" | "xl"`
- `rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full"`

## Events

### `update:modelValue`

Emits the current formatted value according to the selected `format`.

### `update:countryCode`

Emits the currently selected country code.

### `data`

Emits a normalized payload:

```ts
interface PhoneInputData {
  e164: string | null;
  countryCode: CountryCode | null;
  formatted: string;
  isValid: boolean;
}
```

Example:

```vue
<script setup lang="ts">
function onPhoneData(data: {
  e164: string | null;
  countryCode: string | null;
  formatted: string;
  isValid: boolean;
}) {
  console.log(data);
}
</script>

<template>
  <UPhoneInput
    v-model="phone"
    @data="onPhoneData"
  />
</template>
```

## usePhone()

The module injects a `usePhone()` composable:

```vue
<script setup lang="ts">
const { formatPhone, validatePhone, parsePhone, defaults } = usePhone();

const formatted = formatPhone("+221772233284");
const valid = validatePhone("+221772233284");
const parsed = parsePhone("+221772233284");
</script>
```

### Returned helpers

#### `formatPhone(phone, countryCode?, format?)`

Formats a phone number into:

- `national`
- `international`
- `e164`

#### `validatePhone(phone, countryCode?)`

Returns a boolean indicating whether the number is valid.

#### `parsePhone(phone, countryCode?)`

Returns:

```ts
{
  e164: string | null
  countryCode: CountryCode | null
  formatted: string
  isValid: boolean
}
```

#### `defaults`

Exposes the resolved module defaults from `phoneInput`.

## Common Examples

### Restrict countries

```vue
<UPhoneInput
  v-model="phone"
  :only-countries="['SN', 'FR', 'CI']"
/>
```

### Preferred countries first

```vue
<UPhoneInput
  v-model="phone"
  :preferred-countries="['SN', 'FR']"
/>
```

### Custom validation message

```vue
<UPhoneInput
  v-model="phone"
  invalid-message="Numéro invalide"
/>
```

### Force an error from parent form state

```vue
<UPhoneInput
  v-model="phone"
  error="Ce numéro est déjà utilisé"
/>
```

## Notes

- The component is Nuxt-first and meant to be used inside Nuxt 3 or Nuxt 4 projects.
- `@nuxt/ui` is optional. The API style is inspired by it, but the package does not require it.
- The component formats and validates numbers with `libphonenumber-js`.
- Validation errors are interaction-aware, so prefilled values in edit forms do not immediately show an error before the user changes the field.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```

## Links

- Homepage: [https://thecodemaker12.github.io/nuxt-phone-number](https://thecodemaker12.github.io/nuxt-phone-number)
- Repository: [https://github.com/thecodemaker12/nuxt-phone-number](https://github.com/thecodemaker12/nuxt-phone-number)
- Issues: [https://github.com/thecodemaker12/nuxt-phone-number/issues](https://github.com/thecodemaker12/nuxt-phone-number/issues)
