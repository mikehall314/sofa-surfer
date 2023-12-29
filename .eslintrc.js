/* eslint-env node */
module.exports = {
	root: true,
	extends: [
		'standard',
		'eslint:recommended',
		'plugin:@typescript-eslint/strict',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
};
