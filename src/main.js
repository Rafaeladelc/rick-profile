import { getFirstCharacterByName } from "./services/rmApi.js";
import { toCharacterProfile } from "./transform/character.js";
import { renderCharacterCard } from "./ui/characterCard.js";
import { getUserMessage } from "./ui/messages.js";

const container = document.querySelector("#card");
const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");

async function loadCharacterCard(name) {
  if (name.trim() === "") {
    container.innerHTML = "<p>Escribe el nombre de un personaje.</p>";
    return;
  }
  
container.innerHTML = "<p>Buscando...</p>"; // ← NUEVA

  try {
    const raw = await getFirstCharacterByName(name);
    const profile = toCharacterProfile(raw);
    renderCharacterCard(container, profile);
  } catch (err) {
    container.innerHTML = `<p>${getUserMessage(err)}</p>`;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadCharacterCard(input.value);
});