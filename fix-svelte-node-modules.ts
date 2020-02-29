//fix to use svelvet + snowpack for npm modules that have raw .svelte files

import * as svelte from 'svelte/compiler';

import * as fs from 'fs';
import * as glob from 'glob';

const modulesToFix = ['svelte-routing'];
const pathName = __dirname + '/node_modules/';

fs.readdirSync(pathName).forEach(async dir => {
	if (modulesToFix.includes(dir)) {
		//fix to use svelvet + snowpack for npm modules that have raw .svelte files

		glob(`${pathName + dir}/**/*.svelte`, async function(err, files) {
			console.log(files);

			files.forEach(filePath => {
				const file = fs.readFileSync(filePath);
				const result = svelte.compile(file.toString());

				console.log(result.js.code);
				fs.writeFileSync(
					filePath.replace('.svelte', '.js'),
					result.js.code
				);
			});
		});

		// const result = svelte.compile(source, {
		//     // options
		// });
	}
});
