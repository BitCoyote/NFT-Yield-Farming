function getIterator(e) {
	if ("function" == typeof e.next) return e;
	if ("function" == typeof e[Symbol.iterator]) return e[Symbol.iterator]();
	if ("function" == typeof e[Symbol.asyncIterator]) return e[Symbol.asyncIterator]();
	throw new TypeError('"values" does not to conform to any of the iterator or iterable protocols')
}

function defer() {
	let e, t;
	return {
		promise: new Promise(((r, n) => {
			t = r, e = n
		})),
		reject: e,
		resolve: t
	}
}

function _transform(e, t, r) {
	const n = getIterator(r),
		o = [],
		i = [];
	let s = !1,
		a = !1,
		c = 0,
		u = null;

	function f() {
		for (; i.length > 0 && o.length > 0;) {
			const {
				resolve: e
			} = i.shift();
			e({
				done: !1,
				value: o.shift()
			})
		}
		for (; i.length > 0 && 0 === c && s;) {
			const {
				resolve: e,
				reject: t
			} = i.shift();
			u ? (t(u), u = null) : e({
				done: !0,
				value: void 0
			})
		}
	}
	async function l() {
		if (s) f();
		else if (!(a || c + o.length >= e)) {
			a = !0, c++;
			try {
				const {
					done: e,
					value: r
				} = await n.next();
				e ? (s = !0, c--, f()) : async function(e) {
					try {
						const r = await t(e);
						o.push(r)
					} catch (e) {
						s = !0, u = e
					}
					c--, f(), l()
				}(r)
			} catch (e) {
				s = !0, c--, u = e, f()
			}
			a = !1, l()
		}
	}
	const h = {
		next: async function() {
			if (0 === o.length) {
				const e = defer();
				return i.push(e), l(), e.promise
			}
			const e = o.shift();
			return l(), {
				done: !1,
				value: e
			}
		},
		[Symbol.asyncIterator]: () => h
	};
	return h
}

function transform(e, t, r) {
	return void 0 === t ? (t, r) => r ? transform(e, t, r) : transform(e, t) : void 0 === r ? r => transform(e, t, r) : _transform(e, t, r)
}
var commonjsGlobal = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function getDefaultExportFromCjs(e) {
	return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
}

function getAugmentedNamespace(e) {
	if (e.__esModule) return e;
	var t = Object.defineProperty({}, "__esModule", {
		value: !0
	});
	return Object.keys(e).forEach((function(r) {
		var n = Object.getOwnPropertyDescriptor(e, r);
		Object.defineProperty(t, r, n.get ? n : {
			enumerable: !0,
			get: function() {
				return e[r]
			}
		})
	})), t
}
var pRetry$2 = {
		exports: {}
	},
	retry$2 = {};

function RetryOperation(e, t) {
	"boolean" == typeof t && (t = {
		forever: t
	}), this._originalTimeouts = JSON.parse(JSON.stringify(e)), this._timeouts = e, this._options = t || {}, this._maxRetryTime = t && t.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0))
}
var retry_operation = RetryOperation;
RetryOperation.prototype.reset = function() {
		this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0)
	}, RetryOperation.prototype.stop = function() {
		this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null
	}, RetryOperation.prototype.retry = function(e) {
		if (this._timeout && clearTimeout(this._timeout), !e) return !1;
		var t = (new Date).getTime();
		if (e && t - this._operationStart >= this._maxRetryTime) return this._errors.push(e), this._errors.unshift(new Error("RetryOperation timeout occurred")), !1;
		this._errors.push(e);
		var r = this._timeouts.shift();
		if (void 0 === r) {
			if (!this._cachedTimeouts) return !1;
			this._errors.splice(0, this._errors.length - 1), r = this._cachedTimeouts.slice(-1)
		}
		var n = this;
		return this._timer = setTimeout((function() {
			n._attempts++, n._operationTimeoutCb && (n._timeout = setTimeout((function() {
				n._operationTimeoutCb(n._attempts)
			}), n._operationTimeout), n._options.unref && n._timeout.unref()), n._fn(n._attempts)
		}), r), this._options.unref && this._timer.unref(), !0
	}, RetryOperation.prototype.attempt = function(e, t) {
		this._fn = e, t && (t.timeout && (this._operationTimeout = t.timeout), t.cb && (this._operationTimeoutCb = t.cb));
		var r = this;
		this._operationTimeoutCb && (this._timeout = setTimeout((function() {
			r._operationTimeoutCb()
		}), r._operationTimeout)), this._operationStart = (new Date).getTime(), this._fn(this._attempts)
	}, RetryOperation.prototype.try = function(e) {
		console.log("Using RetryOperation.try() is deprecated"), this.attempt(e)
	}, RetryOperation.prototype.start = function(e) {
		console.log("Using RetryOperation.start() is deprecated"), this.attempt(e)
	}, RetryOperation.prototype.start = RetryOperation.prototype.try, RetryOperation.prototype.errors = function() {
		return this._errors
	}, RetryOperation.prototype.attempts = function() {
		return this._attempts
	}, RetryOperation.prototype.mainError = function() {
		if (0 === this._errors.length) return null;
		for (var e = {}, t = null, r = 0, n = 0; n < this._errors.length; n++) {
			var o = this._errors[n],
				i = o.message,
				s = (e[i] || 0) + 1;
			e[i] = s, s >= r && (t = o, r = s)
		}
		return t
	},
	function(e) {
		var t = retry_operation;
		e.operation = function(r) {
			var n = e.timeouts(r);
			return new t(n, {
				forever: r && (r.forever || r.retries === 1 / 0),
				unref: r && r.unref,
				maxRetryTime: r && r.maxRetryTime
			})
		}, e.timeouts = function(e) {
			if (e instanceof Array) return [].concat(e);
			var t = {
				retries: 10,
				factor: 2,
				minTimeout: 1e3,
				maxTimeout: 1 / 0,
				randomize: !1
			};
			for (var r in e) t[r] = e[r];
			if (t.minTimeout > t.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
			for (var n = [], o = 0; o < t.retries; o++) n.push(this.createTimeout(o, t));
			return e && e.forever && !n.length && n.push(this.createTimeout(o, t)), n.sort((function(e, t) {
				return e - t
			})), n
		}, e.createTimeout = function(e, t) {
			var r = t.randomize ? Math.random() + 1 : 1,
				n = Math.round(r * Math.max(t.minTimeout, 1) * Math.pow(t.factor, e));
			return n = Math.min(n, t.maxTimeout)
		}, e.wrap = function(t, r, n) {
			if (r instanceof Array && (n = r, r = null), !n)
				for (var o in n = [], t) "function" == typeof t[o] && n.push(o);
			for (var i = 0; i < n.length; i++) {
				var s = n[i],
					a = t[s];
				t[s] = function(n) {
					var o = e.operation(r),
						i = Array.prototype.slice.call(arguments, 1),
						s = i.pop();
					i.push((function(e) {
						o.retry(e) || (e && (arguments[0] = o.mainError()), s.apply(this, arguments))
					})), o.attempt((function() {
						n.apply(t, i)
					}))
				}.bind(t, a), t[s].options = r
			}
		}
	}(retry$2);
var retry$1 = retry$2;
const retry = retry$1,
	networkErrorMsgs = ["Failed to fetch", "NetworkError when attempting to fetch resource.", "The Internet connection appears to be offline.", "Network request failed"];
class AbortError extends Error {
	constructor(e) {
		super(), e instanceof Error ? (this.originalError = e, ({
			message: e
		} = e)) : (this.originalError = new Error(e), this.originalError.stack = this.stack), this.name = "AbortError", this.message = e
	}
}
const decorateErrorWithCounts = (e, t, r) => {
		const n = r.retries - (t - 1);
		return e.attemptNumber = t, e.retriesLeft = n, e
	},
	isNetworkError = e => networkErrorMsgs.includes(e),
	pRetry = (e, t) => new Promise(((r, n) => {
		t = {
			onFailedAttempt: () => {},
			retries: 10,
			...t
		};
		const o = retry.operation(t);
		o.attempt((async i => {
			try {
				r(await e(i))
			} catch (e) {
				if (!(e instanceof Error)) return void n(new TypeError(`Non-error was thrown: "${e}". You should only throw errors.`));
				if (e instanceof AbortError) o.stop(), n(e.originalError);
				else if (e instanceof TypeError && !isNetworkError(e.message)) o.stop(), n(e);
				else {
					decorateErrorWithCounts(e, i, t);
					try {
						await t.onFailedAttempt(e)
					} catch (e) {
						return void n(e)
					}
					o.retry(e) || n(o.mainError())
				}
			}
		}))
	}));
pRetry$2.exports = pRetry, pRetry$2.exports.default = pRetry;
var AbortError_1 = pRetry$2.exports.AbortError = AbortError,
	pRetry$1 = pRetry$2.exports,
	encode_1$1 = encode$9,
	MSB$3 = 128,
	REST$3 = 127,
	MSBALL$1 = ~REST$3,
	INT$1 = Math.pow(2, 31);

function encode$9(e, t, r) {
	if (Number.MAX_SAFE_INTEGER && e > Number.MAX_SAFE_INTEGER) throw encode$9.bytes = 0, new RangeError("Could not encode varint");
	t = t || [];
	for (var n = r = r || 0; e >= INT$1;) t[r++] = 255 & e | MSB$3, e /= 128;
	for (; e & MSBALL$1;) t[r++] = 255 & e | MSB$3, e >>>= 7;
	return t[r] = 0 | e, encode$9.bytes = r - n + 1, t
}
var decode$a = read$1,
	MSB$2 = 128,
	REST$2 = 127;

function read$1(e, t) {
	var r, n = 0,
		o = 0,
		i = t = t || 0,
		s = e.length;
	do {
		if (i >= s || o > 49) throw read$1.bytes = 0, new RangeError("Could not decode varint");
		r = e[i++], n += o < 28 ? (r & REST$2) << o : (r & REST$2) * Math.pow(2, o), o += 7
	} while (r >= MSB$2);
	return read$1.bytes = i - t, n
}
var N1$1 = Math.pow(2, 7),
	N2$1 = Math.pow(2, 14),
	N3$1 = Math.pow(2, 21),
	N4$1 = Math.pow(2, 28),
	N5$1 = Math.pow(2, 35),
	N6$1 = Math.pow(2, 42),
	N7$1 = Math.pow(2, 49),
	N8$1 = Math.pow(2, 56),
	N9$1 = Math.pow(2, 63),
	length$1 = function(e) {
		return e < N1$1 ? 1 : e < N2$1 ? 2 : e < N3$1 ? 3 : e < N4$1 ? 4 : e < N5$1 ? 5 : e < N6$1 ? 6 : e < N7$1 ? 7 : e < N8$1 ? 8 : e < N9$1 ? 9 : 10
	},
	varint$1 = {
		encode: encode_1$1,
		decode: decode$a,
		encodingLength: length$1
	},
	encode_1 = encode$8,
	MSB = 128,
	REST = 127,
	MSBALL = ~REST,
	INT = Math.pow(2, 31);

function encode$8(e, t, r) {
	t = t || [];
	for (var n = r = r || 0; e >= INT;) t[r++] = 255 & e | MSB, e /= 128;
	for (; e & MSBALL;) t[r++] = 255 & e | MSB, e >>>= 7;
	return t[r] = 0 | e, encode$8.bytes = r - n + 1, t
}
var decode$9 = read,
	MSB$1 = 128,
	REST$1 = 127;

function read(e, t) {
	var r, n = 0,
		o = 0,
		i = t = t || 0,
		s = e.length;
	do {
		if (i >= s) throw read.bytes = 0, new RangeError("Could not decode varint");
		r = e[i++], n += o < 28 ? (r & REST$1) << o : (r & REST$1) * Math.pow(2, o), o += 7
	} while (r >= MSB$1);
	return read.bytes = i - t, n
}
var N1 = Math.pow(2, 7),
	N2 = Math.pow(2, 14),
	N3 = Math.pow(2, 21),
	N4 = Math.pow(2, 28),
	N5 = Math.pow(2, 35),
	N6 = Math.pow(2, 42),
	N7 = Math.pow(2, 49),
	N8 = Math.pow(2, 56),
	N9 = Math.pow(2, 63),
	length = function(e) {
		return e < N1 ? 1 : e < N2 ? 2 : e < N3 ? 3 : e < N4 ? 4 : e < N5 ? 5 : e < N6 ? 6 : e < N7 ? 7 : e < N8 ? 8 : e < N9 ? 9 : 10
	},
	varint = {
		encode: encode_1,
		decode: decode$9,
		encodingLength: length
	},
	_brrp_varint = varint;
const decode$8 = e => [_brrp_varint.decode(e), _brrp_varint.decode.bytes],
	encodeTo = (e, t, r = 0) => (_brrp_varint.encode(e, t, r), t),
	encodingLength = e => _brrp_varint.encodingLength(e),
	empty = new Uint8Array(0),
	fromHex = e => {
		const t = e.match(/../g);
		return t ? new Uint8Array(t.map((e => parseInt(e, 16)))) : empty
	},
	equals$1 = (e, t) => {
		if (e === t) return !0;
		if (e.byteLength !== t.byteLength) return !1;
		for (let r = 0; r < e.byteLength; r++)
			if (e[r] !== t[r]) return !1;
		return !0
	},
	coerce = e => {
		if (e instanceof Uint8Array && "Uint8Array" === e.constructor.name) return e;
		if (e instanceof ArrayBuffer) return new Uint8Array(e);
		if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
		throw new Error("Unknown type, must be binary type")
	},
	fromString$3 = e => (new TextEncoder).encode(e),
	toString$1 = e => (new TextDecoder).decode(e),
	create$4 = (e, t) => {
		const r = t.byteLength,
			n = encodingLength(e),
			o = n + encodingLength(r),
			i = new Uint8Array(o + r);
		return encodeTo(e, i, 0), encodeTo(r, i, n), i.set(t, o), new Digest(e, r, t, i)
	},
	decode$7 = e => {
		const t = coerce(e),
			[r, n] = decode$8(t),
			[o, i] = decode$8(t.subarray(n)),
			s = t.subarray(n + i);
		if (s.byteLength !== o) throw new Error("Incorrect length");
		return new Digest(r, o, s, t)
	},
	equals = (e, t) => e === t || e.code === t.code && e.size === t.size && equals$1(e.bytes, t.bytes);
class Digest {
	constructor(e, t, r, n) {
		this.code = e, this.size = t, this.digest = r, this.bytes = n
	}
}

function base(e, t) {
	if (e.length >= 255) throw new TypeError("Alphabet too long");
	for (var r = new Uint8Array(256), n = 0; n < r.length; n++) r[n] = 255;
	for (var o = 0; o < e.length; o++) {
		var i = e.charAt(o),
			s = i.charCodeAt(0);
		if (255 !== r[s]) throw new TypeError(i + " is ambiguous");
		r[s] = o
	}
	var a = e.length,
		c = e.charAt(0),
		u = Math.log(a) / Math.log(256),
		f = Math.log(256) / Math.log(a);

	function l(e) {
		if ("string" != typeof e) throw new TypeError("Expected String");
		if (0 === e.length) return new Uint8Array;
		var t = 0;
		if (" " !== e[t]) {
			for (var n = 0, o = 0; e[t] === c;) n++, t++;
			for (var i = (e.length - t) * u + 1 >>> 0, s = new Uint8Array(i); e[t];) {
				var f = r[e.charCodeAt(t)];
				if (255 === f) return;
				for (var l = 0, h = i - 1;
					(0 !== f || l < o) && -1 !== h; h--, l++) f += a * s[h] >>> 0, s[h] = f % 256 >>> 0, f = f / 256 >>> 0;
				if (0 !== f) throw new Error("Non-zero carry");
				o = l, t++
			}
			if (" " !== e[t]) {
				for (var d = i - o; d !== i && 0 === s[d];) d++;
				for (var p = new Uint8Array(n + (i - d)), y = n; d !== i;) p[y++] = s[d++];
				return p
			}
		}
	}
	return {
		encode: function(t) {
			if (t instanceof Uint8Array || (ArrayBuffer.isView(t) ? t = new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : Array.isArray(t) && (t = Uint8Array.from(t))), !(t instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
			if (0 === t.length) return "";
			for (var r = 0, n = 0, o = 0, i = t.length; o !== i && 0 === t[o];) o++, r++;
			for (var s = (i - o) * f + 1 >>> 0, u = new Uint8Array(s); o !== i;) {
				for (var l = t[o], h = 0, d = s - 1;
					(0 !== l || h < n) && -1 !== d; d--, h++) l += 256 * u[d] >>> 0, u[d] = l % a >>> 0, l = l / a >>> 0;
				if (0 !== l) throw new Error("Non-zero carry");
				n = h, o++
			}
			for (var p = s - n; p !== s && 0 === u[p];) p++;
			for (var y = c.repeat(r); p < s; ++p) y += e.charAt(u[p]);
			return y
		},
		decodeUnsafe: l,
		decode: function(e) {
			var r = l(e);
			if (r) return r;
			throw new Error(`Non-${t} character`)
		}
	}
}
var src$2 = base,
	_brrp__multiformats_scope_baseX = src$2;
class Encoder {
	constructor(e, t, r) {
		this.name = e, this.prefix = t, this.baseEncode = r
	}
	encode(e) {
		if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
		throw Error("Unknown type, must be binary type")
	}
}
class Decoder {
	constructor(e, t, r) {
		this.name = e, this.prefix = t, this.baseDecode = r
	}
	decode(e) {
		if ("string" == typeof e) {
			if (e[0] === this.prefix) return this.baseDecode(e.slice(1));
			throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`)
		}
		throw Error("Can only multibase decode strings")
	}
	or(e) {
		return or(this, e)
	}
}
class ComposedDecoder {
	constructor(e) {
		this.decoders = e
	}
	or(e) {
		return or(this, e)
	}
	decode(e) {
		const t = e[0],
			r = this.decoders[t];
		if (r) return r.decode(e);
		throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`)
	}
}
const or = (e, t) => new ComposedDecoder({
	...e.decoders || {
		[e.prefix]: e
	},
	...t.decoders || {
		[t.prefix]: t
	}
});
class Codec {
	constructor(e, t, r, n) {
		this.name = e, this.prefix = t, this.baseEncode = r, this.baseDecode = n, this.encoder = new Encoder(e, t, r), this.decoder = new Decoder(e, t, n)
	}
	encode(e) {
		return this.encoder.encode(e)
	}
	decode(e) {
		return this.decoder.decode(e)
	}
}
const from$1 = ({
		name: e,
		prefix: t,
		encode: r,
		decode: n
	}) => new Codec(e, t, r, n),
	baseX = ({
		prefix: e,
		name: t,
		alphabet: r
	}) => {
		const {
			encode: n,
			decode: o
		} = _brrp__multiformats_scope_baseX(r, t);
		return from$1({
			prefix: e,
			name: t,
			encode: n,
			decode: e => coerce(o(e))
		})
	},
	decode$6 = (e, t, r, n) => {
		const o = {};
		for (let e = 0; e < t.length; ++e) o[t[e]] = e;
		let i = e.length;
		for (;
			"=" === e[i - 1];) --i;
		const s = new Uint8Array(i * r / 8 | 0);
		let a = 0,
			c = 0,
			u = 0;
		for (let t = 0; t < i; ++t) {
			const i = o[e[t]];
			if (void 0 === i) throw new SyntaxError(`Non-${n} character`);
			c = c << r | i, a += r, a >= 8 && (a -= 8, s[u++] = 255 & c >> a)
		}
		if (a >= r || 255 & c << 8 - a) throw new SyntaxError("Unexpected end of data");
		return s
	},
	encode$7 = (e, t, r) => {
		const n = "=" === t[t.length - 1],
			o = (1 << r) - 1;
		let i = "",
			s = 0,
			a = 0;
		for (let n = 0; n < e.length; ++n)
			for (a = a << 8 | e[n], s += 8; s > r;) s -= r, i += t[o & a >> s];
		if (s && (i += t[o & a << r - s]), n)
			for (; i.length * r & 7;) i += "=";
		return i
	},
	rfc4648 = ({
		name: e,
		prefix: t,
		bitsPerChar: r,
		alphabet: n
	}) => from$1({
		prefix: t,
		name: e,
		encode: e => encode$7(e, n, r),
		decode: t => decode$6(t, n, r, e)
	}),
	base58btc = baseX({
		name: "base58btc",
		prefix: "z",
		alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	}),
	base58flickr = baseX({
		name: "base58flickr",
		prefix: "Z",
		alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
	});
var base58 = Object.freeze({
	__proto__: null,
	base58btc: base58btc,
	base58flickr: base58flickr
});
const base32 = rfc4648({
		prefix: "b",
		name: "base32",
		alphabet: "abcdefghijklmnopqrstuvwxyz234567",
		bitsPerChar: 5
	}),
	base32upper = rfc4648({
		prefix: "B",
		name: "base32upper",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
		bitsPerChar: 5
	}),
	base32pad = rfc4648({
		prefix: "c",
		name: "base32pad",
		alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
		bitsPerChar: 5
	}),
	base32padupper = rfc4648({
		prefix: "C",
		name: "base32padupper",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
		bitsPerChar: 5
	}),
	base32hex = rfc4648({
		prefix: "v",
		name: "base32hex",
		alphabet: "0123456789abcdefghijklmnopqrstuv",
		bitsPerChar: 5
	}),
	base32hexupper = rfc4648({
		prefix: "V",
		name: "base32hexupper",
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
		bitsPerChar: 5
	}),
	base32hexpad = rfc4648({
		prefix: "t",
		name: "base32hexpad",
		alphabet: "0123456789abcdefghijklmnopqrstuv=",
		bitsPerChar: 5
	}),
	base32hexpadupper = rfc4648({
		prefix: "T",
		name: "base32hexpadupper",
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
		bitsPerChar: 5
	}),
	base32z = rfc4648({
		prefix: "h",
		name: "base32z",
		alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
		bitsPerChar: 5
	});
var base32$1 = Object.freeze({
	__proto__: null,
	base32: base32,
	base32upper: base32upper,
	base32pad: base32pad,
	base32padupper: base32padupper,
	base32hex: base32hex,
	base32hexupper: base32hexupper,
	base32hexpad: base32hexpad,
	base32hexpadupper: base32hexpadupper,
	base32z: base32z
});
class CID {
	constructor(e, t, r, n) {
		this.code = t, this.version = e, this.multihash = r, this.bytes = n, this.byteOffset = n.byteOffset, this.byteLength = n.byteLength, this.asCID = this, this._baseCache = new Map, Object.defineProperties(this, {
			byteOffset: hidden,
			byteLength: hidden,
			code: readonly$1,
			version: readonly$1,
			multihash: readonly$1,
			bytes: readonly$1,
			_baseCache: hidden,
			asCID: hidden
		})
	}
	toV0() {
		if (0 === this.version) return this; {
			const {
				code: e,
				multihash: t
			} = this;
			if (e !== DAG_PB_CODE) throw new Error("Cannot convert a non dag-pb CID to CIDv0");
			if (t.code !== SHA_256_CODE) throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
			return CID.createV0(t)
		}
	}
	toV1() {
		switch (this.version) {
			case 0: {
				const {
					code: e,
					digest: t
				} = this.multihash, r = create$4(e, t);
				return CID.createV1(this.code, r)
			}
			case 1:
				return this;
			default:
				throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`)
		}
	}
	equals(e) {
		return e && this.code === e.code && this.version === e.version && equals(this.multihash, e.multihash)
	}
	toString(e) {
		const {
			bytes: t,
			version: r,
			_baseCache: n
		} = this;
		return 0 === r ? toStringV0(t, n, e || base58btc.encoder) : toStringV1(t, n, e || base32.encoder)
	}
	toJSON() {
		return {
			code: this.code,
			version: this.version,
			hash: this.multihash.bytes
		}
	}
	get[Symbol.toStringTag]() {
		return "CID"
	} [Symbol.for("nodejs.util.inspect.custom")]() {
		return "CID(" + this.toString() + ")"
	}
	static isCID(e) {
		return deprecate(/^0\.0/, IS_CID_DEPRECATION), !(!e || !e[cidSymbol] && e.asCID !== e)
	}
	get toBaseEncodedString() {
		throw new Error("Deprecated, use .toString()")
	}
	get codec() {
		throw new Error('"codec" property is deprecated, use integer "code" property instead')
	}
	get buffer() {
		throw new Error("Deprecated .buffer property, use .bytes to get Uint8Array instead")
	}
	get multibaseName() {
		throw new Error('"multibaseName" property is deprecated')
	}
	get prefix() {
		throw new Error('"prefix" property is deprecated')
	}
	static asCID(e) {
		if (e instanceof CID) return e;
		if (null != e && e.asCID === e) {
			const {
				version: t,
				code: r,
				multihash: n,
				bytes: o
			} = e;
			return new CID(t, r, n, o || encodeCID(t, r, n.bytes))
		}
		if (null != e && !0 === e[cidSymbol]) {
			const {
				version: t,
				multihash: r,
				code: n
			} = e, o = decode$7(r);
			return CID.create(t, n, o)
		}
		return null
	}
	static create(e, t, r) {
		if ("number" != typeof t) throw new Error("String codecs are no longer supported");
		switch (e) {
			case 0:
				if (t !== DAG_PB_CODE) throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
				return new CID(e, t, r, r.bytes);
			case 1: {
				const n = encodeCID(e, t, r.bytes);
				return new CID(e, t, r, n)
			}
			default:
				throw new Error("Invalid version")
		}
	}
	static createV0(e) {
		return CID.create(0, DAG_PB_CODE, e)
	}
	static createV1(e, t) {
		return CID.create(1, e, t)
	}
	static decode(e) {
		const [t, r] = CID.decodeFirst(e);
		if (r.length) throw new Error("Incorrect length");
		return t
	}
	static decodeFirst(e) {
		const t = CID.inspectBytes(e),
			r = t.size - t.multihashSize,
			n = coerce(e.subarray(r, r + t.multihashSize));
		if (n.byteLength !== t.multihashSize) throw new Error("Incorrect length");
		const o = n.subarray(t.multihashSize - t.digestSize),
			i = new Digest(t.multihashCode, t.digestSize, o, n);
		return [0 === t.version ? CID.createV0(i) : CID.createV1(t.codec, i), e.subarray(t.size)]
	}
	static inspectBytes(e) {
		let t = 0;
		const r = () => {
			const [r, n] = decode$8(e.subarray(t));
			return t += n, r
		};
		let n = r(),
			o = DAG_PB_CODE;
		if (18 === n ? (n = 0, t = 0) : 1 === n && (o = r()), 0 !== n && 1 !== n) throw new RangeError(`Invalid CID version ${n}`);
		const i = t,
			s = r(),
			a = r(),
			c = t + a;
		return {
			version: n,
			codec: o,
			multihashCode: s,
			digestSize: a,
			multihashSize: c - i,
			size: c
		}
	}
	static parse(e, t) {
		const [r, n] = parseCIDtoBytes(e, t), o = CID.decode(n);
		return o._baseCache.set(r, e), o
	}
}
const parseCIDtoBytes = (e, t) => {
		switch (e[0]) {
			case "Q": {
				const r = t || base58btc;
				return [base58btc.prefix, r.decode(`${base58btc.prefix}${e}`)]
			}
			case base58btc.prefix: {
				const r = t || base58btc;
				return [base58btc.prefix, r.decode(e)]
			}
			case base32.prefix: {
				const r = t || base32;
				return [base32.prefix, r.decode(e)]
			}
			default:
				if (null == t) throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
				return [e[0], t.decode(e)]
		}
	},
	toStringV0 = (e, t, r) => {
		const {
			prefix: n
		} = r;
		if (n !== base58btc.prefix) throw Error(`Cannot string encode V0 in ${r.name} encoding`);
		const o = t.get(n);
		if (null == o) {
			const o = r.encode(e).slice(1);
			return t.set(n, o), o
		}
		return o
	},
	toStringV1 = (e, t, r) => {
		const {
			prefix: n
		} = r, o = t.get(n);
		if (null == o) {
			const o = r.encode(e);
			return t.set(n, o), o
		}
		return o
	},
	DAG_PB_CODE = 112,
	SHA_256_CODE = 18,
	encodeCID = (e, t, r) => {
		const n = encodingLength(e),
			o = n + encodingLength(t),
			i = new Uint8Array(o + r.byteLength);
		return encodeTo(e, i, 0), encodeTo(t, i, n), i.set(r, o), i
	},
	cidSymbol = Symbol.for("@ipld/js-cid/CID"),
	readonly$1 = {
		writable: !1,
		configurable: !1,
		enumerable: !0
	},
	hidden = {
		writable: !1,
		enumerable: !1,
		configurable: !1
	},
	version = "0.0.0-dev",
	deprecate = (e, t) => {
		if (!e.test(version)) throw new Error(t);
		console.warn(t)
	},
	IS_CID_DEPRECATION = "CID.isCID(v) is deprecated and will be removed in the next major release.\nFollowing code pattern:\n\nif (CID.isCID(value)) {\n  doSomethingWithCID(value)\n}\n\nIs replaced with:\n\nconst cid = CID.asCID(value)\nif (cid) {\n  // Make sure to use cid instead of value\n  doSomethingWithCID(cid)\n}\n",
	typeofs = ["string", "number", "bigint", "symbol"],
	objectTypeNames = ["Function", "Generator", "AsyncGenerator", "GeneratorFunction", "AsyncGeneratorFunction", "AsyncFunction", "Observable", "Array", "Buffer", "Object", "RegExp", "Date", "Error", "Map", "Set", "WeakMap", "WeakSet", "ArrayBuffer", "SharedArrayBuffer", "DataView", "Promise", "URL", "HTMLElement", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array"];

function is(e) {
	if (null === e) return "null";
	if (void 0 === e) return "undefined";
	if (!0 === e || !1 === e) return "boolean";
	const t = typeof e;
	if (typeofs.includes(t)) return t;
	if ("function" === t) return "Function";
	if (Array.isArray(e)) return "Array";
	if (isBuffer$1(e)) return "Buffer";
	const r = getObjectType(e);
	return r || "Object"
}

function isBuffer$1(e) {
	return e && e.constructor && e.constructor.isBuffer && e.constructor.isBuffer.call(null, e)
}

function getObjectType(e) {
	const t = Object.prototype.toString.call(e).slice(8, -1);
	if (objectTypeNames.includes(t)) return t
}
class Type {
	constructor(e, t, r) {
		this.major = e, this.majorEncoded = e << 5, this.name = t, this.terminal = r
	}
	toString() {
		return `Type[${this.major}].${this.name}`
	}
	compare(e) {
		return this.major < e.major ? -1 : this.major > e.major ? 1 : 0
	}
}
Type.uint = new Type(0, "uint", !0), Type.negint = new Type(1, "negint", !0), Type.bytes = new Type(2, "bytes", !0), Type.string = new Type(3, "string", !0), Type.array = new Type(4, "array", !1), Type.map = new Type(5, "map", !1), Type.tag = new Type(6, "tag", !1), Type.float = new Type(7, "float", !0), Type.false = new Type(7, "false", !0), Type.true = new Type(7, "true", !0), Type.null = new Type(7, "null", !0), Type.undefined = new Type(7, "undefined", !0), Type.break = new Type(7, "break", !0);
class Token$1 {
	constructor(e, t, r) {
		this.type = e, this.value = t, this.encodedLength = r, this.encodedBytes = void 0, this.byteValue = void 0
	}
	toString() {
		return `Token[${this.type}].${this.value}`
	}
}
const useBuffer = globalThis.process && !globalThis.process.browser && globalThis.Buffer && "function" == typeof globalThis.Buffer.isBuffer,
	textDecoder$1 = new TextDecoder,
	textEncoder$2 = new TextEncoder;

function isBuffer(e) {
	return useBuffer && globalThis.Buffer.isBuffer(e)
}

function asU8A(e) {
	return e instanceof Uint8Array ? isBuffer(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : e : Uint8Array.from(e)
}
const toString = useBuffer ? (e, t, r) => r - t > 64 ? globalThis.Buffer.from(e.subarray(t, r)).toString("utf8") : utf8Slice(e, t, r) : (e, t, r) => r - t > 64 ? textDecoder$1.decode(e.subarray(t, r)) : utf8Slice(e, t, r),
	fromString$2 = useBuffer ? e => e.length > 64 ? globalThis.Buffer.from(e) : utf8ToBytes(e) : e => e.length > 64 ? textEncoder$2.encode(e) : utf8ToBytes(e),
	fromArray = e => Uint8Array.from(e),
	slice = useBuffer ? (e, t, r) => isBuffer(e) ? new Uint8Array(e.subarray(t, r)) : e.slice(t, r) : (e, t, r) => e.slice(t, r),
	concat$2 = useBuffer ? (e, t) => (e = e.map((e => e instanceof Uint8Array ? e : globalThis.Buffer.from(e))), asU8A(globalThis.Buffer.concat(e, t))) : (e, t) => {
		const r = new Uint8Array(t);
		let n = 0;
		for (let t of e) n + t.length > r.length && (t = t.subarray(0, r.length - n)), r.set(t, n), n += t.length;
		return r
	},
	alloc = useBuffer ? e => globalThis.Buffer.allocUnsafe(e) : e => new Uint8Array(e);

function compare(e, t) {
	if (isBuffer(e) && isBuffer(t)) return e.compare(t);
	for (let r = 0; r < e.length; r++)
		if (e[r] !== t[r]) return e[r] < t[r] ? -1 : 1;
	return 0
}

function utf8ToBytes(e, t = 1 / 0) {
	let r;
	const n = e.length;
	let o = null;
	const i = [];
	for (let s = 0; s < n; ++s) {
		if (r = e.charCodeAt(s), r > 55295 && r < 57344) {
			if (!o) {
				if (r > 56319) {
					(t -= 3) > -1 && i.push(239, 191, 189);
					continue
				}
				if (s + 1 === n) {
					(t -= 3) > -1 && i.push(239, 191, 189);
					continue
				}
				o = r;
				continue
			}
			if (r < 56320) {
				(t -= 3) > -1 && i.push(239, 191, 189), o = r;
				continue
			}
			r = 65536 + (o - 55296 << 10 | r - 56320)
		} else o && (t -= 3) > -1 && i.push(239, 191, 189);
		if (o = null, r < 128) {
			if ((t -= 1) < 0) break;
			i.push(r)
		} else if (r < 2048) {
			if ((t -= 2) < 0) break;
			i.push(r >> 6 | 192, 63 & r | 128)
		} else if (r < 65536) {
			if ((t -= 3) < 0) break;
			i.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
		} else {
			if (!(r < 1114112)) throw new Error("Invalid code point");
			if ((t -= 4) < 0) break;
			i.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
		}
	}
	return i
}

function utf8Slice(e, t, r) {
	const n = [];
	for (; t < r;) {
		const o = e[t];
		let i = null,
			s = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
		if (t + s <= r) {
			let r, n, a, c;
			switch (s) {
				case 1:
					o < 128 && (i = o);
					break;
				case 2:
					r = e[t + 1], 128 == (192 & r) && (c = (31 & o) << 6 | 63 & r, c > 127 && (i = c));
					break;
				case 3:
					r = e[t + 1], n = e[t + 2], 128 == (192 & r) && 128 == (192 & n) && (c = (15 & o) << 12 | (63 & r) << 6 | 63 & n, c > 2047 && (c < 55296 || c > 57343) && (i = c));
					break;
				case 4:
					r = e[t + 1], n = e[t + 2], a = e[t + 3], 128 == (192 & r) && 128 == (192 & n) && 128 == (192 & a) && (c = (15 & o) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & a, c > 65535 && c < 1114112 && (i = c))
			}
		}
		null === i ? (i = 65533, s = 1) : i > 65535 && (i -= 65536, n.push(i >>> 10 & 1023 | 55296), i = 56320 | 1023 & i), n.push(i), t += s
	}
	return decodeCodePointsArray(n)
}
const MAX_ARGUMENTS_LENGTH = 4096;

function decodeCodePointsArray(e) {
	const t = e.length;
	if (t <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, e);
	let r = "",
		n = 0;
	for (; n < t;) r += String.fromCharCode.apply(String, e.slice(n, n += MAX_ARGUMENTS_LENGTH));
	return r
}
const defaultChunkSize = 256;
class Bl {
	constructor(e = defaultChunkSize) {
		this.chunkSize = e, this.cursor = 0, this.maxCursor = -1, this.chunks = [], this._initReuseChunk = null
	}
	reset() {
		this.cursor = 0, this.maxCursor = -1, this.chunks.length && (this.chunks = []), null !== this._initReuseChunk && (this.chunks.push(this._initReuseChunk), this.maxCursor = this._initReuseChunk.length - 1)
	}
	push(e) {
		let t = this.chunks[this.chunks.length - 1];
		if (this.cursor + e.length <= this.maxCursor + 1) {
			const r = t.length - (this.maxCursor - this.cursor) - 1;
			t.set(e, r)
		} else {
			if (t) {
				const e = t.length - (this.maxCursor - this.cursor) - 1;
				e < t.length && (this.chunks[this.chunks.length - 1] = t.subarray(0, e), this.maxCursor = this.cursor - 1)
			}
			e.length < 64 && e.length < this.chunkSize ? (t = alloc(this.chunkSize), this.chunks.push(t), this.maxCursor += t.length, null === this._initReuseChunk && (this._initReuseChunk = t), t.set(e, 0)) : (this.chunks.push(e), this.maxCursor += e.length)
		}
		this.cursor += e.length
	}
	toBytes(e = !1) {
		let t;
		if (1 === this.chunks.length) {
			const r = this.chunks[0];
			e && this.cursor > r.length / 2 ? (t = this.cursor === r.length ? r : r.subarray(0, this.cursor), this._initReuseChunk = null, this.chunks = []) : t = slice(r, 0, this.cursor)
		} else t = concat$2(this.chunks, this.cursor);
		return e && this.reset(), t
	}
}
const decodeErrPrefix = "CBOR decode error:",
	encodeErrPrefix = "CBOR encode error:";

function assertEnoughData(e, t, r) {
	if (e.length - t < r) throw new Error(`${decodeErrPrefix} not enough data for type`)
}
const uintBoundaries = [24, 256, 65536, 4294967296, BigInt("18446744073709551616")];

function readUint8(e, t, r) {
	assertEnoughData(e, t, 1);
	const n = e[t];
	if (!0 === r.strict && n < uintBoundaries[0]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	return n
}

function readUint16(e, t, r) {
	assertEnoughData(e, t, 2);
	const n = e[t] << 8 | e[t + 1];
	if (!0 === r.strict && n < uintBoundaries[1]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	return n
}

function readUint32(e, t, r) {
	assertEnoughData(e, t, 4);
	const n = 16777216 * e[t] + (e[t + 1] << 16) + (e[t + 2] << 8) + e[t + 3];
	if (!0 === r.strict && n < uintBoundaries[2]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	return n
}

function readUint64(e, t, r) {
	assertEnoughData(e, t, 8);
	const n = 16777216 * e[t] + (e[t + 1] << 16) + (e[t + 2] << 8) + e[t + 3],
		o = 16777216 * e[t + 4] + (e[t + 5] << 16) + (e[t + 6] << 8) + e[t + 7],
		i = (BigInt(n) << BigInt(32)) + BigInt(o);
	if (!0 === r.strict && i < uintBoundaries[3]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	if (i <= Number.MAX_SAFE_INTEGER) return Number(i);
	if (!0 === r.allowBigInt) return i;
	throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`)
}

function decodeUint8(e, t, r, n) {
	return new Token$1(Type.uint, readUint8(e, t + 1, n), 2)
}

function decodeUint16(e, t, r, n) {
	return new Token$1(Type.uint, readUint16(e, t + 1, n), 3)
}

function decodeUint32(e, t, r, n) {
	return new Token$1(Type.uint, readUint32(e, t + 1, n), 5)
}

function decodeUint64(e, t, r, n) {
	return new Token$1(Type.uint, readUint64(e, t + 1, n), 9)
}

function encodeUint(e, t) {
	return encodeUintValue(e, 0, t.value)
}

function encodeUintValue(e, t, r) {
	if (r < uintBoundaries[0]) {
		const n = Number(r);
		e.push([t | n])
	} else if (r < uintBoundaries[1]) {
		const n = Number(r);
		e.push([24 | t, n])
	} else if (r < uintBoundaries[2]) {
		const n = Number(r);
		e.push([25 | t, n >>> 8, 255 & n])
	} else if (r < uintBoundaries[3]) {
		const n = Number(r);
		e.push([26 | t, n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, 255 & n])
	} else {
		const n = BigInt(r);
		if (!(n < uintBoundaries[4])) throw new Error(`${decodeErrPrefix} encountered BigInt larger than allowable range`); {
			const r = [27 | t, 0, 0, 0, 0, 0, 0, 0];
			let o = Number(n & BigInt(4294967295)),
				i = Number(n >> BigInt(32) & BigInt(4294967295));
			r[8] = 255 & o, o >>= 8, r[7] = 255 & o, o >>= 8, r[6] = 255 & o, o >>= 8, r[5] = 255 & o, r[4] = 255 & i, i >>= 8, r[3] = 255 & i, i >>= 8, r[2] = 255 & i, i >>= 8, r[1] = 255 & i, e.push(r)
		}
	}
}

function decodeNegint8(e, t, r, n) {
	return new Token$1(Type.negint, -1 - readUint8(e, t + 1, n), 2)
}

function decodeNegint16(e, t, r, n) {
	return new Token$1(Type.negint, -1 - readUint16(e, t + 1, n), 3)
}

function decodeNegint32(e, t, r, n) {
	return new Token$1(Type.negint, -1 - readUint32(e, t + 1, n), 5)
}
encodeUint.encodedSize = function(e) {
	return encodeUintValue.encodedSize(e.value)
}, encodeUintValue.encodedSize = function(e) {
	return e < uintBoundaries[0] ? 1 : e < uintBoundaries[1] ? 2 : e < uintBoundaries[2] ? 3 : e < uintBoundaries[3] ? 5 : 9
}, encodeUint.compareTokens = function(e, t) {
	return e.value < t.value ? -1 : e.value > t.value ? 1 : 0
};
const neg1b = BigInt(-1),
	pos1b = BigInt(1);

function decodeNegint64(e, t, r, n) {
	const o = readUint64(e, t + 1, n);
	if ("bigint" != typeof o) {
		const e = -1 - o;
		if (e >= Number.MIN_SAFE_INTEGER) return new Token$1(Type.negint, e, 9)
	}
	if (!0 !== n.allowBigInt) throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
	return new Token$1(Type.negint, neg1b - BigInt(o), 9)
}

function encodeNegint(e, t) {
	const r = t.value,
		n = "bigint" == typeof r ? r * neg1b - pos1b : -1 * r - 1;
	encodeUintValue(e, t.type.majorEncoded, n)
}

function toToken$3(e, t, r, n) {
	assertEnoughData(e, t, r + n);
	const o = slice(e, t + r, t + r + n);
	return new Token$1(Type.bytes, o, r + n)
}

function decodeBytesCompact(e, t, r, n) {
	return toToken$3(e, t, 1, r)
}

function decodeBytes8(e, t, r, n) {
	return toToken$3(e, t, 2, readUint8(e, t + 1, n))
}

function decodeBytes16(e, t, r, n) {
	return toToken$3(e, t, 3, readUint16(e, t + 1, n))
}

function decodeBytes32(e, t, r, n) {
	return toToken$3(e, t, 5, readUint32(e, t + 1, n))
}

function decodeBytes64(e, t, r, n) {
	const o = readUint64(e, t + 1, n);
	if ("bigint" == typeof o) throw new Error(`${decodeErrPrefix} 64-bit integer bytes lengths not supported`);
	return toToken$3(e, t, 9, o)
}

function tokenBytes(e) {
	return void 0 === e.encodedBytes && (e.encodedBytes = e.type === Type.string ? fromString$2(e.value) : e.value), e.encodedBytes
}

function encodeBytes(e, t) {
	const r = tokenBytes(t);
	encodeUintValue(e, t.type.majorEncoded, r.length), e.push(r)
}

function compareBytes(e, t) {
	return e.length < t.length ? -1 : e.length > t.length ? 1 : compare(e, t)
}

function toToken$2(e, t, r, n, o) {
	const i = r + n;
	assertEnoughData(e, t, i);
	const s = new Token$1(Type.string, toString(e, t + r, t + i), i);
	return !0 === o.retainStringBytes && (s.byteValue = slice(e, t + r, t + i)), s
}

function decodeStringCompact(e, t, r, n) {
	return toToken$2(e, t, 1, r, n)
}

function decodeString8(e, t, r, n) {
	return toToken$2(e, t, 2, readUint8(e, t + 1, n), n)
}

function decodeString16(e, t, r, n) {
	return toToken$2(e, t, 3, readUint16(e, t + 1, n), n)
}

function decodeString32(e, t, r, n) {
	return toToken$2(e, t, 5, readUint32(e, t + 1, n), n)
}

function decodeString64(e, t, r, n) {
	const o = readUint64(e, t + 1, n);
	if ("bigint" == typeof o) throw new Error(`${decodeErrPrefix} 64-bit integer string lengths not supported`);
	return toToken$2(e, t, 9, o, n)
}
encodeNegint.encodedSize = function(e) {
	const t = e.value,
		r = "bigint" == typeof t ? t * neg1b - pos1b : -1 * t - 1;
	return r < uintBoundaries[0] ? 1 : r < uintBoundaries[1] ? 2 : r < uintBoundaries[2] ? 3 : r < uintBoundaries[3] ? 5 : 9
}, encodeNegint.compareTokens = function(e, t) {
	return e.value < t.value ? 1 : e.value > t.value ? -1 : 0
}, encodeBytes.encodedSize = function(e) {
	const t = tokenBytes(e);
	return encodeUintValue.encodedSize(t.length) + t.length
}, encodeBytes.compareTokens = function(e, t) {
	return compareBytes(tokenBytes(e), tokenBytes(t))
};
const encodeString = encodeBytes;

function toToken$1(e, t, r, n) {
	return new Token$1(Type.array, n, r)
}

function decodeArrayCompact(e, t, r, n) {
	return toToken$1(e, t, 1, r)
}

function decodeArray8(e, t, r, n) {
	return toToken$1(e, t, 2, readUint8(e, t + 1, n))
}

function decodeArray16(e, t, r, n) {
	return toToken$1(e, t, 3, readUint16(e, t + 1, n))
}

function decodeArray32(e, t, r, n) {
	return toToken$1(e, t, 5, readUint32(e, t + 1, n))
}

function decodeArray64(e, t, r, n) {
	const o = readUint64(e, t + 1, n);
	if ("bigint" == typeof o) throw new Error(`${decodeErrPrefix} 64-bit integer array lengths not supported`);
	return toToken$1(e, t, 9, o)
}

function decodeArrayIndefinite(e, t, r, n) {
	if (!1 === n.allowIndefinite) throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
	return toToken$1(e, t, 1, 1 / 0)
}

function encodeArray(e, t) {
	encodeUintValue(e, Type.array.majorEncoded, t.value)
}

function toToken(e, t, r, n) {
	return new Token$1(Type.map, n, r)
}

function decodeMapCompact(e, t, r, n) {
	return toToken(e, t, 1, r)
}

function decodeMap8(e, t, r, n) {
	return toToken(e, t, 2, readUint8(e, t + 1, n))
}

function decodeMap16(e, t, r, n) {
	return toToken(e, t, 3, readUint16(e, t + 1, n))
}

function decodeMap32(e, t, r, n) {
	return toToken(e, t, 5, readUint32(e, t + 1, n))
}

function decodeMap64(e, t, r, n) {
	const o = readUint64(e, t + 1, n);
	if ("bigint" == typeof o) throw new Error(`${decodeErrPrefix} 64-bit integer map lengths not supported`);
	return toToken(e, t, 9, o)
}

function decodeMapIndefinite(e, t, r, n) {
	if (!1 === n.allowIndefinite) throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
	return toToken(e, t, 1, 1 / 0)
}

function encodeMap(e, t) {
	encodeUintValue(e, Type.map.majorEncoded, t.value)
}

function decodeTagCompact(e, t, r, n) {
	return new Token$1(Type.tag, r, 1)
}

function decodeTag8(e, t, r, n) {
	return new Token$1(Type.tag, readUint8(e, t + 1, n), 2)
}

function decodeTag16(e, t, r, n) {
	return new Token$1(Type.tag, readUint16(e, t + 1, n), 3)
}

function decodeTag32(e, t, r, n) {
	return new Token$1(Type.tag, readUint32(e, t + 1, n), 5)
}

function decodeTag64(e, t, r, n) {
	return new Token$1(Type.tag, readUint64(e, t + 1, n), 9)
}

function encodeTag(e, t) {
	encodeUintValue(e, Type.tag.majorEncoded, t.value)
}
encodeArray.compareTokens = encodeUint.compareTokens, encodeArray.encodedSize = function(e) {
	return encodeUintValue.encodedSize(e.value)
}, encodeMap.compareTokens = encodeUint.compareTokens, encodeMap.encodedSize = function(e) {
	return encodeUintValue.encodedSize(e.value)
}, encodeTag.compareTokens = encodeUint.compareTokens, encodeTag.encodedSize = function(e) {
	return encodeUintValue.encodedSize(e.value)
};
const MINOR_FALSE = 20,
	MINOR_TRUE = 21,
	MINOR_NULL = 22,
	MINOR_UNDEFINED = 23;

function decodeUndefined(e, t, r, n) {
	if (!1 === n.allowUndefined) throw new Error(`${decodeErrPrefix} undefined values are not supported`);
	return !0 === n.coerceUndefinedToNull ? new Token$1(Type.null, null, 1) : new Token$1(Type.undefined, void 0, 1)
}

function decodeBreak(e, t, r, n) {
	if (!1 === n.allowIndefinite) throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
	return new Token$1(Type.break, void 0, 1)
}

function createToken(e, t, r) {
	if (r) {
		if (!1 === r.allowNaN && Number.isNaN(e)) throw new Error(`${decodeErrPrefix} NaN values are not supported`);
		if (!1 === r.allowInfinity && (e === 1 / 0 || e === -1 / 0)) throw new Error(`${decodeErrPrefix} Infinity values are not supported`)
	}
	return new Token$1(Type.float, e, t)
}

function decodeFloat16(e, t, r, n) {
	return createToken(readFloat16(e, t + 1), 3, n)
}

function decodeFloat32(e, t, r, n) {
	return createToken(readFloat32(e, t + 1), 5, n)
}

function decodeFloat64(e, t, r, n) {
	return createToken(readFloat64(e, t + 1), 9, n)
}

function encodeFloat(e, t, r) {
	const n = t.value;
	if (!1 === n) e.push([Type.float.majorEncoded | MINOR_FALSE]);
	else if (!0 === n) e.push([Type.float.majorEncoded | MINOR_TRUE]);
	else if (null === n) e.push([Type.float.majorEncoded | MINOR_NULL]);
	else if (void 0 === n) e.push([Type.float.majorEncoded | MINOR_UNDEFINED]);
	else {
		let t, o = !1;
		r && !0 === r.float64 || (encodeFloat16(n), t = readFloat16(ui8a, 1), n === t || Number.isNaN(n) ? (ui8a[0] = 249, e.push(ui8a.slice(0, 3)), o = !0) : (encodeFloat32(n), t = readFloat32(ui8a, 1), n === t && (ui8a[0] = 250, e.push(ui8a.slice(0, 5)), o = !0))), o || (encodeFloat64(n), t = readFloat64(ui8a, 1), ui8a[0] = 251, e.push(ui8a.slice(0, 9)))
	}
}
encodeFloat.encodedSize = function(e, t) {
	const r = e.value;
	if (!1 === r || !0 === r || null == r) return 1;
	if (!t || !0 !== t.float64) {
		encodeFloat16(r);
		let e = readFloat16(ui8a, 1);
		if (r === e || Number.isNaN(r)) return 3;
		if (encodeFloat32(r), e = readFloat32(ui8a, 1), r === e) return 5
	}
	return 9
};
const buffer$1 = new ArrayBuffer(9),
	dataView = new DataView(buffer$1, 1),
	ui8a = new Uint8Array(buffer$1, 0);

function encodeFloat16(e) {
	if (e === 1 / 0) dataView.setUint16(0, 31744, !1);
	else if (e === -1 / 0) dataView.setUint16(0, 64512, !1);
	else if (Number.isNaN(e)) dataView.setUint16(0, 32256, !1);
	else {
		dataView.setFloat32(0, e);
		const t = dataView.getUint32(0),
			r = (2139095040 & t) >> 23,
			n = 8388607 & t;
		if (255 === r) dataView.setUint16(0, 31744, !1);
		else if (0 === r) dataView.setUint16(0, (2147483648 & e) >> 16 | n >> 13, !1);
		else {
			const e = r - 127;
			e < -24 ? dataView.setUint16(0, 0) : e < -14 ? dataView.setUint16(0, (2147483648 & t) >> 16 | 1 << 24 + e, !1) : dataView.setUint16(0, (2147483648 & t) >> 16 | e + 15 << 10 | n >> 13, !1)
		}
	}
}

function readFloat16(e, t) {
	if (e.length - t < 2) throw new Error(`${decodeErrPrefix} not enough data for float16`);
	const r = (e[t] << 8) + e[t + 1];
	if (31744 === r) return 1 / 0;
	if (64512 === r) return -1 / 0;
	if (32256 === r) return NaN;
	const n = r >> 10 & 31,
		o = 1023 & r;
	let i;
	return i = 0 === n ? o * 2 ** -24 : 31 !== n ? (o + 1024) * 2 ** (n - 25) : 0 === o ? 1 / 0 : NaN, 32768 & r ? -i : i
}

function encodeFloat32(e) {
	dataView.setFloat32(0, e, !1)
}

function readFloat32(e, t) {
	if (e.length - t < 4) throw new Error(`${decodeErrPrefix} not enough data for float32`);
	const r = (e.byteOffset || 0) + t;
	return new DataView(e.buffer, r, 4).getFloat32(0, !1)
}

function encodeFloat64(e) {
	dataView.setFloat64(0, e, !1)
}

function readFloat64(e, t) {
	if (e.length - t < 8) throw new Error(`${decodeErrPrefix} not enough data for float64`);
	const r = (e.byteOffset || 0) + t;
	return new DataView(e.buffer, r, 8).getFloat64(0, !1)
}

function invalidMinor(e, t, r) {
	throw new Error(`${decodeErrPrefix} encountered invalid minor (${r}) for major ${e[t]>>>5}`)
}

function errorer(e) {
	return () => {
		throw new Error(`${decodeErrPrefix} ${e}`)
	}
}
encodeFloat.compareTokens = encodeUint.compareTokens;
const jump = [];
for (let e = 0; e <= 23; e++) jump[e] = invalidMinor;
jump[24] = decodeUint8, jump[25] = decodeUint16, jump[26] = decodeUint32, jump[27] = decodeUint64, jump[28] = invalidMinor, jump[29] = invalidMinor, jump[30] = invalidMinor, jump[31] = invalidMinor;
for (let e = 32; e <= 55; e++) jump[e] = invalidMinor;
jump[56] = decodeNegint8, jump[57] = decodeNegint16, jump[58] = decodeNegint32, jump[59] = decodeNegint64, jump[60] = invalidMinor, jump[61] = invalidMinor, jump[62] = invalidMinor, jump[63] = invalidMinor;
for (let e = 64; e <= 87; e++) jump[e] = decodeBytesCompact;
jump[88] = decodeBytes8, jump[89] = decodeBytes16, jump[90] = decodeBytes32, jump[91] = decodeBytes64, jump[92] = invalidMinor, jump[93] = invalidMinor, jump[94] = invalidMinor, jump[95] = errorer("indefinite length bytes/strings are not supported");
for (let e = 96; e <= 119; e++) jump[e] = decodeStringCompact;
jump[120] = decodeString8, jump[121] = decodeString16, jump[122] = decodeString32, jump[123] = decodeString64, jump[124] = invalidMinor, jump[125] = invalidMinor, jump[126] = invalidMinor, jump[127] = errorer("indefinite length bytes/strings are not supported");
for (let e = 128; e <= 151; e++) jump[e] = decodeArrayCompact;
jump[152] = decodeArray8, jump[153] = decodeArray16, jump[154] = decodeArray32, jump[155] = decodeArray64, jump[156] = invalidMinor, jump[157] = invalidMinor, jump[158] = invalidMinor, jump[159] = decodeArrayIndefinite;
for (let e = 160; e <= 183; e++) jump[e] = decodeMapCompact;
jump[184] = decodeMap8, jump[185] = decodeMap16, jump[186] = decodeMap32, jump[187] = decodeMap64, jump[188] = invalidMinor, jump[189] = invalidMinor, jump[190] = invalidMinor, jump[191] = decodeMapIndefinite;
for (let e = 192; e <= 215; e++) jump[e] = decodeTagCompact;
jump[216] = decodeTag8, jump[217] = decodeTag16, jump[218] = decodeTag32, jump[219] = decodeTag64, jump[220] = invalidMinor, jump[221] = invalidMinor, jump[222] = invalidMinor, jump[223] = invalidMinor;
for (let e = 224; e <= 243; e++) jump[e] = errorer("simple values are not supported");
jump[244] = invalidMinor, jump[245] = invalidMinor, jump[246] = invalidMinor, jump[247] = decodeUndefined, jump[248] = errorer("simple values are not supported"), jump[249] = decodeFloat16, jump[250] = decodeFloat32, jump[251] = decodeFloat64, jump[252] = invalidMinor, jump[253] = invalidMinor, jump[254] = invalidMinor, jump[255] = decodeBreak;
const quick = [];
for (let e = 0; e < 24; e++) quick[e] = new Token$1(Type.uint, e, 1);
for (let e = -1; e >= -24; e--) quick[31 - e] = new Token$1(Type.negint, e, 1);

function quickEncodeToken(e) {
	switch (e.type) {
		case Type.false:
			return fromArray([244]);
		case Type.true:
			return fromArray([245]);
		case Type.null:
			return fromArray([246]);
		case Type.bytes:
			return e.value.length ? void 0 : fromArray([64]);
		case Type.string:
			return "" === e.value ? fromArray([96]) : void 0;
		case Type.array:
			return 0 === e.value ? fromArray([128]) : void 0;
		case Type.map:
			return 0 === e.value ? fromArray([160]) : void 0;
		case Type.uint:
			return e.value < 24 ? fromArray([Number(e.value)]) : void 0;
		case Type.negint:
			if (e.value >= -24) return fromArray([31 - Number(e.value)])
	}
}
quick[64] = new Token$1(Type.bytes, new Uint8Array(0), 1), quick[96] = new Token$1(Type.string, "", 1), quick[128] = new Token$1(Type.array, 0, 1), quick[160] = new Token$1(Type.map, 0, 1), quick[244] = new Token$1(Type.false, !1, 1), quick[245] = new Token$1(Type.true, !0, 1), quick[246] = new Token$1(Type.null, null, 1);
const defaultEncodeOptions = {
	float64: !1,
	mapSorter: mapSorter,
	quickEncodeToken: quickEncodeToken
};

function makeCborEncoders() {
	const e = [];
	return e[Type.uint.major] = encodeUint, e[Type.negint.major] = encodeNegint, e[Type.bytes.major] = encodeBytes, e[Type.string.major] = encodeString, e[Type.array.major] = encodeArray, e[Type.map.major] = encodeMap, e[Type.tag.major] = encodeTag, e[Type.float.major] = encodeFloat, e
}
const cborEncoders = makeCborEncoders(),
	buf = new Bl;
class Ref {
	constructor(e, t) {
		this.obj = e, this.parent = t
	}
	includes(e) {
		let t = this;
		do {
			if (t.obj === e) return !0
		} while (t = t.parent);
		return !1
	}
	static createCheck(e, t) {
		if (e && e.includes(t)) throw new Error(`${encodeErrPrefix} object contains circular references`);
		return new Ref(t, e)
	}
}
const simpleTokens = {
		null: new Token$1(Type.null, null),
		undefined: new Token$1(Type.undefined, void 0),
		true: new Token$1(Type.true, !0),
		false: new Token$1(Type.false, !1),
		emptyArray: new Token$1(Type.array, 0),
		emptyMap: new Token$1(Type.map, 0)
	},
	typeEncoders = {
		number: (e, t, r, n) => Number.isInteger(e) && Number.isSafeInteger(e) ? new Token$1(e >= 0 ? Type.uint : Type.negint, e) : new Token$1(Type.float, e),
		bigint: (e, t, r, n) => e >= BigInt(0) ? new Token$1(Type.uint, e) : new Token$1(Type.negint, e),
		Uint8Array: (e, t, r, n) => new Token$1(Type.bytes, e),
		string: (e, t, r, n) => new Token$1(Type.string, e),
		boolean: (e, t, r, n) => e ? simpleTokens.true : simpleTokens.false,
		null: (e, t, r, n) => simpleTokens.null,
		undefined: (e, t, r, n) => simpleTokens.undefined,
		ArrayBuffer: (e, t, r, n) => new Token$1(Type.bytes, new Uint8Array(e)),
		DataView: (e, t, r, n) => new Token$1(Type.bytes, new Uint8Array(e.buffer, e.byteOffset, e.byteLength)),
		Array(e, t, r, n) {
			if (!e.length) return !0 === r.addBreakTokens ? [simpleTokens.emptyArray, new Token$1(Type.break)] : simpleTokens.emptyArray;
			n = Ref.createCheck(n, e);
			const o = [];
			let i = 0;
			for (const t of e) o[i++] = objectToTokens(t, r, n);
			return r.addBreakTokens ? [new Token$1(Type.array, e.length), o, new Token$1(Type.break)] : [new Token$1(Type.array, e.length), o]
		},
		Object(e, t, r, n) {
			const o = "Object" !== t,
				i = o ? e.keys() : Object.keys(e),
				s = o ? e.size : i.length;
			if (!s) return !0 === r.addBreakTokens ? [simpleTokens.emptyMap, new Token$1(Type.break)] : simpleTokens.emptyMap;
			n = Ref.createCheck(n, e);
			const a = [];
			let c = 0;
			for (const t of i) a[c++] = [objectToTokens(t, r, n), objectToTokens(o ? e.get(t) : e[t], r, n)];
			return sortMapEntries(a, r), r.addBreakTokens ? [new Token$1(Type.map, s), a, new Token$1(Type.break)] : [new Token$1(Type.map, s), a]
		}
	};
typeEncoders.Map = typeEncoders.Object, typeEncoders.Buffer = typeEncoders.Uint8Array;
for (const e of "Uint8Clamped Uint16 Uint32 Int8 Int16 Int32 BigUint64 BigInt64 Float32 Float64".split(" ")) typeEncoders[`${e}Array`] = typeEncoders.DataView;

function objectToTokens(e, t = {}, r) {
	const n = is(e),
		o = t && t.typeEncoders && t.typeEncoders[n] || typeEncoders[n];
	if ("function" == typeof o) {
		const i = o(e, n, t, r);
		if (null != i) return i
	}
	const i = typeEncoders[n];
	if (!i) throw new Error(`${encodeErrPrefix} unsupported type: ${n}`);
	return i(e, n, t, r)
}

function sortMapEntries(e, t) {
	t.mapSorter && e.sort(t.mapSorter)
}

function mapSorter(e, t) {
	const r = Array.isArray(e[0]) ? e[0][0] : e[0],
		n = Array.isArray(t[0]) ? t[0][0] : t[0];
	if (r.type !== n.type) return r.type.compare(n.type);
	const o = r.type.major,
		i = cborEncoders[o].compareTokens(r, n);
	return 0 === i && console.warn("WARNING: complex key types used, CBOR key sorting guarantees are gone"), i
}

function tokensToEncoded(e, t, r, n) {
	if (Array.isArray(t))
		for (const o of t) tokensToEncoded(e, o, r, n);
	else r[t.type.major](e, t, n)
}

function encodeCustom(e, t, r) {
	const n = objectToTokens(e, r);
	if (!Array.isArray(n) && r.quickEncodeToken) {
		const e = r.quickEncodeToken(n);
		if (e) return e;
		const o = t[n.type.major];
		if (o.encodedSize) {
			const e = o.encodedSize(n, r),
				t = new Bl(e);
			if (o(t, n, r), 1 !== t.chunks.length) throw new Error(`Unexpected error: pre-calculated length for ${n} was wrong`);
			return asU8A(t.chunks[0])
		}
	}
	return buf.reset(), tokensToEncoded(buf, n, t, r), buf.toBytes(!0)
}

function encode$6(e, t) {
	return t = Object.assign({}, defaultEncodeOptions, t), encodeCustom(e, cborEncoders, t)
}
const defaultDecodeOptions = {
	strict: !1,
	allowIndefinite: !0,
	allowUndefined: !0,
	allowBigInt: !0
};
class Tokeniser {
	constructor(e, t = {}) {
		this.pos = 0, this.data = e, this.options = t
	}
	done() {
		return this.pos >= this.data.length
	}
	next() {
		const e = this.data[this.pos];
		let t = quick[e];
		if (void 0 === t) {
			const r = jump[e];
			if (!r) throw new Error(`${decodeErrPrefix} no decoder for major type ${e>>>5} (byte 0x${e.toString(16).padStart(2,"0")})`);
			const n = 31 & e;
			t = r(this.data, this.pos, n, this.options)
		}
		return this.pos += t.encodedLength, t
	}
}
const DONE = Symbol.for("DONE"),
	BREAK = Symbol.for("BREAK");

function tokenToArray(e, t, r) {
	const n = [];
	for (let o = 0; o < e.value; o++) {
		const i = tokensToObject(t, r);
		if (i === BREAK) {
			if (e.value === 1 / 0) break;
			throw new Error(`${decodeErrPrefix} got unexpected break to lengthed array`)
		}
		if (i === DONE) throw new Error(`${decodeErrPrefix} found array but not enough entries (got ${o}, expected ${e.value})`);
		n[o] = i
	}
	return n
}

function tokenToMap(e, t, r) {
	const n = !0 === r.useMaps,
		o = n ? void 0 : {},
		i = n ? new Map : void 0;
	for (let s = 0; s < e.value; s++) {
		const a = tokensToObject(t, r);
		if (a === BREAK) {
			if (e.value === 1 / 0) break;
			throw new Error(`${decodeErrPrefix} got unexpected break to lengthed map`)
		}
		if (a === DONE) throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${s} [no key], expected ${e.value})`);
		if (!0 !== n && "string" != typeof a) throw new Error(`${decodeErrPrefix} non-string keys not supported (got ${typeof a})`);
		const c = tokensToObject(t, r);
		if (c === DONE) throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${s} [no value], expected ${e.value})`);
		n ? i.set(a, c) : o[a] = c
	}
	return n ? i : o
}

function tokensToObject(e, t) {
	if (e.done()) return DONE;
	const r = e.next();
	if (r.type === Type.break) return BREAK;
	if (r.type.terminal) return r.value;
	if (r.type === Type.array) return tokenToArray(r, e, t);
	if (r.type === Type.map) return tokenToMap(r, e, t);
	if (r.type === Type.tag) {
		if (t.tags && "function" == typeof t.tags[r.value]) {
			const n = tokensToObject(e, t);
			return t.tags[r.value](n)
		}
		throw new Error(`${decodeErrPrefix} tag not supported (${r.value})`)
	}
	throw new Error("unsupported")
}

function decode$5(e, t) {
	if (!(e instanceof Uint8Array)) throw new Error(`${decodeErrPrefix} data to decode must be a Uint8Array`);
	const r = (t = Object.assign({}, defaultDecodeOptions, t)).tokenizer || new Tokeniser(e, t),
		n = tokensToObject(r, t);
	if (n === DONE) throw new Error(`${decodeErrPrefix} did not find any content to decode`);
	if (n === BREAK) throw new Error(`${decodeErrPrefix} got unexpected break`);
	if (!r.done()) throw new Error(`${decodeErrPrefix} too many terminals, data makes no sense`);
	return n
}
const CID_CBOR_TAG$1 = 42;

function cidEncoder$1(e) {
	if (e.asCID !== e) return null;
	const t = CID.asCID(e);
	if (!t) return null;
	const r = new Uint8Array(t.bytes.byteLength + 1);
	return r.set(t.bytes, 1), [new Token$1(Type.tag, CID_CBOR_TAG$1), new Token$1(Type.bytes, r)]
}

function undefinedEncoder$1() {
	throw new Error("`undefined` is not supported by the IPLD Data Model and cannot be encoded")
}

function numberEncoder$1(e) {
	if (Number.isNaN(e)) throw new Error("`NaN` is not supported by the IPLD Data Model and cannot be encoded");
	if (e === 1 / 0 || e === -1 / 0) throw new Error("`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded");
	return null
}
const encodeOptions$1 = {
	float64: !0,
	typeEncoders: {
		Object: cidEncoder$1,
		undefined: undefinedEncoder$1,
		number: numberEncoder$1
	}
};

function cidDecoder$1(e) {
	if (0 !== e[0]) throw new Error("Invalid CID for CBOR tag 42; expected leading 0x00");
	return CID.decode(e.subarray(1))
}
const decodeOptions$1 = {
	allowIndefinite: !1,
	coerceUndefinedToNull: !0,
	allowNaN: !1,
	allowInfinity: !1,
	allowBigInt: !0,
	strict: !0,
	useMaps: !1,
	tags: []
};
decodeOptions$1.tags[CID_CBOR_TAG$1] = cidDecoder$1;
const encode$5 = e => encode$6(e, encodeOptions$1),
	decode$4 = e => decode$5(e, decodeOptions$1),
	CIDV0_BYTES = {
		SHA2_256: 18,
		LENGTH: 32,
		DAG_PB: 112
	};
async function readVarint(e) {
	const t = await e.upTo(8),
		r = varint$1.decode(t);
	return e.seek(varint$1.decode.bytes), r
}
async function readHeader(e) {
	const t = await readVarint(e);
	if (0 === t) throw new Error("Invalid CAR header (zero length)");
	const r = await e.exactly(t);
	e.seek(t);
	const n = decode$4(r);
	if (null == n || Array.isArray(n) || "object" != typeof n) throw new Error("Invalid CAR header format");
	if (1 !== n.version) {
		if ("string" == typeof n.version) throw new Error(`Invalid CAR version: "${n.version}"`);
		throw new Error(`Invalid CAR version: ${n.version}`)
	}
	if (!Array.isArray(n.roots)) throw new Error("Invalid CAR header format");
	if (Object.keys(n).filter((e => "roots" !== e && "version" !== e)).length) throw new Error("Invalid CAR header format");
	return n
}
async function readMultihash(e) {
	const t = await e.upTo(8);
	varint$1.decode(t);
	const r = varint$1.decode.bytes,
		n = varint$1.decode(t.subarray(varint$1.decode.bytes)),
		o = r + varint$1.decode.bytes + n,
		i = await e.exactly(o);
	return e.seek(o), i
}
async function readCid(e) {
	const t = await e.exactly(2);
	if (t[0] === CIDV0_BYTES.SHA2_256 && t[1] === CIDV0_BYTES.LENGTH) {
		const t = await e.exactly(34);
		e.seek(34);
		const r = decode$7(t);
		return CID.create(0, CIDV0_BYTES.DAG_PB, r)
	}
	const r = await readVarint(e);
	if (1 !== r) throw new Error(`Unexpected CID version (${r})`);
	const n = await readVarint(e),
		o = await readMultihash(e),
		i = decode$7(o);
	return CID.create(r, n, i)
}
async function readBlockHead(e) {
	const t = e.pos;
	let r = await readVarint(e);
	if (0 === r) throw new Error("Invalid CAR section (zero length)");
	r += e.pos - t;
	return {
		cid: await readCid(e),
		length: r,
		blockLength: r - (e.pos - t)
	}
}
async function readBlock(e) {
	const {
		cid: t,
		blockLength: r
	} = await readBlockHead(e), n = await e.exactly(r);
	return e.seek(r), {
		bytes: n,
		cid: t
	}
}
async function readBlockIndex(e) {
	const t = e.pos,
		{
			cid: r,
			length: n,
			blockLength: o
		} = await readBlockHead(e),
		i = {
			cid: r,
			length: n,
			blockLength: o,
			offset: t,
			blockOffset: e.pos
		};
	return e.seek(i.blockLength), i
}

function createDecoder(e) {
	const t = readHeader(e);
	return {
		header: () => t,
		async *blocks() {
			for (await t;
				(await e.upTo(8)).length > 0;) yield await readBlock(e)
		},
		async *blocksIndex() {
			for (await t;
				(await e.upTo(8)).length > 0;) yield await readBlockIndex(e)
		}
	}
}

function bytesReader(e) {
	let t = 0;
	return {
		upTo: async r => e.subarray(t, t + Math.min(r, e.length - t)),
		async exactly(r) {
			if (r > e.length - t) throw new Error("Unexpected end of data");
			return e.subarray(t, t + r)
		},
		seek(e) {
			t += e
		},
		get pos() {
			return t
		}
	}
}

function chunkReader(e) {
	let t = 0,
		r = 0,
		n = 0,
		o = new Uint8Array(0);
	const i = async t => {
		r = o.length - n;
		const i = [o.subarray(n)];
		for (; r < t;) {
			const t = await e();
			if (null == t) break;
			r < 0 ? t.length > r && i.push(t.subarray(-r)) : i.push(t), r += t.length
		}
		o = new Uint8Array(i.reduce(((e, t) => e + t.length), 0));
		let s = 0;
		for (const e of i) o.set(e, s), s += e.length;
		n = 0
	};
	return {
		upTo: async e => (o.length - n < e && await i(e), o.subarray(n, n + Math.min(o.length - n, e))),
		async exactly(e) {
			if (o.length - n < e && await i(e), o.length - n < e) throw new Error("Unexpected end of data");
			return o.subarray(n, n + e)
		},
		seek(e) {
			t += e, n += e
		},
		get pos() {
			return t
		}
	}
}

function asyncIterableReader(e) {
	const t = e[Symbol.asyncIterator]();
	return chunkReader((async function() {
		const e = await t.next();
		return e.done ? null : e.value
	}))
}
class CarReader {
	constructor(e, t, r) {
		this._version = e, this._roots = t, this._blocks = r, this._keys = r.map((e => e.cid.toString()))
	}
	get version() {
		return this._version
	}
	async getRoots() {
		return this._roots
	}
	async has(e) {
		return this._keys.indexOf(e.toString()) > -1
	}
	async get(e) {
		const t = this._keys.indexOf(e.toString());
		return t > -1 ? this._blocks[t] : void 0
	}
	async *blocks() {
		for (const e of this._blocks) yield e
	}
	async *cids() {
		for (const e of this._blocks) yield e.cid
	}
	static async fromBytes(e) {
		if (!(e instanceof Uint8Array)) throw new TypeError("fromBytes() requires a Uint8Array");
		return decodeReaderComplete(bytesReader(e))
	}
	static async fromIterable(e) {
		if (!e || "function" != typeof e[Symbol.asyncIterator]) throw new TypeError("fromIterable() requires an async iterable");
		return decodeReaderComplete(asyncIterableReader(e))
	}
}
async function decodeReaderComplete(e) {
	const t = createDecoder(e),
		{
			version: r,
			roots: n
		} = await t.header(),
		o = [];
	for await (const e of t.blocks()) o.push(e);
	return new CarReader(r, n, o)
}

function createHeader(e) {
	const t = encode$5({
			version: 1,
			roots: e
		}),
		r = varint$1.encode(t.length),
		n = new Uint8Array(r.length + t.length);
	return n.set(r, 0), n.set(t, r.length), n
}

function createEncoder(e) {
	return {
		async setRoots(t) {
			const r = createHeader(t);
			await e.write(r)
		},
		async writeBlock(t) {
			const {
				cid: r,
				bytes: n
			} = t;
			await e.write(new Uint8Array(varint$1.encode(r.bytes.length + n.length))), await e.write(r.bytes), n.length && await e.write(n)
		},
		close: async () => e.end()
	}
}

function noop$1() {}

function create$3() {
	const e = [];
	let t = null,
		r = noop$1,
		n = !1,
		o = null,
		i = noop$1;
	const s = () => (t || (t = new Promise((e => {
			r = () => {
				t = null, r = noop$1, e()
			}
		}))), t),
		a = {
			write(t) {
				e.push(t);
				const r = s();
				return i(), r
			},
			async end() {
				n = !0;
				const e = s();
				return i(), e
			}
		},
		c = {
			async next() {
				const t = e.shift();
				return t ? (0 === e.length && r(), {
					done: !1,
					value: t
				}) : n ? (r(), {
					done: !0,
					value: void 0
				}) : (o || (o = new Promise((e => {
					i = () => (o = null, i = noop$1, e(c.next()))
				}))), o)
			}
		};
	return {
		writer: a,
		iterator: c
	}
}
class CarWriter {
	constructor(e, t) {
		this._encoder = t, this._mutex = t.setRoots(e), this._ended = !1
	}
	async put(e) {
		if (!(e.bytes instanceof Uint8Array && e.cid)) throw new TypeError("Can only write {cid, bytes} objects");
		if (this._ended) throw new Error("Already closed");
		const t = CID.asCID(e.cid);
		if (!t) throw new TypeError("Can only write {cid, bytes} objects");
		return this._mutex = this._mutex.then((() => this._encoder.writeBlock({
			cid: t,
			bytes: e.bytes
		}))), this._mutex
	}
	async close() {
		if (this._ended) throw new Error("Already closed");
		return await this._mutex, this._ended = !0, this._encoder.close()
	}
	static create(e) {
		e = toRoots(e);
		const {
			encoder: t,
			iterator: r
		} = encodeWriter();
		return {
			writer: new CarWriter(e, t),
			out: new CarWriterOut(r)
		}
	}
	static createAppender() {
		const {
			encoder: e,
			iterator: t
		} = encodeWriter();
		e.setRoots = () => Promise.resolve();
		return {
			writer: new CarWriter([], e),
			out: new CarWriterOut(t)
		}
	}
	static async updateRootsInBytes(e, t) {
		const r = bytesReader(e);
		await readHeader(r);
		const n = createHeader(t);
		if (r.pos !== n.length) throw new Error(`updateRoots() can only overwrite a header of the same length (old header is ${r.pos} bytes, new header is ${n.length} bytes)`);
		return e.set(n, 0), e
	}
}
class CarWriterOut {
	constructor(e) {
		this._iterator = e
	} [Symbol.asyncIterator]() {
		if (this._iterating) throw new Error("Multiple iterator not supported");
		return this._iterating = !0, this._iterator
	}
}

function encodeWriter() {
	const e = create$3(),
		{
			writer: t,
			iterator: r
		} = e;
	return {
		encoder: createEncoder(t),
		iterator: r
	}
}

function toRoots(e) {
	if (void 0 === e) return [];
	if (!Array.isArray(e)) {
		const t = CID.asCID(e);
		if (!t) throw new TypeError("roots must be a single CID or an array of CIDs");
		return [t]
	}
	const t = [];
	for (const r of e) {
		const e = CID.asCID(r);
		if (!e) throw new TypeError("roots must be a single CID or an array of CIDs");
		t.push(e)
	}
	return t
}
const from = ({
	name: e,
	code: t,
	encode: r
}) => new Hasher(e, t, r);
class Hasher {
	constructor(e, t, r) {
		this.name = e, this.code = t, this.encode = r
	}
	digest(e) {
		if (e instanceof Uint8Array) {
			const t = this.encode(e);
			return t instanceof Uint8Array ? create$4(this.code, t) : t.then((e => create$4(this.code, e)))
		}
		throw Error("Unknown type, must be binary type")
	}
}
const readonly = ({
		enumerable: e = !0,
		configurable: t = !1
	} = {}) => ({
		enumerable: e,
		configurable: t,
		writable: !1
	}),
	links = function*(e, t) {
		if (null != e && !(e instanceof Uint8Array))
			for (const [r, n] of Object.entries(e)) {
				const e = [...t, r];
				if (null != n && "object" == typeof n)
					if (Array.isArray(n))
						for (const [t, r] of n.entries()) {
							const n = [...e, t],
								o = CID.asCID(r);
							o ? yield [n.join("/"), o]: "object" == typeof r && (yield* links(r, n))
						} else {
							const t = CID.asCID(n);
							t ? yield [e.join("/"), t]: yield* links(n, e)
						}
			}
	},
	tree = function*(e, t) {
		if (null != e)
			for (const [r, n] of Object.entries(e)) {
				const e = [...t, r];
				if (yield e.join("/"), !(null == n || n instanceof Uint8Array || "object" != typeof n || CID.asCID(n)))
					if (Array.isArray(n))
						for (const [t, r] of n.entries()) {
							const n = [...e, t];
							yield n.join("/"), "object" != typeof r || CID.asCID(r) || (yield* tree(r, n))
						} else yield* tree(n, e)
			}
	},
	get = (e, t) => {
		let r = e;
		for (const [e, n] of t.entries()) {
			if (r = r[n], null == r) throw new Error(`Object has no property at ${t.slice(0,e+1).map((e=>`[${JSON.stringify(e)}]`)).join("")}`);
			const o = CID.asCID(r);
			if (o) return {
				value: o,
				remaining: t.slice(e + 1).join("/")
			}
		}
		return {
			value: r
		}
	};
class Block {
	constructor({
		cid: e,
		bytes: t,
		value: r
	}) {
		if (!e || !t || void 0 === r) throw new Error("Missing required argument");
		this.cid = e, this.bytes = t, this.value = r, this.asBlock = this, Object.defineProperties(this, {
			cid: readonly(),
			bytes: readonly(),
			value: readonly(),
			asBlock: readonly()
		})
	}
	links() {
		return links(this.value, [])
	}
	tree() {
		return tree(this.value, [])
	}
	get(e = "/") {
		return get(this.value, e.split("/").filter(Boolean))
	}
}
const encode$4 = async ({
	value: e,
	codec: t,
	hasher: r
}) => {
	if (void 0 === e) throw new Error('Missing required argument "value"');
	if (!t || !r) throw new Error("Missing required argument: codec or hasher");
	const n = t.encode(e),
		o = await r.digest(n),
		i = CID.create(1, t.code, o);
	return new Block({
		value: e,
		bytes: n,
		cid: i
	})
}, name$2 = "raw", code$3 = 85, encode$3 = e => coerce(e), decode$3 = e => coerce(e);
var raw = Object.freeze({
	__proto__: null,
	name: name$2,
	code: code$3,
	encode: encode$3,
	decode: decode$3
});
const CID_CBOR_TAG = 42;

function cidEncoder(e) {
	if (e.asCID !== e) return null;
	const t = CID.asCID(e);
	if (!t) return null;
	const r = new Uint8Array(t.bytes.byteLength + 1);
	return r.set(t.bytes, 1), [new Token$1(Type.tag, CID_CBOR_TAG), new Token$1(Type.bytes, r)]
}

function undefinedEncoder() {
	throw new Error("`undefined` is not supported by the IPLD Data Model and cannot be encoded")
}

function numberEncoder(e) {
	if (Number.isNaN(e)) throw new Error("`NaN` is not supported by the IPLD Data Model and cannot be encoded");
	if (e === 1 / 0 || e === -1 / 0) throw new Error("`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded");
	return null
}
const encodeOptions = {
	float64: !0,
	typeEncoders: {
		Object: cidEncoder,
		undefined: undefinedEncoder,
		number: numberEncoder
	}
};

function cidDecoder(e) {
	if (0 !== e[0]) throw new Error("Invalid CID for CBOR tag 42; expected leading 0x00");
	return CID.decode(e.subarray(1))
}
const decodeOptions = {
	allowIndefinite: !1,
	allowUndefined: !1,
	allowNaN: !1,
	allowInfinity: !1,
	allowBigInt: !0,
	strict: !0,
	useMaps: !1,
	tags: []
};
decodeOptions.tags[CID_CBOR_TAG] = cidDecoder;
const name$1 = "dag-cbor",
	code$2 = 113,
	encode$2 = e => encode$6(e, encodeOptions),
	decode$2 = e => decode$5(e, decodeOptions);
var dagCbor = Object.freeze({
	__proto__: null,
	name: name$1,
	code: code$2,
	encode: encode$2,
	decode: decode$2
});
const textDecoder = new TextDecoder;

function decodeVarint(e, t) {
	let r = 0;
	for (let n = 0;; n += 7) {
		if (n >= 64) throw new Error("protobuf: varint overflow");
		if (t >= e.length) throw new Error("protobuf: unexpected end of data");
		const o = e[t++];
		if (r += n < 28 ? (127 & o) << n : (127 & o) * 2 ** n, o < 128) break
	}
	return [r, t]
}

function decodeBytes(e, t) {
	let r;
	[r, t] = decodeVarint(e, t);
	const n = t + r;
	if (r < 0 || n < 0) throw new Error("protobuf: invalid length");
	if (n > e.length) throw new Error("protobuf: unexpected end of data");
	return [e.subarray(t, n), n]
}

function decodeKey(e, t) {
	let r;
	return [r, t] = decodeVarint(e, t), [7 & r, r >> 3, t]
}

function decodeLink(e) {
	const t = {},
		r = e.length;
	let n = 0;
	for (; n < r;) {
		let r, o;
		if ([r, o, n] = decodeKey(e, n), 1 === o) {
			if (t.Hash) throw new Error("protobuf: (PBLink) duplicate Hash section");
			if (2 !== r) throw new Error(`protobuf: (PBLink) wrong wireType (${r}) for Hash`);
			if (void 0 !== t.Name) throw new Error("protobuf: (PBLink) invalid order, found Name before Hash");
			if (void 0 !== t.Tsize) throw new Error("protobuf: (PBLink) invalid order, found Tsize before Hash");
			[t.Hash, n] = decodeBytes(e, n)
		} else if (2 === o) {
			if (void 0 !== t.Name) throw new Error("protobuf: (PBLink) duplicate Name section");
			if (2 !== r) throw new Error(`protobuf: (PBLink) wrong wireType (${r}) for Name`);
			if (void 0 !== t.Tsize) throw new Error("protobuf: (PBLink) invalid order, found Tsize before Name");
			let o;
			[o, n] = decodeBytes(e, n), t.Name = textDecoder.decode(o)
		} else {
			if (3 !== o) throw new Error(`protobuf: (PBLink) invalid fieldNumber, expected 1, 2 or 3, got ${o}`);
			if (void 0 !== t.Tsize) throw new Error("protobuf: (PBLink) duplicate Tsize section");
			if (0 !== r) throw new Error(`protobuf: (PBLink) wrong wireType (${r}) for Tsize`);
			[t.Tsize, n] = decodeVarint(e, n)
		}
	}
	if (n > r) throw new Error("protobuf: (PBLink) unexpected end of data");
	return t
}

function decodeNode(e) {
	const t = e.length;
	let r, n, o = 0,
		i = !1;
	for (; o < t;) {
		let t, s;
		if ([t, s, o] = decodeKey(e, o), 2 !== t) throw new Error(`protobuf: (PBNode) invalid wireType, expected 2, got ${t}`);
		if (1 === s) {
			if (n) throw new Error("protobuf: (PBNode) duplicate Data section");
			[n, o] = decodeBytes(e, o), r && (i = !0)
		} else {
			if (2 !== s) throw new Error(`protobuf: (PBNode) invalid fieldNumber, expected 1 or 2, got ${s}`); {
				if (i) throw new Error("protobuf: (PBNode) duplicate Links section");
				let t;
				r || (r = []), [t, o] = decodeBytes(e, o), r.push(decodeLink(t))
			}
		}
	}
	if (o > t) throw new Error("protobuf: (PBNode) unexpected end of data");
	const s = {};
	return n && (s.Data = n), s.Links = r || [], s
}
const textEncoder$1 = new TextEncoder,
	maxInt32 = 2 ** 32,
	maxUInt32 = 2 ** 31;

function encodeLink(e, t) {
	let r = t.length;
	if ("number" == typeof e.Tsize) {
		if (e.Tsize < 0) throw new Error("Tsize cannot be negative");
		if (!Number.isSafeInteger(e.Tsize)) throw new Error("Tsize too large for encoding");
		r = encodeVarint(t, r, e.Tsize) - 1, t[r] = 24
	}
	if ("string" == typeof e.Name) {
		const n = textEncoder$1.encode(e.Name);
		r -= n.length, t.set(n, r), r = encodeVarint(t, r, n.length) - 1, t[r] = 18
	}
	return e.Hash && (r -= e.Hash.length, t.set(e.Hash, r), r = encodeVarint(t, r, e.Hash.length) - 1, t[r] = 10), t.length - r
}

function encodeNode(e) {
	const t = sizeNode(e),
		r = new Uint8Array(t);
	let n = t;
	if (e.Data && (n -= e.Data.length, r.set(e.Data, n), n = encodeVarint(r, n, e.Data.length) - 1, r[n] = 10), e.Links)
		for (let t = e.Links.length - 1; t >= 0; t--) {
			const o = encodeLink(e.Links[t], r.subarray(0, n));
			n -= o, n = encodeVarint(r, n, o) - 1, r[n] = 18
		}
	return r
}

function sizeLink(e) {
	let t = 0;
	if (e.Hash) {
		const r = e.Hash.length;
		t += 1 + r + sov(r)
	}
	if ("string" == typeof e.Name) {
		const r = textEncoder$1.encode(e.Name).length;
		t += 1 + r + sov(r)
	}
	return "number" == typeof e.Tsize && (t += 1 + sov(e.Tsize)), t
}

function sizeNode(e) {
	let t = 0;
	if (e.Data) {
		const r = e.Data.length;
		t += 1 + r + sov(r)
	}
	if (e.Links)
		for (const r of e.Links) {
			const e = sizeLink(r);
			t += 1 + e + sov(e)
		}
	return t
}

function encodeVarint(e, t, r) {
	const n = t -= sov(r);
	for (; r >= maxUInt32;) e[t++] = 127 & r | 128, r /= 128;
	for (; r >= 128;) e[t++] = 127 & r | 128, r >>>= 7;
	return e[t] = r, n
}

function sov(e) {
	return e % 2 == 0 && e++, Math.floor((len64(e) + 6) / 7)
}

function len64(e) {
	let t = 0;
	return e >= maxInt32 && (e = Math.floor(e / maxInt32), t = 32), e >= 65536 && (e >>>= 16, t += 16), e >= 256 && (e >>>= 8, t += 8), t + len8tab[e]
}
const len8tab = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
	pbNodeProperties = ["Data", "Links"],
	pbLinkProperties = ["Hash", "Name", "Tsize"],
	textEncoder = new TextEncoder;

function linkComparator(e, t) {
	if (e === t) return 0;
	const r = e.Name ? textEncoder.encode(e.Name) : [],
		n = t.Name ? textEncoder.encode(t.Name) : [];
	let o = r.length,
		i = n.length;
	for (let e = 0, t = Math.min(o, i); e < t; ++e)
		if (r[e] !== n[e]) {
			o = r[e], i = n[e];
			break
		} return o < i ? -1 : i < o ? 1 : 0
}

function hasOnlyProperties(e, t) {
	return !Object.keys(e).some((e => !t.includes(e)))
}

function asLink(e) {
	if ("object" == typeof e.asCID) {
		const t = CID.asCID(e);
		if (!t) throw new TypeError("Invalid DAG-PB form");
		return {
			Hash: t
		}
	}
	if ("object" != typeof e || Array.isArray(e)) throw new TypeError("Invalid DAG-PB form");
	const t = {};
	if (e.Hash) {
		let r = CID.asCID(e.Hash);
		try {
			r || ("string" == typeof e.Hash ? r = CID.parse(e.Hash) : e.Hash instanceof Uint8Array && (r = CID.decode(e.Hash)))
		} catch (e) {
			throw new TypeError(`Invalid DAG-PB form: ${e.message}`)
		}
		r && (t.Hash = r)
	}
	if (!t.Hash) throw new TypeError("Invalid DAG-PB form");
	return "string" == typeof e.Name && (t.Name = e.Name), "number" == typeof e.Tsize && (t.Tsize = e.Tsize), t
}

function prepare(e) {
	if ((e instanceof Uint8Array || "string" == typeof e) && (e = {
			Data: e
		}), "object" != typeof e || Array.isArray(e)) throw new TypeError("Invalid DAG-PB form");
	const t = {};
	if (void 0 !== e.Data)
		if ("string" == typeof e.Data) t.Data = textEncoder.encode(e.Data);
		else {
			if (!(e.Data instanceof Uint8Array)) throw new TypeError("Invalid DAG-PB form");
			t.Data = e.Data
		} if (void 0 !== e.Links) {
		if (!Array.isArray(e.Links)) throw new TypeError("Invalid DAG-PB form");
		t.Links = e.Links.map(asLink), t.Links.sort(linkComparator)
	} else t.Links = [];
	return t
}

function validate(e) {
	if (!e || "object" != typeof e || Array.isArray(e)) throw new TypeError("Invalid DAG-PB form");
	if (!hasOnlyProperties(e, pbNodeProperties)) throw new TypeError("Invalid DAG-PB form (extraneous properties)");
	if (void 0 !== e.Data && !(e.Data instanceof Uint8Array)) throw new TypeError("Invalid DAG-PB form (Data must be a Uint8Array)");
	if (!Array.isArray(e.Links)) throw new TypeError("Invalid DAG-PB form (Links must be an array)");
	for (let t = 0; t < e.Links.length; t++) {
		const r = e.Links[t];
		if (!r || "object" != typeof r || Array.isArray(r)) throw new TypeError("Invalid DAG-PB form (bad link object)");
		if (!hasOnlyProperties(r, pbLinkProperties)) throw new TypeError("Invalid DAG-PB form (extraneous properties on link object)");
		if (!r.Hash) throw new TypeError("Invalid DAG-PB form (link must have a Hash)");
		if (r.Hash.asCID !== r.Hash) throw new TypeError("Invalid DAG-PB form (link Hash must be a CID)");
		if (void 0 !== r.Name && "string" != typeof r.Name) throw new TypeError("Invalid DAG-PB form (link Name must be a string)");
		if (void 0 !== r.Tsize && ("number" != typeof r.Tsize || r.Tsize % 1 != 0)) throw new TypeError("Invalid DAG-PB form (link Tsize must be an integer)");
		if (t > 0 && -1 === linkComparator(r, e.Links[t - 1])) throw new TypeError("Invalid DAG-PB form (links must be sorted by Name bytes)")
	}
}

function createNode(e, t = []) {
	return prepare({
		Data: e,
		Links: t
	})
}

function createLink(e, t, r) {
	return asLink({
		Hash: r,
		Name: e,
		Tsize: t
	})
}
const name = "dag-pb",
	code$1 = 112;

function encode$1(e) {
	validate(e);
	const t = {};
	return e.Links && (t.Links = e.Links.map((e => {
		const t = {};
		return e.Hash && (t.Hash = e.Hash.bytes), void 0 !== e.Name && (t.Name = e.Name), void 0 !== e.Tsize && (t.Tsize = e.Tsize), t
	}))), e.Data && (t.Data = e.Data), encodeNode(t)
}

function decode$1(e) {
	const t = decodeNode(e),
		r = {};
	return t.Data && (r.Data = t.Data), t.Links && (r.Links = t.Links.map((e => {
		const t = {};
		try {
			t.Hash = CID.decode(e.Hash)
		} catch (e) {}
		if (!t.Hash) throw new Error("Invalid Hash field found in link, expected CID");
		return void 0 !== e.Name && (t.Name = e.Name), void 0 !== e.Tsize && (t.Tsize = e.Tsize), t
	}))), r
}
var dagPb = Object.freeze({
	__proto__: null,
	name: name,
	code: code$1,
	encode: encode$1,
	decode: decode$1,
	prepare: prepare,
	validate: validate,
	createNode: createNode,
	createLink: createLink
});
class TreewalkCarSplitter {
	constructor(e, t, r = {}) {
		if ("number" != typeof t || t <= 0) throw new Error("invalid target chunk size");
		this._reader = e, this._targetSize = t, this._decoders = [dagPb, raw, dagCbor, ...r.decoders || []]
	}
	async *cars() {
		const e = await this._reader.getRoots();
		if (1 !== e.length) throw new Error(`unexpected number of roots: ${e.length}`);
		let t;
		for await (const r of this._cars(e[0])) t = r.channel, r.out && (yield r.out);
		if (!t) throw new Error("missing CAR writer channel");
		t.writer.close(), yield t.out
	}
	async _get(e) {
		const t = await this._reader.get(e);
		if (!t) throw new Error(`missing block for ${e}`);
		const {
			bytes: r
		} = t, n = this._decoders.find((t => t.code === e.code));
		if (!n) throw new Error(`missing decoder for ${e.code}`);
		return new Block({
			cid: e,
			bytes: r,
			value: n.decode(r)
		})
	}
	async *_cars(e, t = [], r) {
		const n = await this._get(e);
		if ((r = r || Object.assign(CarWriter.create(e), {
				size: 0
			})).size > 0 && r.size + n.bytes.byteLength >= this._targetSize) {
			r.writer.close();
			const {
				out: e
			} = r;
			r = newCar(t), yield {
				channel: r,
				out: e
			}
		}
		t = t.concat(n), r.size += n.bytes.byteLength, r.writer.put(n);
		for (const [, e] of n.links())
			for await (const n of this._cars(e, t, r)) r = n.channel, yield n;
		if (!r) throw new Error("missing CAR writer channel");
		yield {
			channel: r
		}
	}
	static async fromIterable(e, t, r) {
		const n = await CarReader.fromIterable(e);
		return new TreewalkCarSplitter(n, t, r)
	}
	static async fromBlob(e, t, r) {
		const n = await e.arrayBuffer(),
			o = await CarReader.fromBytes(new Uint8Array(n));
		return new TreewalkCarSplitter(o, t, r)
	}
}

function newCar(e) {
	const t = Object.assign(CarWriter.create(e[0].cid), {
		size: e.reduce(((e, t) => e + t.bytes.byteLength), 0)
	});
	for (const r of e) t.writer.put(r);
	return t
}
const last = async e => {
	let t;
	for await (const r of e) t = r;
	return t
};
var itLast = last,
	itPipe = {
		exports: {}
	};
const rawPipe = (...e) => {
		let t;
		for (; e.length;) t = e.shift()(t);
		return t
	},
	isIterable$1 = e => e && ("function" == typeof e[Symbol.asyncIterator] || "function" == typeof e[Symbol.iterator] || "function" == typeof e.next),
	isDuplex = e => e && "function" == typeof e.sink && isIterable$1(e.source),
	duplexPipelineFn = e => t => (e.sink(t), e.source),
	pipe = (...e) => {
		if (isDuplex(e[0])) {
			const t = e[0];
			e[0] = () => t.source
		} else if (isIterable$1(e[0])) {
			const t = e[0];
			e[0] = () => t
		}
		if (e.length > 1 && isDuplex(e[e.length - 1]) && (e[e.length - 1] = e[e.length - 1].sink), e.length > 2)
			for (let t = 1; t < e.length - 1; t++) isDuplex(e[t]) && (e[t] = duplexPipelineFn(e[t]));
		return rawPipe(...e)
	};
itPipe.exports = pipe, itPipe.exports.pipe = pipe, itPipe.exports.rawPipe = rawPipe, itPipe.exports.isIterable = isIterable$1, itPipe.exports.isDuplex = isDuplex;
var pipe$1 = itPipe.exports;
async function* batch$1(e, t = 1) {
	let r = [];
	t < 1 && (t = 1);
	for await (const n of e) for (r.push(n); r.length >= t;) yield r.slice(0, t), r = r.slice(t);
	for (; r.length;) yield r.slice(0, t), r = r.slice(t)
}
var itBatch = batch$1;
const batch = itBatch;
async function* parallelBatch(e, t = 1) {
	for await (const r of batch(e, t)) {
		const e = r.map((e => e().then((e => ({
			ok: !0,
			value: e
		})), (e => ({
			ok: !1,
			err: e
		})))));
		for (let t = 0; t < e.length; t++) {
			const r = await e[t];
			if (!r.ok) throw r.err;
			yield r.value
		}
	}
}
var itParallelBatch = parallelBatch,
	isPlainObj = e => {
		if ("[object Object]" !== Object.prototype.toString.call(e)) return !1;
		const t = Object.getPrototypeOf(e);
		return null === t || t === Object.prototype
	};
const isOptionObject = isPlainObj,
	{
		hasOwnProperty: hasOwnProperty
	} = Object.prototype,
	{
		propertyIsEnumerable: propertyIsEnumerable
	} = Object,
	defineProperty = (e, t, r) => Object.defineProperty(e, t, {
		value: r,
		writable: !0,
		enumerable: !0,
		configurable: !0
	}),
	globalThis$1 = commonjsGlobal,
	defaultMergeOptions = {
		concatArrays: !1,
		ignoreUndefined: !1
	},
	getEnumerableOwnPropertyKeys = e => {
		const t = [];
		for (const r in e) hasOwnProperty.call(e, r) && t.push(r);
		if (Object.getOwnPropertySymbols) {
			const r = Object.getOwnPropertySymbols(e);
			for (const n of r) propertyIsEnumerable.call(e, n) && t.push(n)
		}
		return t
	};

function clone(e) {
	return Array.isArray(e) ? cloneArray(e) : isOptionObject(e) ? cloneOptionObject(e) : e
}

function cloneArray(e) {
	const t = e.slice(0, 0);
	return getEnumerableOwnPropertyKeys(e).forEach((r => {
		defineProperty(t, r, clone(e[r]))
	})), t
}

function cloneOptionObject(e) {
	const t = null === Object.getPrototypeOf(e) ? Object.create(null) : {};
	return getEnumerableOwnPropertyKeys(e).forEach((r => {
		defineProperty(t, r, clone(e[r]))
	})), t
}
const mergeKeys = (e, t, r, n) => (r.forEach((r => {
		void 0 === t[r] && n.ignoreUndefined || (r in e && e[r] !== Object.getPrototypeOf(e) ? defineProperty(e, r, merge(e[r], t[r], n)) : defineProperty(e, r, clone(t[r])))
	})), e),
	concatArrays = (e, t, r) => {
		let n = e.slice(0, 0),
			o = 0;
		return [e, t].forEach((t => {
			const i = [];
			for (let r = 0; r < t.length; r++) hasOwnProperty.call(t, r) && (i.push(String(r)), defineProperty(n, o++, t === e ? t[r] : clone(t[r])));
			n = mergeKeys(n, t, getEnumerableOwnPropertyKeys(t).filter((e => !i.includes(e))), r)
		})), n
	};

function merge(e, t, r) {
	return r.concatArrays && Array.isArray(e) && Array.isArray(t) ? concatArrays(e, t, r) : isOptionObject(t) && isOptionObject(e) ? mergeKeys(e, t, getEnumerableOwnPropertyKeys(t), r) : clone(t)
}
var mergeOptions = function(...e) {
	const t = merge(clone(defaultMergeOptions), this !== globalThis$1 && this || {}, defaultMergeOptions);
	let r = {
		_: {}
	};
	for (const n of e)
		if (void 0 !== n) {
			if (!isOptionObject(n)) throw new TypeError("`" + n + "` is not an Option Object");
			r = merge(r, {
				_: n
			}, t)
		} return r._
};
const sha = e => async t => new Uint8Array(await crypto.subtle.digest(e, t)), sha256 = from({
	name: "sha2-256",
	code: 18,
	encode: sha("SHA-256")
});
from({
	name: "sha2-512",
	code: 19,
	encode: sha("SHA-512")
});
var murmurHash3js = {
		exports: {}
	},
	module, exports;
module = murmurHash3js, exports = murmurHash3js.exports,
	function(e, t) {
		var r = {
			version: "3.0.0",
			x86: {},
			x64: {},
			inputValidation: !0
		};

		function n(e) {
			if (!Array.isArray(e) && !ArrayBuffer.isView(e)) return !1;
			for (var t = 0; t < e.length; t++)
				if (!Number.isInteger(e[t]) || e[t] < 0 || e[t] > 255) return !1;
			return !0
		}

		function o(e, t) {
			return (65535 & e) * t + (((e >>> 16) * t & 65535) << 16)
		}

		function i(e, t) {
			return e << t | e >>> 32 - t
		}

		function s(e) {
			return e = o(e ^= e >>> 16, 2246822507), e = o(e ^= e >>> 13, 3266489909), e ^= e >>> 16
		}

		function a(e, t) {
			e = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]], t = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]];
			var r = [0, 0, 0, 0];
			return r[3] += e[3] + t[3], r[2] += r[3] >>> 16, r[3] &= 65535, r[2] += e[2] + t[2], r[1] += r[2] >>> 16, r[2] &= 65535, r[1] += e[1] + t[1], r[0] += r[1] >>> 16, r[1] &= 65535, r[0] += e[0] + t[0], r[0] &= 65535, [r[0] << 16 | r[1], r[2] << 16 | r[3]]
		}

		function c(e, t) {
			e = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]], t = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]];
			var r = [0, 0, 0, 0];
			return r[3] += e[3] * t[3], r[2] += r[3] >>> 16, r[3] &= 65535, r[2] += e[2] * t[3], r[1] += r[2] >>> 16, r[2] &= 65535, r[2] += e[3] * t[2], r[1] += r[2] >>> 16, r[2] &= 65535, r[1] += e[1] * t[3], r[0] += r[1] >>> 16, r[1] &= 65535, r[1] += e[2] * t[2], r[0] += r[1] >>> 16, r[1] &= 65535, r[1] += e[3] * t[1], r[0] += r[1] >>> 16, r[1] &= 65535, r[0] += e[0] * t[3] + e[1] * t[2] + e[2] * t[1] + e[3] * t[0], r[0] &= 65535, [r[0] << 16 | r[1], r[2] << 16 | r[3]]
		}

		function u(e, t) {
			return 32 == (t %= 64) ? [e[1], e[0]] : t < 32 ? [e[0] << t | e[1] >>> 32 - t, e[1] << t | e[0] >>> 32 - t] : (t -= 32, [e[1] << t | e[0] >>> 32 - t, e[0] << t | e[1] >>> 32 - t])
		}

		function f(e, t) {
			return 0 == (t %= 64) ? e : t < 32 ? [e[0] << t | e[1] >>> 32 - t, e[1] << t] : [e[1] << t - 32, 0]
		}

		function l(e, t) {
			return [e[0] ^ t[0], e[1] ^ t[1]]
		}

		function h(e) {
			return e = l(e, [0, e[0] >>> 1]), e = l(e = c(e, [4283543511, 3981806797]), [0, e[0] >>> 1]), e = l(e = c(e, [3301882366, 444984403]), [0, e[0] >>> 1])
		}
		r.x86.hash32 = function(e, a) {
			if (r.inputValidation && !n(e)) return t;
			a = a || 0;
			for (var c = e.length % 4, u = e.length - c, f = a, l = 0, h = 3432918353, d = 461845907, p = 0; p < u; p += 4) l = o(l = e[p] | e[p + 1] << 8 | e[p + 2] << 16 | e[p + 3] << 24, h), l = o(l = i(l, 15), d), f = o(f = i(f ^= l, 13), 5) + 3864292196;
			switch (l = 0, c) {
				case 3:
					l ^= e[p + 2] << 16;
				case 2:
					l ^= e[p + 1] << 8;
				case 1:
					l = o(l ^= e[p], h), f ^= l = o(l = i(l, 15), d)
			}
			return (f = s(f ^= e.length)) >>> 0
		}, r.x86.hash128 = function(e, a) {
			if (r.inputValidation && !n(e)) return t;
			a = a || 0;
			for (var c = e.length % 16, u = e.length - c, f = a, l = a, h = a, d = a, p = 0, y = 0, g = 0, b = 0, m = 597399067, w = 2869860233, _ = 951274213, T = 2716044179, E = 0; E < u; E += 16) p = e[E] | e[E + 1] << 8 | e[E + 2] << 16 | e[E + 3] << 24, y = e[E + 4] | e[E + 5] << 8 | e[E + 6] << 16 | e[E + 7] << 24, g = e[E + 8] | e[E + 9] << 8 | e[E + 10] << 16 | e[E + 11] << 24, b = e[E + 12] | e[E + 13] << 8 | e[E + 14] << 16 | e[E + 15] << 24, p = i(p = o(p, m), 15), f = i(f ^= p = o(p, w), 19), f = o(f += l, 5) + 1444728091, y = i(y = o(y, w), 16), l = i(l ^= y = o(y, _), 17), l = o(l += h, 5) + 197830471, g = i(g = o(g, _), 17), h = i(h ^= g = o(g, T), 15), h = o(h += d, 5) + 2530024501, b = i(b = o(b, T), 18), d = i(d ^= b = o(b, m), 13), d = o(d += f, 5) + 850148119;
			switch (p = 0, y = 0, g = 0, b = 0, c) {
				case 15:
					b ^= e[E + 14] << 16;
				case 14:
					b ^= e[E + 13] << 8;
				case 13:
					b = o(b ^= e[E + 12], T), d ^= b = o(b = i(b, 18), m);
				case 12:
					g ^= e[E + 11] << 24;
				case 11:
					g ^= e[E + 10] << 16;
				case 10:
					g ^= e[E + 9] << 8;
				case 9:
					g = o(g ^= e[E + 8], _), h ^= g = o(g = i(g, 17), T);
				case 8:
					y ^= e[E + 7] << 24;
				case 7:
					y ^= e[E + 6] << 16;
				case 6:
					y ^= e[E + 5] << 8;
				case 5:
					y = o(y ^= e[E + 4], w), l ^= y = o(y = i(y, 16), _);
				case 4:
					p ^= e[E + 3] << 24;
				case 3:
					p ^= e[E + 2] << 16;
				case 2:
					p ^= e[E + 1] << 8;
				case 1:
					p = o(p ^= e[E], m), f ^= p = o(p = i(p, 15), w)
			}
			return f ^= e.length, f += l ^= e.length, f += h ^= e.length, l += f += d ^= e.length, h += f, d += f, f = s(f), f += l = s(l), f += h = s(h), l += f += d = s(d), h += f, d += f, ("00000000" + (f >>> 0).toString(16)).slice(-8) + ("00000000" + (l >>> 0).toString(16)).slice(-8) + ("00000000" + (h >>> 0).toString(16)).slice(-8) + ("00000000" + (d >>> 0).toString(16)).slice(-8)
		}, r.x64.hash128 = function(e, o) {
			if (r.inputValidation && !n(e)) return t;
			o = o || 0;
			for (var i = e.length % 16, s = e.length - i, d = [0, o], p = [0, o], y = [0, 0], g = [0, 0], b = [2277735313, 289559509], m = [1291169091, 658871167], w = 0; w < s; w += 16) y = [e[w + 4] | e[w + 5] << 8 | e[w + 6] << 16 | e[w + 7] << 24, e[w] | e[w + 1] << 8 | e[w + 2] << 16 | e[w + 3] << 24], g = [e[w + 12] | e[w + 13] << 8 | e[w + 14] << 16 | e[w + 15] << 24, e[w + 8] | e[w + 9] << 8 | e[w + 10] << 16 | e[w + 11] << 24], y = u(y = c(y, b), 31), d = a(d = u(d = l(d, y = c(y, m)), 27), p), d = a(c(d, [0, 5]), [0, 1390208809]), g = u(g = c(g, m), 33), p = a(p = u(p = l(p, g = c(g, b)), 31), d), p = a(c(p, [0, 5]), [0, 944331445]);
			switch (y = [0, 0], g = [0, 0], i) {
				case 15:
					g = l(g, f([0, e[w + 14]], 48));
				case 14:
					g = l(g, f([0, e[w + 13]], 40));
				case 13:
					g = l(g, f([0, e[w + 12]], 32));
				case 12:
					g = l(g, f([0, e[w + 11]], 24));
				case 11:
					g = l(g, f([0, e[w + 10]], 16));
				case 10:
					g = l(g, f([0, e[w + 9]], 8));
				case 9:
					g = c(g = l(g, [0, e[w + 8]]), m), p = l(p, g = c(g = u(g, 33), b));
				case 8:
					y = l(y, f([0, e[w + 7]], 56));
				case 7:
					y = l(y, f([0, e[w + 6]], 48));
				case 6:
					y = l(y, f([0, e[w + 5]], 40));
				case 5:
					y = l(y, f([0, e[w + 4]], 32));
				case 4:
					y = l(y, f([0, e[w + 3]], 24));
				case 3:
					y = l(y, f([0, e[w + 2]], 16));
				case 2:
					y = l(y, f([0, e[w + 1]], 8));
				case 1:
					y = c(y = l(y, [0, e[w]]), b), d = l(d, y = c(y = u(y, 31), m))
			}
			return d = a(d = l(d, [0, e.length]), p = l(p, [0, e.length])), p = a(p, d), d = a(d = h(d), p = h(p)), p = a(p, d), ("00000000" + (d[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (d[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (p[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (p[1] >>> 0).toString(16)).slice(-8)
		}, module.exports && (exports = module.exports = r), exports.murmurHash3 = r
	}();
var murmurhash3jsRevisited = murmurHash3js.exports;

function fromNumberTo32BitBuf(e) {
	const t = new Array(4);
	for (let r = 0; r < 4; r++) t[r] = 255 & e, e >>= 8;
	return new Uint8Array(t)
}
from({
	name: "murmur3-32",
	code: 35,
	encode: e => fromNumberTo32BitBuf(murmurhash3jsRevisited.x86.hash32(e))
});
const murmur3128 = from({
	name: "murmur3-128",
	code: 34,
	encode: e => fromHex(murmurhash3jsRevisited.x64.hash128(e))
});
async function hamtHashFn(e) {
	return (await murmur3128.encode(e)).slice(0, 8).reverse()
}
const defaultOptions = {
	chunker: "fixed",
	strategy: "balanced",
	rawLeaves: !1,
	onlyHash: !1,
	reduceSingleLeafToSelf: !0,
	hasher: sha256,
	leafType: "file",
	cidVersion: 0,
	progress: () => () => {},
	shardSplitThreshold: 1e3,
	fileImportConcurrency: 50,
	blockWriteConcurrency: 10,
	minChunkSize: 262144,
	maxChunkSize: 262144,
	avgChunkSize: 262144,
	window: 16,
	polynomial: 0x3df305dfb2a804,
	maxChildrenPerNode: 174,
	layerRepeat: 4,
	wrapWithDirectory: !1,
	recursive: !1,
	hidden: !1,
	timeout: void 0,
	hamtHashFn: hamtHashFn,
	hamtHashCode: 34,
	hamtBucketBits: 8
};
var defaultOptions$1 = (e = {}) => mergeOptions.bind({
	ignoreUndefined: !0
})(defaultOptions, e);

function assign(e, t) {
	for (const r in t) Object.defineProperty(e, r, {
		value: t[r],
		enumerable: !0,
		configurable: !0
	});
	return e
}

function createError(e, t, r) {
	if (!e || "string" == typeof e) throw new TypeError("Please pass an Error to err-code");
	r || (r = {}), "object" == typeof t && (r = t, t = ""), t && (r.code = t);
	try {
		return assign(e, r)
	} catch (t) {
		r.message = e.message, r.stack = e.stack;
		const n = function() {};
		n.prototype = Object.create(Object.getPrototypeOf(e));
		return assign(new n, r)
	}
}
var errCode = createError,
	indexMinimal = {},
	minimal$1 = {},
	aspromise = asPromise;

function asPromise(e, t) {
	for (var r = new Array(arguments.length - 1), n = 0, o = 2, i = !0; o < arguments.length;) r[n++] = arguments[o++];
	return new Promise((function(o, s) {
		r[n] = function(e) {
			if (i)
				if (i = !1, e) s(e);
				else {
					for (var t = new Array(arguments.length - 1), r = 0; r < t.length;) t[r++] = arguments[r];
					o.apply(null, t)
				}
		};
		try {
			e.apply(t || null, r)
		} catch (e) {
			i && (i = !1, s(e))
		}
	}))
}
var base64$3 = {};
! function(e) {
	var t = base64$3;
	t.length = function(e) {
		var t = e.length;
		if (!t) return 0;
		for (var r = 0; --t % 4 > 1 && "=" === e.charAt(t);) ++r;
		return Math.ceil(3 * e.length) / 4 - r
	};
	for (var r = new Array(64), n = new Array(123), o = 0; o < 64;) n[r[o] = o < 26 ? o + 65 : o < 52 ? o + 71 : o < 62 ? o - 4 : o - 59 | 43] = o++;
	t.encode = function(e, t, n) {
		for (var o, i = null, s = [], a = 0, c = 0; t < n;) {
			var u = e[t++];
			switch (c) {
				case 0:
					s[a++] = r[u >> 2], o = (3 & u) << 4, c = 1;
					break;
				case 1:
					s[a++] = r[o | u >> 4], o = (15 & u) << 2, c = 2;
					break;
				case 2:
					s[a++] = r[o | u >> 6], s[a++] = r[63 & u], c = 0
			}
			a > 8191 && ((i || (i = [])).push(String.fromCharCode.apply(String, s)), a = 0)
		}
		return c && (s[a++] = r[o], s[a++] = 61, 1 === c && (s[a++] = 61)), i ? (a && i.push(String.fromCharCode.apply(String, s.slice(0, a))), i.join("")) : String.fromCharCode.apply(String, s.slice(0, a))
	};
	var i = "invalid encoding";
	t.decode = function(e, t, r) {
		for (var o, s = r, a = 0, c = 0; c < e.length;) {
			var u = e.charCodeAt(c++);
			if (61 === u && a > 1) break;
			if (void 0 === (u = n[u])) throw Error(i);
			switch (a) {
				case 0:
					o = u, a = 1;
					break;
				case 1:
					t[r++] = o << 2 | (48 & u) >> 4, o = u, a = 2;
					break;
				case 2:
					t[r++] = (15 & o) << 4 | (60 & u) >> 2, o = u, a = 3;
					break;
				case 3:
					t[r++] = (3 & o) << 6 | u, a = 0
			}
		}
		if (1 === a) throw Error(i);
		return r - s
	}, t.test = function(e) {
		return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(e)
	}
}();
var eventemitter = EventEmitter;

function EventEmitter() {
	this._listeners = {}
}
EventEmitter.prototype.on = function(e, t, r) {
	return (this._listeners[e] || (this._listeners[e] = [])).push({
		fn: t,
		ctx: r || this
	}), this
}, EventEmitter.prototype.off = function(e, t) {
	if (void 0 === e) this._listeners = {};
	else if (void 0 === t) this._listeners[e] = [];
	else
		for (var r = this._listeners[e], n = 0; n < r.length;) r[n].fn === t ? r.splice(n, 1) : ++n;
	return this
}, EventEmitter.prototype.emit = function(e) {
	var t = this._listeners[e];
	if (t) {
		for (var r = [], n = 1; n < arguments.length;) r.push(arguments[n++]);
		for (n = 0; n < t.length;) t[n].fn.apply(t[n++].ctx, r)
	}
	return this
};
var float = factory(factory);

function factory(e) {
	return "undefined" != typeof Float32Array ? function() {
		var t = new Float32Array([-0]),
			r = new Uint8Array(t.buffer),
			n = 128 === r[3];

		function o(e, n, o) {
			t[0] = e, n[o] = r[0], n[o + 1] = r[1], n[o + 2] = r[2], n[o + 3] = r[3]
		}

		function i(e, n, o) {
			t[0] = e, n[o] = r[3], n[o + 1] = r[2], n[o + 2] = r[1], n[o + 3] = r[0]
		}

		function s(e, n) {
			return r[0] = e[n], r[1] = e[n + 1], r[2] = e[n + 2], r[3] = e[n + 3], t[0]
		}

		function a(e, n) {
			return r[3] = e[n], r[2] = e[n + 1], r[1] = e[n + 2], r[0] = e[n + 3], t[0]
		}
		e.writeFloatLE = n ? o : i, e.writeFloatBE = n ? i : o, e.readFloatLE = n ? s : a, e.readFloatBE = n ? a : s
	}() : function() {
		function t(e, t, r, n) {
			var o = t < 0 ? 1 : 0;
			if (o && (t = -t), 0 === t) e(1 / t > 0 ? 0 : 2147483648, r, n);
			else if (isNaN(t)) e(2143289344, r, n);
			else if (t > 34028234663852886e22) e((o << 31 | 2139095040) >>> 0, r, n);
			else if (t < 11754943508222875e-54) e((o << 31 | Math.round(t / 1401298464324817e-60)) >>> 0, r, n);
			else {
				var i = Math.floor(Math.log(t) / Math.LN2);
				e((o << 31 | i + 127 << 23 | 8388607 & Math.round(t * Math.pow(2, -i) * 8388608)) >>> 0, r, n)
			}
		}

		function r(e, t, r) {
			var n = e(t, r),
				o = 2 * (n >> 31) + 1,
				i = n >>> 23 & 255,
				s = 8388607 & n;
			return 255 === i ? s ? NaN : o * (1 / 0) : 0 === i ? 1401298464324817e-60 * o * s : o * Math.pow(2, i - 150) * (s + 8388608)
		}
		e.writeFloatLE = t.bind(null, writeUintLE), e.writeFloatBE = t.bind(null, writeUintBE), e.readFloatLE = r.bind(null, readUintLE), e.readFloatBE = r.bind(null, readUintBE)
	}(), "undefined" != typeof Float64Array ? function() {
		var t = new Float64Array([-0]),
			r = new Uint8Array(t.buffer),
			n = 128 === r[7];

		function o(e, n, o) {
			t[0] = e, n[o] = r[0], n[o + 1] = r[1], n[o + 2] = r[2], n[o + 3] = r[3], n[o + 4] = r[4], n[o + 5] = r[5], n[o + 6] = r[6], n[o + 7] = r[7]
		}

		function i(e, n, o) {
			t[0] = e, n[o] = r[7], n[o + 1] = r[6], n[o + 2] = r[5], n[o + 3] = r[4], n[o + 4] = r[3], n[o + 5] = r[2], n[o + 6] = r[1], n[o + 7] = r[0]
		}

		function s(e, n) {
			return r[0] = e[n], r[1] = e[n + 1], r[2] = e[n + 2], r[3] = e[n + 3], r[4] = e[n + 4], r[5] = e[n + 5], r[6] = e[n + 6], r[7] = e[n + 7], t[0]
		}

		function a(e, n) {
			return r[7] = e[n], r[6] = e[n + 1], r[5] = e[n + 2], r[4] = e[n + 3], r[3] = e[n + 4], r[2] = e[n + 5], r[1] = e[n + 6], r[0] = e[n + 7], t[0]
		}
		e.writeDoubleLE = n ? o : i, e.writeDoubleBE = n ? i : o, e.readDoubleLE = n ? s : a, e.readDoubleBE = n ? a : s
	}() : function() {
		function t(e, t, r, n, o, i) {
			var s = n < 0 ? 1 : 0;
			if (s && (n = -n), 0 === n) e(0, o, i + t), e(1 / n > 0 ? 0 : 2147483648, o, i + r);
			else if (isNaN(n)) e(0, o, i + t), e(2146959360, o, i + r);
			else if (n > 17976931348623157e292) e(0, o, i + t), e((s << 31 | 2146435072) >>> 0, o, i + r);
			else {
				var a;
				if (n < 22250738585072014e-324) e((a = n / 5e-324) >>> 0, o, i + t), e((s << 31 | a / 4294967296) >>> 0, o, i + r);
				else {
					var c = Math.floor(Math.log(n) / Math.LN2);
					1024 === c && (c = 1023), e(4503599627370496 * (a = n * Math.pow(2, -c)) >>> 0, o, i + t), e((s << 31 | c + 1023 << 20 | 1048576 * a & 1048575) >>> 0, o, i + r)
				}
			}
		}

		function r(e, t, r, n, o) {
			var i = e(n, o + t),
				s = e(n, o + r),
				a = 2 * (s >> 31) + 1,
				c = s >>> 20 & 2047,
				u = 4294967296 * (1048575 & s) + i;
			return 2047 === c ? u ? NaN : a * (1 / 0) : 0 === c ? 5e-324 * a * u : a * Math.pow(2, c - 1075) * (u + 4503599627370496)
		}
		e.writeDoubleLE = t.bind(null, writeUintLE, 0, 4), e.writeDoubleBE = t.bind(null, writeUintBE, 4, 0), e.readDoubleLE = r.bind(null, readUintLE, 0, 4), e.readDoubleBE = r.bind(null, readUintBE, 4, 0)
	}(), e
}

function writeUintLE(e, t, r) {
	t[r] = 255 & e, t[r + 1] = e >>> 8 & 255, t[r + 2] = e >>> 16 & 255, t[r + 3] = e >>> 24
}

function writeUintBE(e, t, r) {
	t[r] = e >>> 24, t[r + 1] = e >>> 16 & 255, t[r + 2] = e >>> 8 & 255, t[r + 3] = 255 & e
}

function readUintLE(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0
}

function readUintBE(e, t) {
	return (e[t] << 24 | e[t + 1] << 16 | e[t + 2] << 8 | e[t + 3]) >>> 0
}
var inquire_1 = inquire;

function inquire(moduleName) {
	try {
		var mod = eval("quire".replace(/^/, "re"))(moduleName);
		if (mod && (mod.length || Object.keys(mod).length)) return mod
	} catch (e) {}
	return null
}
var utf8$2 = {};
! function(e) {
	var t = utf8$2;
	t.length = function(e) {
		for (var t = 0, r = 0, n = 0; n < e.length; ++n)(r = e.charCodeAt(n)) < 128 ? t += 1 : r < 2048 ? t += 2 : 55296 == (64512 & r) && 56320 == (64512 & e.charCodeAt(n + 1)) ? (++n, t += 4) : t += 3;
		return t
	}, t.read = function(e, t, r) {
		if (r - t < 1) return "";
		for (var n, o = null, i = [], s = 0; t < r;)(n = e[t++]) < 128 ? i[s++] = n : n > 191 && n < 224 ? i[s++] = (31 & n) << 6 | 63 & e[t++] : n > 239 && n < 365 ? (n = ((7 & n) << 18 | (63 & e[t++]) << 12 | (63 & e[t++]) << 6 | 63 & e[t++]) - 65536, i[s++] = 55296 + (n >> 10), i[s++] = 56320 + (1023 & n)) : i[s++] = (15 & n) << 12 | (63 & e[t++]) << 6 | 63 & e[t++], s > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, i)), s = 0);
		return o ? (s && o.push(String.fromCharCode.apply(String, i.slice(0, s))), o.join("")) : String.fromCharCode.apply(String, i.slice(0, s))
	}, t.write = function(e, t, r) {
		for (var n, o, i = r, s = 0; s < e.length; ++s)(n = e.charCodeAt(s)) < 128 ? t[r++] = n : n < 2048 ? (t[r++] = n >> 6 | 192, t[r++] = 63 & n | 128) : 55296 == (64512 & n) && 56320 == (64512 & (o = e.charCodeAt(s + 1))) ? (n = 65536 + ((1023 & n) << 10) + (1023 & o), ++s, t[r++] = n >> 18 | 240, t[r++] = n >> 12 & 63 | 128, t[r++] = n >> 6 & 63 | 128, t[r++] = 63 & n | 128) : (t[r++] = n >> 12 | 224, t[r++] = n >> 6 & 63 | 128, t[r++] = 63 & n | 128);
		return r - i
	}
}();
var pool_1 = pool;

function pool(e, t, r) {
	var n = r || 8192,
		o = n >>> 1,
		i = null,
		s = n;
	return function(r) {
		if (r < 1 || r > o) return e(r);
		s + r > n && (i = e(n), s = 0);
		var a = t.call(i, s, s += r);
		return 7 & s && (s = 1 + (7 | s)), a
	}
}
var longbits = LongBits$2,
	util$5 = minimal$1;

function LongBits$2(e, t) {
	this.lo = e >>> 0, this.hi = t >>> 0
}
var zero = LongBits$2.zero = new LongBits$2(0, 0);
zero.toNumber = function() {
	return 0
}, zero.zzEncode = zero.zzDecode = function() {
	return this
}, zero.length = function() {
	return 1
};
var zeroHash = LongBits$2.zeroHash = "\0\0\0\0\0\0\0\0";
LongBits$2.fromNumber = function(e) {
	if (0 === e) return zero;
	var t = e < 0;
	t && (e = -e);
	var r = e >>> 0,
		n = (e - r) / 4294967296 >>> 0;
	return t && (n = ~n >>> 0, r = ~r >>> 0, ++r > 4294967295 && (r = 0, ++n > 4294967295 && (n = 0))), new LongBits$2(r, n)
}, LongBits$2.from = function(e) {
	if ("number" == typeof e) return LongBits$2.fromNumber(e);
	if (util$5.isString(e)) {
		if (!util$5.Long) return LongBits$2.fromNumber(parseInt(e, 10));
		e = util$5.Long.fromString(e)
	}
	return e.low || e.high ? new LongBits$2(e.low >>> 0, e.high >>> 0) : zero
}, LongBits$2.prototype.toNumber = function(e) {
	if (!e && this.hi >>> 31) {
		var t = 1 + ~this.lo >>> 0,
			r = ~this.hi >>> 0;
		return t || (r = r + 1 >>> 0), -(t + 4294967296 * r)
	}
	return this.lo + 4294967296 * this.hi
}, LongBits$2.prototype.toLong = function(e) {
	return util$5.Long ? new util$5.Long(0 | this.lo, 0 | this.hi, Boolean(e)) : {
		low: 0 | this.lo,
		high: 0 | this.hi,
		unsigned: Boolean(e)
	}
};
var charCodeAt = String.prototype.charCodeAt;
LongBits$2.fromHash = function(e) {
		return e === zeroHash ? zero : new LongBits$2((charCodeAt.call(e, 0) | charCodeAt.call(e, 1) << 8 | charCodeAt.call(e, 2) << 16 | charCodeAt.call(e, 3) << 24) >>> 0, (charCodeAt.call(e, 4) | charCodeAt.call(e, 5) << 8 | charCodeAt.call(e, 6) << 16 | charCodeAt.call(e, 7) << 24) >>> 0)
	}, LongBits$2.prototype.toHash = function() {
		return String.fromCharCode(255 & this.lo, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, 255 & this.hi, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24)
	}, LongBits$2.prototype.zzEncode = function() {
		var e = this.hi >> 31;
		return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ e) >>> 0, this.lo = (this.lo << 1 ^ e) >>> 0, this
	}, LongBits$2.prototype.zzDecode = function() {
		var e = -(1 & this.lo);
		return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ e) >>> 0, this.hi = (this.hi >>> 1 ^ e) >>> 0, this
	}, LongBits$2.prototype.length = function() {
		var e = this.lo,
			t = (this.lo >>> 28 | this.hi << 4) >>> 0,
			r = this.hi >>> 24;
		return 0 === r ? 0 === t ? e < 16384 ? e < 128 ? 1 : 2 : e < 2097152 ? 3 : 4 : t < 16384 ? t < 128 ? 5 : 6 : t < 2097152 ? 7 : 8 : r < 128 ? 9 : 10
	},
	function(e) {
		var t = minimal$1;

		function r(e, t, r) {
			for (var n = Object.keys(t), o = 0; o < n.length; ++o) void 0 !== e[n[o]] && r || (e[n[o]] = t[n[o]]);
			return e
		}

		function n(e) {
			function t(e, n) {
				if (!(this instanceof t)) return new t(e, n);
				Object.defineProperty(this, "message", {
					get: function() {
						return e
					}
				}), Error.captureStackTrace ? Error.captureStackTrace(this, t) : Object.defineProperty(this, "stack", {
					value: (new Error).stack || ""
				}), n && r(this, n)
			}
			return (t.prototype = Object.create(Error.prototype)).constructor = t, Object.defineProperty(t.prototype, "name", {
				get: function() {
					return e
				}
			}), t.prototype.toString = function() {
				return this.name + ": " + this.message
			}, t
		}
		t.asPromise = aspromise, t.base64 = base64$3, t.EventEmitter = eventemitter, t.float = float, t.inquire = inquire_1, t.utf8 = utf8$2, t.pool = pool_1, t.LongBits = longbits, t.isNode = Boolean(void 0 !== commonjsGlobal && commonjsGlobal && commonjsGlobal.process && commonjsGlobal.process.versions && commonjsGlobal.process.versions.node), t.global = t.isNode && commonjsGlobal || "undefined" != typeof window && window || "undefined" != typeof self && self || commonjsGlobal, t.emptyArray = Object.freeze ? Object.freeze([]) : [], t.emptyObject = Object.freeze ? Object.freeze({}) : {}, t.isInteger = Number.isInteger || function(e) {
			return "number" == typeof e && isFinite(e) && Math.floor(e) === e
		}, t.isString = function(e) {
			return "string" == typeof e || e instanceof String
		}, t.isObject = function(e) {
			return e && "object" == typeof e
		}, t.isset = t.isSet = function(e, t) {
			var r = e[t];
			return !(null == r || !e.hasOwnProperty(t)) && ("object" != typeof r || (Array.isArray(r) ? r.length : Object.keys(r).length) > 0)
		}, t.Buffer = function() {
			try {
				var e = t.inquire("buffer").Buffer;
				return e.prototype.utf8Write ? e : null
			} catch (e) {
				return null
			}
		}(), t._Buffer_from = null, t._Buffer_allocUnsafe = null, t.newBuffer = function(e) {
			return "number" == typeof e ? t.Buffer ? t._Buffer_allocUnsafe(e) : new t.Array(e) : t.Buffer ? t._Buffer_from(e) : "undefined" == typeof Uint8Array ? e : new Uint8Array(e)
		}, t.Array = "undefined" != typeof Uint8Array ? Uint8Array : Array, t.Long = t.global.dcodeIO && t.global.dcodeIO.Long || t.global.Long || t.inquire("long"), t.key2Re = /^true|false|0|1$/, t.key32Re = /^-?(?:0|[1-9][0-9]*)$/, t.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, t.longToHash = function(e) {
			return e ? t.LongBits.from(e).toHash() : t.LongBits.zeroHash
		}, t.longFromHash = function(e, r) {
			var n = t.LongBits.fromHash(e);
			return t.Long ? t.Long.fromBits(n.lo, n.hi, r) : n.toNumber(Boolean(r))
		}, t.merge = r, t.lcFirst = function(e) {
			return e.charAt(0).toLowerCase() + e.substring(1)
		}, t.newError = n, t.ProtocolError = n("ProtocolError"), t.oneOfGetter = function(e) {
			for (var t = {}, r = 0; r < e.length; ++r) t[e[r]] = 1;
			return function() {
				for (var e = Object.keys(this), r = e.length - 1; r > -1; --r)
					if (1 === t[e[r]] && void 0 !== this[e[r]] && null !== this[e[r]]) return e[r]
			}
		}, t.oneOfSetter = function(e) {
			return function(t) {
				for (var r = 0; r < e.length; ++r) e[r] !== t && delete this[e[r]]
			}
		}, t.toJSONOptions = {
			longs: String,
			enums: String,
			bytes: String,
			json: !0
		}, t._configure = function() {
			var e = t.Buffer;
			e ? (t._Buffer_from = e.from !== Uint8Array.from && e.from || function(t, r) {
				return new e(t, r)
			}, t._Buffer_allocUnsafe = e.allocUnsafe || function(t) {
				return new e(t)
			}) : t._Buffer_from = t._Buffer_allocUnsafe = null
		}
	}();
var writer = Writer$1,
	util$4 = minimal$1,
	BufferWriter$1, LongBits$1 = util$4.LongBits,
	base64$2 = util$4.base64,
	utf8$1 = util$4.utf8;

function Op(e, t, r) {
	this.fn = e, this.len = t, this.next = void 0, this.val = r
}

function noop() {}

function State(e) {
	this.head = e.head, this.tail = e.tail, this.len = e.len, this.next = e.states
}

function Writer$1() {
	this.len = 0, this.head = new Op(noop, 0, 0), this.tail = this.head, this.states = null
}
var create$2 = function() {
	return util$4.Buffer ? function() {
		return (Writer$1.create = function() {
			return new BufferWriter$1
		})()
	} : function() {
		return new Writer$1
	}
};

function writeByte(e, t, r) {
	t[r] = 255 & e
}

function writeVarint32(e, t, r) {
	for (; e > 127;) t[r++] = 127 & e | 128, e >>>= 7;
	t[r] = e
}

function VarintOp(e, t) {
	this.len = e, this.next = void 0, this.val = t
}

function writeVarint64(e, t, r) {
	for (; e.hi;) t[r++] = 127 & e.lo | 128, e.lo = (e.lo >>> 7 | e.hi << 25) >>> 0, e.hi >>>= 7;
	for (; e.lo > 127;) t[r++] = 127 & e.lo | 128, e.lo = e.lo >>> 7;
	t[r++] = e.lo
}

function writeFixed32(e, t, r) {
	t[r] = 255 & e, t[r + 1] = e >>> 8 & 255, t[r + 2] = e >>> 16 & 255, t[r + 3] = e >>> 24
}
Writer$1.create = create$2(), Writer$1.alloc = function(e) {
	return new util$4.Array(e)
}, util$4.Array !== Array && (Writer$1.alloc = util$4.pool(Writer$1.alloc, util$4.Array.prototype.subarray)), Writer$1.prototype._push = function(e, t, r) {
	return this.tail = this.tail.next = new Op(e, t, r), this.len += t, this
}, VarintOp.prototype = Object.create(Op.prototype), VarintOp.prototype.fn = writeVarint32, Writer$1.prototype.uint32 = function(e) {
	return this.len += (this.tail = this.tail.next = new VarintOp((e >>>= 0) < 128 ? 1 : e < 16384 ? 2 : e < 2097152 ? 3 : e < 268435456 ? 4 : 5, e)).len, this
}, Writer$1.prototype.int32 = function(e) {
	return e < 0 ? this._push(writeVarint64, 10, LongBits$1.fromNumber(e)) : this.uint32(e)
}, Writer$1.prototype.sint32 = function(e) {
	return this.uint32((e << 1 ^ e >> 31) >>> 0)
}, Writer$1.prototype.uint64 = function(e) {
	var t = LongBits$1.from(e);
	return this._push(writeVarint64, t.length(), t)
}, Writer$1.prototype.int64 = Writer$1.prototype.uint64, Writer$1.prototype.sint64 = function(e) {
	var t = LongBits$1.from(e).zzEncode();
	return this._push(writeVarint64, t.length(), t)
}, Writer$1.prototype.bool = function(e) {
	return this._push(writeByte, 1, e ? 1 : 0)
}, Writer$1.prototype.fixed32 = function(e) {
	return this._push(writeFixed32, 4, e >>> 0)
}, Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32, Writer$1.prototype.fixed64 = function(e) {
	var t = LongBits$1.from(e);
	return this._push(writeFixed32, 4, t.lo)._push(writeFixed32, 4, t.hi)
}, Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64, Writer$1.prototype.float = function(e) {
	return this._push(util$4.float.writeFloatLE, 4, e)
}, Writer$1.prototype.double = function(e) {
	return this._push(util$4.float.writeDoubleLE, 8, e)
};
var writeBytes = util$4.Array.prototype.set ? function(e, t, r) {
	t.set(e, r)
} : function(e, t, r) {
	for (var n = 0; n < e.length; ++n) t[r + n] = e[n]
};
Writer$1.prototype.bytes = function(e) {
	var t = e.length >>> 0;
	if (!t) return this._push(writeByte, 1, 0);
	if (util$4.isString(e)) {
		var r = Writer$1.alloc(t = base64$2.length(e));
		base64$2.decode(e, r, 0), e = r
	}
	return this.uint32(t)._push(writeBytes, t, e)
}, Writer$1.prototype.string = function(e) {
	var t = utf8$1.length(e);
	return t ? this.uint32(t)._push(utf8$1.write, t, e) : this._push(writeByte, 1, 0)
}, Writer$1.prototype.fork = function() {
	return this.states = new State(this), this.head = this.tail = new Op(noop, 0, 0), this.len = 0, this
}, Writer$1.prototype.reset = function() {
	return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new Op(noop, 0, 0), this.len = 0), this
}, Writer$1.prototype.ldelim = function() {
	var e = this.head,
		t = this.tail,
		r = this.len;
	return this.reset().uint32(r), r && (this.tail.next = e.next, this.tail = t, this.len += r), this
}, Writer$1.prototype.finish = function() {
	for (var e = this.head.next, t = this.constructor.alloc(this.len), r = 0; e;) e.fn(e.val, t, r), r += e.len, e = e.next;
	return t
}, Writer$1._configure = function(e) {
	BufferWriter$1 = e, Writer$1.create = create$2(), BufferWriter$1._configure()
};
var writer_buffer = BufferWriter,
	Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
var util$3 = minimal$1;

function BufferWriter() {
	Writer.call(this)
}

function writeStringBuffer(e, t, r) {
	e.length < 40 ? util$3.utf8.write(e, t, r) : t.utf8Write ? t.utf8Write(e, r) : t.write(e, r)
}
BufferWriter._configure = function() {
	BufferWriter.alloc = util$3._Buffer_allocUnsafe, BufferWriter.writeBytesBuffer = util$3.Buffer && util$3.Buffer.prototype instanceof Uint8Array && "set" === util$3.Buffer.prototype.set.name ? function(e, t, r) {
		t.set(e, r)
	} : function(e, t, r) {
		if (e.copy) e.copy(t, r, 0, e.length);
		else
			for (var n = 0; n < e.length;) t[r++] = e[n++]
	}
}, BufferWriter.prototype.bytes = function(e) {
	util$3.isString(e) && (e = util$3._Buffer_from(e, "base64"));
	var t = e.length >>> 0;
	return this.uint32(t), t && this._push(BufferWriter.writeBytesBuffer, t, e), this
}, BufferWriter.prototype.string = function(e) {
	var t = util$3.Buffer.byteLength(e);
	return this.uint32(t), t && this._push(writeStringBuffer, t, e), this
}, BufferWriter._configure();
var reader = Reader$1,
	util$2 = minimal$1,
	BufferReader$1, LongBits = util$2.LongBits,
	utf8 = util$2.utf8;

function indexOutOfRange(e, t) {
	return RangeError("index out of range: " + e.pos + " + " + (t || 1) + " > " + e.len)
}

function Reader$1(e) {
	this.buf = e, this.pos = 0, this.len = e.length
}
var create_array = "undefined" != typeof Uint8Array ? function(e) {
		if (e instanceof Uint8Array || Array.isArray(e)) return new Reader$1(e);
		throw Error("illegal buffer")
	} : function(e) {
		if (Array.isArray(e)) return new Reader$1(e);
		throw Error("illegal buffer")
	},
	create$1 = function() {
		return util$2.Buffer ? function(e) {
			return (Reader$1.create = function(e) {
				return util$2.Buffer.isBuffer(e) ? new BufferReader$1(e) : create_array(e)
			})(e)
		} : create_array
	},
	value;

function readLongVarint() {
	var e = new LongBits(0, 0),
		t = 0;
	if (!(this.len - this.pos > 4)) {
		for (; t < 3; ++t) {
			if (this.pos >= this.len) throw indexOutOfRange(this);
			if (e.lo = (e.lo | (127 & this.buf[this.pos]) << 7 * t) >>> 0, this.buf[this.pos++] < 128) return e
		}
		return e.lo = (e.lo | (127 & this.buf[this.pos++]) << 7 * t) >>> 0, e
	}
	for (; t < 4; ++t)
		if (e.lo = (e.lo | (127 & this.buf[this.pos]) << 7 * t) >>> 0, this.buf[this.pos++] < 128) return e;
	if (e.lo = (e.lo | (127 & this.buf[this.pos]) << 28) >>> 0, e.hi = (e.hi | (127 & this.buf[this.pos]) >> 4) >>> 0, this.buf[this.pos++] < 128) return e;
	if (t = 0, this.len - this.pos > 4) {
		for (; t < 5; ++t)
			if (e.hi = (e.hi | (127 & this.buf[this.pos]) << 7 * t + 3) >>> 0, this.buf[this.pos++] < 128) return e
	} else
		for (; t < 5; ++t) {
			if (this.pos >= this.len) throw indexOutOfRange(this);
			if (e.hi = (e.hi | (127 & this.buf[this.pos]) << 7 * t + 3) >>> 0, this.buf[this.pos++] < 128) return e
		}
	throw Error("invalid varint encoding")
}

function readFixed32_end(e, t) {
	return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0
}

function readFixed64() {
	if (this.pos + 8 > this.len) throw indexOutOfRange(this, 8);
	return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4))
}
Reader$1.create = create$1(), Reader$1.prototype._slice = util$2.Array.prototype.subarray || util$2.Array.prototype.slice, Reader$1.prototype.uint32 = (value = 4294967295, function() {
	if (value = (127 & this.buf[this.pos]) >>> 0, this.buf[this.pos++] < 128) return value;
	if (value = (value | (127 & this.buf[this.pos]) << 7) >>> 0, this.buf[this.pos++] < 128) return value;
	if (value = (value | (127 & this.buf[this.pos]) << 14) >>> 0, this.buf[this.pos++] < 128) return value;
	if (value = (value | (127 & this.buf[this.pos]) << 21) >>> 0, this.buf[this.pos++] < 128) return value;
	if (value = (value | (15 & this.buf[this.pos]) << 28) >>> 0, this.buf[this.pos++] < 128) return value;
	if ((this.pos += 5) > this.len) throw this.pos = this.len, indexOutOfRange(this, 10);
	return value
}), Reader$1.prototype.int32 = function() {
	return 0 | this.uint32()
}, Reader$1.prototype.sint32 = function() {
	var e = this.uint32();
	return e >>> 1 ^ -(1 & e) | 0
}, Reader$1.prototype.bool = function() {
	return 0 !== this.uint32()
}, Reader$1.prototype.fixed32 = function() {
	if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
	return readFixed32_end(this.buf, this.pos += 4)
}, Reader$1.prototype.sfixed32 = function() {
	if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
	return 0 | readFixed32_end(this.buf, this.pos += 4)
}, Reader$1.prototype.float = function() {
	if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
	var e = util$2.float.readFloatLE(this.buf, this.pos);
	return this.pos += 4, e
}, Reader$1.prototype.double = function() {
	if (this.pos + 8 > this.len) throw indexOutOfRange(this, 4);
	var e = util$2.float.readDoubleLE(this.buf, this.pos);
	return this.pos += 8, e
}, Reader$1.prototype.bytes = function() {
	var e = this.uint32(),
		t = this.pos,
		r = this.pos + e;
	if (r > this.len) throw indexOutOfRange(this, e);
	return this.pos += e, Array.isArray(this.buf) ? this.buf.slice(t, r) : t === r ? new this.buf.constructor(0) : this._slice.call(this.buf, t, r)
}, Reader$1.prototype.string = function() {
	var e = this.bytes();
	return utf8.read(e, 0, e.length)
}, Reader$1.prototype.skip = function(e) {
	if ("number" == typeof e) {
		if (this.pos + e > this.len) throw indexOutOfRange(this, e);
		this.pos += e
	} else
		do {
			if (this.pos >= this.len) throw indexOutOfRange(this)
		} while (128 & this.buf[this.pos++]);
	return this
}, Reader$1.prototype.skipType = function(e) {
	switch (e) {
		case 0:
			this.skip();
			break;
		case 1:
			this.skip(8);
			break;
		case 2:
			this.skip(this.uint32());
			break;
		case 3:
			for (; 4 != (e = 7 & this.uint32());) this.skipType(e);
			break;
		case 5:
			this.skip(4);
			break;
		default:
			throw Error("invalid wire type " + e + " at offset " + this.pos)
	}
	return this
}, Reader$1._configure = function(e) {
	BufferReader$1 = e, Reader$1.create = create$1(), BufferReader$1._configure();
	var t = util$2.Long ? "toLong" : "toNumber";
	util$2.merge(Reader$1.prototype, {
		int64: function() {
			return readLongVarint.call(this)[t](!1)
		},
		uint64: function() {
			return readLongVarint.call(this)[t](!0)
		},
		sint64: function() {
			return readLongVarint.call(this).zzDecode()[t](!1)
		},
		fixed64: function() {
			return readFixed64.call(this)[t](!0)
		},
		sfixed64: function() {
			return readFixed64.call(this)[t](!1)
		}
	})
};
var reader_buffer = BufferReader,
	Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
var util$1 = minimal$1;

function BufferReader(e) {
	Reader.call(this, e)
}
BufferReader._configure = function() {
	util$1.Buffer && (BufferReader.prototype._slice = util$1.Buffer.prototype.slice)
}, BufferReader.prototype.string = function() {
	var e = this.uint32();
	return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + e, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + e, this.len))
}, BufferReader._configure();
var rpc = {},
	service = Service,
	util = minimal$1;

function Service(e, t, r) {
	if ("function" != typeof e) throw TypeError("rpcImpl must be a function");
	util.EventEmitter.call(this), this.rpcImpl = e, this.requestDelimited = Boolean(t), this.responseDelimited = Boolean(r)
}(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service, Service.prototype.rpcCall = function e(t, r, n, o, i) {
		if (!o) throw TypeError("request must be specified");
		var s = this;
		if (!i) return util.asPromise(e, s, t, r, n, o);
		if (s.rpcImpl) try {
			return s.rpcImpl(t, r[s.requestDelimited ? "encodeDelimited" : "encode"](o).finish(), (function(e, r) {
				if (e) return s.emit("error", e, t), i(e);
				if (null !== r) {
					if (!(r instanceof n)) try {
						r = n[s.responseDelimited ? "decodeDelimited" : "decode"](r)
					} catch (e) {
						return s.emit("error", e, t), i(e)
					}
					return s.emit("data", r, t), i(null, r)
				}
				s.end(!0)
			}))
		} catch (e) {
			return s.emit("error", e, t), void setTimeout((function() {
				i(e)
			}), 0)
		} else setTimeout((function() {
			i(Error("already ended"))
		}), 0)
	}, Service.prototype.end = function(e) {
		return this.rpcImpl && (e || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this
	},
	function(e) {
		e.Service = service
	}(rpc);
var roots = {};
! function(e) {
	var t = indexMinimal;

	function r() {
		t.util._configure(), t.Writer._configure(t.BufferWriter), t.Reader._configure(t.BufferReader)
	}
	t.build = "minimal", t.Writer = writer, t.BufferWriter = writer_buffer, t.Reader = reader, t.BufferReader = reader_buffer, t.util = minimal$1, t.rpc = rpc, t.roots = roots, t.configure = r, r()
}();
var minimal = indexMinimal;
const $Reader = minimal.Reader,
	$Writer = minimal.Writer,
	$util = minimal.util,
	$root = minimal.roots["ipfs-unixfs"] || (minimal.roots["ipfs-unixfs"] = {}),
	Data = $root.Data = (() => {
		function e(e) {
			if (this.blocksizes = [], e)
				for (var t = Object.keys(e), r = 0; r < t.length; ++r) null != e[t[r]] && (this[t[r]] = e[t[r]])
		}
		return e.prototype.Type = 0, e.prototype.Data = $util.newBuffer([]), e.prototype.filesize = $util.Long ? $util.Long.fromBits(0, 0, !0) : 0, e.prototype.blocksizes = $util.emptyArray, e.prototype.hashType = $util.Long ? $util.Long.fromBits(0, 0, !0) : 0, e.prototype.fanout = $util.Long ? $util.Long.fromBits(0, 0, !0) : 0, e.prototype.mode = 0, e.prototype.mtime = null, e.encode = function(e, t) {
			if (t || (t = $Writer.create()), t.uint32(8).int32(e.Type), null != e.Data && Object.hasOwnProperty.call(e, "Data") && t.uint32(18).bytes(e.Data), null != e.filesize && Object.hasOwnProperty.call(e, "filesize") && t.uint32(24).uint64(e.filesize), null != e.blocksizes && e.blocksizes.length)
				for (var r = 0; r < e.blocksizes.length; ++r) t.uint32(32).uint64(e.blocksizes[r]);
			return null != e.hashType && Object.hasOwnProperty.call(e, "hashType") && t.uint32(40).uint64(e.hashType), null != e.fanout && Object.hasOwnProperty.call(e, "fanout") && t.uint32(48).uint64(e.fanout), null != e.mode && Object.hasOwnProperty.call(e, "mode") && t.uint32(56).uint32(e.mode), null != e.mtime && Object.hasOwnProperty.call(e, "mtime") && $root.UnixTime.encode(e.mtime, t.uint32(66).fork()).ldelim(), t
		}, e.decode = function(e, t) {
			e instanceof $Reader || (e = $Reader.create(e));
			for (var r = void 0 === t ? e.len : e.pos + t, n = new $root.Data; e.pos < r;) {
				var o = e.uint32();
				switch (o >>> 3) {
					case 1:
						n.Type = e.int32();
						break;
					case 2:
						n.Data = e.bytes();
						break;
					case 3:
						n.filesize = e.uint64();
						break;
					case 4:
						if (n.blocksizes && n.blocksizes.length || (n.blocksizes = []), 2 == (7 & o))
							for (var i = e.uint32() + e.pos; e.pos < i;) n.blocksizes.push(e.uint64());
						else n.blocksizes.push(e.uint64());
						break;
					case 5:
						n.hashType = e.uint64();
						break;
					case 6:
						n.fanout = e.uint64();
						break;
					case 7:
						n.mode = e.uint32();
						break;
					case 8:
						n.mtime = $root.UnixTime.decode(e, e.uint32());
						break;
					default:
						e.skipType(7 & o)
				}
			}
			if (!n.hasOwnProperty("Type")) throw $util.ProtocolError("missing required 'Type'", {
				instance: n
			});
			return n
		}, e.fromObject = function(e) {
			if (e instanceof $root.Data) return e;
			var t = new $root.Data;
			switch (e.Type) {
				case "Raw":
				case 0:
					t.Type = 0;
					break;
				case "Directory":
				case 1:
					t.Type = 1;
					break;
				case "File":
				case 2:
					t.Type = 2;
					break;
				case "Metadata":
				case 3:
					t.Type = 3;
					break;
				case "Symlink":
				case 4:
					t.Type = 4;
					break;
				case "HAMTShard":
				case 5:
					t.Type = 5
			}
			if (null != e.Data && ("string" == typeof e.Data ? $util.base64.decode(e.Data, t.Data = $util.newBuffer($util.base64.length(e.Data)), 0) : e.Data.length && (t.Data = e.Data)), null != e.filesize && ($util.Long ? (t.filesize = $util.Long.fromValue(e.filesize)).unsigned = !0 : "string" == typeof e.filesize ? t.filesize = parseInt(e.filesize, 10) : "number" == typeof e.filesize ? t.filesize = e.filesize : "object" == typeof e.filesize && (t.filesize = new $util.LongBits(e.filesize.low >>> 0, e.filesize.high >>> 0).toNumber(!0))), e.blocksizes) {
				if (!Array.isArray(e.blocksizes)) throw TypeError(".Data.blocksizes: array expected");
				t.blocksizes = [];
				for (var r = 0; r < e.blocksizes.length; ++r) $util.Long ? (t.blocksizes[r] = $util.Long.fromValue(e.blocksizes[r])).unsigned = !0 : "string" == typeof e.blocksizes[r] ? t.blocksizes[r] = parseInt(e.blocksizes[r], 10) : "number" == typeof e.blocksizes[r] ? t.blocksizes[r] = e.blocksizes[r] : "object" == typeof e.blocksizes[r] && (t.blocksizes[r] = new $util.LongBits(e.blocksizes[r].low >>> 0, e.blocksizes[r].high >>> 0).toNumber(!0))
			}
			if (null != e.hashType && ($util.Long ? (t.hashType = $util.Long.fromValue(e.hashType)).unsigned = !0 : "string" == typeof e.hashType ? t.hashType = parseInt(e.hashType, 10) : "number" == typeof e.hashType ? t.hashType = e.hashType : "object" == typeof e.hashType && (t.hashType = new $util.LongBits(e.hashType.low >>> 0, e.hashType.high >>> 0).toNumber(!0))), null != e.fanout && ($util.Long ? (t.fanout = $util.Long.fromValue(e.fanout)).unsigned = !0 : "string" == typeof e.fanout ? t.fanout = parseInt(e.fanout, 10) : "number" == typeof e.fanout ? t.fanout = e.fanout : "object" == typeof e.fanout && (t.fanout = new $util.LongBits(e.fanout.low >>> 0, e.fanout.high >>> 0).toNumber(!0))), null != e.mode && (t.mode = e.mode >>> 0), null != e.mtime) {
				if ("object" != typeof e.mtime) throw TypeError(".Data.mtime: object expected");
				t.mtime = $root.UnixTime.fromObject(e.mtime)
			}
			return t
		}, e.toObject = function(e, t) {
			t || (t = {});
			var r = {};
			if ((t.arrays || t.defaults) && (r.blocksizes = []), t.defaults) {
				if (r.Type = t.enums === String ? "Raw" : 0, t.bytes === String ? r.Data = "" : (r.Data = [], t.bytes !== Array && (r.Data = $util.newBuffer(r.Data))), $util.Long) {
					var n = new $util.Long(0, 0, !0);
					r.filesize = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n
				} else r.filesize = t.longs === String ? "0" : 0;
				if ($util.Long) {
					n = new $util.Long(0, 0, !0);
					r.hashType = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n
				} else r.hashType = t.longs === String ? "0" : 0;
				if ($util.Long) {
					n = new $util.Long(0, 0, !0);
					r.fanout = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n
				} else r.fanout = t.longs === String ? "0" : 0;
				r.mode = 0, r.mtime = null
			}
			if (null != e.Type && e.hasOwnProperty("Type") && (r.Type = t.enums === String ? $root.Data.DataType[e.Type] : e.Type), null != e.Data && e.hasOwnProperty("Data") && (r.Data = t.bytes === String ? $util.base64.encode(e.Data, 0, e.Data.length) : t.bytes === Array ? Array.prototype.slice.call(e.Data) : e.Data), null != e.filesize && e.hasOwnProperty("filesize") && ("number" == typeof e.filesize ? r.filesize = t.longs === String ? String(e.filesize) : e.filesize : r.filesize = t.longs === String ? $util.Long.prototype.toString.call(e.filesize) : t.longs === Number ? new $util.LongBits(e.filesize.low >>> 0, e.filesize.high >>> 0).toNumber(!0) : e.filesize), e.blocksizes && e.blocksizes.length) {
				r.blocksizes = [];
				for (var o = 0; o < e.blocksizes.length; ++o) "number" == typeof e.blocksizes[o] ? r.blocksizes[o] = t.longs === String ? String(e.blocksizes[o]) : e.blocksizes[o] : r.blocksizes[o] = t.longs === String ? $util.Long.prototype.toString.call(e.blocksizes[o]) : t.longs === Number ? new $util.LongBits(e.blocksizes[o].low >>> 0, e.blocksizes[o].high >>> 0).toNumber(!0) : e.blocksizes[o]
			}
			return null != e.hashType && e.hasOwnProperty("hashType") && ("number" == typeof e.hashType ? r.hashType = t.longs === String ? String(e.hashType) : e.hashType : r.hashType = t.longs === String ? $util.Long.prototype.toString.call(e.hashType) : t.longs === Number ? new $util.LongBits(e.hashType.low >>> 0, e.hashType.high >>> 0).toNumber(!0) : e.hashType), null != e.fanout && e.hasOwnProperty("fanout") && ("number" == typeof e.fanout ? r.fanout = t.longs === String ? String(e.fanout) : e.fanout : r.fanout = t.longs === String ? $util.Long.prototype.toString.call(e.fanout) : t.longs === Number ? new $util.LongBits(e.fanout.low >>> 0, e.fanout.high >>> 0).toNumber(!0) : e.fanout), null != e.mode && e.hasOwnProperty("mode") && (r.mode = e.mode), null != e.mtime && e.hasOwnProperty("mtime") && (r.mtime = $root.UnixTime.toObject(e.mtime, t)), r
		}, e.prototype.toJSON = function() {
			return this.constructor.toObject(this, minimal.util.toJSONOptions)
		}, e.DataType = function() {
			const e = {},
				t = Object.create(e);
			return t[e[0] = "Raw"] = 0, t[e[1] = "Directory"] = 1, t[e[2] = "File"] = 2, t[e[3] = "Metadata"] = 3, t[e[4] = "Symlink"] = 4, t[e[5] = "HAMTShard"] = 5, t
		}(), e
	})();
$root.UnixTime = (() => {
	function e(e) {
		if (e)
			for (var t = Object.keys(e), r = 0; r < t.length; ++r) null != e[t[r]] && (this[t[r]] = e[t[r]])
	}
	return e.prototype.Seconds = $util.Long ? $util.Long.fromBits(0, 0, !1) : 0, e.prototype.FractionalNanoseconds = 0, e.encode = function(e, t) {
		return t || (t = $Writer.create()), t.uint32(8).int64(e.Seconds), null != e.FractionalNanoseconds && Object.hasOwnProperty.call(e, "FractionalNanoseconds") && t.uint32(21).fixed32(e.FractionalNanoseconds), t
	}, e.decode = function(e, t) {
		e instanceof $Reader || (e = $Reader.create(e));
		for (var r = void 0 === t ? e.len : e.pos + t, n = new $root.UnixTime; e.pos < r;) {
			var o = e.uint32();
			switch (o >>> 3) {
				case 1:
					n.Seconds = e.int64();
					break;
				case 2:
					n.FractionalNanoseconds = e.fixed32();
					break;
				default:
					e.skipType(7 & o)
			}
		}
		if (!n.hasOwnProperty("Seconds")) throw $util.ProtocolError("missing required 'Seconds'", {
			instance: n
		});
		return n
	}, e.fromObject = function(e) {
		if (e instanceof $root.UnixTime) return e;
		var t = new $root.UnixTime;
		return null != e.Seconds && ($util.Long ? (t.Seconds = $util.Long.fromValue(e.Seconds)).unsigned = !1 : "string" == typeof e.Seconds ? t.Seconds = parseInt(e.Seconds, 10) : "number" == typeof e.Seconds ? t.Seconds = e.Seconds : "object" == typeof e.Seconds && (t.Seconds = new $util.LongBits(e.Seconds.low >>> 0, e.Seconds.high >>> 0).toNumber())), null != e.FractionalNanoseconds && (t.FractionalNanoseconds = e.FractionalNanoseconds >>> 0), t
	}, e.toObject = function(e, t) {
		t || (t = {});
		var r = {};
		if (t.defaults) {
			if ($util.Long) {
				var n = new $util.Long(0, 0, !1);
				r.Seconds = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n
			} else r.Seconds = t.longs === String ? "0" : 0;
			r.FractionalNanoseconds = 0
		}
		return null != e.Seconds && e.hasOwnProperty("Seconds") && ("number" == typeof e.Seconds ? r.Seconds = t.longs === String ? String(e.Seconds) : e.Seconds : r.Seconds = t.longs === String ? $util.Long.prototype.toString.call(e.Seconds) : t.longs === Number ? new $util.LongBits(e.Seconds.low >>> 0, e.Seconds.high >>> 0).toNumber() : e.Seconds), null != e.FractionalNanoseconds && e.hasOwnProperty("FractionalNanoseconds") && (r.FractionalNanoseconds = e.FractionalNanoseconds), r
	}, e.prototype.toJSON = function() {
		return this.constructor.toObject(this, minimal.util.toJSONOptions)
	}, e
})(), $root.Metadata = (() => {
	function e(e) {
		if (e)
			for (var t = Object.keys(e), r = 0; r < t.length; ++r) null != e[t[r]] && (this[t[r]] = e[t[r]])
	}
	return e.prototype.MimeType = "", e.encode = function(e, t) {
		return t || (t = $Writer.create()), null != e.MimeType && Object.hasOwnProperty.call(e, "MimeType") && t.uint32(10).string(e.MimeType), t
	}, e.decode = function(e, t) {
		e instanceof $Reader || (e = $Reader.create(e));
		for (var r = void 0 === t ? e.len : e.pos + t, n = new $root.Metadata; e.pos < r;) {
			var o = e.uint32();
			if (o >>> 3 == 1) n.MimeType = e.string();
			else e.skipType(7 & o)
		}
		return n
	}, e.fromObject = function(e) {
		if (e instanceof $root.Metadata) return e;
		var t = new $root.Metadata;
		return null != e.MimeType && (t.MimeType = String(e.MimeType)), t
	}, e.toObject = function(e, t) {
		t || (t = {});
		var r = {};
		return t.defaults && (r.MimeType = ""), null != e.MimeType && e.hasOwnProperty("MimeType") && (r.MimeType = e.MimeType), r
	}, e.prototype.toJSON = function() {
		return this.constructor.toObject(this, minimal.util.toJSONOptions)
	}, e
})();
const PBData = Data,
	types = ["raw", "directory", "file", "metadata", "symlink", "hamt-sharded-directory"],
	dirTypes = ["directory", "hamt-sharded-directory"],
	DEFAULT_FILE_MODE = parseInt("0644", 8),
	DEFAULT_DIRECTORY_MODE = parseInt("0755", 8);

function parseMode(e) {
	if (null != e) return "number" == typeof e ? 4095 & e : "0" === (e = e.toString()).substring(0, 1) ? 4095 & parseInt(e, 8) : 4095 & parseInt(e, 10)
}

function parseMtime(e) {
	if (null == e) return;
	let t;
	if (null != e.secs && (t = {
			secs: e.secs,
			nsecs: e.nsecs
		}), null != e.Seconds && (t = {
			secs: e.Seconds,
			nsecs: e.FractionalNanoseconds
		}), Array.isArray(e) && (t = {
			secs: e[0],
			nsecs: e[1]
		}), e instanceof Date) {
		const r = e.getTime(),
			n = Math.floor(r / 1e3);
		t = {
			secs: n,
			nsecs: 1e3 * (r - 1e3 * n)
		}
	}
	if (Object.prototype.hasOwnProperty.call(t, "secs")) {
		if (null != t && null != t.nsecs && (t.nsecs < 0 || t.nsecs > 999999999)) throw errCode(new Error("mtime-nsecs must be within the range [0,999999999]"), "ERR_INVALID_MTIME_NSECS");
		return t
	}
}
class UnixFS {
	static unmarshal(e) {
		const t = PBData.decode(e),
			r = PBData.toObject(t, {
				defaults: !1,
				arrays: !0,
				longs: Number,
				objects: !1
			}),
			n = new UnixFS({
				type: types[r.Type],
				data: r.Data,
				blockSizes: r.blocksizes,
				mode: r.mode,
				mtime: r.mtime ? {
					secs: r.mtime.Seconds,
					nsecs: r.mtime.FractionalNanoseconds
				} : void 0
			});
		return n._originalMode = r.mode || 0, n
	}
	constructor(e = {
		type: "file"
	}) {
		const {
			type: t,
			data: r,
			blockSizes: n,
			hashType: o,
			fanout: i,
			mtime: s,
			mode: a
		} = e;
		if (t && !types.includes(t)) throw errCode(new Error("Type: " + t + " is not valid"), "ERR_INVALID_TYPE");
		this.type = t || "file", this.data = r, this.hashType = o, this.fanout = i, this.blockSizes = n || [], this._originalMode = 0, this.mode = parseMode(a), s && (this.mtime = parseMtime(s), this.mtime && !this.mtime.nsecs && (this.mtime.nsecs = 0))
	}
	set mode(e) {
		this._mode = this.isDirectory() ? DEFAULT_DIRECTORY_MODE : DEFAULT_FILE_MODE;
		const t = parseMode(e);
		void 0 !== t && (this._mode = t)
	}
	get mode() {
		return this._mode
	}
	isDirectory() {
		return Boolean(this.type && dirTypes.includes(this.type))
	}
	addBlockSize(e) {
		this.blockSizes.push(e)
	}
	removeBlockSize(e) {
		this.blockSizes.splice(e, 1)
	}
	fileSize() {
		if (this.isDirectory()) return 0;
		let e = 0;
		return this.blockSizes.forEach((t => {
			e += t
		})), this.data && (e += this.data.length), e
	}
	marshal() {
		let e;
		switch (this.type) {
			case "raw":
				e = PBData.DataType.Raw;
				break;
			case "directory":
				e = PBData.DataType.Directory;
				break;
			case "file":
				e = PBData.DataType.File;
				break;
			case "metadata":
				e = PBData.DataType.Metadata;
				break;
			case "symlink":
				e = PBData.DataType.Symlink;
				break;
			case "hamt-sharded-directory":
				e = PBData.DataType.HAMTShard;
				break;
			default:
				throw errCode(new Error("Type: " + e + " is not valid"), "ERR_INVALID_TYPE")
		}
		let t, r, n = this.data;
		if (this.data && this.data.length || (n = void 0), null != this.mode && (t = 4294963200 & this._originalMode | (parseMode(this.mode) || 0), t !== DEFAULT_FILE_MODE || this.isDirectory() || (t = void 0), t === DEFAULT_DIRECTORY_MODE && this.isDirectory() && (t = void 0)), null != this.mtime) {
			const e = parseMtime(this.mtime);
			e && (r = {
				Seconds: e.secs,
				FractionalNanoseconds: e.nsecs
			}, 0 === r.FractionalNanoseconds && delete r.FractionalNanoseconds)
		}
		const o = {
			Type: e,
			Data: n,
			filesize: this.isDirectory() ? void 0 : this.fileSize(),
			blocksizes: this.blockSizes,
			hashType: this.hashType,
			fanout: this.fanout,
			mode: t,
			mtime: r
		};
		return PBData.encode(o).finish()
	}
}
const persist = async (e, t, r) => {
	r.codec || (r.codec = dagPb), r.hasher || (r.hasher = sha256), void 0 === r.cidVersion && (r.cidVersion = 1), r.codec === dagPb && r.hasher !== sha256 && (r.cidVersion = 1);
	const n = await r.hasher.digest(e),
		o = CID.create(r.cidVersion, r.codec.code, n);
	return r.onlyHash || await t.put(o, e, {
		signal: r.signal
	}), o
}, dirBuilder = async (e, t, r) => {
	const n = new UnixFS({
			type: "directory",
			mtime: e.mtime,
			mode: e.mode
		}),
		o = encode$1(prepare({
			Data: n.marshal()
		}));
	return {
		cid: await persist(o, t, r),
		path: e.path,
		unixfs: n,
		size: o.length
	}
}, all = async e => {
	const t = [];
	for await (const r of e) t.push(r);
	return t
};
var itAll = all;
async function flat(e, t) {
	return t(await itAll(e))
}

function balanced(e, t, r) {
	return reduceToParents(e, t, r)
}
async function reduceToParents(e, t, r) {
	const n = [];
	for await (const o of itBatch(e, r.maxChildrenPerNode)) n.push(await t(o));
	return n.length > 1 ? reduceToParents(n, t, r) : n[0]
}
async function trickleStream(e, t, r) {
	const n = new Root(r.layerRepeat);
	let o = 0,
		i = 1,
		s = n;
	for await (const a of itBatch(e, r.maxChildrenPerNode)) s.isFull() && (s !== n && n.addChild(await s.reduce(t)), o && o % r.layerRepeat == 0 && i++, s = new SubTree(i, r.layerRepeat, o), o++), s.append(a);
	return s && s !== n && n.addChild(await s.reduce(t)), n.reduce(t)
}
class SubTree {
	constructor(e, t, r = 0) {
		this.maxDepth = e, this.layerRepeat = t, this.currentDepth = 1, this.iteration = r, this.root = this.node = this.parent = {
			children: [],
			depth: this.currentDepth,
			maxDepth: e,
			maxChildren: (this.maxDepth - this.currentDepth) * this.layerRepeat
		}
	}
	isFull() {
		if (!this.root.data) return !1;
		if (this.currentDepth < this.maxDepth && this.node.maxChildren) return this._addNextNodeToParent(this.node), !1;
		const e = this._findParent(this.node, this.currentDepth);
		return !e || (this._addNextNodeToParent(e), !1)
	}
	_addNextNodeToParent(e) {
		this.parent = e;
		const t = {
			children: [],
			depth: e.depth + 1,
			parent: e,
			maxDepth: this.maxDepth,
			maxChildren: Math.floor(e.children.length / this.layerRepeat) * this.layerRepeat
		};
		e.children.push(t), this.currentDepth = t.depth, this.node = t
	}
	append(e) {
		this.node.data = e
	}
	reduce(e) {
		return this._reduce(this.root, e)
	}
	async _reduce(e, t) {
		let r = [];
		return e.children.length && (r = await Promise.all(e.children.filter((e => e.data)).map((e => this._reduce(e, t))))), t((e.data || []).concat(r))
	}
	_findParent(e, t) {
		const r = e.parent;
		if (r && 0 !== r.depth) return r.children.length !== r.maxChildren && r.maxChildren ? r : this._findParent(r, t)
	}
}
class Root extends SubTree {
	constructor(e) {
		super(0, e), this.root.depth = 0, this.currentDepth = 1
	}
	addChild(e) {
		this.root.children.push(e)
	}
	reduce(e) {
		return e((this.root.data || []).concat(this.root.children))
	}
}
async function* bufferImporter(e, t, r) {
	for await (let n of e.content) yield async () => {
		let o;
		r.progress(n.length, e.path);
		const i = {
			codec: dagPb,
			cidVersion: r.cidVersion,
			hasher: r.hasher,
			onlyHash: r.onlyHash
		};
		return r.rawLeaves ? (i.codec = raw, i.cidVersion = 1) : (o = new UnixFS({
			type: r.leafType,
			data: n
		}), n = encode$1({
			Data: o.marshal(),
			Links: []
		})), {
			cid: await persist(n, t, i),
			unixfs: o,
			size: n.length
		}
	}
}
const dagBuilders = {
	flat: flat,
	balanced: balanced,
	trickle: trickleStream
};
async function* buildFileBatch(e, t, r) {
	let n, o, i = -1;
	o = "function" == typeof r.bufferImporter ? r.bufferImporter : bufferImporter;
	for await (const s of itParallelBatch(o(e, t, r), r.blockWriteConcurrency)) i++, 0 !== i ? (1 === i && n && (yield n, n = null), yield s) : n = s;
	n && (n.single = !0, yield n)
}
const reduce = (e, t, r) => async function(n) {
	if (1 === n.length && n[0].single && r.reduceSingleLeafToSelf) {
		const o = n[0];
		if (void 0 !== e.mtime || void 0 !== e.mode) {
			let n = await t.get(o.cid);
			o.unixfs = new UnixFS({
				type: "file",
				mtime: e.mtime,
				mode: e.mode,
				data: n
			}), n = encode$1(prepare({
				Data: o.unixfs.marshal()
			})), o.cid = await persist(n, t, {
				...r,
				codec: dagPb,
				hasher: r.hasher,
				cidVersion: r.cidVersion
			}), o.size = n.length
		}
		return {
			cid: o.cid,
			path: e.path,
			unixfs: o.unixfs,
			size: o.size
		}
	}
	const o = new UnixFS({
			type: "file",
			mtime: e.mtime,
			mode: e.mode
		}),
		i = n.filter((e => !(e.cid.code !== code$3 || !e.size) || (!(!e.unixfs || e.unixfs.data || !e.unixfs.fileSize()) || Boolean(e.unixfs && e.unixfs.data && e.unixfs.data.length)))).map((e => e.cid.code === code$3 ? (o.addBlockSize(e.size), {
			Name: "",
			Tsize: e.size,
			Hash: e.cid
		}) : (e.unixfs && e.unixfs.data ? o.addBlockSize(e.unixfs.data.length) : o.addBlockSize(e.unixfs && e.unixfs.fileSize() || 0), {
			Name: "",
			Tsize: e.size,
			Hash: e.cid
		}))),
		s = {
			Data: o.marshal(),
			Links: i
		},
		a = encode$1(prepare(s));
	return {
		cid: await persist(a, t, r),
		path: e.path,
		unixfs: o,
		size: a.length + s.Links.reduce(((e, t) => e + t.Tsize), 0)
	}
};

function fileBuilder(e, t, r) {
	const n = dagBuilders[r.strategy];
	if (!n) throw errCode(new Error(`Unknown importer build strategy name: ${r.strategy}`), "ERR_BAD_STRATEGY");
	return n(buildFileBatch(e, t, r), reduce(e, t, r), r)
}
var buffer = {},
	base64Js = {};
base64Js.byteLength = byteLength, base64Js.toByteArray = toByteArray, base64Js.fromByteArray = fromByteArray;
for (var lookup = [], revLookup = [], Arr = "undefined" != typeof Uint8Array ? Uint8Array : Array, code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, len = code.length; i < len; ++i) lookup[i] = code[i], revLookup[code.charCodeAt(i)] = i;

function getLens(e) {
	var t = e.length;
	if (t % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
	var r = e.indexOf("=");
	return -1 === r && (r = t), [r, r === t ? 0 : 4 - r % 4]
}

function byteLength(e) {
	var t = getLens(e),
		r = t[0],
		n = t[1];
	return 3 * (r + n) / 4 - n
}

function _byteLength(e, t, r) {
	return 3 * (t + r) / 4 - r
}

function toByteArray(e) {
	var t, r, n = getLens(e),
		o = n[0],
		i = n[1],
		s = new Arr(_byteLength(e, o, i)),
		a = 0,
		c = i > 0 ? o - 4 : o;
	for (r = 0; r < c; r += 4) t = revLookup[e.charCodeAt(r)] << 18 | revLookup[e.charCodeAt(r + 1)] << 12 | revLookup[e.charCodeAt(r + 2)] << 6 | revLookup[e.charCodeAt(r + 3)], s[a++] = t >> 16 & 255, s[a++] = t >> 8 & 255, s[a++] = 255 & t;
	return 2 === i && (t = revLookup[e.charCodeAt(r)] << 2 | revLookup[e.charCodeAt(r + 1)] >> 4, s[a++] = 255 & t), 1 === i && (t = revLookup[e.charCodeAt(r)] << 10 | revLookup[e.charCodeAt(r + 1)] << 4 | revLookup[e.charCodeAt(r + 2)] >> 2, s[a++] = t >> 8 & 255, s[a++] = 255 & t), s
}

function tripletToBase64(e) {
	return lookup[e >> 18 & 63] + lookup[e >> 12 & 63] + lookup[e >> 6 & 63] + lookup[63 & e]
}

function encodeChunk(e, t, r) {
	for (var n, o = [], i = t; i < r; i += 3) n = (e[i] << 16 & 16711680) + (e[i + 1] << 8 & 65280) + (255 & e[i + 2]), o.push(tripletToBase64(n));
	return o.join("")
}

function fromByteArray(e) {
	for (var t, r = e.length, n = r % 3, o = [], i = 16383, s = 0, a = r - n; s < a; s += i) o.push(encodeChunk(e, s, s + i > a ? a : s + i));
	return 1 === n ? (t = e[r - 1], o.push(lookup[t >> 2] + lookup[t << 4 & 63] + "==")) : 2 === n && (t = (e[r - 2] << 8) + e[r - 1], o.push(lookup[t >> 10] + lookup[t >> 4 & 63] + lookup[t << 2 & 63] + "=")), o.join("")
}
revLookup["-".charCodeAt(0)] = 62, revLookup["_".charCodeAt(0)] = 63;
var ieee754 = {
	/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
	read: function(e, t, r, n, o) {
		var i, s, a = 8 * o - n - 1,
			c = (1 << a) - 1,
			u = c >> 1,
			f = -7,
			l = r ? o - 1 : 0,
			h = r ? -1 : 1,
			d = e[t + l];
		for (l += h, i = d & (1 << -f) - 1, d >>= -f, f += a; f > 0; i = 256 * i + e[t + l], l += h, f -= 8);
		for (s = i & (1 << -f) - 1, i >>= -f, f += n; f > 0; s = 256 * s + e[t + l], l += h, f -= 8);
		if (0 === i) i = 1 - u;
		else {
			if (i === c) return s ? NaN : 1 / 0 * (d ? -1 : 1);
			s += Math.pow(2, n), i -= u
		}
		return (d ? -1 : 1) * s * Math.pow(2, i - n)
	},
	write: function(e, t, r, n, o, i) {
		var s, a, c, u = 8 * i - o - 1,
			f = (1 << u) - 1,
			l = f >> 1,
			h = 23 === o ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
			d = n ? 0 : i - 1,
			p = n ? 1 : -1,
			y = t < 0 || 0 === t && 1 / t < 0 ? 1 : 0;
		for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (a = isNaN(t) ? 1 : 0, s = f) : (s = Math.floor(Math.log(t) / Math.LN2), t * (c = Math.pow(2, -s)) < 1 && (s--, c *= 2), (t += s + l >= 1 ? h / c : h * Math.pow(2, 1 - l)) * c >= 2 && (s++, c /= 2), s + l >= f ? (a = 0, s = f) : s + l >= 1 ? (a = (t * c - 1) * Math.pow(2, o), s += l) : (a = t * Math.pow(2, l - 1) * Math.pow(2, o), s = 0)); o >= 8; e[r + d] = 255 & a, d += p, a /= 256, o -= 8);
		for (s = s << o | a, u += o; u > 0; e[r + d] = 255 & s, d += p, s /= 256, u -= 8);
		e[r + d - p] |= 128 * y
	}
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
! function(e) {
	const t = base64Js,
		r = ieee754,
		n = "function" == typeof Symbol && "function" == typeof Symbol.for ? Symbol.for("nodejs.util.inspect.custom") : null;
	e.Buffer = s, e.SlowBuffer = function(e) {
		+e != e && (e = 0);
		return s.alloc(+e)
	}, e.INSPECT_MAX_BYTES = 50;
	const o = 2147483647;

	function i(e) {
		if (e > o) throw new RangeError('The value "' + e + '" is invalid for option "size"');
		const t = new Uint8Array(e);
		return Object.setPrototypeOf(t, s.prototype), t
	}

	function s(e, t, r) {
		if ("number" == typeof e) {
			if ("string" == typeof t) throw new TypeError('The "string" argument must be of type string. Received type number');
			return u(e)
		}
		return a(e, t, r)
	}

	function a(e, t, r) {
		if ("string" == typeof e) return function(e, t) {
			"string" == typeof t && "" !== t || (t = "utf8");
			if (!s.isEncoding(t)) throw new TypeError("Unknown encoding: " + t);
			const r = 0 | d(e, t);
			let n = i(r);
			const o = n.write(e, t);
			o !== r && (n = n.slice(0, o));
			return n
		}(e, t);
		if (ArrayBuffer.isView(e)) return function(e) {
			if (Y(e, Uint8Array)) {
				const t = new Uint8Array(e);
				return l(t.buffer, t.byteOffset, t.byteLength)
			}
			return f(e)
		}(e);
		if (null == e) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e);
		if (Y(e, ArrayBuffer) || e && Y(e.buffer, ArrayBuffer)) return l(e, t, r);
		if ("undefined" != typeof SharedArrayBuffer && (Y(e, SharedArrayBuffer) || e && Y(e.buffer, SharedArrayBuffer))) return l(e, t, r);
		if ("number" == typeof e) throw new TypeError('The "value" argument must not be of type number. Received type number');
		const n = e.valueOf && e.valueOf();
		if (null != n && n !== e) return s.from(n, t, r);
		const o = function(e) {
			if (s.isBuffer(e)) {
				const t = 0 | h(e.length),
					r = i(t);
				return 0 === r.length || e.copy(r, 0, 0, t), r
			}
			if (void 0 !== e.length) return "number" != typeof e.length || q(e.length) ? i(0) : f(e);
			if ("Buffer" === e.type && Array.isArray(e.data)) return f(e.data)
		}(e);
		if (o) return o;
		if ("undefined" != typeof Symbol && null != Symbol.toPrimitive && "function" == typeof e[Symbol.toPrimitive]) return s.from(e[Symbol.toPrimitive]("string"), t, r);
		throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e)
	}

	function c(e) {
		if ("number" != typeof e) throw new TypeError('"size" argument must be of type number');
		if (e < 0) throw new RangeError('The value "' + e + '" is invalid for option "size"')
	}

	function u(e) {
		return c(e), i(e < 0 ? 0 : 0 | h(e))
	}

	function f(e) {
		const t = e.length < 0 ? 0 : 0 | h(e.length),
			r = i(t);
		for (let n = 0; n < t; n += 1) r[n] = 255 & e[n];
		return r
	}

	function l(e, t, r) {
		if (t < 0 || e.byteLength < t) throw new RangeError('"offset" is outside of buffer bounds');
		if (e.byteLength < t + (r || 0)) throw new RangeError('"length" is outside of buffer bounds');
		let n;
		return n = void 0 === t && void 0 === r ? new Uint8Array(e) : void 0 === r ? new Uint8Array(e, t) : new Uint8Array(e, t, r), Object.setPrototypeOf(n, s.prototype), n
	}

	function h(e) {
		if (e >= o) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + o.toString(16) + " bytes");
		return 0 | e
	}

	function d(e, t) {
		if (s.isBuffer(e)) return e.length;
		if (ArrayBuffer.isView(e) || Y(e, ArrayBuffer)) return e.byteLength;
		if ("string" != typeof e) throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e);
		const r = e.length,
			n = arguments.length > 2 && !0 === arguments[2];
		if (!n && 0 === r) return 0;
		let o = !1;
		for (;;) switch (t) {
			case "ascii":
			case "latin1":
			case "binary":
				return r;
			case "utf8":
			case "utf-8":
				return W(e).length;
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le":
				return 2 * r;
			case "hex":
				return r >>> 1;
			case "base64":
				return H(e).length;
			default:
				if (o) return n ? -1 : W(e).length;
				t = ("" + t).toLowerCase(), o = !0
		}
	}

	function p(e, t, r) {
		let n = !1;
		if ((void 0 === t || t < 0) && (t = 0), t > this.length) return "";
		if ((void 0 === r || r > this.length) && (r = this.length), r <= 0) return "";
		if ((r >>>= 0) <= (t >>>= 0)) return "";
		for (e || (e = "utf8");;) switch (e) {
			case "hex":
				return S(this, t, r);
			case "utf8":
			case "utf-8":
				return B(this, t, r);
			case "ascii":
				return k(this, t, r);
			case "latin1":
			case "binary":
				return $(this, t, r);
			case "base64":
				return v(this, t, r);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le":
				return I(this, t, r);
			default:
				if (n) throw new TypeError("Unknown encoding: " + e);
				e = (e + "").toLowerCase(), n = !0
		}
	}

	function y(e, t, r) {
		const n = e[t];
		e[t] = e[r], e[r] = n
	}

	function g(e, t, r, n, o) {
		if (0 === e.length) return -1;
		if ("string" == typeof r ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), q(r = +r) && (r = o ? 0 : e.length - 1), r < 0 && (r = e.length + r), r >= e.length) {
			if (o) return -1;
			r = e.length - 1
		} else if (r < 0) {
			if (!o) return -1;
			r = 0
		}
		if ("string" == typeof t && (t = s.from(t, n)), s.isBuffer(t)) return 0 === t.length ? -1 : b(e, t, r, n, o);
		if ("number" == typeof t) return t &= 255, "function" == typeof Uint8Array.prototype.indexOf ? o ? Uint8Array.prototype.indexOf.call(e, t, r) : Uint8Array.prototype.lastIndexOf.call(e, t, r) : b(e, [t], r, n, o);
		throw new TypeError("val must be string, number or Buffer")
	}

	function b(e, t, r, n, o) {
		let i, s = 1,
			a = e.length,
			c = t.length;
		if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
			if (e.length < 2 || t.length < 2) return -1;
			s = 2, a /= 2, c /= 2, r /= 2
		}

		function u(e, t) {
			return 1 === s ? e[t] : e.readUInt16BE(t * s)
		}
		if (o) {
			let n = -1;
			for (i = r; i < a; i++)
				if (u(e, i) === u(t, -1 === n ? 0 : i - n)) {
					if (-1 === n && (n = i), i - n + 1 === c) return n * s
				} else -1 !== n && (i -= i - n), n = -1
		} else
			for (r + c > a && (r = a - c), i = r; i >= 0; i--) {
				let r = !0;
				for (let n = 0; n < c; n++)
					if (u(e, i + n) !== u(t, n)) {
						r = !1;
						break
					} if (r) return i
			}
		return -1
	}

	function m(e, t, r, n) {
		r = Number(r) || 0;
		const o = e.length - r;
		n ? (n = Number(n)) > o && (n = o) : n = o;
		const i = t.length;
		let s;
		for (n > i / 2 && (n = i / 2), s = 0; s < n; ++s) {
			const n = parseInt(t.substr(2 * s, 2), 16);
			if (q(n)) return s;
			e[r + s] = n
		}
		return s
	}

	function w(e, t, r, n) {
		return G(W(t, e.length - r), e, r, n)
	}

	function _(e, t, r, n) {
		return G(function(e) {
			const t = [];
			for (let r = 0; r < e.length; ++r) t.push(255 & e.charCodeAt(r));
			return t
		}(t), e, r, n)
	}

	function T(e, t, r, n) {
		return G(H(t), e, r, n)
	}

	function E(e, t, r, n) {
		return G(function(e, t) {
			let r, n, o;
			const i = [];
			for (let s = 0; s < e.length && !((t -= 2) < 0); ++s) r = e.charCodeAt(s), n = r >> 8, o = r % 256, i.push(o), i.push(n);
			return i
		}(t, e.length - r), e, r, n)
	}

	function v(e, r, n) {
		return 0 === r && n === e.length ? t.fromByteArray(e) : t.fromByteArray(e.slice(r, n))
	}

	function B(e, t, r) {
		r = Math.min(e.length, r);
		const n = [];
		let o = t;
		for (; o < r;) {
			const t = e[o];
			let i = null,
				s = t > 239 ? 4 : t > 223 ? 3 : t > 191 ? 2 : 1;
			if (o + s <= r) {
				let r, n, a, c;
				switch (s) {
					case 1:
						t < 128 && (i = t);
						break;
					case 2:
						r = e[o + 1], 128 == (192 & r) && (c = (31 & t) << 6 | 63 & r, c > 127 && (i = c));
						break;
					case 3:
						r = e[o + 1], n = e[o + 2], 128 == (192 & r) && 128 == (192 & n) && (c = (15 & t) << 12 | (63 & r) << 6 | 63 & n, c > 2047 && (c < 55296 || c > 57343) && (i = c));
						break;
					case 4:
						r = e[o + 1], n = e[o + 2], a = e[o + 3], 128 == (192 & r) && 128 == (192 & n) && 128 == (192 & a) && (c = (15 & t) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & a, c > 65535 && c < 1114112 && (i = c))
				}
			}
			null === i ? (i = 65533, s = 1) : i > 65535 && (i -= 65536, n.push(i >>> 10 & 1023 | 55296), i = 56320 | 1023 & i), n.push(i), o += s
		}
		return function(e) {
			const t = e.length;
			if (t <= A) return String.fromCharCode.apply(String, e);
			let r = "",
				n = 0;
			for (; n < t;) r += String.fromCharCode.apply(String, e.slice(n, n += A));
			return r
		}(n)
	}
	e.kMaxLength = o, s.TYPED_ARRAY_SUPPORT = function() {
		try {
			const e = new Uint8Array(1),
				t = {
					foo: function() {
						return 42
					}
				};
			return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(e, t), 42 === e.foo()
		} catch (e) {
			return !1
		}
	}(), s.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), Object.defineProperty(s.prototype, "parent", {
		enumerable: !0,
		get: function() {
			if (s.isBuffer(this)) return this.buffer
		}
	}), Object.defineProperty(s.prototype, "offset", {
		enumerable: !0,
		get: function() {
			if (s.isBuffer(this)) return this.byteOffset
		}
	}), s.poolSize = 8192, s.from = function(e, t, r) {
		return a(e, t, r)
	}, Object.setPrototypeOf(s.prototype, Uint8Array.prototype), Object.setPrototypeOf(s, Uint8Array), s.alloc = function(e, t, r) {
		return function(e, t, r) {
			return c(e), e <= 0 ? i(e) : void 0 !== t ? "string" == typeof r ? i(e).fill(t, r) : i(e).fill(t) : i(e)
		}(e, t, r)
	}, s.allocUnsafe = function(e) {
		return u(e)
	}, s.allocUnsafeSlow = function(e) {
		return u(e)
	}, s.isBuffer = function(e) {
		return null != e && !0 === e._isBuffer && e !== s.prototype
	}, s.compare = function(e, t) {
		if (Y(e, Uint8Array) && (e = s.from(e, e.offset, e.byteLength)), Y(t, Uint8Array) && (t = s.from(t, t.offset, t.byteLength)), !s.isBuffer(e) || !s.isBuffer(t)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
		if (e === t) return 0;
		let r = e.length,
			n = t.length;
		for (let o = 0, i = Math.min(r, n); o < i; ++o)
			if (e[o] !== t[o]) {
				r = e[o], n = t[o];
				break
			} return r < n ? -1 : n < r ? 1 : 0
	}, s.isEncoding = function(e) {
		switch (String(e).toLowerCase()) {
			case "hex":
			case "utf8":
			case "utf-8":
			case "ascii":
			case "latin1":
			case "binary":
			case "base64":
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le":
				return !0;
			default:
				return !1
		}
	}, s.concat = function(e, t) {
		if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
		if (0 === e.length) return s.alloc(0);
		let r;
		if (void 0 === t)
			for (t = 0, r = 0; r < e.length; ++r) t += e[r].length;
		const n = s.allocUnsafe(t);
		let o = 0;
		for (r = 0; r < e.length; ++r) {
			let t = e[r];
			if (Y(t, Uint8Array)) o + t.length > n.length ? (s.isBuffer(t) || (t = s.from(t)), t.copy(n, o)) : Uint8Array.prototype.set.call(n, t, o);
			else {
				if (!s.isBuffer(t)) throw new TypeError('"list" argument must be an Array of Buffers');
				t.copy(n, o)
			}
			o += t.length
		}
		return n
	}, s.byteLength = d, s.prototype._isBuffer = !0, s.prototype.swap16 = function() {
		const e = this.length;
		if (e % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
		for (let t = 0; t < e; t += 2) y(this, t, t + 1);
		return this
	}, s.prototype.swap32 = function() {
		const e = this.length;
		if (e % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
		for (let t = 0; t < e; t += 4) y(this, t, t + 3), y(this, t + 1, t + 2);
		return this
	}, s.prototype.swap64 = function() {
		const e = this.length;
		if (e % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
		for (let t = 0; t < e; t += 8) y(this, t, t + 7), y(this, t + 1, t + 6), y(this, t + 2, t + 5), y(this, t + 3, t + 4);
		return this
	}, s.prototype.toString = function() {
		const e = this.length;
		return 0 === e ? "" : 0 === arguments.length ? B(this, 0, e) : p.apply(this, arguments)
	}, s.prototype.toLocaleString = s.prototype.toString, s.prototype.equals = function(e) {
		if (!s.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
		return this === e || 0 === s.compare(this, e)
	}, s.prototype.inspect = function() {
		let t = "";
		const r = e.INSPECT_MAX_BYTES;
		return t = this.toString("hex", 0, r).replace(/(.{2})/g, "$1 ").trim(), this.length > r && (t += " ... "), "<Buffer " + t + ">"
	}, n && (s.prototype[n] = s.prototype.inspect), s.prototype.compare = function(e, t, r, n, o) {
		if (Y(e, Uint8Array) && (e = s.from(e, e.offset, e.byteLength)), !s.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
		if (void 0 === t && (t = 0), void 0 === r && (r = e ? e.length : 0), void 0 === n && (n = 0), void 0 === o && (o = this.length), t < 0 || r > e.length || n < 0 || o > this.length) throw new RangeError("out of range index");
		if (n >= o && t >= r) return 0;
		if (n >= o) return -1;
		if (t >= r) return 1;
		if (this === e) return 0;
		let i = (o >>>= 0) - (n >>>= 0),
			a = (r >>>= 0) - (t >>>= 0);
		const c = Math.min(i, a),
			u = this.slice(n, o),
			f = e.slice(t, r);
		for (let e = 0; e < c; ++e)
			if (u[e] !== f[e]) {
				i = u[e], a = f[e];
				break
			} return i < a ? -1 : a < i ? 1 : 0
	}, s.prototype.includes = function(e, t, r) {
		return -1 !== this.indexOf(e, t, r)
	}, s.prototype.indexOf = function(e, t, r) {
		return g(this, e, t, r, !0)
	}, s.prototype.lastIndexOf = function(e, t, r) {
		return g(this, e, t, r, !1)
	}, s.prototype.write = function(e, t, r, n) {
		if (void 0 === t) n = "utf8", r = this.length, t = 0;
		else if (void 0 === r && "string" == typeof t) n = t, r = this.length, t = 0;
		else {
			if (!isFinite(t)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
			t >>>= 0, isFinite(r) ? (r >>>= 0, void 0 === n && (n = "utf8")) : (n = r, r = void 0)
		}
		const o = this.length - t;
		if ((void 0 === r || r > o) && (r = o), e.length > 0 && (r < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
		n || (n = "utf8");
		let i = !1;
		for (;;) switch (n) {
			case "hex":
				return m(this, e, t, r);
			case "utf8":
			case "utf-8":
				return w(this, e, t, r);
			case "ascii":
			case "latin1":
			case "binary":
				return _(this, e, t, r);
			case "base64":
				return T(this, e, t, r);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le":
				return E(this, e, t, r);
			default:
				if (i) throw new TypeError("Unknown encoding: " + n);
				n = ("" + n).toLowerCase(), i = !0
		}
	}, s.prototype.toJSON = function() {
		return {
			type: "Buffer",
			data: Array.prototype.slice.call(this._arr || this, 0)
		}
	};
	const A = 4096;

	function k(e, t, r) {
		let n = "";
		r = Math.min(e.length, r);
		for (let o = t; o < r; ++o) n += String.fromCharCode(127 & e[o]);
		return n
	}

	function $(e, t, r) {
		let n = "";
		r = Math.min(e.length, r);
		for (let o = t; o < r; ++o) n += String.fromCharCode(e[o]);
		return n
	}

	function S(e, t, r) {
		const n = e.length;
		(!t || t < 0) && (t = 0), (!r || r < 0 || r > n) && (r = n);
		let o = "";
		for (let n = t; n < r; ++n) o += K[e[n]];
		return o
	}

	function I(e, t, r) {
		const n = e.slice(t, r);
		let o = "";
		for (let e = 0; e < n.length - 1; e += 2) o += String.fromCharCode(n[e] + 256 * n[e + 1]);
		return o
	}

	function C(e, t, r) {
		if (e % 1 != 0 || e < 0) throw new RangeError("offset is not uint");
		if (e + t > r) throw new RangeError("Trying to access beyond buffer length")
	}

	function x(e, t, r, n, o, i) {
		if (!s.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
		if (t > o || t < i) throw new RangeError('"value" argument is out of bounds');
		if (r + n > e.length) throw new RangeError("Index out of range")
	}

	function D(e, t, r, n, o) {
		F(t, n, o, e, r, 7);
		let i = Number(t & BigInt(4294967295));
		e[r++] = i, i >>= 8, e[r++] = i, i >>= 8, e[r++] = i, i >>= 8, e[r++] = i;
		let s = Number(t >> BigInt(32) & BigInt(4294967295));
		return e[r++] = s, s >>= 8, e[r++] = s, s >>= 8, e[r++] = s, s >>= 8, e[r++] = s, r
	}

	function R(e, t, r, n, o) {
		F(t, n, o, e, r, 7);
		let i = Number(t & BigInt(4294967295));
		e[r + 7] = i, i >>= 8, e[r + 6] = i, i >>= 8, e[r + 5] = i, i >>= 8, e[r + 4] = i;
		let s = Number(t >> BigInt(32) & BigInt(4294967295));
		return e[r + 3] = s, s >>= 8, e[r + 2] = s, s >>= 8, e[r + 1] = s, s >>= 8, e[r] = s, r + 8
	}

	function O(e, t, r, n, o, i) {
		if (r + n > e.length) throw new RangeError("Index out of range");
		if (r < 0) throw new RangeError("Index out of range")
	}

	function L(e, t, n, o, i) {
		return t = +t, n >>>= 0, i || O(e, 0, n, 4), r.write(e, t, n, o, 23, 4), n + 4
	}

	function U(e, t, n, o, i) {
		return t = +t, n >>>= 0, i || O(e, 0, n, 8), r.write(e, t, n, o, 52, 8), n + 8
	}
	s.prototype.slice = function(e, t) {
		const r = this.length;
		(e = ~~e) < 0 ? (e += r) < 0 && (e = 0) : e > r && (e = r), (t = void 0 === t ? r : ~~t) < 0 ? (t += r) < 0 && (t = 0) : t > r && (t = r), t < e && (t = e);
		const n = this.subarray(e, t);
		return Object.setPrototypeOf(n, s.prototype), n
	}, s.prototype.readUintLE = s.prototype.readUIntLE = function(e, t, r) {
		e >>>= 0, t >>>= 0, r || C(e, t, this.length);
		let n = this[e],
			o = 1,
			i = 0;
		for (; ++i < t && (o *= 256);) n += this[e + i] * o;
		return n
	}, s.prototype.readUintBE = s.prototype.readUIntBE = function(e, t, r) {
		e >>>= 0, t >>>= 0, r || C(e, t, this.length);
		let n = this[e + --t],
			o = 1;
		for (; t > 0 && (o *= 256);) n += this[e + --t] * o;
		return n
	}, s.prototype.readUint8 = s.prototype.readUInt8 = function(e, t) {
		return e >>>= 0, t || C(e, 1, this.length), this[e]
	}, s.prototype.readUint16LE = s.prototype.readUInt16LE = function(e, t) {
		return e >>>= 0, t || C(e, 2, this.length), this[e] | this[e + 1] << 8
	}, s.prototype.readUint16BE = s.prototype.readUInt16BE = function(e, t) {
		return e >>>= 0, t || C(e, 2, this.length), this[e] << 8 | this[e + 1]
	}, s.prototype.readUint32LE = s.prototype.readUInt32LE = function(e, t) {
		return e >>>= 0, t || C(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3]
	}, s.prototype.readUint32BE = s.prototype.readUInt32BE = function(e, t) {
		return e >>>= 0, t || C(e, 4, this.length), 16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3])
	}, s.prototype.readBigUInt64LE = J((function(e) {
		M(e >>>= 0, "offset");
		const t = this[e],
			r = this[e + 7];
		void 0 !== t && void 0 !== r || z(e, this.length - 8);
		const n = t + 256 * this[++e] + 65536 * this[++e] + this[++e] * 2 ** 24,
			o = this[++e] + 256 * this[++e] + 65536 * this[++e] + r * 2 ** 24;
		return BigInt(n) + (BigInt(o) << BigInt(32))
	})), s.prototype.readBigUInt64BE = J((function(e) {
		M(e >>>= 0, "offset");
		const t = this[e],
			r = this[e + 7];
		void 0 !== t && void 0 !== r || z(e, this.length - 8);
		const n = t * 2 ** 24 + 65536 * this[++e] + 256 * this[++e] + this[++e],
			o = this[++e] * 2 ** 24 + 65536 * this[++e] + 256 * this[++e] + r;
		return (BigInt(n) << BigInt(32)) + BigInt(o)
	})), s.prototype.readIntLE = function(e, t, r) {
		e >>>= 0, t >>>= 0, r || C(e, t, this.length);
		let n = this[e],
			o = 1,
			i = 0;
		for (; ++i < t && (o *= 256);) n += this[e + i] * o;
		return o *= 128, n >= o && (n -= Math.pow(2, 8 * t)), n
	}, s.prototype.readIntBE = function(e, t, r) {
		e >>>= 0, t >>>= 0, r || C(e, t, this.length);
		let n = t,
			o = 1,
			i = this[e + --n];
		for (; n > 0 && (o *= 256);) i += this[e + --n] * o;
		return o *= 128, i >= o && (i -= Math.pow(2, 8 * t)), i
	}, s.prototype.readInt8 = function(e, t) {
		return e >>>= 0, t || C(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e]
	}, s.prototype.readInt16LE = function(e, t) {
		e >>>= 0, t || C(e, 2, this.length);
		const r = this[e] | this[e + 1] << 8;
		return 32768 & r ? 4294901760 | r : r
	}, s.prototype.readInt16BE = function(e, t) {
		e >>>= 0, t || C(e, 2, this.length);
		const r = this[e + 1] | this[e] << 8;
		return 32768 & r ? 4294901760 | r : r
	}, s.prototype.readInt32LE = function(e, t) {
		return e >>>= 0, t || C(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24
	}, s.prototype.readInt32BE = function(e, t) {
		return e >>>= 0, t || C(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]
	}, s.prototype.readBigInt64LE = J((function(e) {
		M(e >>>= 0, "offset");
		const t = this[e],
			r = this[e + 7];
		void 0 !== t && void 0 !== r || z(e, this.length - 8);
		const n = this[e + 4] + 256 * this[e + 5] + 65536 * this[e + 6] + (r << 24);
		return (BigInt(n) << BigInt(32)) + BigInt(t + 256 * this[++e] + 65536 * this[++e] + this[++e] * 2 ** 24)
	})), s.prototype.readBigInt64BE = J((function(e) {
		M(e >>>= 0, "offset");
		const t = this[e],
			r = this[e + 7];
		void 0 !== t && void 0 !== r || z(e, this.length - 8);
		const n = (t << 24) + 65536 * this[++e] + 256 * this[++e] + this[++e];
		return (BigInt(n) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + 65536 * this[++e] + 256 * this[++e] + r)
	})), s.prototype.readFloatLE = function(e, t) {
		return e >>>= 0, t || C(e, 4, this.length), r.read(this, e, !0, 23, 4)
	}, s.prototype.readFloatBE = function(e, t) {
		return e >>>= 0, t || C(e, 4, this.length), r.read(this, e, !1, 23, 4)
	}, s.prototype.readDoubleLE = function(e, t) {
		return e >>>= 0, t || C(e, 8, this.length), r.read(this, e, !0, 52, 8)
	}, s.prototype.readDoubleBE = function(e, t) {
		return e >>>= 0, t || C(e, 8, this.length), r.read(this, e, !1, 52, 8)
	}, s.prototype.writeUintLE = s.prototype.writeUIntLE = function(e, t, r, n) {
		if (e = +e, t >>>= 0, r >>>= 0, !n) {
			x(this, e, t, r, Math.pow(2, 8 * r) - 1, 0)
		}
		let o = 1,
			i = 0;
		for (this[t] = 255 & e; ++i < r && (o *= 256);) this[t + i] = e / o & 255;
		return t + r
	}, s.prototype.writeUintBE = s.prototype.writeUIntBE = function(e, t, r, n) {
		if (e = +e, t >>>= 0, r >>>= 0, !n) {
			x(this, e, t, r, Math.pow(2, 8 * r) - 1, 0)
		}
		let o = r - 1,
			i = 1;
		for (this[t + o] = 255 & e; --o >= 0 && (i *= 256);) this[t + o] = e / i & 255;
		return t + r
	}, s.prototype.writeUint8 = s.prototype.writeUInt8 = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 1, 255, 0), this[t] = 255 & e, t + 1
	}, s.prototype.writeUint16LE = s.prototype.writeUInt16LE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 2, 65535, 0), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2
	}, s.prototype.writeUint16BE = s.prototype.writeUInt16BE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2
	}, s.prototype.writeUint32LE = s.prototype.writeUInt32LE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = 255 & e, t + 4
	}, s.prototype.writeUint32BE = s.prototype.writeUInt32BE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4
	}, s.prototype.writeBigUInt64LE = J((function(e, t = 0) {
		return D(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"))
	})), s.prototype.writeBigUInt64BE = J((function(e, t = 0) {
		return R(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"))
	})), s.prototype.writeIntLE = function(e, t, r, n) {
		if (e = +e, t >>>= 0, !n) {
			const n = Math.pow(2, 8 * r - 1);
			x(this, e, t, r, n - 1, -n)
		}
		let o = 0,
			i = 1,
			s = 0;
		for (this[t] = 255 & e; ++o < r && (i *= 256);) e < 0 && 0 === s && 0 !== this[t + o - 1] && (s = 1), this[t + o] = (e / i >> 0) - s & 255;
		return t + r
	}, s.prototype.writeIntBE = function(e, t, r, n) {
		if (e = +e, t >>>= 0, !n) {
			const n = Math.pow(2, 8 * r - 1);
			x(this, e, t, r, n - 1, -n)
		}
		let o = r - 1,
			i = 1,
			s = 0;
		for (this[t + o] = 255 & e; --o >= 0 && (i *= 256);) e < 0 && 0 === s && 0 !== this[t + o + 1] && (s = 1), this[t + o] = (e / i >> 0) - s & 255;
		return t + r
	}, s.prototype.writeInt8 = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = 255 & e, t + 1
	}, s.prototype.writeInt16LE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 2, 32767, -32768), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2
	}, s.prototype.writeInt16BE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2
	}, s.prototype.writeInt32LE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 4, 2147483647, -2147483648), this[t] = 255 & e, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4
	}, s.prototype.writeInt32BE = function(e, t, r) {
		return e = +e, t >>>= 0, r || x(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4
	}, s.prototype.writeBigInt64LE = J((function(e, t = 0) {
		return D(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"))
	})), s.prototype.writeBigInt64BE = J((function(e, t = 0) {
		return R(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"))
	})), s.prototype.writeFloatLE = function(e, t, r) {
		return L(this, e, t, !0, r)
	}, s.prototype.writeFloatBE = function(e, t, r) {
		return L(this, e, t, !1, r)
	}, s.prototype.writeDoubleLE = function(e, t, r) {
		return U(this, e, t, !0, r)
	}, s.prototype.writeDoubleBE = function(e, t, r) {
		return U(this, e, t, !1, r)
	}, s.prototype.copy = function(e, t, r, n) {
		if (!s.isBuffer(e)) throw new TypeError("argument should be a Buffer");
		if (r || (r = 0), n || 0 === n || (n = this.length), t >= e.length && (t = e.length), t || (t = 0), n > 0 && n < r && (n = r), n === r) return 0;
		if (0 === e.length || 0 === this.length) return 0;
		if (t < 0) throw new RangeError("targetStart out of bounds");
		if (r < 0 || r >= this.length) throw new RangeError("Index out of range");
		if (n < 0) throw new RangeError("sourceEnd out of bounds");
		n > this.length && (n = this.length), e.length - t < n - r && (n = e.length - t + r);
		const o = n - r;
		return this === e && "function" == typeof Uint8Array.prototype.copyWithin ? this.copyWithin(t, r, n) : Uint8Array.prototype.set.call(e, this.subarray(r, n), t), o
	}, s.prototype.fill = function(e, t, r, n) {
		if ("string" == typeof e) {
			if ("string" == typeof t ? (n = t, t = 0, r = this.length) : "string" == typeof r && (n = r, r = this.length), void 0 !== n && "string" != typeof n) throw new TypeError("encoding must be a string");
			if ("string" == typeof n && !s.isEncoding(n)) throw new TypeError("Unknown encoding: " + n);
			if (1 === e.length) {
				const t = e.charCodeAt(0);
				("utf8" === n && t < 128 || "latin1" === n) && (e = t)
			}
		} else "number" == typeof e ? e &= 255 : "boolean" == typeof e && (e = Number(e));
		if (t < 0 || this.length < t || this.length < r) throw new RangeError("Out of range index");
		if (r <= t) return this;
		let o;
		if (t >>>= 0, r = void 0 === r ? this.length : r >>> 0, e || (e = 0), "number" == typeof e)
			for (o = t; o < r; ++o) this[o] = e;
		else {
			const i = s.isBuffer(e) ? e : s.from(e, n),
				a = i.length;
			if (0 === a) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
			for (o = 0; o < r - t; ++o) this[o + t] = i[o % a]
		}
		return this
	};
	const N = {};

	function j(e, t, r) {
		N[e] = class extends r {
			constructor() {
				super(), Object.defineProperty(this, "message", {
					value: t.apply(this, arguments),
					writable: !0,
					configurable: !0
				}), this.name = `${this.name} [${e}]`, this.stack, delete this.name
			}
			get code() {
				return e
			}
			set code(e) {
				Object.defineProperty(this, "code", {
					configurable: !0,
					enumerable: !0,
					value: e,
					writable: !0
				})
			}
			toString() {
				return `${this.name} [${e}]: ${this.message}`
			}
		}
	}

	function P(e) {
		let t = "",
			r = e.length;
		const n = "-" === e[0] ? 1 : 0;
		for (; r >= n + 4; r -= 3) t = `_${e.slice(r-3,r)}${t}`;
		return `${e.slice(0,r)}${t}`
	}

	function F(e, t, r, n, o, i) {
		if (e > r || e < t) {
			const n = "bigint" == typeof t ? "n" : "";
			let o;
			throw o = i > 3 ? 0 === t || t === BigInt(0) ? `>= 0${n} and < 2${n} ** ${8*(i+1)}${n}` : `>= -(2${n} ** ${8*(i+1)-1}${n}) and < 2 ** ${8*(i+1)-1}${n}` : `>= ${t}${n} and <= ${r}${n}`, new N.ERR_OUT_OF_RANGE("value", o, e)
		}! function(e, t, r) {
			M(t, "offset"), void 0 !== e[t] && void 0 !== e[t + r] || z(t, e.length - (r + 1))
		}(n, o, i)
	}

	function M(e, t) {
		if ("number" != typeof e) throw new N.ERR_INVALID_ARG_TYPE(t, "number", e)
	}

	function z(e, t, r) {
		if (Math.floor(e) !== e) throw M(e, r), new N.ERR_OUT_OF_RANGE(r || "offset", "an integer", e);
		if (t < 0) throw new N.ERR_BUFFER_OUT_OF_BOUNDS;
		throw new N.ERR_OUT_OF_RANGE(r || "offset", `>= ${r?1:0} and <= ${t}`, e)
	}
	j("ERR_BUFFER_OUT_OF_BOUNDS", (function(e) {
		return e ? `${e} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds"
	}), RangeError), j("ERR_INVALID_ARG_TYPE", (function(e, t) {
		return `The "${e}" argument must be of type number. Received type ${typeof t}`
	}), TypeError), j("ERR_OUT_OF_RANGE", (function(e, t, r) {
		let n = `The value of "${e}" is out of range.`,
			o = r;
		return Number.isInteger(r) && Math.abs(r) > 2 ** 32 ? o = P(String(r)) : "bigint" == typeof r && (o = String(r), (r > BigInt(2) ** BigInt(32) || r < -(BigInt(2) ** BigInt(32))) && (o = P(o)), o += "n"), n += ` It must be ${t}. Received ${o}`, n
	}), RangeError);
	const V = /[^+/0-9A-Za-z-_]/g;

	function W(e, t) {
		let r;
		t = t || 1 / 0;
		const n = e.length;
		let o = null;
		const i = [];
		for (let s = 0; s < n; ++s) {
			if (r = e.charCodeAt(s), r > 55295 && r < 57344) {
				if (!o) {
					if (r > 56319) {
						(t -= 3) > -1 && i.push(239, 191, 189);
						continue
					}
					if (s + 1 === n) {
						(t -= 3) > -1 && i.push(239, 191, 189);
						continue
					}
					o = r;
					continue
				}
				if (r < 56320) {
					(t -= 3) > -1 && i.push(239, 191, 189), o = r;
					continue
				}
				r = 65536 + (o - 55296 << 10 | r - 56320)
			} else o && (t -= 3) > -1 && i.push(239, 191, 189);
			if (o = null, r < 128) {
				if ((t -= 1) < 0) break;
				i.push(r)
			} else if (r < 2048) {
				if ((t -= 2) < 0) break;
				i.push(r >> 6 | 192, 63 & r | 128)
			} else if (r < 65536) {
				if ((t -= 3) < 0) break;
				i.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
			} else {
				if (!(r < 1114112)) throw new Error("Invalid code point");
				if ((t -= 4) < 0) break;
				i.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
			}
		}
		return i
	}

	function H(e) {
		return t.toByteArray(function(e) {
			if ((e = (e = e.split("=")[0]).trim().replace(V, "")).length < 2) return "";
			for (; e.length % 4 != 0;) e += "=";
			return e
		}(e))
	}

	function G(e, t, r, n) {
		let o;
		for (o = 0; o < n && !(o + r >= t.length || o >= e.length); ++o) t[o + r] = e[o];
		return o
	}

	function Y(e, t) {
		return e instanceof t || null != e && null != e.constructor && null != e.constructor.name && e.constructor.name === t.name
	}

	function q(e) {
		return e != e
	}
	const K = function() {
		const e = "0123456789abcdef",
			t = new Array(256);
		for (let r = 0; r < 16; ++r) {
			const n = 16 * r;
			for (let o = 0; o < 16; ++o) t[n + o] = e[r] + e[o]
		}
		return t
	}();

	function J(e) {
		return "undefined" == typeof BigInt ? X : e
	}

	function X() {
		throw new Error("BigInt not supported")
	}
}(buffer);
const {
	Buffer: Buffer
} = buffer, symbol = Symbol.for("BufferList");

function BufferList(e) {
	if (!(this instanceof BufferList)) return new BufferList(e);
	BufferList._init.call(this, e)
}
BufferList._init = function(e) {
		Object.defineProperty(this, symbol, {
			value: !0
		}), this._bufs = [], this.length = 0, e && this.append(e)
	}, BufferList.prototype._new = function(e) {
		return new BufferList(e)
	}, BufferList.prototype._offset = function(e) {
		if (0 === e) return [0, 0];
		let t = 0;
		for (let r = 0; r < this._bufs.length; r++) {
			const n = t + this._bufs[r].length;
			if (e < n || r === this._bufs.length - 1) return [r, e - t];
			t = n
		}
	}, BufferList.prototype._reverseOffset = function(e) {
		const t = e[0];
		let r = e[1];
		for (let e = 0; e < t; e++) r += this._bufs[e].length;
		return r
	}, BufferList.prototype.get = function(e) {
		if (e > this.length || e < 0) return;
		const t = this._offset(e);
		return this._bufs[t[0]][t[1]]
	}, BufferList.prototype.slice = function(e, t) {
		return "number" == typeof e && e < 0 && (e += this.length), "number" == typeof t && t < 0 && (t += this.length), this.copy(null, 0, e, t)
	}, BufferList.prototype.copy = function(e, t, r, n) {
		if (("number" != typeof r || r < 0) && (r = 0), ("number" != typeof n || n > this.length) && (n = this.length), r >= this.length) return e || Buffer.alloc(0);
		if (n <= 0) return e || Buffer.alloc(0);
		const o = !!e,
			i = this._offset(r),
			s = n - r;
		let a = s,
			c = o && t || 0,
			u = i[1];
		if (0 === r && n === this.length) {
			if (!o) return 1 === this._bufs.length ? this._bufs[0] : Buffer.concat(this._bufs, this.length);
			for (let t = 0; t < this._bufs.length; t++) this._bufs[t].copy(e, c), c += this._bufs[t].length;
			return e
		}
		if (a <= this._bufs[i[0]].length - u) return o ? this._bufs[i[0]].copy(e, t, u, u + a) : this._bufs[i[0]].slice(u, u + a);
		o || (e = Buffer.allocUnsafe(s));
		for (let t = i[0]; t < this._bufs.length; t++) {
			const r = this._bufs[t].length - u;
			if (!(a > r)) {
				this._bufs[t].copy(e, c, u, u + a), c += r;
				break
			}
			this._bufs[t].copy(e, c, u), c += r, a -= r, u && (u = 0)
		}
		return e.length > c ? e.slice(0, c) : e
	}, BufferList.prototype.shallowSlice = function(e, t) {
		if (e = e || 0, t = "number" != typeof t ? this.length : t, e < 0 && (e += this.length), t < 0 && (t += this.length), e === t) return this._new();
		const r = this._offset(e),
			n = this._offset(t),
			o = this._bufs.slice(r[0], n[0] + 1);
		return 0 === n[1] ? o.pop() : o[o.length - 1] = o[o.length - 1].slice(0, n[1]), 0 !== r[1] && (o[0] = o[0].slice(r[1])), this._new(o)
	}, BufferList.prototype.toString = function(e, t, r) {
		return this.slice(t, r).toString(e)
	}, BufferList.prototype.consume = function(e) {
		if (e = Math.trunc(e), Number.isNaN(e) || e <= 0) return this;
		for (; this._bufs.length;) {
			if (!(e >= this._bufs[0].length)) {
				this._bufs[0] = this._bufs[0].slice(e), this.length -= e;
				break
			}
			e -= this._bufs[0].length, this.length -= this._bufs[0].length, this._bufs.shift()
		}
		return this
	}, BufferList.prototype.duplicate = function() {
		const e = this._new();
		for (let t = 0; t < this._bufs.length; t++) e.append(this._bufs[t]);
		return e
	}, BufferList.prototype.append = function(e) {
		if (null == e) return this;
		if (e.buffer) this._appendBuffer(Buffer.from(e.buffer, e.byteOffset, e.byteLength));
		else if (Array.isArray(e))
			for (let t = 0; t < e.length; t++) this.append(e[t]);
		else if (this._isBufferList(e))
			for (let t = 0; t < e._bufs.length; t++) this.append(e._bufs[t]);
		else "number" == typeof e && (e = e.toString()), this._appendBuffer(Buffer.from(e));
		return this
	}, BufferList.prototype._appendBuffer = function(e) {
		this._bufs.push(e), this.length += e.length
	}, BufferList.prototype.indexOf = function(e, t, r) {
		if (void 0 === r && "string" == typeof t && (r = t, t = void 0), "function" == typeof e || Array.isArray(e)) throw new TypeError('The "value" argument must be one of type string, Buffer, BufferList, or Uint8Array.');
		if ("number" == typeof e ? e = Buffer.from([e]) : "string" == typeof e ? e = Buffer.from(e, r) : this._isBufferList(e) ? e = e.slice() : Array.isArray(e.buffer) ? e = Buffer.from(e.buffer, e.byteOffset, e.byteLength) : Buffer.isBuffer(e) || (e = Buffer.from(e)), t = Number(t || 0), isNaN(t) && (t = 0), t < 0 && (t = this.length + t), t < 0 && (t = 0), 0 === e.length) return t > this.length ? this.length : t;
		const n = this._offset(t);
		let o = n[0],
			i = n[1];
		for (; o < this._bufs.length; o++) {
			const t = this._bufs[o];
			for (; i < t.length;) {
				if (t.length - i >= e.length) {
					const r = t.indexOf(e, i);
					if (-1 !== r) return this._reverseOffset([o, r]);
					i = t.length - e.length + 1
				} else {
					const t = this._reverseOffset([o, i]);
					if (this._match(t, e)) return t;
					i++
				}
			}
			i = 0
		}
		return -1
	}, BufferList.prototype._match = function(e, t) {
		if (this.length - e < t.length) return !1;
		for (let r = 0; r < t.length; r++)
			if (this.get(e + r) !== t[r]) return !1;
		return !0
	},
	function() {
		const e = {
			readDoubleBE: 8,
			readDoubleLE: 8,
			readFloatBE: 4,
			readFloatLE: 4,
			readInt32BE: 4,
			readInt32LE: 4,
			readUInt32BE: 4,
			readUInt32LE: 4,
			readInt16BE: 2,
			readInt16LE: 2,
			readUInt16BE: 2,
			readUInt16LE: 2,
			readInt8: 1,
			readUInt8: 1,
			readIntBE: null,
			readIntLE: null,
			readUIntBE: null,
			readUIntLE: null
		};
		for (const t in e) ! function(t) {
			BufferList.prototype[t] = null === e[t] ? function(e, r) {
				return this.slice(e, e + r)[t](0, r)
			} : function(r = 0) {
				return this.slice(r, r + e[t])[t](0)
			}
		}(t)
	}(), BufferList.prototype._isBufferList = function(e) {
		return e instanceof BufferList || BufferList.isBufferList(e)
	}, BufferList.isBufferList = function(e) {
		return null != e && e[symbol]
	};
var BufferList_1 = BufferList;
class Rabin$1 {
	constructor(e, t = 12, r = 8192, n = 32768, o = 64, i) {
		this.bits = t, this.min = r, this.max = n, this.asModule = e, this.rabin = new e.Rabin(t, r, n, o, i), this.polynomial = i
	}
	fingerprint(e) {
		const {
			__retain: t,
			__release: r,
			__allocArray: n,
			__getInt32Array: o,
			Int32Array_ID: i,
			Uint8Array_ID: s
		} = this.asModule, a = t(n(i, new Int32Array(Math.ceil(e.length / this.min)))), c = t(n(s, e)), u = o(this.rabin.fingerprint(c, a));
		r(c), r(a);
		const f = u.indexOf(0);
		return f >= 0 ? u.subarray(0, f) : u
	}
}
var rabin$1 = Rabin$1,
	loader = {};
const ID_OFFSET = -8,
	SIZE_OFFSET = -4,
	ARRAYBUFFER_ID = 0,
	STRING_ID = 1,
	ARRAYBUFFERVIEW = 1,
	ARRAY = 2,
	VAL_ALIGN_OFFSET = 5,
	VAL_SIGNED = 1024,
	VAL_FLOAT = 2048,
	VAL_MANAGED = 8192,
	ARRAYBUFFERVIEW_BUFFER_OFFSET = 0,
	ARRAYBUFFERVIEW_DATASTART_OFFSET = 4,
	ARRAYBUFFERVIEW_DATALENGTH_OFFSET = 8,
	ARRAYBUFFERVIEW_SIZE = 12,
	ARRAY_LENGTH_OFFSET = 12,
	ARRAY_SIZE = 16,
	BIGINT = "undefined" != typeof BigUint64Array,
	THIS = Symbol(),
	CHUNKSIZE = 1024;

function getStringImpl(e, t) {
	const r = new Uint32Array(e),
		n = new Uint16Array(e);
	var o = r[t + SIZE_OFFSET >>> 2] >>> 1,
		i = t >>> 1;
	if (o <= CHUNKSIZE) return String.fromCharCode.apply(String, n.subarray(i, i + o));
	const s = [];
	do {
		const e = n[i + CHUNKSIZE - 1],
			t = e >= 55296 && e < 56320 ? CHUNKSIZE - 1 : CHUNKSIZE;
		s.push(String.fromCharCode.apply(String, n.subarray(i, i += t))), o -= t
	} while (o > CHUNKSIZE);
	return s.join("") + String.fromCharCode.apply(String, n.subarray(i, i + o))
}

function preInstantiate(e) {
	const t = {};

	function r(e, t) {
		return e ? getStringImpl(e.buffer, t) : "<yet unknown>"
	}
	const n = e.env = e.env || {};
	return n.abort = n.abort || function(e, o, i, s) {
		const a = t.memory || n.memory;
		throw Error("abort: " + r(a, e) + " at " + r(a, o) + ":" + i + ":" + s)
	}, n.trace = n.trace || function(e, o) {
		const i = t.memory || n.memory;
		console.log("trace: " + r(i, e) + (o ? " " : "") + Array.prototype.slice.call(arguments, 2, 2 + o).join(", "))
	}, e.Math = e.Math || Math, e.Date = e.Date || Date, t
}

function postInstantiate(e, t) {
	const r = t.exports,
		n = r.memory,
		o = r.table,
		i = r.__alloc,
		s = r.__retain,
		a = r.__rtti_base || -1;

	function c(e) {
		const t = new Uint32Array(n.buffer);
		if ((e >>>= 0) >= t[a >>> 2]) throw Error("invalid id: " + e);
		return t[(a + 4 >>> 2) + 2 * e]
	}

	function u(e) {
		const t = new Uint32Array(n.buffer);
		if ((e >>>= 0) >= t[a >>> 2]) throw Error("invalid id: " + e);
		return t[(a + 4 >>> 2) + 2 * e + 1]
	}

	function f(e) {
		return 31 - Math.clz32(e >>> VAL_ALIGN_OFFSET & 31)
	}

	function l(e, t, r) {
		const o = n.buffer;
		if (r) switch (e) {
			case 2:
				return new Float32Array(o);
			case 3:
				return new Float64Array(o)
		} else switch (e) {
			case 0:
				return new(t ? Int8Array : Uint8Array)(o);
			case 1:
				return new(t ? Int16Array : Uint16Array)(o);
			case 2:
				return new(t ? Int32Array : Uint32Array)(o);
			case 3:
				return new(t ? BigInt64Array : BigUint64Array)(o)
		}
		throw Error("unsupported align: " + e)
	}

	function h(e) {
		const t = new Uint32Array(n.buffer),
			r = t[e + ID_OFFSET >>> 2],
			o = c(r);
		if (!(o & ARRAYBUFFERVIEW)) throw Error("not an array: " + r);
		const i = f(o);
		var s = t[e + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];
		const a = o & ARRAY ? t[e + ARRAY_LENGTH_OFFSET >>> 2] : t[s + SIZE_OFFSET >>> 2] >>> i;
		return l(i, o & VAL_SIGNED, o & VAL_FLOAT).subarray(s >>>= i, s + a)
	}

	function d(e, t, r) {
		return new e(p(e, t, r))
	}

	function p(e, t, r) {
		const o = n.buffer,
			i = new Uint32Array(o),
			s = i[r + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];
		return new e(o, s, i[s + SIZE_OFFSET >>> 2] >>> t)
	}
	return e.__allocString = function(e) {
		const t = e.length,
			r = i(t << 1, STRING_ID),
			o = new Uint16Array(n.buffer);
		for (var s = 0, a = r >>> 1; s < t; ++s) o[a + s] = e.charCodeAt(s);
		return r
	}, e.__getString = function(e) {
		const t = n.buffer;
		if (new Uint32Array(t)[e + ID_OFFSET >>> 2] !== STRING_ID) throw Error("not a string: " + e);
		return getStringImpl(t, e)
	}, e.__allocArray = function(e, t) {
		const r = c(e);
		if (!(r & (ARRAYBUFFERVIEW | ARRAY))) throw Error("not an array: " + e + " @ " + r);
		const o = f(r),
			a = t.length,
			u = i(a << o, ARRAYBUFFER_ID),
			h = i(r & ARRAY ? ARRAY_SIZE : ARRAYBUFFERVIEW_SIZE, e),
			d = new Uint32Array(n.buffer);
		d[h + ARRAYBUFFERVIEW_BUFFER_OFFSET >>> 2] = s(u), d[h + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2] = u, d[h + ARRAYBUFFERVIEW_DATALENGTH_OFFSET >>> 2] = a << o, r & ARRAY && (d[h + ARRAY_LENGTH_OFFSET >>> 2] = a);
		const p = l(o, r & VAL_SIGNED, r & VAL_FLOAT);
		if (r & VAL_MANAGED)
			for (let e = 0; e < a; ++e) p[(u >>> o) + e] = s(t[e]);
		else p.set(t, u >>> o);
		return h
	}, e.__getArrayView = h, e.__getArray = function(e) {
		const t = h(e),
			r = t.length,
			n = new Array(r);
		for (let e = 0; e < r; e++) n[e] = t[e];
		return n
	}, e.__getArrayBuffer = function(e) {
		const t = n.buffer,
			r = new Uint32Array(t)[e + SIZE_OFFSET >>> 2];
		return t.slice(e, e + r)
	}, e.__getInt8Array = d.bind(null, Int8Array, 0), e.__getInt8ArrayView = p.bind(null, Int8Array, 0), e.__getUint8Array = d.bind(null, Uint8Array, 0), e.__getUint8ArrayView = p.bind(null, Uint8Array, 0), e.__getUint8ClampedArray = d.bind(null, Uint8ClampedArray, 0), e.__getUint8ClampedArrayView = p.bind(null, Uint8ClampedArray, 0), e.__getInt16Array = d.bind(null, Int16Array, 1), e.__getInt16ArrayView = p.bind(null, Int16Array, 1), e.__getUint16Array = d.bind(null, Uint16Array, 1), e.__getUint16ArrayView = p.bind(null, Uint16Array, 1), e.__getInt32Array = d.bind(null, Int32Array, 2), e.__getInt32ArrayView = p.bind(null, Int32Array, 2), e.__getUint32Array = d.bind(null, Uint32Array, 2), e.__getUint32ArrayView = p.bind(null, Uint32Array, 2), BIGINT && (e.__getInt64Array = d.bind(null, BigInt64Array, 3), e.__getInt64ArrayView = p.bind(null, BigInt64Array, 3), e.__getUint64Array = d.bind(null, BigUint64Array, 3), e.__getUint64ArrayView = p.bind(null, BigUint64Array, 3)), e.__getFloat32Array = d.bind(null, Float32Array, 2), e.__getFloat32ArrayView = p.bind(null, Float32Array, 2), e.__getFloat64Array = d.bind(null, Float64Array, 3), e.__getFloat64ArrayView = p.bind(null, Float64Array, 3), e.__instanceof = function(e, t) {
		const r = new Uint32Array(n.buffer);
		var o = r[e + ID_OFFSET >>> 2];
		if (o <= r[a >>> 2])
			do {
				if (o == t) return !0
			} while (o = u(o));
		return !1
	}, e.memory = e.memory || n, e.table = e.table || o, demangle(r, e)
}

function isResponse(e) {
	return "undefined" != typeof Response && e instanceof Response
}
async function instantiate$1(e, t) {
	return isResponse(e = await e) ? instantiateStreaming(e, t) : postInstantiate(preInstantiate(t || (t = {})), await WebAssembly.instantiate(e instanceof WebAssembly.Module ? e : await WebAssembly.compile(e), t))
}

function instantiateSync(e, t) {
	return postInstantiate(preInstantiate(t || (t = {})), new WebAssembly.Instance(e instanceof WebAssembly.Module ? e : new WebAssembly.Module(e), t))
}
async function instantiateStreaming(e, t) {
	return WebAssembly.instantiateStreaming ? postInstantiate(preInstantiate(t || (t = {})), (await WebAssembly.instantiateStreaming(e, t)).instance) : instantiate$1(isResponse(e = await e) ? e.arrayBuffer() : e, t)
}

function demangle(e, t) {
	var r = t ? Object.create(t) : {},
		n = e.__argumentsLength ? function(t) {
			e.__argumentsLength.value = t
		} : e.__setArgumentsLength || e.__setargc || function() {};
	for (let t in e) {
		if (!Object.prototype.hasOwnProperty.call(e, t)) continue;
		const o = e[t];
		let i = t.split("."),
			s = r;
		for (; i.length > 1;) {
			let e = i.shift();
			Object.prototype.hasOwnProperty.call(s, e) || (s[e] = {}), s = s[e]
		}
		let a = i[0],
			c = a.indexOf("#");
		if (c >= 0) {
			let r = a.substring(0, c),
				i = s[r];
			if (void 0 === i || !i.prototype) {
				let e = function(...t) {
					return e.wrap(e.prototype.constructor(0, ...t))
				};
				e.prototype = {
					valueOf: function() {
						return this[THIS]
					}
				}, e.wrap = function(t) {
					return Object.create(e.prototype, {
						[THIS]: {
							value: t,
							writable: !1
						}
					})
				}, i && Object.getOwnPropertyNames(i).forEach((t => Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t)))), s[r] = e
			}
			if (a = a.substring(c + 1), s = s[r].prototype, /^(get|set):/.test(a)) {
				if (!Object.prototype.hasOwnProperty.call(s, a = a.substring(4))) {
					let r = e[t.replace("set:", "get:")],
						n = e[t.replace("get:", "set:")];
					Object.defineProperty(s, a, {
						get: function() {
							return r(this[THIS])
						},
						set: function(e) {
							n(this[THIS], e)
						},
						enumerable: !0
					})
				}
			} else "constructor" === a ? (s[a] = (...e) => (n(e.length), o(...e))).original = o : (s[a] = function(...e) {
				return n(e.length), o(this[THIS], ...e)
			}).original = o
		} else /^(get|set):/.test(a) ? Object.prototype.hasOwnProperty.call(s, a = a.substring(4)) || Object.defineProperty(s, a, {
			get: e[t.replace("set:", "get:")],
			set: e[t.replace("get:", "set:")],
			enumerable: !0
		}) : "function" == typeof o && o !== n ? (s[a] = (...e) => (n(e.length), o(...e))).original = o : s[a] = o
	}
	return r
}
loader.instantiate = instantiate$1, loader.instantiateSync = instantiateSync, loader.instantiateStreaming = instantiateStreaming, loader.demangle = demangle;
const {
	instantiate: instantiate
} = loader;

function loadWebAssembly(e = {}) {
	if (!loadWebAssembly.supported) return null;
	var t = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 78, 14, 96, 2, 127, 126, 0, 96, 1, 127, 1, 126, 96, 2, 127, 127, 0, 96, 1, 127, 1, 127, 96, 1, 127, 0, 96, 2, 127, 127, 1, 127, 96, 3, 127, 127, 127, 1, 127, 96, 0, 0, 96, 3, 127, 127, 127, 0, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 0, 96, 5, 127, 127, 127, 127, 127, 1, 127, 96, 1, 126, 1, 127, 96, 2, 126, 126, 1, 126, 2, 13, 1, 3, 101, 110, 118, 5, 97, 98, 111, 114, 116, 0, 10, 3, 54, 53, 2, 2, 8, 9, 3, 5, 2, 8, 6, 5, 3, 4, 2, 6, 9, 12, 13, 2, 5, 11, 3, 2, 3, 2, 3, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 6, 7, 7, 4, 4, 5, 3, 1, 0, 1, 6, 47, 9, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65, 3, 11, 127, 0, 65, 4, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65, 240, 2, 11, 127, 0, 65, 6, 11, 7, 240, 5, 41, 6, 109, 101, 109, 111, 114, 121, 2, 0, 7, 95, 95, 97, 108, 108, 111, 99, 0, 10, 8, 95, 95, 114, 101, 116, 97, 105, 110, 0, 11, 9, 95, 95, 114, 101, 108, 101, 97, 115, 101, 0, 12, 9, 95, 95, 99, 111, 108, 108, 101, 99, 116, 0, 51, 11, 95, 95, 114, 116, 116, 105, 95, 98, 97, 115, 101, 3, 7, 13, 73, 110, 116, 51, 50, 65, 114, 114, 97, 121, 95, 73, 68, 3, 2, 13, 85, 105, 110, 116, 56, 65, 114, 114, 97, 121, 95, 73, 68, 3, 3, 6, 100, 101, 103, 114, 101, 101, 0, 16, 3, 109, 111, 100, 0, 17, 5, 82, 97, 98, 105, 110, 3, 8, 16, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 119, 105, 110, 100, 111, 119, 0, 21, 16, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 119, 105, 110, 100, 111, 119, 0, 22, 21, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 119, 105, 110, 100, 111, 119, 95, 115, 105, 122, 101, 0, 23, 21, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 119, 105, 110, 100, 111, 119, 95, 115, 105, 122, 101, 0, 24, 14, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 119, 112, 111, 115, 0, 25, 14, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 119, 112, 111, 115, 0, 26, 15, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99, 111, 117, 110, 116, 0, 27, 15, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 99, 111, 117, 110, 116, 0, 28, 13, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 112, 111, 115, 0, 29, 13, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 112, 111, 115, 0, 30, 15, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 115, 116, 97, 114, 116, 0, 31, 15, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 115, 116, 97, 114, 116, 0, 32, 16, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 100, 105, 103, 101, 115, 116, 0, 33, 16, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 100, 105, 103, 101, 115, 116, 0, 34, 21, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99, 104, 117, 110, 107, 95, 115, 116, 97, 114, 116, 0, 35, 21, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 99, 104, 117, 110, 107, 95, 115, 116, 97, 114, 116, 0, 36, 22, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99, 104, 117, 110, 107, 95, 108, 101, 110, 103, 116, 104, 0, 37, 22, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 99, 104, 117, 110, 107, 95, 108, 101, 110, 103, 116, 104, 0, 38, 31, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99, 104, 117, 110, 107, 95, 99, 117, 116, 95, 102, 105, 110, 103, 101, 114, 112, 114, 105, 110, 116, 0, 39, 31, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 99, 104, 117, 110, 107, 95, 99, 117, 116, 95, 102, 105, 110, 103, 101, 114, 112, 114, 105, 110, 116, 0, 40, 20, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 112, 111, 108, 121, 110, 111, 109, 105, 97, 108, 0, 41, 20, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 112, 111, 108, 121, 110, 111, 109, 105, 97, 108, 0, 42, 17, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 109, 105, 110, 115, 105, 122, 101, 0, 43, 17, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 109, 105, 110, 115, 105, 122, 101, 0, 44, 17, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 109, 97, 120, 115, 105, 122, 101, 0, 45, 17, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 109, 97, 120, 115, 105, 122, 101, 0, 46, 14, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 109, 97, 115, 107, 0, 47, 14, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 109, 97, 115, 107, 0, 48, 17, 82, 97, 98, 105, 110, 35, 99, 111, 110, 115, 116, 114, 117, 99, 116, 111, 114, 0, 20, 17, 82, 97, 98, 105, 110, 35, 102, 105, 110, 103, 101, 114, 112, 114, 105, 110, 116, 0, 49, 8, 1, 50, 10, 165, 31, 53, 199, 1, 1, 4, 127, 32, 1, 40, 2, 0, 65, 124, 113, 34, 2, 65, 128, 2, 73, 4, 127, 32, 2, 65, 4, 118, 33, 4, 65, 0, 5, 32, 2, 65, 31, 32, 2, 103, 107, 34, 3, 65, 4, 107, 118, 65, 16, 115, 33, 4, 32, 3, 65, 7, 107, 11, 33, 3, 32, 1, 40, 2, 20, 33, 2, 32, 1, 40, 2, 16, 34, 5, 4, 64, 32, 5, 32, 2, 54, 2, 20, 11, 32, 2, 4, 64, 32, 2, 32, 5, 54, 2, 16, 11, 32, 1, 32, 0, 32, 4, 32, 3, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 70, 4, 64, 32, 0, 32, 4, 32, 3, 65, 4, 116, 106, 65, 2, 116, 106, 32, 2, 54, 2, 96, 32, 2, 69, 4, 64, 32, 0, 32, 3, 65, 2, 116, 106, 32, 0, 32, 3, 65, 2, 116, 106, 40, 2, 4, 65, 1, 32, 4, 116, 65, 127, 115, 113, 34, 1, 54, 2, 4, 32, 1, 69, 4, 64, 32, 0, 32, 0, 40, 2, 0, 65, 1, 32, 3, 116, 65, 127, 115, 113, 54, 2, 0, 11, 11, 11, 11, 226, 2, 1, 6, 127, 32, 1, 40, 2, 0, 33, 3, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34, 4, 40, 2, 0, 34, 5, 65, 1, 113, 4, 64, 32, 3, 65, 124, 113, 65, 16, 106, 32, 5, 65, 124, 113, 106, 34, 2, 65, 240, 255, 255, 255, 3, 73, 4, 64, 32, 0, 32, 4, 16, 1, 32, 1, 32, 2, 32, 3, 65, 3, 113, 114, 34, 3, 54, 2, 0, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34, 4, 40, 2, 0, 33, 5, 11, 11, 32, 3, 65, 2, 113, 4, 64, 32, 1, 65, 4, 107, 40, 2, 0, 34, 2, 40, 2, 0, 34, 6, 65, 124, 113, 65, 16, 106, 32, 3, 65, 124, 113, 106, 34, 7, 65, 240, 255, 255, 255, 3, 73, 4, 64, 32, 0, 32, 2, 16, 1, 32, 2, 32, 7, 32, 6, 65, 3, 113, 114, 34, 3, 54, 2, 0, 32, 2, 33, 1, 11, 11, 32, 4, 32, 5, 65, 2, 114, 54, 2, 0, 32, 4, 65, 4, 107, 32, 1, 54, 2, 0, 32, 0, 32, 3, 65, 124, 113, 34, 2, 65, 128, 2, 73, 4, 127, 32, 2, 65, 4, 118, 33, 4, 65, 0, 5, 32, 2, 65, 31, 32, 2, 103, 107, 34, 2, 65, 4, 107, 118, 65, 16, 115, 33, 4, 32, 2, 65, 7, 107, 11, 34, 3, 65, 4, 116, 32, 4, 106, 65, 2, 116, 106, 40, 2, 96, 33, 2, 32, 1, 65, 0, 54, 2, 16, 32, 1, 32, 2, 54, 2, 20, 32, 2, 4, 64, 32, 2, 32, 1, 54, 2, 16, 11, 32, 0, 32, 4, 32, 3, 65, 4, 116, 106, 65, 2, 116, 106, 32, 1, 54, 2, 96, 32, 0, 32, 0, 40, 2, 0, 65, 1, 32, 3, 116, 114, 54, 2, 0, 32, 0, 32, 3, 65, 2, 116, 106, 32, 0, 32, 3, 65, 2, 116, 106, 40, 2, 4, 65, 1, 32, 4, 116, 114, 54, 2, 4, 11, 119, 1, 1, 127, 32, 2, 2, 127, 32, 0, 40, 2, 160, 12, 34, 2, 4, 64, 32, 2, 32, 1, 65, 16, 107, 70, 4, 64, 32, 2, 40, 2, 0, 33, 3, 32, 1, 65, 16, 107, 33, 1, 11, 11, 32, 1, 11, 107, 34, 2, 65, 48, 73, 4, 64, 15, 11, 32, 1, 32, 3, 65, 2, 113, 32, 2, 65, 32, 107, 65, 1, 114, 114, 54, 2, 0, 32, 1, 65, 0, 54, 2, 16, 32, 1, 65, 0, 54, 2, 20, 32, 1, 32, 2, 106, 65, 16, 107, 34, 2, 65, 2, 54, 2, 0, 32, 0, 32, 2, 54, 2, 160, 12, 32, 0, 32, 1, 16, 2, 11, 155, 1, 1, 3, 127, 35, 0, 34, 0, 69, 4, 64, 65, 1, 63, 0, 34, 0, 74, 4, 127, 65, 1, 32, 0, 107, 64, 0, 65, 0, 72, 5, 65, 0, 11, 4, 64, 0, 11, 65, 176, 3, 34, 0, 65, 0, 54, 2, 0, 65, 208, 15, 65, 0, 54, 2, 0, 3, 64, 32, 1, 65, 23, 73, 4, 64, 32, 1, 65, 2, 116, 65, 176, 3, 106, 65, 0, 54, 2, 4, 65, 0, 33, 2, 3, 64, 32, 2, 65, 16, 73, 4, 64, 32, 1, 65, 4, 116, 32, 2, 106, 65, 2, 116, 65, 176, 3, 106, 65, 0, 54, 2, 96, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 65, 176, 3, 65, 224, 15, 63, 0, 65, 16, 116, 16, 3, 65, 176, 3, 36, 0, 11, 32, 0, 11, 45, 0, 32, 0, 65, 240, 255, 255, 255, 3, 79, 4, 64, 65, 32, 65, 224, 0, 65, 201, 3, 65, 29, 16, 0, 0, 11, 32, 0, 65, 15, 106, 65, 112, 113, 34, 0, 65, 16, 32, 0, 65, 16, 75, 27, 11, 169, 1, 1, 1, 127, 32, 0, 32, 1, 65, 128, 2, 73, 4, 127, 32, 1, 65, 4, 118, 33, 1, 65, 0, 5, 32, 1, 65, 248, 255, 255, 255, 1, 73, 4, 64, 32, 1, 65, 1, 65, 27, 32, 1, 103, 107, 116, 106, 65, 1, 107, 33, 1, 11, 32, 1, 65, 31, 32, 1, 103, 107, 34, 2, 65, 4, 107, 118, 65, 16, 115, 33, 1, 32, 2, 65, 7, 107, 11, 34, 2, 65, 2, 116, 106, 40, 2, 4, 65, 127, 32, 1, 116, 113, 34, 1, 4, 127, 32, 0, 32, 1, 104, 32, 2, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 32, 0, 40, 2, 0, 65, 127, 32, 2, 65, 1, 106, 116, 113, 34, 1, 4, 127, 32, 0, 32, 0, 32, 1, 104, 34, 0, 65, 2, 116, 106, 40, 2, 4, 104, 32, 0, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 65, 0, 11, 11, 11, 111, 1, 1, 127, 63, 0, 34, 2, 32, 1, 65, 248, 255, 255, 255, 1, 73, 4, 127, 32, 1, 65, 1, 65, 27, 32, 1, 103, 107, 116, 65, 1, 107, 106, 5, 32, 1, 11, 65, 16, 32, 0, 40, 2, 160, 12, 32, 2, 65, 16, 116, 65, 16, 107, 71, 116, 106, 65, 255, 255, 3, 106, 65, 128, 128, 124, 113, 65, 16, 118, 34, 1, 32, 2, 32, 1, 74, 27, 64, 0, 65, 0, 72, 4, 64, 32, 1, 64, 0, 65, 0, 72, 4, 64, 0, 11, 11, 32, 0, 32, 2, 65, 16, 116, 63, 0, 65, 16, 116, 16, 3, 11, 113, 1, 2, 127, 32, 1, 40, 2, 0, 34, 3, 65, 124, 113, 32, 2, 107, 34, 4, 65, 32, 79, 4, 64, 32, 1, 32, 2, 32, 3, 65, 2, 113, 114, 54, 2, 0, 32, 2, 32, 1, 65, 16, 106, 106, 34, 1, 32, 4, 65, 16, 107, 65, 1, 114, 54, 2, 0, 32, 0, 32, 1, 16, 2, 5, 32, 1, 32, 3, 65, 126, 113, 54, 2, 0, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 40, 2, 0, 65, 125, 113, 54, 2, 0, 11, 11, 91, 1, 2, 127, 32, 0, 32, 1, 16, 5, 34, 4, 16, 6, 34, 3, 69, 4, 64, 65, 1, 36, 1, 65, 0, 36, 1, 32, 0, 32, 4, 16, 6, 34, 3, 69, 4, 64, 32, 0, 32, 4, 16, 7, 32, 0, 32, 4, 16, 6, 33, 3, 11, 11, 32, 3, 65, 0, 54, 2, 4, 32, 3, 32, 2, 54, 2, 8, 32, 3, 32, 1, 54, 2, 12, 32, 0, 32, 3, 16, 1, 32, 0, 32, 3, 32, 4, 16, 8, 32, 3, 11, 13, 0, 16, 4, 32, 0, 32, 1, 16, 9, 65, 16, 106, 11, 33, 1, 1, 127, 32, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 0, 11, 18, 0, 32, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 16, 52, 11, 11, 140, 3, 1, 1, 127, 2, 64, 32, 1, 69, 13, 0, 32, 0, 65, 0, 58, 0, 0, 32, 0, 32, 1, 106, 65, 1, 107, 65, 0, 58, 0, 0, 32, 1, 65, 2, 77, 13, 0, 32, 0, 65, 1, 106, 65, 0, 58, 0, 0, 32, 0, 65, 2, 106, 65, 0, 58, 0, 0, 32, 0, 32, 1, 106, 34, 2, 65, 2, 107, 65, 0, 58, 0, 0, 32, 2, 65, 3, 107, 65, 0, 58, 0, 0, 32, 1, 65, 6, 77, 13, 0, 32, 0, 65, 3, 106, 65, 0, 58, 0, 0, 32, 0, 32, 1, 106, 65, 4, 107, 65, 0, 58, 0, 0, 32, 1, 65, 8, 77, 13, 0, 32, 1, 65, 0, 32, 0, 107, 65, 3, 113, 34, 1, 107, 33, 2, 32, 0, 32, 1, 106, 34, 0, 65, 0, 54, 2, 0, 32, 0, 32, 2, 65, 124, 113, 34, 1, 106, 65, 4, 107, 65, 0, 54, 2, 0, 32, 1, 65, 8, 77, 13, 0, 32, 0, 65, 4, 106, 65, 0, 54, 2, 0, 32, 0, 65, 8, 106, 65, 0, 54, 2, 0, 32, 0, 32, 1, 106, 34, 2, 65, 12, 107, 65, 0, 54, 2, 0, 32, 2, 65, 8, 107, 65, 0, 54, 2, 0, 32, 1, 65, 24, 77, 13, 0, 32, 0, 65, 12, 106, 65, 0, 54, 2, 0, 32, 0, 65, 16, 106, 65, 0, 54, 2, 0, 32, 0, 65, 20, 106, 65, 0, 54, 2, 0, 32, 0, 65, 24, 106, 65, 0, 54, 2, 0, 32, 0, 32, 1, 106, 34, 2, 65, 28, 107, 65, 0, 54, 2, 0, 32, 2, 65, 24, 107, 65, 0, 54, 2, 0, 32, 2, 65, 20, 107, 65, 0, 54, 2, 0, 32, 2, 65, 16, 107, 65, 0, 54, 2, 0, 32, 0, 32, 0, 65, 4, 113, 65, 24, 106, 34, 2, 106, 33, 0, 32, 1, 32, 2, 107, 33, 1, 3, 64, 32, 1, 65, 32, 79, 4, 64, 32, 0, 66, 0, 55, 3, 0, 32, 0, 65, 8, 106, 66, 0, 55, 3, 0, 32, 0, 65, 16, 106, 66, 0, 55, 3, 0, 32, 0, 65, 24, 106, 66, 0, 55, 3, 0, 32, 1, 65, 32, 107, 33, 1, 32, 0, 65, 32, 106, 33, 0, 12, 1, 11, 11, 11, 11, 178, 1, 1, 3, 127, 32, 1, 65, 240, 255, 255, 255, 3, 32, 2, 118, 75, 4, 64, 65, 144, 1, 65, 192, 1, 65, 23, 65, 56, 16, 0, 0, 11, 32, 1, 32, 2, 116, 34, 3, 65, 0, 16, 10, 34, 2, 32, 3, 16, 13, 32, 0, 69, 4, 64, 65, 12, 65, 2, 16, 10, 34, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 11, 32, 0, 65, 0, 54, 2, 0, 32, 0, 65, 0, 54, 2, 4, 32, 0, 65, 0, 54, 2, 8, 32, 2, 34, 1, 32, 0, 40, 2, 0, 34, 4, 71, 4, 64, 32, 1, 65, 172, 3, 75, 4, 64, 32, 1, 65, 16, 107, 34, 5, 32, 5, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 4, 16, 12, 11, 32, 0, 32, 1, 54, 2, 0, 32, 0, 32, 2, 54, 2, 4, 32, 0, 32, 3, 54, 2, 8, 32, 0, 11, 46, 1, 2, 127, 65, 12, 65, 5, 16, 10, 34, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 0, 65, 128, 2, 65, 3, 16, 14, 11, 9, 0, 65, 63, 32, 0, 121, 167, 107, 11, 49, 1, 2, 127, 65, 63, 32, 1, 121, 167, 107, 33, 2, 3, 64, 65, 63, 32, 0, 121, 167, 107, 32, 2, 107, 34, 3, 65, 0, 78, 4, 64, 32, 0, 32, 1, 32, 3, 172, 134, 133, 33, 0, 12, 1, 11, 11, 32, 0, 11, 40, 0, 32, 1, 32, 0, 40, 2, 8, 79, 4, 64, 65, 128, 2, 65, 192, 2, 65, 163, 1, 65, 44, 16, 0, 0, 11, 32, 1, 32, 0, 40, 2, 4, 106, 65, 0, 58, 0, 0, 11, 38, 0, 32, 1, 32, 0, 40, 2, 8, 79, 4, 64, 65, 128, 2, 65, 192, 2, 65, 152, 1, 65, 44, 16, 0, 0, 11, 32, 1, 32, 0, 40, 2, 4, 106, 45, 0, 0, 11, 254, 5, 2, 1, 127, 4, 126, 32, 0, 69, 4, 64, 65, 232, 0, 65, 6, 16, 10, 34, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34, 5, 32, 5, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 11, 32, 0, 65, 0, 54, 2, 0, 32, 0, 65, 0, 54, 2, 4, 32, 0, 65, 0, 54, 2, 8, 32, 0, 66, 0, 55, 3, 16, 32, 0, 66, 0, 55, 3, 24, 32, 0, 66, 0, 55, 3, 32, 32, 0, 66, 0, 55, 3, 40, 32, 0, 66, 0, 55, 3, 48, 32, 0, 66, 0, 55, 3, 56, 32, 0, 66, 0, 55, 3, 64, 32, 0, 66, 0, 55, 3, 72, 32, 0, 66, 0, 55, 3, 80, 32, 0, 66, 0, 55, 3, 88, 32, 0, 66, 0, 55, 3, 96, 32, 0, 32, 2, 173, 55, 3, 80, 32, 0, 32, 3, 173, 55, 3, 88, 65, 12, 65, 4, 16, 10, 34, 2, 65, 172, 3, 75, 4, 64, 32, 2, 65, 16, 107, 34, 3, 32, 3, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 2, 32, 4, 65, 0, 16, 14, 33, 2, 32, 0, 40, 2, 0, 16, 12, 32, 0, 32, 2, 54, 2, 0, 32, 0, 32, 4, 54, 2, 4, 32, 0, 66, 1, 32, 1, 173, 134, 66, 1, 125, 55, 3, 96, 32, 0, 66, 243, 130, 183, 218, 216, 230, 232, 30, 55, 3, 72, 35, 4, 69, 4, 64, 65, 0, 33, 2, 3, 64, 32, 2, 65, 128, 2, 72, 4, 64, 32, 2, 65, 255, 1, 113, 173, 33, 6, 32, 0, 41, 3, 72, 34, 7, 33, 8, 65, 63, 32, 7, 121, 167, 107, 33, 1, 3, 64, 65, 63, 32, 6, 121, 167, 107, 32, 1, 107, 34, 3, 65, 0, 78, 4, 64, 32, 6, 32, 8, 32, 3, 172, 134, 133, 33, 6, 12, 1, 11, 11, 65, 0, 33, 4, 3, 64, 32, 4, 32, 0, 40, 2, 4, 65, 1, 107, 72, 4, 64, 32, 6, 66, 8, 134, 33, 6, 32, 0, 41, 3, 72, 34, 7, 33, 8, 65, 63, 32, 7, 121, 167, 107, 33, 1, 3, 64, 65, 63, 32, 6, 121, 167, 107, 32, 1, 107, 34, 3, 65, 0, 78, 4, 64, 32, 6, 32, 8, 32, 3, 172, 134, 133, 33, 6, 12, 1, 11, 11, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 35, 6, 40, 2, 4, 32, 2, 65, 3, 116, 106, 32, 6, 55, 3, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 65, 63, 32, 0, 41, 3, 72, 121, 167, 107, 172, 33, 7, 65, 0, 33, 2, 3, 64, 32, 2, 65, 128, 2, 72, 4, 64, 35, 5, 33, 1, 32, 2, 172, 32, 7, 134, 34, 8, 33, 6, 65, 63, 32, 0, 41, 3, 72, 34, 9, 121, 167, 107, 33, 3, 3, 64, 65, 63, 32, 6, 121, 167, 107, 32, 3, 107, 34, 4, 65, 0, 78, 4, 64, 32, 6, 32, 9, 32, 4, 172, 134, 133, 33, 6, 12, 1, 11, 11, 32, 1, 40, 2, 4, 32, 2, 65, 3, 116, 106, 32, 6, 32, 8, 132, 55, 3, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 65, 1, 36, 4, 11, 32, 0, 66, 0, 55, 3, 24, 32, 0, 66, 0, 55, 3, 32, 65, 0, 33, 2, 3, 64, 32, 2, 32, 0, 40, 2, 4, 72, 4, 64, 32, 0, 40, 2, 0, 32, 2, 16, 18, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 0, 66, 0, 55, 3, 40, 32, 0, 65, 0, 54, 2, 8, 32, 0, 66, 0, 55, 3, 16, 32, 0, 66, 0, 55, 3, 40, 32, 0, 40, 2, 0, 32, 0, 40, 2, 8, 16, 19, 33, 1, 32, 0, 40, 2, 8, 32, 0, 40, 2, 0, 40, 2, 4, 106, 65, 1, 58, 0, 0, 32, 0, 32, 0, 41, 3, 40, 35, 6, 40, 2, 4, 32, 1, 65, 3, 116, 106, 41, 3, 0, 133, 55, 3, 40, 32, 0, 32, 0, 40, 2, 8, 65, 1, 106, 32, 0, 40, 2, 4, 111, 54, 2, 8, 32, 0, 35, 5, 40, 2, 4, 32, 0, 41, 3, 40, 34, 6, 66, 45, 136, 167, 65, 3, 116, 106, 41, 3, 0, 32, 6, 66, 8, 134, 66, 1, 132, 133, 55, 3, 40, 32, 0, 11, 38, 1, 1, 127, 32, 0, 40, 2, 0, 34, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 0, 11, 55, 1, 2, 127, 32, 1, 32, 0, 40, 2, 0, 34, 2, 71, 4, 64, 32, 1, 65, 172, 3, 75, 4, 64, 32, 1, 65, 16, 107, 34, 3, 32, 3, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 2, 16, 12, 11, 32, 0, 32, 1, 54, 2, 0, 11, 7, 0, 32, 0, 40, 2, 4, 11, 9, 0, 32, 0, 32, 1, 54, 2, 4, 11, 7, 0, 32, 0, 40, 2, 8, 11, 9, 0, 32, 0, 32, 1, 54, 2, 8, 11, 7, 0, 32, 0, 41, 3, 16, 11, 9, 0, 32, 0, 32, 1, 55, 3, 16, 11, 7, 0, 32, 0, 41, 3, 24, 11, 9, 0, 32, 0, 32, 1, 55, 3, 24, 11, 7, 0, 32, 0, 41, 3, 32, 11, 9, 0, 32, 0, 32, 1, 55, 3, 32, 11, 7, 0, 32, 0, 41, 3, 40, 11, 9, 0, 32, 0, 32, 1, 55, 3, 40, 11, 7, 0, 32, 0, 41, 3, 48, 11, 9, 0, 32, 0, 32, 1, 55, 3, 48, 11, 7, 0, 32, 0, 41, 3, 56, 11, 9, 0, 32, 0, 32, 1, 55, 3, 56, 11, 7, 0, 32, 0, 41, 3, 64, 11, 9, 0, 32, 0, 32, 1, 55, 3, 64, 11, 7, 0, 32, 0, 41, 3, 72, 11, 9, 0, 32, 0, 32, 1, 55, 3, 72, 11, 7, 0, 32, 0, 41, 3, 80, 11, 9, 0, 32, 0, 32, 1, 55, 3, 80, 11, 7, 0, 32, 0, 41, 3, 88, 11, 9, 0, 32, 0, 32, 1, 55, 3, 88, 11, 7, 0, 32, 0, 41, 3, 96, 11, 9, 0, 32, 0, 32, 1, 55, 3, 96, 11, 172, 4, 2, 5, 127, 1, 126, 32, 2, 65, 172, 3, 75, 4, 64, 32, 2, 65, 16, 107, 34, 4, 32, 4, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 2, 33, 4, 65, 0, 33, 2, 32, 1, 40, 2, 8, 33, 5, 32, 1, 40, 2, 4, 33, 6, 3, 64, 2, 127, 65, 0, 33, 3, 3, 64, 32, 3, 32, 5, 72, 4, 64, 32, 3, 32, 6, 106, 45, 0, 0, 33, 1, 32, 0, 40, 2, 0, 32, 0, 40, 2, 8, 16, 19, 33, 7, 32, 0, 40, 2, 8, 32, 0, 40, 2, 0, 40, 2, 4, 106, 32, 1, 58, 0, 0, 32, 0, 32, 0, 41, 3, 40, 35, 6, 40, 2, 4, 32, 7, 65, 3, 116, 106, 41, 3, 0, 133, 55, 3, 40, 32, 0, 32, 0, 40, 2, 8, 65, 1, 106, 32, 0, 40, 2, 4, 111, 54, 2, 8, 32, 0, 35, 5, 40, 2, 4, 32, 0, 41, 3, 40, 34, 8, 66, 45, 136, 167, 65, 3, 116, 106, 41, 3, 0, 32, 1, 173, 32, 8, 66, 8, 134, 132, 133, 55, 3, 40, 32, 0, 32, 0, 41, 3, 16, 66, 1, 124, 55, 3, 16, 32, 0, 32, 0, 41, 3, 24, 66, 1, 124, 55, 3, 24, 32, 0, 41, 3, 16, 32, 0, 41, 3, 80, 90, 4, 127, 32, 0, 41, 3, 40, 32, 0, 41, 3, 96, 131, 80, 5, 65, 0, 11, 4, 127, 65, 1, 5, 32, 0, 41, 3, 16, 32, 0, 41, 3, 88, 90, 11, 4, 64, 32, 0, 32, 0, 41, 3, 32, 55, 3, 48, 32, 0, 32, 0, 41, 3, 16, 55, 3, 56, 32, 0, 32, 0, 41, 3, 40, 55, 3, 64, 65, 0, 33, 1, 3, 64, 32, 1, 32, 0, 40, 2, 4, 72, 4, 64, 32, 0, 40, 2, 0, 32, 1, 16, 18, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 32, 0, 66, 0, 55, 3, 40, 32, 0, 65, 0, 54, 2, 8, 32, 0, 66, 0, 55, 3, 16, 32, 0, 66, 0, 55, 3, 40, 32, 0, 40, 2, 0, 32, 0, 40, 2, 8, 16, 19, 33, 1, 32, 0, 40, 2, 8, 32, 0, 40, 2, 0, 40, 2, 4, 106, 65, 1, 58, 0, 0, 32, 0, 32, 0, 41, 3, 40, 35, 6, 40, 2, 4, 32, 1, 65, 3, 116, 106, 41, 3, 0, 133, 55, 3, 40, 32, 0, 32, 0, 40, 2, 8, 65, 1, 106, 32, 0, 40, 2, 4, 111, 54, 2, 8, 32, 0, 35, 5, 40, 2, 4, 32, 0, 41, 3, 40, 34, 8, 66, 45, 136, 167, 65, 3, 116, 106, 41, 3, 0, 32, 8, 66, 8, 134, 66, 1, 132, 133, 55, 3, 40, 32, 3, 65, 1, 106, 12, 3, 11, 32, 3, 65, 1, 106, 33, 3, 12, 1, 11, 11, 65, 127, 11, 34, 1, 65, 0, 78, 4, 64, 32, 5, 32, 1, 107, 33, 5, 32, 1, 32, 6, 106, 33, 6, 32, 2, 34, 1, 65, 1, 106, 33, 2, 32, 4, 40, 2, 4, 32, 1, 65, 2, 116, 106, 32, 0, 41, 3, 56, 62, 2, 0, 12, 1, 11, 11, 32, 4, 11, 10, 0, 16, 15, 36, 5, 16, 15, 36, 6, 11, 3, 0, 1, 11, 73, 1, 2, 127, 32, 0, 40, 2, 4, 34, 1, 65, 255, 255, 255, 255, 0, 113, 34, 2, 65, 1, 70, 4, 64, 32, 0, 65, 16, 106, 16, 53, 32, 0, 32, 0, 40, 2, 0, 65, 1, 114, 54, 2, 0, 35, 0, 32, 0, 16, 2, 5, 32, 0, 32, 2, 65, 1, 107, 32, 1, 65, 128, 128, 128, 128, 127, 113, 114, 54, 2, 4, 11, 11, 58, 0, 2, 64, 2, 64, 2, 64, 32, 0, 65, 8, 107, 40, 2, 0, 14, 7, 0, 0, 1, 1, 1, 1, 1, 2, 11, 15, 11, 32, 0, 40, 2, 0, 34, 0, 4, 64, 32, 0, 65, 172, 3, 79, 4, 64, 32, 0, 65, 16, 107, 16, 52, 11, 11, 15, 11, 0, 11, 11, 137, 3, 7, 0, 65, 16, 11, 55, 40, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 40, 0, 0, 0, 97, 0, 108, 0, 108, 0, 111, 0, 99, 0, 97, 0, 116, 0, 105, 0, 111, 0, 110, 0, 32, 0, 116, 0, 111, 0, 111, 0, 32, 0, 108, 0, 97, 0, 114, 0, 103, 0, 101, 0, 65, 208, 0, 11, 45, 30, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 30, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 114, 0, 116, 0, 47, 0, 116, 0, 108, 0, 115, 0, 102, 0, 46, 0, 116, 0, 115, 0, 65, 128, 1, 11, 43, 28, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 28, 0, 0, 0, 73, 0, 110, 0, 118, 0, 97, 0, 108, 0, 105, 0, 100, 0, 32, 0, 108, 0, 101, 0, 110, 0, 103, 0, 116, 0, 104, 0, 65, 176, 1, 11, 53, 38, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 38, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0, 98, 0, 117, 0, 102, 0, 102, 0, 101, 0, 114, 0, 46, 0, 116, 0, 115, 0, 65, 240, 1, 11, 51, 36, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 36, 0, 0, 0, 73, 0, 110, 0, 100, 0, 101, 0, 120, 0, 32, 0, 111, 0, 117, 0, 116, 0, 32, 0, 111, 0, 102, 0, 32, 0, 114, 0, 97, 0, 110, 0, 103, 0, 101, 0, 65, 176, 2, 11, 51, 36, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 36, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 116, 0, 121, 0, 112, 0, 101, 0, 100, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0, 46, 0, 116, 0, 115, 0, 65, 240, 2, 11, 53, 7, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 145, 4, 0, 0, 2, 0, 0, 0, 49, 0, 0, 0, 2, 0, 0, 0, 17, 1, 0, 0, 2, 0, 0, 0, 16, 0, 34, 16, 115, 111, 117, 114, 99, 101, 77, 97, 112, 112, 105, 110, 103, 85, 82, 76, 16, 46, 47, 114, 97, 98, 105, 110, 46, 119, 97, 115, 109, 46, 109, 97, 112]);
	return instantiate(new Response(new Blob([t], {
		type: "application/wasm"
	})), e)
}
loadWebAssembly.supported = "undefined" != typeof WebAssembly;
var rabinWasm = loadWebAssembly;
const Rabin = rabin$1,
	getRabin = rabinWasm,
	create = async (e, t, r, n, o) => {
		const i = await getRabin();
		return new Rabin(i, e, t, r, n, o)
	};
var src$1 = {
	Rabin: Rabin,
	create: create
};
async function* rabinChunker(e, t) {
	let r, n, o;
	if (t.minChunkSize && t.maxChunkSize && t.avgChunkSize) o = t.avgChunkSize, r = t.minChunkSize, n = t.maxChunkSize;
	else {
		if (!t.avgChunkSize) throw errCode(new Error("please specify an average chunk size"), "ERR_INVALID_AVG_CHUNK_SIZE");
		o = t.avgChunkSize, r = o / 3, n = o + o / 2
	}
	if (r < 16) throw errCode(new Error("rabin min must be greater than 16"), "ERR_INVALID_MIN_CHUNK_SIZE");
	n < r && (n = r), o < r && (o = r);
	const i = Math.floor(Math.log2(o));
	for await (const o of rabin(e, {
		min: r,
		max: n,
		bits: i,
		window: t.window,
		polynomial: t.polynomial
	})) yield o
}
async function* rabin(e, t) {
	const r = await src$1.create(t.bits, t.min, t.max, t.window),
		n = new BufferList_1;
	for await (const t of e) {
		n.append(t);
		const e = r.fingerprint(t);
		for (let t = 0; t < e.length; t++) {
			const r = e[t],
				o = n.slice(0, r);
			n.consume(r), yield o
		}
	}
	n.length && (yield n.slice(0))
}
async function* fixedSizeChunker(e, t) {
	let r = new BufferList_1,
		n = 0,
		o = !1;
	const i = t.maxChunkSize;
	for await (const t of e) for (r.append(t), n += t.length; n >= i;)
		if (yield r.slice(0, i), o = !0, i === r.length) r = new BufferList_1, n = 0;
		else {
			const e = new BufferList_1;
			e.append(r.shallowSlice(i)), r = e, n -= i
		} o && !n || (yield r.slice(0, n))
}
const identity = from$1({
	prefix: "\0",
	name: "identity",
	encode: e => toString$1(e),
	decode: e => fromString$3(e)
});
var identityBase = Object.freeze({
	__proto__: null,
	identity: identity
});
const base2 = rfc4648({
	prefix: "0",
	name: "base2",
	alphabet: "01",
	bitsPerChar: 1
});
var base2$1 = Object.freeze({
	__proto__: null,
	base2: base2
});
const base8 = rfc4648({
	prefix: "7",
	name: "base8",
	alphabet: "01234567",
	bitsPerChar: 3
});
var base8$1 = Object.freeze({
	__proto__: null,
	base8: base8
});
const base10 = baseX({
	prefix: "9",
	name: "base10",
	alphabet: "0123456789"
});
var base10$1 = Object.freeze({
	__proto__: null,
	base10: base10
});
const base16 = rfc4648({
		prefix: "f",
		name: "base16",
		alphabet: "0123456789abcdef",
		bitsPerChar: 4
	}),
	base16upper = rfc4648({
		prefix: "F",
		name: "base16upper",
		alphabet: "0123456789ABCDEF",
		bitsPerChar: 4
	});
var base16$1 = Object.freeze({
	__proto__: null,
	base16: base16,
	base16upper: base16upper
});
const base36 = baseX({
		prefix: "k",
		name: "base36",
		alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
	}),
	base36upper = baseX({
		prefix: "K",
		name: "base36upper",
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	});
var base36$1 = Object.freeze({
	__proto__: null,
	base36: base36,
	base36upper: base36upper
});
const base64 = rfc4648({
		prefix: "m",
		name: "base64",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
		bitsPerChar: 6
	}),
	base64pad = rfc4648({
		prefix: "M",
		name: "base64pad",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		bitsPerChar: 6
	}),
	base64url = rfc4648({
		prefix: "u",
		name: "base64url",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
		bitsPerChar: 6
	}),
	base64urlpad = rfc4648({
		prefix: "U",
		name: "base64urlpad",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
		bitsPerChar: 6
	});
var base64$1 = Object.freeze({
	__proto__: null,
	base64: base64,
	base64pad: base64pad,
	base64url: base64url,
	base64urlpad: base64urlpad
});
new TextEncoder, new TextDecoder;
const bases = {
	...identityBase,
	...base2$1,
	...base8$1,
	...base10$1,
	...base16$1,
	...base32$1,
	...base36$1,
	...base58,
	...base64$1
};

function createCodec(e, t, r, n) {
	return {
		name: e,
		prefix: t,
		encoder: {
			name: e,
			prefix: t,
			encode: r
		},
		decoder: {
			decode: n
		}
	}
}
const string = createCodec("utf8", "u", (e => "u" + new TextDecoder("utf8").decode(e)), (e => (new TextEncoder).encode(e.substring(1)))),
	ascii = createCodec("ascii", "a", (e => {
		let t = "a";
		for (let r = 0; r < e.length; r++) t += String.fromCharCode(e[r]);
		return t
	}), (e => {
		e = e.substring(1);
		const t = new Uint8Array(e.length);
		for (let r = 0; r < e.length; r++) t[r] = e.charCodeAt(r);
		return t
	})),
	BASES = {
		utf8: string,
		"utf-8": string,
		hex: bases.base16,
		latin1: ascii,
		ascii: ascii,
		binary: ascii,
		...bases
	};

function fromString(e, t = "utf8") {
	const r = BASES[t];
	if (!r) throw new Error(`Unsupported encoding "${t}"`);
	return r.decoder.decode(`${r.prefix}${e}`)
}
var fromString$1 = Object.freeze({
	__proto__: null,
	fromString: fromString
});
async function* validateChunks(e) {
	for await (const t of e) {
		if (void 0 === t.length) throw errCode(new Error("Content was invalid"), "ERR_INVALID_CONTENT");
		if ("string" == typeof t || t instanceof String) yield fromString(t.toString());
		else if (Array.isArray(t)) yield Uint8Array.from(t);
		else {
			if (!(t instanceof Uint8Array)) throw errCode(new Error("Content was invalid"), "ERR_INVALID_CONTENT");
			yield t
		}
	}
}

function isIterable(e) {
	return Symbol.iterator in e
}

function isAsyncIterable(e) {
	return Symbol.asyncIterator in e
}

function contentAsAsyncIterable(e) {
	try {
		if (e instanceof Uint8Array) return async function*() {
			yield e
		}();
		if (isIterable(e)) return async function*() {
			yield* e
		}();
		if (isAsyncIterable(e)) return e
	} catch {
		throw errCode(new Error("Content was invalid"), "ERR_INVALID_CONTENT")
	}
	throw errCode(new Error("Content was invalid"), "ERR_INVALID_CONTENT")
}
async function* dagBuilder(e, t, r) {
	for await (const n of e) if (n.path && ("./" === n.path.substring(0, 2) && (r.wrapWithDirectory = !0), n.path = n.path.split("/").filter((e => e && "." !== e)).join("/")), n.content) {
		let e, o;
		e = "function" == typeof r.chunker ? r.chunker : "rabin" === r.chunker ? rabinChunker : fixedSizeChunker, o = "function" == typeof r.chunkValidator ? r.chunkValidator : validateChunks;
		const i = {
			path: n.path,
			mtime: n.mtime,
			mode: n.mode,
			content: e(o(contentAsAsyncIterable(n.content), r), r)
		};
		yield() => fileBuilder(i, t, r)
	} else {
		if (!n.path) throw new Error("Import candidate must have content or path or both"); {
			const e = {
				path: n.path,
				mtime: n.mtime,
				mode: n.mode
			};
			yield() => dirBuilder(e, t, r)
		}
	}
}
class Dir {
	constructor(e, t) {
		this.options = t || {}, this.root = e.root, this.dir = e.dir, this.path = e.path, this.dirty = e.dirty, this.flat = e.flat, this.parent = e.parent, this.parentKey = e.parentKey, this.unixfs = e.unixfs, this.mode = e.mode, this.mtime = e.mtime, this.cid = void 0, this.size = void 0
	}
	async put(e, t) {}
	get(e) {
		return Promise.resolve(this)
	}
	async *eachChildSeries() {}
	async *flush(e) {}
}
class DirFlat extends Dir {
	constructor(e, t) {
		super(e, t), this._children = {}
	}
	async put(e, t) {
		this.cid = void 0, this.size = void 0, this._children[e] = t
	}
	get(e) {
		return Promise.resolve(this._children[e])
	}
	childCount() {
		return Object.keys(this._children).length
	}
	directChildrenCount() {
		return this.childCount()
	}
	onlyChild() {
		return this._children[Object.keys(this._children)[0]]
	}
	async *eachChildSeries() {
		const e = Object.keys(this._children);
		for (let t = 0; t < e.length; t++) {
			const r = e[t];
			yield {
				key: r,
				child: this._children[r]
			}
		}
	}
	async *flush(e) {
		const t = Object.keys(this._children),
			r = [];
		for (let n = 0; n < t.length; n++) {
			let o = this._children[t[n]];
			if (o instanceof Dir)
				for await (const t of o.flush(e)) o = t, yield o;
			null != o.size && o.cid && r.push({
				Name: t[n],
				Tsize: o.size,
				Hash: o.cid
			})
		}
		const n = new UnixFS({
				type: "directory",
				mtime: this.mtime,
				mode: this.mode
			}),
			o = {
				Data: n.marshal(),
				Links: r
			},
			i = encode$1(prepare(o)),
			s = await persist(i, e, this.options),
			a = i.length + o.Links.reduce(((e, t) => e + (null == t.Tsize ? 0 : t.Tsize)), 0);
		this.cid = s, this.size = a, yield {
			cid: s,
			unixfs: n,
			path: this.path,
			size: a
		}
	}
}
const BITS_PER_BYTE = 7;
var sparseArray = class {
	constructor() {
		this._bitArrays = [], this._data = [], this._length = 0, this._changedLength = !1, this._changedData = !1
	}
	set(e, t) {
		let r = this._internalPositionFor(e, !1);
		if (void 0 === t) - 1 !== r && (this._unsetInternalPos(r), this._unsetBit(e), this._changedLength = !0, this._changedData = !0);
		else {
			let n = !1; - 1 === r ? (r = this._data.length, this._setBit(e), this._changedData = !0) : n = !0, this._setInternalPos(r, e, t, n), this._changedLength = !0
		}
	}
	unset(e) {
		this.set(e, void 0)
	}
	get(e) {
		this._sortData();
		const t = this._internalPositionFor(e, !0);
		if (-1 !== t) return this._data[t][1]
	}
	push(e) {
		return this.set(this.length, e), this.length
	}
	get length() {
		if (this._sortData(), this._changedLength) {
			const e = this._data[this._data.length - 1];
			this._length = e ? e[0] + 1 : 0, this._changedLength = !1
		}
		return this._length
	}
	forEach(e) {
		let t = 0;
		for (; t < this.length;) e(this.get(t), t, this), t++
	}
	map(e) {
		let t = 0,
			r = new Array(this.length);
		for (; t < this.length;) r[t] = e(this.get(t), t, this), t++;
		return r
	}
	reduce(e, t) {
		let r = 0,
			n = t;
		for (; r < this.length;) {
			n = e(n, this.get(r), r), r++
		}
		return n
	}
	find(e) {
		let t, r, n = 0;
		for (; n < this.length && !t;) r = this.get(n), t = e(r), n++;
		return t ? r : void 0
	}
	_internalPositionFor(e, t) {
		const r = this._bytePosFor(e, t);
		if (r >= this._bitArrays.length) return -1;
		const n = this._bitArrays[r],
			o = e - r * BITS_PER_BYTE;
		if (!((n & 1 << o) > 0)) return -1;
		return this._bitArrays.slice(0, r).reduce(popCountReduce, 0) + popCount(n & ~(4294967295 << o + 1)) - 1
	}
	_bytePosFor(e, t) {
		const r = Math.floor(e / BITS_PER_BYTE),
			n = r + 1;
		for (; !t && this._bitArrays.length < n;) this._bitArrays.push(0);
		return r
	}
	_setBit(e) {
		const t = this._bytePosFor(e, !1);
		this._bitArrays[t] |= 1 << e - t * BITS_PER_BYTE
	}
	_unsetBit(e) {
		const t = this._bytePosFor(e, !1);
		this._bitArrays[t] &= ~(1 << e - t * BITS_PER_BYTE)
	}
	_setInternalPos(e, t, r, n) {
		const o = this._data,
			i = [t, r];
		if (n) this._sortData(), o[e] = i;
		else {
			if (o.length)
				if (o[o.length - 1][0] >= t) o.push(i);
				else if (o[0][0] <= t) o.unshift(i);
			else {
				const e = Math.round(o.length / 2);
				this._data = o.slice(0, e).concat(i).concat(o.slice(e))
			} else this._data.push(i);
			this._changedData = !0, this._changedLength = !0
		}
	}
	_unsetInternalPos(e) {
		this._data.splice(e, 1)
	}
	_sortData() {
		this._changedData && this._data.sort(sortInternal), this._changedData = !1
	}
	bitField() {
		const e = [];
		let t, r = 8,
			n = 0,
			o = 0;
		const i = this._bitArrays.slice();
		for (; i.length || n;) {
			0 === n && (t = i.shift(), n = 7);
			const s = Math.min(n, r);
			o |= (t & ~(255 << s)) << 8 - r, t >>>= s, n -= s, r -= s, r && (n || i.length) || (e.push(o), o = 0, r = 8)
		}
		for (var s = e.length - 1; s > 0; s--) {
			if (0 !== e[s]) break;
			e.pop()
		}
		return e
	}
	compactArray() {
		return this._sortData(), this._data.map(valueOnly)
	}
};

function popCountReduce(e, t) {
	return e + popCount(t)
}

function popCount(e) {
	let t = e;
	return t -= t >> 1 & 1431655765, t = (858993459 & t) + (t >> 2 & 858993459), 16843009 * (t + (t >> 4) & 252645135) >> 24
}

function sortInternal(e, t) {
	return e[0] - t[0]
}

function valueOnly(e) {
	return e[1]
}
var require$$1$1 = getAugmentedNamespace(fromString$1);
const SparseArray = sparseArray,
	{
		fromString: uint8ArrayFromString
	} = require$$1$1;
class Bucket$1 {
	constructor(e, t, r = 0) {
		this._options = e, this._popCount = 0, this._parent = t, this._posAtParent = r, this._children = new SparseArray, this.key = null
	}
	async put(e, t) {
		const r = await this._findNewBucketAndPos(e);
		await r.bucket._putAt(r, e, t)
	}
	async get(e) {
		const t = await this._findChild(e);
		if (t) return t.value
	}
	async del(e) {
		const t = await this._findPlace(e),
			r = t.bucket._at(t.pos);
		r && r.key === e && t.bucket._delAt(t.pos)
	}
	leafCount() {
		return this._children.compactArray().reduce(((e, t) => t instanceof Bucket$1 ? e + t.leafCount() : e + 1), 0)
	}
	childrenCount() {
		return this._children.length
	}
	onlyChild() {
		return this._children.get(0)
	}* eachLeafSeries() {
		const e = this._children.compactArray();
		for (const t of e) t instanceof Bucket$1 ? yield* t.eachLeafSeries(): yield t;
		return []
	}
	serialize(e, t) {
		return t(this._children.reduce(((r, n, o) => (n && (n instanceof Bucket$1 ? r.push(n.serialize(e, t)) : r.push(e(n, o))), r)), []))
	}
	asyncTransform(e, t) {
		return asyncTransformBucket(this, e, t)
	}
	toJSON() {
		return this.serialize(mapNode, reduceNodes)
	}
	prettyPrint() {
		return JSON.stringify(this.toJSON(), null, "  ")
	}
	tableSize() {
		return Math.pow(2, this._options.bits)
	}
	async _findChild(e) {
		const t = await this._findPlace(e),
			r = t.bucket._at(t.pos);
		if (!(r instanceof Bucket$1)) return r && r.key === e ? r : void 0
	}
	async _findPlace(e) {
		const t = this._options.hash("string" == typeof e ? uint8ArrayFromString(e) : e),
			r = await t.take(this._options.bits),
			n = this._children.get(r);
		return n instanceof Bucket$1 ? n._findPlace(t) : {
			bucket: this,
			pos: r,
			hash: t,
			existingChild: n
		}
	}
	async _findNewBucketAndPos(e) {
		const t = await this._findPlace(e);
		if (t.existingChild && t.existingChild.key !== e) {
			const e = new Bucket$1(this._options, t.bucket, t.pos);
			t.bucket._putObjectAt(t.pos, e);
			const r = await e._findPlace(t.existingChild.hash);
			return r.bucket._putAt(r, t.existingChild.key, t.existingChild.value), e._findNewBucketAndPos(t.hash)
		}
		return t
	}
	_putAt(e, t, r) {
		this._putObjectAt(e.pos, {
			key: t,
			value: r,
			hash: e.hash
		})
	}
	_putObjectAt(e, t) {
		this._children.get(e) || this._popCount++, this._children.set(e, t)
	}
	_delAt(e) {
		if (-1 === e) throw new Error("Invalid position");
		this._children.get(e) && this._popCount--, this._children.unset(e), this._level()
	}
	_level() {
		if (this._parent && this._popCount <= 1)
			if (1 === this._popCount) {
				const e = this._children.find(exists);
				if (e && !(e instanceof Bucket$1)) {
					const t = e.hash;
					t.untake(this._options.bits);
					const r = {
						pos: this._posAtParent,
						hash: t,
						bucket: this._parent
					};
					this._parent._putAt(r, e.key, e.value)
				}
			} else this._parent._delAt(this._posAtParent)
	}
	_at(e) {
		return this._children.get(e)
	}
}

function exists(e) {
	return Boolean(e)
}

function mapNode(e, t) {
	return e.key
}

function reduceNodes(e) {
	return e
}
async function asyncTransformBucket(e, t, r) {
	const n = [];
	for (const o of e._children.compactArray())
		if (o instanceof Bucket$1) await asyncTransformBucket(o, t, r);
		else {
			const r = await t(o);
			n.push({
				bitField: e._children.bitField(),
				children: r
			})
		} return r(n)
}
var bucket = Bucket$1,
	consumableHash = {
		exports: {}
	};
const START_MASKS = [255, 254, 252, 248, 240, 224, 192, 128],
	STOP_MASKS = [1, 3, 7, 15, 31, 63, 127, 255];
var consumableBuffer = class {
	constructor(e) {
		this._value = e, this._currentBytePos = e.length - 1, this._currentBitPos = 7
	}
	availableBits() {
		return this._currentBitPos + 1 + 8 * this._currentBytePos
	}
	totalBits() {
		return 8 * this._value.length
	}
	take(e) {
		let t = e,
			r = 0;
		for (; t && this._haveBits();) {
			const e = this._value[this._currentBytePos],
				n = this._currentBitPos + 1,
				o = Math.min(n, t);
			r = (r << o) + byteBitsToInt(e, n - o, o), t -= o, this._currentBitPos -= o, this._currentBitPos < 0 && (this._currentBitPos = 7, this._currentBytePos--)
		}
		return r
	}
	untake(e) {
		for (this._currentBitPos += e; this._currentBitPos > 7;) this._currentBitPos -= 8, this._currentBytePos += 1
	}
	_haveBits() {
		return this._currentBytePos >= 0
	}
};

function byteBitsToInt(e, t, r) {
	return (e & maskFor(t, r)) >>> t
}

function maskFor(e, t) {
	return START_MASKS[e] & STOP_MASKS[Math.min(t + e - 1, 7)]
}

function concat(e, t) {
	t || (t = e.reduce(((e, t) => e + t.length), 0));
	const r = new Uint8Array(t);
	let n = 0;
	for (const t of e) r.set(t, n), n += t.length;
	return r
}
var concat$1 = Object.freeze({
		__proto__: null,
		concat: concat
	}),
	require$$1 = getAugmentedNamespace(concat$1);
const ConsumableBuffer = consumableBuffer,
	{
		concat: uint8ArrayConcat
	} = require$$1;

function wrapHash$1(e) {
	return function(t) {
		return t instanceof InfiniteHash ? t : new InfiniteHash(t, e)
	}
}
class InfiniteHash {
	constructor(e, t) {
		if (!(e instanceof Uint8Array)) throw new Error("can only hash Uint8Arrays");
		this._value = e, this._hashFn = t, this._depth = -1, this._availableBits = 0, this._currentBufferIndex = 0, this._buffers = []
	}
	async take(e) {
		let t = e;
		for (; this._availableBits < t;) await this._produceMoreBits();
		let r = 0;
		for (; t > 0;) {
			const e = this._buffers[this._currentBufferIndex],
				n = Math.min(e.availableBits(), t);
			r = (r << n) + e.take(n), t -= n, this._availableBits -= n, 0 === e.availableBits() && this._currentBufferIndex++
		}
		return r
	}
	untake(e) {
		let t = e;
		for (; t > 0;) {
			const e = this._buffers[this._currentBufferIndex],
				r = Math.min(e.totalBits() - e.availableBits(), t);
			e.untake(r), t -= r, this._availableBits += r, this._currentBufferIndex > 0 && e.totalBits() === e.availableBits() && (this._depth--, this._currentBufferIndex--)
		}
	}
	async _produceMoreBits() {
		this._depth++;
		const e = this._depth ? uint8ArrayConcat([this._value, Uint8Array.from([this._depth])]) : this._value,
			t = await this._hashFn(e),
			r = new ConsumableBuffer(t);
		this._buffers.push(r), this._availableBits += r.availableBits()
	}
}
consumableHash.exports = wrapHash$1, consumableHash.exports.InfiniteHash = InfiniteHash;
const Bucket = bucket,
	wrapHash = consumableHash.exports;

function createHAMT(e) {
	if (!e || !e.hashFn) throw new Error("please define an options.hashFn");
	const t = {
		bits: e.bits || 8,
		hash: wrapHash(e.hashFn)
	};
	return new Bucket(t)
}
var src = {
	createHAMT: createHAMT,
	Bucket: Bucket
};
class DirSharded extends Dir {
	constructor(e, t) {
		super(e, t), this._bucket = src.createHAMT({
			hashFn: t.hamtHashFn,
			bits: t.hamtBucketBits
		})
	}
	async put(e, t) {
		await this._bucket.put(e, t)
	}
	get(e) {
		return this._bucket.get(e)
	}
	childCount() {
		return this._bucket.leafCount()
	}
	directChildrenCount() {
		return this._bucket.childrenCount()
	}
	onlyChild() {
		return this._bucket.onlyChild()
	}
	async *eachChildSeries() {
		for await (const {
			key: e,
			value: t
		} of this._bucket.eachLeafSeries()) yield {
			key: e,
			child: t
		}
	}
	async *flush(e) {
		for await (const t of flush(this._bucket, e, this, this.options)) yield {
			...t,
			path: this.path
		}
	}
}
async function* flush(e, t, r, n) {
	const o = e._children,
		i = [];
	let s = 0;
	for (let e = 0; e < o.length; e++) {
		const r = o.get(e);
		if (!r) continue;
		const a = e.toString(16).toUpperCase().padStart(2, "0");
		if (r instanceof src.Bucket) {
			let e;
			for await (const o of await flush(r, t, null, n)) e = o;
			if (!e) throw new Error("Could not flush sharded directory, no subshard found");
			i.push({
				Name: a,
				Tsize: e.size,
				Hash: e.cid
			}), s += e.size
		} else if ("function" == typeof r.value.flush) {
			const e = r.value;
			let n;
			for await (const r of e.flush(t)) n = r, yield n;
			const o = a + r.key;
			i.push({
				Name: o,
				Tsize: n.size,
				Hash: n.cid
			}), s += n.size
		} else {
			const e = r.value;
			if (!e.cid) continue;
			const t = a + r.key,
				n = e.size;
			i.push({
				Name: t,
				Tsize: n,
				Hash: e.cid
			}), s += n
		}
	}
	const a = Uint8Array.from(o.bitField().reverse()),
		c = new UnixFS({
			type: "hamt-sharded-directory",
			data: a,
			fanout: e.tableSize(),
			hashType: n.hamtHashCode,
			mtime: r && r.mtime,
			mode: r && r.mode
		}),
		u = encode$1(prepare({
			Data: c.marshal(),
			Links: i
		})),
		f = await persist(u, t, n),
		l = u.length + s;
	yield {
		cid: f,
		unixfs: c,
		size: l
	}
}
async function flatToShard(e, t, r, n) {
	let o = t;
	t instanceof DirFlat && t.directChildrenCount() >= r && (o = await convertToShard(t, n));
	const i = o.parent;
	if (i) {
		if (o !== t) {
			if (e && (e.parent = o), !o.parentKey) throw new Error("No parent key found");
			await i.put(o.parentKey, o)
		}
		return flatToShard(o, i, r, n)
	}
	return o
}
async function convertToShard(e, t) {
	const r = new DirSharded({
		root: e.root,
		dir: !0,
		parent: e.parent,
		parentKey: e.parentKey,
		path: e.path,
		dirty: e.dirty,
		flat: !1,
		mtime: e.mtime,
		mode: e.mode
	}, t);
	for await (const {
		key: t,
		child: n
	} of e.eachChildSeries()) await r.put(t, n);
	return r
}
const toPathComponents = (e = "") => (e.trim().match(/([^\\/]|\\\/)+/g) || []).filter(Boolean);
async function addToTree(e, t, r) {
	const n = toPathComponents(e.path || ""),
		o = n.length - 1;
	let i = t,
		s = "";
	for (let a = 0; a < n.length; a++) {
		const c = n[a];
		s += `${s?"/":""}${c}`;
		const u = a === o;
		if (i.dirty = !0, i.cid = void 0, i.size = void 0, u) await i.put(c, e), t = await flatToShard(null, i, r.shardSplitThreshold, r);
		else {
			let e = await i.get(c);
			e && e instanceof Dir || (e = new DirFlat({
				root: !1,
				dir: !0,
				parent: i,
				parentKey: c,
				path: s,
				dirty: !0,
				flat: !0,
				mtime: e && e.unixfs && e.unixfs.mtime,
				mode: e && e.unixfs && e.unixfs.mode
			}, r)), await i.put(c, e), i = e
		}
	}
	return t
}
async function* flushAndYield(e, t) {
	e instanceof Dir ? yield* e.flush(t): e && e.unixfs && e.unixfs.isDirectory() && (yield e)
}
async function* treeBuilder(e, t, r) {
	let n = new DirFlat({
		root: !0,
		dir: !0,
		path: "",
		dirty: !0,
		flat: !0
	}, r);
	for await (const t of e) t && (n = await addToTree(t, n, r), t.unixfs && t.unixfs.isDirectory() || (yield t));
	if (r.wrapWithDirectory) yield* flushAndYield(n, t);
	else
		for await (const e of n.eachChildSeries()) e && (yield* flushAndYield(e.child, t))
}
async function* importer(e, t, r = {}) {
	const n = defaultOptions$1(r);
	let o, i, s;
	o = "function" == typeof r.dagBuilder ? r.dagBuilder : dagBuilder, i = "function" == typeof r.treeBuilder ? r.treeBuilder : treeBuilder, s = Symbol.asyncIterator in e || Symbol.iterator in e ? e : [e];
	for await (const e of i(itParallelBatch(o(s, t, n), n.fileImportConcurrency), t, n)) yield {
		cid: e.cid,
		path: e.path,
		unixfs: e.unixfs,
		size: e.size
	}
}
async function* browserReadableStreamToIt$1(e, t = {}) {
	const r = e.getReader();
	try {
		for (;;) {
			const e = await r.read();
			if (e.done) return;
			yield e.value
		}
	} finally {
		!0 !== t.preventCancel && r.cancel(), r.releaseLock()
	}
}
var browserReadablestreamToIt = browserReadableStreamToIt$1;
const browserReadableStreamToIt = browserReadablestreamToIt;

function blobToIt(e) {
	return "function" == typeof e.stream ? browserReadableStreamToIt(e.stream()) : browserReadableStreamToIt(new Response(e).body)
}
var blobToIt_1 = blobToIt;

function peekableIterator(e) {
	const [t, r] = e[Symbol.asyncIterator] ? [e[Symbol.asyncIterator](), Symbol.asyncIterator] : [e[Symbol.iterator](), Symbol.iterator], n = [];
	return {
		peek: () => t.next(),
		push: e => {
			n.push(e)
		},
		next: () => n.length ? {
			done: !1,
			value: n.shift()
		} : t.next(),
		[r]() {
			return this
		}
	}
}
var itPeekable = peekableIterator;
const map = async function*(e, t) {
	for await (const r of e) yield t(r)
};
var itMap = map;

function isBytes$1(e) {
	return ArrayBuffer.isView(e) || e instanceof ArrayBuffer
}

function isBlob$2(e) {
	return e.constructor && ("Blob" === e.constructor.name || "File" === e.constructor.name) && "function" == typeof e.stream
}

function isFileObject(e) {
	return "object" == typeof e && (e.path || e.content)
}
const isReadableStream = e => e && "function" == typeof e.getReader;
async function* toAsyncIterable$1(e) {
	yield e
}
async function normaliseContent(e) {
	if (isBytes$1(e)) return toAsyncIterable$1(toBytes(e));
	if ("string" == typeof e || e instanceof String) return toAsyncIterable$1(toBytes(e.toString()));
	if (isBlob$2(e)) return blobToIt_1(e);
	if (isReadableStream(e) && (e = browserReadablestreamToIt(e)), Symbol.iterator in e || Symbol.asyncIterator in e) {
		const t = itPeekable(e),
			{
				value: r,
				done: n
			} = await t.peek();
		if (n) return toAsyncIterable$1(new Uint8Array(0));
		if (t.push(r), Number.isInteger(r)) return toAsyncIterable$1(Uint8Array.from(await itAll(t)));
		if (isBytes$1(r) || "string" == typeof r || r instanceof String) return itMap(t, toBytes)
	}
	throw errCode(new Error(`Unexpected input: ${e}`), "ERR_UNEXPECTED_INPUT")
}

function toBytes(e) {
	return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : e instanceof ArrayBuffer ? new Uint8Array(e) : Array.isArray(e) ? Uint8Array.from(e) : fromString(e.toString())
}
async function* normaliseCandidateSingle(e, t) {
	if (null == e) throw errCode(new Error(`Unexpected input: ${e}`), "ERR_UNEXPECTED_INPUT");
	if ("string" == typeof e || e instanceof String) yield toFileObject$1(e.toString(), t);
	else if (isBytes$1(e) || isBlob$2(e)) yield toFileObject$1(e, t);
	else {
		if (isReadableStream(e) && (e = browserReadablestreamToIt(e)), Symbol.iterator in e || Symbol.asyncIterator in e) {
			const r = itPeekable(e),
				{
					value: n,
					done: o
				} = await r.peek();
			if (o) return void(yield {
				content: []
			});
			if (r.push(n), Number.isInteger(n) || isBytes$1(n) || "string" == typeof n || n instanceof String) return void(yield toFileObject$1(r, t));
			throw errCode(new Error("Unexpected input: multiple items passed - if you are using ipfs.add, please use ipfs.addAll instead"), "ERR_UNEXPECTED_INPUT")
		}
		if (!isFileObject(e)) throw errCode(new Error('Unexpected input: cannot convert "' + typeof e + '" into ImportCandidate'), "ERR_UNEXPECTED_INPUT");
		yield toFileObject$1(e, t)
	}
}
async function toFileObject$1(e, t) {
	const {
		path: r,
		mode: n,
		mtime: o,
		content: i
	} = e, s = {
		path: r || "",
		mode: parseMode(n),
		mtime: parseMtime(o)
	};
	return i ? s.content = await t(i) : r || (s.content = await t(e)), s
}

function normaliseInput$1(e) {
	return normaliseCandidateSingle(e, normaliseContent)
}
async function* normaliseCandidateMultiple(e, t) {
	if ("string" == typeof e || e instanceof String || isBytes$1(e) || isBlob$2(e) || e._readableState) throw errCode(new Error("Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead"), "ERR_UNEXPECTED_INPUT");
	if (isReadableStream(e) && (e = browserReadablestreamToIt(e)), Symbol.iterator in e || Symbol.asyncIterator in e) {
		const r = itPeekable(e),
			{
				value: n,
				done: o
			} = await r.peek();
		if (o) return void(yield*[]);
		if (r.push(n), Number.isInteger(n)) throw errCode(new Error("Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead"), "ERR_UNEXPECTED_INPUT");
		if (n._readableState) return void(yield* itMap(r, (e => toFileObject({
			content: e
		}, t))));
		if (isBytes$1(n)) return void(yield toFileObject({
			content: r
		}, t));
		if (isFileObject(n) || n[Symbol.iterator] || n[Symbol.asyncIterator] || isReadableStream(n) || isBlob$2(n)) return void(yield* itMap(r, (e => toFileObject(e, t))))
	}
	if (isFileObject(e)) throw errCode(new Error("Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead"), "ERR_UNEXPECTED_INPUT");
	throw errCode(new Error("Unexpected input: " + typeof e), "ERR_UNEXPECTED_INPUT")
}
async function toFileObject(e, t) {
	const {
		path: r,
		mode: n,
		mtime: o,
		content: i
	} = e, s = {
		path: r || "",
		mode: parseMode(n),
		mtime: parseMtime(o)
	};
	return i ? s.content = await t(i) : r || (s.content = await t(e)), s
}

function normaliseInput(e) {
	return normaliseCandidateMultiple(e, normaliseContent)
}

function isBytes(e) {
	return ArrayBuffer.isView(e) || e instanceof ArrayBuffer
}

function isBlob$1(e) {
	return Boolean(e.constructor) && ("Blob" === e.constructor.name || "File" === e.constructor.name) && "function" == typeof e.stream
}

function isSingle(e) {
	return "string" == typeof e || e instanceof String || isBytes(e) || isBlob$1(e) || "_readableState" in e
}

function getNormaliser(e) {
	return isSingle(e) ? normaliseInput$1(e) : normaliseInput(e)
}
const drain = async e => {
	for await (const t of e);
};
var itDrain = drain;
const filter = async function*(e, t) {
	for await (const r of e) await t(r) && (yield r)
};
var itFilter = filter;
const take = async function*(e, t) {
	let r = 0;
	if (!(t < 1))
		for await (const n of e) if (yield n, r++, r === t) return
};
var itTake = take;
const sortAll = (e, t) => async function*() {
	const r = await itAll(e);
	yield* r.sort(t)
}();
class BaseBlockstore {
	open() {
		return Promise.reject(new Error(".open is not implemented"))
	}
	close() {
		return Promise.reject(new Error(".close is not implemented"))
	}
	put(e, t, r) {
		return Promise.reject(new Error(".put is not implemented"))
	}
	get(e, t) {
		return Promise.reject(new Error(".get is not implemented"))
	}
	has(e, t) {
		return Promise.reject(new Error(".has is not implemented"))
	}
	delete(e, t) {
		return Promise.reject(new Error(".delete is not implemented"))
	}
	async *putMany(e, t = {}) {
		for await (const {
			key: r,
			value: n
		} of e) await this.put(r, n, t), yield {
			key: r,
			value: n
		}
	}
	async *getMany(e, t = {}) {
		for await (const r of e) yield this.get(r, t)
	}
	async *deleteMany(e, t = {}) {
		for await (const r of e) await this.delete(r, t), yield r
	}
	batch() {
		let e = [],
			t = [];
		return {
			put(t, r) {
				e.push({
					key: t,
					value: r
				})
			},
			delete(e) {
				t.push(e)
			},
			commit: async r => {
				await itDrain(this.putMany(e, r)), e = [], await itDrain(this.deleteMany(t, r)), t = []
			}
		}
	}
	async *_all(e, t) {
		throw new Error("._all is not implemented")
	}
	async *_allKeys(e, t) {
		throw new Error("._allKeys is not implemented")
	}
	query(e, t) {
		let r = this._all(e, t);
		if (null != e.prefix && (r = itFilter(r, (t => t.key.toString().startsWith(e.prefix || "")))), Array.isArray(e.filters) && (r = e.filters.reduce(((e, t) => itFilter(e, t)), r)), Array.isArray(e.orders) && (r = e.orders.reduce(((e, t) => sortAll(e, t)), r)), null != e.offset) {
			let t = 0;
			r = itFilter(r, (() => t++ >= (e.offset || 0)))
		}
		return null != e.limit && (r = itTake(r, e.limit)), r
	}
	queryKeys(e, t) {
		let r = this._allKeys(e, t);
		if (null != e.prefix && (r = itFilter(r, (t => t.toString().startsWith(e.prefix || "")))), Array.isArray(e.filters) && (r = e.filters.reduce(((e, t) => itFilter(e, t)), r)), Array.isArray(e.orders) && (r = e.orders.reduce(((e, t) => sortAll(e, t)), r)), null != e.offset) {
			let t = 0;
			r = itFilter(r, (() => t++ >= e.offset))
		}
		return null != e.limit && (r = itTake(r, e.limit)), r
	}
}
class MemoryBlockStore extends BaseBlockstore {
	constructor() {
		super(), this.store = new Map
	}
	async *blocks() {
		for (const [e, t] of this.store.entries()) yield {
			cid: CID.parse(e),
			bytes: t
		}
	}
	put(e, t) {
		return this.store.set(e.toString(), t), Promise.resolve()
	}
	get(e) {
		const t = this.store.get(e.toString());
		if (!t) throw new Error(`block with cid ${e.toString()} no found`);
		return Promise.resolve(t)
	}
	has(e) {
		return Promise.resolve(this.store.has(e.toString()))
	}
	close() {
		return this.store.clear(), Promise.resolve()
	}
}
const unixfsImporterOptionsDefault = {
	cidVersion: 1,
	chunker: "fixed",
	maxChunkSize: 262144,
	hasher: sha256,
	rawLeaves: !0,
	wrapWithDirectory: !0,
	maxChildrenPerNode: 174
};
async function pack({
	input: e,
	blockstore: t,
	hasher: r,
	maxChunkSize: n,
	maxChildrenPerNode: o,
	wrapWithDirectory: i,
	rawLeaves: s
}) {
	if (!e || Array.isArray(e) && !e.length) throw new Error("missing input file(s)");
	const a = t || new MemoryBlockStore,
		c = await itLast(pipe$1(getNormaliser(e), (e => importer(e, a, {
			...unixfsImporterOptionsDefault,
			hasher: r || unixfsImporterOptionsDefault.hasher,
			maxChunkSize: n || unixfsImporterOptionsDefault.maxChunkSize,
			maxChildrenPerNode: o || unixfsImporterOptionsDefault.maxChildrenPerNode,
			wrapWithDirectory: !1 !== i && unixfsImporterOptionsDefault.wrapWithDirectory,
			rawLeaves: null == s ? unixfsImporterOptionsDefault.rawLeaves : s
		}))));
	if (!c || !c.cid) throw new Error("given input could not be parsed correctly");
	const u = c.cid,
		{
			writer: f,
			out: l
		} = await CarWriter.create([u]),
		h = l[Symbol.asyncIterator]();
	let d;
	return {
		root: u,
		out: {
			[Symbol.asyncIterator]() {
				if (null != d) throw new Error("Multiple iterator not supported");
				return d = (async () => {
					for await (const e of a.blocks()) await f.put(e);
					await f.close(), t || await a.close()
				})(), {
					async next() {
						const e = await h.next();
						return e.done && await d, e
					}
				}
			}
		}
	}
}
var throttledQueue$1 = {
	exports: {}
};
! function(e, t) {
	function r(e, t, r) {
		void 0 === r && (r = !1), r && (t /= e, e = 1);
		var n, o = [],
			i = 0,
			s = 0,
			a = function() {
				var r = i + t,
					c = Date.now();
				if (c < r) return void 0 !== n && clearTimeout(n), void(n = setTimeout(a, r - c));
				i = c, s = 0;
				for (var u = 0, f = o.splice(0, e); u < f.length; u++) {
					var l = f[u];
					s++, l()
				}
				n = o.length ? setTimeout(a, t) : void 0
			};
		return function(r) {
			return new Promise((function(c, u) {
				var f = function() {
						return Promise.resolve().then(r).then(c).catch(u)
					},
					l = Date.now();
				void 0 === n && l - i > t && (i = l, s = 0), s++ < e ? f() : (o.push(f), void 0 === n && (n = setTimeout(a, i + t - l)))
			}))
		}
	}
	Object.defineProperty(t, "__esModule", {
		value: !0
	}), e.exports = r, t.default = r
}(throttledQueue$1, throttledQueue$1.exports);
var throttledQueue = getDefaultExportFromCjs(throttledQueue$1.exports);
const fetch = globalThis.fetch,
	FormData = globalThis.FormData,
	Blob$1 = globalThis.Blob,
	File = globalThis.File,
	Blockstore = MemoryBlockStore,
	GATEWAY = new URL("https://nftstorage.link/"),
	toGatewayURL = (e, t = {}) => {
		const r = t.gateway || GATEWAY;
		return "ipfs:" === (e = new URL(String(e))).protocol ? new URL(`/ipfs/${e.href.slice("ipfs://".length)}`, r) : e
	};
class BlockstoreCarReader {
	constructor(e, t, r) {
		this._version = e, this._roots = t, this._blockstore = r
	}
	get version() {
		return this._version
	}
	get blockstore() {
		return this._blockstore
	}
	async getRoots() {
		return this._roots
	}
	has(e) {
		return this._blockstore.has(e)
	}
	async get(e) {
		return {
			cid: e,
			bytes: await this._blockstore.get(e)
		}
	}
	blocks() {
		return this._blockstore.blocks()
	}
	async *cids() {
		for await (const e of this.blocks()) yield e.cid
	}
}
class Token {
	constructor(e, t, r) {
		this.ipnft = e, this.url = t, this.data = r, Object.defineProperties(this, {
			ipnft: {
				enumerable: !0,
				writable: !1
			},
			url: {
				enumerable: !0,
				writable: !1
			},
			data: {
				enumerable: !1,
				writable: !1
			}
		})
	}
	embed() {
		return Token.embed(this)
	}
	static embed({
		data: e
	}) {
		return embed(e, {
			gateway: GATEWAY
		})
	}
	static async encode(e) {
		const t = new Blockstore,
			[r, n] = mapTokenInputBlobs(e),
			o = JSON.parse(JSON.stringify(n)),
			i = JSON.parse(JSON.stringify(n));
		for (const [e, n] of r.entries()) {
			const r = n.name || "blob",
				s = n.stream(),
				{
					root: a
				} = await pack({
					input: [{
						path: r,
						content: s
					}],
					blockstore: t,
					wrapWithDirectory: !0
				}),
				c = new URL(`ipfs://${a}/${r}`),
				u = e.split(".");
			setIn(o, u, c), setIn(i, u, a)
		}
		const {
			root: s
		} = await pack({
			input: [{
				path: "metadata.json",
				content: JSON.stringify(o)
			}],
			blockstore: t,
			wrapWithDirectory: !1
		}), a = await encode$4({
			value: {
				...i,
				"metadata.json": s,
				type: "nft"
			},
			codec: dagCbor,
			hasher: sha256
		});
		return await t.put(a.cid, a.bytes), {
			cid: a.cid,
			token: new Token(a.cid.toString(), `ipfs://${a.cid}/metadata.json`, o),
			car: new BlockstoreCarReader(1, [a.cid], t)
		}
	}
}
const embed = (e, t) => mapWith(e, isURL, embedURL, t),
	decode = ({
		ipnft: e,
		url: t,
		data: r
	}, n) => new Token(e, t, mapWith(r, isEncodedURL, decodeURL, n)),
	isURL = e => e instanceof URL,
	decodeURL = (e, t) => [e, new URL(t)],
	embedURL = (e, t) => [e, toGatewayURL(t, e)],
	isObject = e => "object" == typeof e && null != e,
	isEncodedURL = (e, t, r) => "string" == typeof e && t.has(r.join(".")),
	encode = e => {
		const [t, r] = mapValueWith(e, isBlob, encodeBlob, new Map, []), n = new FormData;
		for (const [e, r] of t.entries()) n.set(e, r);
		return n.set("meta", JSON.stringify(r)), n
	},
	encodeBlob = (e, t, r) => (e.set(r.join("."), t), [e, void 0]),
	isBlob = e => e instanceof Blob$1,
	mapTokenInputBlobs = e => mapValueWith(e, isBlob, encodeBlob, new Map, []),
	mapWith = (e, t, r, n) => {
		const [, o] = mapValueWith(e, t, r, n, []);
		return o
	},
	mapValueWith = (e, t, r, n, o) => t(e, n, o) ? r(n, e, o) : Array.isArray(e) ? mapArrayWith(e, t, r, n, o) : isObject(e) ? mapObjectWith(e, t, r, n, o) : [n, e],
	mapObjectWith = (e, t, r, n, o) => {
		let i = n;
		const s = {};
		for (const [n, a] of Object.entries(e)) {
			const [e, c] = mapValueWith(a, t, r, i, [...o, n]);
			s[n] = c, i = e
		}
		return [i, s]
	},
	mapArrayWith = (e, t, r, n, o) => {
		const i = [];
		let s = n;
		for (const [n, a] of e.entries()) {
			const [e, c] = mapValueWith(a, t, r, s, [...o, n]);
			i[n] = c, s = e
		}
		return [s, i]
	},
	setIn = (e, t, r) => {
		const n = t.length - 1;
		let o = e;
		for (let [e, i] of t.entries()) e === n ? o[i] = r : o = o[i]
	};
var token = Object.freeze({
	__proto__: null,
	Token: Token,
	embed: embed,
	decode: decode,
	encode: encode,
	mapWith: mapWith
});
const MAX_STORE_RETRIES = 5,
	MAX_CONCURRENT_UPLOADS = 3,
	MAX_CHUNK_SIZE = 10485760,
	RATE_LIMIT_REQUESTS = 30,
	RATE_LIMIT_PERIOD = 1e4;

function createRateLimiter() {
	const e = throttledQueue(RATE_LIMIT_REQUESTS, RATE_LIMIT_PERIOD);
	return () => e((() => {}))
}
const globalRateLimiter = createRateLimiter();
class NFTStorage {
	constructor({
		token: e,
		endpoint: t = new URL("https://api.nft.storage"),
		rateLimiter: r
	}) {
		this.token = e, this.endpoint = t, this.rateLimiter = r || createRateLimiter()
	}
	static auth(e) {
		if (!e) throw new Error("missing token");
		return {
			Authorization: `Bearer ${e}`,
			"X-Client": "nft.storage/js"
		}
	}
	static async storeBlob(e, t, r) {
		const n = new Blockstore;
		let o;
		try {
			const {
				cid: i,
				car: s
			} = await NFTStorage.encodeBlob(t, {
				blockstore: n
			});
			await NFTStorage.storeCar(e, s, r), o = i.toString()
		} finally {
			await n.close()
		}
		return o
	}
	static async storeCar({
		endpoint: e,
		token: t,
		rateLimiter: r = globalRateLimiter
	}, n, {
		onStoredChunk: o,
		maxRetries: i,
		decoders: s,
		signal: a
	} = {}) {
		const c = new URL("upload/", e),
			u = NFTStorage.auth(t),
			f = MAX_CHUNK_SIZE,
			l = n instanceof Blob$1 ? await TreewalkCarSplitter.fromBlob(n, f, {
				decoders: s
			}) : new TreewalkCarSplitter(n, f, {
				decoders: s
			}),
			h = transform(MAX_CONCURRENT_UPLOADS, (async function(e) {
				const t = [];
				for await (const r of e) t.push(r);
				const n = new Blob$1(t, {
						type: "application/car"
					}),
					s = await pRetry$1((async () => {
						let e;
						await r();
						try {
							e = await fetch(c.toString(), {
								method: "POST",
								headers: u,
								body: n,
								signal: a
							})
						} catch (e) {
							throw a && a.aborted ? new AbortError_1(e) : e
						}
						if (429 === e.status) throw new Error("rate limited");
						const t = await e.json();
						if (!t.ok) {
							if (401 === e.status) throw new AbortError_1(t.error.message);
							throw new Error(t.error.message)
						}
						return t.value.cid
					}), {
						retries: null == i ? MAX_STORE_RETRIES : i
					});
				return o && o(n.size), s
			}));
		let d;
		for await (const e of h(l.cars())) d = e;
		return d
	}
	static async storeDirectory(e, t, r) {
		const n = new Blockstore;
		let o;
		try {
			const {
				cid: i,
				car: s
			} = await NFTStorage.encodeDirectory(t, {
				blockstore: n
			});
			await NFTStorage.storeCar(e, s, r), o = i.toString()
		} finally {
			await n.close()
		}
		return o
	}
	static async store(e, t, r) {
		const {
			token: n,
			car: o
		} = await NFTStorage.encodeNFT(t);
		return await NFTStorage.storeCar(e, o, r), n
	}
	static async status({
		endpoint: e,
		token: t,
		rateLimiter: r = globalRateLimiter
	}, n, o) {
		const i = new URL(`${n}/`, e);
		await r();
		const s = await fetch(i.toString(), {
			method: "GET",
			headers: NFTStorage.auth(t),
			signal: o && o.signal
		});
		if (429 === s.status) throw new Error("rate limited");
		const a = await s.json();
		if (a.ok) return {
			cid: a.value.cid,
			deals: decodeDeals(a.value.deals),
			size: a.value.size,
			pin: decodePin(a.value.pin),
			created: new Date(a.value.created)
		};
		throw new Error(a.error.message)
	}
	static async check({
		endpoint: e,
		rateLimiter: t = globalRateLimiter
	}, r, n) {
		const o = new URL(`check/${r}/`, e);
		await t();
		const i = await fetch(o.toString(), {
			signal: n && n.signal
		});
		if (429 === i.status) throw new Error("rate limited");
		const s = await i.json();
		if (s.ok) return {
			cid: s.value.cid,
			deals: decodeDeals(s.value.deals),
			pin: s.value.pin
		};
		throw new Error(s.error.message)
	}
	static async delete({
		endpoint: e,
		token: t,
		rateLimiter: r = globalRateLimiter
	}, n, o) {
		const i = new URL(`${n}/`, e);
		await r();
		const s = await fetch(i.toString(), {
			method: "DELETE",
			headers: NFTStorage.auth(t),
			signal: o && o.signal
		});
		if (429 === s.status) throw new Error("rate limited");
		const a = await s.json();
		if (!a.ok) throw new Error(a.error.message)
	}
	static async encodeNFT(e) {
		return validateERC1155(e), Token.encode(e)
	}
	static async encodeBlob(e, {
		blockstore: t
	} = {}) {
		if (0 === e.size) throw new Error("Content size is 0, make sure to provide some content");
		return packCar([toImportCandidate("blob", e)], {
			blockstore: t,
			wrapWithDirectory: !1
		})
	}
	static async encodeDirectory(e, {
		blockstore: t
	} = {}) {
		let r = 0;
		const n = pipe$1(e, (async function*(e) {
				for await (const t of e) yield toImportCandidate(t.name, t), r += t.size
			})),
			o = await packCar(n, {
				blockstore: t,
				wrapWithDirectory: !0
			});
		if (0 === r) throw new Error("Total size of files should exceed 0, make sure to provide some content");
		return o
	}
	storeBlob(e, t) {
		return NFTStorage.storeBlob(this, e, t)
	}
	storeCar(e, t) {
		return NFTStorage.storeCar(this, e, t)
	}
	storeDirectory(e, t) {
		return NFTStorage.storeDirectory(this, e, t)
	}
	status(e, t) {
		return NFTStorage.status(this, e, t)
	}
	delete(e, t) {
		return NFTStorage.delete(this, e, t)
	}
	check(e, t) {
		return NFTStorage.check(this, e, t)
	}
	store(e, t) {
		return NFTStorage.store(this, e, t)
	}
}

function toAsyncIterable(e) {
	return async function*() {
		for (const t of e) yield t
	}()
}
const validateERC1155 = ({
		name: e,
		description: t,
		image: r,
		decimals: n
	}) => {
		if ("string" != typeof e) throw new TypeError("string property `name` identifying the asset is required");
		if ("string" != typeof t) throw new TypeError("string property `description` describing asset is required");
		if (!(r instanceof Blob$1)) throw new TypeError("property `image` must be a Blob or File object");
		if (r.type.startsWith("image/") || console.warn("According to ERC721 Metadata JSON Schema 'image' must have 'image/*' mime type.\n\nFor better interoperability we would highly recommend storing content with different mime type under 'properties' namespace e.g. `properties: { video: file }` and using 'image' field for storing a preview image for it instead.\n\nFor more context please see ERC-721 specification https://eips.ethereum.org/EIPS/eip-721"), void 0 !== n && "number" != typeof n) throw new TypeError("property `decimals` must be an integer value")
	},
	packCar = async (e, {
		blockstore: t,
		wrapWithDirectory: r
	} = {}) => {
		t = t || new Blockstore;
		const {
			root: n
		} = await pack({
			input: e,
			blockstore: t,
			wrapWithDirectory: r
		});
		return {
			cid: n,
			car: new BlockstoreCarReader(1, [n], t)
		}
	}, decodeDeals = e => e.map((e => {
		const {
			dealActivation: t,
			dealExpiration: r,
			lastChanged: n
		} = {
			dealExpiration: null,
			dealActivation: null,
			...e
		};
		return {
			...e,
			lastChanged: new Date(n),
			...t && {
				dealActivation: new Date(t)
			},
			...r && {
				dealExpiration: new Date(r)
			}
		}
	})), decodePin = e => ({
		...e,
		created: new Date(e.created)
	});

function toImportCandidate(e, t) {
	let r;
	return {
		path: e,
		get content() {
			return r = r || t.stream(), r
		}
	}
}
export {
	Blob$1 as Blob, File, FormData, NFTStorage, token as Token, createRateLimiter, toAsyncIterable, toGatewayURL
};
//# sourceMappingURL=bundle.esm.min.js.map



