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
function getFontSize() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--current-page-font-size"), 10);
}
function setFontSize(size) {
    const { style } = document.documentElement;
    style.setProperty("--current-page-font-size", `${size}px`);
    style.setProperty("--current-page-line-height", `${Math.floor(size * CSS_LINE_HEIGHT)}px`);
}
export class Controller {
    constructor(reader) {
        this._onKeyDown = (event) => {
            if (nextKeys.has(event.key)) {
                this.reader.gotoNextPage();
            }
            else if (event.key === '-') {
                setFontSize(getFontSize() - 2);
            }
            else if (event.key === '+' || event.key === '=') {
                setFontSize(getFontSize() + 2);
            }
            else if (previousKeys.has(event.key)) {
                this.reader.gotoPreviousPage();
            }
        };
        this.reader = reader;
    }
    start() {
        document.addEventListener('keydown', this._onKeyDown);
    }
}
