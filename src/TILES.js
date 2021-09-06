const TILES = []

// BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE
const COLORMAP = [0, 5, 6, 8, 7, 10, 9, 11]

const always = () => true
const never = () => false
const match = (pushed, target) => pushed.color == target.color
const invMatch = (pushed, target) => pushed.color != 0 && target.color != 0 && (pushed.color & target.color) == 0
const nullCombiner = (pushed) => pushed
const colCombiner = (pushed, target) => TILES[COLORMAP[pushed.color | target.color]]
const plateCombiner = () => TILES[0]

const Traits = (color, layer, tex, light, walk, push, combine, combiner) => ({
	color, layer, tex, light, walk, push, combine, combiner
})

TILES.push(
	//    col lay tex                             light  walk     push   combine   combiner
	Traits(0, 0, [7, 21, 22, 37, 32, 33, 35],     null, always,  never,   always,  nullCombiner), // FLOOR
	Traits(0, 1, [26, 27, 8, 28, 23, 30, 31, 34], null,  never,  never,    never,  nullCombiner), // WALL
	Traits(0, 0, [9],                             null,  never,  never,    never,  nullCombiner), // VOID
	Traits(0, 1, [24, 17, 25, 29, 36],            null,  never, always,    never,  nullCombiner), // OBSTACLE
	Traits(0, 0, [18],      [ 16, .6,  1,  1, 3, 128 ], always,  never,    never,  nullCombiner), // EXIT
	Traits(1, 1, [0],       [ 96,  1, .2, .2, 1, 256 ],  never, always, invMatch,   colCombiner), // RED
	Traits(2, 1, [1],       [ 96, .5,  1, .2, 1, 256 ],  never, always, invMatch,   colCombiner), // GREEN
	Traits(4, 1, [2],       [ 96, .2, .2,  1, 1, 256 ],  never, always, invMatch,   colCombiner), // BLUE
	Traits(3, 1, [3],       [ 96,  1,  1, .2, 1, 256 ],  never, always, invMatch,   colCombiner), // YELLOW
	Traits(6, 1, [4],       [ 96, .2,  1,  1, 1, 256 ],  never, always, invMatch,   colCombiner), // CYAN
	Traits(5, 1, [5],       [ 96,  1, .2,  1, 1, 256 ],  never, always, invMatch,   colCombiner), // MAGENTA
	Traits(7, 1, [6],       [ 96,  1,  1,  1, 1, 256 ],  never, always, invMatch,   colCombiner), // WHITE
	Traits(1, 0, [10],      [ 60,  1, .3, .3, 1, 160 ],  never,  never,    match, plateCombiner), // RED PLATE
	Traits(2, 0, [11],      [ 60, .3,  1, .3, 1, 160 ],  never,  never,    match, plateCombiner), // GREEN PLATE
	Traits(4, 0, [12],      [ 60, .3, .3,  1, 1, 160 ],  never,  never,    match, plateCombiner), // BLUE PLATE
	Traits(3, 0, [13],      [ 60,  1,  1, .3, 1, 160 ],  never,  never,    match, plateCombiner), // YELLOW PLATE
	Traits(6, 0, [14],      [ 60, .3,  1,  1, 1, 160 ],  never,  never,    match, plateCombiner), // CYAN PLATE
	Traits(5, 0, [15],      [ 60,  1, .3,  1, 1, 160 ],  never,  never,    match, plateCombiner), // MAGENTA PLATE
	Traits(7, 0, [16],      [ 60,  1,  1,  1, 1, 160 ],  never,  never,    match, plateCombiner), // WHITE PLATE
	Traits(0, 1, [19],      [ 96,  1, .8, .4, 1, 256 ],  never,  never,    never,  nullCombiner), // PLAYER
)

export default TILES
