/*
 * Component-based UI micro-framework for not very dynamic, not data-driven web pages.
 * HTML-like convenience methods for creating DOM in JS
 * `onEvent` props are converted to `addEventListener('event')`
 * `onEvent: listener` OR `onEvent: [ listener, listenerOptions ]`
 * Minimal rendering lifecycle
 * No JSX
 * No VDOM
 * No unidirectional data flow
 * No state management
 * No synthetic event system
 */

/* eslint-disable max-len */

export type Renderable = string | Node;
export type RenderChildren = Renderable | Renderable[];

/**
 * A function that returns either a `Node` or a `Controller`.
 * Should call `render(element, options, children)` to handle `options.ref` and `children`
 */
export interface Component {
	<E extends Node, C extends Controller>(options?: ComponentOptions<E, C>, children?: RenderChildren): E | C
}

export type ComponentOptions<E extends Node, C extends Controller = Controller> = {
	[key: string]: unknown;
	ref?: Ref<E> | ComponentRef<E, C>;
};

/**
 * An object that exposes methods to manipulate a Component.
 */
export interface Controller {
	destroy?(): void;
}

// These should generally not be used externally, but if you want to go ahead
export const RefElementSymbol = Symbol('RefElementSymbol');
export const RefControllerSymbol = Symbol('RefControllerSymbol');

/**
 * An object that stores a Node in `RefElementSymbol` and proxies the Node's properties
 */
export type Ref<E extends Node = Node> = {
	[RefElementSymbol]: E;
	node: E;
};

export function createRef<T extends Node> (): T & Ref<T> {
	const ref = Object.create(null);

	return new Proxy(ref, {
		get (target, key) {
			if (key === RefElementSymbol || key === 'node') {
				return target[RefElementSymbol];
			}
			else {
				let value = target[RefElementSymbol][key];
				// TODO: this is probably not a great workaround for the problem that you can't call instance methods
				// when the context has been changed from the instance to a Proxy.
				if (typeof value === 'function') {
					value = value.bind(target[RefElementSymbol]);
				}

				return value;
			}
		},

		set (target, key, value) {
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

/**
 * An object that stores a Node in `RefElementSymbol` and a Controller in `RefControllerSymbol`
 * and proxies the Controller's properties
 */
export type ComponentRef<E extends Node, C extends Controller> = {
	[RefControllerSymbol]: C;
	[RefElementSymbol]: E;
	control(element: E, controller?: C): void;
	element: E;
};

const ComponentRefPrototype = Object.create(null, {
	control: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function control (element: unknown, controller?: unknown) {
			this[RefElementSymbol] = element;
			this[RefControllerSymbol] = controller || Object.create(null);
		},
	},
});

export function createComponentRef<E extends Node, C extends Controller = Controller> (): C & ComponentRef<E, C> {
	const ref = Object.create(ComponentRefPrototype);

	return new Proxy(ref, {
		get (target, property: keyof C) {
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

		set (target, property: keyof C, value: unknown) {
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

export type ElementOptions = {
	[key: string]: unknown;
	ref?: Ref;
};

const emptyObject = Object.freeze(Object.create(null));
const eventHandlerRegex = /^on[A-Z][a-zA-Z]+$/;

function applyOptions (node: Node, options: ElementOptions) {
	Object.keys(options).forEach(function (key) {
		const value = options[key];

		if (eventHandlerRegex.test(key)) {
			const [ eventListener, eventListenerOptions ] = (Array.isArray(value) ?
				value :
				[ value ]) as [EventListener, EventListenerOptions?];
			const eventName = key.slice(2).toLowerCase();
			node.addEventListener(eventName, eventListener, eventListenerOptions);
		}
		else if ((node as HTMLElement).setAttribute && typeof value === 'string') {
			(node as HTMLElement).setAttribute(key, value as string);
		}
		else {
			(node as any)[key] = value;
		}
	});
}

function isChild (child: unknown): child is Renderable {
	const childType = typeof child;
	if (childType === 'string' || child instanceof Node || Array.isArray(child)) {
		return true;
	}

	return false;
}

/**
 * Apply `options` to `element`, including `options.ref`. If provided, append `children` to `element`.
 * If provided, apply `controller` to `options.ref`. Can be called as `render(element, options, children)` or
 * `render(element, options)` or `render(element, children)`. If `controller` is specified all parameters must be supplied.
 */
export function render<C extends Controller = Controller> (
	element: Node,
	options?: ElementOptions | ComponentOptions<Node> | RenderChildren,
	children?: RenderChildren,
	controller?: C
): typeof element extends string ? Text : typeof element extends Node ? typeof element : unknown {
	if (typeof element === 'string') {
		element = document.createTextNode(element);
	}

	if (isChild(options)) {
		children = options;
		options = emptyObject as ElementOptions;
	}

	const {
		ref,
		...elementOptions
	} = options as ComponentOptions<Node>;

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
			children = [ children ];
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

interface ElementRenderer<K extends keyof HTMLElementTagNameMap> {
	(children?: Renderable | Renderable[]): HTMLElementTagNameMap[K];
	(options?: ElementOptions, children?: Renderable | Renderable[]): HTMLElementTagNameMap[K];
}

function factory<K extends keyof HTMLElementTagNameMap> (tagName: K): ElementRenderer<K> {
	return function (options?: Renderable | Renderable[] | ElementOptions, children?: Renderable | Renderable[]): HTMLElementTagNameMap[K] {
		if (Object.prototype.toString.apply(options) !== '[object Object]') {
			children = options as Renderable | Renderable[];
			options = emptyObject;
		}

		const element = document.createElement(tagName);

		render(element, options, children);

		return element;
	};
}

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
