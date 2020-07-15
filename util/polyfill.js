Object.defineProperties(Array.prototype, {
    first: {
        configurable: false,
        enumerable: false,
        get() {
            return this[0];
        },
        set(value) {
            this[0] = value;
        },
    },
    last: {
        configurable: false,
        enumerable: false,
        get() {
            return this.length ? this[this.length - 1] : undefined;
        },
        set(value) {
            if (this.length) {
                this[this.length - 1] = value;
            }
        },
    },
});
