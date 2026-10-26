import js from "@eslint/js"
import tseslint from "typescript-eslint"
import shape from "./code-shape.json" with { type: "json" }

const NESTED_FUNCTION = {
  selector: ":function :function",
  message: "Define functions at top level; never inside another function.",
}

const SQL_PATTERN = "/\\b(SELECT|INSERT|UPDATE|DELETE)\\b.+\\b(FROM|INTO|SET|WHERE)\\b/i"

const INLINE_SQL = [
  { selector: `Literal[value=${SQL_PATTERN}]`, message: "Keep SQL in .sql files behind the module that owns the table." },
  { selector: `TemplateElement[value.raw=${SQL_PATTERN}]`, message: "Keep SQL in .sql files behind the module that owns the table." },
]

const codeShapeRules = {
  complexity: ["error", shape.maxComplexity],
  "max-depth": ["error", shape.maxDepth],
  "max-params": ["error", shape.maxParams],
  "max-lines-per-function": [
    "error",
    { max: shape.maxFunctionLines, skipBlankLines: true, skipComments: true },
  ],
  "no-restricted-syntax": ["error", NESTED_FUNCTION, ...INLINE_SQL],
}

const NODE_GLOBALS = { console: "readonly", fetch: "readonly", process: "readonly", URL: "readonly" }

const PURE_FILES = ["src/bridge/**", "src/registry/**", "src/drawings/models/**"]

const PURE_RULES = {
  "no-restricted-globals": ["error", "document", "window", "performance", "fetch", "console"],
  "no-restricted-properties": [
    "error",
    { object: "Date", property: "now", message: "Pass the clock in." },
    { object: "Math", property: "random", message: "Pass the random source in." },
  ],
}

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".agents", "proof", "test-results", "playwright-report"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  { rules: codeShapeRules },
  { files: PURE_FILES, rules: PURE_RULES },
  { files: ["scripts/**"], languageOptions: { globals: NODE_GLOBALS } },
)
