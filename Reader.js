import { createRef, render, main, section, } from './tizi.js';
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
        isNavigating = true;
        const previousPageNode = pageNodes[config.displayedPage];
        if (config.displayedPage === 0) {
            config.displayedPage = 1;
        }
        else {
            pageNodes.push(pageNodes.shift());
            config.renderedPages.push(config.renderedPages.shift());
            config.renderedPages[2] = '';
        }
        const currentPageNode = pageNodes[config.displayedPage];
        previousPageNode.classList.remove('currentPage');
        currentPageNode.classList.add('currentPage');
        element.removeChild(previousPageNode);
        element.appendChild(currentPageNode);
        await renderPage(2);
        isNavigating = false;
    }
    function gotoPreviousPage() {
        if (isNavigating || config.displayedPage === 0) {
            return;
        }
        const currentPageNode = pageNodes[1];
        currentPageNode.classList.remove('currentPage');
        element.removeChild(currentPageNode);
        const previousPageNode = pageNodes[0];
        previousPageNode.classList.add('currentPage');
        element.appendChild(previousPageNode);
        config.displayedPage = 0;
    }
    async function renderPage(pageIndex) {
        let pageHtml = config.renderedPages[pageIndex];
        if (!pageHtml) {
            const lines = await getNextPageLines();
            pageHtml = lines.join('<wbr> ');
            config.renderedPages[pageIndex] = pageHtml;
        }
        pageNodes[pageIndex].innerHTML = pageHtml;
    }
    function reportUnsupportedBrowser() {
        element.classList.add('unsupported');
        element.innerHTML = `This browser does not have the necessary text rendering support.<br>Please try
			<a href="https://www.google.com/chrome/">Google Chrome</a>`;
    }
    async function getNextPageLines() {
        const lines = [];
        while (refs.sizingNode.offsetHeight <= element.offsetHeight) {
            let line = await getNextLine();
            if (lines.length === 0 && line.startsWith('<br>')) {
                line = line.substr(4);
            }
            lines.push(line);
            refs.sizingNode.innerHTML += ` ${line}<wbr>`;
        }
        if (refs.sizingNode.offsetHeight > element.offsetHeight) {
            config.lineCache.unshift(lines.pop());
        }
        if (refs.sizingNode.offsetWidth > element.offsetWidth) {
            reportUnsupportedBrowser();
            return [];
        }
        refs.sizingNode.innerHTML = '';
        return lines;
    }
    function parseApiLine(apiLine) {
        let line = apiLine.verse.gurmukhi;
        const visraamMap = apiLine.visraam.sttm.reduce((sum, { p, t }) => {
            sum[p] = t;
            return sum;
        }, {});
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
        if (apiLine.shabadId !== config.currentShabadId) {
            config.currentShabadId = apiLine.shabadId;
            line = `<br><center>${line}</center>`;
        }
        return line;
    }
    async function getNextLine() {
        if (!config.lineCache.length) {
            const pageInfo = await getNextPage();
            config.lineCache = pageInfo.page.map(parseApiLine);
        }
        return config.lineCache.shift();
    }
    async function getNextPage() {
        const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${config.currentPage}/${config.source}`);
        config.currentPage += 1;
        return apiResponse.json();
    }
    async function renderCurrentPage() {
        const currentPageNode = pageNodes[config.displayedPage];
        currentPageNode.classList.add('currentPage');
        element.appendChild(currentPageNode);
        for (let i = config.displayedPage; i < MAX_RENDERED_PAGES; i++) {
            await renderPage(i);
        }
    }
    async function gotoPage(pageNumber) {
        config.displayedPage = 0;
        config.lineCache = [];
        config.renderedPages = [];
        config.currentPage = pageNumber;
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
