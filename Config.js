export const defaultColors = {
    backgroundColor: '#0d222b',
    textColor: '#8fa4c7',
    visraamColor: '#457cd3',
    visraamColorYamki: '#6c6551',
};
export default function createConfig(options) {
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
    ['D', 'G'].forEach(function (source) {
        Object.assign(config[source], {
            currentPage: 1,
            activeRenderedPage: 0,
            lineCache: createArrayProxy([]),
            renderedPages: createArrayProxy([]),
        });
    });
    const data = JSON.parse(localStorage.getItem(options.storageKey) || '{}');
    if ('currentPage' in data && !('nextPageToFetch' in data)) {
        data.nextPageToFetch = data.currentPage;
    }
    Object.assign(config, data);
    let storagePending = false;
    function saveToStorage() {
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
    function createArrayProxy(targetArray) {
        return new Proxy(targetArray, {
            get(target, property) {
                return target[property];
            },
            set(target, property, value) {
                target[property] = value;
                saveToStorage();
                return true;
            },
        });
    }
    return new Proxy(config, {
        get(target, property) {
            if (property in target) {
                return config[property];
            }
            else {
                return config[target.source][property];
            }
        },
        set(target, property, value, receiver) {
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
