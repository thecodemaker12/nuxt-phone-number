# nuxt-phone-input

`nuxt-phone-input` is a Nuxt-first phone input module.

It provides:

- auto-registered `<UPhoneInput />`
- `usePhone()` composable
- global config via `nuxt.config.ts`
- live formatting and validation with `libphonenumber-js`
- configurable UI props like `variant`, `rounded` and `size`

## Installation

```bash
npm install nuxt-phone-input libphonenumber-js
```

```ts
export default defineNuxtConfig({
  modules: ["nuxt-phone-input"],

  phoneInput: {
    defaultCountry: "SN",
    preferredCountries: ["SN", "FR"],
    format: "international",
  },
});
```

## Usage

```vue
<script setup lang="ts">
const phone = ref("");
</script>

<template>
  <UPhoneInput
    v-model="phone"
    variant="outline"
    rounded="lg"
  />
</template>
```

## usePhone

```vue
<script setup lang="ts">
const { formatPhone, validatePhone } = usePhone();

const formatted = formatPhone("+221771234567");
const isValid = validatePhone("+221771234567");
</script>
```
