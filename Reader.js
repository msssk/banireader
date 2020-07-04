const MAX_RENDERED_PAGES = 3;
function parseApiLine(apiLine) {
    let line = apiLine.verse.gurmukhi;
    if (apiLine.shabadId !== this.config.currentShabadId) {
        this.config.currentShabadId = apiLine.shabadId;
        line = `<br><center>${line}</center>`;
    }
    return line;
}
export class Reader {
    constructor(rootNode, options) {
        this.state = {
            isNavigating: false,
        };
        this._rootNode = rootNode;
        this.config = options.config;
        this._pageNodes = [];
        this._sizingNode = document.createElement('section');
        this._sizingNode.className = 'page';
        rootNode.appendChild(this._sizingNode);
        this._pageNodes.push(this._sizingNode.cloneNode());
        this._pageNodes.push(this._sizingNode.cloneNode());
        this._pageNodes.push(this._sizingNode.cloneNode());
    }
    async render() {
        const currentPageNode = this._pageNodes[this.config.displayedPage];
        currentPageNode.classList.add('currentPage');
        this._rootNode.appendChild(currentPageNode);
        for (let i = this.config.displayedPage; i < MAX_RENDERED_PAGES; i++) {
            await this._renderPage(i);
        }
    }
    async gotoPage(pageNumber) {
        this.config.renderedPages = [];
        this.config.currentPage = pageNumber;
        this.render();
    }
    async gotoNextPage() {
        if (this.state.isNavigating) {
            return;
        }
        this.state.isNavigating = true;
        const previousPageNode = this._pageNodes[this.config.displayedPage];
        if (this.config.displayedPage === 0) {
            this.config.displayedPage = 1;
        }
        else {
            this._pageNodes.push(this._pageNodes.shift());
            this.config.renderedPages.push(this.config.renderedPages.shift());
            this.config.renderedPages[2] = '';
            this.config.renderedPages = [...this.config.renderedPages];
        }
        const currentPageNode = this._pageNodes[this.config.displayedPage];
        previousPageNode.classList.remove('currentPage');
        currentPageNode.classList.add('currentPage');
        this._rootNode.removeChild(previousPageNode);
        this._rootNode.appendChild(currentPageNode);
        await this._renderPage(2);
        this.state.isNavigating = false;
    }
    gotoPreviousPage() {
        if (this.state.isNavigating || this.config.displayedPage === 0) {
            return;
        }
        const currentPageNode = this._pageNodes[1];
        currentPageNode.classList.remove('currentPage');
        this._rootNode.removeChild(currentPageNode);
        const previousPageNode = this._pageNodes[0];
        previousPageNode.classList.add('currentPage');
        this._rootNode.appendChild(previousPageNode);
        this.config.displayedPage = 0;
    }
    async _renderPage(pageIndex) {
        let pageHtml = this.config.renderedPages[pageIndex];
        if (!pageHtml) {
            const lines = await this._getNextPageLines();
            pageHtml = lines.join('<wbr> ');
            this.config.renderedPages[pageIndex] = pageHtml;
            this.config.renderedPages = [...this.config.renderedPages];
        }
        this._pageNodes[pageIndex].innerHTML = pageHtml;
    }
    async _getNextPageLines() {
        const lines = [];
        while (this._sizingNode.offsetHeight <= this._rootNode.offsetHeight) {
            let line = await this._getNextLine();
            if (lines.length === 0 && line.startsWith('<br>')) {
                line = line.substr(4);
            }
            lines.push(line);
            this._sizingNode.innerHTML += ` ${line}<wbr>`;
        }
        if (this._sizingNode.offsetHeight > this._rootNode.offsetHeight) {
            this.config.lineCache.unshift(lines.pop());
            this.config.lineCache = [...this.config.lineCache];
        }
        if (this._sizingNode.offsetWidth > this._rootNode.offsetWidth) {
            this._reportUnsupportedBrowser();
            return [];
        }
        this._sizingNode.innerHTML = '';
        return lines;
    }
    async _getNextLine() {
        if (!this.config.lineCache.length) {
            const pageInfo = await this._getNextPage();
            this.config.lineCache = pageInfo.page.map(parseApiLine, this);
        }
        const nextLine = this.config.lineCache.shift();
        this.config.lineCache = [...this.config.lineCache];
        return nextLine;
    }
    async _getNextPage() {
        const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${this.config.currentPage}/${this.config.source}`);
        this.config.currentPage += 1;
        return apiResponse.json();
    }
    _reportUnsupportedBrowser() {
        this._rootNode.classList.add('unsupported');
        this._rootNode.innerHTML = `This browser does not have the necessary text rendering support.<br>Please try
			<a href="https://www.google.com/chrome/">Google Chrome</a>`;
    }
}
