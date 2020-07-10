import {
	ComponentOptions,
	Controller,
	RenderChildren,
	button,
	div,
	kbd,
	p,
	render,
} from './tizi.js';

export interface SourceSelectionController extends Controller {
	hidden: boolean;
}

export interface SourceSelectionOptions extends ComponentOptions<HTMLDivElement, SourceSelectionController> {
	onSelectSource(source: string): void;
}

export default function SourceSelection (options: SourceSelectionOptions, children?: RenderChildren) {
	const {
		onSelectSource,
		ref,
		...elementOptions
	} = options;

	const element = div({ ...elementOptions, class: 'sourceSelection' }, [
		button({ 'data-source': 'G', class: 'source' }, 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ'),
		button({ 'data-source': 'D', class: 'source' }, 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ'),
		p([ 'Choose what you want to read; while reading press ', kbd('h'), ' for help' ]),
	]);

	function onClick (event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (target.dataset.source) {
			onSelectSource && onSelectSource(target.dataset.source);
		}
	}

	element.addEventListener('click', onClick);

	render(element, options, children, {
		destroy () {
			element.removeEventListener('click', onClick);
			element.remove();
		},

		get hidden () {
			return element.hidden;
		},

		set hidden (value: boolean) {
			element.hidden = value;
		},
	});

	return element;
}
