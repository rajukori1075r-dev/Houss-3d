window.buildFullHouse = function (THREE, scene) {
  const P = 3.0, H = 11.0, xE = z => 24.0 - 0.06 * z;
  const cutGrp = new THREE.Group(); scene.add(cutGrp);

  function tTex(bg, ln, rx, ry) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = ln; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t;
  }

  const mOut = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
  const mIn = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.65 });
  const mPlin = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const mHall = new THREE.MeshStandardMaterial({ map: tTex('#f8fafc', '#cbd5e1', 6, 18), roughness: 0.35 });
  const mRoom = new THREE.MeshStandardMaterial({ map: tTex('#fef3c7', '#d97706', 6, 12), roughness: 0.45 });
  const mPark = new THREE.MeshStandardMaterial({ map: tTex('#cbd5e1', '#64748b', 5, 8), roughness: 0.8 });
  const mBath = new THREE.MeshStandardMaterial({ map: tTex('#cffafe', '#0891b2', 4, 4), roughness: 0.3 });
  const mWood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.45 });
  const mDWood = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 });
  const mGran = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25 });
  const mChr = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 });
  const mCer = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
  const mGls = new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.42, roughness: 0.1 });
  const mWat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 });

  function box(w, h, d, m, x, y, z, par = scene) {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; par.add(o); return o;
  }
  function wall(x1, z1, x2, z2, th, h, yb = P, m = mIn, par = scene) {
    const dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz); if (l < 0.05) return;
    const o = new THREE.Mesh(new THREE.BoxGeometry(l, h, th), m);
    o.position.set((x1 + x2) / 2, yb + h / 2, (z1 + z2) / 2);
    o.rotation.y = -Math.atan2(dz, dx); o.castShadow = true; o.receiveShadow = true; par.add(o);
  }

  // Ground + 20' Dead-End Road + Road Ramp & Steps
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), new THREE.MeshStandardMaterial({ color: 0xbef264, roughness: 0.9 }));
  gnd.rotation.x = -Math.PI / 2; gnd.position.set(12, -0.05, 25); gnd.receiveShadow = true; scene.add(gnd);
  box(44, 0.2, 21, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.88 }), 5, 0.05, -10.5);
  for (let rx = -10; rx <= 20; rx += 5) box(2.4, 0.04, 0.35, new THREE.MeshBasicMaterial({ color: 0xfacc15 }), rx, 0.16, -10.5);
  box(0.7, 3.5, 21, mOut, 26.8, 1.75, -10.5); // Dead-end wall

  // Ramp (X=0.5..10.3, Z=-10.5..0)
  const rSh = new THREE.Shape(); rSh.moveTo(0, 0); rSh.lineTo(10.5, 0); rSh.lineTo(10.5, 2.9); rSh.closePath();
  const rGeo = new THREE.ExtrudeGeometry(rSh, { depth: 9.8, bevelEnabled: false }); rGeo.rotateY(-Math.PI / 2);
  const ramp = new THREE.Mesh(rGeo, mPark); ramp.position.set(10.3, 0.1, -10.5); ramp.receiveShadow = true; scene.add(ramp);
  for (let s = 0; s < 5; s++) box(3.2, (s + 1) * 0.6, 1, mGran, 12.2, (s + 1) * 0.3, -4.5 + s);

  // Tapered Plinth (+3'0") + SW 8'x6' Annex
  const pSh = new THREE.Shape();
  pSh.moveTo(0, 0); pSh.lineTo(24, 0); pSh.lineTo(21, -50); pSh.lineTo(8, -50); pSh.lineTo(8, -56); pSh.lineTo(0, -56); pSh.closePath();
  const pGeo = new THREE.ExtrudeGeometry(pSh, { depth: P, bevelEnabled: false }); pGeo.rotateX(-Math.PI / 2);
  const plin = new THREE.Mesh(pGeo, mPlin); plin.receiveShadow = true; scene.add(plin);

  // Floors
  box(10.2, 0.06, 16.5, mPark, 5.4, P, 8.25);
  box(10.2, 0.06, 33, mHall, 5.4, P + 0.02, 33.2);
  const eSh = new THREE.Shape(); eSh.moveTo(10.5, 0); eSh.lineTo(23.8, 0); eSh.lineTo(20.8, -49.8); eSh.lineTo(10.5, -49.8); eSh.closePath();
  const eGeo = new THREE.ExtrudeGeometry(eSh, { depth: 0.06, bevelEnabled: false }); eGeo.rotateX(-Math.PI / 2);
  const eFl = new THREE.Mesh(eGeo, mRoom); eFl.position.y = P + 0.02; eFl.receiveShadow = true; scene.add(eFl);
  box(7.6, 0.06, 5.8, mBath, 4, P + 0.02, 52.9);

  // Walls (Low 6.5' permanent + upper 4.5' in cutGrp for easy cutaway!)
  const wH = 6.5;
  function seg(x1, z1, x2, z2, th, m = mIn) {
    wall(x1, z1, x2, z2, th, wH, P, m, scene);
    wall(x1, z1, x2, z2, th, H - wH, P + wH, m, cutGrp);
  }
  const windows = [];
  function win(x1, z1, x2, z2, th) {
    wall(x1, z1, x2, z2, th, 2.8, P, mOut, scene);
    wall(x1, z1, x2, z2, th, H - 7.0, P + 7.0, mOut, cutGrp);
    const dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz), ang = -Math.atan2(dz, dx);
    const pv = new THREE.Group(); pv.position.set(x1, P + 2.8, z1); pv.rotation.y = ang;
    const gl = new THREE.Mesh(new THREE.BoxGeometry(l, 4.2, 0.14), mGls); gl.position.set(l / 2, 2.1, 0); pv.add(gl);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(l, 0.18, th + 0.1), mDWood); fr.position.set(l / 2, 0.05, 0); pv.add(fr);
    scene.add(pv); windows.push({ pv, baseAng: ang });
  }
  const doors = {};
  function mkDoor(key, x1, z1, x2, z2, th, swing = -1.45, flip = false) {
    wall(x1, z1, x2, z2, th, H - 7.2, P + 7.2, mIn, cutGrp);
    const dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz), ang = -Math.atan2(dz, dx);
    const pv = new THREE.Group(); pv.position.set(flip ? x2 : x1, P, flip ? z2 : z1);
    const base = ang + (flip ? Math.PI : 0); pv.rotation.y = base;
    const lf = new THREE.Mesh(new THREE.BoxGeometry(l - 0.1, 7.1, 0.16), mWood); lf.position.set(l / 2, 3.55, 0); lf.castShadow = true; pv.add(lf);
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.28), mChr); hd.position.set(l - 0.4, 3.3, 0); pv.add(hd);
    scene.add(pv); doors[key] = { pv, base, swing, open: false, cx: (x1 + x2) / 2, cz: (z1 + z2) / 2 };
  }

  // Outer Perimeter
  seg(0.25, 0, 0.25, 56, 0.5, mOut); // West 56'
  seg(10.5, 0.25, 14.8, 0.25, 0.5, mOut); win(14.8, 0.25, 19.6, 0.25, 0.5); seg(19.6, 0.25, 24, 0.25, 0.5, mOut); // North Bed1
  seg(xE(0) - 0.25, 0, xE(50) - 0.25, 50, 0.5, mOut); // East Tapered
  seg(8, 49.75, 21, 49.75, 0.5, mOut); // South Main

  // SW 8'x6' Annex (Bath 5'x3' NW, WC 4'x2.9' SW, Lobby 3'->4' East!)
  seg(7.75, 50, 7.75, 56, 0.5, mOut); seg(0.5, 55.75, 7.75, 55.75, 0.5, mOut);
  seg(0.5, 49.75, 5.0, 49.75, 0.4, mIn); // North wall of Bath (X=5..8 open to Hall!)
  seg(0.5, 53.0, 5.0, 53.0, 0.3, mIn); // Bath | WC divider
  mkDoor('bath', 5.0, 50.4, 5.0, 52.5, 0.3, 1.45, false); // Bath Door into Lobby
  mkDoor('wc', 4.0, 53.4, 4.0, 55.4, 0.3, 1.45, false); // WC Door into Lobby
  seg(4.0, 53.0, 4.0, 53.4, 0.3); seg(4.0, 55.4, 4.0, 55.75, 0.3);

  // 9' Bi-Fold Gate (Z=16.5, X=0.8..9.8)
  const bf = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); g.position.set(i === 0 ? 0.8 : 2.25, i === 0 ? P : 0, i === 0 ? 16.5 : 0);
    box(2.2, 7.2, 0.14, mDWood, 1.12, 3.6, 0, g); box(1.8, 6.2, 0.17, mGls, 1.12, 3.6, 0, g);
    (i === 0 ? scene : bf[i - 1]).add(g); bf.push(g);
  }
  wall(0.8, 16.5, 9.8, 16.5, 0.4, H - 7.3, P + 7.3, mIn, cutGrp);

  // Central Spine (X=10.5) + East Partitions
  seg(10.5, 0.5, 10.5, 7.8, 0.35); mkDoor('b1', 10.5, 7.8, 10.5, 11.0, 0.35, -1.45, true); seg(10.5, 11.0, 10.5, 17.2, 0.35);
  win(10.5, 17.2, 10.5, 19.8, 0.35); mkDoor('b2', 10.5, 20.0, 10.5, 22.9, 0.35, -1.45, true);
  seg(10.5, 22.9, 10.5, 24.8, 0.35); win(10.5, 24.8, 10.5, 29.0, 0.35); seg(10.5, 29.0, 10.5, 31.1, 0.35);
  mkDoor('b3', 10.5, 31.1, 10.5, 34.1, 0.35, -1.45, true);
  // Kitchen Open Entry + Breakfast Bar (Z=44.6..49.5)
  wall(10.5, 44.6, 10.5, 49.5, 0.35, 3.1, P, mIn); box(1.5, 0.2, 4.9, mWood, 10.5, P + 3.2, 47.05);
  seg(10.5, 11.5, xE(11.5) - 0.3, 11.5, 0.35); seg(10.5, 23.0, xE(23.0) - 0.3, 23.0, 0.35);
  seg(10.5, 34.35, xE(34.35) - 0.3, 34.35, 0.35); seg(10.5, 40.7, xE(40.7) - 0.3, 40.7, 0.35);

  // U-Staircase (Bed 3 & Kitchen, Z=34.5..40.5)
  for (let i = 0; i < 8; i++) box(0.85, 0.6, 2.8, mWood, 12.2 + i * 0.82, P + (i + 0.5) * 0.6, 36.0);
  box(3.2, 0.5, 5.8, mGran, 20.0, P + 5.2, 37.5);
  for (let i = 0; i < 9; i++) box(0.85, 0.6, 2.8, mWood, 18.0 - i * 0.82, P + (9.5 + i) * 0.6, 39.0);

  // Roof Slab with 12'x4'6" Open Ceiling Jaal (in cutGrp)
  const rfSh = pSh.clone();
  const hl = new THREE.Path(); hl.moveTo(5.2, -19); hl.lineTo(9.7, -19); hl.lineTo(9.7, -31); hl.lineTo(5.2, -31); hl.closePath();
  rfSh.holes.push(hl);
  const rfGeo = new THREE.ExtrudeGeometry(rfSh, { depth: 0.45, bevelEnabled: false }); rfGeo.rotateX(-Math.PI / 2);
  const rfM = new THREE.Mesh(rfGeo, mOut); rfM.position.y = P + H; cutGrp.add(rfM);
  for (let jz = 19.4; jz <= 30.8; jz += 0.6) box(4.5, 0.1, 0.08, mGran, 7.45, P + H + 0.15, jz, cutGrp);
  cutGrp.visible = false;

  // Furniture: 3 Beds, 2 Study Tables + Functional Tablets, Sofa, Dining + Snacks, Kitchen + Tea Kettle, SW Bath/WC/WM
  function mkBed(x, z, col) {
    box(6, 1.2, 6.4, mWood, x, P + 0.6, z);
    box(5.7, 0.5, 6.1, mCer, x, P + 1.45, z);
    box(5.75, 0.52, 3.8, new THREE.MeshStandardMaterial({ color: col }), x, P + 1.47, z - 1.1);
  }
  mkBed(18.2, 6.8, 0x38bdf8); mkBed(18.0, 18.8, 0xf472b6); mkBed(17.5, 30.2, 0x4ade80);

  const tablets = [];
  function mkStudy(x, z) {
    box(3.4, 2.4, 2.0, mWood, x, P + 1.2, z); // Table
    box(1.5, 1.5, 1.5, mDWood, x, P + 0.75, z + 1.6); // Chair
    const tMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tab = box(0.95, 0.08, 0.65, tMat, x, P + 2.45, z + 0.2); tab.rotation.x = 0.25;
    tablets.push(tMat);
  }
  mkStudy(13.6, 13.8); mkStudy(13.6, 25.4);

  // Hall Sofa + Dining Table + Samosa/Snack Plate
  box(2.5, 2.2, 7.2, new THREE.MeshStandardMaterial({ color: 0xb45309 }), 1.8, P + 1.1, 25.0);
  box(3.2, 2.4, 4.4, mWood, 3.4, P + 1.2, 40.5);
  const snacks = new THREE.Group(); snacks.position.set(3.4, P + 2.5, 40.5);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.55, 0.08, 16), mCer); snacks.add(plate);
  [[-0.2, 0.1], [0.2, 0.1], [0, -0.2]].forEach(([sx, sz]) => {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.25, 4), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    s.position.set(sx, 0.16, sz); snacks.add(s);
  });
  scene.add(snacks);

  // Kitchen Counter + Stove + Boiling Tea Kettle + Steam
  box(2.0, 2.8, 8.2, mGran, 19.6, P + 1.4, 45.2); box(7.0, 2.8, 1.9, mGran, 15.2, P + 1.4, 48.5);
  box(1.2, 0.15, 2.2, mChr, 19.4, P + 2.88, 45.2); // Gas stove
  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.55, 16), mChr);
  kettle.position.set(19.3, P + 3.22, 45.2); scene.add(kettle);
  const kettleSteam = [];
  for (let i = 0; i < 6; i++) {
    const st = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
    st.position.set(19.3, P + 3.6 + i * 0.35, 45.2); scene.add(st); kettleSteam.push(st);
  }

  // SW Annex Fixtures: Basin (opp. Bath door), Washing Machine (SE beside WC), WC + Shower
  box(0.9, 0.45, 1.6, mCer, 7.25, P + 2.7, 51.4); // Basin
  box(0.08, 2.2, 1.6, mGls, 7.68, P + 4.7, 51.4); // Mirror
  const wmGrp = new THREE.Group(); wmGrp.position.set(6.5, P + 0.03, 54.6);
  box(1.85, 2.7, 1.85, mCer, 0, 1.35, 0, wmGrp);
  const wmDrum = new THREE.Group(); wmDrum.position.set(0, 1.3, -0.94);
  const wR = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.09, 10, 20), mChr); wmDrum.add(wR);
  [0xef4444, 0x3b82f6, 0xfacc15].forEach((c, i) => {
    const cl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: c }));
    cl.position.set(Math.cos(i * 2.1) * 0.25, Math.sin(i * 2.1) * 0.25, 0.08); wmDrum.add(cl);
  });
  wmGrp.add(wmDrum); scene.add(wmGrp);

  // WC Seat (X=1.3, Z=54.6) + Shower Drops (X=1.2, Z=51.5)
  const wcB = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 1.3, 16), mCer); wcB.position.set(1.3, P + 0.65, 54.6); scene.add(wcB);
  box(0.55, 1.3, 1.2, mCer, 0.55, P + 1.9, 54.6);
  const wcWater = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.08, 16), mWat); wcWater.position.set(1.3, P + 1.05, 54.6); scene.add(wcWater);
  const showerDrops = [];
  for (let i = 0; i < 16; i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), mWat);
    d.position.set(1.0 + (i % 4) * 0.15, P + 1 + Math.random() * 5, 51.2 + Math.floor(i / 4) * 0.15);
    d.visible = false; scene.add(d); showerDrops.push(d);
  }

  // Ceiling Fans (5 Working Fans!) & Lights (6 Zone Lights!)
  const fans = {};
  function mkFan(key, x, z) {
    const g = new THREE.Group(); g.position.set(x, P + H - 1.4, z);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), mDWood); g.add(hub);
    for (let i = 0; i < 3; i++) {
      const b = box(0.32, 0.04, 2.2, mWood, 0, 0, 0, g);
      b.rotation.y = (i * Math.PI * 2) / 3; b.position.set(Math.sin(b.rotation.y) * 1.1, 0, Math.cos(b.rotation.y) * 1.1);
    }
    scene.add(g); fans[key] = g;
  }
  mkFan('b1', 16.5, 6.0); mkFan('b2', 16.2, 17.5); mkFan('b3', 15.8, 28.8);
  mkFan('h1', 5.2, 20.5); mkFan('h2', 5.2, 39.5);

  const lights = {};
  function mkL(key, x, z, inten = 1.6) {
    const l = new THREE.PointLight(0xfffbeb, inten, 24, 1.3); l.position.set(x, P + H - 1, z); scene.add(l);
    lights[key] = l;
  }
  mkL('lHall', 5.4, 30, 1.9); mkL('lB1', 16.5, 6, 1.5); mkL('lB2', 16.2, 17.5, 1.5);
  mkL('lB3', 15.8, 28.8, 1.5); mkL('lKit', 16, 45, 1.6); mkL('lBath', 4.5, 53, 1.5);

  // Driveable SUV Car (NW Parking: X=4.6, Z=8.5)
  const suv = new THREE.Group(); suv.position.set(4.6, P, 8.5);
  box(5.6, 2.2, 13.6, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.25 }), 0, 1.7, 0, suv);
  box(4.9, 1.9, 7.6, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 }), 0, 3.5, -0.6, suv);
  box(4.6, 1.5, 7.8, mGls, 0, 3.45, -0.6, suv);
  [[-2.7, 4.2], [2.7, 4.2], [-2.7, -4.2], [2.7, -4.2]].forEach(([wx, wz]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.75, 16), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    w.rotation.z = Math.PI / 2; w.position.set(wx, 1.1, wz); suv.add(w);
  });
  scene.add(suv);

  return { P, H, cutGrp, doors, windows, bf, fans, lights, suv, kettleSteam, wmDrum, showerDrops, wcWater, tablets, snacks };
};
