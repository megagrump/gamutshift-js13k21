import InstancedBuffer from './InstancedBuffer.js'

const SEGMENTS = 30

const ATTRIBUTES = [
	// size, stride, offset, [perinstance]
	[ 2,  8, 0 ], // vp
	[ 4, 32, SEGMENTS * 8 +  0, 1 ], // lpos
	[ 4, 32, SEGMENTS * 8 + 16, 1 ], // col
]

const TEMP = new Float32Array(8)

export default class extends InstancedBuffer {
	constructor(maxLights = 64) {
		const tau = Math.PI * 2
		const vertices = [ 0, 0 ]
		for(let i = 0; i < SEGMENTS - 1; ++i) {
			vertices.push(Math.sin(i / (SEGMENTS - 2) * tau))
			vertices.push(Math.cos(i / (SEGMENTS - 2) * tau))
		}
		super(ATTRIBUTES, maxLights, 32, new Float32Array(vertices))
	}

	addLight(...args) { // x, y, z, radius, r, g, b, intensity
		TEMP.set(args)
		this.addInstances(TEMP)
	}
}
