function isJapji(shabadId) {
    return shabadId > 1 && shabadId < 40;
}
function isSalokMahlaNauva(shabadId) {
    return (shabadId > 5480 && shabadId < 5532) ||
        (shabadId > 5532 && shabadId < 5537);
}
export function isContinuousShabad(id, nextId, source) {
    if (source === 'G') {
        return isJapji(nextId) || isSalokMahlaNauva(id);
    }
    return false;
}
