// ==================== HERO 3D: đốm sáng & trái tim bay (Three.js) ====================
// Decorative WebGL layer over the hero photo: warm bokeh dots + a few hearts drifting upward,
// with gentle mouse parallax. Loaded lazily, only on wide screens with motion allowed and WebGL available.
// Pauses when the hero is off-screen or the tab is hidden; one draw call (THREE.Points + ShaderMaterial).
(() => {
  const canvas = document.querySelector('.hero-canvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(min-width: 768px)').matches) return;
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
  script.async = true;
  script.onload = () => start(window.THREE);
  document.head.append(script);

  function start(THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 12;

    // ---------- Particles ----------
    const count = window.innerWidth > 1400 ? 170 : 120;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const shapes = new Float32Array(count); // 0 = bokeh dot, 1 = heart
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = THREE.MathUtils.randFloat(-14, 14);
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(-8, 8);
      positions[i * 3 + 2] = THREE.MathUtils.randFloat(-6, 4);
      seeds[i] = Math.random();
      shapes[i] = Math.random() < 0.16 ? 1 : 0;
      sizes[i] = shapes[i] ? THREE.MathUtils.randFloat(26, 44) : THREE.MathUtils.randFloat(10, 34);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aShape', new THREE.BufferAttribute(shapes, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uFade: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        attribute float aShape;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;
        varying float vSeed;
        varying float vShape;
        varying float vDepth;
        void main() {
          vec3 p = position;
          float speed = 0.18 + aSeed * 0.35;
          p.y = mod(p.y + 8.0 + uTime * speed, 16.0) - 8.0;          // drift upward, wrap around
          p.x += sin(uTime * 0.35 + aSeed * 6.2831) * 0.45;          // sway
          float depth = (p.z + 6.0) / 10.0;                          // 0 far .. 1 near
          p.xy += uMouse * mix(0.25, 1.1, depth);                    // parallax: nearer moves more
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPixelRatio * (8.0 / -mv.z);
          vSeed = aSeed; vShape = aShape; vDepth = depth;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uFade;
        varying float vSeed;
        varying float vShape;
        varying float vDepth;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float alpha;
          if (vShape > 0.5) {
            vec2 h = vec2(uv.x, -uv.y + 0.08) * 2.6;                 // heart SDF (implicit curve)
            float f = pow(h.x * h.x + h.y * h.y - 1.0, 3.0) - h.x * h.x * h.y * h.y * h.y;
            alpha = 1.0 - smoothstep(-0.02, 0.04, f);
          } else {
            alpha = smoothstep(0.5, 0.0, length(uv));                // soft bokeh
            alpha *= alpha;
          }
          float twinkle = 0.75 + 0.25 * sin(uTime * 1.6 + vSeed * 40.0);
          vec3 gold = vec3(1.0, 0.82, 0.52);
          vec3 red = vec3(0.93, 0.18, 0.22);
          vec3 color = mix(gold, red, step(0.55, vSeed) * 0.85 + vShape * 0.15);
          gl_FragColor = vec4(color, alpha * twinkle * mix(0.28, 0.7, vDepth) * uFade);
        }`,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ---------- Size, input, visibility ----------
    const resize = () => {
      const { width, height } = hero.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const mouseTarget = new THREE.Vector2();
    hero.addEventListener('pointermove', (event) => {
      const box = hero.getBoundingClientRect();
      mouseTarget.set(((event.clientX - box.left) / box.width - 0.5) * 2, -((event.clientY - box.top) / box.height - 0.5) * 2);
    });
    hero.addEventListener('pointerleave', () => mouseTarget.set(0, 0));

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) loop(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

    // ---------- Render loop (stops itself when not needed) ----------
    const clock = new THREE.Clock();
    let running = false;
    function loop() {
      if (running) return;
      running = true;
      clock.getDelta();
      requestAnimationFrame(frame);
    }
    function frame() {
      if (!visible || document.hidden) { running = false; return; }
      const delta = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += delta;
      uniforms.uFade.value = Math.min(uniforms.uFade.value + delta * 0.6, 1); // fade in after load
      uniforms.uMouse.value.lerp(mouseTarget, 0.05);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    loop();

    // Scroll: the layer drifts and fades out as the hero leaves (GSAP, scrubbed).
    if (window.gsap && window.ScrollTrigger) {
      gsap.to(canvas, { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
  }
})();
