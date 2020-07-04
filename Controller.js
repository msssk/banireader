import { Config } from './Config.js';
import { Reader } from './Reader.js';
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
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--primary-font-size"), 10);
}
export class Controller {
    constructor() {
        this._onClick = (event) => {
            const element = event.target;
            if (element.id === 'source_G' || element.id === 'source_D') {
                document.getElementById('start').style.display = 'none';
                const source = element.id.replace('source_', '');
                this.config = new Config({ source, storageKey: 'banireader' });
                if (this.config.fontSize) {
                    this.setFontSize(this.config.fontSize);
                }
                if (this.config.showVisraam) {
                    document.getElementById('visraamCheckbox').checked = true;
                }
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
                this.config.showVisraam = element.checked;
                this.reader.showVisraam(this.config.showVisraam);
            }
        };
        this._onKeyUp = (event) => {
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
            else if (previousKeys.has(event.key)) {
                this.reader.gotoPreviousPage();
            }
        };
    }
    start() {
        this.helpNode = document.getElementById('help');
        this.gotoPageInput = document.getElementById('gotoPage');
        this.gotoPageButton = document.getElementById('gotoPageButton');
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('click', this._onClick);
    }
    setFontSize(size) {
        const { style } = document.documentElement;
        style.setProperty("--primary-font-size", `${size}px`);
        style.setProperty("--primary-line-height", `${Math.floor(size * CSS_LINE_HEIGHT)}px`);
        this.config.fontSize = size;
    }
    toggleHelp() {
        this.helpNode.hidden = !this.helpNode.hidden;
        if (this.helpNode.hidden) {
            document.body.classList.add('nocursor');
        }
        else {
            document.body.classList.remove('nocursor');
            this.gotoPageInput.focus();
        }
    }
}
