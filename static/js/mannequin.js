/**
 * R&L Fitness - Clean Humanoid Character & Exercise Stage Props
 * 
 * Features a recognizable, athletic human character model:
 * - Natural human face, hair, eyes, and skin tone
 * - Modern athletic fitness apparel (Sage Green gym top, Dark Slate shorts, running sneakers)
 * - Anatomically smooth joints (no robotic spheres or mechanical rings)
 * - Calibrated props: Workout mat, living room sofa/bench, wooden gym chair
 */

class MannequinBuilder {
  constructor(THREE) {
    this.THREE = THREE || (typeof window !== 'undefined' ? window.THREE : (typeof global !== 'undefined' ? global.THREE : null));
    const T = this.THREE;

    // Materials Palette
    // 1. Natural Human Skin
    this.matSkin = new T.MeshStandardMaterial({
      color: 0xEDBCA4,
      roughness: 0.55,
      metalness: 0.02
    });

    // 2. Athletic Hair
    this.matHair = new T.MeshStandardMaterial({
      color: 0x2A211B,
      roughness: 0.70,
      metalness: 0.05
    });

    // 3. Eyes & Facial Details
    this.matSclera = new T.MeshBasicMaterial({ color: 0xFFFFFF });
    this.matIris = new T.MeshBasicMaterial({ color: 0x241F1C });
    this.matBrows = new T.MeshBasicMaterial({ color: 0x2A211B });
    this.matLips = new T.MeshStandardMaterial({
      color: 0xD69989,
      roughness: 0.60,
      metalness: 0.0
    });

    // 4. Fitness Apparel - Sage Green Gym Top (#8FA28A)
    this.matGymShirt = new T.MeshStandardMaterial({
      color: 0x8FA28A,
      roughness: 0.45,
      metalness: 0.08
    });

    // Light Sage Collar & Sleeve Trim (#C7D3C0)
    this.matShirtTrim = new T.MeshStandardMaterial({
      color: 0xC7D3C0,
      roughness: 0.40,
      metalness: 0.05
    });

    // 5. Fitness Apparel - Dark Slate Shorts (#273329)
    this.matGymShorts = new T.MeshStandardMaterial({
      color: 0x273329,
      roughness: 0.50,
      metalness: 0.05
    });

    // Gold Trim on Shorts (#C8A96B)
    this.matGoldTrim = new T.MeshStandardMaterial({
      color: 0xC8A96B,
      roughness: 0.35,
      metalness: 0.30
    });

    // 6. Athletic Ankle Socks & Sneaker Midsoles (#F7F4ED)
    this.matSocks = new T.MeshStandardMaterial({
      color: 0xF7F4ED,
      roughness: 0.80,
      metalness: 0.02
    });

    // Sneaker Upper (#2C382E)
    this.matSneakerUpper = new T.MeshStandardMaterial({
      color: 0x2C382E,
      roughness: 0.45,
      metalness: 0.15
    });

    // Sneaker Sole Tread (#C8A96B)
    this.matSneakerSole = new T.MeshStandardMaterial({
      color: 0xC8A96B,
      roughness: 0.40,
      metalness: 0.20
    });

    // Stage Props Materials
    this.matMat = new T.MeshStandardMaterial({
      color: 0x6E836A,
      roughness: 0.90,
      metalness: 0.02
    });

    this.matBenchCushion = new T.MeshStandardMaterial({
      color: 0x364238,
      roughness: 0.55,
      metalness: 0.10
    });

    this.matWood = new T.MeshStandardMaterial({
      color: 0xB89D74,
      roughness: 0.45,
      metalness: 0.05
    });

    this.matMetal = new T.MeshStandardMaterial({
      color: 0x2A332C,
      roughness: 0.30,
      metalness: 0.75
    });
  }

  /**
   * Builds an athletic, clean humanoid character model
   * Total height ~ 1.78m. Standing pelvis at Y = 1.04m, feet grounded at Y = 0.00m.
   */
  buildMannequin() {
    const T = this.THREE;
    const root = new T.Group();
    root.name = 'mannequinRoot';

    // Pelvis group (Center of mass)
    const pelvis = new T.Group();
    pelvis.name = 'pelvis';
    pelvis.position.set(0, 1.04, 0);
    root.add(pelvis);

    // =========================================================================
    // ATHLETIC SHORTS & HIPS (Pelvis Core)
    // =========================================================================
    // Main pelvic block in shorts fabric
    const shortsCore = new T.Mesh(new T.CylinderGeometry(0.18, 0.15, 0.17, 24), this.matGymShorts);
    shortsCore.castShadow = true;
    pelvis.add(shortsCore);

    // Gluteus fullness in athletic fabric
    const gluteGeo = new T.SphereGeometry(0.115, 18, 18);
    const lGlute = new T.Mesh(gluteGeo, this.matGymShorts);
    lGlute.position.set(-0.085, -0.02, -0.07);
    lGlute.scale.set(1.0, 1.15, 0.90);
    lGlute.castShadow = true;
    pelvis.add(lGlute);

    const rGlute = new T.Mesh(gluteGeo, this.matGymShorts);
    rGlute.position.set(0.085, -0.02, -0.07);
    rGlute.scale.set(1.0, 1.15, 0.90);
    rGlute.castShadow = true;
    pelvis.add(rGlute);

    // Shorts waistband with subtle gold trim
    const waistband = new T.Mesh(new T.CylinderGeometry(0.183, 0.183, 0.03, 24), this.matGoldTrim);
    waistband.position.y = 0.08;
    pelvis.add(waistband);

    // Left & Right Shorts Leg Openings
    const lShortsLeg = new T.Mesh(new T.CylinderGeometry(0.11, 0.105, 0.13, 20), this.matGymShorts);
    lShortsLeg.position.set(-0.11, -0.10, 0);
    lShortsLeg.castShadow = true;
    pelvis.add(lShortsLeg);

    const rShortsLeg = new T.Mesh(new T.CylinderGeometry(0.11, 0.105, 0.13, 20), this.matGymShorts);
    rShortsLeg.position.set(0.11, -0.10, 0);
    rShortsLeg.castShadow = true;
    pelvis.add(rShortsLeg);

    // =========================================================================
    // SPINE, ABDOMINAL CORE & ATHLETIC GYM TOP
    // =========================================================================
    const spine = new T.Group();
    spine.name = 'spine';
    spine.position.y = 0.09;
    pelvis.add(spine);

    // Midsection / Abdominal core in Sage Green Gym Shirt
    const waistShirt = new T.Mesh(new T.CylinderGeometry(0.20, 0.175, 0.18, 24), this.matGymShirt);
    waistShirt.position.y = 0.09;
    waistShirt.castShadow = true;
    spine.add(waistShirt);

    // Thoracic Chest & Pectorals
    const chest = new T.Group();
    chest.name = 'chest';
    chest.position.y = 0.18;
    spine.add(chest);

    // Main ribcage block with athletic V-taper
    const ribcage = new T.Mesh(new T.CylinderGeometry(0.235, 0.195, 0.22, 24), this.matGymShirt);
    ribcage.position.y = 0.11;
    ribcage.castShadow = true;
    chest.add(ribcage);

    // Pectoral muscle pads sculpted into the shirt
    const pecGeo = new T.BoxGeometry(0.115, 0.11, 0.06);
    const lPec = new T.Mesh(pecGeo, this.matGymShirt);
    lPec.position.set(-0.075, 0.13, 0.165);
    lPec.rotation.set(-0.05, 0, -0.06);
    lPec.castShadow = true;
    chest.add(lPec);

    const rPec = new T.Mesh(pecGeo, this.matGymShirt);
    rPec.position.set(0.075, 0.13, 0.165);
    rPec.rotation.set(-0.05, 0, 0.06);
    rPec.castShadow = true;
    chest.add(rPec);

    // Crew-neck shirt collar in Light Sage
    const collar = new T.Mesh(new T.TorusGeometry(0.092, 0.016, 12, 24), this.matShirtTrim);
    collar.position.set(0, 0.22, 0.02);
    collar.rotation.x = Math.PI / 2;
    chest.add(collar);

    // =========================================================================
    // HUMAN NECK & HEAD WITH NATURAL FACIAL FEATURES & HAIR
    // =========================================================================
    const neck = new T.Group();
    neck.name = 'neck';
    neck.position.y = 0.23;
    chest.add(neck);

    // Natural human neck in skin tone
    const neckMesh = new T.Mesh(new T.CylinderGeometry(0.075, 0.085, 0.10, 20), this.matSkin);
    neckMesh.position.y = 0.05;
    neckMesh.castShadow = true;
    neck.add(neckMesh);

    const headGroup = new T.Group();
    headGroup.name = 'headGroup';
    headGroup.position.y = 0.11;
    neck.add(headGroup);

    // 1. Natural Human Skull / Cranium (Skin)
    const headGeo = new T.SphereGeometry(0.12, 24, 24);
    const cranium = new T.Mesh(headGeo, this.matSkin);
    cranium.scale.set(0.90, 1.14, 1.02);
    cranium.position.y = 0.09;
    cranium.castShadow = true;
    headGroup.add(cranium);

    // 2. Human Jaw & Chin
    const jawGeo = new T.CylinderGeometry(0.08, 0.055, 0.08, 16);
    const jaw = new T.Mesh(jawGeo, this.matSkin);
    jaw.position.set(0, 0.01, 0.04);
    jaw.scale.set(0.9, 1.0, 1.1);
    headGroup.add(jaw);

    // 3. Human Athletic Hair (Sculpted crop on crown, back & temples)
    const hairCrown = new T.Mesh(new T.SphereGeometry(0.126, 24, 16), this.matHair);
    hairCrown.position.set(0, 0.12, -0.01);
    hairCrown.scale.set(0.92, 0.95, 1.05);
    hairCrown.castShadow = true;
    headGroup.add(hairCrown);

    const hairFringe = new T.Mesh(new T.BoxGeometry(0.13, 0.035, 0.06), this.matHair);
    hairFringe.position.set(0, 0.18, 0.07);
    hairFringe.rotation.x = -0.25;
    headGroup.add(hairFringe);

    // 4. Human Facial Profile: Nose
    const noseGeo = new T.ConeGeometry(0.022, 0.045, 10);
    const nose = new T.Mesh(noseGeo, this.matSkin);
    nose.position.set(0, 0.085, 0.135);
    nose.rotation.x = Math.PI / 2 + 0.15;
    headGroup.add(nose);

    // 5. Stylized Human Eyes (Sclera + Iris)
    const eyeGeo = new T.SphereGeometry(0.018, 14, 14);
    const pupilGeo = new T.SphereGeometry(0.010, 12, 12);

    // Left Eye
    const lEyeWhite = new T.Mesh(eyeGeo, this.matSclera);
    lEyeWhite.scale.set(1.2, 0.8, 0.5);
    lEyeWhite.position.set(-0.042, 0.105, 0.112);
    headGroup.add(lEyeWhite);

    const lPupil = new T.Mesh(pupilGeo, this.matIris);
    lPupil.position.set(-0.042, 0.105, 0.122);
    headGroup.add(lPupil);

    // Right Eye
    const rEyeWhite = new T.Mesh(eyeGeo, this.matSclera);
    rEyeWhite.scale.set(1.2, 0.8, 0.5);
    rEyeWhite.position.set(0.042, 0.105, 0.112);
    headGroup.add(rEyeWhite);

    const rPupil = new T.Mesh(pupilGeo, this.matIris);
    rPupil.position.set(0.042, 0.105, 0.122);
    headGroup.add(rPupil);

    // 6. Natural Eyebrows
    const browGeo = new T.BoxGeometry(0.036, 0.008, 0.015);
    const lBrow = new T.Mesh(browGeo, this.matBrows);
    lBrow.position.set(-0.044, 0.126, 0.114);
    lBrow.rotation.z = -0.08;
    headGroup.add(lBrow);

    const rBrow = new T.Mesh(browGeo, this.matBrows);
    rBrow.position.set(0.044, 0.126, 0.114);
    rBrow.rotation.z = 0.08;
    headGroup.add(rBrow);

    // 7. Lips / Mouth
    const lips = new T.Mesh(new T.BoxGeometry(0.045, 0.010, 0.02), this.matLips);
    lips.position.set(0, 0.042, 0.124);
    headGroup.add(lips);

    // 8. Human Ears
    const earGeo = new T.CylinderGeometry(0.016, 0.012, 0.04, 12);
    const lEar = new T.Mesh(earGeo, this.matSkin);
    lEar.position.set(-0.115, 0.085, 0.01);
    lEar.rotation.z = 0.2;
    headGroup.add(lEar);

    const rEar = new T.Mesh(earGeo, this.matSkin);
    rEar.position.set(0.115, 0.085, 0.01);
    rEar.rotation.z = -0.2;
    headGroup.add(rEar);

    // =========================================================================
    // SHOULDERS, BARE ARMS & NATURAL HUMAN HANDS
    // =========================================================================

    // LEFT ARM
    const leftShoulder = new T.Group();
    leftShoulder.name = 'leftShoulder';
    leftShoulder.position.set(-0.25, 0.19, 0);
    chest.add(leftShoulder);

    // Shirt sleeve on shoulder in Sage Green
    const lSleeve = new T.Mesh(new T.CylinderGeometry(0.082, 0.078, 0.12, 18), this.matGymShirt);
    lSleeve.position.y = -0.04;
    lSleeve.castShadow = true;
    leftShoulder.add(lSleeve);

    // Sleeve rim in Light Sage
    const lSleeveRim = new T.Mesh(new T.TorusGeometry(0.079, 0.008, 8, 20), this.matShirtTrim);
    lSleeveRim.position.y = -0.095;
    lSleeveRim.rotation.x = Math.PI / 2;
    leftShoulder.add(lSleeveRim);

    const leftUpperArm = new T.Group();
    leftUpperArm.name = 'leftUpperArm';
    leftShoulder.add(leftUpperArm);

    // Bare muscular human arm in natural skin tone (biceps/triceps)
    const lBicepMesh = new T.Mesh(new T.CylinderGeometry(0.070, 0.060, 0.28, 18), this.matSkin);
    lBicepMesh.position.y = -0.14;
    lBicepMesh.castShadow = true;
    leftUpperArm.add(lBicepMesh);

    // Smooth anatomical elbow (flesh tone, no mechanical rings)
    const leftElbow = new T.Group();
    leftElbow.name = 'leftElbow';
    leftElbow.position.y = -0.28;
    leftUpperArm.add(leftElbow);

    const lElbowJointMesh = new T.Mesh(new T.SphereGeometry(0.058, 16, 16), this.matSkin);
    leftElbow.add(lElbowJointMesh);

    const leftForearm = new T.Group();
    leftForearm.name = 'leftForearm';
    leftElbow.add(leftForearm);

    // Tapered muscular forearm in skin tone
    const lForearmMesh = new T.Mesh(new T.CylinderGeometry(0.058, 0.046, 0.26, 18), this.matSkin);
    lForearmMesh.position.y = -0.13;
    lForearmMesh.castShadow = true;
    leftForearm.add(lForearmMesh);

    // Left Human Hand: palm with thumb & relaxed fingers
    const leftHand = new T.Group();
    leftHand.name = 'leftHand';
    leftHand.position.y = -0.26;
    leftForearm.add(leftHand);

    const lPalm = new T.Mesh(new T.BoxGeometry(0.065, 0.085, 0.032), this.matSkin);
    lPalm.position.set(0, -0.042, 0);
    lPalm.castShadow = true;
    leftHand.add(lPalm);

    const lThumb = new T.Mesh(new T.BoxGeometry(0.022, 0.045, 0.022), this.matSkin);
    lThumb.position.set(0.035, -0.03, 0.015);
    lThumb.rotation.z = -0.35;
    leftHand.add(lThumb);

    const lFingers = new T.Mesh(new T.BoxGeometry(0.060, 0.040, 0.026), this.matSkin);
    lFingers.position.set(0, -0.095, 0);
    leftHand.add(lFingers);

    // RIGHT ARM
    const rightShoulder = new T.Group();
    rightShoulder.name = 'rightShoulder';
    rightShoulder.position.set(0.25, 0.19, 0);
    chest.add(rightShoulder);

    const rSleeve = new T.Mesh(new T.CylinderGeometry(0.082, 0.078, 0.12, 18), this.matGymShirt);
    rSleeve.position.y = -0.04;
    rSleeve.castShadow = true;
    rightShoulder.add(rSleeve);

    const rSleeveRim = new T.Mesh(new T.TorusGeometry(0.079, 0.008, 8, 20), this.matShirtTrim);
    rSleeveRim.position.y = -0.095;
    rSleeveRim.rotation.x = Math.PI / 2;
    rightShoulder.add(rSleeveRim);

    const rightUpperArm = new T.Group();
    rightUpperArm.name = 'rightUpperArm';
    rightShoulder.add(rightUpperArm);

    const rBicepMesh = new T.Mesh(new T.CylinderGeometry(0.070, 0.060, 0.28, 18), this.matSkin);
    rBicepMesh.position.y = -0.14;
    rBicepMesh.castShadow = true;
    rightUpperArm.add(rBicepMesh);

    const rightElbow = new T.Group();
    rightElbow.name = 'rightElbow';
    rightElbow.position.y = -0.28;
    rightUpperArm.add(rightElbow);

    const rElbowJointMesh = new T.Mesh(new T.SphereGeometry(0.058, 16, 16), this.matSkin);
    rightElbow.add(rElbowJointMesh);

    const rightForearm = new T.Group();
    rightForearm.name = 'rightForearm';
    rightElbow.add(rightForearm);

    const rForearmMesh = new T.Mesh(new T.CylinderGeometry(0.058, 0.046, 0.26, 18), this.matSkin);
    rForearmMesh.position.y = -0.13;
    rForearmMesh.castShadow = true;
    rightForearm.add(rForearmMesh);

    // Right Human Hand
    const rightHand = new T.Group();
    rightHand.name = 'rightHand';
    rightHand.position.y = -0.26;
    rightForearm.add(rightHand);

    const rPalm = new T.Mesh(new T.BoxGeometry(0.065, 0.085, 0.032), this.matSkin);
    rPalm.position.set(0, -0.042, 0);
    rPalm.castShadow = true;
    rightHand.add(rPalm);

    const rThumb = new T.Mesh(new T.BoxGeometry(0.022, 0.045, 0.022), this.matSkin);
    rThumb.position.set(-0.035, -0.03, 0.015);
    rThumb.rotation.z = 0.35;
    rightHand.add(rThumb);

    const rFingers = new T.Mesh(new T.BoxGeometry(0.060, 0.040, 0.026), this.matSkin);
    rFingers.position.set(0, -0.095, 0);
    rightHand.add(rFingers);

    // =========================================================================
    // LEGS: MUSCULAR LEGS, SMOOTH KNEES, ANKLES & ATHLETIC SNEAKERS
    // Thigh (0.46m) -> Knee -> Shin (0.44m) -> Foot & Sneaker (0.08m)
    // Standing Pelvis = 1.04m -> Foot bottom firmly on ground at Y = 0.00m!
    // =========================================================================

    // LEFT LEG
    const leftHip = new T.Group();
    leftHip.name = 'leftHip';
    leftHip.position.set(-0.13, -0.06, 0);
    pelvis.add(leftHip);

    const leftThigh = new T.Group();
    leftThigh.name = 'leftThigh';
    leftHip.add(leftThigh);

    // Bare muscular thigh in skin tone emerging from shorts
    const lQuadMesh = new T.Mesh(new T.CylinderGeometry(0.096, 0.078, 0.46, 20), this.matSkin);
    lQuadMesh.position.y = -0.23;
    lQuadMesh.castShadow = true;
    leftThigh.add(lQuadMesh);

    // Natural human knee (smooth flesh patella, no metallic parts)
    const leftKnee = new T.Group();
    leftKnee.name = 'leftKnee';
    leftKnee.position.y = -0.46;
    leftThigh.add(leftKnee);

    const lKneeJointMesh = new T.Mesh(new T.SphereGeometry(0.076, 18, 18), this.matSkin);
    lKneeJointMesh.scale.set(0.95, 1.05, 1.1);
    leftKnee.add(lKneeJointMesh);

    const leftShin = new T.Group();
    leftShin.name = 'leftShin';
    leftKnee.add(leftShin);

    // Muscular human calf & shin tapering down to ankle
    const lCalfMesh = new T.Mesh(new T.CylinderGeometry(0.074, 0.054, 0.44, 20), this.matSkin);
    lCalfMesh.position.y = -0.22;
    lCalfMesh.castShadow = true;
    leftShin.add(lCalfMesh);

    // Left Athletic Ankle & Modern Sneaker
    const leftFoot = new T.Group();
    leftFoot.name = 'leftFoot';
    leftFoot.position.y = -0.44;
    leftShin.add(leftFoot);

    // Ankle Sock in Warm Cream (#F7F4ED)
    const lSock = new T.Mesh(new T.CylinderGeometry(0.056, 0.056, 0.05, 16), this.matSocks);
    lSock.position.y = 0.025;
    leftFoot.add(lSock);

    // Sneaker Upper (#2C382E)
    const lSneakerUpper = new T.Mesh(new T.BoxGeometry(0.11, 0.075, 0.24), this.matSneakerUpper);
    lSneakerUpper.position.set(0, -0.04, 0.05);
    lSneakerUpper.castShadow = true;
    leftFoot.add(lSneakerUpper);

    // Cushioned Sneaker Midsole (#F7F4ED)
    const lSneakerMidsole = new T.Mesh(new T.BoxGeometry(0.116, 0.025, 0.25), this.matSocks);
    lSneakerMidsole.position.set(0, -0.070, 0.05);
    leftFoot.add(lSneakerMidsole);

    // Durable Gripping Sole (#C8A96B)
    const lSole = new T.Mesh(new T.BoxGeometry(0.116, 0.012, 0.25), this.matSneakerSole);
    lSole.position.set(0, -0.082, 0.05);
    leftFoot.add(lSole);

    // RIGHT LEG
    const rightHip = new T.Group();
    rightHip.name = 'rightHip';
    rightHip.position.set(0.13, -0.06, 0);
    pelvis.add(rightHip);

    const rightThigh = new T.Group();
    rightThigh.name = 'rightThigh';
    rightHip.add(rightThigh);

    const rQuadMesh = new T.Mesh(new T.CylinderGeometry(0.096, 0.078, 0.46, 20), this.matSkin);
    rQuadMesh.position.y = -0.23;
    rQuadMesh.castShadow = true;
    rightThigh.add(rQuadMesh);

    // Natural human knee
    const rightKnee = new T.Group();
    rightKnee.name = 'rightKnee';
    rightKnee.position.y = -0.46;
    rightThigh.add(rightKnee);

    const rKneeJointMesh = new T.Mesh(new T.SphereGeometry(0.076, 18, 18), this.matSkin);
    rKneeJointMesh.scale.set(0.95, 1.05, 1.1);
    rightKnee.add(rKneeJointMesh);

    const rightShin = new T.Group();
    rightShin.name = 'rightShin';
    rightKnee.add(rightShin);

    const rCalfMesh = new T.Mesh(new T.CylinderGeometry(0.074, 0.054, 0.44, 20), this.matSkin);
    rCalfMesh.position.y = -0.22;
    rCalfMesh.castShadow = true;
    rightShin.add(rCalfMesh);

    // Right Athletic Ankle & Modern Sneaker
    const rightFoot = new T.Group();
    rightFoot.name = 'rightFoot';
    rightFoot.position.y = -0.44;
    rightShin.add(rightFoot);

    const rSock = new T.Mesh(new T.CylinderGeometry(0.056, 0.056, 0.05, 16), this.matSocks);
    rSock.position.y = 0.025;
    rightFoot.add(rSock);

    const rSneakerUpper = new T.Mesh(new T.BoxGeometry(0.11, 0.075, 0.24), this.matSneakerUpper);
    rSneakerUpper.position.set(0, -0.04, 0.05);
    rSneakerUpper.castShadow = true;
    rightFoot.add(rSneakerUpper);

    const rSneakerMidsole = new T.Mesh(new T.BoxGeometry(0.116, 0.025, 0.25), this.matSocks);
    rSneakerMidsole.position.set(0, -0.070, 0.05);
    rightFoot.add(rSneakerMidsole);

    const rSole = new T.Mesh(new T.BoxGeometry(0.116, 0.012, 0.25), this.matSneakerSole);
    rSole.position.set(0, -0.082, 0.05);
    rightFoot.add(rSole);

    // =========================================================================
    // EXPOSE JOINTS REFERENCE DICTIONARY
    // =========================================================================
    const joints = {
      root,
      pelvis,
      spine,
      chest,
      neck,
      headGroup,
      leftShoulder,
      leftUpperArm,
      leftElbow,
      leftForearm,
      leftHand,
      rightShoulder,
      rightUpperArm,
      rightElbow,
      rightForearm,
      rightHand,
      leftHip,
      leftThigh,
      leftKnee,
      leftShin,
      leftFoot,
      rightHip,
      rightThigh,
      rightKnee,
      rightShin,
      rightFoot
    };

    return { root, joints };
  }

  /**
   * Builds Stage Props (Workout Mat, Living Room Sofa/Bench, Gym Chair)
   */
  buildProps() {
    const T = this.THREE;
    const propsRoot = new T.Group();
    propsRoot.name = 'propsRoot';

    // 1. Studio Stage Ground Shadow Receiver
    const floorGeo = new T.PlaneGeometry(16, 16);
    const floorMat = new T.ShadowMaterial({ opacity: 0.18 });
    const floor = new T.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    floor.receiveShadow = true;
    propsRoot.add(floor);

    // Ground aesthetic circle ring in Sage Green
    const ringGeo = new T.RingGeometry(1.2, 1.24, 64);
    const ringMat = new T.MeshBasicMaterial({
      color: 0x8FA28A,
      side: T.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new T.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    propsRoot.add(ring);

    // 2. Exercise Mat (for push-ups, superman, crunches, plank)
    const matGroup = new T.Group();
    matGroup.name = 'exerciseMat';
    matGroup.visible = false;
    propsRoot.add(matGroup);

    const matMesh = new T.Mesh(new T.BoxGeometry(0.85, 0.025, 2.05), this.matMat);
    matMesh.position.set(0, 0.0125, 0);
    matMesh.receiveShadow = true;
    matGroup.add(matMesh);

    const matBorder = new T.Mesh(
      new T.BoxGeometry(0.89, 0.008, 2.09),
      new T.MeshStandardMaterial({ color: 0xC8A96B, roughness: 0.4 })
    );
    matBorder.position.set(0, 0.004, 0);
    matGroup.add(matBorder);

    // 3. Bench / Sofa (for bench dips)
    const benchGroup = new T.Group();
    benchGroup.name = 'benchProp';
    benchGroup.visible = false;
    propsRoot.add(benchGroup);

    // Cushion
    const benchCushion = new T.Mesh(new T.BoxGeometry(1.30, 0.16, 0.65), this.matBenchCushion);
    benchCushion.position.set(0, 0.46, -0.45);
    benchCushion.castShadow = true;
    benchCushion.receiveShadow = true;
    benchGroup.add(benchCushion);

    // Sofa Base
    const benchBase = new T.Mesh(new T.BoxGeometry(1.26, 0.36, 0.61), this.matWood);
    benchBase.position.set(0, 0.20, -0.45);
    benchBase.castShadow = true;
    benchGroup.add(benchBase);

    // Sofa feet
    const footGeo = new T.CylinderGeometry(0.035, 0.025, 0.06, 12);
    [[-0.55, -0.68], [0.55, -0.68], [-0.55, -0.22], [0.55, -0.22]].forEach(([x, z]) => {
      const foot = new T.Mesh(footGeo, this.matMetal);
      foot.position.set(x, 0.03, z);
      benchGroup.add(foot);
    });

    // 4. Sturdy Chair (for step-ups)
    const chairGroup = new T.Group();
    chairGroup.name = 'chairProp';
    chairGroup.visible = false;
    propsRoot.add(chairGroup);

    // Seat at Y = 0.45m
    const chairSeat = new T.Mesh(new T.BoxGeometry(0.48, 0.045, 0.48), this.matWood);
    chairSeat.position.set(0, 0.45, 0.35);
    chairSeat.castShadow = true;
    chairSeat.receiveShadow = true;
    chairGroup.add(chairSeat);

    // Chair Backrest
    const backRest = new T.Mesh(new T.BoxGeometry(0.44, 0.40, 0.03), this.matWood);
    backRest.position.set(0, 0.68, 0.57);
    backRest.castShadow = true;
    chairGroup.add(backRest);

    // Backrest supports
    const bSupportGeo = new T.CylinderGeometry(0.016, 0.016, 0.42, 10);
    const lBSupport = new T.Mesh(bSupportGeo, this.matMetal);
    lBSupport.position.set(-0.18, 0.65, 0.57);
    chairGroup.add(lBSupport);

    const rBSupport = new T.Mesh(bSupportGeo, this.matMetal);
    rBSupport.position.set(0.18, 0.65, 0.57);
    chairGroup.add(rBSupport);

    // Chair Legs
    const legGeo = new T.CylinderGeometry(0.020, 0.016, 0.44, 12);
    [[-0.20, 0.15], [0.20, 0.15], [-0.20, 0.55], [0.20, 0.55]].forEach(([x, z]) => {
      const leg = new T.Mesh(legGeo, this.matMetal);
      leg.position.set(x, 0.22, z);
      leg.castShadow = true;
      chairGroup.add(leg);
    });

    return {
      propsRoot,
      matGroup,
      benchGroup,
      chairGroup
    };
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  window.MannequinBuilder = MannequinBuilder;
}
