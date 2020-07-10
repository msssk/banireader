import { defaultColors } from './Config.js';
import { createRef, render, br, button, div, hr, input, kbd, label, table, td, tr, } from './tizi.js';
export default function Help(options, children) {
    const { config, onChangeBackgroundColor, onChangeTextColor, onChangeVisraamColor, onChangeVisraamColorYamki, onGotoPage, onToggleVisraam, ref, ...elementOptions } = options;
    const refs = {
        textColorInput: createRef(),
        backgroundColorInput: createRef(),
        visraamColorInput: createRef(),
        visraamColorYamkiInput: createRef(),
        visraamCheckbox: createRef(),
        resetButton: createRef(),
        saveColorsButton: createRef(),
        gotoPageInput: createRef(),
    };
    function onInput(event) {
        const target = event.target;
        if (target === refs.textColorInput.node) {
            onChangeTextColor && onChangeTextColor(refs.textColorInput.value);
        }
        else if (target === refs.backgroundColorInput.node) {
            onChangeBackgroundColor && onChangeBackgroundColor(refs.backgroundColorInput.value);
        }
        else if (target === refs.visraamColorInput.node) {
            onChangeVisraamColor && onChangeVisraamColor(refs.visraamColorInput.value);
        }
        else if (target === refs.visraamColorYamkiInput.node) {
            onChangeVisraamColorYamki && onChangeVisraamColorYamki(refs.visraamColorYamkiInput.value);
        }
    }
    function resetColors() {
        refs.backgroundColorInput.value = defaultColors.backgroundColor;
        refs.textColorInput.value = defaultColors.textColor;
        refs.visraamColorInput.value = defaultColors.visraamColor;
        refs.visraamColorYamkiInput.value = defaultColors.visraamColor;
        onChangeBackgroundColor && onChangeBackgroundColor(defaultColors.backgroundColor);
        onChangeTextColor && onChangeTextColor(defaultColors.textColor);
        onChangeVisraamColor && onChangeVisraamColor(defaultColors.visraamColor);
        onChangeVisraamColorYamki && onChangeVisraamColorYamki(defaultColors.visraamColorYamki);
    }
    function saveColors() {
        config.backgroundColor = refs.backgroundColorInput.value;
        config.textColor = refs.textColorInput.value;
        config.visraamColor = refs.visraamColorInput.value;
        config.visraamColorYamki = refs.visraamColorYamkiInput.value;
    }
    function toggleVisraam() {
        onToggleVisraam && onToggleVisraam(refs.visraamCheckbox.checked);
    }
    function onClickGotoPage() {
        const page = parseInt(refs.gotoPageInput.value, 10);
        onGotoPage && onGotoPage(page);
        refs.gotoPageInput.value = '';
    }
    const element = div({ ...elementOptions, class: 'help', onInput }, [
        table({ class: 'infoTable' }, [
            tr([
                td('Next page'),
                td([kbd('Space'), ' ', kbd('►'), ' ', kbd('▼'), ' ', kbd('Page Down')]),
            ]),
            tr([
                td('Previous page'),
                td([kbd('◄'), ' ', kbd('▲'), ' ', kbd('Page Up')]),
            ]),
            tr([
                td(['Increase/decrease', br(), 'font size']),
                td([kbd('+'), ' / ', kbd('-')]),
            ]),
        ]),
        div({ class: 'row' }, [
            div({ class: 'column colorControls' }, [
                label([
                    input({
                        ref: refs.textColorInput,
                        type: 'color',
                        value: config.textColor,
                    }),
                    ' Text color',
                ]),
                label([
                    input({
                        ref: refs.backgroundColorInput,
                        type: 'color',
                        value: config.backgroundColor,
                    }),
                    ' Background color',
                ]),
                label([
                    input({
                        ref: refs.visraamColorInput,
                        type: 'color',
                        value: config.visraamColor,
                    }),
                    ' Visraam color',
                ]),
                label([
                    input({
                        ref: refs.visraamColorYamkiInput,
                        type: 'color',
                        value: config.visraamColorYamki,
                    }),
                    ' Visraam secondary color',
                ]),
            ]),
            div({ class: 'column colorButtons' }, [
                button({ ref: refs.resetButton, class: 'buttonSecondary', onClick: resetColors }, 'Reset'),
                button({ ref: refs.saveColorsButton, onClick: saveColors }, 'Save'),
            ]),
        ]),
        hr(),
        label([
            input({ ref: refs.visraamCheckbox, type: 'checkbox', onClick: toggleVisraam }),
            'Show visraam',
        ]),
        div([
            label([
                'Go to page: ',
                input({ ref: refs.gotoPageInput, type: 'number' }),
            ]),
            ' ',
            button({ type: 'button', onClick: onClickGotoPage }, 'Go'),
        ]),
    ]);
    render(element, options, children, {
        destroy() {
            element.removeEventListener('input', onInput);
            element.remove();
        },
        get hidden() {
            return element.hidden;
        },
        set hidden(value) {
            element.hidden = value;
            if (value === false) {
                refs.visraamCheckbox.checked = Boolean(config.showVisraam);
                refs.gotoPageInput.placeholder = String(config.currentPage);
                refs.gotoPageInput.focus();
            }
        },
        get textColor() {
            return refs.textColorInput.value;
        },
        set textColor(value) {
            refs.textColorInput.value = value;
        },
        get backgroundColor() {
            return refs.backgroundColorInput.value;
        },
        set backgroundColor(value) {
            refs.backgroundColorInput.value = value;
        },
        get visraamColor() {
            return refs.visraamColorInput.value;
        },
        set visraamColor(value) {
            refs.visraamColorInput.value = value;
        },
        get visraamColorYamki() {
            return refs.visraamColorYamkiInput.value;
        },
        set visraamColorYamki(value) {
            refs.visraamColorYamkiInput.value = value;
        },
    });
    return element;
}
