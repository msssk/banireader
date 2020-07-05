import { BaniSourceData } from './interfaces.d';
import { Config } from './Config.js';
import Help, { HelpController } from './Help.js';
import { Reader } from './Reader.js';
import { createComponentRef } from './tizi.js';

const enum CssCustomProps {
	BackgroundColor = '--background-color',
	TextColor = '--text-color',
	VisraamColorMain = '--visraam-color-main',
	VisraamColorYamki = '--visraam-color-yamki',
	PrimaryFontSize = '--primary-font-size',
	PrimaryLineHeight = '--primary-line-height'
}
const CSS_LINE_HEIGHT = 1.5;

const nextKeys = new Set([
	'ArrowDown',
	'ArrowRight',
	'PageDown',
	' ',
]);

const previousKeys = new Set([
	'ArrowLeft',
	'ArrowUp',
	'PageUp',
]);

function getFontSize () {
	return parseInt(
		getComputedStyle(document.documentElement).getPropertyValue(CssCustomProps.PrimaryFontSize),
		10
	);
}

export class Controller {
	config: BaniSourceData;
	gotoPageButton: HTMLButtonElement;
	gotoPageInput: HTMLInputElement;
	help: any;
	reader: Reader;

	start (): void {
		// @ts-ignore: TODO: fix typing
		this.help = createComponentRef<HelpController, typeof Help>();
		document.getElementById('help').replaceWith(Help({
			id: 'help',
			hidden: true,
			onChangeTextColor (value) {
				document.documentElement.style.setProperty(CssCustomProps.TextColor, value);
			},
			onChangeBackgroundColor (value) {
				document.documentElement.style.setProperty(CssCustomProps.BackgroundColor, value);
			},
			onChangeVisraamColor (value) {
				document.documentElement.style.setProperty(CssCustomProps.VisraamColorMain, value);
			},
			onChangeVisraamColorYamki (value) {
				document.documentElement.style.setProperty(CssCustomProps.VisraamColorYamki, value);
			},
			ref: this.help,
		}));
		this.gotoPageInput = document.getElementById('gotoPage') as HTMLInputElement;
		this.gotoPageButton = document.getElementById('gotoPageButton') as HTMLButtonElement;

		document.addEventListener('keyup', this._onKeyUp);
		document.addEventListener('click', this._onClick);
	}

	setFontSize (size: number) {
		const { style } = document.documentElement;
		style.setProperty(CssCustomProps.PrimaryFontSize, `${size}px`);
		style.setProperty(CssCustomProps.PrimaryLineHeight, `${Math.floor(size * CSS_LINE_HEIGHT)}px`)
		this.config.fontSize = size;
	}

	/**
	 * Toggle mouse cursor visibility.
	 * @param force - if true cursor will be visible, if false cursor will be hidden
	 */
	toggleCursor (force?: boolean) {
		document.body.classList.toggle('nocursor', !force);
	}

	toggleHelp () {
		this.toggleCursor(this.help.hidden);
		if (this.help.hidden) {
			this.help.show();
		}
		else {
			this.help.hide();
		}

		if (!this.help.hidden) {
			this.gotoPageInput.focus();

			const style = getComputedStyle(document.documentElement);
			const textColor = style.getPropertyValue(CssCustomProps.TextColor);
			const backgroundColor = style.getPropertyValue(CssCustomProps.BackgroundColor);
			const visraamColor = style.getPropertyValue(CssCustomProps.VisraamColorMain);
			const visraamColorYamki = style.getPropertyValue(CssCustomProps.VisraamColorYamki);
			this.help.textColor = textColor.trim();
			this.help.backgroundColor = backgroundColor.trim();
			this.help.visraamColor = visraamColor.trim();
			this.help.visraamColorYamki = visraamColorYamki.trim();
		}
	}

	protected _onClick = (event: MouseEvent) => {
		const element = event.target as HTMLElement;

		if (element.id === 'source_G' || element.id === 'source_D') {
			document.getElementById('start').style.display = 'none';

			const source = element.id.replace('source_', '');
			this.config = new Config({ source, storageKey: 'banireader' });

			if (this.config.fontSize) {
				this.setFontSize(this.config.fontSize);
			}

			if (this.config.showVisraam) {
				(document.getElementById('visraamCheckbox') as HTMLInputElement).checked = true;
			}

			this.toggleCursor(false);
			this.reader = new Reader(document.getElementById('main'), { config: this.config });
			this.reader.render();
		}
		else if (element.id === 'gotoPageButton') {
			const pageNumber = parseInt(this.gotoPageInput.value, 10);
			if (!isNaN(pageNumber)) {
				this.reader.gotoPage(pageNumber);
				this.toggleHelp();
			}
		}
		else if (element.id === 'visraamCheckbox') {
			this.config.showVisraam = (element as HTMLInputElement).checked;
			this.reader.showVisraam(this.config.showVisraam);
		}
	};

	protected _onKeyUp = (event: KeyboardEvent) => {
		if (nextKeys.has(event.key)) {
			this.reader.gotoNextPage();
		}
		else if (event.key === '-') {
			this.setFontSize(getFontSize() - 2);
		}
		else if (event.key === '+' || event.key === '=') {
			this.setFontSize(getFontSize() + 2);
		}
		else if (event.key === 'h') {
			if (this.reader) {
				this.toggleHelp();
			}
		}
		else if(previousKeys.has(event.key)) {
			this.reader.gotoPreviousPage();
		}
	};
}
