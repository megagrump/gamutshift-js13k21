const svg = (body) => `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`

const noise = (baseFrequency, str = 1, numOctaves = 1, seed = 1, type="fractalNoise") =>
	`<filter id="n">` +
		`<feTurbulence type="${type}" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" seed="${seed}" stitchTiles="stitch" xresult="n"/>` +
		`<feColorMatrix type="matrix" values="${str} 0 0 0 0 ${str} 0 0 0 0 ${str} 0 0 0 0 0 0 0 0 1" in="n"/>` +
		`<feComposite operator="in" in2="SourceGraphic" result="m"/>` +
		`<feBlend in="SourceGraphic" in2="m" mode="multiply"/>` +
	`</filter>`

const rect = (x, y, w, h, f, add = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${add}/>`
const line = (x1, y1, x2, y2, c, w = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`
const circle = (x, y, r, f, add = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${add}/>`

const nil = () => [ svg(''), svg('') ]

const scratches = (count = 30, depth = '04') => {
	let scr = ''
	for(let i = 0; i < count; ++i) {
		scr += (i & 1 == 0) ?
			line(Math.random() * 64, 0, Math.random() * 64, 64, '#000000' + depth)
			: line(0, Math.random() * 64, 64, Math.random() * 64, '#000000' + depth)
	}
	return scr
}

const sphere = (color, radius) => {
	let b =
		`<filter id="b">` +
			`<feGaussianBlur stdDeviation="2" />` +
		`</filter>`
	let h = `<g filter="url(#b)">` + rect(0, 0, 64, 64, '#999')
	for(let i = radius + 1; i > 0; --i) {
		const height = Math.round(Math.cos((.8 * i) / radius) * 255)
		h += circle(32, 32, i, `rgb(${height},${height},${height})`)
	}
	return [
		svg(
			circle(32, 32, radius, color)
		),
		svg(b + h + '</g>'),
		5,
		255
	]
}

const wood = (color) => [
	svg(
		noise(.12, .15, 1, 32, 'turbulence') +
		rect(0, 0, 64, 64, '#fff', `filter="url(#n)"`) +
		rect(0, 0, 64, 64, color + '8')
	),
	svg(
		rect(0, 0, 64, 64, '#222') +
		line(0,  0, 64,  0, '#111') +
		line(0, 16, 64, 16, '#111') +
		line(0, 32, 64, 32, '#111') +
		line(0, 48, 64, 48, '#111') +
		scratches(30, '10')
	),
	1,
	50
]

const bricks = (color, gapColor, emboss, rx, ry, noiseFreq, noiseStrength, width, height, gap, shift, spec = 20, depth = 1) => {
	let cbricks = `<g id="c">`, hbricks = `<g id="h">`
	for(let x = gap / 2; x < 64 + width + gap; x += width + gap) {
		cbricks += rect(x, gap / 2, width, height, color, `rx="${rx}" ry="${ry}"`)
		hbricks += rect(x, gap / 2, width, height, emboss, `rx="${rx}" ry="${ry}"`)
	}
	cbricks += '</g>'
	hbricks += '</g>'

	let x = -shift
	for(let y = height + gap; y < 64; y += height + gap) {
		cbricks += `<use href="#c" x="${x}" y="${y}" />`
		hbricks += `<use href="#h" x="${x}" y="${y}" />`
		x = -((x + shift) % width)
	}

	return [
		svg(
			rect(0, 0, 64, 64, gapColor) +
			cbricks
		),
		svg(
			noise(noiseFreq, noiseStrength, 5) +
			rect(0, 0, 64, 64, '#fff', `filter="url(#n)"`) +
			hbricks
		),
		depth,
		spec,
	]
}

const plate = (color, radius) => [
	svg(
		rect(0, 0, 64, 64, color) +
		circle(32, 32, radius, '#0006', `stroke="#000" stroke-width="1"`)
	),
	svg(
		`<defs><radialGradient id="g">` +
			`<stop offset="0%" stop-color="#ccc"/>` +
			`<stop offset="70%" stop-color="#888"/>` +
			`<stop offset="100%" stop-color="#222"/>` +
		`</radialGradient></defs>` +
		rect(0, 0, 64, 64, '#333') +
		rect(1, 1, 62, 62, '#222') +
		rect(2, 2, 60, 60, '#111') +
		circle(32, 32, radius, `url(#g)`, `stroke="#0008" stroke-width="3"`) +
		circle( 8,  8, 2, '#333') +
		circle(56,  8, 2, '#333') +
		circle( 8, 56, 2, '#333') +
		circle(56, 56, 2, '#333')
	),
	2,
	128
]

const checkers = (col1, col2) => {
	let c = rect(0, 0, 64, 64, col1)
	for(let y = 0; y < 64; y += 8)
		for(let x = y % 16; x < 64; x += 16) {
			c += rect(x, y, 8, 8, col2)
		}
	return c
}

const portal = (radius) => [
	svg(
		checkers('#777', '#fff') +
		circle(32, 32, radius, '#222')
	),
	svg(
		rect(0, 0, 64, 64, '#fff') +
		rect(1, 1, 62, 62, '#aaa') +
		circle(32, 32, radius, '#888')
	),
	1,
	50
]

const crate = (color, bars) => [
	svg(
		noise(.1, .6, 2, 64, 'turbulence') +
		rect(4, 4, 56, 56, color, `filter="url(#n)"`) +
		rect(4, 4, 56, 56, color + '6') +
		rect(12, 12, 40, 40, '#ffe3') +
		(bars > 0 ? line(13, 13, 51, 51, '#0004', 7) : '') +
		(bars > 1 ? line(51, 13, 13, 51, '#0004', 7) : '')
	),
	svg(
		rect(3, 3, 57, 57, '#666') +
		rect(5, 5, 53, 53, '#777') +
		rect(12, 12, 40, 40, '#666') +
		line(21, 13, 21, 51, '#555') +
		line(33, 13, 33, 51, '#555') +
		line(45, 13, 45, 51, '#555') +
		(bars > 0 ? line(13, 13, 51, 51, '#777', 7) : '') +
		(bars > 1 ? line(51, 13, 13, 51, '#777', 7) : '')
	),
	2,
	10,
]

const marble = (color, r) => [
	svg(
		noise(.05, 1, 4, 48, 'turbulence') +
		rect(4, 4, 56, 56, color, `rx="${r}" ry="${r}" filter="url(#n)"`)
	),
	svg(
		rect(4, 4, 56, 56, '#ccc', `rx="${r}" ry="${r}"`) +
		rect(5, 5, 54, 54, '#ddd', `rx="${r}" ry="${r}"`) +
		rect(6, 6, 52, 52, '#eee', `rx="${r}" ry="${r}"`) +
		rect(7, 7, 50, 50, '#fff', `rx="${r}" ry="${r}"`)
	),
	2,
	255
]

const checkerBoard = (col1, col2) => [ svg(checkers(col1, col2)), svg('') ]

const panel = (color, gapDepth, vertical) => {
	let rivets = ''
	for(let i = 8; i < 64; i += 24)
		rivets += circle(i, 8, 2, '#0004') + circle(i, 56, 2, '#0004') +
		          circle(8, i, 2, '#0004') + circle(56, i, 2, '#0004')
	let gaps = ''
	if(vertical) {
		for(let i = 8; i <= 56; i += 4)
			gaps += line(i, 8, i, 56, gapDepth)
	}
	else {
		for(let i = 8; i <= 56; i += 4)
			gaps += line(8, i, 56, i, gapDepth)
	}

	return [
		svg(
			noise(.05, 1, 1, 28) +
			rect(0, 0, 64, 64, '#000') +
			rect(1, 1, 62, 62, color, `filter="url(#n)"`) +
			rivets
		),
		svg(
			noise(.05, .1, 6, 28) +
			rect(0, 0, 64, 64, '#000') +
			rect(1, 1, 62, 62, '#fff', `filter="url(#n)"`) +
			rivets +
			gaps +
			scratches(50, '0c')
		),
		1,
		30
	]
}

// FIXME: visual difference in heightmap between Chrome vs. Firefox
const stone = () => [
	svg(
		rect(0, 0, 64, 64, '#421')
	),
	svg(
		noise(.1, .04, 3, 4, 'turbulence') +
		rect(0, 0, 64, 64, '#999', `filter="url(#n)"`)
	),
	1,
	5
]

const metalCrate = () => {
	let h = rect(0, 0, 64, 64, '#888')
	for(let i = 56; i > 46; --i) {
		const r = 255 - (i * 2)
		h += rect(60 - i, 60 - i, i - (56 - i), i - (56 - i), `rgb(${r},${r},${r})`, `rx="6" ry="6"`)
	}

	return [
		svg(
			noise(.2, .5, 3, 56) +
			rect(4, 4, 56, 56, '#fff', `rx="6" ry="6" filter="url(#n)"`) +
			rect(4, 4, 56, 56, '#acf9', `rx="6" ry="6"`) +
			line(20, 20, 44, 44, '#888', 5) +
			line(20, 44, 44, 20, '#888', 5)
		),
		svg(
			h +
			rect(16, 16, 32, 32, '#999') +
			line(20, 20, 44, 44, '#888', 5) +
			line(20, 44, 44, 20, '#888', 5) +
			scratches(10, '02')
		),
		6,
		255
	]
}

const roundedTile = () => [
	svg(
		rect(0, 0, 64, 64, '#bdf') +
		rect(2, 2, 60, 60, '#fff',  'rx="8" ry="8"') +
		circle( 8,  8,  2, '#bdf') +
		circle( 8, 56,  2, '#bdf') +
		circle(56,  8,  2, '#bdf') +
		circle(56, 56,  2, '#bdf')
	),
	svg(
		rect(0, 0, 64, 64, '#888') +
		rect(2, 2, 60, 60, '#aaa', 'rx="8" ry="8"') +
		rect(3, 3, 58, 58, '#bbb', 'rx="8" ry="8"') +
		circle( 8,  8,  2, '#999') +
		circle( 8, 56,  2, '#999') +
		circle(56,  8,  2, '#999') +
		circle(56, 56,  2, '#999') +
		circle( 0,  0,  3, '#666') +
		circle( 0, 64,  3, '#666') +
		circle(64,  0,  3, '#666') +
		circle(64, 64,  3, '#666') +
		scratches()
	),
	1,
	255
]

export default {
	sphere,
	bricks,
	plate,
	portal,
	crate,
	nil,
	checkerBoard,
	wood,
	marble,
	stone,
	panel,
	metalCrate,
	roundedTile,
}
