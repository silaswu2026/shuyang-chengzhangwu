import * as THREE from "three";

export function createControls(camera, canvas, getPlayerRoot) {
  const key = Object.create(null);
  let yaw = 0;
  let pitch = -0.28;
  // Medium–far default so avatar ≈ 10–20% screen height (Sansa audit)
  let dist = 7.2;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let target = null; // Vector3 click-to-walk
  const stick = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();

  window.addEventListener("keydown", (e) => {
    key[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    key[e.code] = false;
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button === 0) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        target = hit.clone();
        target.x = Math.max(-28, Math.min(28, target.x));
        target.z = Math.max(-28, Math.min(28, target.z));
      }
    }
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    if (e.buttons === 2 || e.shiftKey || e.pointerType === "touch") {
      yaw -= dx * 0.005;
      pitch -= dy * 0.004;
      pitch = Math.max(-1.2, Math.min(0.15, pitch));
    } else if (e.buttons === 1 && Math.hypot(dx, dy) > 2) {
      yaw -= dx * 0.005;
      pitch -= dy * 0.004;
      pitch = Math.max(-1.2, Math.min(0.15, pitch));
    }
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });
  canvas.addEventListener("wheel", (e) => {
    dist += e.deltaY * 0.01;
    dist = Math.max(3.2, Math.min(14, dist));
  }, { passive: true });

  const stickEl = document.getElementById("mobileStick");
  if (stickEl) {
    const knob = stickEl.querySelector(".knob");
    const setStick = (cx, cy) => {
      const r = stickEl.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;
      let dx = (cx - ox) / (r.width / 2);
      let dy = (cy - oy) / (r.height / 2);
      const m = Math.hypot(dx, dy) || 1;
      if (m > 1) {
        dx /= m;
        dy /= m;
      }
      stick.x = dx;
      stick.y = dy;
      if (knob) {
        knob.style.left = `${35 + dx * 28}px`;
        knob.style.top = `${35 + dy * 28}px`;
      }
    };
    stickEl.addEventListener("pointerdown", (e) => {
      stickEl.setPointerCapture(e.pointerId);
      setStick(e.clientX, e.clientY);
    });
    stickEl.addEventListener("pointermove", (e) => {
      if (e.pressure || e.buttons) setStick(e.clientX, e.clientY);
    });
    stickEl.addEventListener("pointerup", () => {
      stick.x = stick.y = 0;
      if (knob) {
        knob.style.left = "35px";
        knob.style.top = "35px";
      }
    });
  }

  function update(dt, ritualLocked) {
    const player = getPlayerRoot();
    if (!player) return { moved: false, x: 0, z: 0, rotY: 0 };

    let mx = 0;
    let mz = 0;
    if (!ritualLocked) {
      if (key.KeyW || key.ArrowUp) mz -= 1;
      if (key.KeyS || key.ArrowDown) mz += 1;
      if (key.KeyA || key.ArrowLeft) mx -= 1;
      if (key.KeyD || key.ArrowRight) mx += 1;
      mx += stick.x;
      mz += stick.y;
    }

    const speed = 3.6 * dt;
    let moving = false;
    if (Math.abs(mx) + Math.abs(mz) > 0.01) {
      target = null;
      const len = Math.hypot(mx, mz) || 1;
      mx /= len;
      mz /= len;
      const ca = Math.cos(yaw);
      const sa = Math.sin(yaw);
      const dx = mx * ca + mz * sa;
      const dz = -mx * sa + mz * ca;
      player.position.x = Math.max(-28, Math.min(28, player.position.x + dx * speed * 3.2));
      player.position.z = Math.max(-28, Math.min(28, player.position.z + dz * speed * 3.2));
      player.rotation.y = Math.atan2(dx, dz);
      moving = true;
    } else if (target && !ritualLocked) {
      const dx = target.x - player.position.x;
      const dz = target.z - player.position.z;
      const dist2 = Math.hypot(dx, dz);
      if (dist2 < 0.15) {
        target = null;
      } else {
        const step = Math.min(dist2, speed * 3.2);
        player.position.x += (dx / dist2) * step;
        player.position.z += (dz / dist2) * step;
        player.rotation.y = Math.atan2(dx, dz);
        moving = true;
      }
    }

    // Orbit follow — look near chest of stubby figurine
    const lookY = 0.55;
    const cx = player.position.x + Math.sin(yaw) * Math.cos(pitch) * dist;
    const cy = player.position.y + 0.7 + Math.sin(-pitch) * dist * 0.22 + dist * 0.28;
    const cz = player.position.z + Math.cos(yaw) * Math.cos(pitch) * dist;
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), 1 - Math.pow(0.001, dt));
    camera.lookAt(player.position.x, player.position.y + lookY, player.position.z);

    return {
      moved: moving,
      x: player.position.x,
      z: player.position.z,
      rotY: player.rotation.y,
    };
  }

  return { update, key };
}
