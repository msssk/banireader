export class Config {
    constructor(options) {
        const data = Object.create(null);
        Object.assign(data, {
            currentPage: 1,
            displayedPage: 1,
            lineCache: [],
            renderedPages: []
        });
        const dataJson = localStorage.getItem(options.storageKey);
        Object.assign(data, JSON.parse(dataJson || '{}')[options.source]);
        return new Proxy(data, {
            get(target, property) {
                if (property === 'source') {
                    return options.source;
                }
                return target[property];
            },
            set(target, property, value) {
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
        });
    }
}
