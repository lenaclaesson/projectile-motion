document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  if (!app) {
    return;
  }

  try {
    const response = await fetch("./content.json");

    if (!response.ok) {
      throw new Error("Kunde inte läsa content.json");
    }

    const content = await response.json();
    const example = ProjectilePhysics.getProjectileMotion(45, 20, 0);

    app.innerHTML = `
      <header class="hero">
        <p class="eyebrow">Gymnasiefysik</p>
        <h1>${content.pageTitle}</h1>
        <p class="subtitle">${content.subtitle}</p>
      </header>

      <section class="card sim-panel">
        <div class="sim-header">
          <h2>${content.controls.simulation}</h2>
          <span id="statusPill" class="status-pill">${content.controls.ready}</span>
        </div>

        <div class="sim-layout">
          <div class="canvas-wrap">
            <canvas id="simulationCanvas" width="760" height="420" aria-label="Bana för projektilen"></canvas>
          </div>

          <aside class="controls-card">
            <h3>${content.controls.settings}</h3>

            <label class="slider-group" for="angleSlider">
              <span>${content.labels.launchAngle}</span>
              <input id="angleSlider" type="range" min="10" max="80" step="1" value="45" />
              <strong id="angleValue">45°</strong>
            </label>

            <label class="slider-group" for="speedSlider">
              <span>${content.controls.speed}</span>
              <input id="speedSlider" type="range" min="5" max="40" step="0.5" value="20" />
              <strong id="speedValue">20.0 m/s</strong>
            </label>

            <div class="button-row">
              <button type="button" data-action="start">${content.controls.start}</button>
              <button type="button" data-action="pause">${content.controls.pause}</button>
              <button type="button" data-action="reset">${content.controls.reset}</button>
            </div>
          </aside>
        </div>

        <div class="readouts">
          <div>
            <span>${content.controls.elapsedTime}</span>
            <strong id="timeValue">0.00 s</strong>
          </div>
          <div>
            <span>${content.controls.position}</span>
            <strong id="positionValue">0.00 m, 0.00 m</strong>
          </div>
          <div>
            <span>${content.controls.range}</span>
            <strong id="rangeValue">0.00 m</strong>
          </div>
        </div>
      </section>

      <section class="intro card">
        <p>${content.intro}</p>
      </section>

      <section class="card">
        <h2>Antaganden</h2>
        <ul class="list">
          ${content.assumptions.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>

      <section class="card equations">
        <h2>Grundekvationer</h2>
        <div class="equation-grid">
          ${content.equations
            .map(
              (equation) => `
                <article class="equation-item">
                  <h3>${equation.label}</h3>
                  <p class="formula">${equation.formula}</p>
                  <p>${equation.description}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="card model-preview">
        <h2>Exempel på modellresultat</h2>
        <div class="stats">
          <div>
            <span>Flygtid</span>
            <strong>${example.timeOfFlight.toFixed(2)} s</strong>
          </div>
          <div>
            <span>Räckvidd</span>
            <strong>${example.range.toFixed(2)} m</strong>
          </div>
          <div>
            <span>Max höjd</span>
            <strong>${example.maxHeight.toFixed(2)} m</strong>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>${content.reading.title}</h2>
        <p>${content.reading.text}</p>
      </section>

      <section class="card">
        <h2>${content.example.title}</h2>
        <p>${content.example.text}</p>
      </section>
    `;

    const canvas = document.getElementById("simulationCanvas");
    const angleSlider = document.getElementById("angleSlider");
    const speedSlider = document.getElementById("speedSlider");
    const statusPill = document.getElementById("statusPill");
    const angleValue = document.getElementById("angleValue");
    const speedValue = document.getElementById("speedValue");
    const timeValue = document.getElementById("timeValue");
    const positionValue = document.getElementById("positionValue");
    const rangeValue = document.getElementById("rangeValue");
    const ctx = canvas.getContext("2d");

    const simulationState = {
      angle: Number(angleSlider.value),
      speed: Number(speedSlider.value),
      elapsedTime: 0,
      isRunning: false,
      lastTimestamp: null,
      motion: null,
    };

    function formatNumber(value, digits = 2) {
      return Number(value).toFixed(digits);
    }

    function syncModel() {
      simulationState.motion = ProjectilePhysics.getProjectileMotion(simulationState.angle, simulationState.speed, 0);
      simulationState.elapsedTime = 0;
      simulationState.isRunning = false;
      simulationState.lastTimestamp = null;
      updateStatus();
      updateReadouts();
      drawScene();
    }

    function updateStatus() {
      if (simulationState.isRunning) {
        statusPill.textContent = content.controls.running;
      } else if (simulationState.elapsedTime >= simulationState.motion.timeOfFlight) {
        statusPill.textContent = content.controls.landed;
      } else {
        statusPill.textContent = content.controls.ready;
      }
    }

    function updateReadouts() {
      const currentState = ProjectilePhysics.getStateAtElapsedTime(
        simulationState.angle,
        simulationState.speed,
        simulationState.elapsedTime,
        0
      );

      angleValue.textContent = `${simulationState.angle.toFixed(0)}°`;
      speedValue.textContent = `${simulationState.speed.toFixed(1)} m/s`;
      timeValue.textContent = `${formatNumber(simulationState.elapsedTime)} s`;
      positionValue.textContent = `${formatNumber(currentState.position.x)} m, ${formatNumber(currentState.position.y)} m`;
      rangeValue.textContent = `${formatNumber(Math.min(currentState.position.x, simulationState.motion.range))} m`;
      updateStatus();
    }

    function drawScene() {
      const width = canvas.width;
      const height = canvas.height;
      const left = 50;
      const right = 30;
      const top = 25;
      const bottom = 45;
      const groundY = height - bottom;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#f7fbff";
      ctx.fillRect(0, 0, width, height);

      const xMax = Math.max(simulationState.motion.range * 1.2, 10);
      const yMax = Math.max(simulationState.motion.maxHeight * 1.4, 5);
      const xScale = (width - left - right) / xMax;
      const yScale = (height - top - bottom) / yMax;

      const toScreen = (x, y) => ({
        x: left + x * xScale,
        y: groundY - y * yScale,
      });

      ctx.strokeStyle = "#c9d4e5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, groundY);
      ctx.lineTo(width - right, groundY);
      ctx.stroke();

      ctx.strokeStyle = "#7a8aa3";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(left, groundY);
      ctx.lineTo(width - right, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#4b5563";
      ctx.font = "12px Arial";
      ctx.fillText(content.labels.xAxis, width - right - 30, groundY + 20);
      ctx.save();
      ctx.translate(18, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(content.labels.yAxis, 0, 0);
      ctx.restore();

      ctx.beginPath();
      simulationState.motion.trajectoryPoints.forEach((point, index) => {
        const screenPoint = toScreen(point.x, point.y);

        if (index === 0) {
          ctx.moveTo(screenPoint.x, screenPoint.y);
        } else {
          ctx.lineTo(screenPoint.x, screenPoint.y);
        }
      });
      ctx.strokeStyle = "#2d6cdf";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const current = ProjectilePhysics.getStateAtElapsedTime(
        simulationState.angle,
        simulationState.speed,
        simulationState.elapsedTime,
        0
      );
      const projectilePoint = toScreen(current.position.x, current.position.y);

      ctx.beginPath();
      ctx.fillStyle = "#f59e0b";
      ctx.arc(projectilePoint.x, projectilePoint.y, 7, 0, Math.PI * 2);
      ctx.fill();

      const startPoint = toScreen(0, 0);
      ctx.beginPath();
      ctx.fillStyle = "#111827";
      ctx.arc(startPoint.x, startPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();

      const landingPoint = toScreen(simulationState.motion.range, 0);
      ctx.beginPath();
      ctx.fillStyle = "#0f766e";
      ctx.arc(landingPoint.x, landingPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#111827";
      ctx.fillText(`${content.labels.ground}`, 10, groundY - 10);
      ctx.fillText(`${content.controls.range}: ${formatNumber(simulationState.motion.range)} m`, width - 170, 26);
    }

    function handleAnimationFrame(timestamp) {
      if (simulationState.isRunning) {
        if (simulationState.lastTimestamp === null) {
          simulationState.lastTimestamp = timestamp;
        }

        const frameDeltaSeconds = (timestamp - simulationState.lastTimestamp) / 1000;
        simulationState.lastTimestamp = timestamp;
        simulationState.elapsedTime += frameDeltaSeconds;

        if (simulationState.elapsedTime >= simulationState.motion.timeOfFlight) {
          simulationState.elapsedTime = simulationState.motion.timeOfFlight;
          simulationState.isRunning = false;
          simulationState.lastTimestamp = null;
        }
      }

      updateReadouts();
      drawScene();
      requestAnimationFrame(handleAnimationFrame);
    }

    angleSlider.addEventListener("input", (event) => {
      simulationState.angle = Number(event.target.value);
      syncModel();
    });

    speedSlider.addEventListener("input", (event) => {
      simulationState.speed = Number(event.target.value);
      syncModel();
    });

    document.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "start") {
          if (simulationState.elapsedTime >= simulationState.motion.timeOfFlight) {
            simulationState.elapsedTime = 0;
          }
          simulationState.isRunning = true;
          simulationState.lastTimestamp = null;
          updateReadouts();
        }

        if (action === "pause") {
          simulationState.isRunning = false;
          simulationState.lastTimestamp = null;
          updateReadouts();
        }

        if (action === "reset") {
          simulationState.elapsedTime = 0;
          simulationState.isRunning = false;
          simulationState.lastTimestamp = null;
          updateReadouts();
          drawScene();
        }
      });
    });

    syncModel();
    requestAnimationFrame(handleAnimationFrame);
  } catch (error) {
    app.innerHTML = `
      <main class="card error">
        <h1>Det gick inte att ladda modellen.</h1>
        <p>${error.message}</p>
      </main>
    `;
  }
});
