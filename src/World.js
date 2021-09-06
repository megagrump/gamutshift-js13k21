import TILES from './TILES.js'
import LEVELS from './LEVELS.js'

const MOVESPEED = 3 // tiles per second
const LIGHTPOS = [0, 32, 64, 32, 32, 0, 32, 64]
const EXIT = TILES[4]
const PLAYER = TILES[19]

class Tile {
	constructor(tex, traits, x, y) {
		this.x = x
		this.y = y
		this.worldX = x * 64
		this.worldY = y * 64
		this.traits = traits
		this.offsetX = 0
		this.offsetY = 0
		this.dx = 0
		this.dy = 0
		this.tex = tex
		this.resting = true
	}

	move(dx, dy, world) {
		if(!world.get(this.x + dx, this.y + dy))
			return
		this.dx = dx
		this.dy = dy
		this.resting = dx * dx + dy * dy < 0.001
	}

	update(dt, world) {
		if(this.resting)
			return

		this.offsetX = Math.min(1, this.offsetX + MOVESPEED * dt)
		this.offsetY = Math.min(1, this.offsetY + MOVESPEED * dt)
		this.worldX = (this.x + this.dx * this.offsetX) * 64
		this.worldY = (this.y + this.dy * this.offsetY) * 64
		if(this.offsetX >= 1 || this.offsetY >= 1) {
			this._endMove(world)
			this.resting = true
			this.offsetX = this.offsetY = 0
			this.dx = this.dy = 0
		}
	}

	_endMove(world) {
		world.set(this.x, this.y, new Tile(world.floorTex, TILES[0], this.x, this.y))
		this.x += this.dx
		this.y += this.dy
		const target = world.get(this.x, this.y).traits
		const combined = target.combiner(this.traits, target)
		const tile = combined != this.traits ?
			new Tile(combined.tex[world.level % combined.tex.length], combined, this.x, this.y) :
			this
		if(tile != this)
			world.onColorCombine(this.worldX, this.worldY)
		world.set(this.x, this.y, tile)
	}
}

class Player extends Tile {
	_endMove(world) {
		this.x += this.dx
		this.y += this.dy
		if(world.get(this.x, this.y).traits == EXIT)
			world.onExit()
	}
}

export default (level, onExit, onColorCombine, onActivatePlate) => {
	const MAPPING = ' #.*XRGBYCMWrgbycmwP'
	const map = [], lights = []
	const snapshots = []

	const world = {
		map,
		lights,
		level,
		onExit,
		onColorCombine,
		onActivatePlate,
		snapshots,

		snapshot: () => {
			snapshots.push({
				map: map.map((t) => [ t.tex, t.traits, t.x, t.y ]),
				x: world.player.x,
				y: world.player.y,
			})
		},

		rewind: () => {
			const snap = world.snapshots.pop()
			snap.map.forEach((t, i) => map[i] = new Tile(...t))
			world.player = new Player(PLAYER.tex[0], PLAYER, snap.x, snap.y)
		},

		update: (dt) => {
			for(let i = 0; i < map.length; ++i)
				world.map[i].update(dt, world)
			world.player.update(dt, world)
		},

		get: (x, y) => map[y * world.width + x],

		set: (x, y, tile) => map[y * world.width + x] = tile,

		movePlayer: (dx, dy) => {
			const tile = world.get(world.player.x + dx, world.player.y + dy)
			if(tile.traits.walk()) {
				world.player.move(dx, dy, world)
			} else
			if(tile.traits.push()) {
				const target = world.get(tile.x + dx, tile.y + dy)
				if(target && target.traits.combine(tile.traits, target.traits)) {
					world.snapshot()
					world.player.move(dx, dy, world)
					tile.move(dx, dy, world)
				}
			}
		},
	}

	const lines = LEVELS[level].split(/\n/).filter((line) => line.length > 0)
	world.height = lines.length
	world.width = lines.reduce((val, line) => Math.max(val, line.length), 0)

	lines.forEach((line, y) => {
		for(let x = 0; x < world.width; ++x) {
			let t = line.charAt(x) || '.'

			let lightOfs = '<>^v'.indexOf(t) * 2
			if(lightOfs >= 0) {
				lights.push([ x * 64 + LIGHTPOS[lightOfs], y * 64 + LIGHTPOS[lightOfs + 1] ])
				t = ' '
			}

			if(t == 'P') {
				world.player = new Player(PLAYER.tex[0], PLAYER, x, y)
				t = ' '
			}

			const traits = TILES[MAPPING.indexOf(t)]
			const tile = new Tile(traits.tex[level % traits.tex.length], traits, x, y)
			world.set(x, y, tile)
		}
	})

	world.floorTex = TILES[0].tex[level % TILES[0].tex.length]

	return world
}
