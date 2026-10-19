# AI Prompting Log

IA usada en este ciclo: Gemini

## Mejora B (JS): mensaje correcto cuando la búsqueda no encuentra resultados

**Problema detectado:** En rick-profile, al buscar "xyzxyz" (un personaje que no existe), la pantalla mostraba "Algo salió mal. Inténtalo de nuevo en unos minutos." en lugar de "No encontramos ningún personaje con ese nombre." En la pestaña Red, la petición GET https://rickandmortyapi.com/api/character/?name=xyzxyz&page=1 devolvía estado 404.

### Prompt 1 (vago)
```Mi app muestra "Algo salió mal" cuando busco un personaje que no existe. Arréglalo.```

**Respuesta recibida (resumen):** Supuso que la causa era un 404 (lo dedujo de "no existe", sin tener evidencia) y dio soluciones para varios escenarios a la vez: fetch, axios y un servidor Express. Inventó una URL (api.ejemplo.com/personajes/${nombre}), una función buscarPersonaje, un #resultado y una clase .alerta-info que no existen en mi proyecto. No propuso ningún plan de verificación.

**Qué apliqué:** Nada.

### Prompt 2 (estructurado)
```text
Contexto:
App web (SPA) en JavaScript vanilla con Vite, sin frameworks. Busca un personaje de la API pública de Rick and Morty por nombre y muestra su tarjeta. El código está separado en services/ (pedir datos), transform/ (convertir datos) y ui/ (dibujar y mensajes para la usuaria).

Objetivo:
Cuando busco un nombre que no existe (por ejemplo "xyzxyz"), la usuaria debe ver "No encontramos ningún personaje con ese nombre." en lugar de "Algo salió mal. Inténtalo de nuevo en unos minutos."

Restricciones:
•	No agregar librerías (nada de axios).
•	Mantener la separación services / transform / ui; no mezclar pedir datos con dibujar.
•	Cambio mínimo: no reescribir las funciones, solo lo necesario.
•	Solo JavaScript vanilla.

Evidencia:
•	Síntoma: al buscar "xyzxyz" la pantalla muestra "Algo salió mal. Inténtalo de nuevo en unos minutos."
•	Pestaña Red de DevTools: GET https://rickandmortyapi.com/api/character/?name=xyzxyz&page=1 devuelve estado 404.
•	Código actual (cada archivo va entre líneas con ===):

=== services/fetchJson.js ===
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
=== fin de services/fetchJson.js ===

=== services/rmApi.js ===
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
  const data = await fetchJson(url);
  const first = data.results?.[0];
  if (!first) {
    throw noResultsError();
  }
  return first;
}
=== fin de services/rmApi.js ===

=== ui/messages.js ===
export function getUserMessage(err) {
  if (err.code === "NO_RESULTS") {
    return "No encontramos ningún personaje con ese nombre.";
  }
  if (err.code === "NETWORK") {
    return "No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.";
  }
  return "Algo salió mal. Inténtalo de nuevo en unos minutos.";
}
=== fin de ui/messages.js ===

Formato de salida:
1.	Dos o tres hipótesis de por qué se muestra el mensaje genérico, cada una con cómo comprobarla en DevTools.
2. El cambio mínimo de código.
3. Una explicación breve de por qué funciona.
4. Una checklist para verificar en el navegador.

Criterios de éxito:
•	Al buscar "xyzxyz" aparece "No encontramos ningún personaje con ese nombre."
•	En Red sigue apareciendo el 404 (es normal).
•	Una búsqueda válida como "rick" sigue mostrando la tarjeta.
•	Un error de red sigue mostrando el mensaje de conexión.
```

**Respuesta recibida (resumen):**
Dio dos hipótesis (en realidad la misma idea dicha dos veces): fetchJson lanza un error HTTP 404 con err.status, y getUserMessage cae al mensaje por defecto porque ese error no tiene code "NO_RESULTS". El cambio mínimo: en getFirstCharacterByName, envolver await fetchJson(url) en try/catch y, si err.status === 404, lanzar noResultsError(). Incluyó una explicación breve y una checklist de 4 puntos.

**Qué apliqué:** 
El try/catch en services/rmApi.js tal como lo propuso, copiando solo el código (sin las líneas === que repitió dentro de su bloque).

**Verificación:**
- Busqué "xyzxyz": aparece "No encontramos ningún personaje con ese nombre." y en Red sigue el 404.
- Busqué "rick": sigue apareciendo la tarjeta (petición 200).
- Con Red en "Sin conexión" busqué "birdperson" (un nombre nuevo, para evitar la caché): aparece "No pudimos conectarnos...".
- Con git diff comprobé que lo único que cambió respecto a mi versión guardada fue el formato (líneas en blanco y los parámetros de URLSearchParams en una sola línea), no la lógica.

### Dónde la IA asumió mal o falló

- **Prompt vago:** inventó URL, funciones y clases que no existen; sugirió axios y Express sin que yo los tuviera; dijo que fetch lanza una excepción con un 404, lo cual es falso para fetch (solo es cierto en axios) y se contradijo al revisar response.status a mano.
- **Prompt estructurado:** repitió las líneas "=== services/rmApi.js ===" dentro del bloque de código; si las hubiera copiado, el archivo habría dado error de sintaxis. Además, sus dos hipótesis eran casi iguales.
- **Cómo lo detecté:** leí la respuesta antes de copiarla (en el vago comparé con lo que yo ya había probado sobre fetch y 404) y verifiqué todo en el navegador y con git diff antes de hacer commit.

### Lo que aprendí

Con evidencia concreta (síntoma exacto, estado de Red y código mínimo) y restricciones claras, la IA llegó al mismo arreglo que yo había construido. Sin eso, respondió a todos los casos posibles menos al mío.
