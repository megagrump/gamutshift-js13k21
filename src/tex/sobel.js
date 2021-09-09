export default (src, strength, spec) => {
	const res = new Uint8ClampedArray(src.data.length)

	// red channel value from pixel at x, y with border wrap-around
	const R = (x, y) => src.data[(y & 63) * 256 + (x & 63) * 4] / 255

	for(let y = 0; y < 64; ++y) {
		for(let x = 0; x < 64; ++x) {
			const vx = strength * -(R(x + 1, y - 1) - R(x - 1, y - 1) +
			                   2 * (R(x + 1, y    ) - R(x - 1, y    )) +
				                    R(x + 1, y + 1) - R(x - 1, y + 1))

			const vy = strength * -(R(x - 1, y + 1) - R(x - 1, y - 1) +
			                   2 * (R(x    , y + 1) - R(x    , y - 1)) +
			                        R(x + 1, y + 1) - R(x + 1, y - 1))

			const l = Math.sqrt(vx * vx + vy * vy + 1)

			let p = y * 256 + x * 4
			res[p++] = Math.round((.5 + .5 * (vx / l)) * 255)
			res[p++] = Math.round((.5 + .5 * (vy / l)) * 255)
			res[p++] = spec
		}
	}

	return new ImageData(res, 64)
}
