import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                main: "var(--main)",
                overlay: "var(--overlay)",
                bg: "var(--bg)",
                bw: "var(--bw)",
                blank: "var(--blank)",
                text: "var(--text)",
                mtext: "var(--mtext)",
                border: "var(--border)",
                ring: "var(--ring)",
                ringOffset: "var(--ring-offset)",

                secondaryBlack: "#212121",
            },
            borderRadius: {
                base: "6px",
            },
            boxShadow: {
                shadow: "var(--shadow)",
            },
            translate: {
                boxShadowX: "5px",
                boxShadowY: "4px",
                reverseBoxShadowX: "-5px",
                reverseBoxShadowY: "-4px",
            },
            fontWeight: {
                base: "500",
                heading: "700",
            },
        },
    },
    plugins: [],
} satisfies Config;
