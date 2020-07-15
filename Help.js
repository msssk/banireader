import { adjustLightness, getLightnessRange } from './util/color.js';
import { defaultColors } from './Config.js';
import { createRef, render, br, button, div, hr, input, kbd, label, table, td, tr, } from './tizi.js';
function noop() { }
export default function Help(options, children) {
    const { config, onChangeBackgroundColor = noop, onChangeTextColor = noop, onChangeVisraamColor = noop, onChangeVisraamColorYamki = noop, onGotoPage = noop, onToggleVisraam = noop, ref, ...elementOptions } = options;
    const refs = {
        darknessRangeInput: createRef(),
        textColorInput: createRef(),
        backgroundColorInput: createRef(),
        visraamColorInput: createRef(),
        visraamColorYamkiInput: createRef(),
        visraamCheckbox: createRef(),
        resetButton: createRef(),
        saveColorsButton: createRef(),
        gotoPageInput: createRef(),
    };
    const initialColors = {
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
        visraamColor: config.visraamColor,
        visraamColorYamki: config.visraamColorYamki,
    };
    const lightnessRange = getLightnessRange([
        config.backgroundColor,
        config.textColor,
        config.visraamColor,
        config.visraamColorYamki,
    ]);
    const rangeOptions = {
        min: 0,
        max: lightnessRange.min + (100 - lightnessRange.max),
        value: lightnessRange.min,
    };
    rangeOptions.step = rangeOptions.max / 100;
    function onInput(event) {
        const target = event.target;
        if (target === refs.textColorInput.node) {
            onChangeTextColor(refs.textColorInput.value);
        }
        else if (target === refs.backgroundColorInput.node) {
            onChangeBackgroundColor(refs.backgroundColorInput.value);
        }
        else if (target === refs.visraamColorInput.node) {
            onChangeVisraamColor(refs.visraamColorInput.value);
        }
        else if (target === refs.visraamColorYamkiInput.node) {
            onChangeVisraamColorYamki(refs.visraamColorYamkiInput.value);
        }
        else if (target === refs.darknessRangeInput.node) {
            const lightnessDelta = refs.darknessRangeInput.valueAsNumber - lightnessRange.min;
            onChangeBackgroundColor(adjustLightness(initialColors.backgroundColor, lightnessDelta));
            onChangeTextColor(adjustLightness(initialColors.textColor, lightnessDelta));
            onChangeVisraamColor(adjustLightness(initialColors.visraamColor, lightnessDelta));
            onChangeVisraamColorYamki(adjustLightness(initialColors.visraamColorYamki, lightnessDelta));
        }
    }
    function resetColors() {
        refs.backgroundColorInput.value = defaultColors.backgroundColor;
        refs.textColorInput.value = defaultColors.textColor;
        refs.visraamColorInput.value = defaultColors.visraamColor;
        refs.visraamColorYamkiInput.value = defaultColors.visraamColorYamki;
        onChangeBackgroundColor(defaultColors.backgroundColor);
        onChangeTextColor(defaultColors.textColor);
        onChangeVisraamColor(defaultColors.visraamColor);
        onChangeVisraamColorYamki(defaultColors.visraamColorYamki);
    }
    function saveColors() {
        config.backgroundColor = refs.backgroundColorInput.value;
        config.textColor = refs.textColorInput.value;
        config.visraamColor = refs.visraamColorInput.value;
        config.visraamColorYamki = refs.visraamColorYamkiInput.value;
    }
    function toggleVisraam() {
        onToggleVisraam(refs.visraamCheckbox.checked);
    }
    function onClickGotoPage() {
        const page = parseInt(refs.gotoPageInput.value, 10);
        onGotoPage(page);
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
        div({ class: 'column' }, [
            div({ class: 'row' }, [
                'Dark',
                input({
                    ref: refs.darknessRangeInput,
                    type: 'range',
                    class: 'darknessRangeInput',
                    ...rangeOptions,
                }),
                'Light',
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
