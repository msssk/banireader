import { isContinuousShabad } from './bani.js';
import { a, br, createRef, div, render, main, section, } from './tizi.js';
const TOTAL_PAGES = {
    G: 1430,
    D: 1428,
};
const INVALID_SHABAD_ID = -1;
const MAX_RENDERED_PAGES = 3;
const nextKeys = new Set([
    'ArrowDown',
    'ArrowRight',
    'PageDown',
    ' ',
]);
const previousKeys = new Set([
    'ArrowLeft',
    'ArrowUp',
    'PageUp',
]);
function withWordBreak(sum, line, index, array) {
    if (index === array.length - 1 || line.text.endsWith('>')) {
        sum += `${line.text}`;
    }
    else {
        sum += `${line.text}<wbr> `;
    }
    return sum;
}
export default function Reader(options, children) {
    const { config, ref, ...elementOptions } = options;
    const refs = {
        main: createRef(),
        sizingNode: createRef(),
    };
    const element = main({ ref: refs.main, class: 'reader', ...elementOptions }, [
        section({ ref: refs.sizingNode, class: 'page' }),
    ]);
    const pageNodes = [];
    for (let i = 0; i < MAX_RENDERED_PAGES; i++) {
        pageNodes.push(refs.sizingNode.node.cloneNode());
    }
    render(element, options, children, {
        destroy() {
            document.body.removeEventListener('keyup', onKeyUp);
        },
        gotoPage,
        render: renderCurrentPage,
        get hidden() {
            return element.hidden;
        },
        set hidden(value) {
            element.hidden = value;
            if (value === false) {
                element.classList.toggle('visraam', Boolean(config.showVisraam));
            }
        },
        get showVisraam() {
            return element.classList.contains('visraam');
        },
        set showVisraam(value) {
            element.classList.toggle('visraam', value);
        },
    });
    let isNavigating = false;
    async function gotoNextPage() {
        if (isNavigating) {
            return;
        }
        if (!pageNodes[config.activeRenderedPage + 1].innerHTML) {
            return;
        }
        isNavigating = true;
        const previousPageNode = pageNodes[config.activeRenderedPage];
        if (config.activeRenderedPage === 0) {
            config.activeRenderedPage = 1;
        }
        else {
            pageNodes.push(pageNodes.shift());
            config.renderedPages.push(config.renderedPages.shift());
            config.renderedPages[2] = '';
        }
        const currentPageNode = pageNodes[config.activeRenderedPage];
        previousPageNode.classList.remove('currentPage');
        currentPageNode.classList.add('currentPage');
        element.removeChild(previousPageNode);
        element.appendChild(currentPageNode);
        await renderPage(2);
        isNavigating = false;
    }
    function gotoPreviousPage() {
        if (isNavigating || config.activeRenderedPage === 0) {
            return;
        }
        const currentPageNode = pageNodes[config.activeRenderedPage];
        currentPageNode.classList.remove('currentPage');
        element.removeChild(currentPageNode);
        const previousPageNode = pageNodes[0];
        previousPageNode.classList.add('currentPage');
        element.appendChild(previousPageNode);
        config.activeRenderedPage = 0;
    }
    async function renderPage(pageIndex) {
        let pageHtml = config.renderedPages[pageIndex];
        if (!pageHtml) {
            const lines = await getNextPageLines();
            if (lines.length) {
                pageHtml = lines.reduce(withWordBreak, '');
                config.renderedPages[pageIndex] = pageHtml;
            }
        }
        if (pageHtml) {
            pageNodes[pageIndex].innerHTML = pageHtml;
        }
    }
    function reportUnsupportedBrowser() {
        if (!/Chrome/.test(navigator.userAgent)) {
            element.appendChild(div({ class: 'unsupported' }, [
                'This browser does not have the necessary text rendering support.',
                br(),
                'Please try ',
                a({ href: 'https://www.google.com/chrome/' }, 'Google Chrome'),
            ]));
        }
    }
    let isFirstRender = true;
    async function getNextPageLines() {
        const lines = [];
        let line;
        do {
            line = await getNextLine();
            if (line) {
                lines.push(line);
                refs.sizingNode.innerHTML += `${line.text}<wbr> `;
            }
            if (isFirstRender && refs.sizingNode.offsetWidth > element.offsetWidth) {
                reportUnsupportedBrowser();
                return [];
            }
        } while (line && refs.sizingNode.offsetHeight <= element.offsetHeight);
        if (refs.sizingNode.offsetHeight > element.offsetHeight) {
            config.lineCache.unshift(lines.pop());
        }
        if (lines.length > 1 && lines.last.shabadId !== lines[lines.length - 2].shabadId) {
            config.lineCache.unshift(lines.pop());
        }
        isFirstRender = false;
        refs.sizingNode.innerHTML = '';
        return lines;
    }
    const IkOngkar = '<>';
    function parseApiLine(apiLine) {
        let line = apiLine.verse.gurmukhi;
        const isHeadingLine = line.startsWith(IkOngkar);
        const visraamMap = apiLine.visraam.sttm.reduce((sum, { p, t }) => {
            sum[p] = t;
            return sum;
        }, Object.create(null));
        if (Object.keys(visraamMap).length) {
            line = line.split(' ').map((word, index) => {
                if (visraamMap[index] === 'v') {
                    return `<span class="visraam-main">${word}</span><wbr>`;
                }
                else if (visraamMap[index] === 'y') {
                    return `<span class="visraam-yamki">${word}</span>`;
                }
                else {
                    return word;
                }
            }).join(' ');
        }
        if (isHeadingLine || (apiLine.shabadId !== config.currentShabadId &&
            !isContinuousShabad(config.currentShabadId, apiLine.shabadId, config.source))) {
            line = `<center>${line}</center>`;
        }
        if (config.currentShabadId !== apiLine.shabadId) {
            config.currentShabadId = apiLine.shabadId;
        }
        return {
            text: line,
            lineNo: apiLine.lineNo,
            pageNo: apiLine.pageNo,
            shabadId: apiLine.shabadId,
            verseId: apiLine.verseId,
        };
    }
    async function getNextLine() {
        if (!config.lineCache.length) {
            const pageInfo = await getNextPage();
            config.lineCache = pageInfo.page.map(parseApiLine);
        }
        return config.lineCache.shift();
    }
    async function getNextPage() {
        if (config.currentPage > TOTAL_PAGES[config.source]) {
            return Promise.resolve({ page: [] });
        }
        const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${config.currentPage}/${config.source}`);
        config.currentPage += 1;
        return apiResponse.json();
    }
    async function renderCurrentPage() {
        pageNodes.forEach(node => node.classList.remove('currentPage'));
        const currentPageNode = pageNodes[config.activeRenderedPage];
        currentPageNode.classList.add('currentPage');
        element.appendChild(currentPageNode);
        for (let i = config.activeRenderedPage; i < MAX_RENDERED_PAGES; i++) {
            await renderPage(i);
        }
    }
    async function gotoPage(pageNumber) {
        config.activeRenderedPage = 0;
        config.lineCache = [];
        config.renderedPages = [];
        config.currentPage = pageNumber;
        config.currentShabadId = INVALID_SHABAD_ID;
        renderCurrentPage();
    }
    function onKeyUp(event) {
        if (nextKeys.has(event.key)) {
            gotoNextPage();
        }
        else if (previousKeys.has(event.key)) {
            gotoPreviousPage();
        }
    }
    document.body.addEventListener('keyup', onKeyUp);
    return element;
}
