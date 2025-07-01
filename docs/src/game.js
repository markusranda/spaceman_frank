import { Background } from "./background.js";
import { Frank } from "./frank.js";
import { Galaxy } from "./galaxy.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import { VICTORY_TIMER_MAX, SPAWN_TIMER_MAX } from "./timers.js";
import { GAME_STATES } from "./gamestate.js";
import { Particle } from "./particle.js";
import { GameHud } from "./gamehud.js";

export class Game {
  camera = null;
  keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    å: false,
  };
  lastTime = 0;
  backgroundContainer = new PIXI.Container();
  cameraContainer = new PIXI.Container();
  uiContainer = new PIXI.Container();
  timers = {
    damageTimer: 0,
    spawnTimer: SPAWN_TIMER_MAX,
    victoryTimer: 0,
    debugEvolveTimer: 0,
  };
  gameState = GAME_STATES.NORMAL;
  particles = [];
  gameHud = null;
  background = null;
  pulseTime = 0;

  constructor(pixiApp) {
    this.pixiApp = pixiApp;
  }

  run() {
    const body = document.getElementById("rootElement");
    const worldX = body.clientWidth;
    const worldY = body.clientHeight;
    this.camera = {
      x: -worldX / 2,
      y: -worldY / 2,
      width: worldX,
      height: worldY,
    };

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() in this.keys) {
        this.keys[e.key.toLowerCase()] = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() in this.keys) {
        this.keys[e.key.toLowerCase()] = false;
      }
    });

    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.backgroundContainer);
    this.pixiApp.stage.addChild(this.cameraContainer);
    this.pixiApp.stage.addChild(this.uiContainer);

    this.galaxy = new Galaxy(this.camera);
    this.frank = new Frank();
    this.gameHud = new GameHud(
      this.uiContainer,
      this.pixiApp.renderer.width,
      this.pixiApp.renderer.height
    );
    this.background = new Background();
    for (let i = 0; i < 10; i++) {
      const newPlanets = this.galaxy.spawnNextPlanetBelt(this.frank);
      // add planets to visuals
      for (const planet of newPlanets) {
        planet.addTo(this.cameraContainer);
      }
      this.galaxy.currentEvolution++;
    }

    this.frank.addTo(this.cameraContainer);
    this.background.addTo(this.backgroundContainer);

    this.debugGraphics = new PIXI.Graphics();
    this.pixiApp.stage.addChild(this.debugGraphics); // Assuming app is your PixiJS application

    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  tick(currentTime) {
    const delta = currentTime - this.lastTime;

    this.update(delta);

    this.lastTime = currentTime;
    requestAnimationFrame(this.tick);
  }

  getTickRate() {
    return (
      this.tickRate.reduce((sum, el) => (sum += el), 0) / this.tickRate.length
    );
  }

  update(delta) {
    if (this.keys.å && this.timers.debugEvolveTimer <= 0) {
      this.frank.fullness = this.frank.getFullnessGoal();
      this.timers.debugEvolveTimer = 500;
    }

    this.updateTimers(delta);
    this.updateGame();
    this.updateCamera(
      this.camera,
      this.backgroundContainer,
      this.cameraContainer,
      this.frank
    );
    this.frank.update(this.keys, this.galaxy, this.timers);
    this.frank.updateVisuals(this.keys);
    this.galaxy.update(delta, this.frank, this.timers, this.cameraContainer);
    this.updateParticles();
    this.updatePlanets(this.galaxy);
    this.gameHud.update(this.frank, this.timers, this.gameState);
    this.background.update(
      this.backgroundContainer,
      this.frank,
      this.pixiApp.renderer.width
    );
  }

  updateTimers(delta) {
    for (const [key, val] of Object.entries(this.timers)) {
      if (val !== undefined && val > 0) {
        const newValue = val - delta;
        this.timers[key] = newValue > 0 ? newValue : 0;
      }
    }
  }

  evolveGalaxy() {
    this.gameState = GAME_STATES.VICTORY;
    this.frank.evolve(this.galaxy);
    this.spawnVictoryParticles();
    this.timers.victoryTimer = VICTORY_TIMER_MAX;
  }

  updateGame() {
    const hasEatenEnoughPlanets =
      this.frank.fullness >= this.frank.getFullnessGoal();
    if (hasEatenEnoughPlanets) this.evolveGalaxy();

    if (
      this.gameState === GAME_STATES.VICTORY &&
      this.timers.victoryTimer <= 0
    ) {
      this.gameState = GAME_STATES.NORMAL;
      for (const particle of this.particles) {
        particle.destroy();
      }
      this.particles = [];
      this.galaxy.spawnNextPlanetBelt(this.frank);
      this.galaxy.currentEvolution++;
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const x = p.x + p.vx;
      const y = p.y + p.vy;
      p.setPosition(x, y);
      p.ttl -= 1;

      if (p.ttl <= 0) {
        this.particles.splice(i, 1);
        p.destroy();
      }
    }
  }

  updateCamera(camera, backgroundContainer, cameraContainer, frank) {
    // Calculate new scale based on Frank
    const scale = frank.baseRadius / frank.radius;
    if (!cameraContainer.scale.x) cameraContainer.scale.set(1);

    // Scale camera container
    cameraContainer.scale.x += (scale - cameraContainer.scale.x) * 0.1;
    cameraContainer.scale.y = cameraContainer.scale.x;

    // Update camera
    const offsetX = camera.width / 2 / cameraContainer.scale.x;
    const offsetY = camera.height / 2 / cameraContainer.scale.y;
    camera.x = frank.x - offsetX;
    camera.y = frank.y - offsetY;

    //  Update world positions
    const cX = -camera.x * cameraContainer.scale.x;
    const cY = -camera.y * cameraContainer.scale.y;
    cameraContainer.position.set(cX, cY);
    backgroundContainer.position.set(cX, cY);
  }

  updatePlanets(galaxy) {
    for (const planet of galaxy.planets) {
      planet.angle += 0.0001;
    }
  }

  spawnVictoryParticles(count = 1000) {
    const arcStart = 0; // Start angle (e.g. 10 o'clock)
    const arcEnd = 2 * Math.PI; // End angle (e.g. 2 o'clock)

    for (let i = 0; i < count; i++) {
      const angle = arcStart + Math.random() * (arcEnd - arcStart);
      const speed = 2 + Math.random() * 6;
      const particle = new Particle(
        this.pixiApp.renderer.width / 2,
        this.pixiApp.renderer.height / 2,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        60 + Math.random() * 60
      );

      this.particles.push(particle);
      this.uiContainer.addChild(particle.sprite);
    }
  }
}
