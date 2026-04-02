import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  externals: [
    "nuxt",
    "nuxt/schema",
    "@nuxt/schema",
    "@nuxt/kit",
    "#imports",
    "vue",
    "@vue/runtime-core",
    "libphonenumber-js",
    "libphonenumber-js/max",
  ],
});
