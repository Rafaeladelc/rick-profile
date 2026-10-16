export async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    const err = new Error("Network error");
    err.code = "NETWORK";
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return await response.json();
}