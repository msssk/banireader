import { Reader } from './Reader';

const enum CssCustomProps {
	CurrentPageFontSize = '--current-page-font-size',
	CurrentPageLineHeight = '--current-page-line-height'
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
	'PageUp'
]);

function getFontSize () {
	return parseInt(
		getComputedStyle(document.documentElement).getPropertyValue(CssCustomProps.CurrentPageFontSize),
		10
	);
}

function setFontSize (size: number) {
	const { style } = document.documentElement;
	style.setProperty(CssCustomProps.CurrentPageFontSize, `${size}px`);
	style.setProperty(CssCustomProps.CurrentPageLineHeight, `${Math.floor(size * CSS_LINE_HEIGHT)}px`)
}


export class Controller {
	reader: Reader;

	constructor (reader: Reader) {
		this.reader = reader;
	}

	start () {
		document.addEventListener('keydown', this._onKeyDown);
	}

	private _onKeyDown = (event: KeyboardEvent) => {
		if (nextKeys.has(event.key)) {
			this.reader.gotoNextPage();
		}
		else if (event.key === '-') {
			setFontSize(getFontSize() - 2);
		}
		else if(event.key === '+' || event.key === '=') {
			setFontSize(getFontSize() + 2);
		}
		else if(previousKeys.has(event.key)) {
			this.reader.gotoPreviousPage();
		}
	}
}
