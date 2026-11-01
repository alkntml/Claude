const base = require("../tailwind.config.ts");
module.exports = { ...(base.default ?? base), content: [__dirname + "/../src/**/*.{ts,tsx}", __dirname + "/**/*.{ts,tsx}"] };
