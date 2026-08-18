import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import contactApi from "./plugins/vite-plugin-contact-api.ts";

export default defineConfig(({ mode }) => {
  // Load .env vars into process.env so the contact-api plugin can read them
  const env = loadEnv(mode, process.cwd(), "");
  process.env.RESEND_API_KEY ??= env.RESEND_API_KEY;
  process.env.RESEND_FROM ??= env.RESEND_FROM;
  process.env.RESEND_TEST_TO ??= env.RESEND_TEST_TO;

  return {
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      contactApi(),
    ],
  };
});
