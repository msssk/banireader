import { Config, defaultColors } from './Config.js';
import {
	ComponentOptions,
	Controller,
	RenderChildren,
	createRef,
	render,
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

export interface HelpOptions extends ComponentOptions<HTMLDivElement, HelpController> {
	config: Config;
	onChangeBackgroundColor?(value: string): void;
	onChangeTextColor?(value: string): void;
	onChangeVisraamColor?(value: string): void;
	onChangeVisraamColorYamki?(value: string): void;
	onToggleVisraam?(value: boolean): void;
}

export default function Help (options?: HelpOptions, children?: RenderChildren) {
	const {
		config,
		onChangeBackgroundColor,
		onChangeTextColor,
		onChangeVisraamColor,
		onChangeVisraamColorYamki,
		onToggleVisraam,
		ref,
		...elementOptions
	} = options;

	const refs = {
		textColorInput: createRef<HTMLInputElement>(),
		backgroundColorInput: createRef<HTMLInputElement>(),
		visraamColorInput: createRef<HTMLInputElement>(),
		visraamColorYamkiInput: createRef<HTMLInputElement>(),
		visraamCheckbox: createRef<HTMLInputElement>(),
		resetButton: createRef<HTMLInputElement>(),
		saveColorsButton: createRef<HTMLInputElement>(),
	};

	function onInput (event: InputEvent) {
		const target = event.target as HTMLInputElement;

		if (target.id === refs.textColorInput.id) {
			onChangeTextColor && onChangeTextColor(refs.textColorInput.value);
		}
		else if (target.id === refs.backgroundColorInput.id) {
			onChangeBackgroundColor && onChangeBackgroundColor(refs.backgroundColorInput.value);
		}
		else if (target.id === refs.visraamColorInput.id) {
			onChangeVisraamColor && onChangeVisraamColor(refs.visraamColorInput.value);
		}
		else if (target.id === refs.visraamColorYamkiInput.id) {
			onChangeVisraamColorYamki && onChangeVisraamColorYamki(refs.visraamColorYamkiInput.value);
		}
	}

	function resetColors () {
		refs.backgroundColorInput.value = defaultColors.backgroundColor;
		refs.textColorInput.value = defaultColors.textColor;
		refs.visraamColorInput.value = defaultColors.visraamColor;
		refs.visraamColorYamkiInput.value = defaultColors.visraamColor;

		onChangeBackgroundColor && onChangeBackgroundColor(defaultColors.backgroundColor);
		onChangeTextColor && onChangeTextColor(defaultColors.textColor);
		onChangeVisraamColor && onChangeVisraamColor(defaultColors.visraamColor);
		onChangeVisraamColorYamki && onChangeVisraamColorYamki(defaultColors.visraamColorYamki);
	}

	function saveColors () {
		config.backgroundColor = refs.backgroundColorInput.value;
		config.textColor = refs.textColorInput.value;
		config.visraamColor = refs.visraamColorInput.value;
		config.visraamColorYamki = refs.visraamColorYamkiInput.value;
	}

	function toggleVisraam () {
		onToggleVisraam && onToggleVisraam(refs.visraamCheckbox.checked);
	}

	const element = div({ ...elementOptions, className: 'help', onInput }, [
		table({ className: 'infoTable' }, [
			tr([
				td('Next page'),
				td([ kbd('Space'), ' ', kbd('►'), ' ', kbd('▼'), ' ', kbd('Page Down') ]),
			]),
			tr([
				td('Previous page'),
				td([ kbd('◄'), ' ', kbd('▲'), ' ', kbd('Page Up') ]),
			]),
			tr([
				td([ 'Increase/decrease', br(), 'font size' ]),
				td([ kbd('+'), ' / ', kbd('-') ]),
			]),
		]),

		div({ className: 'row' }, [
			div({ className: 'column colorControls' }, [
				label([
					input({
						ref: refs.textColorInput,
						id: 'textColorInput',
						type: 'color',
						value: config.textColor,
					}),
					' Text color',
				]),
				label([
					input({
						ref: refs.backgroundColorInput,
						id: 'backgroundColorInput',
						type: 'color',
						value: config.backgroundColor,
					}),
					' Background color',
				]),
				label([
					input({
						ref: refs.visraamColorInput,
						id: 'visraamColorInput',
						type: 'color',
						value: config.visraamColor,
					}),
					' Visraam color',
				]),
				label([
					input({
						ref: refs.visraamColorYamkiInput,
						id: 'textColorInput',
						type: 'color',
						value: config.visraamColorYamki,
					}),
					' Visraam secondary color',
				]),
			]),

			div({ className: 'column colorButtons' }, [
				button({ ref: refs.resetButton, className: 'buttonSecondary', onClick: resetColors },
					'Reset'
				),
				button({ ref: refs.saveColorsButton, onClick: saveColors },
					'Save'
				),
			]),
		]),

		hr(),

		label([
			input({ ref: refs.visraamCheckbox, id: 'visraamCheckbox', type: 'checkbox', onClick: toggleVisraam }),
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

	render(element, options, children, {
		destroy () {
			element.removeEventListener('input', onInput);
			element.remove();
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
			return refs.textColorInput.value;
		},

		set textColor (value: string) {
			refs.textColorInput.value = value;
		},

		get backgroundColor () {
			return refs.backgroundColorInput.value;
		},

		set backgroundColor (value: string) {
			refs.backgroundColorInput.value = value;
		},

		get visraamColor () {
			return refs.visraamColorInput.value;
		},

		set visraamColor (value: string) {
			refs.visraamColorInput.value = value;
		},

		get visraamColorYamki () {
			return refs.visraamColorYamkiInput.value;
		},

		set visraamColorYamki (value: string) {
			refs.visraamColorYamkiInput.value = value;
		},
	});

	return element;
}
