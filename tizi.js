export const RefElementSymbol = Symbol('RefElementSymbol');
export const RefControllerSymbol = Symbol('RefControllerSymbol');
export function createRef() {
    const ref = Object.create(null);
    return new Proxy(ref, {
        get(target, key) {
            if (key === RefElementSymbol || key === 'node') {
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
            if (key === 'node') {
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
    control: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function control(element, controller) {
            this[RefElementSymbol] = element;
            this[RefControllerSymbol] = controller || Object.create(null);
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
            else if (property === 'control') {
                return target[property];
            }
            else {
                return target[RefControllerSymbol][property];
            }
        },
        set(target, property, value) {
            if (property === 'control' || property === 'element') {
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
const emptyObject = Object.freeze(Object.create(null));
const eventHandlerRegex = /^on[A-Z][a-zA-Z]+$/;
function applyOptions(node, options) {
    Object.keys(options).forEach(function (key) {
        const value = options[key];
        if (eventHandlerRegex.test(key)) {
            const [eventListener, eventListenerOptions] = (Array.isArray(value) ?
                value :
                [value]);
            const eventName = key.slice(2).toLowerCase();
            node.addEventListener(eventName, eventListener, eventListenerOptions);
        }
        else if (node.setAttribute && typeof value === 'string') {
            node.setAttribute(key, value);
        }
        else {
            node[key] = value;
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
    if (elementOptions) {
        applyOptions(element, elementOptions);
    }
    if (ref) {
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
            if (typeof child === 'string') {
                child = document.createTextNode(child);
            }
            element.appendChild(child);
        });
    }
    return element;
}
function factory(tagName) {
    return function (options, children) {
        if (Object.prototype.toString.apply(options) !== '[object Object]') {
            children = options;
            options = emptyObject;
        }
        const element = document.createElement(tagName);
        render(element, options, children);
        return element;
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
export default {
    br,
    button,
    div,
    hr,
    input,
    kbd,
    label,
    main,
    p,
    section,
    span,
    table,
    td,
    tr,
};
