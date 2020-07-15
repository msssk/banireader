import { LCH_to_sRGB, sRGB_to_LCH } from '../lib/css-color-4/utilities.js';

const MAX_PERCENT = 100;

export function lchToSrgb (l: number, c: number, h:number, alpha = MAX_PERCENT) {
	[ l, c, h ] = forceIntoGamut(l, c, h);

	return 'rgb(' + LCH_to_sRGB([ Number(l), Number(c), Number(h) ]).map(function (x: number) {
		return String(Math.round(x * 10000) / 100) + '%';
	}).join(' ') + alphaToString(alpha) + ')';
}

export function lchToHex (l: number, c: number, h: number) {
	[ l, c, h ] = forceIntoGamut(l, c, h);

	return '#' + LCH_to_sRGB([ Number(l), Number(c), Number(h) ]).reduce(function (sum: string, color: number) {
		sum += Math.round(color * 255).toString(16).padStart(2, '0');

		return sum;
	}, '');
}

export function cssColorToLch (cssColorString: string) {
	if (!cssColorString) {
		return;
	}

	const node = document.createElement('span');
	document.body.appendChild(node);
	node.style.color = cssColorString;
	const computedColor = getComputedStyle(node).color;
	node.remove();
	let params = computedColor.match(/-?[\d.]+/g).map(x => Number(x));

	params = params.map((x, i) => i < 3 ? x / 255 : x);
	const lch = sRGB_to_LCH(params.slice(0, 3));

	return {
		lightness: lch[0],
		chroma: lch[1],
		hue: lch[2],
		alpha: (params[3] || 1) * 100,
	};
}

function alphaToString (a = MAX_PERCENT) {
	return (a < MAX_PERCENT ? ` / ${a}%` : '');
}

function forceIntoGamut (l: number, c: number, h: number) {
	// Moves an lch color into the sRGB gamut
	// by holding the l and h steady,
	// and adjusting the c via binary-search
	// until the color is on the sRGB boundary.
	if (isLchWithinSrgb(l, c, h)) {
		return [ l, c, h ];
	}

	let hiC = c;
	let loC = 0;
	const acceptableVariance = 0.0001;
	c /= 2;

	while (hiC - loC > acceptableVariance) {
		if (isLchWithinSrgb(l, c, h)) {
			loC = c;
		}
		else {
			hiC = c;
		}
		c = (hiC + loC) / 2;
	}

	return [ l, c, h ];
}

function isLchWithinSrgb (l: number, c: number, h: number): boolean {
	const rgb = LCH_to_sRGB([ Number(l), Number(c), Number(h) ]);
	const acceptableVariance = 0.000005;

	return rgb.reduce(function (a: boolean, b: number) {
		return a && b >= (0 - acceptableVariance) && b <= (1 + acceptableVariance);
	}, true);
}
