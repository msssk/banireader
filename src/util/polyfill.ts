interface Array<T> {
	first: T;
	last: T;
}

/* eslint-disable-next-line no-extend-native */
Object.defineProperties(Array.prototype, {
	first: {
		configurable: false,
		enumerable: false,

		get () {
			return this[0];
		},

		set (value: any) {
			this[0] = value;
		},
	},

	last: {
		configurable: false,
		enumerable: false,

		get () {
			return this.length ? this[this.length - 1] : undefined;
		},

		set (value: any) {
			if (this.length) {
				this[this.length - 1] = value;
			}
		},
	},
});
