/**
 * R&L Fitness - Accurate Anatomical 3D Static Posture Engine
 * 
 * Replaces repetitive animations with textbook static postures:
 * - Precise anatomical form and alignment for each of the 8 core exercises
 * - Correct prone/supine orientations, arm placement, and flat foot contact
 * - No continuous looping or motion: displays a steady, clear posture
 * - Provides rich technical guidance points and camera view presets
 */

class ExerciseAnimations {
  constructor() {
    this.DEFAULT_PELVIS_Y = 1.04; // Standard standing pelvis height

    // Reusable Three.js matrices for real-time flat palm placement
    const T = (typeof window !== 'undefined' && window.THREE) || (typeof global !== 'undefined' && global.THREE) || null;
    if (T) {
      this.palmBasisL = new T.Matrix4().makeBasis(
        new T.Vector3(-1, 0, 0),
        new T.Vector3(0, 0, -1),
        new T.Vector3(0, -1, 0)
      );
      this.palmBasisR = new T.Matrix4().makeBasis(
        new T.Vector3(1, 0, 0),
        new T.Vector3(0, 0, -1),
        new T.Vector3(0, 1, 0)
      );
      this.tempMat = new T.Matrix4();
    }
  }

  /**
   * Resets all joint transforms to standard anatomical standing position
   */
  resetAllJoints(joints) {
    if (!joints) return;

    // Root group
    joints.root.position.set(0, 0, 0);
    joints.root.rotation.set(0, 0, 0);

    // Pelvis
    joints.pelvis.position.set(0, this.DEFAULT_PELVIS_Y, 0);
    joints.pelvis.rotation.set(0, 0, 0);

    // Spine & Chest
    joints.spine.position.set(0, 0.09, 0);
    joints.spine.rotation.set(0, 0, 0);

    joints.chest.position.set(0, 0.18, 0);
    joints.chest.rotation.set(0, 0, 0);

    joints.neck.position.set(0, 0.23, 0);
    joints.neck.rotation.set(0, 0, 0);

    joints.headGroup.position.set(0, 0.11, 0);
    joints.headGroup.rotation.set(0, 0, 0);

    // Arms
    joints.leftShoulder.position.set(-0.25, 0.19, 0);
    joints.leftShoulder.rotation.set(0, 0, 0.08);
    joints.leftUpperArm.rotation.set(0, 0, 0);
    joints.leftElbow.position.set(0, -0.28, 0);
    joints.leftElbow.rotation.set(0, 0, 0);
    joints.leftForearm.rotation.set(0, 0, 0);
    joints.leftHand.position.set(0, -0.26, 0);
    joints.leftHand.rotation.set(0, 0, 0);

    joints.rightShoulder.position.set(0.25, 0.19, 0);
    joints.rightShoulder.rotation.set(0, 0, -0.08);
    joints.rightUpperArm.rotation.set(0, 0, 0);
    joints.rightElbow.position.set(0, -0.28, 0);
    joints.rightElbow.rotation.set(0, 0, 0);
    joints.rightForearm.rotation.set(0, 0, 0);
    joints.rightHand.position.set(0, -0.26, 0);
    joints.rightHand.rotation.set(0, 0, 0);

    // Legs (Standing shoulder-width, feet flat on floor at Y = 0)
    joints.leftHip.position.set(-0.13, -0.06, 0);
    joints.leftHip.rotation.set(0, 0, 0);
    joints.leftThigh.rotation.set(0, 0, 0);
    joints.leftKnee.position.set(0, -0.46, 0);
    joints.leftKnee.rotation.set(0, 0, 0);
    joints.leftShin.position.set(0, 0, 0);
    joints.leftShin.rotation.set(0, 0, 0);
    joints.leftFoot.position.set(0, -0.44, 0);
    joints.leftFoot.rotation.set(0, 0, 0);

    joints.rightHip.position.set(0.13, -0.06, 0);
    joints.rightHip.rotation.set(0, 0, 0);
    joints.rightThigh.rotation.set(0, 0, 0);
    joints.rightKnee.position.set(0, -0.46, 0);
    joints.rightKnee.rotation.set(0, 0, 0);
    joints.rightShin.position.set(0, 0, 0);
    joints.rightShin.rotation.set(0, 0, 0);
    joints.rightFoot.position.set(0, -0.44, 0);
    joints.rightFoot.rotation.set(0, 0, 0);
  }

  /**
   * Applies the exact, static textbook posture for the chosen exercise
   * Returns posture title, description, and Hebrew form cues.
   */
  applyPosture(exerciseId, joints, propsData) {
    this.resetAllJoints(joints);

    // Default: hide all props
    if (propsData) {
      if (propsData.matGroup) propsData.matGroup.visible = false;
      if (propsData.benchGroup) propsData.benchGroup.visible = false;
      if (propsData.chairGroup) propsData.chairGroup.visible = false;
    }

    switch (exerciseId) {
      case 'squats':
        return this.postureSquats(joints, propsData);

      case 'pushups':
        return this.posturePushups(joints, propsData);

      case 'bench-dips':
        return this.postureBenchDips(joints, propsData);

      case 'step-ups':
        return this.postureStepUps(joints, propsData);

      case 'lunges':
        return this.postureLunges(joints, propsData);

      case 'superman':
        return this.postureSuperman(joints, propsData);

      case 'crunches':
        return this.postureCrunches(joints, propsData);

      case 'plank':
        return this.posturePlank(joints, propsData);

      default:
        return this.postureSquats(joints, propsData);
    }
  }

  /**
   * Backward-compatible update method returning static data (no time ticking)
   */
  update(exerciseId, joints, propsData) {
    return this.applyPosture(exerciseId, joints, propsData);
  }

  /**
   * Solves closed-form 2-link leg inverse kinematics for squats.
   * Mathematically guarantees feet remain 100% flat and firmly planted on the floor (Y = 0.08, Z = 0.05).
   */
  solveSquatIK(pelvisY, pelvisZ) {
    const L1 = 0.46; // Hip to Knee
    const L2 = 0.44; // Knee to Ankle
    const ANKLE_Y = 0.08;
    const FOOT_Z = 0.05;

    const hipY = pelvisY - 0.06;
    const hipZ = pelvisZ;

    const dy = ANKLE_Y - hipY;
    const dz = FOOT_Z - hipZ;
    const D = Math.sqrt(dy * dy + dz * dz);
    const clampedD = Math.min(Math.max(D, 0.2), L1 + L2 - 0.001);

    const cosKnee = (L1 * L1 + L2 * L2 - clampedD * clampedD) / (2 * L1 * L2);
    const kneeAngle = Math.PI - Math.acos(Math.min(Math.max(cosKnee, -1), 1));

    const phi = Math.atan2(dz, -dy);
    const cosAlpha = (L1 * L1 + clampedD * clampedD - L2 * L2) / (2 * L1 * clampedD);
    const alpha = Math.acos(Math.min(Math.max(cosAlpha, -1), 1));
    const hipAngle = -(phi + alpha);
    const footAngle = -(hipAngle + kneeAngle);

    return { hipAngle, kneeAngle, footAngle };
  }

  /**
   * Smooth 3-second continuous loop for Squat:
   * Starts in squat position (t=0s), smoothly straightens knees to rise up to full standing (t=1.5s),
   * and lowers back down into squat position (t=3.0s).
   */
  animateSquats(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s, deep squat)
    // s = 1 at peak (t = 1.5s, full standing)
    // s = 0 at end (t = 3.0s, lowers back to squat)
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Pelvis translation:
    // At s = 0 (squat): Y = 0.58, Z = -0.26 (hip hinge backward)
    // At s = 1 (standing): Y = 1.04, Z = 0.00 (tall standing)
    const pelvisY = 0.58 + (1.04 - 0.58) * s;
    const pelvisZ = -0.26 * (1 - s);
    joints.pelvis.position.set(0, pelvisY, pelvisZ);

    // Torso angle:
    // Natural athletic counterbalance: 0.32 rad forward lean in squat, 0.03 rad upright in standing
    const spineRotX = 0.32 * (1 - s) + 0.03 * s;
    joints.spine.rotation.set(spineRotX, 0, 0);

    const chestRotX = -0.04 * (1 - s);
    joints.chest.rotation.set(chestRotX, 0, 0);

    // Head remains aligned forward (neutral cervical spine)
    const neckRotX = -0.28 * (1 - s) - 0.03 * s;
    joints.neck.rotation.set(neckRotX, 0, 0);

    // Arms:
    // In squat: extended straight forward in front of chest at ~80° elevation (-1.45 rad)
    // In standing: arms lower smoothly along the sides (-0.35 rad)
    const shoulderX = -1.45 * (1 - s) - 0.35 * s;
    const elbowX = -0.10 * (1 - s) - 0.15 * s;
    joints.leftShoulder.rotation.set(shoulderX, 0, -0.08);
    joints.leftElbow.rotation.set(elbowX, 0, 0);
    joints.rightShoulder.rotation.set(shoulderX, 0, 0.08);
    joints.rightElbow.rotation.set(elbowX, 0, 0);

    // Lower body IK:
    // Keeps feet completely flat and firmly planted on the floor at Y = 0
    const ik = this.solveSquatIK(pelvisY, pelvisZ);
    const hipZRot = 0.06 * (1 - s); // slight natural outward knee tracking in squat

    joints.leftHip.position.set(-0.14, -0.06, 0);
    joints.leftHip.rotation.set(ik.hipAngle, 0, -hipZRot);
    joints.leftKnee.rotation.set(ik.kneeAngle, 0, 0);
    joints.leftFoot.rotation.set(ik.footAngle, 0, 0);

    joints.rightHip.position.set(0.14, -0.06, 0);
    joints.rightHip.rotation.set(ik.hipAngle, 0, hipZRot);
    joints.rightKnee.rotation.set(ik.kneeAngle, 0, 0);
    joints.rightFoot.rotation.set(ik.footAngle, 0, 0);
  }

  // =========================================================================
  // 1. SQUATS: Smooth 3-Second Looping Cycle (Squat -> Standing -> Squat)
  // =========================================================================
  postureSquats(joints, propsData) {
    // Start character immediately in the squat posture at t = 0
    this.animateSquats(joints, 0);

    return {
      postureTitle: 'סקוואטים (Squats) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: מסקוואט לעמידה מלאה וחזרה',
      cues: [
        'מתחיל במנח סקוואט מלא: ברכיים ב-90 מעלות, אגן מוטה לאחור וזרועות קדימה',
        'יישור הדרגתי וחלק של הברכיים לעלייה עד לעמידה מלאה (1.5 שנ\')',
        'ירידה מבוקרת חזרה למנח הסקוואט (1.5 שנ\')',
        'כפות הרגליים נשארות צמודות ונטועות בחוזקה ברצפה לכל אורך התנועה'
      ],
      defaultCam: { x: 2.6, y: 1.3, z: 2.6, targetY: 0.75, targetZ: 0.0 }
    };
  }

  /**
   * Smooth 3-second continuous loop for Push-ups:
   * Starts with arms fully straight (top push-up position at t=0s),
   * elbows bend downward into lower push-up position (t=1.5s),
   * focusing movement specifically on the elbows while the body remains stable,
   * and pushes back up to straight arms (t=3.0s).
   * Palms are clearly and firmly placed flat on the floor/mat.
   */
  animatePushups(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s): Top position (arms fully straight)
    // s = 1 at midpoint (t = 1.5s): Lower position (elbows bent downward)
    // s = 0 at end (t = 3.0s): Top position (arms fully straight)
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Rigid stable body pivoting at toes on the floor:
    // Top (s=0): rootPosY = 0.14, rootRotX = 1.31
    // Lower (s=1): rootPosY = 0.20, rootRotX = 1.45
    const rootPosY = 0.14 * (1 - s) + 0.20 * s;
    const rootRotX = 1.31 * (1 - s) + 1.45 * s;
    joints.root.position.set(0, rootPosY, -0.75);
    joints.root.rotation.set(rootRotX, 0, 0);

    // Rigid stable core, pelvis, and spine (no sagging or arching):
    joints.pelvis.position.set(0, 0.95, 0);
    joints.pelvis.rotation.set(0, 0, 0);
    joints.spine.rotation.set(0, 0, 0);
    joints.chest.rotation.set(0, 0, 0);
    joints.neck.rotation.set(0.06, 0, 0);

    // Rigid straight legs with toes firmly resting on floor:
    joints.leftHip.rotation.set(0, 0, 0);
    joints.leftKnee.rotation.set(0, 0, 0);
    joints.leftFoot.rotation.set(-0.30, 0, 0);

    joints.rightHip.rotation.set(0, 0, 0);
    joints.rightKnee.rotation.set(0, 0, 0);
    joints.rightFoot.rotation.set(-0.30, 0, 0);

    // Focus movement specifically on the elbows while arms drive the push-up:
    // Top (s=0): elbow is fully straight (0.0 rad)
    // Lower (s=1): elbow bends downward/backward (-0.92 rad)
    const shoulderX = -1.02 * (1 - s) + (-0.68) * s;
    const shoulderY = 0.30 * (1 - s) + (-0.15) * s;
    const shoulderZ = -0.42 * (1 - s) + (-0.65) * s;
    const elbowX = 0.0 * (1 - s) + (-0.92) * s;

    joints.leftShoulder.rotation.set(shoulderX, shoulderY, shoulderZ);
    joints.leftElbow.rotation.set(elbowX, 0, 0);

    joints.rightShoulder.rotation.set(shoulderX, -shoulderY, -shoulderZ);
    joints.rightElbow.rotation.set(elbowX, 0, 0);

    // Update world matrices for torso and forearms before orienting hands
    if (joints.root.updateMatrixWorld) {
      joints.root.updateMatrixWorld(true);
    }

    // Ensure the character's palms are clearly and firmly placed flat on the floor:
    const T = (typeof window !== 'undefined' && window.THREE) || (typeof global !== 'undefined' && global.THREE);
    if (T) {
      if (!this.palmBasisL) {
        this.palmBasisL = new T.Matrix4().makeBasis(
          new T.Vector3(-1, 0, 0),
          new T.Vector3(0, 0, -1),
          new T.Vector3(0, -1, 0)
        );
        this.palmBasisR = new T.Matrix4().makeBasis(
          new T.Vector3(1, 0, 0),
          new T.Vector3(0, 0, -1),
          new T.Vector3(0, 1, 0)
        );
        this.tempMat = new T.Matrix4();
      }

      this.tempMat.copy(joints.leftForearm.matrixWorld).invert().multiply(this.palmBasisL);
      joints.leftHand.rotation.setFromRotationMatrix(this.tempMat, 'XYZ');

      this.tempMat.copy(joints.rightForearm.matrixWorld).invert().multiply(this.palmBasisR);
      joints.rightHand.rotation.setFromRotationMatrix(this.tempMat, 'XYZ');
    }
  }

  // =========================================================================
  // 2. PUSH-UPS: Smooth 3-Second Looping Cycle (Top Straight Arms -> Elbows Bent -> Top)
  // =========================================================================
  posturePushups(joints, propsData) {
    if (propsData && propsData.matGroup) propsData.matGroup.visible = true;

    // Start character immediately in the top push-up posture with straight arms at t = 0
    this.animatePushups(joints, 0);

    return {
      postureTitle: 'שכיבות סמיכה (Push-ups) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: מזרועות ישרות לעיקול מרפקים וחזרה',
      cues: [
        'כפות הידיים מונחות פרוסות וישרות לחלוטין על הרצפה במפתח יציב',
        'התחלת התנועה בזרועות ישרות לחלוטין במנח עליון (Top Position)',
        'כיפוף חלק ומבוקר של המרפקים מטה לירידה של בית החזה בריחוף',
        'הגוף נשאר יציב, ישר ומתוח כיחידה אחת לאורך כל התנועה'
      ],
      defaultCam: { x: 2.4, y: 1.2, z: 2.2, targetY: 0.30, targetZ: 0.10 }
    };
  }

  /**
   * Smooth 3-second continuous loop for Bench Dips:
   * Starts in top position with arms fully straight on the bench cushion edge (t=0s),
   * smoothly lowers body vertically as elbows bend backward to 90 degrees (t=1.5s),
   * and pushes back up with triceps into straight arms (t=3.0s).
   * Hands remain planted on bench edge with fingers forward, heels on floor.
   */
  animateBenchDips(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s): Top position (arms straight, triceps locked out)
    // s = 1 at midpoint (t = 1.5s): Lower position (elbows bent to 90°, hips lowered)
    // s = 0 at end (t = 3.0s): Top position (arms straight)
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Pelvis vertical dip movement in front of bench:
    // Top: Y = 0.60, Z = 0.08
    // Lower: Y = 0.38, Z = 0.08
    const pelvisY = 0.60 * (1 - s) + 0.38 * s;
    joints.pelvis.position.set(0, pelvisY, 0.08);
    joints.spine.rotation.set(-0.04, 0, 0);
    joints.chest.rotation.set(0.04, 0, 0);
    joints.neck.rotation.set(0.02, 0, 0);

    // Arms:
    // Top (s=0): shoulderX = 0.38, elbowX = -0.05 (straight arms on bench cushion)
    // Lower (s=1): shoulderX = 1.40, elbowX = -1.70 (elbows bent to 90°)
    const shoulderX = 0.38 * (1 - s) + 1.40 * s;
    const elbowX = -0.05 * (1 - s) + (-1.70) * s;

    joints.leftShoulder.rotation.set(shoulderX, 0, -0.08);
    joints.leftElbow.rotation.set(elbowX, 0, 0);

    joints.rightShoulder.rotation.set(shoulderX, 0, 0.08);
    joints.rightElbow.rotation.set(elbowX, 0, 0);

    // Legs extended forward onto the floor, resting on heels:
    const hipX = -0.95 * (1 - s) + (-1.26) * s;
    const kneeX = 0.06 * (1 - s) + 0.12 * s;
    const footX = 0.85 * (1 - s) + 1.14 * s;

    joints.leftHip.rotation.set(hipX, 0, -0.06);
    joints.leftKnee.rotation.set(kneeX, 0, 0);
    joints.leftFoot.rotation.set(footX, 0, 0);

    joints.rightHip.rotation.set(hipX, 0, 0.06);
    joints.rightKnee.rotation.set(kneeX, 0, 0);
    joints.rightFoot.rotation.set(footX, 0, 0);

    // Update world matrices for torso and forearms before placing hands
    if (joints.root.updateMatrixWorld) {
      joints.root.updateMatrixWorld(true);
    }

    // Align hands flat on the bench cushion surface with fingers pointing forward:
    const T = (typeof window !== 'undefined' && window.THREE) || (typeof global !== 'undefined' && global.THREE);
    if (T) {
      if (!this.palmBasisL) {
        this.palmBasisL = new T.Matrix4().makeBasis(
          new T.Vector3(-1, 0, 0),
          new T.Vector3(0, 0, -1),
          new T.Vector3(0, -1, 0)
        );
        this.palmBasisR = new T.Matrix4().makeBasis(
          new T.Vector3(1, 0, 0),
          new T.Vector3(0, 0, -1),
          new T.Vector3(0, 1, 0)
        );
        this.tempMat = new T.Matrix4();
      }

      this.tempMat.copy(joints.leftForearm.matrixWorld).invert().multiply(this.palmBasisL);
      joints.leftHand.rotation.setFromRotationMatrix(this.tempMat, 'XYZ');

      this.tempMat.copy(joints.rightForearm.matrixWorld).invert().multiply(this.palmBasisR);
      joints.rightHand.rotation.setFromRotationMatrix(this.tempMat, 'XYZ');
    }
  }

  // =========================================================================
  // 3. BENCH DIPS: Smooth 3-Second Looping Cycle (Top Straight Arms -> 90° Elbows -> Top)
  // =========================================================================
  postureBenchDips(joints, propsData) {
    if (propsData && propsData.benchGroup) propsData.benchGroup.visible = true;

    // Start character immediately in the top dip posture with straight arms at t = 0
    this.animateBenchDips(joints, 0);

    return {
      postureTitle: 'פשיטת מרפקים (Bench Dips) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: מזרועות ישרות לכיפוף 90° וחזרה',
      cues: [
        'כפות הידיים מונחות לאחור על קצה המושב/ספה, אצבעות פונות קדימה',
        'התחלה במנח עליון בזרועות ישרות עם אגן מורם באוויר מחוץ לקצה',
        'ירידה חלקה ומבוקרת תוך כיפוף המרפקים לאחור עד לזווית של 90°',
        'דחיפה חזרה מעלה בעוצמה בעזרת היד האחורית (Triceps) לעמידה זקופה',
        'עקבי הרגליים נשארים נטועים ביציבות על הרצפה לאורך כל התנועה'
      ],
      defaultCam: { x: 2.2, y: 1.1, z: 2.2, targetY: 0.50, targetZ: 0.0 }
    };
  }

  /**
   * Closed-form IK solver for the working leg (right leg) on the chair.
   * Guarantees right foot stays 100% planted on the chair seat at (0.13, 0.52, 0.35).
   */
  solveRightStepUpIK(pelvisY, pelvisZ) {
    const L1 = 0.46; // Thigh
    const L2 = 0.44; // Shin
    const TARGET_Y = 0.52;
    const TARGET_Z = 0.35;

    const hipY = pelvisY - 0.06;
    const hipZ = pelvisZ;

    const dy = TARGET_Y - hipY;
    const dz = TARGET_Z - hipZ;
    const D = Math.sqrt(dy * dy + dz * dz);
    const clampedD = Math.min(Math.max(D, 0.2), L1 + L2 - 0.001);

    const cosKnee = (L1 * L1 + L2 * L2 - clampedD * clampedD) / (2 * L1 * L2);
    const kneeAngle = Math.PI - Math.acos(Math.min(Math.max(cosKnee, -1), 1));

    const phi = Math.atan2(dz, -dy);
    const cosAlpha = (L1 * L1 + clampedD * clampedD - L2 * L2) / (2 * L1 * clampedD);
    const alpha = Math.acos(Math.min(Math.max(cosAlpha, -1), 1));
    const hipAngle = -(phi + alpha);
    const footAngle = -(hipAngle + kneeAngle);

    return { hipAngle, kneeAngle, footAngle };
  }

  /**
   * Smooth 3-second continuous loop for Step-ups on Chair:
   * Starts in elevated position (right leg straight on chair, left leg floating) at t=0s,
   * right leg bends as left floating leg steps down to touch the floor at t=1.5s,
   * and pushes powerfully back up to the starting elevated position on the chair at t=3.0s.
   *
   * Character is positioned slightly to the side of the chair (pelvis X = -0.24m)
   * so the stepping leg (left leg) moves up and down cleanly along the side of the chair
   * with complete clearance (>14cm) and zero clipping through the chair mesh.
   */
  animateStepUps(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s): Top elevated position (right leg straight on chair, left leg floating)
    // s = 1 at midpoint (t = 1.5s): Lower position (right leg bent on chair, left foot touches floor)
    // s = 0 at end (t = 3.0s): Top elevated position (pushed back up onto chair)
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Pelvis translation:
    // Pelvis X = -0.24 places right hip at -0.11m (squarely on chair seat) and left hip at -0.37m (outside chair edge at -0.24m)
    const pelvisX = -0.24;
    const pelvisY = 1.48 * (1 - s) + 1.04 * s;
    const pelvisZ = 0.35 * (1 - s) + 0.15 * s;
    joints.pelvis.position.set(pelvisX, pelvisY, pelvisZ);

    // Torso posture:
    const spineRotX = 0.0 * (1 - s) + 0.15 * s;
    joints.spine.rotation.set(spineRotX, 0, 0);
    joints.chest.rotation.set(-0.04, 0, 0);
    joints.neck.rotation.set(0, 0, 0);

    // Right Leg (Working leg planted securely on chair seat at X = -0.11, Y = 0.52, Z = 0.35):
    const rIK = this.solveRightStepUpIK(pelvisY, pelvisZ);
    joints.rightHip.rotation.set(rIK.hipAngle, 0, 0);
    joints.rightKnee.rotation.set(rIK.kneeAngle, 0, 0);
    joints.rightFoot.rotation.set(rIK.footAngle, 0, 0);

    // Left Leg (Stepping leg moving cleanly along the side of the chair with zero clipping):
    const lHipX = -1.48 * (1 - s) + (-0.10) * s;
    const lKneeX = 1.55 * (1 - s) + 0.15 * s;
    const lFootX = -0.10 * (1 - s) + 0.0 * s;

    joints.leftHip.rotation.set(lHipX, 0, -0.04);
    joints.leftKnee.rotation.set(lKneeX, 0, 0);
    joints.leftFoot.rotation.set(lFootX, 0, 0);

    // Sprinter / athletic arm balance:
    const lShoulderX = -0.65 * (1 - s) + 0.10 * s;
    const rShoulderX = 0.70 * (1 - s) + (-0.30) * s;
    const elbowBend = -1.40 * (1 - s) + (-0.80) * s;

    joints.leftShoulder.rotation.set(lShoulderX, 0, -0.15);
    joints.leftElbow.rotation.set(elbowBend, 0, 0);

    joints.rightShoulder.rotation.set(rShoulderX, 0, 0.15);
    joints.rightElbow.rotation.set(elbowBend, 0, 0);
  }

  // =========================================================================
  // 4. STEP-UPS ON CHAIR: Smooth 3-Second Looping Cycle (Chair Lockout -> Step Down -> Up)
  // =========================================================================
  postureStepUps(joints, propsData) {
    if (propsData && propsData.chairGroup) propsData.chairGroup.visible = true;

    // Start character immediately in the top elevated posture on chair at t = 0
    this.animateStepUps(joints, 0);

    return {
      postureTitle: 'עליות מדרגה על כיסא (Step-ups) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: מעמידה מלאה על הכיסא לירידה לרצפה וחזרה',
      cues: [
        'עמידה לצד הכיסא: רגל ימין נטועה ביציבות על המושב, רגל שמאל יורדת ועולה לצד הכיסא ללא מגע',
        'התחלה במנח עליון: רגל תומכת נעולה וישרה על הכיסא, רגל שנייה מורמת באוויר',
        'ירידה חלקה ומבוקרת תוך כיפוף הרגל שעל הכיסא עד נגיעת הרגל ברצפה לצד הכיסא (1.5 שנ\')',
        'דחיפה עוצמתית דרך כף הרגל שעל הכיסא לעלייה חזרה עד ליישור מלא של הברך (1.5 שנ\')'
      ],
      defaultCam: { x: 2.3, y: 1.6, z: 3.1, targetX: -0.10, targetY: 1.05, targetZ: 0.35 }
    };
  }

  /**
   * Closed-form 2-link IK solver for the front leg (right leg) in lunges.
   * Keeps front foot firmly planted and flat on the floor at (0.13, 0.097, 0.626).
   */
  solveFrontLungeIK(pelvisY) {
    const L1 = 0.46; // Thigh
    const L2 = 0.44; // Shin
    const TARGET_Y = 0.097; // Ankle height for sole on floor
    const TARGET_Z = 0.626; // Sagittal foot position

    const hipY = pelvisY - 0.06;
    const hipZ = 0.18;

    const dy = TARGET_Y - hipY;
    const dz = TARGET_Z - hipZ;
    const D = Math.sqrt(dy * dy + dz * dz);
    const clampedD = Math.min(Math.max(D, 0.2), L1 + L2 - 0.001);

    const cosKnee = (L1 * L1 + L2 * L2 - clampedD * clampedD) / (2 * L1 * L2);
    const kneeAngle = Math.PI - Math.acos(Math.min(Math.max(cosKnee, -1), 1));

    const phi = Math.atan2(dz, -dy);
    const cosAlpha = (L1 * L1 + clampedD * clampedD - L2 * L2) / (2 * L1 * clampedD);
    const alpha = Math.acos(Math.min(Math.max(cosAlpha, -1), 1));
    const hipAngle = -(phi + alpha);
    const footAngle = -(hipAngle + kneeAngle);

    return { hipAngle, kneeAngle, footAngle };
  }

  /**
   * Closed-form 2-link IK solver for the back leg (left leg) in lunges.
   * Keeps toes firmly planted on the floor at (-0.13, 0.177, -0.737).
   */
  solveBackLungeIK(pelvisY) {
    const L1 = 0.46; // Thigh
    const L2 = 0.44; // Shin
    const TARGET_Y = 0.177; // Ball of foot / toe ground contact
    const TARGET_Z = -0.737;

    const hipY = pelvisY - 0.06;
    const hipZ = -0.22;

    const dy = TARGET_Y - hipY;
    const dz = TARGET_Z - hipZ;
    const D = Math.sqrt(dy * dy + dz * dz);
    const clampedD = Math.min(Math.max(D, 0.2), L1 + L2 - 0.001);

    const cosKnee = (L1 * L1 + L2 * L2 - clampedD * clampedD) / (2 * L1 * L2);
    const kneeAngle = Math.PI - Math.acos(Math.min(Math.max(cosKnee, -1), 1));

    const phi = Math.atan2(dz, -dy);
    const cosAlpha = (L1 * L1 + clampedD * clampedD - L2 * L2) / (2 * L1 * clampedD);
    const alpha = Math.acos(Math.min(Math.max(cosAlpha, -1), 1));
    const hipAngle = -(phi + alpha);
    const footAngle = -1.35;

    return { hipAngle, kneeAngle, footAngle };
  }

  /**
   * Smooth 3-second continuous loop for Lunges:
   * Starts in deep lunge position at t=0s,
   * straightens both knees to rise up slightly at t=1.5s,
   * and bends knees back down into starting deep lunge at t=3.0s.
   * Elbows point cleanly outward to the sides with hands positioned firmly on hips.
   */
  animateLunges(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s): Starting deep lunge position
    // s = 1 at midpoint (t = 1.5s): Straightens knees to rise up slightly
    // s = 0 at end (t = 3.0s): Bends knees back down into starting deep lunge
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Pelvis rises smoothly driven directly by knee extension
    const pelvisY = 0.62 * (1 - s) + 0.82 * s;
    joints.pelvis.position.set(0, pelvisY, 0);

    // Torso posture: upright, stable and balanced
    joints.spine.rotation.set(0.04, 0, 0);
    joints.chest.rotation.set(-0.02, 0, 0);
    joints.neck.rotation.set(0, 0, 0);

    // Arm Positioning: Elbows pointing outward to the sides with hands on hips (akimbo)
    joints.leftShoulder.rotation.set(-0.05, 0.10, -0.75);
    joints.leftElbow.rotation.set(0, 0, 1.65);
    joints.leftHand.rotation.set(0, 0, -0.20);

    joints.rightShoulder.rotation.set(-0.05, -0.10, 0.75);
    joints.rightElbow.rotation.set(0, 0, -1.65);
    joints.rightHand.rotation.set(0, 0, 0.20);

    // Front Leg (Right): Knee drives movement, foot firmly flat on floor
    const rIK = this.solveFrontLungeIK(pelvisY);
    joints.rightHip.position.set(0.13, -0.06, 0.18);
    joints.rightHip.rotation.set(rIK.hipAngle, 0, 0);
    joints.rightKnee.rotation.set(rIK.kneeAngle, 0, 0);
    joints.rightFoot.rotation.set(rIK.footAngle, 0, 0);

    // Back Leg (Left): Knee straightens cleanly as body rises, resting firmly on toes
    const lIK = this.solveBackLungeIK(pelvisY);
    joints.leftHip.position.set(-0.13, -0.06, -0.22);
    joints.leftHip.rotation.set(lIK.hipAngle, 0, 0);
    joints.leftKnee.rotation.set(lIK.kneeAngle, 0, 0);
    joints.leftFoot.rotation.set(lIK.footAngle, 0, 0);
  }

  // =========================================================================
  // 5. LUNGES: Smooth 3-Second Looping Cycle (Deep Lunge -> Rise Up -> Lower)
  // =========================================================================
  postureLunges(joints, propsData) {
    // Start character immediately in deep lunge position at t = 0
    this.animateLunges(joints, 0);

    return {
      postureTitle: 'לאנצ\'ים (Lunges) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: ממנח לאנץ\' עמוק, עלייה קלה ביישור ברכיים וחזרה',
      cues: [
        'מרפקים מופנים החוצה לצדדים וידיים מונחות ביציבות על המותניים',
        'התחלה במנח לאנץ\' עמוק: ברך קדמית ב-90° מעל הקרסול, ברך אחורית מרחפת סמוך לרצפה',
        'יישור מבוקר של שתי הברכיים לעלייה קלה של הגוף כלפי מעלה (1.5 שנ\')',
        'כיפוף הברכיים חזרה למנח הלאנץ\' העמוק ההתחלתי (1.5 שנ\')',
        'תנועה נקייה המונעת ישירות דרך מפרקי הברכיים תוך שמירה על גב זקוף ויציב'
      ],
      defaultCam: { x: 2.5, y: 1.2, z: 2.5, targetX: 0.0, targetY: 0.70, targetZ: 0.0 }
    };
  }

  /**
   * Smooth 3-second continuous loop for Superman:
   * Starts in peak lifted position at t=0s,
   * arms and straight legs lower down slightly (without touching the floor) at t=1.5s,
   * and lift back up to the starting elevated position at t=3.0s.
   * Movement is driven solely by the arms at the shoulders and straight legs at the hips.
   */
  animateSuperman(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s): Peak elevated position (arms & straight legs lifted high in air)
    // s = 1 at midpoint (t = 1.5s): Lowered slightly (hovering safely above floor/mat, zero contact)
    // s = 0 at end (t = 3.0s): Lifted back up to peak elevated position
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Arms: Driven solely at shoulders, elbows remain completely straight
    // Shoulder rotation X: -3.05 (peak lifted) -> -2.75 (lowered slightly, hovering ~30cm above floor)
    const shRotX = -3.05 * (1 - s) + (-2.75) * s;
    joints.leftShoulder.rotation.set(shRotX, 0, -0.12);
    joints.rightShoulder.rotation.set(shRotX, 0, 0.12);
    joints.leftElbow.rotation.set(0, 0, 0);
    joints.rightElbow.rotation.set(0, 0, 0);

    // Legs: Driven solely at hips, knees remain completely straight
    // Hip rotation X: +0.25 (peak lifted) -> +0.11 (lowered slightly, hovering ~6cm above mat, zero floor contact)
    const hipRotX = 0.25 * (1 - s) + 0.11 * s;
    joints.leftHip.rotation.set(hipRotX, 0, 0);
    joints.rightHip.rotation.set(hipRotX, 0, 0);
    joints.leftKnee.rotation.set(0, 0, 0);
    joints.rightKnee.rotation.set(0, 0, 0);
    joints.leftFoot.rotation.set(0.20, 0, 0);
    joints.rightFoot.rotation.set(0.20, 0, 0);
  }

  // =========================================================================
  // 6. SUPERMAN: Smooth 3-Second Looping Cycle (Peak Lift -> Lower Slightly -> Lift)
  // =========================================================================
  postureSuperman(joints, propsData) {
    if (propsData && propsData.matGroup) propsData.matGroup.visible = true;

    // Prone orientation (stomach and face pointing DOWN toward floor)
    joints.root.position.set(0, 0.12, -0.75);
    joints.root.rotation.set(Math.PI / 2, 0, 0);

    joints.pelvis.position.set(0, 0.95, 0);
    joints.pelvis.rotation.set(0, 0, 0);

    // Thoracic spine arched UP away from mat
    joints.spine.rotation.set(-0.35, 0, 0);
    joints.chest.rotation.set(-0.15, 0, 0);
    joints.neck.rotation.set(0.12, 0, 0);

    // Initialize character at t = 0 in peak lifted position
    this.animateSuperman(joints, 0);

    return {
      postureTitle: 'סופרמן (Superman) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: ממנח מורם, ירידה מבוקרת ללא מגע ברצפה ועלייה חזרה',
      cues: [
        'שכיבה על הבטן (Prone) כשהפנים והבטן מופנים מטה אל המזרן',
        'התחלה במנח מורם: זרועות ישרות קדימה ורגליים ישרות לאחור מורמות באוויר',
        'הורדה מבוקרת קלה של הזרועות והרגליים הישרות כלפי מטה ללא נגיעה ברצפה (1.5 שנ\')',
        'הרמה חזרה למנח המורם העליון עם כיווץ שיא בגב ובזוקפים (1.5 שנ\')',
        'התנועה מונעת באופן בלעדי דרך הזרועות והרגליים הישרות לאורך כל המחזור'
      ],
      defaultCam: { x: 2.2, y: 1.1, z: 2.2, targetX: 0.0, targetY: 0.20, targetZ: 0.10 }
    };
  }

  /**
   * Smooth 3-second continuous loop for Crunches:
   * Starts lying flat on back on floor (knees bent, feet flat, hands behind head) at t=0s,
   * upper back, chest, head, and arms curl upward together to halfway up toward knees at t=1.5s,
   * and lower back down smoothly to lie flat on the floor at t=3.0s.
   */
  animateCrunches(joints, timeInSeconds) {
    if (!joints) return;

    const cycleDuration = 3.0; // Smooth 3-second continuous loop
    const normT = ((timeInSeconds % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

    // s = 0 at start (t = 0s): Lying flat on back on floor
    // s = 1 at midpoint (t = 1.5s): Curled upward halfway toward knees (crunch position)
    // s = 0 at end (t = 3.0s): Lowered smoothly back down to lie flat on the floor
    const s = (1 - Math.cos(2 * Math.PI * normT)) / 2;

    // Torso curl:
    // Flat (s=0): spine=0, chest=0, neck=0 (lying flat against floor/mat)
    // Crunch peak (s=1): spine=0.40, chest=0.18, neck=-0.25 (upper back curled half-raised toward knees)
    const spineRotX = 0.00 * (1 - s) + 0.40 * s;
    const chestRotX = 0.00 * (1 - s) + 0.18 * s;
    const neckRotX  = 0.00 * (1 - s) + (-0.25) * s;

    joints.spine.rotation.set(spineRotX, 0, 0);
    joints.chest.rotation.set(chestRotX, 0, 0);
    joints.neck.rotation.set(neckRotX, 0, 0);

    // Hands positioned behind the back of the head supporting neck & head throughout
    joints.leftShoulder.rotation.set(-2.50, 1.30, -0.80);
    joints.leftElbow.rotation.set(-2.20, 0, 0);

    joints.rightShoulder.rotation.set(-2.50, -1.30, 0.80);
    joints.rightElbow.rotation.set(-2.20, 0, 0);

    // Lower body: stable, knees bent, feet flat on the floor
    const hx = -0.75;
    const kx = 1.75;
    const fx = 0.60;

    joints.leftHip.rotation.set(hx, 0, -0.06);
    joints.leftKnee.rotation.set(kx, 0, 0);
    joints.leftFoot.rotation.set(fx, 0, 0);

    joints.rightHip.rotation.set(hx, 0, 0.06);
    joints.rightKnee.rotation.set(kx, 0, 0);
    joints.rightFoot.rotation.set(fx, 0, 0);
  }

  // =========================================================================
  // 7. CRUNCHES: Smooth 3-Second Looping Cycle (Flat on Floor -> Crunch Halfway -> Flat)
  // =========================================================================
  postureCrunches(joints, propsData) {
    if (propsData && propsData.matGroup) propsData.matGroup.visible = true;

    // Supine orientation (lying on back, face/torso pointing UP toward ceiling/knees)
    joints.root.position.set(0, 0.10, 0.75);
    joints.root.rotation.set(-Math.PI / 2, 0, 0);

    joints.pelvis.position.set(0, 0.95, 0);
    joints.pelvis.rotation.set(0, 0, 0);

    // Initialize character lying flat on the floor at t = 0
    this.animateCrunches(joints, 0);

    return {
      postureTitle: 'כפיפות בטן (Crunches) - מחזור תנועה 3 שניות',
      phaseText: 'מחזור תנועה חלק של 3 שניות: משכיבה ישרה על הגב, עלייה לחצי הדרך וחזרה',
      cues: [
        'התחלה בשכיבה מלאה על הגב על הרצפה, ברכיים כפופות וכפות רגליים שטוחות',
        'כפות הידיים תומכות בעדינות מאחורי הראש והעורף לאורך כל התנועה',
        'עלייה חלקה של הגב העליון, החזה והראש יחד עד חצי הדרך לכיוון הברכיים (1.5 שנ\')',
        'ירידה איטית ומבוקרת חזרה עד שכיבה מלאה ושטוחה על הרצפה (1.5 שנ\')',
        'שמירה על גב תחתון צמוד למזרן וכפות רגליים יציבות ונטועות'
      ],
      defaultCam: { x: 2.2, y: 1.1, z: 2.2, targetX: 0.0, targetY: 0.22, targetZ: -0.10 }
    };
  }

  // =========================================================================
  // 8. PLANK: Prone, Forearms Flat on Floor, Toes Resting on Floor
  // =========================================================================
  posturePlank(joints, propsData) {
    if (propsData && propsData.matGroup) propsData.matGroup.visible = true;

    // Prone orientation with slight natural incline so toes touch floor
    joints.root.position.set(0, 0.19, -0.75);
    joints.root.rotation.set(1.50, 0, 0);

    joints.pelvis.position.set(0, 0.95, 0);
    joints.pelvis.rotation.set(0, 0, 0);

    // Straight rigid line
    joints.spine.rotation.set(0, 0, 0);
    joints.chest.rotation.set(0, 0, 0);
    joints.neck.rotation.set(0.04, 0, 0);

    // Forearms resting flat on floor under shoulders
    joints.leftShoulder.rotation.set(-1.50, 0, 0);
    joints.leftElbow.rotation.set(-1.50, 0, 0);

    joints.rightShoulder.rotation.set(-1.50, 0, 0);
    joints.rightElbow.rotation.set(-1.50, 0, 0);

    // Legs straight, toes (feet) firmly and properly resting on the floor
    joints.leftHip.rotation.set(0, 0, 0);
    joints.leftKnee.rotation.set(0, 0, 0);
    joints.leftFoot.rotation.set(-0.35, 0, 0);

    joints.rightHip.rotation.set(0, 0, 0);
    joints.rightKnee.rotation.set(0, 0, 0);
    joints.rightFoot.rotation.set(-0.35, 0, 0);

    return {
      postureTitle: 'פלאנק: מנח גשר סטטי מושלם (Static Forearm Plank)',
      phaseText: 'מנח יציבה סטטי נכון: אמות ובהונות נשענות על הקרקע',
      cues: [
        'בהונות הרגליים נשענות ונטועות כראוי על הרצפה',
        'אמות הידיים מונחות שטוחות במקביל על המזרן מתחת לכתפיים',
        'קו ישר לחלוטין מקודקוד ועד עקבים ללא שקיעת אגן',
        'בטן אסופה וכיווץ ליבה מלא להחזקה סטטית יציבה'
      ],
      defaultCam: { x: 2.4, y: 1.1, z: 2.2, targetY: 0.20, targetZ: 0.10 }
    };
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  window.ExerciseAnimations = ExerciseAnimations;
}
