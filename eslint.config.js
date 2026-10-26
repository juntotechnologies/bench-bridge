/** ESLint config: code shape limits, typed boundaries, import rules per area and the file docstring rule. */
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import shape from "./code-shape.json" with { type: "json" }
import fileDocstring from "./tools/eslint/file-docstring.js"

const MESSAGE_NESTED = "Define functions at top level; never inside another function."
const MESSAGE_SQL = "Keep SQL in .sql files behind the module that owns the table."
const MESSAGE_SHAPE = "Name this data shape as an interface; never write an inline object type."

const SQL_VERBS = ["SELECT", "INSERT", "UPDATE", "DELETE"]
const SQL_CLAUSES = ["FROM", "INTO", "SET", "WHERE"]
const SQL_PATTERN = `/\\b(${SQL_VERBS.join("|")})\\b.+\\b(${SQL_CLAUSES.join("|")})\\b/i`
const TYPED_SLOT = ":function > :matches(Identifier, ObjectPattern, ArrayPattern) > TSTypeAnnotation > TSTypeLiteral"

const INLINE_SQL = [
  { selector: `Literal[value=${SQL_PATTERN}]`, message: MESSAGE_SQL },
  { selector: `TemplateElement[value.raw=${SQL_PATTERN}]`, message: MESSAGE_SQL },
]
const NESTED_FUNCTION = { selector: ":function :function", message: MESSAGE_NESTED }
const INLINE_SHAPES = [
  { selector: TYPED_SLOT, message: MESSAGE_SHAPE },
  { selector: ":function > TSTypeAnnotation > TSTypeLiteral", message: MESSAGE_SHAPE },
]

const SHAPE_LIMITS = {
  complexity: ["error", shape.maxComplexity],
  "max-depth": ["error", shape.maxDepth],
  "max-params": ["error", shape.maxParams],
}
const FUNCTION_LENGTH = ["error", { max: shape.maxFunctionLines, skipBlankLines: true, skipComments: true }]

const TYPED_FILES = ["shared/**/*.ts", "client/**/*.ts", "server/**/*.ts", "site/**/*.ts", "tools/**/*.ts", "tests/**/*.ts", "*.ts"]

const TYPED_BOUNDARIES = {
  "@typescript-eslint/explicit-function-return-type": "error",
  "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
}

const CODE_FILES = ["shared/**/*.ts", "client/**/*.ts", "server/**/*.ts", "site/**/*.ts", "tools/**/*.{ts,js}", "tests/**/*.ts", "*.{ts,js}"]

const IMPORT_BOUNDARIES = {
  shared: ["**/client/**", "**/server/**", "@client/*", "@server/*", "node:*", "vite"],
  client: ["**/server/**", "@server/*", "node:*"],
  clientNode: ["**/server/**", "@server/*"],
  server: ["**/client/**", "@client/*"],
}

const CLIENT_NODE_FILES = ["client/scripts/**/*.ts", "client/vite.config.ts"]

function isAreaRule([area]) {
  return area !== "clientNode"
}

function boundaryRule([area, patterns]) {
  return {
    files: [`${area}/**/*.ts`],
    rules: { "no-restricted-imports": ["error", { patterns }] },
  }
}

const PURE_FILES = ["shared/bridge/**", "shared/registry/**", "client/drawings/models/**"]
const PURE_RULES = {
  "no-restricted-globals": ["error", "document", "window", "performance", "fetch", "console"],
  "no-restricted-properties": [
    "error",
    { object: "Date", property: "now", message: "Pass the clock in." },
    { object: "Math", property: "random", message: "Pass the random source in." },
  ],
}

export default tseslint.config(
  { ignores: ["dist", "dist-pages", "node_modules", ".agents", "proof", "client/vite-env.d.ts"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  { files: CODE_FILES, rules: { ...SHAPE_LIMITS, "max-lines-per-function": FUNCTION_LENGTH } },
  { files: TYPED_FILES, rules: TYPED_BOUNDARIES },
  { files: CODE_FILES, rules: { "no-restricted-syntax": ["error", NESTED_FUNCTION, ...INLINE_SQL, ...INLINE_SHAPES] } },
  { files: CODE_FILES, plugins: { local: { rules: { "file-docstring": fileDocstring } } }, rules: { "local/file-docstring": "error" } },
  ...Object.entries(IMPORT_BOUNDARIES).filter(isAreaRule).map(boundaryRule),
  { files: CLIENT_NODE_FILES, rules: { "no-restricted-imports": ["error", { patterns: IMPORT_BOUNDARIES.clientNode }] } },
  { files: PURE_FILES, rules: PURE_RULES },
  { files: ["tests/**/*.ts"], rules: { "max-lines-per-function": "off", "no-restricted-syntax": ["error", ...INLINE_SQL, ...INLINE_SHAPES] } },
)
