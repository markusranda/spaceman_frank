import { Upgrade } from "./upgrade.js";

let possibleUpgrades = [];

export function initPossibleUpgrades() {
  possibleUpgrades = [
    new Upgrade("acceleration"),
    new Upgrade("max_speed"),
    new Upgrade("fuel_consumption"),
  ];
}

export function getRandomUpgrade() {
  const index = Math.floor(Math.random() * possibleUpgrades.length);
  return possibleUpgrades[index];
}
