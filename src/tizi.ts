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

const emptyObject = Object.freeze(Object.create(null));

export type Renderable = string | Node;
export type RenderChildren = Renderable | Renderable[];

/**
 * A function that returns an `HTMLElement`.
 * Should call `render(element, options, children)` to handle `options.controller`, `options.ref` and `children`
 */
export interface Component {
	<E extends HTMLElement, C extends Controller<E>>(options?: ComponentOptions<E, C>, children?: RenderChildren): E
}

export type ComponentOptions<E extends HTMLElement, C extends Controller<E> = Controller<E>> = {
	[key: string]: unknown;
	controller?: C;
	ref?: Ref<E> | ComponentRef<C>;
};

/**
 * An object that exposes methods to manipulate a Component.
 */
export interface Controller<E extends HTMLElement = HTMLElement> {
	/**
	 * A function that can be manually invoked to destroy the DOM element and perform any cleanup.
	 * Cleanup (e.g. removing event listeners) should be performed in implementations of this method.
	 */
	destroy?(): void;

	element?: E;
}

// These should generally not be used externally, but if you want to go ahead
export const RefElementSymbol = Symbol('RefElementSymbol');
export const RefControllerSymbol = Symbol('RefControllerSymbol');

/**
 * An object that stores an element in `RefElementSymbol` and proxies the element's properties. The element is also
 * accessible on the `element` property (e.g. for direct equality comparisons). For the sake of convenience most
 * element properties can be accessed through the proxy. The proxy will bind functions to the element so they are
 * executed in the correct context.
 */
export type Ref<E extends HTMLElement = HTMLElement> = {
	[RefElementSymbol]: E;
	clone(ref: Ref<E>): void;
	element: E;
};

const RefPrototype = Object.create(null, {
	clone: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function (ref: Ref) {
			this[RefElementSymbol] = ref[RefElementSymbol];
		},
	},
});

export function createRef<T extends HTMLElement> (): T & Ref<T> {
	const ref = Object.create(RefPrototype);

	return new Proxy(ref, {
		get (target, key) {
			if (key === RefElementSymbol || key === 'element') {
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

/**
 * An object that stores an element in `RefElementSymbol` and a Controller in `RefControllerSymbol`
 * and proxies the Controller's properties
 */
export interface ComponentRef<C extends Controller<HTMLElement>> extends Ref {
	[RefControllerSymbol]: C;
	clone(ref: ComponentRef<C>): void;
	control(element: Controller['element'], controller?: C): void;
}

const ComponentRefPrototype = Object.create(null, {
	clone: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function<E extends HTMLElement> (ref: ComponentRef<Controller<E>>) {
			RefPrototype.clone(ref);
			this[RefControllerSymbol] = ref[RefControllerSymbol];
		},
	},

	control: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function control<E extends HTMLElement = HTMLElement, C extends Controller<E> = Controller<E>> (element: E, controller?: C) {
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

export function createComponentRef<C extends Controller<HTMLElement> = Controller<HTMLElement>> (): C & ComponentRef<C> {
	const ref = Object.create(ComponentRefPrototype);

	return new Proxy(ref, {
		get (target, property: keyof C) {
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

		set (target, property: keyof C, value: unknown) {
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

export type ElementOptions = {
	[key: string]: unknown;
	controller?: Controller;
	ref?: Ref | ComponentRef<Controller>;
};

const eventHandlerRegex = /^on[A-Z][a-zA-Z]+$/;

function applyOptions<E extends HTMLElement> (element: E, options: ElementOptions) {
	Object.keys(options).forEach(function (key) {
		const value = options[key];

		if (eventHandlerRegex.test(key)) {
			const [ eventListener, eventListenerOptions ] = (Array.isArray(value) ?
				value :
				[ value ]) as [EventListener, EventListenerOptions?];
			const eventName = key.slice(2).toLowerCase();
			element.addEventListener(eventName, eventListener, eventListenerOptions);
		}
		else if (element.setAttribute && typeof value === 'string') {
			element.setAttribute(key, value as string);
		}
		else {
			(element as any)[key] = value;
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
	options?: ElementOptions | ComponentOptions<HTMLElement> | RenderChildren,
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
	} = options as ComponentOptions<HTMLElement>;

	if (elementOptions && element.nodeType === element.ELEMENT_NODE) {
		applyOptions(element as HTMLElement, elementOptions);
	}

	if (ref && element.nodeType === element.ELEMENT_NODE) {
		if ('control' in ref) {
			ref.control(element as HTMLElement, controller);
		}
		else {
			ref[RefElementSymbol] = element as HTMLElement;
		}
	}

	if (children) {
		if (!Array.isArray(children)) {
			children = [ children ];
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

interface ElementRenderer<K extends keyof HTMLElementTagNameMap> {
	(children?: Renderable | Renderable[]): HTMLElementTagNameMap[K];
	(options?: ElementOptions, children?: Renderable | Renderable[]): HTMLElementTagNameMap[K];
}

export default function tizi<K extends keyof HTMLElementTagNameMap> (tagName: K | Component, options?: ElementOptions, ...children: Renderable[]) {
	const {
		controller,
		...elementOptions
	} = (options || emptyObject) as ElementOptions;
	let element;

	if (typeof tagName === 'string') {
		element = document.createElement(tagName);
		render(element, elementOptions, children, controller as unknown as Controller<HTMLElement>);
	}
	else {
		element = tagName(options, children);
	}

	return element;
}

function factory<K extends keyof HTMLElementTagNameMap> (tagName: K): ElementRenderer<K> {
	return function (options?: RenderChildren | ElementOptions, children?: RenderChildren): HTMLElementTagNameMap[K] {
		if (Object.prototype.toString.apply(options) !== '[object Object]') {
			children = options as RenderChildren;
			options = emptyObject;
		}

		if (!Array.isArray(children)) {
			children = [ children ] as Renderable[];
		}

		// TODO: wat?
		/* eslint-disable @typescript-eslint/ban-ts-comment */
		// @ts-expect-error
		return tizi(tagName, options as ElementOptions, ...children);
	};
}

// TODO: all the elements
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
