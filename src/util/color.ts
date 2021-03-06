import { hexToLch, lchToHex } from './lch.js';

export function getLightnessRange (colors: string[]) {
	const lchColors = colors.map(hexToLch);
	const lightnessValues = lchColors.map(x => x.lightness);
	const min = Math.min(...lightnessValues);
	const max = Math.max(...lightnessValues);

	return {
		min,
		max,
	};
}

export function adjustLightness (color: string, value: number) {
	const lchColor = hexToLch(color);
	lchColor.lightness += value;

	return lchToHex(lchColor.lightness, lchColor.chroma, lchColor.hue);
}
