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

/**
 * The Config object immediately loads from localStorage when created. The data in localStorage contains
 * BaniSourceData on properties named for each source (D, G, ...). The config object proxies property access
 * based on the value of the `source` property. e.g. if `source` is set to 'G' then properties on 'G' can
 * be accessed directly from the config object without having to specify `config.G.prop`.
 * When array values are assigned they are replaced with a proxy. All property assignments and array modifications
 * are proxied to save to localStorage.
 */
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
			activeRenderedPage: 0,
			lineCache: createArrayProxy([]),
			renderedPages: createArrayProxy([]),
		});
	});

	const dataJson = localStorage.getItem(options.storageKey);
	Object.assign(config, JSON.parse(dataJson || '{}'));

	let storagePending = false;
	function saveToStorage () {
		if (!storagePending) {
			storagePending = true;

			requestAnimationFrame(function () {
				const storageData = JSON.parse(localStorage.getItem(options.storageKey) || '{}');
				if (!storageData[config.source]) {
					storageData[config.source] = Object.create(null);
				}
				Object.assign(storageData, config);
				localStorage.setItem(options.storageKey, JSON.stringify(storageData));
				storagePending = false;
			});
		}
	}

	function createArrayProxy<T> (targetArray: Array<T extends (infer R)[] ? R : T>) {
		return new Proxy<Array<unknown>>(targetArray, {
			get (target, property) {
				return (target as any)[property];
			},

			set (target, property, value) {
				(target as any)[property] = value;
				saveToStorage();

				return true;
			},
		});
	}

	return new Proxy<Config>(config, {
		get (target, property: (keyof AppConfig) | (keyof BaniSourceData)) {
			if (property in target) {
				return config[property];
			}
			else {
				return config[target.source][property];
			}
		},

		set (target, property, value, receiver) {
			if (value === receiver[property]) {
				return true;
			}

			if (Array.isArray(value)) {
				value = createArrayProxy(value);
			}

			if (property in target) {
				config[property] = value;
			}
			else {
				config[target.source][property] = value;
			}

			saveToStorage();

			return true;
		},
	});
}
