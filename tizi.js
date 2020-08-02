const emptyObject = Object.freeze(Object.create(null));
export const RefElementSymbol = Symbol('RefElementSymbol');
export const RefControllerSymbol = Symbol('RefControllerSymbol');
const RefPrototype = Object.create(null, {
    clone: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function (ref) {
            this[RefElementSymbol] = ref[RefElementSymbol];
        },
    },
});
export function createRef() {
    const ref = Object.create(RefPrototype);
    return new Proxy(ref, {
        get(target, key) {
            if (key === RefElementSymbol || key === 'element') {
                return target[RefElementSymbol];
            }
            else {
                let value = target[RefElementSymbol][key];
                if (typeof value === 'function') {
                    value = value.bind(target[RefElementSymbol]);
                }
                return value;
            }
        },
        set(target, key, value) {
            if (key === 'element') {
                return false;
            }
            if (key === RefElementSymbol) {
                target[RefElementSymbol] = value;
            }
            else {
                target[RefElementSymbol][key] = value;
            }
            return true;
        },
    });
}
const ComponentRefPrototype = Object.create(null, {
    clone: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function (ref) {
            RefPrototype.clone(ref);
            this[RefControllerSymbol] = ref[RefControllerSymbol];
        },
    },
    control: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function control(element, controller) {
            if (controller) {
                Object.defineProperty(controller, 'element', {
                    configurable: false,
                    enumerable: true,
                    writable: false,
                    value: element,
                });
            }
            this[RefElementSymbol] = element;
            this[RefControllerSymbol] = controller || emptyObject;
        },
    },
});
export function createComponentRef() {
    const ref = Object.create(ComponentRefPrototype);
    return new Proxy(ref, {
        get(target, property) {
            if (property === 'element') {
                return target[RefElementSymbol];
            }
            else if (property === 'clone' || property === 'control') {
                return target[property];
            }
            else {
                return target[RefControllerSymbol][property];
            }
        },
        set(target, property, value) {
            if (property === 'clone' || property === 'control' || property === 'element') {
                return false;
            }
            if (property === RefControllerSymbol || property === RefElementSymbol) {
                target[property] = value;
            }
            else {
                target[RefControllerSymbol][property] = value;
            }
            return true;
        },
    });
}
const eventHandlerRegex = /^on[A-Z][a-zA-Z]+$/;
function applyOptions(element, options) {
    Object.keys(options).forEach(function (key) {
        const value = options[key];
        if (eventHandlerRegex.test(key)) {
            const [eventListener, eventListenerOptions] = (Array.isArray(value) ?
                value :
                [value]);
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, eventListener, eventListenerOptions);
        }
        else if (element.setAttribute && typeof value === 'string') {
            element.setAttribute(key, value);
        }
        else {
            element[key] = value;
        }
    });
}
function isChild(child) {
    const childType = typeof child;
    if (childType === 'string' || child instanceof Node || Array.isArray(child)) {
        return true;
    }
    return false;
}
export function render(element, options, children, controller) {
    if (typeof element === 'string') {
        element = document.createTextNode(element);
    }
    if (isChild(options)) {
        children = options;
        options = emptyObject;
    }
    const { ref, ...elementOptions } = options;
    if (elementOptions && element.nodeType === element.ELEMENT_NODE) {
        applyOptions(element, elementOptions);
    }
    if (ref && element.nodeType === element.ELEMENT_NODE) {
        if ('control' in ref) {
            ref.control(element, controller);
        }
        else {
            ref[RefElementSymbol] = element;
        }
    }
    if (children) {
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach(function (child) {
            if (!child) {
                return;
            }
            if (typeof child === 'string') {
                child = document.createTextNode(child);
            }
            element.appendChild(child);
        });
    }
    return element;
}
export default function tizi(tagName, options, ...children) {
    const { controller, ...elementOptions } = (options || emptyObject);
    let element;
    if (typeof tagName === 'string') {
        element = document.createElement(tagName);
        render(element, elementOptions, children, controller);
    }
    else {
        element = tagName(options, children);
    }
    return element;
}
function factory(tagName) {
    return function (options, children) {
        if (Object.prototype.toString.apply(options) !== '[object Object]') {
            children = options;
            options = emptyObject;
        }
        if (!Array.isArray(children)) {
            children = [children];
        }
        return tizi(tagName, options, ...children);
    };
}
export const a = factory('a');
export const br = factory('br');
export const button = factory('button');
export const div = factory('div');
export const hr = factory('hr');
export const input = factory('input');
export const kbd = factory('kbd');
export const label = factory('label');
export const main = factory('main');
export const p = factory('p');
export const section = factory('section');
export const span = factory('span');
export const table = factory('table');
export const td = factory('td');
export const tr = factory('tr');
