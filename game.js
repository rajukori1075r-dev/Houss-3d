window.startHouseGame = function (THREE, OrbitControls) {
  const wrap = document.getElementById('wrap');
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xbae6fd);
  const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.2, 260);
  cam.position.set(5.4, 11.5, 11.0);

  const ren = new THREE.WebGLRenderer({ antialias: true });
  ren.setSize(innerWidth, innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio, 2));
  ren.shadowMap.enabled = true; wrap.appendChild(ren.domElement);

  const ctrl = new OrbitControls(cam, ren.domElement);
  ctrl.enableDamping = true; ctrl.maxPolarAngle = Math.PI * 0.48;
  ctrl.minDistance = 5; ctrl.maxDistance = 55;

  const amb = new THREE.HemisphereLight(0xe0f2fe, 0x64748b, 0.8); scene.add(amb);
  const sun = new THREE.DirectionalLight(0xfffbeb, 1.5);
  sun.position.set(22, 48, 12); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); scene.add(sun);

  const H = window.buildFullHouse(THREE, scene);
  const C = window.buildChars(THREE, scene, H.P);
  const R = C.rohit;

  const st = {
    night: false, cutaway: true, fan1: true, fan2: true, fan3: true, fanH: true,
    lHall: true, lB1: true, lB2: true, lB3: true, lKit: true, lBath: true,
    bifold: false, allDoors: false, windows: false, wmRun: false, shower: false, tablets: true,
    driving: false, sittingWC: false, eating: 0, flushT: 0, bfProg: 0
  };

  function toast(m) {
    const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show');
    clearTimeout(window._tt); window._tt = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // Web Audio Horn & Click SFX
  function beep(freq = 320, dur = 0.25) {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq; g.gain.value = 0.12;
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
    } catch (e) {}
  }

  // Switchboard Logic (Including Sanjay Mausa Fan Reaction!)
  window.toggleDrawer = () => document.getElementById('drawer').classList.toggle('open');
  window.toggleNight = () => {
    st.night = !st.night;
    const b = document.getElementById('b-night'); b.classList.toggle('on', st.night);
    b.textContent = st.night ? '☀️ Day' : '🌙 Night';
    amb.intensity = st.night ? 0.16 : 0.8; sun.intensity = st.night ? 0.08 : 1.5;
    scene.background.setHex(st.night ? 0x0b1120 : 0xbae6fd);
  };
  window.toggleRoof = () => {
    st.cutaway = !st.cutaway; H.cutGrp.visible = !st.cutaway;
    const b = document.getElementById('b-roof'); b.classList.toggle('on', st.cutaway);
    b.textContent = st.cutaway ? '🧱 Cutaway' : '🏛️ Full Roof';
  };

  window.tog = (k) => {
    st[k] = !st[k];
    // Sanjay Mausa reacts immediately when Bed 1 Fan is turned OFF / ON!
    if (k === 'fan1') {
      if (!st.fan1) {
        C.mausa.awake = true;
        C.say(C.mausa, 'Arey yrr fan kyun off kiye!', 5.0);
        toast('😠 Sanjay Mausa jaag gaye!');
      } else {
        C.mausa.awake = false;
        C.say(C.mausa, 'Haan ab aayi hawa... sone do!', 3.2);
        toast('😴 Sanjay Mausa wapas so rahe hain');
      }
    }
    if (k === 'allDoors') Object.values(H.doors).forEach(d => d.open = st.allDoors);
    if (k === 'tablets') H.tablets.forEach(m => m.color.setHex(st.tablets ? 0x38bdf8 : 0x0f172a));
    if (k === 'shower' && !st.shower) H.showerDrops.forEach(d => d.visible = false);
    Object.keys(H.lights).forEach(lk => H.lights[lk].intensity = st[lk] ? 1.8 : 0);
    syncBtns();
  };

  function syncBtns() {
    const map = {
      'sw-f1': st.fan1, 'sw-f2': st.fan2, 'sw-f3': st.fan3, 'sw-fh': st.fanH,
      'sw-lh': st.lHall, 'sw-l1': st.lB1, 'sw-l2': st.lB2, 'sw-l3': st.lB3,
      'sw-lk': st.lKit, 'sw-lb': st.lBath, 'sw-bf': st.bifold, 'sw-dr': st.allDoors,
      'sw-wn': st.windows, 'sw-wm': st.wmRun, 'sw-sh': st.shower, 'sw-tb': st.tablets
    };
    Object.entries(map).forEach(([id, v]) => document.getElementById(id)?.classList.toggle('on', v));
  }

  // Interactive Quick Actions: Drive Car, Sit on WC, Flush, Eat/Chai, Door
  window.toggleCar = () => {
    st.sittingWC = false; st.driving = !st.driving;
    const bc = document.getElementById('b-car'), bh = document.getElementById('b-horn');
    if (st.driving) {
      R.grp.visible = false; bc.textContent = '🚶 Exit Car'; bc.classList.add('red'); bh.style.display = 'block';
      toast('🚗 SUV Drive Mode ON! Joystick se chalao!');
    } else {
      R.grp.visible = true;
      R.grp.position.set(H.suv.position.x + 3.6, H.suv.position.y, H.suv.position.z);
      bc.textContent = '🚗 Drive Car'; bc.classList.remove('red'); bh.style.display = 'none';
      toast('🚶 Rohit Mishra gaadi se bahar aa gaya');
    }
  };
  window.honkHorn = () => { beep(420, 0.18); setTimeout(() => beep(520, 0.22), 200); toast('📢 Peep Peep!'); };

  window.doSitWC = () => {
    if (st.driving) window.toggleCar();
    H.doors.wc.open = true; st.sittingWC = !st.sittingWC;
    if (st.sittingWC) {
      R.grp.position.set(1.55, H.P - 0.85, 54.6); R.grp.rotation.y = Math.PI / 2;
      R.lLeg.rotation.x = -1.45; R.rLeg.rotation.x = -1.45;
      toast('🚽 Rohit toilet par baith gaya! Joystick hilao uthne ke liye.');
    } else {
      R.grp.position.set(4.8, H.P, 54.4); R.lLeg.rotation.x = R.rLeg.rotation.x = 0;
    }
  };
  window.doFlush = () => { st.flushT = 2.5; beep(180, 0.35); toast('🌊 WC Flush Activated!'); };

  window.doEat = () => {
    if (st.driving) return toast('Pehle gaadi se utro!');
    st.sittingWC = false; st.eating = 3.0;
    const inKit = R.grp.position.x > 10.5 && R.grp.position.z > 40.5;
    C.say(R, inKit ? 'Mausi ek cup garam chai!' : 'Mmm... Samosa mast bana hai!', 3.0);
    toast(inKit ? '☕ Chai pi rahe hain!' : '🍽️ Snacks khaa rahe hain!');
  };

  window.doNearestDoor = () => {
    let best = null, bd = 99;
    Object.values(H.doors).forEach(d => {
      const dist = Math.hypot(R.grp.position.x - d.cx, R.grp.position.z - d.cz);
      if (dist < bd) { bd = dist; best = d; }
    });
    if (best && bd < 7.5) { best.open = !best.open; toast(best.open ? '🚪 Door Opened' : '🚪 Door Closed'); }
    else { window.tog('bifold'); toast(st.bifold ? '🚪 9ft Bi-Fold OPEN (50ft Hall!)' : '🚪 9ft Bi-Fold CLOSED'); }
  };

  // Virtual Thumb Joystick (Touch + Mouse)
  const jz = document.getElementById('joy-zone'), jk = document.getElementById('joy-knob');
  let jx = 0, jy = 0, jAct = false;
  function updJoy(cx, cy) {
    const r = jz.getBoundingClientRect();
    let dx = cx - (r.left + 56), dy = cy - (r.top + 56);
    const m = Math.hypot(dx, dy), lim = 38;
    if (m > lim) { dx = dx / m * lim; dy = dy / m * lim; }
    jk.style.left = (36 + dx) + 'px'; jk.style.top = (36 + dy) + 'px';
    jx = dx / lim; jy = dy / lim;
  }
  jz.addEventListener('pointerdown', e => { jAct = true; jz.setPointerCapture(e.pointerId); updJoy(e.clientX, e.clientY); });
  jz.addEventListener('pointermove', e => { if (jAct) updJoy(e.clientX, e.clientY); });
  jz.addEventListener('pointerup', () => { jAct = false; jx = jy = 0; jk.style.left = jk.style.top = '36px'; });

  // Ground Elevation helper (Ramp + Road + Plinth)
  function getFloorY(x, z) {
    if (z >= 0) return H.P;
    if (z > -10.5 && x >= 0.2 && x <= 10.6) return 0.1 + ((z + 10.5) / 10.5) * 2.9;
    return 0.1;
  }

  // Main Animation & AI Loop
  const clk = new THREE.Clock(), locEl = document.getElementById('loc-txt');
  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clk.getDelta(), 0.05), t = clk.elapsedTime;
    const moving = Math.hypot(jx, jy) > 0.12;

    if (st.driving) {
      // Drive SUV smoothly up/down Ramp & on 20' Road
      if (Math.abs(jy) > 0.1) {
        H.suv.rotation.y -= jx * dt * 1.9 * (jy > 0 ? -1 : 1);
        const spd = -jy * 12 * dt;
        H.suv.position.x = Math.max(-12, Math.min(23, H.suv.position.x + Math.sin(H.suv.rotation.y) * spd));
        H.suv.position.z = Math.max(-18, Math.min(13.5, H.suv.position.z + Math.cos(H.suv.rotation.y) * spd));
        H.suv.position.y = getFloorY(H.suv.position.x, H.suv.position.z);
      }
      ctrl.target.lerp(new THREE.Vector3(H.suv.position.x, H.suv.position.y + 2.5, H.suv.position.z), 0.1);
      locEl.textContent = '🚗 Driving SUV • Use Joystick + Horn';
    } else {
      // Walk Rohit Mishra relative to 3rd-Person Camera direction!
      if (moving) {
        if (st.sittingWC) { st.sittingWC = false; R.lLeg.rotation.x = R.rLeg.rotation.x = 0; }
        const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
        const rgt = new THREE.Vector3(-fwd.z, 0, fwd.x);
        const mv = new THREE.Vector3().addScaledVector(fwd, -jy).addScaledVector(rgt, jx).normalize();
        const nx = Math.max(-10, Math.min(22.5, R.grp.position.x + mv.x * 8.5 * dt));
        const nz = Math.max(-18, Math.min(55.2, R.grp.position.z + mv.z * 8.5 * dt));
        R.grp.position.set(nx, getFloorY(nx, nz), nz);
        R.grp.rotation.y = Math.atan2(mv.x, mv.z);
        // Walking limbs animation
        R.lLeg.rotation.x = Math.sin(t * 11) * 0.65; R.rLeg.rotation.x = -Math.sin(t * 11) * 0.65;
        R.lArm.rotation.x = -Math.sin(t * 11) * 0.5; R.rArm.rotation.x = Math.sin(t * 11) * 0.5;
        // Auto-push room doors open if Rohit walks close!
        Object.values(H.doors).forEach(d => { if (Math.hypot(nx - d.cx, nz - d.cz) < 2.6) d.open = true; });
      } else if (!st.sittingWC) {
        R.lLeg.rotation.x *= 0.85; R.rLeg.rotation.x *= 0.85;
        R.lArm.rotation.x *= 0.85; R.rArm.rotation.x = st.eating > 0 ? -1.1 + Math.sin(t * 14) * 0.25 : R.rArm.rotation.x * 0.85;
      }
      if (st.eating > 0) st.eating -= dt;
      // Smooth 3rd-person camera tracking (NEVER FPV!)
      const tgt = new THREE.Vector3(R.grp.position.x, R.grp.position.y + 3.2, R.grp.position.z);
      const shift = tgt.clone().sub(ctrl.target).multiplyScalar(0.12);
      ctrl.target.add(shift); cam.position.add(shift);

      // Room Proximity Triggers for Family Characters!
      const rx = R.grp.position.x, rz = R.grp.position.z;
      let loc = 'Grand West Hall';
      if (rz < 0) loc = '20ft Road & Car Ramp';
      else if (rx < 10.5 && rz < 16.5) loc = 'Car Parking (16.5×10)';
      else if (rz > 50) loc = 'SW 8×6 Bathroom & Laundry Lobby';
      else if (rx > 10.5 && rz < 11.5) loc = 'Bedroom 1 (Sanjay Mausa)';
      else if (rx > 10.5 && rz < 23.0) {
        loc = 'Bedroom 2 (Sanjana)';
        if (C.sanjana.greetCd <= 0) { C.sanjana.standing = true; C.sanjana.greetCd = 9; C.say(C.sanjana, 'Mama namaste!', 3.8); }
      } else if (rx > 10.5 && rz < 34.4) {
        loc = 'Bedroom 3 (Krishna)';
        if (C.krishna.greetCd <= 0) { C.krishna.standing = true; C.krishna.greetCd = 9; C.say(C.krishna, 'Mama namaste!', 3.8); }
      } else if (rx > 10.5 && rz > 40.7) {
        loc = 'Kitchen (Suman Mausi)';
        if (C.mausi.cooldown <= 0) {
          C.mausi.cooldown = 8;
          C.say(C.mausi, 'Phir aa gaye chai peene... Bhaago yahan se!', 4.5);
        }
      }
      locEl.textContent = '📍 ' + loc;
    }

    // Character Animations (Kids stand/namaste -> sit back; Mausi stirs tea; Mausa sleeps/wakes!)
    [C.sanjana, C.krishna].forEach(k => {
      if (k.greetCd > 0) k.greetCd -= dt;
      const isGreet = k.timer > 0.3 && k.standing;
      k.grp.position.y += ((isGreet ? H.P : H.P - 0.7) - k.grp.position.y) * 0.12;
      k.lLeg.rotation.x += ((isGreet ? 0 : -1.35) - k.lLeg.rotation.x) * 0.14;
      k.rLeg.rotation.x = k.lLeg.rotation.x;
      k.lArm.rotation.x += ((isGreet ? -1.2 : -0.65) - k.lArm.rotation.x) * 0.14;
      k.rArm.rotation.x = k.lArm.rotation.x;
      if (isGreet) k.grp.rotation.y = Math.atan2(R.grp.position.x - k.grp.position.x, R.grp.position.z - k.grp.position.z);
      else k.grp.rotation.y += (Math.PI - k.grp.rotation.y) * 0.1;
    });

    // Suman Mausi making tea / turning to shout at Rohit
    if (C.mausi.cooldown > 0) C.mausi.cooldown -= dt;
    if (C.mausi.timer > 0) {
      C.mausi.grp.rotation.y = Math.atan2(R.grp.position.x - C.mausi.grp.position.x, R.grp.position.z - C.mausi.grp.position.z);
      C.mausi.rArm.rotation.x = -1.6 + Math.sin(t * 14) * 0.4;
    } else {
      C.mausi.grp.rotation.y += (Math.PI / 2 - C.mausi.grp.rotation.y) * 0.1;
      C.mausi.rArm.rotation.x = -0.9 + Math.sin(t * 5) * 0.2;
    }

    // Sanjay Mausa sleeping vs frustrated awake!
    C.mausa.torso.rotation.x += ((C.mausa.awake ? 0 : Math.PI / 2) - C.mausa.torso.rotation.x) * 0.1;
    C.mausa.rArm.rotation.x = C.mausa.awake ? -1.8 + Math.sin(t * 12) * 0.45 : 0;

    // Speech Bubble Auto-Hide
    [R, C.mausi, C.sanjana, C.krishna, C.mausa].forEach(ch => {
      if (ch.timer > 0) { ch.timer -= dt; if (ch.timer <= 0) C.drawSprite(ch.bubble, ''); }
    });

    // Fans, Doors, Bi-Fold, Windows, Kettle Steam, Washing Machine, Shower, Flush
    if (st.fan1) H.fans.b1.rotation.y += dt * 11;
    if (st.fan2) H.fans.b2.rotation.y += dt * 11;
    if (st.fan3) H.fans.b3.rotation.y += dt * 11;
    if (st.fanH) { H.fans.h1.rotation.y += dt * 11; H.fans.h2.rotation.y += dt * 11; }
    Object.values(H.doors).forEach(d => d.pv.rotation.y += ((d.open ? d.base + d.swing : d.base) - d.pv.rotation.y) * 0.14);
    H.windows.forEach(w => w.pv.rotation.y += ((st.windows ? w.baseAng + 1.25 : w.baseAng) - w.pv.rotation.y) * 0.12);
    st.bfProg += ((st.bifold ? 1 : 0) - st.bfProg) * 0.1;
    const a = st.bfProg * 1.42;
    H.bf[0].rotation.y = a; H.bf[1].rotation.y = -2 * a; H.bf[2].rotation.y = 2 * a; H.bf[3].rotation.y = -2 * a;
    H.kettleSteam.forEach((s, i) => { s.position.y = H.P + 3.6 + ((t * 1.5 + i * 0.4) % 2.2); });
    if (st.wmRun) H.wmDrum.rotation.z += dt * 8;
    if (st.shower) H.showerDrops.forEach(d => { d.visible = true; d.position.y -= dt * 10; if (d.position.y < H.P + 0.3) d.position.y = H.P + 6.5; });
    if (st.flushT > 0) { st.flushT -= dt; H.wcWater.scale.setScalar(1 + Math.sin(st.flushT * 14) * 0.15); } else H.wcWater.scale.setScalar(1);

    ctrl.update(); ren.render(scene, cam);
  })();

  addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth, innerHeight); });
};
