import tizi from './tizi.js';
export default function SourceSelection(options) {
    const { onSelectSource, ...elementOptions } = options;
    function onClick(event) {
        const target = event.target;
        if (target.dataset.source) {
            onSelectSource && onSelectSource(target.dataset.source);
        }
    }
    const controller = {
        destroy() {
            this.element.removeEventListener('click', onClick);
            this.element.remove();
        },
        get hidden() {
            return this.element.hidden;
        },
        set hidden(value) {
            this.element.hidden = value;
        },
    };
    return tizi("div", { ...elementOptions, class: "sourceSelection", controller: controller, onClick: onClick },
        tizi("button", { "data-source": "G", class: "source" }, "\u0A38\u0A4D\u0A30\u0A40 \u0A17\u0A41\u0A30\u0A42 \u0A17\u0A4D\u0A30\u0A70\u0A25 \u0A38\u0A3E\u0A39\u0A3F\u0A2C \u0A1C\u0A40"),
        tizi("button", { "data-source": "D", class: "source" }, "\u0A38\u0A4D\u0A30\u0A40 \u0A26\u0A38\u0A2E \u0A17\u0A4D\u0A30\u0A70\u0A25 \u0A38\u0A3E\u0A39\u0A3F\u0A2C \u0A1C\u0A40"),
        tizi("p", null,
            "Choose what you want to read; while reading press ",
            tizi("kbd", null, "h"),
            " for help"));
}
