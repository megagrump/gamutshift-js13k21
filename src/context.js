const canvas = document.getElementById('c')
const gl = canvas.getContext('webgl2')
const resX = canvas.width, resY = canvas.height

/*const webgl = canvas.getContext('webgl2')
const gl = {}
for(const k in webgl) {
	if(typeof(webgl[k]) == 'function')
		gl['_' + k.toLowerCase()] = webgl[k].bind(webgl)
	else
		gl[k.toLowerCase()] = webgl[k]
}
gl.prototype = webgl.prototype*/

export { canvas, gl, resX, resY }
