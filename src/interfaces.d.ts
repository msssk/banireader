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
		sttm: VisraamInfo[]
	}
}

export type BaniLine = {
	isHeading?: boolean;
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

	/**
	 * Inner HTML of currently rendered pages (up to 3)
	 */
	renderedPages?: Array<string | null>;

	showVisraam?: boolean;
}

declare global {
	namespace JSX {
		// TODO: all the elements
		interface IntrinsicElements {
			a: Record<string, unknown>;
			br: Record<string, unknown>;
			button: Record<string, unknown>;
			div: Record<string, unknown>;
			hr: Record<string, unknown>;
			input: Record<string, unknown>;
			kbd: Record<string, unknown>;
			label: Record<string, unknown>;
			main: Record<string, unknown>;
			p: Record<string, unknown>;
			section: Record<string, unknown>;
			table: Record<string, unknown>;
			td: Record<string, unknown>;
			tr: Record<string, unknown>;
		}
	}
}
