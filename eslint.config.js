import love from 'eslint-config-love';

export default [
	{
		...love,
		files: ['**/*.js', '**/*.ts'],
		languageOptions: {
			...love.languageOptions,
			parserOptions: {
				...love.languageOptions.parserOptions,
				projectService: {
					allowDefaultProject: ['*.config.js', '*.config.ts', 'src/*.spec.ts'],
				},
			},
		},
		rules: {
			...love.rules,

			// JSLint opinions on non-style matters that `love` doesn't cover.
			curly: ['error', 'all'],
			'no-bitwise': ['error'],
			'default-case': ['error'],
			'no-continue': ['error'],

			// These are really unhelpful
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',

			// This package is consumed from plain JS too, where these
			// conversions are real runtime coercion, not no-ops.
			'@typescript-eslint/no-unnecessary-type-conversion': 'off',

			// `interface` merges silently on name collision; `type` errors.
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],

			// `await` on a returned promise only matters inside a try/catch
			'@typescript-eslint/return-await': ['error', 'in-try-catch'],
		},
	},
	{
		ignores: ['dist/', 'node_modules/'],
	},
	{
		files: ['**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
];
