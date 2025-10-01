import React, { useEffect, useRef } from 'react';

// Use ESM CDN imports to avoid adding packages
// Three.js core
// Note: Pin version for stability
// eslint-disable-next-line
const THREE_SRC = 'https://esm.sh/three@0.164.1';

export default function GameCanvas({ onScore, onGameOver, disabled }) {
  const containerRef = useRef(null);
  const threeRef = useRef({});

  useEffect(() => {
    let disposed = false;
    let animationId = 0;

    async function init() {
      const THREE = await import(THREE_SRC);
      if (disposed) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x151a22);

      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.set(6, 10, 14);
      camera.lookAt(6, 0, 8);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const ambient = new THREE.HemisphereLight(0xffffff, 0x223344, 1.0);
      scene.add(ambient);

      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 12, 8);
      dir.castShadow = false;
      scene.add(dir);

      // Voxel materials
      const matGrass = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
      const matDirt = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 1.0 });
      const matRoad = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 1.0 });
      const matLine = new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 1.0 });
      const matPlayer = new THREE.MeshStandardMaterial({ color: 0x90caf9, metalness: 0.1, roughness: 0.7 });
      const matCarRed = new THREE.MeshStandardMaterial({ color: 0xef5350, metalness: 0.2, roughness: 0.6 });
      const matCarBlue = new THREE.MeshStandardMaterial({ color: 0x42a5f5, metalness: 0.2, roughness: 0.6 });
      const matCarYellow = new THREE.MeshStandardMaterial({ color: 0xffca28, metalness: 0.2, roughness: 0.6 });

      // Ground + rows generation
      const boxGeo = new THREE.BoxGeometry(1, 1, 1);
      const thinBoxGeo = new THREE.BoxGeometry(1, 0.01, 1);

      const WORLD = {
        cols: 13, // x from 0..12
        startZ: 0,
        rows: 40, // how far to generate forward
      };
      const ROW_TYPES = { GRASS: 'GRASS', ROAD: 'ROAD' };

      function rand(min, max) {
        return Math.random() * (max - min) + min;
      }

      // Create a platform base under everything (dirt)
      const base = new THREE.Group();
      for (let z = -2; z < WORLD.rows + 2; z++) {
        for (let x = -1; x < WORLD.cols + 1; x++) {
          const tile = new THREE.Mesh(boxGeo, matDirt);
          tile.position.set(x, -0.5, z);
          base.add(tile);
        }
      }
      scene.add(base);

      // Generate lanes
      const rows = [];
      const worldGroup = new THREE.Group();
      scene.add(worldGroup);

      // Road markings helper
      function addRoadMarkings(z) {
        for (let x = 0; x < WORLD.cols; x += 2) {
          const line = new THREE.Mesh(thinBoxGeo, matLine);
          line.scale.set(1, 1, 0.25);
          line.position.set(x + 0.5, 0.51, z + 0.5);
          worldGroup.add(line);
        }
      }

      for (let z = 0; z < WORLD.rows; z++) {
        let type;
        if (z < 3) type = ROW_TYPES.GRASS; // start safe
        else type = Math.random() < 0.55 ? ROW_TYPES.ROAD : ROW_TYPES.GRASS;

        rows.push({ type, z, cars: [], dir: Math.random() < 0.5 ? -1 : 1, speed: rand(1.2, 2.4) });

        for (let x = 0; x < WORLD.cols; x++) {
          const mat = type === ROW_TYPES.ROAD ? matRoad : matGrass;
          const tile = new THREE.Mesh(boxGeo, mat);
          tile.position.set(x, 0, z);
          worldGroup.add(tile);
        }

        if (type === ROW_TYPES.ROAD) {
          addRoadMarkings(z);
          const carCount = 2 + Math.floor(Math.random() * 3); // 2-4 cars per lane
          for (let i = 0; i < carCount; i++) {
            const carBody = new THREE.Mesh(boxGeo, [matCarRed, matCarBlue, matCarYellow][i % 3]);
            carBody.scale.set(1.3, 0.8, 0.9);
            const carTop = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 }));
            carTop.scale.set(0.9, 0.5, 0.7);
            carTop.position.y = 0.7;
            const car = new THREE.Group();
            car.add(carBody);
            car.add(carTop);
            car.position.set(rand(-5, WORLD.cols + 5), 0.4, z);
            worldGroup.add(car);
            rows[z].cars.push({ mesh: car });
          }
        }
      }

      // Player
      const player = new THREE.Group();
      const pBody = new THREE.Mesh(boxGeo, matPlayer);
      pBody.scale.set(0.9, 0.9, 0.9);
      pBody.position.y = 0.45;
      const pHead = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xbbdefb }));
      pHead.scale.set(0.6, 0.6, 0.6);
      pHead.position.y = 1.1;
      player.add(pBody);
      player.add(pHead);
      scene.add(player);

      const playerState = {
        x: Math.floor(WORLD.cols / 2),
        z: 0,
        y: 0,
        alive: true,
        maxZ: 0,
        moving: false,
      };

      function placePlayer() {
        player.position.set(playerState.x, 0.5, playerState.z);
      }
      placePlayer();

      // Camera follow
      function updateCamera() {
        const target = new THREE.Vector3(player.position.x, 0, player.position.z + 6);
        camera.position.lerp(new THREE.Vector3(target.x + 2, 10, target.z + 8), 0.1);
        camera.lookAt(player.position.x, 0, player.position.z + 2);
      }

      // Input
      const keys = new Set();
      const onKeyDown = (e) => {
        if (!playerState.alive) return;
        keys.add(e.key);
        stepFromKeys(e.key);
      };
      const onKeyUp = (e) => keys.delete(e.key);

      function stepFromKeys(key) {
        if (disabled) return;
        if (playerState.moving) return; // simple movement lock to keep steps crisp
        let dx = 0;
        let dz = 0;
        if (key === 'ArrowUp' || key === 'w' || key === 'W') dz = 1;
        if (key === 'ArrowDown' || key === 's' || key === 'S') dz = -1;
        if (key === 'ArrowLeft' || key === 'a' || key === 'A') dx = -1;
        if (key === 'ArrowRight' || key === 'd' || key === 'D') dx = 1;
        if (dx === 0 && dz === 0) return;
        const nx = Math.min(Math.max(playerState.x + dx, 0), WORLD.cols - 1);
        const nz = Math.max(playerState.z + dz, 0);
        playerState.moving = true;
        animateStepTo(nx, nz);
      }

      function animateStepTo(nx, nz) {
        const start = new Date().getTime();
        const duration = 120; // ms
        const sx = playerState.x;
        const sz = playerState.z;

        function stepAnim() {
          const now = new Date().getTime();
          const t = Math.min(1, (now - start) / duration);
          player.position.x = sx + (nx - sx) * t;
          player.position.z = sz + (nz - sz) * t;
          if (t < 1) {
            requestAnimationFrame(stepAnim);
          } else {
            playerState.x = nx;
            playerState.z = nz;
            playerState.maxZ = Math.max(playerState.maxZ, nz);
            onScore && onScore(playerState.maxZ);
            playerState.moving = false;
          }
        }
        stepAnim();
      }

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      // Resize
      function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener('resize', onResize);

      // Game loop
      const boundsX = { min: -6, max: WORLD.cols + 6 };

      function checkCollision() {
        const row = rows[playerState.z];
        if (!row || row.type !== ROW_TYPES.ROAD) return false;
        // approximate collision: check cars whose z equals player z
        for (const c of row.cars) {
          const dx = Math.abs(c.mesh.position.x - player.position.x);
          const dz = Math.abs(c.mesh.position.z - player.position.z);
          if (dz < 0.6 && dx < 0.7) return true;
        }
        return false;
      }

      function setGameOver() {
        if (!playerState.alive) return;
        playerState.alive = false;
        onGameOver && onGameOver();
      }

      function animate(ts) {
        // Move cars
        for (const row of rows) {
          if (row.type !== ROW_TYPES.ROAD) continue;
          const speed = row.speed * 0.016 * (row.dir < 0 ? -1 : 1);
          for (const c of row.cars) {
            c.mesh.position.x += speed * 60 * (disabled ? 0 : 1);
            if (c.mesh.position.x < boundsX.min) c.mesh.position.x = boundsX.max;
            if (c.mesh.position.x > boundsX.max) c.mesh.position.x = boundsX.min;
          }
        }

        if (!disabled && playerState.alive && checkCollision()) {
          setGameOver();
        }

        updateCamera();
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      }
      animationId = requestAnimationFrame(animate);

      threeRef.current = { THREE, renderer, scene, camera };

      return () => {
        // cleanup
      };
    }

    init();

    return () => {
      disposed = true;
      try {
        window.removeEventListener('resize', () => {});
      } catch {}
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
      if (threeRef.current && threeRef.current.renderer) {
        cancelAnimationFrame(animationId);
        threeRef.current.renderer.dispose();
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [onGameOver, onScore, disabled]);

  return (
    <div ref={containerRef} className="absolute inset-0" />
  );
}
