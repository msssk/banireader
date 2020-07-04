import { BaniSourceData } from './interfaces';

export interface ConfigOptions {
	source: string;
	storageKey: string;
}

export class Config implements BaniSourceData {
	constructor (options: ConfigOptions) {
		const data: BaniSourceData = Object.create(null);
		Object.assign(data, {
			currentPage: 1,
			displayedPage: 1,
			lineCache: [],
			renderedPages: []
		});

		const dataJson = localStorage.getItem(options.storageKey);
		Object.assign(data, JSON.parse(dataJson || '{}')[options.source]);

		return new Proxy<BaniSourceData>(data, {
			get (target: BaniSourceData, property: (keyof BaniSourceData) | 'source') {
				if (property === 'source') {
					return options.source;
				}

				return target[property];
			},

			set (target: any, property: keyof BaniSourceData, value: any) {
				target[property] = value;

				requestAnimationFrame(function () {
					const storageData = JSON.parse(localStorage.getItem(options.storageKey) || '{}');
					if (!storageData[options.source]) {
						storageData[options.source] = Object.create(null);
					}
					Object.assign(storageData[options.source], target);
					localStorage.setItem(options.storageKey, JSON.stringify(storageData));
				});

				return true;
			}
		})
	}
}
