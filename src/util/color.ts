import { cssColorToLch, lchToHex } from './lch.js';

export function getLightnessRange (colors: string[]) {
	const lchColors = colors.map(cssColorToLch);
	const lightnessValues = lchColors.map(x => x.lightness);
	const min = Math.min(...lightnessValues);
	const max = Math.max(...lightnessValues);

	return {
		min,
		max,
	};
}

export function adjustLightness (color: string, value: number) {
	const lchColor = cssColorToLch(color);
	lchColor.lightness += value;

	return lchToHex(lchColor.lightness, lchColor.chroma, lchColor.hue);
}
