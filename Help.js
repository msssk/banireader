import { adjustLightness, getLightnessRange } from './util/color.js';
import { defaultColors } from './Config.js';
import tizi, { createRef, } from './tizi.js';
function noop() { }
export default function Help(options) {
    const { config, onChangeBackgroundColor = noop, onChangeTextColor = noop, onChangeVisraamColor = noop, onChangeVisraamColorYamki = noop, onGotoPage = noop, onTogglePageNumber = noop, onToggleVisraam = noop, ...elementOptions } = options;
    const refs = {
        darknessRangeInput: createRef(),
        textColorInput: createRef(),
        backgroundColorInput: createRef(),
        visraamColorInput: createRef(),
        visraamColorYamkiInput: createRef(),
        visraamCheckbox: createRef(),
        pageNumberCheckbox: createRef(),
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
        if (target === refs.textColorInput.element) {
            onChangeTextColor(refs.textColorInput.value);
        }
        else if (target === refs.backgroundColorInput.element) {
            onChangeBackgroundColor(refs.backgroundColorInput.value);
        }
        else if (target === refs.visraamColorInput.element) {
            onChangeVisraamColor(refs.visraamColorInput.value);
        }
        else if (target === refs.visraamColorYamkiInput.element) {
            onChangeVisraamColorYamki(refs.visraamColorYamkiInput.value);
        }
        else if (target === refs.darknessRangeInput.element) {
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
    function togglePageNumber() {
        onTogglePageNumber(refs.pageNumberCheckbox.checked);
    }
    function onClickGotoPage() {
        const page = parseInt(refs.gotoPageInput.value, 10);
        onGotoPage(page);
        refs.gotoPageInput.value = '';
    }
    const controller = {
        destroy() {
            this.element.removeEventListener('input', onInput);
            this.element.remove();
        },
        get hidden() {
            return this.element.hidden;
        },
        set hidden(value) {
            this.element.hidden = value;
            if (value === false) {
                refs.visraamCheckbox.checked = config.showVisraam;
                refs.pageNumberCheckbox.checked = config.showPageNumber;
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
    };
    return tizi("div", { ...elementOptions, class: "help", onInput: onInput, controller: controller },
        tizi("table", { class: "infoTable" },
            tizi("tr", null,
                tizi("td", null, "Next page"),
                tizi("td", null,
                    tizi("kbd", null, "Space"),
                    " ",
                    tizi("kbd", null, "\u25BA"),
                    " ",
                    tizi("kbd", null, "\u25BC"),
                    " ",
                    tizi("kbd", null, "Page Down"))),
            tizi("tr", null,
                tizi("td", null, "Previous page"),
                tizi("td", null,
                    tizi("kbd", null, "\u25C4"),
                    " ",
                    tizi("kbd", null, "\u25B2"),
                    " ",
                    tizi("kbd", null, "Page Up"))),
            tizi("tr", null,
                tizi("td", null,
                    "Increase/decrease",
                    tizi("br", null),
                    "font size"),
                tizi("td", null,
                    tizi("kbd", null, "+"),
                    " / ",
                    tizi("kbd", null, "-")))),
        tizi("div", { class: "column" },
            tizi("div", { class: "row" },
                "Dark",
                tizi("input", { ref: refs.darknessRangeInput, class: "darknessRangeInput", type: "range", ...rangeOptions }),
                "Light"),
            tizi("div", { class: "row" },
                tizi("div", { class: "column colorControls" },
                    tizi("label", null,
                        tizi("input", { ref: refs.textColorInput, type: "color", value: config.textColor }),
                        "Text color"),
                    tizi("label", null,
                        tizi("input", { ref: refs.backgroundColorInput, type: "color", value: config.backgroundColor }),
                        "Background color"),
                    tizi("label", null,
                        tizi("input", { ref: refs.visraamColorInput, type: "color", value: config.visraamColor }),
                        "Visraam color"),
                    tizi("label", null,
                        tizi("input", { ref: refs.visraamColorYamkiInput, type: "color", value: config.visraamColorYamki }),
                        "Visraam secondary color")),
                tizi("div", { class: "column colorButtons" },
                    tizi("button", { ref: refs.resetButton, class: "buttonSecondary", onClick: resetColors }, "Reset"),
                    tizi("button", { ref: refs.saveColorsButton, onClick: saveColors }, "Save")))),
        tizi("hr", null),
        tizi("label", null,
            tizi("input", { ref: refs.visraamCheckbox, type: "checkbox", onClick: toggleVisraam }),
            "Show visraam"),
        tizi("label", null,
            tizi("input", { ref: refs.pageNumberCheckbox, type: "checkbox", onClick: togglePageNumber }),
            "Show page number"),
        tizi("div", null,
            tizi("label", null,
                "Go to page: ",
                tizi("input", { ref: refs.gotoPageInput, type: "number" }),
                tizi("button", { class: "gotoPageButton", type: "button", onClick: onClickGotoPage }, "Go"))));
}
