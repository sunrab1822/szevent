import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        define: {
            "import.meta.env.VITE_API_ORIGIN": JSON.stringify(env.VITE_API_ORIGIN ?? ""),
            "import.meta.env.VITE_AUTH_TOKEN": JSON.stringify(env.VITE_AUTH_TOKEN ?? "SZERendezvenySzervezo"),
        },
        plugins: [react(), tailwindcss()],
    };
});
