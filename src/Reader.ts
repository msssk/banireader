import { ApiPageInfo, ApiPageLine } from './api.js';

function parseApiLine (this: Reader, apiLine: ApiPageLine) {
	let line = apiLine.verse.gurmukhi;
	if (apiLine.shabadId !== this.state.currentShabadId) {
		this.state.currentShabadId = apiLine.shabadId;
		line = `<br><center>${line}</center>`;
	}
	return line;
}

export interface ReaderState {
	/**
	 * Current page within the bani
	 */
	currentPage: number;

	/**
	 * Id of the last fetched shabad
	 */
	currentShabadId?: number;

	/**
	 * Index of the currently displayed page within the pageNodes array
	 */
	displayedPage: 0 | 1;

	/**
	 * Guard to prevent further navigation while navigation is in progress
	 */
	isNavigating: boolean;

	/**
	 * Cache of fetched but not yet rendered lines
	 */
	lineCache: string[];

	/**
	 * Inner HTML of currently rendered pages
	 */
	renderedPages: string[];
}

export class Reader {
	protected _pageNodes: HTMLElement[];
	protected _rootNode: HTMLElement;
	protected _sizingNode: HTMLElement;

	storageKey = 'banireader';

	state = {
		currentPage: 1,
		currentShabadId: undefined,
		displayedPage: 1,
		isNavigating: false,
		lineCache: [],
		renderedPages: new Array(3),
	} as ReaderState;

	constructor (rootNode: HTMLElement) {
		this._rootNode = rootNode;
		this._pageNodes = [];

		this._sizingNode = document.createElement('section');
		this._sizingNode.className = 'page';
		rootNode.appendChild(this._sizingNode);

		this._pageNodes.push(this._sizingNode.cloneNode() as HTMLElement);
		this._pageNodes.push(this._sizingNode.cloneNode() as HTMLElement);
		this._pageNodes.push(this._sizingNode.cloneNode() as HTMLElement);

		this._loadState();
	}

	async render () {
		const currentPageNode = this._pageNodes[this.state.displayedPage];
		currentPageNode.classList.add('currentPage');
		this._rootNode.appendChild(currentPageNode);

		for (let i = this.state.displayedPage; i < this.state.renderedPages.length; i++) {
			await this._renderPage(i);
		}
	}

	async gotoNextPage () {
		if (this.state.isNavigating) {
			return;
		}

		this.state.isNavigating = true;

		const previousPageNode = this._pageNodes[this.state.displayedPage];
		if (this.state.displayedPage === 0) {
			this.state.displayedPage = 1;
		}
		else {
			this._pageNodes.push(this._pageNodes.shift());
			this.state.renderedPages.push(this.state.renderedPages.shift());
			this.state.renderedPages[2] = '';
		}
		const currentPageNode = this._pageNodes[this.state.displayedPage];

		previousPageNode.classList.remove('currentPage');
		currentPageNode.classList.add('currentPage');
		this._rootNode.removeChild(previousPageNode);
		this._rootNode.appendChild(currentPageNode);

		await this._renderPage(2);

		this.state.isNavigating = false;
	}

	gotoPreviousPage () {
		if (this.state.isNavigating || this.state.displayedPage === 0) {
			return;
		}

		const currentPageNode = this._pageNodes[1];
		currentPageNode.classList.remove('currentPage');
		this._rootNode.removeChild(currentPageNode);

		const previousPageNode = this._pageNodes[0];
		previousPageNode.classList.add('currentPage');
		this._rootNode.appendChild(previousPageNode);

		this.state.displayedPage = 0;
	}

	protected _loadState () {
		const stateJson = localStorage.getItem(this.storageKey);
		Object.assign(this.state, JSON.parse(stateJson));
	}

	protected _saveState () {
		requestAnimationFrame(() => {
			const stateJson = JSON.stringify(this.state);
			localStorage.setItem(this.storageKey, stateJson);
		});
	}

	protected async _renderPage (pageIndex: number) {
		let pageHtml = this.state.renderedPages[pageIndex];
		if (!pageHtml) {
			const lines = await this._getNextPageLines();
			pageHtml = lines.join('<wbr> ');
			this.state.renderedPages[pageIndex] = pageHtml;
			this._saveState();
		}
		this._pageNodes[pageIndex].innerHTML = pageHtml;
	}

	protected async _getNextPageLines () {
		const lines = [];

		while(this._sizingNode.offsetHeight <= this._rootNode.offsetHeight) {
			let line = await this._getNextLine();

			// strip unnecessary <br> if a shabad break occurs at the top of a page
			if (lines.length === 0 && line.startsWith('<br>')) {
				line = line.substr(4);
			}

			lines.push(line);
			this._sizingNode.innerHTML += ` ${line}<wbr>`;
		}

		if (this._sizingNode.offsetHeight > this._rootNode.offsetHeight) {
			this.state.lineCache.unshift(lines.pop());
		}
		this._sizingNode.innerHTML = '';

		return lines;
	}

	protected async _getNextLine () {
		if (!this.state.lineCache.length) {
			const pageInfo = await this._getNextPage();
			this.state.lineCache = pageInfo.page.map(parseApiLine, this);
		}

		return this.state.lineCache.shift();
	}

	protected async _getNextPage (): Promise<ApiPageInfo> {
		const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${this.state.currentPage}/D`);
		this.state.currentPage += 1;

		return apiResponse.json();
	}
}
