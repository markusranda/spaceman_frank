import { Background } from "./background.js";
import { Frank } from "./frank.js";
import { Galaxy } from "./galaxy.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import {
  VICTORY_TIMER_MAX,
  SPAWN_TIMER_MAX,
  FPS_PRINT_TIMEOUT,
} from "./timers.js";
import { GAME_STATES } from "./gamestate.js";
import { Particle } from "./particle.js";
import { GameHUD } from "./gameHUD.js";

export class Game {
  camera = null;
  keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    å: false,
  };
  backgroundContainer = new PIXI.Container();
  cameraContainer = new PIXI.Container();
  uiContainer = new PIXI.Container();
  timers = {
    damageTimer: 0,
    spawnTimer: SPAWN_TIMER_MAX,
    victoryTimer: 0,
    debugEvolveTimer: 0,
    fpsTimer: FPS_PRINT_TIMEOUT,
  };
  gameState = GAME_STATES.NORMAL;
  particles = [];
  gameHud = null;
  background = null;

  constructor(pixiApp) {
    this.pixiApp = pixiApp;
    this.backgroundContainer.name = "background_container";
    this.backgroundContainer.sortableChildren = true;
    this.cameraContainer.name = "camera_container";
    this.uiContainer.name = "ui_container";
    this.culler = new PIXI.Culler();
  }

  run() {
    this.cameraContainer.addChild(this.backgroundContainer);

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

    // Setup entities
    this.galaxy = new Galaxy(this.camera);
    this.frank = new Frank();
    this.galaxy.spawnNextPlanetBelt(this.frank, this.cameraContainer);

    // Setup UI and background
    this.gameHud = new GameHUD(
      this.uiContainer,
      this.pixiApp.renderer.width,
      this.pixiApp.renderer.height
    );
    this.background = new Background(this.backgroundContainer);

    // Add to containers
    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.cameraContainer);
    this.pixiApp.stage.addChild(this.uiContainer);

    this.frank.addTo(this.cameraContainer);

    // Setup and run ticker
    this.update = this.update.bind(this);
    const ticker = new PIXI.Ticker();
    ticker.add(this.update);
    ticker.minFPS = 60;
    ticker.maxFPS = 60;
    ticker.start();
  }

  update(ticker) {
    try {
      const delta = ticker.deltaMS;
      if (this.keys.å && this.timers.debugEvolveTimer <= 0) {
        this.frank.fullness = this.frank.getFullnessGoal();
        this.timers.debugEvolveTimer = 500;
      }

      this.updateTimers(delta);
      this.updateGame();
      this.frank.update(delta, this.keys, this.galaxy, this.timers);
      this.frank.updateVisuals(this.keys);
      this.galaxy.update(
        delta,
        this.frank,
        this.timers,
        this.cameraContainer,
        this.cameraContainer.scale.x
      );
      this.updateParticles();
      this.gameHud.update(this.frank, this.timers, this.gameState);
      this.background.update(
        this.frank,
        this.pixiApp.renderer.width,
        this.pixiApp.renderer.height,
        this.cameraContainer.scale,
        this.backgroundContainer
      );
      this.updateFPS(ticker);

      this.updateCamera();
      this.updateCull();
    } catch (e) {
      console.error(`Tick update failed: ${e}`);
    }
  }

  updateCull() {
    this.culler.cull(this.backgroundContainer, {
      x: 0,
      y: 0,
      width: this.pixiApp.renderer.width,
      height: this.pixiApp.renderer.height,
    });
  }

  updateFPS(ticker) {
    if (this.timers.fpsTimer <= 0) {
      this.timers.fpsTimer = FPS_PRINT_TIMEOUT;
      console.debug(`FPS: ${ticker.FPS}`);
    }
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
    this.frank.evolve();
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
      this.galaxy.spawnNextPlanetBelt(this.frank, this.cameraContainer);
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

  updateCamera() {
    // Calculate new scale based on Frank
    const scale = this.frank.baseRadius / this.frank.radius;
    if (!this.cameraContainer.scale.x) this.cameraContainer.scale.set(1);

    // Scale camera container
    this.cameraContainer.scale.x +=
      (scale - this.cameraContainer.scale.x) * 0.1;
    this.cameraContainer.scale.y = this.cameraContainer.scale.x;

    // Update camera
    const offsetX = this.camera.width / 2 / this.cameraContainer.scale.x;
    const offsetY = this.camera.height / 2 / this.cameraContainer.scale.y;
    this.camera.x = this.frank.x - offsetX;
    this.camera.y = this.frank.y - offsetY;

    //  Update world positions
    const cX = -this.camera.x * this.cameraContainer.scale.x;
    const cY = -this.camera.y * this.cameraContainer.scale.y;
    this.cameraContainer.position.set(cX, cY);
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
