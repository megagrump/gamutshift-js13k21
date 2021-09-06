import game from './game.js'
import genTextures from './tex/TexGen.js'
import genAudio from './audio/audio.js'

let focus = true

const init = () => new Promise((resolve) => {
	game.switchState(game.states.load)
	genTextures().then(([diffuse, normals]) => {
		game.renderer.setTileTextures(diffuse, normals)
		genAudio(game.audio).then(resolve)
	})
})

const frame = (t) => {
	const dt = Math.min(1000 / 30, t - game.time)
	game.time = t
	game.state.step(dt / 1000)

	if(focus)
		requestAnimationFrame(frame)
}

init().then(() => {
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

	document.getElementById('l').innerText = ''
	document.getElementById('p').style.display = 'block'
	requestAnimationFrame(frame)
})
