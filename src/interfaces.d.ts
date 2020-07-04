export interface ApiPageInfo {
	page: ApiPageLine[];
}

export interface VisraamInfo {
	p: number;
	t: string;
}

export interface ApiPageLine {
	shabadId: number;
	verse: {
		gurmukhi: string;
	};
	visraam: {
		sttm: VisraamInfo[]
	}
}

export interface BaniSourceData {
	currentPage?: number;
	currentShabadId?: number;

	/**
	 * Index of the currently displayed page within the pageNodes array
	 */
	displayedPage?: 0 | 1;

	fontSize?: number;

	/**
	 * Cache of fetched but not yet rendered lines
	 */
	lineCache?: string[];

	/**
	 * Inner HTML of currently rendered pages
	 */
	renderedPages?: Array<string | null>;

	showVisraam?: boolean;
}
