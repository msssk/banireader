import { ApiPageInfo, ApiPageLine } from './interfaces.d';
import { isContinuousShabad } from './bani.js';
import { Config } from './Config.js';
import {
	ComponentOptions,
	Controller,
	RenderChildren,
	createRef,
	render,
	main,
	section,
} from './tizi.js';

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

function withWordBreak (sum: string, line: string, index: number, array: string[]) {
	sum = sum || '';
	if (index === array.length - 1 || line.endsWith('>')) {
		sum += line;
	}
	else {
		sum += `${line}<wbr> `;
	}

	return sum;
}

export interface ReaderController extends Controller {
	gotoPage (page: number): void;
	hidden: boolean;
	render (): Promise<void>;
	showVisraam: boolean;
}

export interface ReaderOptions extends ComponentOptions<HTMLElement, ReaderController> {
	config: Config
}

export default function Reader (options: ReaderOptions, children?: RenderChildren) {
	const {
		config,
		ref,
		...elementOptions
	} = options;
	const refs = {
		main: createRef<HTMLElement>(),
		sizingNode: createRef<HTMLElement>(),
	};

	const element = main({ ref: refs.main, class: 'reader', ...elementOptions }, [
		section({ ref: refs.sizingNode, class: 'page' }),
	]);

	const pageNodes: HTMLElement[] = [];
	for (let i = 0; i < MAX_RENDERED_PAGES; i++) {
		pageNodes.push(refs.sizingNode.node.cloneNode() as HTMLElement);
	}

	render(element, options, children, {
		destroy () {
			document.body.removeEventListener('keyup', onKeyUp);
		},

		gotoPage,

		render: renderCurrentPage,

		get hidden () {
			return element.hidden;
		},

		set hidden (value: boolean) {
			element.hidden = value;

			if (value === false) {
				element.classList.toggle('visraam', Boolean(config.showVisraam));
			}
		},

		get showVisraam () {
			return element.classList.contains('visraam');
		},

		set showVisraam (value: boolean) {
			element.classList.toggle('visraam', value);
		},
	});

	// Guard to prevent further navigation while navigation is in progress
	let isNavigating = false;
	async function gotoNextPage () {
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

	function gotoPreviousPage () {
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

	async function renderPage (pageIndex: number) {
		let pageHtml = config.renderedPages[pageIndex];
		if (!pageHtml) {
			const lines = await getNextPageLines();
			pageHtml = lines.reduce(withWordBreak);
			config.renderedPages[pageIndex] = pageHtml;
		}
		pageNodes[pageIndex].innerHTML = pageHtml;
	}

	function reportUnsupportedBrowser () {
		element.classList.add('unsupported');
		element.innerHTML = `This browser does not have the necessary text rendering support.<br>Please try
			<a href="https://www.google.com/chrome/">Google Chrome</a>`;
	}

	async function getNextPageLines () {
		const lines = [];

		while (refs.sizingNode.offsetHeight <= element.offsetHeight) {
			let line = await getNextLine(); // eslint-disable-line no-await-in-loop

			// strip unnecessary <br> if a shabad break occurs at the top of a page
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

	const IkOngkar = '<>';
	let breakNextLine = false;
	let previousLineIsHeading = false;
	function parseApiLine (apiLine: ApiPageLine) {
		let line = apiLine.verse.gurmukhi;

		const visraamMap = apiLine.visraam.sttm.reduce((sum: Record<number, string>, { p, t }) => {
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

		const isHeadingLine = line.startsWith(IkOngkar);
		if (breakNextLine || isHeadingLine ||
			(apiLine.shabadId !== config.currentShabadId &&
				!isContinuousShabad(config.currentShabadId, apiLine.shabadId, config.source))
			)
		{
			line = `${(breakNextLine || previousLineIsHeading) ? '' : '<br>'}<center>${line}</center>`;
			previousLineIsHeading = true;
		}
		else {
			previousLineIsHeading = false;
		}
		breakNextLine = isHeadingLine;

		if (config.currentShabadId !== apiLine.shabadId) {
			config.currentShabadId = apiLine.shabadId;
		}

		return line;
	}

	async function getNextLine () {
		if (!config.lineCache.length) {
			const pageInfo = await getNextPage();
			config.lineCache = pageInfo.page.map(parseApiLine);
		}

		return config.lineCache.shift();
	}

	async function getNextPage (): Promise<ApiPageInfo> {
		const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${config.currentPage}/${config.source}`);
		config.currentPage += 1;

		return apiResponse.json();
	}

	async function renderCurrentPage () {
		const currentPageNode = pageNodes[config.displayedPage];
		currentPageNode.classList.add('currentPage');
		element.appendChild(currentPageNode);

		for (let i = config.displayedPage; i < MAX_RENDERED_PAGES; i++) {
			await renderPage(i); // eslint-disable-line no-await-in-loop
		}
	}

	async function gotoPage (pageNumber: number) {
		breakNextLine = false;
		previousLineIsHeading = false;
		config.displayedPage = 0;
		config.lineCache = [];
		config.renderedPages = [];
		config.currentPage = pageNumber;
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
