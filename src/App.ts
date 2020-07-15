import createConfig from './Config.js';
import Help, { HelpController } from './Help.js';
import Reader, { ReaderController } from './Reader.js';
import { createComponentRef } from './tizi.js';
import SourceSelection, { SourceSelectionController } from './SourceSelection.js';

export const enum CssCustomProps {
	BackgroundColor = '--background-color',
	TextColor = '--text-color',
	VisraamColorMain = '--visraam-color-main',
	VisraamColorYamki = '--visraam-color-yamki',
	PrimaryFontSize = '--primary-font-size',
	PrimaryLineHeight = '--primary-line-height'
}
const CSS_LINE_HEIGHT = 1.5;

function getFontSize () {
	return parseInt(
		getComputedStyle(document.documentElement).getPropertyValue(CssCustomProps.PrimaryFontSize),
		10
	);
}

export default function App () {
	const config = createConfig({ storageKey: 'banireader' });
	const sourceSelection = createComponentRef<ReturnType<typeof SourceSelection>, SourceSelectionController>();
	const help = createComponentRef<ReturnType<typeof Help>, HelpController>();
	const reader = createComponentRef<ReturnType<typeof Reader>, ReaderController>();

	function onSelectSource (source: string) {
		config.source = source;
		if (config.fontSize) {
			setFontSize(config.fontSize);
		}
		sourceSelection.hidden = true;
		toggleCursor(false);
		reader.hidden = false;
		reader.render();
	}

	document.body.appendChild(SourceSelection({ ref: sourceSelection, onSelectSource }));

	requestAnimationFrame(function () {
		document.body.appendChild(Reader({
			config,
			hidden: true,
			ref: reader,
		}));

		document.body.appendChild(Help({
			config,
			hidden: true,
			ref: help,
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
			onGotoPage (page) {
				help.hidden = true;
				reader.gotoPage(page);
			},
			onToggleVisraam (value) {
				config.showVisraam = value;
				reader.showVisraam = value;
			},
		}));

		document.body.addEventListener('keyup', onKeyUp);
	});

	function onKeyUp (event: KeyboardEvent) {
		if (event.key === 'h') {
			if (reader.hidden === false) {
				toggleHelp();
			}
		}
		else if (event.key === '-') {
			setFontSize(getFontSize() - 2);
		}
		else if (event.key === '+' || event.key === '=') {
			setFontSize(getFontSize() + 2);
		}
	}

	/**
	 * Toggle mouse cursor visibility.
	 * @param force - if true cursor will be visible, if false cursor will be hidden
	 */
	function toggleCursor (force?: boolean) {
		document.body.classList.toggle('nocursor', !force);
	}

	function toggleHelp () {
		toggleCursor(help.hidden);
		help.hidden = !help.hidden;
	}

	function setFontSize (size: number) {
		const { style } = document.documentElement;
		style.setProperty(CssCustomProps.PrimaryFontSize, `${size}px`);
		style.setProperty(CssCustomProps.PrimaryLineHeight, `${Math.floor(size * CSS_LINE_HEIGHT)}px`);
		config.fontSize = size;
	}
}
