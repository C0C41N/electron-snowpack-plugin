const { command, commandSync } = require('execa');
const { env } = require('npm-run-path');
const { tmpdir } = require('os');
const { statSync, existsSync, writeFileSync, readFileSync } = require('fs');
const glob = require('glob');
const hasher = require('imurmurhash');
const rimraf = require('rimraf');

module.exports = function (snowpackConfig, pluginOptions) {
	const name = 'electron-snowpack-plugin';
	const tmPath = `${tmpdir()}\\${name}.tmp`;

	const exe = (cmd, sync = false) => {
		const options = {
			env: env(),
			extendEnv: true,
			shell: true,
			windowsHide: false,
			cwd: snowpackConfig.root || process.cwd(),
		};

		return sync ? commandSync(cmd, options) : command(cmd, options);
	};

	const getTmpFile = () => {
		const data = { modHash: 0 };
		const strData = JSON.stringify(data);

		if (!existsSync(tmPath)) {
			writeFileSync(tmPath, strData, { encoding: 'utf8' });
			return data;
		}

		return JSON.parse(readFileSync(tmPath, { encoding: 'utf8' }));
	};

	const writeTmp = content =>
		writeFileSync(tmPath, JSON.stringify(content), { encoding: 'utf8' });

	const getModHash = dir => {
		const hash = hasher();

		glob
			.sync(`${dir}/**/*.ts`)
			.forEach(e => hash.hash(statSync(e).mtimeMs.toString()));

		return hash.result();
	};

	return {
		name,

		async run({ isDev, log }) {
			const { entryPath, outPath } = pluginOptions;

			const modHash = getModHash(entryPath);
			const modHashTm = getTmpFile().modHash;

			if (modHash !== modHashTm || !existsSync(`${outPath}/index.js`)) {
				rimraf.sync(outPath);
				exe(`tsc -p ${entryPath}/tsconfig.json`, true);

				writeTmp({ modHash });
			}

			if (isDev) {
				exe('electron . --serve');
			}
		},
	};
};
