import { Background } from "./background";
import { Frank } from "./frank/frank";
import { Galaxy } from "./galaxy";
import { Application, Container, Culler, Ticker } from "pixi.js";
import {
  VICTORY_TIMER_MAX,
  SPAWN_TIMER_MAX,
  FPS_PRINT_TIMEOUT,
} from "./timers";
import { GAME_STATES } from "./gamestate";
import { Particle } from "./particle";
import { GameHUD } from "./game_hud";
import { SpaceCamera } from "./models/space_camera";
import { SpaceTimers } from "./space_timers";

export class Game {
  camera: SpaceCamera | null = null;
  keys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
    å: false,
    " ": false,
  };
  backgroundContainer = new Container();
  cameraContainer = new Container();
  uiContainer = new Container();
  timers = new SpaceTimers();
  gameState = GAME_STATES.normal;
  particles = [];
  pixiApp: Application | null = null;
  culler = new Culler();
  galaxy: Galaxy | null = null;
  frank: Frank | null = null;

  // UI
  background: Background | null = null;
  gameHud: GameHUD | null = null;

  constructor(pixiApp: Application) {
    this.pixiApp = pixiApp;
    this.backgroundContainer.label = "background_container";
    this.backgroundContainer.sortableChildren = true;
    this.cameraContainer.label = "camera_container";
    this.uiContainer.label = "ui_container";

    if (!this.pixiApp) throw Error("Can't run without pixiApp");

    this.cameraContainer.addChild(this.backgroundContainer);

    const body = document.getElementById("rootElement");
    if (!body) throw Error("Can't run game without body element");
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
        const key = e.key.toLowerCase();
        this.keys[key] = true;
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
    const ticker = new Ticker();
    ticker.add(this.update);
    ticker.minFPS = 60;
    ticker.maxFPS = 60;
    ticker.start();
  }

  update(ticker: Ticker) {
    try {
      const delta = ticker.deltaMS;

      // CHEATS
      if (this.keys.å && this.timers.debugEvolveTimer <= 0) {
        this.frank.fullness = this.frank.getFullnessGoal();
        this.timers.debugEvolveTimer = 500;
      }

      this.updateTimers(delta);
      this.updateGame();
      this.frank.update(
        delta,
        this.keys,
        this.galaxy,
        this.timers,
        this.cameraContainer
      );
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
      this.gameState = GAME_STATES.normal;
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
