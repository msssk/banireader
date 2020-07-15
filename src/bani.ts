function isJapji (shabadId: number) {
	return shabadId > 1 && shabadId < 40;
}

function isSalokMahlaNauva (shabadId: number) {
	return (shabadId > 5480 && shabadId < 5532) ||
		(shabadId > 5532 && shabadId < 5537);
}

/**
 * Return true if transition of shabadId from `id` to `nextId` should be continous
 * e.g. the pauris in Japji Sahib each have different ids, but should be displayed continuously
 */
export function isContinuousShabad (id: number, nextId: number, source: string) {
	if (source === 'G') {
		return isJapji(nextId) || isSalokMahlaNauva(id);
	}

	return false;
}
