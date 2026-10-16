export function getOriginName(raw) {
  return raw.origin?.name ?? "Unknown";
}

export function getLocationName(raw) {
  return raw.location?.name ?? "Unknown";
}

export function toCharacterProfile(raw) {
  const { id, name, status, species, image } = raw;

  return {
    id,
    name: name ?? "Desconocido",
    status: status ?? "Unknown",
    species: species ?? "Unknown",
    image: image ?? "",
    originName: getOriginName(raw),
    locationName: getLocationName(raw),
  };
}