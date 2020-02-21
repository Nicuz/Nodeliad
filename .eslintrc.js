module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		"ecmaVersion": 2018,
		"sourceType": "module",
	},
	plugins: [
		"@typescript-eslint",
	],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
	],
	rules: {
		// enforce spacing before and after comma
		// https://eslint.org/docs/rules/comma-spacing
		"comma-spacing": ['error', { before: false, after: true }],

		// require the use of === and !==
		// https://eslint.org/docs/rules/eqeqeq
		eqeqeq: ["warn", "always"],
		"no-var": "error",

		// enforce the consistent use of either backticks, double, or single quotes
		// https://eslint.org/docs/rules/quotes
		quotes: ["error", "double"],

		// disallow `else` blocks after `return` statements in `if` statements
		// https://eslint.org/docs/rules/no-else-return
		"no-else-return": ["error", { allowElseIf: false }],

		// require `let` or `const` instead of `var`
		// https://eslint.org/docs/rules/no-var
		"no-var": "error",

		// require or disallow semicolons instead of ASI
		// https://eslint.org/docs/rules/semi
		semi: "error",

		// enforce consistent spacing before and after semicolons
		// https://eslint.org/docs/rules/semi-spacing
		"semi-spacing": ["error", { "before": false, "after": true }],

		// require or disallow space before function opening parenthesis
		// https://eslint.org/docs/rules/space-before-function-paren
		"space-before-function-paren": ["error", {
			anonymous: "always",
			named: "never",
			asyncArrow: "always"
		}],

		// Enforce spacing around colons of switch statements
		// https://eslint.org/docs/rules/switch-colon-spacing
		"switch-colon-spacing": ["error", { after: true, before: false }],
	}
};