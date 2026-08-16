export function unlockedTowerIds({ completedMap = 0, totems = 0 }) {
  const ids = new Set(['rock-thrower', 'spear-hunter']);
  if (completedMap >= 2) ids.add('fire-keeper');
  if (completedMap >= 4) ids.add('tar-pit');
  if (completedMap >= 5) ids.add('boulder-launcher');
  if (totems >= 12) ids.add('trapper');
  if (completedMap >= 8) ids.add('watchtower');
  if (completedMap >= 10) ids.add('beast-tamer');
  if (totems >= 25) ids.add('shaman');
  if (completedMap >= 15) ids.add('tribal-warrior');
  if (totems >= 40) ids.add('mammoth-rider');
  if (completedMap >= 20) ids.add('fire-slinger');
  return ids;
}
