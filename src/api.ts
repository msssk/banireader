export interface ApiPageInfo {
	page: ApiPageLine[];
}

export interface ApiPageLine {
	shabadId: number;
	verse: {
		gurmukhi: string;
	};
}
