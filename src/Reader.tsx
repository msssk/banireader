import { ApiPageInfo, ApiPageLine, BaniLine } from './interfaces.d';
import { isContinuousShabad } from './bani.js';
import { Config } from './Config.js';
import tizi, {
	ComponentOptions,
	Controller,
	createRef,
} from './tizi.js';

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

function getPageSeparatorHtml (pageNumber: number) {
	return `<div class="pageSeparator" data-page-number="${pageNumber}"></div>`;
}

/**
 * Insert space between lines, excepting heading lines (intended as array reducer)
 */
function withSpace (sum: string, line: BaniLine, index: number, array: BaniLine[]) {
	if (line.isPageSeparator) {
		sum += getPageSeparatorHtml(line.pageNo);
	}
	else if (index === array.length - 1 || line.isHeading) {
		sum += line.text;
	}
	else {
		sum += `${line.text} `;
	}

	return sum;
}

export interface ReaderController extends Controller<HTMLElement> {
	gotoPage (page: number): void;
	hidden: boolean;
	render (): Promise<void>;
	showPageNumber: boolean;
	showVisraam: boolean;
}

export interface ReaderOptions extends ComponentOptions<HTMLElement, ReaderController> {
	config: Config;
}

export default function Reader (options: ReaderOptions) {
	const {
		config,
		...elementOptions
	} = options;
	const refs = {
		sizingNode: createRef<HTMLElement>(),
	};

	const controller = {
		destroy () {
			document.body.removeEventListener('keyup', onKeyUp);
		},

		gotoPage,

		render: renderCurrentPage,

		get hidden () {
			return this.element.hidden;
		},

		set hidden (value: boolean) {
			this.element.hidden = value;

			if (value === false) {
				this.element.classList.toggle('showPageNumber', config.showPageNumber);
				this.element.classList.toggle('visraam', config.showVisraam);
			}
		},

		get showPageNumber () {
			return this.element.classList.contains('showPageNumber');
		},

		set showPageNumber (value: boolean) {
			this.element.classList.toggle('showPageNumber', value);
		},

		get showVisraam () {
			return this.element.classList.contains('visraam');
		},

		set showVisraam (value: boolean) {
			this.element.classList.toggle('visraam', value);
		},
	};

	const element = <main {...elementOptions} controller={controller} class="reader">
		<section ref={refs.sizingNode} class="page" />
	</main>;

	/**
	 * The currently rendered pages. There are up to MAX_RENDERED_PAGES. `renderPage` will keep up to 2 pages ahead
	 * pre-rendered for quick navigation. Navigation one page backwards can be done, but no more than 1.
	 */
	const pageNodes: HTMLElement[] = [];
	for (let i = 0; i < MAX_RENDERED_PAGES; i++) {
		pageNodes.push(refs.sizingNode.element.cloneNode() as HTMLElement);
	}

	// Guard to prevent further navigation while navigation is in progress
	let isNavigating = false;
	async function gotoNextPage () {
		if (isNavigating) {
			return;
		}

		// If the following page is empty then we are at the last page
		if (!pageNodes[config.activeRenderedPage + 1].innerHTML) {
			return;
		}

		isNavigating = true;

		const previousPageNode = pageNodes[config.activeRenderedPage];
		// activeRenderedPage is always either the first or the second of the 3 rendered pages.
		// Moving from 1st to 2nd we simply update the index, but moving from 2nd to 3rd (the `else` clause)
		// we rotate the array `renderedPages` around so that we end up staying in the 2nd page
		// and we pre-render the following page
		if (config.activeRenderedPage === 0) {
			config.activeRenderedPage = 1;
		}
		else {
			pageNodes.first.innerHTML = '';
			pageNodes.push(pageNodes.shift());
			config.renderedPages.shift();
			config.renderedPages.push('');
		}
		const currentPageNode = pageNodes[config.activeRenderedPage];

		previousPageNode.classList.remove('currentPage');
		currentPageNode.classList.add('currentPage');
		element.removeChild(previousPageNode);
		element.appendChild(currentPageNode);

		await renderPage(2);

		isNavigating = false;
	}

	function gotoPreviousPage () {
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

	/**
	 * Render the specified page. Lines will be read from the cache or fetched as necessary.
	 * @param pageIndex Index of the node within `pageNodes` to render
	 */
	async function renderPage (pageIndex: number) {
		let pageHtml = config.renderedPages[pageIndex];
		if (!pageHtml) {
			const lines = await getNextPageLines();
			if (lines.length) {
				// omit displaying page separator at top or bottom of view
				if (lines.first.isPageSeparator) {
					lines.shift();
				}
				else if (lines.last.isPageSeparator) {
					lines.pop();
				}

				pageHtml = lines.reduce(withSpace, '');
				pageHtml += `<div class="pageNumber">${lines.last.pageNo}</div>`;
				config.currentPage = lines.last.pageNo;
				config.renderedPages[pageIndex] = pageHtml;
			}
		}
		if (pageHtml) {
			pageNodes[pageIndex].innerHTML = pageHtml;
		}
	}

	async function getNextPageLines () {
		const lines = [];
		let line;

		do {
			line = await getNextLine(); // eslint-disable-line no-await-in-loop

			if (line) {
				lines.push(line);
				if (line.isPageSeparator) {
					refs.sizingNode.innerHTML += getPageSeparatorHtml(line.pageNo);
				}
				else {
					refs.sizingNode.innerHTML += `${line.text} `;
				}
			}
		} while (line && refs.sizingNode.offsetHeight <= element.offsetHeight);

		// If the line extends outside the visible boundary remove it from the page and put it back in the cache
		if (refs.sizingNode.offsetHeight > element.offsetHeight) {
			config.lineCache.unshift(lines.pop());
		}

		// If the final line of the page begins a new shabad remove it from the page and put it back in the cache
		if (lines.length > 1 && lines.last.shabadId !== lines[lines.length - 2].shabadId) {
			config.lineCache.unshift(lines.pop());
		}

		refs.sizingNode.innerHTML = '';

		return lines;
	}

	const IkOngkar = '<>';
	function parseApiLine (apiLine: ApiPageLine): BaniLine {
		let line = apiLine.verse.gurmukhi;
		const isHeadingLine = line.startsWith(IkOngkar);
		const visraamInfo = apiLine.visraam && (apiLine.visraam.sttm || apiLine.visraam.sttm2);

		const visraamMap = visraamInfo ? visraamInfo.reduce((sum: Record<number, string>, { p, t }) => {
			sum[p] = t;

			return sum;
		}, Object.create(null)) : {};

		if (Object.keys(visraamMap).length) {
			// a phrase is a group of words that should appear on the same line
			let isStartOfPhrase = false;

			line = line.split(' ').map((word, wordIndex) => {
				const prefix = isStartOfPhrase ? '<span class="nowrap">' : '';
				let result = prefix + word;

				isStartOfPhrase = false;

				if (visraamMap[wordIndex] === 'v') {
					result = `<span class="visraam-main">${word}</span></span>`;
					isStartOfPhrase = true;
				}
				else if (visraamMap[wordIndex] === 'y') {
					result = `${prefix}<span class="visraam-yamki">${word}</span>`;
				}

				return result;
			}).join(' ');
		}

		const {
			lineNo,
			pageNo,
			shabadId,
			verseId,
		} = apiLine;

		let isHeading = false;
		if (isHeadingLine || (shabadId !== config.currentShabadId &&
			!isContinuousShabad(config.currentShabadId, shabadId, config.source))
		) {
			line = `<center>${line}</center>`;
			isHeading = true;
		}
		else {
			line = `<span class="nowrap">${line}</span>`;
		}

		if (config.currentShabadId !== shabadId) {
			config.currentShabadId = shabadId;
		}

		return {
			text: line,
			isHeading,
			lineNo,
			pageNo,
			shabadId,
			verseId,
		};
	}

	async function getNextLine () {
		if (!config.lineCache.length) {
			const pageInfo = await getNextPage();
			if (!pageInfo) {
				return;
			}
			config.lineCache = pageInfo.page.map(parseApiLine);
			const {
				lineNo,
				pageNo,
				shabadId,
				verseId,
			} = pageInfo.page[0];
			config.lineCache.push(
				{
					text: '',
					isPageSeparator: true,
					lineNo,
					pageNo: pageNo + 1,
					shabadId,
					verseId,
				}
			);
		}

		return config.lineCache.shift();
	}

	async function getNextPage (): Promise<ApiPageInfo> {
		if (config.nextPageToFetch > TOTAL_PAGES[config.source as keyof typeof TOTAL_PAGES]) {
			return;
		}

		const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${config.nextPageToFetch}/${config.source}`);
		config.nextPageToFetch += 1;

		return apiResponse.json();
	}

	async function renderCurrentPage () {
		pageNodes.forEach(node => node.classList.remove('currentPage'));
		const currentPageNode = pageNodes[config.activeRenderedPage];
		currentPageNode.classList.add('currentPage');
		element.appendChild(currentPageNode);

		for (let i = config.activeRenderedPage; i < MAX_RENDERED_PAGES; i++) {
			await renderPage(i); // eslint-disable-line no-await-in-loop
		}
	}

	async function gotoPage (pageNumber: number) {
		config.activeRenderedPage = 0;
		config.lineCache = [];
		config.renderedPages = [];
		config.nextPageToFetch = pageNumber;
		config.currentShabadId = INVALID_SHABAD_ID;
		renderCurrentPage();
	}

	function onKeyUp (event: KeyboardEvent) {
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
