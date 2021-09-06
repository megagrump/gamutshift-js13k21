import { resX, resY } from './context.js'

const SPEED = 1.75
const MINVEL = 6

const lerp = (v, target, step) => v + Math.sign(target - v) * Math.min(Math.abs(target - v), step)

export default (world) => {
	const midX = resX * .5, midY = resY * .5
	const ww = world.width * 64, wh = world.height * 64

	const left = -Math.max(0, midX - ww * .5)
	const top = -Math.max(0, midY - wh * .5)
	const right = ww - resX
	const bottom = wh - resY

	const calcTarget = () => [
		Math.max(left, Math.min(right, 32 + world.player.worldX - midX)),
		Math.max(top, Math.min(bottom, 32 + world.player.worldY - midY))
	]

	let [ x, y ] = calcTarget()
	let targetX = x, targetY = y

	return {
		x: () => Math.ceil(x),

		y: () => Math.ceil(y),

		update: (dt) => {
			[ targetX, targetY ] = calcTarget()
			const dx = targetX - x, dy = targetY - y
			const vel = Math.floor(SPEED ** Math.log(dx * dx + dy * dy))

			if(vel > MINVEL) {
				x = lerp(x, targetX, vel * dt)
				y = lerp(y, targetY, vel * dt)
			}
		}
	}
}
