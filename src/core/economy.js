export const STARTING_RESOURCES = Object.freeze({ wood: 150, stone: 100, food: 75 });

function validCostAmount(amount) {
  return typeof amount === 'number' && Number.isFinite(amount) && amount >= 0;
}

export function canAfford(resources, cost = {}) {
  if (!resources || typeof resources !== 'object' || Array.isArray(resources)) return false;
  if (!cost || typeof cost !== 'object' || Array.isArray(cost)) return false;
  return Object.entries(cost).every(([key, amount]) => {
    const available = resources[key] ?? 0;
    return validCostAmount(amount) && typeof available === 'number' && Number.isFinite(available) && available >= amount;
  });
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
