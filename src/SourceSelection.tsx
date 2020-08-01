import tizi, {
	ComponentOptions,
	Controller,
	ComponentRef,
} from './tizi.js';

export interface SourceSelectionController extends Controller<HTMLDivElement> {
	hidden: boolean;
}

export interface SourceSelectionOptions extends ComponentOptions<HTMLDivElement, SourceSelectionController> {
	onSelectSource(source: string): void;
	ref: ComponentRef<SourceSelectionController>;
}

export default function SourceSelection (options: SourceSelectionOptions) {
	const {
		onSelectSource,
		...elementOptions
	} = options;

	function onClick (event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (target.dataset.source) {
			onSelectSource && onSelectSource(target.dataset.source);
		}
	}

	const controller = {
		destroy () {
			this.element.removeEventListener('click', onClick);
			this.element.remove();
		},

		get hidden () {
			return this.element.hidden;
		},

		set hidden (value: boolean) {
			this.element.hidden = value;
		},
	};

	return <div { ...elementOptions} class="sourceSelection" controller={controller} onClick={onClick}>
		<button data-source="G" class="source">ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ</button>
		<button data-source="D" class="source">ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ</button>
		<p>Choose what you want to read; while reading press <kbd>h</kbd> for help</p>
	</div>;
}
