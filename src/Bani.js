const nextKeys = {
	ArrowDown: true,
	ArrowRight: true,
	PageDown: true,
	' ': true,
};

export class Bani {
	state = {
		currentPage: 1,
		currentShabadId: undefined,
		isNavigatingNext: false,
	}

	constructor (rootNode) {
		this.rootNode = rootNode;
		this.lineCache = [];

		this.sizingNode = document.createElement('section');
		this.sizingNode.className = 'page';
		this.nextPageNode = this.sizingNode.cloneNode();
		this.previousPageNode = this.sizingNode.cloneNode();
		this.currentPageNode = this.sizingNode.cloneNode();
		this.currentPageNode.classList.add('currentPage')
		rootNode.appendChild(this.sizingNode);
		rootNode.appendChild(this.currentPageNode);

		document.addEventListener('keydown', this.onKeyDown);
	}

	async render () {
		await this.renderPage(this.currentPageNode);
		this.renderPage(this.nextPageNode);
	}

	async renderPage (pageNode) {
		const lines = await this.getNextPageLines();
		pageNode.innerHTML = lines.join('<wbr> ');
	}

	async getNextPageLines () {
		const lines = [];

		while(this.sizingNode.offsetHeight <= this.rootNode.offsetHeight) {
			let line = await this.getNextLine();
			if (lines.length === 0 && line.startsWith('<br>')) {
				line = line.substr(4);
			}
			lines.push(line);
			this.sizingNode.innerHTML += ` ${line}<wbr>`;
		}

		if (this.sizingNode.offsetHeight > this.rootNode.offsetHeight) {
			this.lineCache.unshift(lines.pop());
		}
		this.sizingNode.innerHTML = '';

		return lines;
	}

	async getNextLine () {
		if (!this.lineCache.length) {
			const pageInfo = await this.getNextPage();
			this.lineCache = pageInfo.page.map(line => {
				if (line.shabadId === this.state.currentShabadId) {
					return line.verse.gurmukhi;
				}
				else {
					this.state.currentShabadId = line.shabadId;

					return `<br><center>${line.verse.gurmukhi}</center>`;
				}
			});
		}

		return this.lineCache.shift();
	}

	async getNextPage () {
		const apiResponse = await fetch(`https://api.banidb.com/v2/angs/${this.state.currentPage}/D`);
		this.state.currentPage += 1;

		return apiResponse.json();
	}

	async gotoNextPage () {
		if (this.state.isNavigatingNext) {
			return;
		}

		this.state.isNavigatingNext = true;

		[this.previousPageNode, this.currentPageNode, this.nextPageNode] =
			[this.currentPageNode, this.nextPageNode, this.previousPageNode];
		this.previousPageNode.classList.remove('currentPage');
		this.currentPageNode.classList.add('currentPage');
		this.rootNode.removeChild(this.previousPageNode);
		this.rootNode.appendChild(this.currentPageNode);

		await this.renderPage(this.nextPageNode);

		this.state.isNavigatingNext = false;
	}

	onKeyDown = event => {
		if (event.key in nextKeys) {
			this.gotoNextPage();
		}
	}
}
