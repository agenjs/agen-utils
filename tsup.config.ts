import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: ["index.js"],
  clean: true,
  dts: false,
  noExternal: [],
  format: ["esm"],
  ...options,
}));
