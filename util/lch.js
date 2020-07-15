import { LCH_to_sRGB, sRGB_to_LCH } from '../lib/css-color-4/utilities.js';
const MAX_PERCENT = 100;
export function lchToSrgb(l, c, h, alpha = MAX_PERCENT) {
    [l, c, h] = forceIntoGamut(l, c, h);
    return 'rgb(' + LCH_to_sRGB([Number(l), Number(c), Number(h)]).map(function (x) {
        return String(Math.round(x * 10000) / 100) + '%';
    }).join(' ') + alphaToString(alpha) + ')';
}
export function lchToHex(l, c, h) {
    [l, c, h] = forceIntoGamut(l, c, h);
    return '#' + LCH_to_sRGB([Number(l), Number(c), Number(h)]).reduce(function (sum, color) {
        sum += Math.round(color * 255).toString(16).padStart(2, '0');
        return sum;
    }, '');
}
export function hexToLch(hexColorString) {
    const red = parseInt(hexColorString.slice(1, 3), 16);
    const green = parseInt(hexColorString.slice(3, 5), 16);
    const blue = parseInt(hexColorString.slice(5, 7), 16);
    const lch = sRGB_to_LCH([red / 255, green / 255, blue / 255]);
    return {
        lightness: lch[0],
        chroma: lch[1],
        hue: lch[2],
    };
}
export function cssColorToLch(cssColorString) {
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
function alphaToString(a = MAX_PERCENT) {
    return (a < MAX_PERCENT ? ` / ${a}%` : '');
}
function forceIntoGamut(l, c, h) {
    if (isLchWithinSrgb(l, c, h)) {
        return [l, c, h];
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
    return [l, c, h];
}
function isLchWithinSrgb(l, c, h) {
    const rgb = LCH_to_sRGB([Number(l), Number(c), Number(h)]);
    const acceptableVariance = 0.000005;
    return rgb.reduce(function (a, b) {
        return a && b >= (0 - acceptableVariance) && b <= (1 + acceptableVariance);
    }, true);
}
