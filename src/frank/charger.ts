import {
  FRANK_ACCELERATION_BASE,
  FRANK_ACCELERATION_CHARGING,
  FRANK_MAX_SPEED_BASE,
  FRANK_MAX_SPEED_CHARGING,
  FRANK_STATE,
} from "./const";
import { audios } from "../audio";
import { Container, Sprite } from "pixi.js";

export class FrankCharger {
  lastTailReplay = 0;
  chargeUpTimer = 0;
  chargeUpDuration = 1500;
  chargeTimer = 0;
  chargeDuration = 1000;
  chargeCooldownTimer = 0;
  cooldownDuration = 5000;

  chargingAudioObj = audios["charging"];
  multiheadTimer = 0;

  constructor() {}

  public getChargeTimer(): number {
    return this.chargeUpTimer;
  }

  public update(
    delta: number,
    keys: Record<string, boolean>,
    state: string,
    sprite: Sprite,
    container: Container,
    x: number,
    y: number,
    angle: number,
    enterState: (val: string) => void,
    setVelocity: (
      acceleration: number,
      maxSpeed: number,
      immediate: boolean
    ) => void
  ) {
    const boostBtnPressed = keys[" "];
    const { audio, gainNode, audioCtx } = this.chargingAudioObj;

    switch (state) {
      case FRANK_STATE.normal:
        if (boostBtnPressed && this.chargeCooldownTimer <= 0) {
          enterState(FRANK_STATE.preCharging);
        }

        this.chargeCooldownTimer = Math.max(
          0,
          this.chargeCooldownTimer - delta
        );
        break;

      case FRANK_STATE.preCharging: {
        const fullyCharged = this.chargeUpTimer >= this.chargeUpDuration;
        this.chargeUpTimer = Math.min(
          this.chargeUpDuration,
          this.chargeUpTimer + delta
        );

        if (!fullyCharged && boostBtnPressed) {
          gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
          audio.play();
        } else if (boostBtnPressed && fullyCharged) {
          const now = performance.now();
          if (now - this.lastTailReplay > 200) {
            this.lastTailReplay = now;
            audio.currentTime = audio.duration * 0.9;
            audio.play();
          }
        }

        if (!boostBtnPressed && fullyCharged) {
          enterState(FRANK_STATE.charging);
          this.chargeTimer = this.chargeDuration;
          this.chargeUpTimer = 0;
          setVelocity(
            FRANK_ACCELERATION_CHARGING,
            FRANK_MAX_SPEED_CHARGING,
            true
          );

          this.chargeCooldownTimer = this.cooldownDuration;
        } else if (!boostBtnPressed) {
          enterState(FRANK_STATE.normal);
          this.chargeUpTimer = 0;
          audio.currentTime = 0;
          audio.pause();
          gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        }

        break;
      }

      case FRANK_STATE.charging:
        if (this.chargeTimer > 0) {
          this.chargeTimer = Math.max(0, this.chargeTimer - delta);
        } else {
          enterState(FRANK_STATE.normal);
          setVelocity(FRANK_ACCELERATION_BASE, FRANK_MAX_SPEED_BASE, false);
        }

        this.updateSpawnAfterimage(x, y, sprite, container, angle);
        break;
    }

    this.multiheadTimer = Math.max(0, this.multiheadTimer - delta);
  }

  updateSpawnAfterimage(
    x: number,
    y: number,
    frankSprite: Sprite,
    container: Container,
    angle: number
  ) {
    if (this.multiheadTimer <= 0) {
      const afterimage = new Sprite(frankSprite.texture);

      // Copy transform properties
      afterimage.x = x;
      afterimage.y = y;
      afterimage.rotation = angle + Math.PI / 2;
      afterimage.anchor.set(frankSprite.anchor.x, frankSprite.anchor.y);
      afterimage.scale.set(frankSprite.scale.x, frankSprite.scale.y);

      // Visuals
      afterimage.alpha = 0.3;

      // Optional: tint to give a ghostly or energy effect
      afterimage.tint = 0x88ccff;

      container.addChild(afterimage);

      // Fade and remove
      const fadeTime = 300; // ms
      const fadeSteps = 10;
      let step = 0;

      const fadeInterval = setInterval(() => {
        step++;
        afterimage.alpha -= 0.3 / fadeSteps;
        if (step >= fadeSteps) {
          clearInterval(fadeInterval);
          container.removeChild(afterimage);
        }
      }, fadeTime / fadeSteps);

      // Reset timer
      this.multiheadTimer = 100;
    }
  }
}
