import neostandard from 'neostandard';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	...neostandard({ ts: true, noStyle: true }),
	tseslint.configs.strict,
	{
		ignores: ['dist/', 'node_modules/'],
	},
);
