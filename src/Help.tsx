import { adjustLightness, getLightnessRange } from './util/color.js';
import { Config, defaultColors } from './Config.js';
import tizi, {
	ComponentOptions,
	Controller,
	createRef,
} from './tizi.js';

function noop () { /* do nothing */ }

export interface HelpController extends Controller<HTMLDivElement> {
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
	onGotoPage?(page: number): void;
	onTogglePageNumber?(value: boolean): void;
	onToggleVisraam?(value: boolean): void;
}

export default function Help (options: HelpOptions) {
	const {
		config,
		onChangeBackgroundColor = noop,
		onChangeTextColor = noop,
		onChangeVisraamColor = noop,
		onChangeVisraamColorYamki = noop,
		onGotoPage = noop,
		onTogglePageNumber = noop,
		onToggleVisraam = noop,
		...elementOptions
	} = options;

	const refs = {
		darknessRangeInput: createRef<HTMLInputElement>(),
		textColorInput: createRef<HTMLInputElement>(),
		backgroundColorInput: createRef<HTMLInputElement>(),
		visraamColorInput: createRef<HTMLInputElement>(),
		visraamColorYamkiInput: createRef<HTMLInputElement>(),
		visraamCheckbox: createRef<HTMLInputElement>(),
		pageNumberCheckbox: createRef<HTMLInputElement>(),
		resetButton: createRef<HTMLInputElement>(),
		saveColorsButton: createRef<HTMLInputElement>(),
		gotoPageInput: createRef<HTMLInputElement>(),
	};

	const initialColors = {
		backgroundColor: config.backgroundColor,
		textColor: config.textColor,
		visraamColor: config.visraamColor,
		visraamColorYamki: config.visraamColorYamki,
	};
	const lightnessRange = getLightnessRange([
		config.backgroundColor,
		config.textColor,
		config.visraamColor,
		config.visraamColorYamki,
	]);
	const rangeOptions: Record<string, any> = {
		min: 0,
		max: lightnessRange.min + (100 - lightnessRange.max),
		value: lightnessRange.min,
	};
	rangeOptions.step = rangeOptions.max / 100;

	function onInput (event: InputEvent) {
		const target = event.target as HTMLInputElement;

		if (target === refs.textColorInput.element) {
			onChangeTextColor(refs.textColorInput.value);
		}
		else if (target === refs.backgroundColorInput.element) {
			onChangeBackgroundColor(refs.backgroundColorInput.value);
		}
		else if (target === refs.visraamColorInput.element) {
			onChangeVisraamColor(refs.visraamColorInput.value);
		}
		else if (target === refs.visraamColorYamkiInput.element) {
			onChangeVisraamColorYamki(refs.visraamColorYamkiInput.value);
		}
		else if (target === refs.darknessRangeInput.element) {
			const lightnessDelta = refs.darknessRangeInput.valueAsNumber - lightnessRange.min;
			onChangeBackgroundColor(adjustLightness(initialColors.backgroundColor, lightnessDelta));
			onChangeTextColor(adjustLightness(initialColors.textColor, lightnessDelta));
			onChangeVisraamColor(adjustLightness(initialColors.visraamColor, lightnessDelta));
			onChangeVisraamColorYamki(adjustLightness(initialColors.visraamColorYamki, lightnessDelta));
		}
	}

	function resetColors () {
		refs.backgroundColorInput.value = defaultColors.backgroundColor;
		refs.textColorInput.value = defaultColors.textColor;
		refs.visraamColorInput.value = defaultColors.visraamColor;
		refs.visraamColorYamkiInput.value = defaultColors.visraamColorYamki;

		onChangeBackgroundColor(defaultColors.backgroundColor);
		onChangeTextColor(defaultColors.textColor);
		onChangeVisraamColor(defaultColors.visraamColor);
		onChangeVisraamColorYamki(defaultColors.visraamColorYamki);
	}

	function saveColors () {
		config.backgroundColor = refs.backgroundColorInput.value;
		config.textColor = refs.textColorInput.value;
		config.visraamColor = refs.visraamColorInput.value;
		config.visraamColorYamki = refs.visraamColorYamkiInput.value;
	}

	function toggleVisraam () {
		onToggleVisraam(refs.visraamCheckbox.checked);
	}

	function togglePageNumber () {
		onTogglePageNumber(refs.pageNumberCheckbox.checked);
	}

	function onClickGotoPage () {
		const page = parseInt(refs.gotoPageInput.value, 10);
		onGotoPage(page);
		refs.gotoPageInput.value = '';
	}

	const controller = {
		destroy () {
			this.element.removeEventListener('input', onInput);
			this.element.remove();
		},

		get hidden () {
			return this.element.hidden;
		},

		set hidden (value: boolean) {
			this.element.hidden = value;

			if (value === false) {
				refs.visraamCheckbox.checked = config.showVisraam;
				refs.pageNumberCheckbox.checked = config.showPageNumber;
				refs.gotoPageInput.placeholder = String(config.currentPage);
				refs.gotoPageInput.focus();
			}
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
	};

	return <div {...elementOptions} class="help" onInput={onInput} controller={controller}>
		<table class="infoTable">
			<tr>
				<td>Next page</td>
				<td><kbd>Space</kbd> <kbd>►</kbd> <kbd>▼</kbd> <kbd>Page Down</kbd></td>
			</tr>

			<tr>
				<td>Previous page</td>
				<td><kbd>◄</kbd> <kbd>▲</kbd> <kbd>Page Up</kbd></td>
			</tr>

			<tr>
				<td>Increase/decrease<br />font size</td>
				<td><kbd>+</kbd> / <kbd>-</kbd></td>
			</tr>
		</table>

		<div class="column">
			<div class="row">
				Dark
				<input ref={refs.darknessRangeInput} class="darknessRangeInput" type="range" {...rangeOptions} />
				Light
			</div>

			<div class="row">
				<div class="column colorControls">
					<label>
						<input ref={refs.textColorInput} type="color" value={config.textColor} />
						Text color
					</label>
					<label>
						<input ref={refs.backgroundColorInput} type="color" value={config.backgroundColor} />
						Background color
					</label>
					<label>
						<input ref={refs.visraamColorInput} type="color" value={config.visraamColor} />
						Visraam color
					</label>
					<label>
						<input ref={refs.visraamColorYamkiInput} type="color" value={config.visraamColorYamki} />
						Visraam secondary color
					</label>
				</div>

				<div class="column colorButtons">
					<button ref={refs.resetButton} class="buttonSecondary" onClick={resetColors}>Reset</button>
					<button ref={refs.saveColorsButton} onClick={saveColors}>Save</button>
				</div>
			</div>
		</div>

		<hr />

		<label>
			<input ref={refs.visraamCheckbox} type="checkbox" onClick={toggleVisraam} />
			Show visraam
		</label>

		<label>
			<input ref={refs.pageNumberCheckbox} type="checkbox" onClick={togglePageNumber} />
			Show page number
		</label>

		<div>
			<label>
				Go to page: <input ref={refs.gotoPageInput} type="number" />
				<button class="gotoPageButton" type="button" onClick={onClickGotoPage}>Go</button>
			</label>
		</div>
	</div>;
}
