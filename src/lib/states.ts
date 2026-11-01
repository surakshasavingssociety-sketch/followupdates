import fs from "node:fs";
import path from "node:path";
import type { StateInfo } from "./types";

const dataFile = path.join(process.cwd(), "data", "states.json");

function loadStates(): StateInfo[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8")) as { states?: StateInfo[] };
    return parsed.states || [];
  } catch {
    return [];
  }
}

export const states = loadStates();

export function getState(slug: string): StateInfo | undefined {
  return states.find((state) => state.id === slug);
}

export function statesByRegion(): Array<{ region: string; states: StateInfo[] }> {
  const groups = new Map<string, StateInfo[]>();
  for (const state of states) {
    const list = groups.get(state.region) || [];
    list.push(state);
    groups.set(state.region, list);
  }
  return [...groups.entries()]
    .map(([region, list]) => ({ region, states: list.sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

export const unionTerritories = states.filter((state) => state.type === "ut");
export const stateGovernments = states.filter((state) => state.type === "state");
