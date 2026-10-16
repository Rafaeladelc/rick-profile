export function renderCharacterCard(container, profile) {
  container.innerHTML = `
    <div class="character-card">
      <img src="${profile.image}" alt="${profile.name}">
      <h2>${profile.name}</h2>
      <p>${profile.status} — ${profile.species}</p>
      <p>Origen: ${profile.originName}</p>
      <p>Ubicación: ${profile.locationName}</p>
    </div>
  `;
}