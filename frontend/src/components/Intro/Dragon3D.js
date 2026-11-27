import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * The intro dragon in real 3D (Three.js), built from geometry in code: a sleek,
 * regal female dragon in a monochrome blue palette (#e3f2fd ... #0a3d91).
 * Side-on and facing right, turned a little toward the camera:
 *  - one tapered body from the spiral tail through hips, a deep chest and an
 *    S-curved neck, with scales (bump map) and cream belly plates (vertex colours)
 *  - a wedge-shaped reptile head: brow ridges, swept horns, cheek frills,
 *    cute glowing sky-blue eyes, nostrils, and a hinged jaw with teeth
 *  - dorsal spikes and a mane, spikes around the tail curl
 *  - four clawed legs (forelegs at the chest, hind legs at the hips)
 *  - two bat wings at the shoulder blades: bones plus glowing ice-blue membranes
 *    (deeper blue at the edges) with veins; they light up on each downstroke
 *
 * The canvas is bigger than the dragon's box (see OVERSCAN) so wings never clip.
 * `mouth` gives where the mouth is, as a fraction of the dragon's box, so the
 * fire can start there. Call setFiring(bool), setActive(bool) and dispose().
 */

export const OVERSCAN = 0.3; // canvas extends this fraction of the box on every side
const SPAN = 1 + OVERSCAN * 2;
// The dragon's box in world units (matches the box's 1301 x 729 aspect).
const BOX_W = 9.8;
const BOX_H = (BOX_W * 729) / 1301;
const BOX_CX = -0.55;
const BOX_CY = 0.45;

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- procedural textures ----------
/**
 * Dragon scales: overlapping rounded scales in staggered rows. Along the
 * texture's x (the body's length, tail -> head) each scale's free, rounded edge
 * points back toward the tail and lies over the scale behind it. Returns a
 * colour map (bright centres, darker blue edges, so the pattern shows in
 * colour) and a matching bump map (raised scales). Tiles seamlessly.
 */
function scaleTextures() {
  const S = 256, COLS = 2, ROWS = 3;
  const w = S / COLS, h = S / ROWS;
  const make = (bg, fill, edge, line) => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d");
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);
    // tail side first, so scales nearer the head overlap the ones behind them
    for (let col = -1; col <= COLS; col++) {
      for (let row = -1; row <= ROWS; row++) {
        const cx = col * w + w * 0.5;
        const cy = row * h + (col % 2 ? h * 0.5 : 0) + h * 0.5;
        for (const [ox, oy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]) {
          const px = cx + ox, py = cy + oy;
          if (px < -w || px > S + w || py < -h || py > S + h) continue;
          // a rounded "D": attached on the head side (right), free edge on the left
          x.beginPath();
          x.ellipse(px, py, w * 0.64, h * 0.6, 0, Math.PI / 2, (Math.PI * 3) / 2);
          x.lineTo(px + w * 0.5, py - h * 0.6);
          x.lineTo(px + w * 0.5, py + h * 0.6);
          x.closePath();
          const g = x.createRadialGradient(px - w * 0.15, py - h * 0.12, 2, px, py, w * 0.7);
          g.addColorStop(0, fill[0]);
          g.addColorStop(0.65, fill[1]);
          g.addColorStop(1, fill[2]);
          x.fillStyle = g;
          x.fill();
          // dark rim along the free edge
          x.beginPath();
          x.ellipse(px, py, w * 0.64, h * 0.6, 0, Math.PI / 2, (Math.PI * 3) / 2);
          x.strokeStyle = edge;
          x.lineWidth = line;
          x.stroke();
        }
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  };
  const colorMap = make("#9db0d6", ["#ffffff", "#e9f0fb", "#bccbe8"], "#4a64a8", 3);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = make("#555555", ["#ffffff", "#c8c8c8", "#8a8a8a"], "#2c2c2c", 3.5);
  return { colorMap, bumpMap };
}

// A wispy ribbon flame: ice-white core (#e3f2fd, #bbdefb) to electric-blue
// edges (#42a5f5, #2196f3), fading out; three licking tongues at the top.
function flameTexture() {
  const W = 128, H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  const tongue = (cx, top, wid, curl) => {
    x.beginPath();
    x.moveTo(cx - wid, H - 6);
    x.bezierCurveTo(cx - wid * 1.1, H * 0.55, cx - wid * 0.2 + curl, H * 0.35, cx + curl * 1.6, top);
    x.bezierCurveTo(cx + wid * 0.5 + curl, H * 0.4, cx + wid * 1.1, H * 0.6, cx + wid, H - 6);
    x.closePath();
  };
  const paint = (alpha) => {
    const g = x.createRadialGradient(W / 2, H * 0.78, 4, W / 2, H * 0.62, H * 0.62);
    g.addColorStop(0, `rgba(227, 242, 253, ${alpha})`);
    g.addColorStop(0.2, `rgba(187, 222, 251, ${alpha})`);
    g.addColorStop(0.45, `rgba(66, 165, 245, ${alpha})`);
    g.addColorStop(0.75, `rgba(33, 150, 243, ${alpha * 0.85})`);
    g.addColorStop(1, "rgba(33, 150, 243, 0)");
    x.fillStyle = g;
    x.fill();
  };
  x.filter = "blur(3px)";
  tongue(W * 0.5, 4, W * 0.34, 10); paint(0.95);
  tongue(W * 0.36, H * 0.28, W * 0.18, -8); paint(0.7);
  tongue(W * 0.66, H * 0.2, W * 0.16, 12); paint(0.7);
  x.filter = "none";
  // bright core
  tongue(W * 0.5, H * 0.4, W * 0.14, 4);
  const core = x.createLinearGradient(0, H, 0, H * 0.35);
  core.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  core.addColorStop(1, "rgba(227, 242, 253, 0)");
  x.fillStyle = core;
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function membraneTexture(shapePts, tips, wrist, bounds) {
  // golden membrane: brighter in the middle, with fine veins between the fingers
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  const px = (p) => [((p.x - bounds.minX) / bounds.w) * W, (1 - (p.y - bounds.minY) / bounds.h) * H];
  const g = x.createRadialGradient(W * 0.62, H * 0.55, 20, W * 0.6, H * 0.5, W * 0.65);
  g.addColorStop(0, "#42a5f5");
  g.addColorStop(0.4, "#1e88e5");
  g.addColorStop(0.72, "#1565c0");
  g.addColorStop(1, "#0d47a1");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const [wx, wy] = px(wrist);
  x.lineCap = "round";
  for (let i = 0; i < tips.length - 1; i++) {
    const [ax, ay] = px(tips[i]);
    const [bx, by] = px(tips[i + 1]);
    for (let k = 1; k <= 4; k++) {
      const t = k / 5;
      const sx = lerp(wx, ax, 0.2 + t * 0.7), sy = lerp(wy, ay, 0.2 + t * 0.7);
      const ex = lerp(wx, bx, 0.25 + t * 0.7), ey = lerp(wy, by, 0.25 + t * 0.7);
      x.strokeStyle = "rgba(187, 222, 251, 0.4)";
      x.lineWidth = 1.4;
      x.beginPath();
      x.moveTo(sx, sy);
      x.quadraticCurveTo((sx + ex) / 2 + 14 * Math.sin(k * 7 + i), (sy + ey) / 2 + 18, ex, ey);
      x.stroke();
      x.strokeStyle = "rgba(10, 61, 145, 0.25)";
      x.lineWidth = 1;
      x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- geometry helpers ----------
/**
 * A tube along a curve whose cross-section is an ellipse that changes along it.
 * Frames use +Z as the side direction, so a curve drawn in the XY plane never
 * twists. radius(t) returns [inPlane, depth]. Vertex colours: belly underneath.
 */
function taperedTube(points, radius, { segments = 160, radial = 28, belly = null, uvRepeat = [8, 1] } = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const pos = [], nor = [], uv = [], col = [], idx = [];
  const side = V(0, 0, 1);
  const pearl = new THREE.Color("#1565c0"); // back
  const lav = new THREE.Color("#42a5f5"); // lower sides
  const cream = new THREE.Color("#e3f2fd"); // belly plates
  const plate = new THREE.Color("#bbdefb"); // plate seams
  const frames = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const T = curve.getTangent(t).normalize();
    const B = side.clone().sub(T.clone().multiplyScalar(side.dot(T))).normalize();
    const N = new THREE.Vector3().crossVectors(B, T).normalize(); // in-plane, toward the back
    frames.push({ p, T, N, B });
    const [ry, rz] = radius(t);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const cy = Math.cos(a), cz = Math.sin(a);
      const v = p.clone().add(N.clone().multiplyScalar(cy * ry)).add(B.clone().multiplyScalar(cz * rz));
      pos.push(v.x, v.y, v.z);
      const n = N.clone().multiplyScalar(cy / Math.max(ry, 1e-4)).add(B.clone().multiplyScalar(cz / Math.max(rz, 1e-4))).normalize();
      nor.push(n.x, n.y, n.z);
      uv.push(t * uvRepeat[0], (j / radial) * uvRepeat[1]);
      // belly: the side opposite the back (cy < 0), with plate bands along the length
      let c = pearl.clone().lerp(lav, Math.min(1, Math.max(0, 0.35 - cy * 0.6) + Math.abs(cz) * 0.1));
      if (belly && belly(t) && cy < -0.35) {
        const band = Math.sin(t * segments * 0.9) > 0.55 ? plate : cream;
        c = c.lerp(band, Math.min(1, (-cy - 0.35) * 2.4));
      }
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1); // outward-facing (front faces outside)
    }
  }
  // close both ends (no open pipe rims where limbs meet the body)
  for (const [ring, sign] of [[0, -1], [segments, 1]]) {
    const { p, T } = frames[ring];
    const centre = pos.length / 3;
    pos.push(p.x, p.y, p.z);
    nor.push(T.x * sign, T.y * sign, T.z * sign);
    uv.push(ring === 0 ? 0 : uvRepeat[0], 0.5);
    const base = ring * (radial + 1);
    col.push(col[base * 3], col[base * 3 + 1], col[base * 3 + 2]);
    for (let j = 0; j < radial; j++) idx.push(centre, base + j, base + j + 1, centre, base + j + 1, base + j); // both windings
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  return { geo, curve, frames };
}

function spike(len, r, mat) {
  const g = new THREE.ConeGeometry(r, len, 10, 1);
  g.translate(0, len / 2, 0); // base at the origin, pointing +Y
  return new THREE.Mesh(g, mat);
}
// point a mesh's +Y along dir
function aim(mesh, dir) {
  mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  return mesh;
}

export default class Dragon3D {
  constructor(host) {
    this.host = host;
    this.active = true;
    this.firing = false;
    this.jaw = 0;
    this.mouth = { x: 0.81, y: 0.33 };
    this.t0 = performance.now();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    this.renderer = renderer;
    renderer.domElement.className = "intro__dragon-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    this.scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    scene.environment = this.envTex;
    pmrem.dispose();

    // studio light: warm key from the upper front, cool blue rim from behind
    const key = new THREE.DirectionalLight("#fff1d6", 2.0);
    key.position.set(3, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#9fb8ff", 2.4);
    rim.position.set(-6, 3, -6);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight("#dfe6ff", "#5a4a30", 0.35));

    this.camera = new THREE.PerspectiveCamera(30, 1301 / 729, 0.1, 100);
    const viewH = BOX_H * SPAN;
    const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(15));
    this.camera.position.set(BOX_CX, BOX_CY + 0.6, dist);
    this.camera.lookAt(BOX_CX, BOX_CY, 0);

    this.build();
    this.fit();
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.loop = this.loop.bind(this);
    this.frame = requestAnimationFrame(this.loop);
  }

  build() {
    // dragon scales on the body and legs (tube UVs), and smaller tiling on the
    // head, feet and wing bones (sphere/other UVs)
    const { colorMap, bumpMap } = scaleTextures();
    const headColor = colorMap.clone();
    const headBump = bumpMap.clone();
    for (const t of [headColor, headBump]) {
      t.repeat.set(9, 5);
      t.needsUpdate = true;
    }
    this.disposables = [colorMap, bumpMap, headColor, headBump];
    const pearl = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      vertexColors: true,
      map: colorMap,
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.45,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.5,
      bumpMap,
      bumpScale: 2.4,
    });
    const legMat = new THREE.MeshPhysicalMaterial({ color: "#1976d2", map: colorMap, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.35, envMapIntensity: 0.5, bumpMap, bumpScale: 2.4 });
    const pearlPlain = new THREE.MeshPhysicalMaterial({ color: "#1976d2", map: headColor, sheen: 0.6, sheenColor: new THREE.Color("#bbdefb"), roughness: 0.42, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.35, envMapIntensity: 0.5, bumpMap: headBump, bumpScale: 1.6 });
    const jawMat = new THREE.MeshPhysicalMaterial({ color: "#1e88e5", roughness: 0.4, clearcoat: 0.5 });
    const bellyMat = new THREE.MeshPhysicalMaterial({ color: "#bbdefb", roughness: 0.45, clearcoat: 0.3 });
    const ivory = new THREE.MeshPhysicalMaterial({ color: "#e3f2fd", roughness: 0.25, clearcoat: 0.8 }); // teeth
    const hornMat = new THREE.MeshPhysicalMaterial({ color: "#0d47a1", roughness: 0.22, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.15 });
    const spikeMat = new THREE.MeshPhysicalMaterial({ color: "#bbdefb", emissive: "#64b5f6", emissiveIntensity: 0.18, roughness: 0.25, clearcoat: 0.8, sheen: 1, sheenColor: new THREE.Color("#e3d8ff") });
    const dark = new THREE.MeshStandardMaterial({ color: "#2a1a2a", roughness: 0.6 });
    // fierce almond eyes that glow ice-white (#e3f2fd), with a slit pupil
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: "#e3f2fd", emissive: "#e3f2fd", emissiveIntensity: 1.8, roughness: 0.1, clearcoat: 1 });
    const eyeRimMat = new THREE.MeshStandardMaterial({ color: "#0a3d91", roughness: 0.45 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: "#0a3d91", roughness: 0.25 });
    const lidMat = new THREE.MeshPhysicalMaterial({ color: "#1565c0", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    const shadowMat = new THREE.MeshPhysicalMaterial({ color: "#0d47a1", roughness: 0.4, transparent: true, opacity: 0.6, depthWrite: false });
    const irisMat = new THREE.MeshPhysicalMaterial({ color: "#42a5f5", emissive: "#64b5f6", emissiveIntensity: 1.6, roughness: 0.1, clearcoat: 1 });
    const blushMat = new THREE.MeshPhysicalMaterial({ color: "#bbdefb", roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false });
    const glintMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const clawMat = new THREE.MeshPhysicalMaterial({ color: "#0a3d91", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
    const mouthMat = new THREE.MeshStandardMaterial({ color: "#3a1424", roughness: 0.7 });
    const tongueMat = new THREE.MeshPhysicalMaterial({ color: "#d4607a", roughness: 0.4, clearcoat: 0.5 });
    this.mats = [lidMat, shadowMat, irisMat, blushMat, jawMat, pearl, legMat, pearlPlain, bellyMat, ivory, hornMat, spikeMat, dark, eyeMat, eyeRimMat, pupilMat, glintMat, clawMat, mouthMat, tongueMat];
    this.clawMat = clawMat;
    this.footMat = pearlPlain;

    const dragon = new THREE.Group();
    dragon.rotation.y = -0.2; // head turned a little toward the camera
    dragon.rotation.z = 0.03;
    this.scene.add(dragon);
    this.dragon = dragon;

    // ----- body: tail spiral -> hips -> chest -> neck -> head base -----
    const spinePts = [
      [-3.47, -0.27], [-3.58, -0.4], [-3.52, -0.58], [-3.32, -0.66], [-3.09, -0.49], [-3.03, -0.16], [-3.24, 0.18], [-3.68, 0.38],
      [-4.24, 0.36], [-4.74, 0.06], [-5.0, -0.44], [-4.9, -1.04], [-4.44, -1.54], [-3.68, -1.82], [-2.8, -1.86], [-1.9, -1.62],
      [-1.1, -1.13], [-0.5, -0.55], [0.05, -0.12], [0.62, 0.02], [1.25, 0.16], [1.85, 0.3], [2.3, 0.62], [2.55, 1.05], [2.58, 1.5], [2.48, 1.92], [2.62, 2.3], [2.95, 2.52],
    ].map(([x, y], i, a) => V(x, y, (i / a.length - 0.6) * 0.5)); // tail curls slightly away
    const radii = [0.022, 0.03, 0.038, 0.045, 0.05, 0.056, 0.062, 0.07, 0.078, 0.088, 0.1, 0.115, 0.135, 0.165, 0.21, 0.27, 0.36, 0.47, 0.6, 0.44, 0.7, 0.8, 0.52, 0.36, 0.29, 0.25, 0.23, 0.21];
    const n = spinePts.length - 1;
    const radiusAt = (t) => {
      const f = t * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
      const r = lerp(radii[i], radii[i + 1], k);
      const torso = t > 0.62 && t < 0.82; // athletic: narrower side to side
      return [r, r * (torso ? 0.76 : 0.9)];
    };
    const body = taperedTube(spinePts, radiusAt, { segments: 260, radial: 30, belly: (t) => t > 0.58, uvRepeat: [64, 9] });
    const bodyMesh = new THREE.Mesh(body.geo, pearl);
    dragon.add(bodyMesh);
    this.disposables.push(body.geo);

    // dorsal spikes (bigger over the shoulders and along the neck = the mane), tail-curl spikes
    const frameAt = (t) => body.frames[Math.round(t * (body.frames.length - 1))];
    const addSpikes = (from, to, count, len, r, sweep, mat = spikeMat, sideOff = 0) => {
      for (let i = 0; i <= count; i++) {
        const t = lerp(from, to, i / count);
        const { p, T, N, B } = frameAt(t);
        const [ry] = radiusAt(t);
        const dir = N.clone().multiplyScalar(Math.cos(sweep)).add(T.clone().multiplyScalar(-Math.sin(sweep)));
        const L = len(t, i) * 1.35;
        const m = aim(spike(L, r(t), mat), dir);
        m.position.copy(p).add(N.clone().multiplyScalar(ry * 0.94)).add(B.clone().multiplyScalar(sideOff));
        dragon.add(m);
      }
    };
    addSpikes(0.12, 0.42, 20, (t, i) => 0.1 + (i % 3) * 0.04 + t * 0.1, () => 0.026, 0.65); // small spines along the tail curl

    // Wispy blue elemental flames: along the crest of the neck, cascading down
    // the spine, and a plume at the tip of the tail. Each is two crossed
    // ribbon-flame cards (ice-white core, electric-blue edges) that flicker.
    const flameTex = flameTexture();
    const flameMat = new THREE.MeshBasicMaterial({ map: flameTex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const flameGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    flameGeo.translate(0, 0.5, 0);
    this.disposables.push(flameTex, flameMat, flameGeo);
    this.flames = [];
    const addFlame = (pos, dir, len, wid) => {
      const holder = aim(new THREE.Group(), dir);
      holder.position.copy(pos);
      const inner = new THREE.Group();
      for (const ry of [0, Math.PI / 2]) {
        const m = new THREE.Mesh(flameGeo, flameMat);
        m.rotation.y = ry;
        m.renderOrder = 2;
        inner.add(m);
      }
      inner.scale.set(wid, len, wid);
      holder.add(inner);
      dragon.add(holder);
      this.flames.push({ inner, len, wid, ph: Math.random() * Math.PI * 2, sp: 5 + Math.random() * 3 });
    };
    const dorsal = (t, sweep) => {
      const { p, T, N } = frameAt(t);
      const [ry] = radiusAt(t);
      return { pos: p.clone().add(N.clone().multiplyScalar(ry * 0.9)), dir: N.clone().multiplyScalar(Math.cos(sweep)).add(T.clone().multiplyScalar(-Math.sin(sweep))) };
    };
    for (let i = 0; i <= 16; i++) { // neck crest: taller, flowing back
      const t = lerp(0.835, 0.99, i / 16);
      const { pos, dir } = dorsal(t, 1.0);
      addFlame(pos, dir, 0.78 + 0.22 * Math.sin(i * 1.7) - (t - 0.835) * 1.6, 0.34);
    }
    for (let i = 0; i <= 18; i++) { // down the spine to the hips
      const t = lerp(0.6, 0.83, i / 18);
      const { pos, dir } = dorsal(t, 0.95);
      addFlame(pos, dir, 0.55 + 0.16 * Math.sin(i * 2.3), 0.3);
    }
    for (let k = 0; k < 7; k++) { // plume at the tip of the tail
      const f0 = body.frames[Math.min(body.frames.length - 1, k * 2)];
      const a = -0.6 + k * 0.25;
      const dir = f0.T.clone().negate().multiplyScalar(Math.cos(a)).add(f0.N.clone().multiplyScalar(Math.sin(a)));
      addFlame(f0.p.clone(), dir, 0.85 + (k % 3) * 0.2, 0.42);
    }

    // ----- head: an elegant, pretty dragon head, pointing +X -----
    const head = new THREE.Group();
    const neckEnd = body.frames[body.frames.length - 1];
    head.position.copy(neckEnd.p);
    head.rotation.z = -0.16; // nose a little down
    head.scale.setScalar(1.42);
    dragon.add(head);
    this.head = head;

    const skullGeo = new THREE.SphereGeometry(1, 48, 32);
    {
      const a = skullGeo.attributes.position;
      const smooth = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
        // an elegant head: rounded forehead, gently curved bridge, a slim muzzle
        // that ends in a soft rounded tip (not a needle point)
        const xb = x > 0 ? Math.pow(x, 0.62) : x;
        const u = (xb + 1) / 2; // 0 = back of the skull, 1 = nose
        const X = lerp(-0.32, 0.82, u);
        const H = lerp(0.27, 0.11, smooth(0.28, 1, u));
        let Wd = lerp(0.23, 0.095, smooth(0.25, 1, u));
        // soft high cheekbones under the eyes
        Wd += 0.045 * Math.exp(-((u - 0.32) ** 2) / 0.01) * Math.exp(-(y * y) / 0.15);
        let Y = y * H;
        if (y > 0) {
          Y += 0.035 * Math.exp(-((u - 0.4) ** 2) / 0.008) * (0.4 + Math.abs(z)); // gentle brow
          Y += 0.018 * Math.sin(Math.PI * smooth(0.45, 1, u)); // softly curved bridge
        } else Y *= 0.5; // neat underside: the jaw line
        a.setXYZ(i, X, Y, z * Wd);
      }
      skullGeo.computeVertexNormals();
    }
    const skull = new THREE.Mesh(skullGeo, pearlPlain);
    skull.position.set(0.05, 0.04, 0);
    head.add(skull);
    this.disposables.push(skullGeo);

    // brow ridges and cheek plates
    for (const s of [1, -1]) {
      // Seductive almond eye: upswept toward the back, with a dark
      // winged liner, a glowing ice-blue iris (#e3f2fd centre to #42a5f5 edge),
      // a slim pupil, two sparkles and long lashes curling back.
      const ex = 0.15, ey = 0.115, ez = 0.215;
      const tilt = -0.2;
      const liner = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), eyeRimMat);
      liner.scale.set(0.13, 0.062, 0.04);
      liner.position.set(ex, ey, (ez - 0.004) * s);
      liner.rotation.z = tilt;
      head.add(liner);
      const wing = aim(spike(0.11, 0.013, eyeRimMat), V(-1, 0.48, 0.2 * s)); // long winged liner flick
      wing.position.set(ex - 0.11, ey + 0.022, (ez + 0.004) * s);
      head.add(wing);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), eyeMat);
      eye.scale.set(0.115, 0.051, 0.04);
      eye.position.set(ex, ey, (ez + 0.003) * s);
      eye.rotation.z = tilt;
      head.add(eye);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), irisMat);
      iris.scale.set(0.045, 0.045, 0.011);
      iris.position.set(ex + 0.018, ey - 0.006, (ez + 0.039) * s);
      head.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), pupilMat);
      pupil.scale.set(0.011, 0.032, 0.006);
      pupil.position.set(ex + 0.02, ey - 0.006, (ez + 0.047) * s);
      head.add(pupil);
      for (const [gx, gy, r] of [[0.026, -0.004, 0.007], [0.004, -0.018, 0.004]]) {
        const glint = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), glintMat);
        glint.position.set(ex + gx, ey + gy, (ez + 0.05) * s);
        head.add(glint);
      }
      for (let k = 0; k < 6; k++) { // long, full lashes sweeping back from the lowered lid
        const lash = aim(spike(0.11 - k * 0.012, 0.0075, eyeRimMat), V(-0.95 - k * 0.12, 0.62 + k * 0.1, 0.45 * s));
        lash.position.set(ex - 0.09 + k * 0.026, ey + 0.03 - k * 0.002, (ez + 0.038) * s);
        head.add(lash);
      }
      // Sultry, half-lidded look: the upper lid lowers over the top of the eye
      // and the lower lid lifts a little, narrowing it to a smouldering almond.
      const upperLid = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), lidMat);
      upperLid.scale.set(0.122, 0.058, 0.044);
      upperLid.position.set(ex, ey - 0.006, (ez + 0.002) * s);
      upperLid.rotation.z = tilt - 0.06;
      head.add(upperLid);
      const lowerLid = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28), lidMat);
      lowerLid.scale.set(0.118, 0.046, 0.041);
      lowerLid.position.set(ex, ey + 0.008, (ez + 0.002) * s);
      lowerLid.rotation.z = tilt;
      head.add(lowerLid);
      // smoky deep-blue eyeshadow fading up the lid
      const shadow = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), shadowMat);
      shadow.scale.set(0.13, 0.045, 0.03);
      shadow.position.set(ex - 0.01, ey + 0.038, (ez + 0.012) * s);
      shadow.rotation.z = tilt - 0.08;
      head.add(shadow);
      const brow = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), pearlPlain);
      brow.scale.set(0.13, 0.018, 0.045);
      brow.position.set(ex - 0.01, ey + 0.058, (ez - 0.02) * s);
      brow.rotation.z = -0.12; // a soft arch, not a scowl
      head.add(brow);
      // a soft pale-blue blush along the cheek
      const blush = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), blushMat);
      blush.scale.set(0.11, 0.04, 0.02);
      blush.position.set(ex + 0.07, ey - 0.065, (ez - 0.02) * s);
      head.add(blush);
      // small, delicate nostril near the rounded tip
      const nos = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), dark);
      nos.scale.set(0.012, 0.006, 0.008);
      nos.position.set(0.77, 0.07, 0.05 * s);
      head.add(nos);
      // horns: a long pair sweeping back and up, a shorter pair below
      const horn = (pts, r0) => {
        const tube = taperedTube(pts.map(([x, y, z]) => V(x, y, z * s)), (t) => [r0 * (1 - t * 0.92), r0 * (1 - t * 0.92)], { segments: 40, radial: 12 });
        this.disposables.push(tube.geo);
        return new THREE.Mesh(tube.geo, hornMat);
      };
      // long, slender horns sweeping gracefully back
      head.add(horn([[-0.02, 0.17, 0.08], [-0.36, 0.29, 0.11], [-0.76, 0.4, 0.13], [-1.16, 0.56, 0.13], [-1.46, 0.8, 0.12]], 0.05));
      head.add(horn([[-0.1, 0.08, 0.13], [-0.42, 0.11, 0.17], [-0.74, 0.18, 0.19], [-0.96, 0.28, 0.19]], 0.03));
      // smaller swept-back cheek spines framing the jaw
      for (let k = 0; k < 3; k++) {
        const m = aim(spike(0.24 - k * 0.05, 0.018, hornMat), V(-1, -0.12 - k * 0.28, 0.3 * s));
        m.position.set(-0.14, -0.04 - k * 0.012, 0.12 * s);
        head.add(m);
      }
      // upper teeth (seen when the jaw opens)
      for (let k = 0; k < 6; k++) {
        const tooth = aim(spike(0.04, 0.01, ivory), V(0, -1, 0));
        tooth.position.set(0.34 + k * 0.08, -0.025, 0.08 * s * (1 - k * 0.07));
        head.add(tooth);
      }
    }
    // inside of the mouth: a dark cavity kept within the muzzle (it used to poke
    // out past the nose and read as a loose tongue)
    const mouthIn = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), mouthMat);
    mouthIn.scale.set(0.36, 0.03, 0.065);
    mouthIn.position.set(0.34, -0.03, 0);
    head.add(mouthIn);

    // lower jaw on a hinge at the back of the head
    const jawPivot = new THREE.Group();
    jawPivot.position.set(-0.12, -0.05, 0);
    head.add(jawPivot);
    const jawGeo = new THREE.SphereGeometry(1, 36, 20);
    {
      const a = jawGeo.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
        const fwd = (x + 1) / 2; // 0 at the hinge, 1 at the chin
        a.setXYZ(i, fwd * 0.8, y * 0.055 * (1 - fwd * 0.4) - 0.005, z * 0.15 * (1 - fwd * 0.45));
      }
      jawGeo.computeVertexNormals();
    }
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jawPivot.add(jaw);
    for (const s of [1, -1])
      for (let k = 0; k < 5; k++) {
        const tooth = aim(spike(0.04, 0.011, ivory), V(0, 1, 0));
        tooth.position.set(0.42 + k * 0.085, -0.02, 0.06 * s * (1 - k * 0.1));
        jawPivot.add(tooth);
      }
    // dark inside of the open mouth: hinged at the jaw joint, it opens half as
    // far as the jaw so the gap between the jaws is filled
    const mouthFill = new THREE.Group();
    mouthFill.position.copy(jawPivot.position);
    head.add(mouthFill);
    const fill = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), mouthMat);
    fill.scale.set(0.4, 0.045, 0.065);
    fill.position.set(0.4, 0.005, 0);
    mouthFill.add(fill);
    this.mouthFill = mouthFill;
    // the tongue lies on the floor of the lower jaw and moves with it
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), tongueMat);
    tongue.scale.set(0.25, 0.02, 0.06);
    tongue.position.set(0.44, 0.02, 0);
    jawPivot.add(tongue);
    this.jawPivot = jawPivot;
    this.disposables.push(jawGeo);

    // where the fire comes from
    this.mouthAnchor = new THREE.Object3D();
    this.mouthAnchor.position.set(0.82, -0.03, 0);
    head.add(this.mouthAnchor);

    // ----- legs -----
    // A real foot: a padded sole, three spread toes forward and one back, each
    // ending in a curved dark claw (they read clearly against the cream page).
    const foot = (at, dir, s, size) => {
      const f = new THREE.Group();
      f.position.copy(at);
      f.rotation.z = Math.atan2(dir[1], dir[0]); // toes point along dir
      dragon.add(f);
      const pad = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), this.footMat);
      pad.scale.set(0.14 * size, 0.065 * size, 0.11 * size);
      pad.position.set(0.06 * size, 0, 0);
      f.add(pad);
      const toe = (angle, len, back = false) => {
        const dx = Math.cos(angle), dz = Math.sin(angle) * s;
        const start = V(0.1 * size * (back ? -0.6 : 1), -0.01, dz * 0.06 * size);
        const end = start.clone().add(V(dx * len * size * (back ? -1 : 1), -0.035 * size, dz * len * size));
        const mid = start.clone().lerp(end, 0.5).add(V(0, 0.025 * size, 0)); // knuckle arch
        const tube = taperedTube([start, mid, end], (t) => [lerp(0.042, 0.026, t) * size, lerp(0.042, 0.026, t) * size], { segments: 16, radial: 12 });
        this.disposables.push(tube.geo);
        f.add(new THREE.Mesh(tube.geo, this.footMat));
        // curved claw: a cone that points along the toe, then hooks down
        const claw = spike(0.11 * size, 0.026 * size, this.clawMat);
        const dirv = end.clone().sub(mid).normalize();
        aim(claw, dirv.clone().add(V(0, -0.55, 0)));
        claw.position.copy(end);
        f.add(claw);
        const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.03 * size, 12, 8), this.footMat);
        knuckle.position.copy(end);
        f.add(knuckle);
      };
      toe(-0.45, 0.17);
      toe(0, 0.2);
      toe(0.45, 0.17);
      toe(0.2, 0.09, true); // dewclaw at the back
    };
    for (const s of [1, -1]) {
      const z = 0.4 * s;
      // hind leg: big thigh at the hip, shin back, foot forward
      const hind = taperedTube([V(0.14, 0.08, -z * 0.3), V(-0.08, -0.52, z * 0.8), V(-0.3, -0.98, z), V(-0.58, -1.3, z * 1.05), V(-0.56, -1.6, z * 1.05)], (t) => { const r = t < 0.32 ? lerp(0.34, 0.2, t / 0.32) : lerp(0.17, 0.055, (t - 0.32) / 0.68); return [r, r * 0.85]; }, { segments: 50, radial: 18, uvRepeat: [6, 2] });
      this.disposables.push(hind.geo);
      dragon.add(new THREE.Mesh(hind.geo, legMat));
      foot(V(-0.56, -1.64, z * 1.05), [1, -0.3], s, 1.1);
      // foreleg: from the chest, elbow back, forearm down, curled hand
      const fore = taperedTube([V(1.8, 0.3, -z * 0.3), V(2.1, -0.34, z * 0.82), V(2.04, -0.94, z), V(2.2, -1.22, z)], (t) => { const r = t < 0.35 ? lerp(0.28, 0.14, t / 0.35) : lerp(0.13, 0.048, (t - 0.35) / 0.65); return [r, r * 0.85]; }, { segments: 40, radial: 16, uvRepeat: [5, 2] });
      this.disposables.push(fore.geo);
      dragon.add(new THREE.Mesh(fore.geo, legMat));
      foot(V(2.21, -1.26, z), [1, -0.55], s, 0.95);
    }

    // ----- wings: slender bones + translucent blue membrane, at the shoulder blades -----
    const shoulder = V(1.5, 0.98, 0);
    const P = (x, y) => new THREE.Vector2(x * 1.08, y * 1.08);
    const elbow = P(-0.8, 0.64), wrist = P(-1.36, 2.58);
    const tips = [P(-7.26, 2.7), P(-6.42, 1.42), P(-5.26, 0.64), P(-3.3, -0.36), P(-1.92, -0.28)];
    const root = P(-1.35, -0.78); // the membrane reaches down to her flanks
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo((elbow.x) / 2 + 0.05, elbow.y / 2 - 0.07, elbow.x, elbow.y);
    shape.quadraticCurveTo((elbow.x + wrist.x) / 2 + 0.12, (elbow.y + wrist.y) / 2, wrist.x, wrist.y);
    shape.quadraticCurveTo((wrist.x + tips[0].x) / 2, (wrist.y + tips[0].y) / 2 + 0.4, tips[0].x, tips[0].y);
    for (let i = 1; i < tips.length; i++) {
      const a = tips[i - 1], b = tips[i];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      shape.quadraticCurveTo(lerp(mx, wrist.x, 0.48), lerp(my, wrist.y, 0.48), b.x, b.y); // deep scallops
    }
    shape.quadraticCurveTo((tips[4].x + root.x) / 2, (tips[4].y + root.y) / 2 - 0.12, root.x, root.y);
    shape.quadraticCurveTo(root.x / 2, root.y / 2 - 0.05, 0, 0);
    const memGeo = new THREE.ShapeGeometry(shape, 24);
    memGeo.computeBoundingBox();
    const bb = memGeo.boundingBox;
    const bounds = { minX: bb.min.x, minY: bb.min.y, w: bb.max.x - bb.min.x, h: bb.max.y - bb.min.y };
    {
      const a = memGeo.attributes.position, u = memGeo.attributes.uv;
      for (let i = 0; i < a.count; i++) u.setXY(i, (a.getX(i) - bounds.minX) / bounds.w, (a.getY(i) - bounds.minY) / bounds.h);
      // a gentle billow, so the membrane isn't flat
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i), y = a.getY(i);
        a.setZ(i, 0.12 * Math.sin(((x - bounds.minX) / bounds.w) * Math.PI) * Math.sin(((y - bounds.minY) / bounds.h) * Math.PI));
      }
      memGeo.computeVertexNormals();
    }
    const memTex = membraneTexture(null, tips, wrist, bounds);
    const memMat = new THREE.MeshPhysicalMaterial({
      map: memTex,
      emissive: "#42a5f5",
      emissiveMap: memTex,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      transparent: true,
      opacity: 0.94, // a hint of translucency, but layers no longer stack up
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    const farMemMat = memMat.clone();
    farMemMat.color = new THREE.Color("#9fb3d6"); // tints the far wing darker
    farMemMat.emissiveIntensity = 0.15;
    this.disposables.push(memGeo, memTex, memMat, farMemMat);
    this.farMemMat = farMemMat;
    this.memMat = memMat;

    const makeWing = (s) => {
      const pivot = new THREE.Group();
      pivot.position.copy(shoulder).add(V(0, 0, 0.42 * s));
      const wing = new THREE.Group();
      pivot.add(wing);
      const mem = new THREE.Mesh(memGeo, s < 0 ? farMemMat : memMat);
      mem.renderOrder = s < 0 ? 0 : 1;
      wing.add(mem);
      const bone = (a, b, r0, r1, mid) => {
        const pts = [V(a.x, a.y, 0.02), mid ? V(mid.x, mid.y, 0.03) : V((a.x + b.x) / 2, (a.y + b.y) / 2, 0.03), V(b.x, b.y, 0.02)];
        const tube = taperedTube(pts, (t) => [lerp(r0, r1, t), lerp(r0, r1, t)], { segments: 30, radial: 12 });
        this.disposables.push(tube.geo);
        wing.add(new THREE.Mesh(tube.geo, pearlPlain));
      };
      bone(new THREE.Vector2(0, 0), elbow, 0.1, 0.065);
      bone(elbow, wrist, 0.065, 0.045, new THREE.Vector2((elbow.x + wrist.x) / 2 + 0.14, (elbow.y + wrist.y) / 2));
      tips.forEach((t, i) => {
        // each finger bows outward in a long curve
        const dx = t.x - wrist.x, dy = t.y - wrist.y, L = Math.hypot(dx, dy);
        const mid = new THREE.Vector2((wrist.x + t.x) / 2 + (dy / L) * 0.1, (wrist.y + t.y) / 2 - (dx / L) * 0.1 + (i === 0 ? 0.18 : 0));
        bone(wrist, t, i === 0 ? 0.042 : 0.032, 0.006, mid);
      });
      for (const p of [elbow, wrist]) {
        const j = new THREE.Mesh(new THREE.SphereGeometry(p === elbow ? 0.11 : 0.075, 16, 12), pearlPlain);
        j.position.set(p.x, p.y, 0.02);
        wing.add(j);
      }
      const thumb = aim(spike(0.26, 0.032, hornMat), V(0.25, 1, 0)); // sharp claw at the apex
      thumb.position.set(wrist.x, wrist.y, 0.03);
      wing.add(thumb);
      if (s < 0) wing.scale.z = -1; // the far wing is a mirror image
      dragon.add(pivot);
      return wing;
    };
    this.wingNear = makeWing(1);
    this.wingFar = makeWing(-1);
  }

  // Frame the camera so the dragon (wings raised) fills its box.
  fit() {
    this.wingNear.rotation.set(0.14, 0, -0.2);
    this.wingFar.rotation.set(-0.14, 0, -0.2);
    this.dragon.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.dragon);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const aspect = 1301 / 729;
    const w = Math.max(size.x, size.y * aspect) * 1.02;
    const viewH = (w / aspect) * SPAN;
    const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) + c.z;
    this.camera.position.set(c.x, c.y + 0.5, dist);
    this.camera.lookAt(c.x, c.y, c.z);
  }

  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setActive(on) {
    if (on === this.active) return;
    this.active = on;
    if (on) this.frame = requestAnimationFrame(this.loop);
    else cancelAnimationFrame(this.frame);
  }

  setFiring(on) {
    this.firing = on;
  }

  loop(now) {
    if (!this.active) return;
    this.frame = requestAnimationFrame(this.loop);
    const t = (now - this.t0) / 1000;
    const period = 1.45;
    const ph = (t / period) % 1;
    // a fast downstroke (0 -> 0.42) and a slower recovery
    const beat = ph < 0.42 ? 0.5 - 0.5 * Math.cos((ph / 0.42) * Math.PI) : 0.5 + 0.5 * Math.cos(((ph - 0.42) / 0.58) * Math.PI);
    // wings swing down from the shoulders (in the picture plane) and tip a little
    // toward/away from the camera, so the broad membranes stay in view
    // raised -> roughly level, plus a little twist toward/away from the camera;
    // kept small so the membrane never folds through the body or tail
    const swing = THREE.MathUtils.degToRad(lerp(-14, 20, beat));
    const tilt = THREE.MathUtils.degToRad(lerp(6, 24, beat));
    this.wingNear.rotation.set(tilt, 0, swing);
    this.wingFar.rotation.set(-tilt, 0, swing - THREE.MathUtils.degToRad(6));
    this.memMat.emissiveIntensity = 0.28 + beat * 0.3; // glows brighter on the downstroke
    this.farMemMat.emissiveIntensity = 0.12 + beat * 0.15;
    for (const f of this.flames) {
      // wispy flicker: stretch, sway and breathe
      const w = Math.sin(t * f.sp + f.ph);
      f.inner.scale.set(f.wid * (0.9 + 0.12 * Math.sin(t * f.sp * 1.7 + f.ph)), f.len * (0.82 + 0.26 * (0.5 + 0.5 * w)), f.wid);
      f.inner.rotation.z = 0.22 * Math.sin(t * f.sp * 0.6 + f.ph);
      f.inner.rotation.x = 0.12 * Math.cos(t * f.sp * 0.5 + f.ph);
    }
    // the wings carry the body: it rises on the downstroke
    this.dragon.position.y = lerp(-0.12, 0.16, beat);
    this.dragon.rotation.x = lerp(0.02, -0.03, beat);
    this.head.rotation.z = -0.16 + Math.sin(t * 2.1) * 0.03;
    // jaw
    this.jaw = lerp(this.jaw, this.firing ? 0.42 : 0, 0.18);
    this.jawPivot.rotation.z = -this.jaw;
    this.mouthFill.rotation.z = -this.jaw * 0.5;

    this.renderer.render(this.scene, this.camera);

    // mouth position as a fraction of the dragon's box (the canvas overscans it)
    const v = new THREE.Vector3();
    this.mouthAnchor.getWorldPosition(v);
    v.project(this.camera);
    this.mouth = { x: ((v.x + 1) / 2) * SPAN - OVERSCAN, y: ((1 - v.y) / 2) * SPAN - OVERSCAN };
  }

  dispose() {
    this.active = false;
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
    this.scene.traverse((o) => {
      if (o.isMesh) o.geometry.dispose();
    });
    for (const d of this.disposables) d.dispose?.();
    for (const m of this.mats) m.dispose();
    this.envTex.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
