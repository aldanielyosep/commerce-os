import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json-summary"],
            reportsDirectory: "./coverage",
            exclude: [
                "**/*.test.{ts,tsx}",
                "src/test/**",
                "scripts/**",
                "src/pages/CompaniesPage.tsx",
                "src/pages/EmployeesPage.tsx"
            ]
        }
    }
});
