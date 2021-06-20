export interface ApiPageInfo {
	page: ApiPageLine[];
}

export interface ApiPageLine {
	lineNo: number;
	pageNo: number;
	shabadId: number;
	verse: {
		gurmukhi: string;
	};
	verseId: number;
	visraam: {
		sttm?: VisraamInfo[],
		sttm2?: VisraamInfo[]
	}
}

export type BaniLine = {
	isHeading?: boolean;
	isPageSeparator?: boolean;
	lineNo: number;
	pageNo: number;
	shabadId: number;
	text: string;
	verseId: number;
};

export interface VisraamInfo {
	p: number;
	t: string;
}

export interface AppConfig {
	backgroundColor?: string;
	fontSize?: number;
	source?: string;
	textColor?: string;
	visraamColor?: string;
	visraamColorYamki?: string;
}

export interface BaniSourceData {
	currentPage?: number;
	currentShabadId?: number;

	/**
	 * Index of the currently displayed page within the pageNodes array
	 */
	activeRenderedPage?: 0 | 1;

	/**
	 * Cache of fetched but not yet rendered lines
	 */
	lineCache?: BaniLine[];

	nextPageToFetch?: number;

	/**
	 * Inner HTML of currently rendered pages (up to 3)
	 */
	renderedPages?: Array<string | null>;

	showPageNumber?: boolean;
	showVisraam?: boolean;
}
