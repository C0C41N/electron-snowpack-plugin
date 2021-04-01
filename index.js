const execa = require('execa');
const npmRunPath = require('npm-run-path');

module.exports = function (snowpackConfig, pluginOptions) {
	return {
		name: 'electron-snowpack-plugin',

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
