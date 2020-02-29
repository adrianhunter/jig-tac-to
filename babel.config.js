module.exports = {
	plugins: [
		[
			'snowpack/assets/babel-plugin.js',
			{
				// Append .js to all src file imports
				optionalExtensions: true
			}
		],
		[
			'import-rename',
			{ '^(.*)\\.svelte$': '$1.js' }
			// {
			// 	'/.svelte/g': '.js'
			// }
		]
	]
};
