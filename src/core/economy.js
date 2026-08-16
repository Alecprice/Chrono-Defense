export const STARTING_RESOURCES = Object.freeze({ wood: 150, stone: 100, food: 75 });

export function canAfford(resources, cost = {}) {
  return Object.entries(cost).every(([key, amount]) => (resources[key] ?? 0) >= amount);
}

export function spend(resources, cost = {}) {
  if (!canAfford(resources, cost)) return resources;
  return Object.fromEntries(Object.entries(resources).map(([key, value]) => [key, value - (cost[key] ?? 0)]));
}

export function addResources(resources, gains = {}) {
  const next = { ...resources };
  for (const [key, value] of Object.entries(gains)) next[key] = (next[key] ?? 0) + value;
  return next;
}
