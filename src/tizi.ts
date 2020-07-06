/*
 * Component-based UI micro-framework for not very dynamic, not data-driven web pages.
 * HTML-like convenience methods for creating DOM in JS
 * No JSX
 * No VDOM / rendering control / unidirectional data flow
 * No state management
 * No synthetic event system
 */

export type Child = string | Node;

interface Component {
	<C extends Controller, E extends HTMLElement>(
		options?: ComponentOptions<E, C>,
		ref?: ComponentRef<E, C>
	): E
}

export type ComponentRef<E extends HTMLElement, C extends Controller> = {
	e: E;
	control(element: E, controller: C): void;
};

export interface Controller {
	destroy?(): void;
}

export type Ref<E extends HTMLElement = HTMLElement> = {
	e: E;
};

export type ElementOptions = {
	[key: string]: any;
	ref?: Ref;
};

export type ComponentOptions<E extends HTMLElement, C extends Controller = Controller> = {
	[key: string]: any;
	ref?: ComponentRef<E, C>;
};

function stringToTextNode (child: Child): Node {
	if (typeof child === 'string') {
		return document.createTextNode(child);
	}

	return child;
}

export function createRef<T extends HTMLElement> (): Ref<T> {
	return Object.create(null);
}

export function createComponentRef<U extends Component, T> (): T & ComponentRef<ReturnType<U>, T> {
	const ref = Object.create(null);
	Object.assign(ref, {
		control (element: ReturnType<U>, controller: T) {
			ref.e = element;
			ref.c = controller;
		},
	});

	const proxy = new Proxy(ref, {
		get (target, property: keyof T) {
			if (property === 'e' || property === 'control') {
				return target[property];
			}

			return target.c[property];
		},

		set (target, property: keyof T, value: any) {
			if (property === 'control') {
				return false;
			}

			if (property === 'e') {
				target.e = value;
			}
			else {
				target.c[property] = value;
			}

			return true;
		},
	});

	return proxy;
}

const emptyObject = Object.freeze(Object.create(null));

function factory<K extends keyof HTMLElementTagNameMap> (tagName: K) {
	function Render (children?: Child | Child[]): HTMLElementTagNameMap[K];
	function Render (options?: ElementOptions, children?: Child | Child[]): HTMLElementTagNameMap[K];
	function Render (options?: Child | Child[] | ElementOptions, children?: Child | Child[]): HTMLElementTagNameMap[K] {
		if (Object.prototype.toString.apply(options) !== '[object Object]') {
			children = options as Child | Child[];
			options = emptyObject;
		}

		const {
			ref,
			...elementOptions
		} = options as ElementOptions;

		const element = document.createElement(tagName);
		Object.assign(element, elementOptions);

		if (ref) {
			ref.e = element;
		}

		if (children) {
			children = Array.isArray(children) ? children : [ children ];
			children.map(stringToTextNode).forEach(function (child) {
				element.appendChild(child);
			});
		}

		return element;
	}

	return Render;
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
	span,
	table,
	td,
	tr,
};
