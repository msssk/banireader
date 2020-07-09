import { AppConfig, BaniSourceData } from './interfaces';

export interface ConfigOptions {
	storageKey: string;
}

export const defaultColors = {
	backgroundColor: '#0d222b',
	textColor: '#8fa4c7',
	visraamColor: '#457cd3',
	visraamColorYamki: '#6c6551',
};

export type Config = AppConfig & BaniSourceData;

export default function createConfig (options: ConfigOptions): Config {
	const config = Object.create(null);
	Object.assign(config, {
		D: Object.create(null),
		G: Object.create(null),
		backgroundColor: defaultColors.backgroundColor,
		fontSize: undefined,
		source: 'G',
		textColor: defaultColors.textColor,
		visraamColor: defaultColors.visraamColor,
		visraamColorYamki: defaultColors.visraamColorYamki,
	});

	[ 'D', 'G' ].forEach(function (source) {
		Object.assign(config[source], {
			currentPage: 1,
			displayedPage: 1,
			lineCache: [],
			renderedPages: [],
		});
	});

	const dataJson = localStorage.getItem(options.storageKey);
	Object.assign(config, JSON.parse(dataJson || '{}'));
	let storagePending = false;

	return new Proxy<Config>(config, {
		get (target, property: (keyof AppConfig) | (keyof BaniSourceData)) {
			if (property in target) {
				return config[property];
			}
			else {
				return config[target.source][property];
			}
		},

		set (target, property, value) {
			if (property in target) {
				config[property] = value;
			}
			else {
				config[target.source][property] = value;
			}

			if (!storagePending) {
				storagePending = true;

				requestAnimationFrame(function () {
					const storageData = JSON.parse(localStorage.getItem(options.storageKey) || '{}');
					if (!storageData[config.source]) {
						storageData[config.source] = Object.create(null);
					}
					Object.assign(storageData[config.source], config[config.source]);
					localStorage.setItem(options.storageKey, JSON.stringify(storageData));
					storagePending = false;
				});
			}

			return true;
		},
	});
}
