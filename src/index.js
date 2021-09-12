import game from './game.js'
import genTextures from './tex/TexGen.js'
import genAudio from './audio/audio.js'

let focus = true

const frame = (t) => {
	const dt = Math.min(1000 / 30, t - game.time) * .001

	game.time = t
	game.state.step(dt)

	if(focus)
		requestAnimationFrame(frame)
}

const addEventListeners = () => {
	const BINDINGS = {
		down:   {
			keys: ['ArrowDown', 'KeyS'],
			down: () => game.keyState.down = true,
			up: () => game.keyState.down = false,
		},
		up:     {
			keys: ['ArrowUp', 'KeyW'],
			down: () => game.keyState.up = true,
			up: () => game.keyState.up = false,
		},
		left:   {
			keys: ['ArrowLeft', 'KeyA'],
			down: () => game.keyState.left = true,
			up: () => game.keyState.left = false,
		},
		right:  {
			keys: ['ArrowRight', 'KeyD'],
			down: () => game.keyState.right = true,
			up: () => game.keyState.right = false,
		},
		rewind: {
			keys: ['Space'],
			down: () => game.rewind(),
			up: () => 0,
		},
		reset:  {
			keys: ['r'],
			down: () => game.loadLevel(),
			up: () => 0,
		},
		next:   {
			keys: ['n'],
			down: () => game.nextLevel(),
			up: () => 0,
		},
	}

	window.addEventListener('blur', (event) => {
		focus = false
	})

	window.addEventListener('focus', (event) => {
		if(!focus)
			requestAnimationFrame(frame)
		focus = true
	})

	const checkKeyDown = (code, repeat, binding) => {
		if(binding.keys.indexOf(code) == -1)
			return
		if(!repeat)
			binding.down()
		return true
	}

	const checkKeyUp = (code, binding) => {
		if(binding.keys.indexOf(code) == -1)
			return
		binding.up()
		return true
	}

	document.addEventListener('keydown', (event) => {
		const consumed = checkKeyDown(event.code, event.repeat, BINDINGS.down) ||
			checkKeyDown(event.code, event.repeat, BINDINGS.up) ||
			checkKeyDown(event.code, event.repeat, BINDINGS.left) ||
			checkKeyDown(event.code, event.repeat, BINDINGS.right) ||
			checkKeyDown(event.code, false, BINDINGS.rewind) ||
			checkKeyDown(event.key, event.repeat, BINDINGS.reset) ||
			(window.lemmecheat && checkKeyDown(event.key, event.repeat, BINDINGS.next))

		if(consumed)
			event.preventDefault()
	})

	document.addEventListener('keyup', (event) => {
		const consumed = checkKeyUp(event.code, BINDINGS.down) ||
			checkKeyUp(event.code, BINDINGS.up) ||
			checkKeyUp(event.code, BINDINGS.left) ||
			checkKeyUp(event.code, BINDINGS.right)

		if(consumed)
			event.preventDefault()
	})
}

genTextures().then(([diffuse, normals]) => {
	game.renderer.setTileTextures(diffuse, normals)

	genAudio(game.audio).then(() => {
		let hasSave = false
		try {
			hasSave = window.localStorage.getItem('GamutShift-save') > 1
		}
		catch(e) { }

		const txt = document.getElementById('load')
		const play = document.getElementById('play')
		const cont = document.getElementById('cont')
		document.getElementById('loud').style.display = 'block'

		txt.style.display = 'none'
		play.style.display = 'block'
		cont.style.display = hasSave ? 'block' : 'none'

		const startGame = () => {
			document.getElementById('title').style.display = 'none'
			txt.style.display = 'block'
			txt.innerText = "Move with ARROW keys - SPACE rewinds - R restarts level"
			game.start()
			addEventListeners()
			requestAnimationFrame(frame)
		}

		cont.onclick = startGame
		play.onclick = () => {
			try {
				window.localStorage.setItem('GamutShift-save', 1)
			}
			catch(e) { }
			startGame()
		}
	})
})

