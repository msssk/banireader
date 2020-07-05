import {
	ComponentCreateOptions,
	Controller,
	createRef,
	br,
	button,
	div,
	hr,
	input,
	kbd,
	label,
	table,
	td,
	tr,
} from './tizi.js';

export interface HelpController extends Controller {
	backgroundColor: string;
	hidden: boolean;
	hide(): void;
	show(): void;
	textColor: string;
	visraamColor: string;
	visraamColorYamki: string;
}

export interface HelpOptions extends ComponentCreateOptions<HelpController, HTMLDivElement> {
	onChangeBackgroundColor?(value: string): void;
	onChangeTextColor?(value: string): void;
	onChangeVisraamColor?(value: string): void;
	onChangeVisraamColorYamki?(value: string): void;
}

export default function Help (options?: HelpOptions) {
	const {
		onChangeBackgroundColor,
		onChangeTextColor,
		onChangeVisraamColor,
		onChangeVisraamColorYamki,
		ref,
		...elementOptions
	} = options;

	const refs = {
		textColorInput: createRef<HTMLInputElement>(),
		backgroundColorInput: createRef<HTMLInputElement>(),
		visraamColorInput: createRef<HTMLInputElement>(),
		visraamColorYamkiInput: createRef<HTMLInputElement>(),
		visraamCheckbox: createRef<HTMLInputElement>(),
	};

	function onInput (event: InputEvent) {
		if (event.target === refs.textColorInput.e) {
			onChangeTextColor && onChangeTextColor(refs.textColorInput.e.value);
		}
		else if (event.target === refs.backgroundColorInput.e) {
			onChangeBackgroundColor && onChangeBackgroundColor(refs.backgroundColorInput.e.value);
		}
		else if (event.target === refs.visraamColorInput.e) {
			onChangeVisraamColor && onChangeVisraamColor(refs.visraamColorInput.e.value);
		}
		else if (event.target === refs.visraamColorYamkiInput.e) {
			onChangeVisraamColorYamki && onChangeVisraamColorYamki(refs.visraamColorYamkiInput.e.value);
		}
	}

	const element = div(elementOptions, [
		table({ className: 'infoTable' }, [
			tr([
				td('Next page'),
				td([
					kbd('Space'),
					' ',
					kbd('►'),
					' ',
					kbd('▼'),
					' ',
					kbd('Page Down'),
				]),
			]),
			tr([
				td('Previous page'),
				td([
					kbd('◄'),
					' ',
					kbd('▲'),
					' ',
					kbd('Page Up'),
				]),
			]),
			tr([
				td([
					'Increase/decrease',
					br(),
					'font size',
				]),
				td([
					kbd('+'),
					' / ',
					kbd('-'),
				]),
			]),
		]),

		label([
			input({ ref: refs.textColorInput, id: 'textColorInput', type: 'color' }),
			' Text color',
		]),
		label([
			input({ ref: refs.backgroundColorInput, id: 'backgroundColorInput', type: 'color' }),
			' Background color',
		]),
		label([
			input({ ref: refs.visraamColorInput, id: 'visraamColorInput', type: 'color' }),
			' Visraam color',
		]),
		label([
			input({ ref: refs.visraamColorYamkiInput, id: 'textColorInput', type: 'color' }),
			' Visraam secondary color',
		]),

		hr(),

		label([
			input({ ref: refs.visraamCheckbox, id: 'visraamCheckbox', type: 'checkbox' }),
			'Show visraam',
		]),
		div([
			label([
				'Go to page: ',
				input({ id: 'gotoPage', type: 'number' }),
			]),
			' ',
			button({ id: 'gotoPageButton', type: 'button' }, 'Go'),
		]),
	]);

	element.addEventListener('input', onInput);

	if (ref) {
		ref.control(element, {
			destroy () {
				element.removeEventListener('input', onInput);
			},

			get hidden () {
				return element.hidden;
			},

			hide () {
				element.hidden = true;
			},

			show () {
				element.hidden = false;
			},

			get textColor () {
				return refs.textColorInput.e.value;
			},

			set textColor (value: string) {
				refs.textColorInput.e.value = value;
			},

			get backgroundColor () {
				return refs.backgroundColorInput.e.value;
			},

			set backgroundColor (value: string) {
				refs.backgroundColorInput.e.value = value;
			},

			get visraamColor () {
				return refs.visraamColorInput.e.value;
			},

			set visraamColor (value: string) {
				refs.visraamColorInput.e.value = value;
			},

			get visraamColorYamki () {
				return refs.visraamColorYamkiInput.e.value;
			},

			set visraamColorYamki (value: string) {
				refs.visraamColorYamkiInput.e.value = value;
			},
		});
	}

	return element;
}
