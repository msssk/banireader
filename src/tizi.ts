export type Child = string | Node;

interface Component {
	<C extends Controller, E extends HTMLElement>(
		options?: ComponentCreateOptions<C, E>,
		ref?: ComponentRef<C, E>
	): E
}

export type ComponentRef<C extends Controller, E extends HTMLElement> = {
	c: C;
	e: E;
	control(element: E, controller: C): void;
	this: ComponentRef<C, E> & C;
};

export interface Controller {
	destroy?(): void;
}

export type Ref<E extends HTMLElement = HTMLElement> = {
	e: E;
};

export type CreateOptions = {
	[key: string]: any;
	ref?: Ref;
};

export type ComponentCreateOptions<C extends Controller, E extends HTMLElement> = {
	[key: string]: any;
	ref?: ComponentRef<C, E>;
};

function stringToTextNode (child: Child): Node {
	if (typeof child === 'string') {
		return document.createTextNode(child);
	}

	return child;
}

export type RenderElement = ReturnType<typeof factory>;

const emptyObject = Object.freeze(Object.create(null));

function factory<K extends keyof HTMLElementTagNameMap> (tagName: K) {
	function Render(children?: Child | Child[]): HTMLElementTagNameMap[K];
	function Render(options?: CreateOptions, children?: Child | Child[]): HTMLElementTagNameMap[K];
	function Render(options?: any, children?: any): HTMLElementTagNameMap[K] {
		if (Object.prototype.toString.apply(options) !== '[object Object]') {
			children = options as Child | Child[];
			options = emptyObject;
		}

		const {
			ref,
			...elementOptions
		} = options as CreateOptions;

		const element = document.createElement(tagName);
		Object.assign(element, elementOptions);

		if (ref) {
			ref.e = element;
		}

		if (children) {
			children = Array.isArray(children) ? children : [ children ];
			const childNodes = children.map(stringToTextNode);
			childNodes.forEach(function (child: Node) {
				element.appendChild(child);
			});
		}

		return element;
	}

	return Render;
}

export function createRef<T extends HTMLElement> (): Ref<T> {
	return Object.create(null);
}

export function createComponentRef<T, U extends Component> (): ComponentRef<T, ReturnType<U>> {
	const ref = Object.create(null); // as ComponentRef<T, ReturnType<U>>;
	Object.assign(ref, {
		control (element: ReturnType<U>, controller: T) {
			ref.e = element;
			ref.c = controller;
		},
	});

	return new Proxy(ref, {
		get (target, property: keyof T) {
			if (property === 'e' || property === 'control') {
				return target[property];
			}

			return target.c[property];
		},

		set (target, property: keyof T, value: any) {
			if (property === 'e') {
				target.e = value;
			}
			else {
				target.c[property] = value;
			}

			return true;
		},
	});
}

export const br = factory('br');
export const button = factory('button');
export const div = factory('div');
export const hr = factory('hr');
export const input = factory('input');
export const kbd = factory('kbd');
export const label = factory('label');
export const main = factory('main');
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
	span,
	table,
	td,
	tr,
};
