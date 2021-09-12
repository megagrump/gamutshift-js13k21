import renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'
import LEVELS from './LEVELS.js'

const MOVEDIRS = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]]

const game = {
	level: 1,
	time: 0,
	world: null,
	camera: null,
	renderer: renderer,
	audio: {},
	keyState: {
		down: false,
		up: false,
		right: false,
		left: false,
	},
	state: null,

	switchState: (state, ...args) => {
		state.start(...args)
		game.state = state
	},

	start: () => {
		try {
			game.level = parseInt(window.localStorage.getItem('GamutShift-save') || 1)
		}
		catch(e) { }
		game.loadLevel()
		game.audio.music()
	},

	loadLevel: (level = game.level) => {
		game.snapshots = []
		game.level = level
		game.world = World(level, game.onExit, game.onColorCombine, game.onActivatePlate)
		game.camera = Camera(game.world)
		game.renderer.reset(game.world)
		game.switchState(game.states.enter)
		try {
			window.localStorage.setItem('GamutShift-save', level)
		}
		catch(e) { }
	},

	nextLevel: () => game.loadLevel((game.level + 1) % LEVELS.length),

	onExit: () => game.switchState(game.states.leave),

	onColorCombine: (x, y) => game.switchState(game.states.combine, x, y),

	onActivatePlate: () => 0,

	rewind: () => {
		if(game.world.snapshots.length == 0 || game.state != game.states.play) {
			game.audio.norewind()
			return
		}
		game.switchState(game.states.rewind)
	},

	_movePlayer: (dt) => {
		const moveDir =
				game.keyState.down ? 1 :
				game.keyState.up ? 2 :
				game.keyState.right ? 3 :
				game.keyState.left ? 4 :
				0

		if(game.world.player.resting)
			game.world.movePlayer(MOVEDIRS[moveDir][0], MOVEDIRS[moveDir][1])
	},

	states: {
		enter: (() => {
			let time = 0

			return {
				start: () => {
					time = 0
					game.audio.enter()
				},

				step: (dt) => {
					time = Math.min(1, time + dt * .75)
					game.world.update(dt)
					renderer.render(game.world, game.camera, 'transition', { time })
					if(time >= 1)
						game.switchState(game.states.play)
				}
			}
		})(),

		leave: (() => {
			let time = 1

			return {
				start: () => {
					time = 1
					game.audio.exit()
				},

				step: (dt) => {
					time = Math.max(0, time - dt)
					game.world.update(dt)
					renderer.render(game.world, game.camera, 'transition', { time })
					if(time <= 0)
						game.nextLevel()
				}
			}
		})(),

		play: (() => {
			return {
				start: () => 0,

				step: (dt) => {
					game._movePlayer(dt)
					game.world.update(dt)
					game.camera.update(dt)
					renderer.render(game.world, game.camera, 'screen')
				}
			}
		})(),

		combine: (() => {
			let time = 0
			let x, y
			return {
				start: (px, py) => {
					x = px
					y = py
					time = 0
					game.audio.combine()
				},

				step: (dt) => {
					time = Math.min(1, time + dt * (1. + time) * .5)
					game._movePlayer(dt)
					game.world.update(dt)
					game.camera.update(dt)
					renderer.render(game.world, game.camera, 'ripple', { x, y, time })
					if(time >= 1)
						game.switchState(game.states.play)
				}
			}
		})(),

		rewind: (() => {
			let time = 0, rewound = false
			return {
				start: () => {
					time = 0
					rewound = false
					game.audio.rewind()
				},

				step: (dt) => {
					time = Math.min(1, time + dt * 1.5)
					if(!rewound && time >= .5) {
						rewound = true
						game.world.rewind()
					}
					game.camera.update(dt)
					renderer.render(game.world, game.camera, 'rewind', { time })
					if(time >= 1)
						game.switchState(game.states.play)
				}
			}
		})(),
	}
}

export default game
