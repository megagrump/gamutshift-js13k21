import { resX, resY } from './context.js'
const preamble = `#version 300 es\nprecision highp float;precision highp sampler2D;precision highp sampler2DArray;const vec2 res = vec2(${resX},${resY});`

const defaultVertex = `${preamble}
layout(location=0) in vec2 vp;
layout(location=1) in vec2 tc;
out vec2 uv;

void main() {
	uv = tc;
	gl_Position = vec4((vp / res) * 2. - 1., 0., 1.);
}
`

const aoFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex;

void main() {
	col = texture(tex, uv).aaaa;
}
`

const tileVertex = `${preamble}
layout(location=0) in vec2 vp;
layout(location=1) in vec2 tc;
layout(location=2) in vec3 tile;
out vec3 uv;
uniform vec2 scroll;

void main() {
	uv = vec3(tc, tile.z);
	vec2 p = ((vp + tile.xy - scroll) / res) * 2. - 1.;
	gl_Position = vec4(p, 0., 1.);
}
`

const tileFragment = `${preamble}
layout(location=1) out vec4 norm;
layout(location=0) out vec4 col;
in vec3 uv;
uniform sampler2DArray tex, normals;

void main() {
	col = texture(tex, uv);
	norm = vec4(texture(normals, uv).rgb, step(.7, col.a));
}
`

const diffuseFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D bg, fg, ao;

void main() {
	vec4 f = texture(fg, uv);
	vec3 a = texture(bg, uv).rgb * (1. - texture(ao, uv).r * vec3(1. ,.9, .8));
	col = vec4(mix(a, f.rgb, f.a), 1.);
}
`

const blurFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex;
uniform vec2 dir;

void main() {
	col = .114 * (texture(tex, uv) +
		texture(tex, vec2(uv - 4. * dir)) +
		texture(tex, vec2(uv - 3. * dir)) +
		texture(tex, vec2(uv - 2. * dir)) +
		texture(tex, vec2(uv - 1. * dir)) +
		texture(tex, vec2(uv + 1. * dir)) +
		texture(tex, vec2(uv + 2. * dir)) +
		texture(tex, vec2(uv + 3. * dir)) +
		texture(tex, vec2(uv + 4. * dir)));
}`

const lightVertex = `${preamble}
layout(location=0) in vec2 vp;
layout(location=1) in vec4 lpos;
layout(location=2) in vec4 col;
flat out vec4 pos;
flat out vec3 lc;
out vec2 uv;
uniform vec2 scroll;

void main() {
	lc = col.rgb * col.a;
	pos = vec4(lpos.xy - scroll, lpos.zw);

	vec2 p = ((vp * pos.w + pos.xy) / res) * 2. - 1.;
 	uv = p * .5 + .5;

	gl_Position = vec4(p, 0., 1.);
}
`

const lightFragment = `${preamble}
out vec4 col;
in vec2 uv;
flat in vec4 pos;
flat in vec3 lc;
uniform sampler2D tex, normals;

vec3 light(vec3 t, vec3 normal, float se) {
	vec3 ld = vec3(pos.xy - gl_FragCoord.xy, pos.z);
	float dn = max(dot(normal, normalize(ld)), 0.);

	float a = max(0., 1. - (length(ld) / pos.w));
	a *= a;

	vec3 d = lc * dn * a;
	vec3 s = lc * pow(dn, .5 + se * 128.) * a;

	return t * d + s;
}

void main() {
	vec4 t = texture(tex, uv);
	vec4 n = texture(normals, uv);
	n.xy = n.xy * 2. - 1.;
	vec3 normal = normalize(vec3(n.xy, sqrt(1. - dot(n.xy, n.xy))));
	col = vec4(light(t.rgb, normal, n.z), 1.);
}
`

const ambientFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex, normals;

void main() {
	vec4 t = texture(tex, uv);
	vec4 n = texture(normals, uv);
	n.xy = n.xy * 2. - 1.;
	vec3 normal = normalize(vec3(n.xy, sqrt(1. - dot(n.xy, n.xy))));
	col = vec4(vec3(.2, .175, .15) * t.rgb * max(dot(normal, vec3(.5, -.5, .7)), 0.), t.a);
}
`

const screenVertex = `${preamble}
layout(location=0) in vec2 vp;
layout(location=1) in vec2 tc;
out vec2 uv;

void main() {
	uv = tc;
	vec2 p = (vp / res) * 2. - 1.;
	gl_Position = vec4(p * vec2(1., -1.), 0., 1.);
}
`

const tonemap = `
vec4 tm(vec4 col) {
    vec3 m = 1. - exp(-col.rgb * vec3(1.5));
	return vec4(clamp(m, 0., 1.), 1.);
}
`

const playerVertex = `${preamble}
layout(location=0) in vec2 vp;
layout(location=1) in vec2 tc;
out vec4 uv;
flat out vec2 offs;
uniform vec2 pos, scroll;

void main() {
	uv = vec4(tc, 20., 19.);
	offs = fract(pos * .012);
	vec2 p = ((vp + (pos - scroll)) / res) * 2. - 1.;
	gl_Position = vec4(p, 0., 1.);
}
`

const playerFragment = `${preamble}
out vec4 col;
in vec4 uv;
flat in vec2 offs;
uniform sampler2DArray tex;

void main() {
	vec2 p = uv.xy * 2. - 1.;
	float r = dot(p, p);
	float f = (1. - sqrt(1. - r)) / r;
	float a = texture(tex, uv.xyw).a;
	col = vec4(texture(tex, vec3(p * f - offs, uv.z)).rgb * a, a);
}
`

const screenFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex;
${tonemap}

void main() {
	col = tm(texture(tex, uv));
}
`

const transitionFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex;
${tonemap}
uniform vec3 pos;

void main() {
	float d = distance(pos.xy, gl_FragCoord.xy);
	if(d > pos.z)
		discard;
	vec4 p = texture(tex, uv);
	d /= pos.z;
	d *= d;
	float dist = 1. + (cos(d * 5.) * .5 + .5) * d * .05;
	float aber = pow(d, 8.) * .05;
	float r = texture(tex, uv * dist + vec2(aber)).r;
	float g = texture(tex, uv * dist).g;
	float b = texture(tex, uv * dist - vec2(aber)).b;
	vec4 t = clamp(vec4(r, g, b, 1. - d) * (1. + 400. * aber), 0., 1.);
	col = tm(mix(p, t, d));
}
`

const rippleFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex;
${tonemap}
uniform vec3 pos;

void main() {
	float d = abs(length(gl_FragCoord.xy - pos.xy) - pos.z - 30.);
	d = abs(clamp(d, -60., 60.) / 60.);
	vec4 p = texture(tex, uv);
	float dist = 1. + (cos(d * 5.) * .5 + .5) * d * .25;
	vec4 t = texture(tex, uv * dist) * 2.;
	col = tm(mix(t, p, d));
}
`

const rewindFragment = `${preamble}
out vec4 col;
in vec2 uv;
uniform sampler2D tex;
${tonemap}
uniform float time;

void main() {
	float t = 1. - abs(cos(time * 3.141));
	vec2 d = vec2(uv.x + t * .15 * cos(time * 8. + uv.y * 8.), uv.y);
	col = tm(texture(tex, d)) + vec4(t);
}
`

export default {
	defaultVertex,
	screenVertex,
	screenFragment,
	aoFragment,
	tileVertex,
	tileFragment,
	lightVertex,
	lightFragment,
	blurFragment,
	diffuseFragment,
	ambientFragment,
	playerVertex,
	playerFragment,
	transitionFragment,
	rippleFragment,
	rewindFragment,
}
