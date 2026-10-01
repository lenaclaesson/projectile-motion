/*
  Ideal kaströrelse för gymnasiefysik

  Antaganden:
  - endast tyngdkraften verkar på projektilen
  - luftmotstånd ignoreras
  - start- och landningshöjden är lika
  - allmänt används SI-enheter: meter (m), sekunder (s), meter per sekund (m/s)

  Konstant:
  - g = 9,81 m/s^2
*/

const g = 9.81;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function validateNumeric(value, name) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`${name} måste vara ett giltigt tal.`);
  }

  return numericValue;
}

function getProjectileMotion(launchAngleDeg, launchSpeed, startHeight = 0) {
  const angleDeg = validateNumeric(launchAngleDeg, "Vinkel");
  const speed = validateNumeric(launchSpeed, "Startfart");
  const height = validateNumeric(startHeight, "Starthöjd");

  const angleRad = degToRad(angleDeg);
  const vx = speed * Math.cos(angleRad);
  const vy0 = speed * Math.sin(angleRad);

  // För samma start- och landningshöjd gäller:
  // y(t) = h + v0y * t - 1/2 * g * t^2
  // Där y = 0 vid landning. Lösningen ger flygtid:
  // t = 2 * v0y / g när h = 0.
  const timeOfFlight = (2 * vy0) / g;

  // Räckvidd vid samma höjd:
  // x = vx * t => R = v0^2 * sin(2θ) / g
  const range = (speed * speed * Math.sin(2 * angleRad)) / g;

  // Maximal höjd med v_y = 0 i toppunkt:
  // H = v0y^2 / (2g)
  const maxHeight = (vy0 * vy0) / (2 * g);

  // Tiden till toppunkt: hälften av flygtiden
  const peakTime = timeOfFlight / 2;
  const peakX = vx * peakTime;
  const peakY = maxHeight + height;

  const trajectoryPoints = [];
  const samples = 180;

  for (let i = 0; i <= samples; i += 1) {
    const t = (timeOfFlight * i) / samples;
    const x = vx * t;
    const y = height + vy0 * t - 0.5 * g * t * t;

    trajectoryPoints.push({
      t,
      x,
      y: Math.max(0, y),
    });
  }

  const landingVelocityY = -vy0;
  const landingSpeed = Math.hypot(vx, landingVelocityY);

  return {
    g,
    angleDeg,
    angleRad,
    launchSpeed: speed,
    startHeight: height,
    vx,
    vy0,
    timeOfFlight,
    range,
    maxHeight,
    peakTime,
    peakX,
    peakY,
    landingVelocity: {
      x: vx,
      y: landingVelocityY,
    },
    landingSpeed,
    trajectoryPoints,
  };
}

function getStateAtElapsedTime(launchAngleDeg, launchSpeed, elapsedTime, startHeight = 0) {
  const motion = getProjectileMotion(launchAngleDeg, launchSpeed, startHeight);
  const safeTime = clamp(elapsedTime, 0, motion.timeOfFlight);
  const angleRad = degToRad(launchAngleDeg);
  const vx = launchSpeed * Math.cos(angleRad);
  const vy = launchSpeed * Math.sin(angleRad) - g * safeTime;
  const x = vx * safeTime;
  const y = Math.max(0, startHeight + launchSpeed * Math.sin(angleRad) * safeTime - 0.5 * g * safeTime * safeTime);

  return {
    time: safeTime,
    position: {
      x,
      y,
    },
    velocity: {
      x: vx,
      y: vy,
    },
    speed: Math.hypot(vx, vy),
    isLanded: safeTime >= motion.timeOfFlight,
    motion,
  };
}

function getVelocityAtTime(launchAngleDeg, launchSpeed, time, startHeight = 0) {
  const state = getStateAtElapsedTime(launchAngleDeg, launchSpeed, time, startHeight);

  return {
    x: state.velocity.x,
    y: state.velocity.y,
    speed: state.speed,
    time,
    totalTime: state.motion.timeOfFlight,
  };
}

function getVerticalPosition(launchAngleDeg, launchSpeed, time, startHeight = 0) {
  const angleRad = degToRad(launchAngleDeg);
  const vy0 = launchSpeed * Math.sin(angleRad);
  return startHeight + vy0 * time - 0.5 * g * time * time;
}

function getHorizontalPosition(launchAngleDeg, launchSpeed, time) {
  const angleRad = degToRad(launchAngleDeg);
  return launchSpeed * Math.cos(angleRad) * time;
}

window.ProjectilePhysics = {
  g,
  clamp,
  degToRad,
  getProjectileMotion,
  getStateAtElapsedTime,
  getVelocityAtTime,
  getVerticalPosition,
  getHorizontalPosition,
};
