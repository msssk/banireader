const JAPJI_LAST_PAURI = 40;

/**
 * Return true if transition of shabadId from `id` to `nextId` should be continous
 * e.g. the pauris in Japji Sahib each have different ids, but should be displayed continuously
 */
export function isContinuousShabad (id: number, nextId: number, source: string) {
	if (source === 'G') {
		return nextId > 1 && nextId < JAPJI_LAST_PAURI;
	}

	return false;
}
