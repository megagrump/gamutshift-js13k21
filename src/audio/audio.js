import Player from './soundbox.js'
import music from './music.js'
import enter from './enter.js'
import exit from './exit.js'
import combine from './combine.js'
import rewind from './rewind.js'
import norewind from './norewind.js'

const ENABLED = true

const SOUNDS = { music, enter, exit, combine, rewind, norewind }

export default (target) => new Promise((resolve) => {
	const context = new AudioContext()
	const keys = Object.keys(SOUNDS)
	let current = 0
	let player

	if(!ENABLED) {
		keys.forEach((k) => target[k] = () => {})
		return resolve(context)
	}

	const generator = setInterval(() => {
		player = player || new Player(SOUNDS[keys[current]])

		if(player.generate() < 1)
			return

		const buffer = player.createAudioBuffer(context)
		player = 0
		target[keys[current]] = () => {
			if(context.state == 'suspended')
				context.resume()
			const source = new AudioBufferSourceNode(context, { buffer, loop: buffer.duration > 100 })
			source.connect(context.destination)
			source.start()
			return source
		}

		if(++current == keys.length) {
			clearInterval(generator)
			resolve(context)
		}
	}, 0)
})
