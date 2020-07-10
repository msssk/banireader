import { button, div, kbd, p, render, } from './tizi.js';
export default function SourceSelection(options, children) {
    const { onSelectSource, ref, ...elementOptions } = options;
    const element = div({ ...elementOptions, class: 'sourceSelection' }, [
        button({ 'data-source': 'G', class: 'source' }, 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ'),
        button({ 'data-source': 'D', class: 'source' }, 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ'),
        p(['Choose what you want to read; while reading press ', kbd('h'), ' for help']),
    ]);
    function onClick(event) {
        const target = event.target;
        if (target.dataset.source) {
            onSelectSource && onSelectSource(target.dataset.source);
        }
    }
    element.addEventListener('click', onClick);
    render(element, options, children, {
        destroy() {
            element.removeEventListener('click', onClick);
            element.remove();
        },
        get hidden() {
            return element.hidden;
        },
        set hidden(value) {
            element.hidden = value;
        },
    });
    return element;
}
