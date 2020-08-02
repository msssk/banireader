import createConfig from './Config.js';
import Help from './Help.js';
import Reader from './Reader.js';
import tizi, { createComponentRef } from './tizi.js';
import SourceSelection from './SourceSelection.js';
const CSS_LINE_HEIGHT = 1.5;
function getFontSize() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--primary-font-size"), 10);
}
export default function App() {
    const config = createConfig({ storageKey: 'banireader' });
    const sourceSelection = createComponentRef();
    const help = createComponentRef();
    const reader = createComponentRef();
    function onSelectSource(source) {
        config.source = source;
        if (config.fontSize) {
            setFontSize(config.fontSize);
        }
        sourceSelection.hidden = true;
        toggleCursor(false);
        reader.hidden = false;
        reader.render();
    }
    document.body.appendChild(tizi(SourceSelection, { ref: sourceSelection, onSelectSource: onSelectSource }));
    requestAnimationFrame(function () {
        document.body.appendChild(tizi(Reader, { ref: reader, config: config, hidden: true }));
        document.body.appendChild(tizi(Help, { ref: help, config: config, hidden: true, onChangeTextColor: function (value) {
                document.documentElement.style.setProperty("--text-color", value);
            }, onChangeBackgroundColor: function (value) {
                document.documentElement.style.setProperty("--background-color", value);
            }, onChangeVisraamColor: function (value) {
                document.documentElement.style.setProperty("--visraam-color-main", value);
            }, onChangeVisraamColorYamki: function (value) {
                document.documentElement.style.setProperty("--visraam-color-yamki", value);
            }, onGotoPage: function (page) {
                help.hidden = true;
                reader.gotoPage(page);
            }, onToggleVisraam: function (value) {
                config.showVisraam = value;
                reader.showVisraam = value;
            } }));
        document.body.addEventListener('keyup', onKeyUp);
    });
    function onKeyUp(event) {
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
    function toggleCursor(force) {
        document.body.classList.toggle('nocursor', !force);
    }
    function toggleHelp() {
        toggleCursor(help.hidden);
        help.hidden = !help.hidden;
    }
    function setFontSize(size) {
        const { style } = document.documentElement;
        style.setProperty("--primary-font-size", `${size}px`);
        style.setProperty("--primary-line-height", `${Math.floor(size * CSS_LINE_HEIGHT)}px`);
        config.fontSize = size;
    }
}
