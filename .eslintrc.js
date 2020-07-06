module.exports = {
	env: {
		browser: true,
		es2020: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
	],
	rules: {
		// Possible Errors
		'no-await-in-loop': 'error',
		'no-compare-neg-zero': 'error',
		'no-unsafe-negation': 'error',

		// TypeScript
		'@typescript-eslint/explicit-module-boundary-types': 'off',

		// Best Practices
		'accessor-pairs': 'warn',
		'array-callback-return': 'warn',
		'block-scoped-var': 'error',
		complexity: [ 'warn', 10 ],
		curly: [ 'error', 'all' ],
		'dot-location': [ 'error', 'property' ],
		'dot-notation': 'error',
		eqeqeq: [ 'error', 'always', { null: 'ignore' } ],
		'no-caller': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-extra-label': 'error',
		'no-fallthrough': 'off',
		'no-floating-decimal': 'error',
		'no-global-assign': 'error',
		'no-implicit-coercion': 'error',
		'no-implied-eval': 'error',
		'no-invalid-this': 'error',
		'no-lone-blocks': 'error',
		'no-magic-numbers': [ 'warn', {
			ignore: [ -1, 0, 1 ],
			ignoreArrayIndexes: true
		} ],
		'no-multi-spaces': 'error',
		'no-multi-str': 'error',
		'no-new': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-octal-escape': 'error',
		'no-return-assign': 'error',
		'no-return-await': 'error',
		'no-script-url': 'error',
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-throw-literal': 'error',
		'no-unmodified-loop-condition': 'error',
		'no-unused-expressions': [ 'error', { allowShortCircuit: true } ],
		'no-useless-call': 'error',
		'no-useless-concat': 'error',
		'no-useless-escape': 'error',
		'no-useless-return': 'error',
		'no-void': 'error',
		'no-with': 'error',
		radix: 'error',
		// warn: to accommodate `this.inherited`
		'vars-on-top': 'warn',
		'wrap-iife': 'error',
		yoda: [ 'error', 'never' ],

		// Stylistic Issues
		'array-bracket-spacing': [ 'error', 'always' ],
		'brace-style': [ 'error', 'stroustrup' ],
		camelcase: [ 'error', { properties: 'always' } ],
		'comma-dangle': [ 'error', {
			arrays: 'always-multiline',
			objects: 'always-multiline',
			imports: 'always-multiline',
			exports: 'never',
		} ],
		'comma-spacing': [ 'error', { before: false, after: true } ],
		'comma-style': [ 'error', 'last' ],
		'computed-property-spacing': [ 'error', 'never' ],
		'consistent-this': [ 'warn', 'self' ],
		'eol-last': [ 'error', 'always' ],
		'func-call-spacing': [ 'error', 'never' ],
		'id-blacklist': [ 'error', 'err', 'evt' ],
		indent: [ 'error', 'tab', {
			ArrayExpression: 1,
			CallExpression: { arguments: 1 },
			FunctionDeclaration: {
				body: 1,
				parameters: 1
			},
			FunctionExpression: {
				body: 1,
				parameters: 1
			},
			MemberExpression: 1,
			ObjectExpression: 1,
			outerIIFEBody: 1,
			SwitchCase: 1
		} ],
		'key-spacing': [ 'error', {
			afterColon: true,
			beforeColon: false,
			mode: 'strict'
		} ],
		'keyword-spacing': [ 'error', {
			after: true,
			before: true
		} ],
		'linebreak-style': [ 'error', 'unix' ],
		'max-depth': [ 'warn', 5 ],
		'max-len': [ 'warn', 120, {
			ignoreUrls: true
		} ],
		'max-lines': [ 'warn', {
			max: 500,
			skipBlankLines: true,
			skipComments: true
		} ],
		'max-nested-callbacks': [ 'error', 6 ],
		'max-params': [ 'warn', 5 ],
		'max-statements-per-line': [ 'error', { max: 1 } ],
		'new-cap': [ 'off', {
			capIsNew: true,
			newIsCap: false,
			properties: true
		} ],
		'new-parens': 'error',
		'newline-before-return': 'error',
		'newline-per-chained-call': [ 'error', { ignoreChainWithDepth: 3 } ],
		'no-array-constructor': 'error',
		'no-bitwise': 'warn',
		'no-lonely-if': 'warn',
		'no-mixed-operators': 'error',
		'no-mixed-spaces-and-tabs': [ 'error', 'smart-tabs' ],
		'no-multi-assign': 'error',
		'no-multiple-empty-lines': [ 'error', {
			max: 1,
			maxBOF: 0
		} ],
		'no-negated-condition': 'error',
		'no-nested-ternary': 'error',
		'no-new-object': 'error',
		'no-trailing-spaces': 'error',
		'no-unneeded-ternary': 'error',
		'no-whitespace-before-property': 'error',
		'object-curly-spacing': [ 'error', 'always' ],
		'one-var': [ 'error', 'never' ],
		'operator-linebreak': [ 'error', 'after' ],
		'padded-blocks': [ 'error', 'never' ],
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: 'var',
				next: '*',
			},
			{
				blankLine: 'any',
				prev: 'var',
				next: 'var',
			},
			{
				blankLine: 'always',
				prev: '*',
				next: 'return',
			},
		],
		'quote-props': [ 'error', 'as-needed' ],
		quotes: [ 'error', 'single', {
			allowTemplateLiterals: true,
			avoidEscape: true
		} ],
		semi: [ 'error', 'always' ],
		'semi-spacing': [ 'error', {
			after: true,
			before: false
		} ],
		'sort-vars': [ 'warn', { ignoreCase: true } ],
		'space-before-blocks': 'error',
		'space-before-function-paren': [ 'error', {
			anonymous: 'always',
			asyncArrow: 'always',
			named: 'always'
		} ],
		'space-in-parens': [ 'error', 'never' ],
		'space-infix-ops': [ 'error' ],
		'space-unary-ops': [ 'error', {
			nonwords: false,
			words: true
		} ],
		'spaced-comment': [ 'error', 'always' ],

		// Variables
		'no-label-var': 'error',
		'no-shadow': 'error',
		'no-use-before-define': [ 'error', {
			classes: true,
			functions: false,
			variables: true
		} ]
	}
};
