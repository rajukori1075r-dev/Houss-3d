window.buildChars = function (THREE, scene, P) {
  function mkSprite(txt, bg, fg, w = 320, h = 76, sx = 3.2, sy = 0.78) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sp = new THREE.Sprite(mat); sp.scale.set(sx, sy, 1);
    sp.userData = { c, g, tex, bg, fg };
    drawSprite(sp, txt);
    return sp;
  }

  function drawSprite(sp, txt) {
    const { c, g, tex, bg, fg } = sp.userData;
    g.clearRect(0, 0, c.width, c.height);
    if (!txt) { sp.visible = false; return; }
    sp.visible = true;
    g.fillStyle = bg; g.strokeStyle = '#0f172a'; g.lineWidth = 5;
    g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 18); g.fill(); g.stroke();
    g.fillStyle = fg; g.font = 'bold 26px Segoe UI, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    // Auto wrap max 2 lines
    if (txt.length > 26) {
      const mid = txt.lastIndexOf(' ', 25) || 25;
      g.fillText(txt.slice(0, mid), c.width / 2, c.height * 0.36);
      g.fillText(txt.slice(mid + 1), c.width / 2, c.height * 0.68);
    } else {
      g.fillText(txt, c.width / 2, c.height / 2);
    }
    tex.needsUpdate = true;
  }

  const mSkin = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
  const mHair = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.8 });

  function mkHuman(name, shirtCol, pantCol, scale = 1, isSaree = false) {
    const grp = new THREE.Group();
    const mShirt = new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.55 });
    const mPant = new THREE.MeshStandardMaterial({ color: pantCol, roughness: 0.65 });

    // Legs Pivot (Hip Y = 2.6 * scale)
    const lLeg = new THREE.Group(); lLeg.position.set(-0.32 * scale, 2.5 * scale, 0);
    const rLeg = new THREE.Group(); rLeg.position.set(0.32 * scale, 2.5 * scale, 0);
    if (isSaree) {
      // Saree Pleated Skirt
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.55 * scale, 0.82 * scale, 2.6 * scale, 16), mShirt);
      skirt.position.y = 1.3 * scale; skirt.castShadow = true; grp.add(skirt);
    } else {
      const lM = new THREE.Mesh(new THREE.BoxGeometry(0.42 * scale, 2.5 * scale, 0.46 * scale), mPant);
      lM.position.y = -1.25 * scale; lM.castShadow = true; lLeg.add(lM);
      const rM = lM.clone(); rLeg.add(rM);
      grp.add(lLeg, rLeg);
    }

    // Torso Pivot (allows sitting/sleeping tilt)
    const torso = new THREE.Group(); torso.position.set(0, 2.5 * scale, 0);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.15 * scale, 1.8 * scale, 0.65 * scale), mShirt);
    body.position.y = 0.9 * scale; body.castShadow = true; torso.add(body);

    if (isSaree) {
      // Golden Saree Pallu Sash across shoulder
      const pallu = new THREE.Mesh(new THREE.BoxGeometry(1.22 * scale, 0.35 * scale, 0.72 * scale), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
      pallu.position.y = 1.0 * scale; pallu.rotation.z = 0.65; torso.add(pallu);
    }

    // Head + Hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.48 * scale, 16, 16), mSkin);
    head.position.y = 2.25 * scale; head.castShadow = true; torso.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.5 * scale, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), mHair);
    hair.position.y = 2.3 * scale; torso.add(hair);
    if (isSaree) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 10, 10), mHair);
      bun.position.set(0, 2.15 * scale, -0.45 * scale); torso.add(bun);
    }

    // Arms
    const lArm = new THREE.Group(); lArm.position.set(-0.75 * scale, 1.65 * scale, 0);
    const rArm = new THREE.Group(); rArm.position.set(0.75 * scale, 1.65 * scale, 0);
    const aM = new THREE.Mesh(new THREE.BoxGeometry(0.32 * scale, 1.65 * scale, 0.34 * scale), isSaree ? mSkin : mShirt);
    aM.position.y = -0.75 * scale; aM.castShadow = true; lArm.add(aM); rArm.add(aM.clone());
    torso.add(lArm, rArm);
    grp.add(torso);

    // Overhead Name Tag + Speech Bubble
    const tag = mkSprite(name, 'rgba(15,23,42,0.88)', '#38bdf8', 300, 66, 3.0, 0.68);
    tag.position.set(0, 5.7 * scale, 0); grp.add(tag);
    const bubble = mkSprite('', '#ffffff', '#0f172a', 460, 105, 5.2, 1.25);
    bubble.position.set(0, 6.9 * scale, 0); bubble.visible = false; grp.add(bubble);

    scene.add(grp);
    return { grp, torso, lLeg, rLeg, lArm, rArm, head, bubble, timer: 0 };
  }

  // 1. Rohit Mishra (Playable Main Character — Jeans + Blue Kurta/Shirt)
  const rohit = mkHuman('Rohit Mishra', 0x0284c7, 0x1e293b, 1.0, false);
  rohit.grp.position.set(5.4, P, 21.0);

  // 2. Suman Mausi (Kitchen — Red/Gold Saree making Tea!)
  const mausi = mkHuman('Suman Mausi', 0xdc2626, 0x991b1b, 0.94, true);
  mausi.grp.position.set(17.6, P, 45.2);
  mausi.grp.rotation.y = Math.PI / 2; // Facing East stove
  mausi.cooldown = 0;

  // 3. Sanjana (Bedroom 2 — Studying at Chair & Table)
  const sanjana = mkHuman('Sanjana', 0xec4899, 0x4c1d95, 0.88, false);
  sanjana.grp.position.set(13.6, P, 15.3);
  sanjana.grp.rotation.y = Math.PI; // Facing North table
  sanjana.standing = false; sanjana.greetCd = 0;

  // 4. Krishna (Bedroom 3 — Small Boy Studying at Chair & Table)
  const krishna = mkHuman('Krishna', 0x22c55e, 0x1e3a8a, 0.72, false);
  krishna.grp.position.set(13.6, P, 26.8);
  krishna.grp.rotation.y = Math.PI;
  krishna.standing = false; krishna.greetCd = 0;

  // 5. Sanjay Mausa (Bedroom 1 — Sleeping on King Bed!)
  const mausa = mkHuman('Sanjay Mausa', 0xf59e0b, 0x475569, 0.98, false);
  mausa.grp.position.set(18.2, P + 1.85, 6.5);
  mausa.grp.rotation.y = Math.PI; // Feet toward North, Head South
  mausa.lLeg.rotation.x = -Math.PI / 2; mausa.rLeg.rotation.x = -Math.PI / 2;
  mausa.torso.rotation.x = Math.PI / 2; // Lying flat sleeping!
  mausa.awake = false;

  function say(ch, text, sec = 4.0) {
    drawSprite(ch.bubble, text);
    ch.timer = sec;
    // Hindi/Indian Voice Speech Synthesis (Safe fallback if muted/unsupported)
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'hi-IN'; u.rate = 0.98;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  return { rohit, mausi, sanjana, krishna, mausa, say, drawSprite };
};
