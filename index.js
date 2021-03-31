const execa = require('execa');
const npmRunPath = require('npm-run-path');
const { readFileSync, writeFileSync } = require('fs');

const replaceFileString = async (file, str, rep) => {
	try {
		const content = readFileSync(file, 'utf8');
		const regEx = RegExp(str, 'g');
		writeFileSync(file, content.replace(regEx, rep), 'utf8');
	} catch (e) {
		console.log(`replaceFileString: ${e}`);
	}
};

module.exports = function (snowpackConfig, pluginOptions) {
	return {
		name: 'electron-snowpack-plugin',

		async optimize({ buildDirectory }) {
			// fixing html
			const html = `${buildDirectory}\\index.html`;
			await replaceFileString(html, 'href="/', 'href="');
		},

		async run({ isDev, log }) {
			if (!isDev) return;

			return execa.command('electron . --serve', {
				env: npmRunPath.env(),
				extendEnv: true,
				shell: true,
				windowsHide: false,
				cwd: snowpackConfig.root || process.cwd(),
			});
		},
	};
};
