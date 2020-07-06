import {
	ComponentOptions,
	Controller,
	button,
	div,
	kbd,
	p,
} from './tizi.js';

export interface SourceSelectionController extends Controller {
	hide(): void;
	show(): void;
}

export interface SourceSelectionOptions extends ComponentOptions<HTMLDivElement, SourceSelectionController> {
	onSelectSource(source: string): void;
}

export default function SourceSelection (options: SourceSelectionOptions) {
	const {
		onSelectSource,
		ref,
		...elementOptions
	} = options;

	const element = div({ ...elementOptions, className: 'sourceSelection' }, [
		button({ 'data-source': 'G', className: 'source' }, 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ'),
		button({ 'data-source': 'D', className: 'source' }, 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ'),
		p([ 'Choose what you want to read; while reading press ', kbd('h'), ' for help' ]),
	]);

	function onClick (event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (target.dataset.source) {
			onSelectSource && onSelectSource(target.dataset.source);
		}
	}

	element.addEventListener('click', onClick);

	if (ref) {
		ref.control(element, {
			destroy () {
				element.removeEventListener('click', onClick);
				element.remove();
			},

			hide () {
				element.hidden = true;
			},

			show () {
				element.hidden = false;
			},
		});
	}

	return element;
}
