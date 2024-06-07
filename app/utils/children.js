export function filterChildData(childs, data) {
  const id = data.id || data.child_id;

  const [child] = childs.filter(e => e?.id === id);
  return child;
}

export function getVaccineId(vaccines, vaccineName) {
  if (vaccines) {
    const [filtered] = vaccines.filter(e => e.name === vaccineName);
    return filtered.id;
  }
}

export function checkVaccine(vaccines, vaccineName, child) {
  const id = getVaccineId(vaccines, vaccineName);
  return child?.past_vaccinations?.includes(id);
}
