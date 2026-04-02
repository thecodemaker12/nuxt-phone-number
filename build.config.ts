import { defineBuildConfig } from "@nuxt/module-builder";

export default defineBuildConfig({
  externals: ["libphonenumber-js", "libphonenumber-js/max"],
});
