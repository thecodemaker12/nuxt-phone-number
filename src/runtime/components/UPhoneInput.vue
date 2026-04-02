<template>
  <div class="npi-root" ref="triggerRef" :style="cssVars">
    <div
      class="npi-control"
      :class="[
        roundedClass,
        sizeClass,
        variantClass,
        hasError ? 'npi-control-error' : isFocused || isOpen ? 'npi-control-active' : 'npi-control-idle',
        props.disabled ? 'npi-control-disabled' : '',
      ]"
    >
      <button
        type="button"
        class="npi-country-button"
        :class="props.disabled ? 'npi-country-button-disabled' : ''"
        :disabled="props.disabled"
        @click="toggleDropdown"
        @keydown.escape="closeDropdown"
        @keydown.enter.prevent="toggleDropdown"
        @keydown.space.prevent="toggleDropdown"
      >
        <span class="npi-flag" role="img" :aria-label="selectedCountry?.name">
          {{ selectedCountry ? countryFlag(selectedCountry.code) : "🌍" }}
        </span>
        <span class="npi-dial-code">+{{ selectedCountry?.dial }}</span>
        <svg
          width="14"
          height="14"
          class="npi-chevron"
          :class="isOpen ? 'npi-chevron-open' : ''"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div class="npi-input-wrap">
        <input
          ref="inputRef"
          v-model="displayValue"
          type="tel"
          inputmode="tel"
          class="npi-input"
          :placeholder="currentPlaceholder"
          :disabled="props.disabled"
          :aria-invalid="hasError"
          autocomplete="tel"
          @input="onInput"
          @focus="isFocused = true"
          @blur="onBlur"
          @keydown.escape="closeDropdown"
        />
        <span
          v-if="displayValue.replace(/\D/g, '').length >= 7 && isValid"
          class="npi-check"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>

    <p v-if="hasError && errorMessage" class="npi-error">
      {{ errorMessage }}
    </p>

    <Transition
      enter-active-class="npi-transition-enter-active"
      enter-from-class="npi-transition-enter-from"
      enter-to-class="npi-transition-enter-to"
      leave-active-class="npi-transition-leave-active"
      leave-from-class="npi-transition-leave-from"
      leave-to-class="npi-transition-leave-to"
    >
      <div v-if="isOpen" ref="dropdownRef" class="npi-dropdown">
        <div class="npi-search-wrap">
          <div class="npi-search-box">
            <svg
              width="14"
              height="14"
              class="npi-search-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              ref="searchRef"
              v-model="searchQuery"
              type="text"
              class="npi-search-input"
              :placeholder="searchPlaceholder"
              @keydown.escape="closeDropdown"
              @keydown.enter.prevent="selectFirstResult"
            />
          </div>
        </div>

        <ul class="npi-list" role="listbox">
          <template v-if="!searchQuery && preferredCountriesList.length">
            <li
              v-for="country in preferredCountriesList"
              :key="`pref-${country.code}`"
              class="npi-item"
              :class="selectedCountry?.code === country.code ? 'npi-item-selected' : 'npi-item-idle'"
              role="option"
              :aria-selected="selectedCountry?.code === country.code"
              @click="selectCountry(country)"
            >
              <span class="npi-item-flag">{{ countryFlag(country.code) }}</span>
              <span class="npi-item-name">{{ country.name }}</span>
              <span class="npi-item-dial">+{{ country.dial }}</span>
            </li>
            <li class="npi-divider" aria-hidden="true" />
          </template>

          <li
            v-for="country in filteredCountries"
            :key="country.code"
            class="npi-item"
            :class="selectedCountry?.code === country.code ? 'npi-item-selected' : 'npi-item-idle'"
            role="option"
            :aria-selected="selectedCountry?.code === country.code"
            @click="selectCountry(country)"
          >
            <span class="npi-item-flag">{{ countryFlag(country.code) }}</span>
            <span class="npi-item-name">{{ country.name }}</span>
            <span class="npi-item-dial">+{{ country.dial }}</span>
          </li>

          <li v-if="filteredCountries.length === 0" class="npi-empty">
            {{ noResultsText }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import type { ModuleOptions, PhoneFormat, PhoneInputData, PhoneInputUiOptions } from "../types";

interface Country {
  code: CountryCode;
  name: string;
  dial: string;
}

const defaults = useRuntimeConfig().public.phoneInput as Required<ModuleOptions>;

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    countryCode?: CountryCode | string;
    defaultCountry?: string;
    preferredCountries?: string[];
    onlyCountries?: string[];
    ignoredCountries?: string[];
    useBrowserLocale?: boolean;
    placeholder?: string;
    disabled?: boolean;
    error?: string | boolean;
    locale?: string;
    searchPlaceholder?: string;
    noResultsText?: string;
    invalidMessage?: string;
    format?: PhoneFormat;
    variant?: PhoneInputUiOptions["variant"];
    size?: PhoneInputUiOptions["size"];
    rounded?: PhoneInputUiOptions["rounded"];
  }>(),
  {
    modelValue: "",
    preferredCountries: () => [],
    onlyCountries: () => [],
    ignoredCountries: () => [],
    disabled: false,
    locale: "fr",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:countryCode": [code: CountryCode];
  data: [data: PhoneInputData];
}>();

const resolvedVariant = computed(() => props.variant ?? defaults.ui.variant ?? "outline");
const resolvedSize = computed(() => props.size ?? defaults.ui.size ?? "md");
const resolvedRounded = computed(() => props.rounded ?? defaults.ui.rounded ?? "lg");
const resolvedFormat = computed(() => props.format ?? defaults.format ?? "international");
const resolvedPreferredCountries = computed(
  () => (props.preferredCountries.length ? props.preferredCountries : defaults.preferredCountries) ?? [],
);
const resolvedOnlyCountries = computed(
  () => (props.onlyCountries.length ? props.onlyCountries : defaults.onlyCountries) ?? [],
);
const resolvedIgnoredCountries = computed(
  () => (props.ignoredCountries.length ? props.ignoredCountries : defaults.ignoredCountries) ?? [],
);
const resolvedDefaultCountry = computed(
  () => props.defaultCountry ?? defaults.defaultCountry ?? "SN",
);
const resolvedUseBrowserLocale = computed(
  () => props.useBrowserLocale ?? defaults.useBrowserLocale ?? true,
);
const searchPlaceholder = computed(() => props.searchPlaceholder ?? "Search country...");
const noResultsText = computed(() => props.noResultsText ?? "No country found");
const invalidMessage = computed(() => props.invalidMessage ?? "Invalid phone number");

const roundedClass = computed(() => `npi-rounded-${resolvedRounded.value}`);
const sizeClass = computed(() => `npi-size-${resolvedSize.value}`);
const variantClass = computed(() => `npi-variant-${resolvedVariant.value}`);
const cssVars = computed(() => ({}));
const displayNames = computed(
  () => new Intl.DisplayNames([props.locale || "fr"], { type: "region" }),
);

const allCountries = computed<Country[]>(() => {
  let codes = getCountries() as CountryCode[];

  if (resolvedOnlyCountries.value.length) {
    codes = codes.filter((code) => resolvedOnlyCountries.value.includes(code));
  }
  if (resolvedIgnoredCountries.value.length) {
    codes = codes.filter((code) => !resolvedIgnoredCountries.value.includes(code));
  }

  return codes
    .map((code) => ({
      code,
      name: displayNames.value.of(code) ?? code,
      dial: getCountryCallingCode(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, props.locale || "fr"));
});

const preferredCountriesList = computed<Country[]>(
  () =>
    resolvedPreferredCountries.value
      .map((code) => allCountries.value.find((country) => country.code === code))
      .filter(Boolean) as Country[],
);

const selectedCountry = ref<Country | null>(null);
const displayValue = ref("");
const isOpen = ref(false);
const isFocused = ref(false);
const searchQuery = ref("");
const isValid = ref(false);

const searchRef = ref<HTMLInputElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const filteredCountries = computed<Country[]>(() => {
  if (!searchQuery.value) return allCountries.value;
  const q = searchQuery.value.toLowerCase();
  return allCountries.value.filter(
    (country) =>
      country.name.toLowerCase().includes(q) ||
      country.dial.includes(q) ||
      country.code.toLowerCase().includes(q),
  );
});

const currentPlaceholder = computed(() => props.placeholder || "Phone number");
const hasError = computed(
  () =>
    !!props.error ||
    (displayValue.value.length > 3 && !isValid.value && !isFocused.value),
);
const errorMessage = computed(() => {
  if (typeof props.error === "string") return props.error;
  if (displayValue.value.length > 3 && !isValid.value) return invalidMessage.value;
  return "";
});

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join("");
}

function formatOutput(e164: string | null, nationalFallback: string): string {
  if (!e164) return nationalFallback;
  try {
    const parsed = parsePhoneNumberFromString(e164);
    if (!parsed) return nationalFallback;
    if (resolvedFormat.value === "e164") return parsed.number;
    if (resolvedFormat.value === "national") return parsed.formatNational();
    return parsed.formatInternational();
  } catch {
    return nationalFallback;
  }
}

function selectCountry(country: Country) {
  selectedCountry.value = country;
  closeDropdown();
  if (displayValue.value) {
    const formatter = new AsYouType(country.code);
    displayValue.value = formatter.input(displayValue.value.replace(/\D/g, ""));
  }
  emit("update:countryCode", country.code);
  nextTick(() => inputRef.value?.focus());
  emitData();
}

function onInput() {
  if (!selectedCountry.value) return;

  if (displayValue.value.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(displayValue.value);
    if (parsed?.country && parsed.isValid()) {
      const found = allCountries.value.find((country) => country.code === parsed.country);
      if (found) selectedCountry.value = found;
      displayValue.value = parsed.formatNational();
      isValid.value = true;
      emitData();
      return;
    }
    displayValue.value = displayValue.value.replace(/^\+/, "");
  }

  let raw = displayValue.value.replace(/[^\d]/g, "");
  const dial = selectedCountry.value.dial;
  if (raw.startsWith(dial) && raw.length > dial.length) {
    raw = raw.slice(dial.length);
  }

  const formatter = new AsYouType(selectedCountry.value.code);
  displayValue.value = formatter.input(raw) || raw;

  try {
    const parsed = parsePhoneNumberFromString(
      `+${dial}${raw}`,
      selectedCountry.value.code,
    );
    isValid.value = parsed?.isValid() ?? false;
  } catch {
    isValid.value = false;
  }

  emitData();
}

function onBlur() {
  isFocused.value = false;
  emitData();
}

function emitData() {
  if (!selectedCountry.value) return;

  const raw = displayValue.value.replace(/[^\d]/g, "");
  const e164 = raw ? `+${selectedCountry.value.dial}${raw}` : null;
  let valid = false;

  if (e164) {
    try {
      const parsed = parsePhoneNumberFromString(e164, selectedCountry.value.code);
      valid = parsed?.isValid() ?? false;
    } catch {
      valid = false;
    }
  }

  isValid.value = valid;
  emit("update:modelValue", formatOutput(e164, displayValue.value));
  emit("data", {
    e164,
    countryCode: selectedCountry.value.code,
    formatted: formatOutput(e164, displayValue.value),
    isValid: valid,
  });
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown();
    return;
  }
  isOpen.value = true;
  searchQuery.value = "";
  nextTick(() => searchRef.value?.focus());
}

function closeDropdown() {
  isOpen.value = false;
  searchQuery.value = "";
}

function selectFirstResult() {
  const firstCountry = filteredCountries.value[0];
  if (firstCountry) selectCountry(firstCountry);
}

function onClickOutside(event: MouseEvent) {
  if (
    !triggerRef.value?.contains(event.target as Node) &&
    !dropdownRef.value?.contains(event.target as Node)
  ) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);

  if (props.countryCode) {
    const found = allCountries.value.find((country) => country.code === props.countryCode);
    if (found) {
      selectedCountry.value = found;
      return;
    }
  }

  const initialCountry = String(resolvedDefaultCountry.value).toUpperCase();
  const foundDefault = allCountries.value.find((country) => country.code === initialCountry);
  if (foundDefault) {
    selectedCountry.value = foundDefault;
    return;
  }

  if (resolvedUseBrowserLocale.value && typeof navigator !== "undefined") {
    const region = (navigator.language || navigator.languages?.[0] || "")
      .split("-")[1]
      ?.toUpperCase();
    if (region) {
      const found = allCountries.value.find((country) => country.code === region);
      if (found) {
        selectedCountry.value = found;
        return;
      }
    }
  }

  if (resolvedPreferredCountries.value.length) {
    const found = allCountries.value.find(
      (country) => country.code === resolvedPreferredCountries.value[0],
    );
    if (found) {
      selectedCountry.value = found;
      return;
    }
  }

  selectedCountry.value =
    allCountries.value.find((country) => country.code === "SN") ||
    allCountries.value[0] ||
    null;
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value || value === displayValue.value) return;
    if (value.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed?.country) {
        const found = allCountries.value.find((country) => country.code === parsed.country);
        if (found) selectedCountry.value = found;
      }
      displayValue.value =
        resolvedFormat.value === "national"
          ? (parsed?.formatNational() ?? value)
          : resolvedFormat.value === "international"
            ? (parsed?.formatInternational() ?? value)
            : value;
      return;
    }
    displayValue.value = value;
  },
  { immediate: true },
);
</script>

<style scoped>
.npi-root {
  position: relative;
  width: 100%;
  --npi-border: #d1d5db;
  --npi-border-hover: #9ca3af;
  --npi-border-active: #0f172a;
  --npi-border-error: #ef4444;
  --npi-ring: rgba(148, 163, 184, 0.2);
  --npi-ring-error: rgba(239, 68, 68, 0.2);
  --npi-bg: #ffffff;
  --npi-bg-soft: #f8fafc;
  --npi-bg-hover: #f1f5f9;
  --npi-bg-selected: #e2e8f0;
  --npi-text: #0f172a;
  --npi-muted: #64748b;
  --npi-placeholder: #94a3b8;
  --npi-success: #16a34a;
  --npi-error: #dc2626;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.npi-control {
  display: flex;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--npi-border);
  background: var(--npi-bg);
  transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}

.npi-control-idle:hover {
  border-color: var(--npi-border-hover);
}

.npi-control-active {
  border-color: var(--npi-border-active);
  box-shadow: 0 0 0 4px var(--npi-ring);
}

.npi-control-error {
  border-color: var(--npi-border-error);
  box-shadow: 0 0 0 4px var(--npi-ring-error);
}

.npi-control-disabled {
  opacity: 0.55;
  background: var(--npi-bg-soft);
}

.npi-variant-outline {
  background: var(--npi-bg);
}

.npi-variant-soft {
  background: var(--npi-bg-soft);
}

.npi-variant-ghost {
  background: transparent;
}

.npi-rounded-sm { border-radius: 0.375rem; }
.npi-rounded-md { border-radius: 0.5rem; }
.npi-rounded-lg { border-radius: 0.75rem; }
.npi-rounded-xl { border-radius: 1rem; }
.npi-rounded-full { border-radius: 9999px; }

.npi-size-sm .npi-country-button,
.npi-size-sm .npi-input {
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
}

.npi-size-md .npi-country-button,
.npi-size-md .npi-input {
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
}

.npi-size-lg .npi-country-button,
.npi-size-lg .npi-input {
  padding: 0.95rem 1rem;
  font-size: 1rem;
}

.npi-country-button {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
  border: 0;
  border-right: 1px solid var(--npi-border);
  background: transparent;
  cursor: pointer;
}

.npi-country-button:hover {
  background: var(--npi-bg-hover);
}

.npi-country-button-disabled {
  cursor: not-allowed;
}

.npi-flag {
  font-size: 1.1rem;
  line-height: 1;
}

.npi-dial-code,
.npi-chevron,
.npi-item-dial,
.npi-search-icon {
  color: var(--npi-muted);
}

.npi-chevron {
  transition: transform 200ms ease;
}

.npi-chevron-open {
  transform: rotate(180deg);
}

.npi-input-wrap {
  position: relative;
  display: flex;
  flex: 1 1 0%;
  align-items: center;
}

.npi-input,
.npi-search-input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--npi-text);
  outline: none;
}

.npi-input::placeholder,
.npi-search-input::placeholder {
  color: var(--npi-placeholder);
}

.npi-check {
  padding-right: 0.9rem;
  color: var(--npi-success);
}

.npi-error {
  margin-top: 0.5rem;
  color: var(--npi-error);
  font-size: 0.875rem;
}

.npi-dropdown {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  z-index: 50;
  width: 18rem;
  overflow: hidden;
  border: 1px solid var(--npi-border);
  border-radius: 1rem;
  background: var(--npi-bg);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.npi-search-wrap {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.625rem;
}

.npi-search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--npi-border);
  border-radius: 0.75rem;
  background: var(--npi-bg-soft);
  padding: 0.5rem 0.75rem;
}

.npi-list {
  max-height: 15rem;
  overflow-y: auto;
  padding: 0.375rem;
}

.npi-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  border-radius: 0.75rem;
  padding: 0.625rem;
  font-size: 0.875rem;
}

.npi-item-idle {
  color: var(--npi-text);
}

.npi-item-idle:hover {
  background: var(--npi-bg-hover);
}

.npi-item-selected {
  background: var(--npi-bg-selected);
  color: var(--npi-text);
  font-weight: 600;
}

.npi-item-flag {
  flex-shrink: 0;
  font-size: 1.125rem;
}

.npi-item-name {
  flex: 1 1 0%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.npi-divider {
  margin: 0.25rem 0.5rem;
  height: 1px;
  background: #e5e7eb;
}

.npi-empty {
  padding: 1rem;
  color: var(--npi-muted);
  text-align: center;
  font-size: 0.875rem;
}

.npi-transition-enter-active {
  transition: all 150ms ease-out;
}

.npi-transition-enter-from {
  opacity: 0;
  transform: translateY(-0.25rem) scale(0.96);
}

.npi-transition-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.npi-transition-leave-active {
  transition: all 100ms ease-in;
}

.npi-transition-leave-from {
  opacity: 1;
}

.npi-transition-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem) scale(0.96);
}
</style>
