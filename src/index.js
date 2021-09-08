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

const init = () => {
	const addEventListeners = () => {
		window.addEventListener('blur', (event) => {
			focus = false
		})

		window.addEventListener('focus', (event) => {
			if(!focus)
				requestAnimationFrame(frame)
			focus = true
		})

		document.addEventListener('keydown', (event) => {
			game.keyState.down  = game.keyState.down  || event.code == 'ArrowDown'  || event.code == 'KeyS'
			game.keyState.up    = game.keyState.up    || event.code == 'ArrowUp'    || event.code == 'KeyW'
			game.keyState.left  = game.keyState.left  || event.code == 'ArrowLeft'  || event.code == 'KeyA'
			game.keyState.right = game.keyState.right || event.code == 'ArrowRight' || event.code == 'KeyD'
			if(event.key == ' ') {
				game.rewind()
			} else if(event.key == 'r') {
				game.loadLevel()
			} else if(event.key == 'n') { // TODO: remove
				game.nextLevel()
			}
		})

		document.addEventListener('keyup', (event) => {
			game.keyState.down  = game.keyState.down  && !(event.code == 'ArrowDown'  || event.code == 'KeyS')
			game.keyState.up    = game.keyState.up    && !(event.code == 'ArrowUp'    || event.code == 'KeyW')
			game.keyState.left  = game.keyState.left  && !(event.code == 'ArrowLeft'  || event.code == 'KeyA')
			game.keyState.right = game.keyState.right && !(event.code == 'ArrowRight' || event.code == 'KeyD')
		})
	}

	genTextures().then(([diffuse, normals]) => {
		genAudio(game.audio).then(() => {
			document.getElementById('l').innerText = "Move with ARROW keys - SPACE rewinds - R restarts level"
			game.renderer.setTileTextures(diffuse, normals)
			game.start()
			addEventListeners()
			requestAnimationFrame(frame)
		})
	})
}

document.getElementById('p').onclick = (evt) => {
	evt.target.remove()
	document.getElementById('l').style.display = 'block'
	init()
}
