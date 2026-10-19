import { fetchJson } from "./fetchJson.js";

export function buildCharacterSearchUrl({ name, page = 1 }) {
  const baseUrl = "https://rickandmortyapi.com/api/character/";
  const params = new URLSearchParams({ name: name.trim(), page: String(page) });
  return `${baseUrl}?${params.toString()}`;
}

function noResultsError() {
  const err = new Error("No results");
  err.code = "NO_RESULTS";
  return err;
}

export async function getFirstCharacterByName(name) {
  const url = buildCharacterSearchUrl({ name });
  let data;
  try {
    data = await fetchJson(url);
  } catch (err) {
    if (err.status === 404) {
      throw noResultsError();
    }
    throw err;
  }
  const first = data.results?.[0];
  if (!first) {
    throw noResultsError();
  }
  return first;
}