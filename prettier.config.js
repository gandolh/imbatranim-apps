import config from "./vendor/house-style/prettier.config.js";

// The house format, from the vendored house-style copy: width 120, trailing commas, double quotes and
// semicolons. The Tailwind plugin sorts the utility classes in the apps' markup.
export default { ...config, plugins: ["prettier-plugin-tailwindcss"] };
