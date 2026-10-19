# AI Prompting Log

IA usada en este ciclo: Gemini

## Entrada 1: Mejora B (JS): mensaje correcto cuando la búsqueda no encuentra resultados

**Problema detectado:** En rick-profile, al buscar "xyzxyz" (un personaje que no existe), la pantalla mostraba "Algo salió mal. Inténtalo de nuevo en unos minutos." en lugar de "No encontramos ningún personaje con ese nombre." En la pestaña Red, la petición GET https://rickandmortyapi.com/api/character/?name=xyzxyz&page=1 devolvía estado 404.

### Prompt 1 (vago)

```text
Mi app muestra "Algo salió mal" cuando busco un personaje que no existe. Arréglalo.
```

**Respuesta recibida (resumen):** Supuso que la causa era un 404 (lo dedujo de "no existe", sin tener evidencia) y dio soluciones para varios escenarios a la vez: fetch, axios y un servidor Express. Inventó una URL (api.ejemplo.com/personajes/${nombre}), una función buscarPersonaje, un #resultado y una clase .alerta-info que no existen en mi proyecto. No propuso ningún plan de verificación.

**Qué apliqué:** Nada.

### Prompt 2 (estructurado)

```text
Contexto:
App web (SPA) en JavaScript vanilla con Vite, sin frameworks. Busca un personaje de la API pública de Rick and Morty por nombre y muestra su tarjeta. El código está separado en services/ (pedir datos), transform/ (convertir datos) y ui/ (dibujar y mensajes para la usuaria).

Objetivo:
Cuando busco un nombre que no existe (por ejemplo "xyzxyz"), la usuaria debe ver "No encontramos ningún personaje con ese nombre." en lugar de "Algo salió mal. Inténtalo de nuevo en unos minutos."

Restricciones:
• No agregar librerías (nada de axios).
• Mantener la separación services / transform / ui; no mezclar pedir datos con dibujar.
• Cambio mínimo: no reescribir las funciones, solo lo necesario.
• Solo JavaScript vanilla.

Evidencia:
• Síntoma: al buscar "xyzxyz" la pantalla muestra "Algo salió mal. Inténtalo de nuevo en unos minutos."
• Pestaña Red de DevTools: GET https://rickandmortyapi.com/api/character/?name=xyzxyz&page=1 devuelve estado 404.
• Código actual (cada archivo va entre líneas con ===):

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
1. Dos o tres hipótesis de por qué se muestra el mensaje genérico, cada una con cómo comprobarla en DevTools.
2. El cambio mínimo de código.
3. Una explicación breve de por qué funciona.
4. Una checklist para verificar en el navegador.

Criterios de éxito:
• Al buscar "xyzxyz" aparece "No encontramos ningún personaje con ese nombre."
• En Red sigue apareciendo el 404 (es normal).
• Una búsqueda válida como "rick" sigue mostrando la tarjeta.
• Un error de red sigue mostrando el mensaje de conexión.
```

**Respuesta recibida (resumen):** Dio dos hipótesis (en realidad la misma idea dicha dos veces): `fetchJson` lanza un error HTTP 404 con `err.status`, y `getUserMessage` cae al mensaje por defecto porque ese error no tiene `code` "NO_RESULTS". El cambio mínimo: en `getFirstCharacterByName`, envolver `await fetchJson(url)` en try/catch y, si `err.status === 404`, lanzar `noResultsError()`. Incluyó una explicación breve y una checklist de 4 puntos.

**Qué apliqué:** El try/catch en `services/rmApi.js` tal como lo propuso, copiando solo el código (sin las líneas === que repitió dentro de su bloque).

### Verificación

- Busqué "xyzxyz": aparece "No encontramos ningún personaje con ese nombre." y en Red sigue el 404.
- Busqué "rick": sigue apareciendo la tarjeta (petición 200).
- Con Red en "Sin conexión" busqué "birdperson" (un nombre nuevo, para evitar la caché): aparece "No pudimos conectarnos...".
- Con `git diff` comprobé que lo único que cambió respecto a mi versión guardada fue el formato (líneas en blanco y los parámetros de `URLSearchParams` en una sola línea), no la lógica.

### Dónde la IA asumió mal o falló

- **Prompt vago:** inventó URL, funciones y clases que no existen; sugirió axios y Express sin que yo los tuviera; dijo que fetch lanza una excepción con un 404, lo cual es falso para fetch (solo es cierto en axios) y se contradijo al revisar `response.status` a mano.
- **Prompt estructurado:** repitió las líneas "=== services/rmApi.js ===" dentro del bloque de código; si las hubiera copiado, el archivo habría dado error de sintaxis. Además, sus dos hipótesis eran casi iguales.
- **Cómo lo detecté:** leí la respuesta antes de copiarla (en el vago comparé con lo que yo ya había probado sobre fetch y 404) y verifiqué todo en el navegador y con `git diff` antes de hacer commit.

### Lo que aprendí

Con evidencia concreta (síntoma exacto, estado de Red y código mínimo) y restricciones claras, la IA llegó al mismo arreglo que yo había construido. Sin eso, respondió a todos los casos posibles menos al mío.

## Entrada 2: Mejora A (UI/CSS): tarjeta responsive

**Problema detectado:** En rick-profile no existía ningún CSS. Medí la tarjeta en Chrome DevTools (modo Responsive): en 320 px el contenedor medía 304 px y la imagen 300×300 px (cabía con solo 4 px de sobra); en 768 px y 1280 px el contenido quedaba pegado a la izquierda y la mayor parte de la pantalla quedaba vacía. La imagen medía 300×300 px fijos en los tres anchos y el `body` tenía el margen por defecto de 8 px.

### Prompt 3 (estructurado, primera versión)

```text
Contexto:
App web (SPA) en JavaScript vanilla con Vite, sin frameworks. Busca un personaje de la API pública de Rick and Morty por nombre y muestra su tarjeta. El código está separado en services/ (pedir datos), transform/ (convertir datos) y ui/ (dibujar la tarjeta y los mensajes). La tarjeta se dibuja con JavaScript dentro de <div id="card">. Los mensajes de estado ("Buscando...", errores, sin resultados) también se dibujan dentro de #card, como un <p> sin clase (por ejemplo <p>Buscando...</p>). Todavía no existe ningún archivo CSS: la app se ve con los estilos por defecto del navegador. La usará principalmente desde el celular.

Objetivo:
Crear los estilos para que el título, el formulario y la tarjeta se vean bien en celular, tablet y computadora: contenido centrado y con un ancho máximo, imagen que se adapta al ancho disponible y formulario cómodo de usar con el dedo. Estilo sobrio: fondo claro, tarjeta con bordes redondeados y sombra suave, fuente del sistema.

Restricciones:
- Solo CSS puro: sin librerías, sin frameworks de CSS (Tailwind, Bootstrap) y sin fuentes externas.
- No modificar ningún archivo JavaScript.
- No cambiar la estructura del HTML ni los ids/clases existentes. Lo único que puede cambiar en index.html es agregar la etiqueta <link> al nuevo archivo CSS.
- Usa solo selectores que existan en el HTML que te doy (h1, #search-form, #search-input, button, #card, .character-card y las etiquetas img, h2, p). No inventes clases nuevas.
- Mobile-first: estilos base para pantallas pequeñas y @media (min-width: ...) para pantallas grandes.
- Los mensajes de estado son <p> sin clase dentro de #card y deben seguir viéndose bien.
- Si necesitas asumir algo que no está en el código que te di, dímelo en lugar de inventarlo.

Evidencia (medida en Chrome DevTools, modo Responsive, sin throttling de red):
- En 320px: el contenedor de la tarjeta mide 304px y la imagen 300x300px; cabe con solo 4px de sobra.
- En 768px: contenedor 752px, imagen 300x300px; todo queda pegado a la izquierda y la mitad derecha queda vacía.
- En 1280px: contenedor 1264px, imagen 300x300px; el contenido queda en la esquina izquierda y más de dos tercios de la pantalla quedan vacíos.
- La imagen mide 300x300px fijos en los tres anchos: no se adapta.
- El body tiene el margen por defecto de 8px. La altura del contenedor es 538px en los tres anchos.
- El input y el botón tienen el tamaño pequeño por defecto del navegador.

Código actual:
=== index.html ===
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rick Profile</title>
</head>
<body>
  <h1>Tarjeta de personaje</h1>

  <form id="search-form">
  <input id="search-input" type="text" placeholder="Nombre del personaje">
  <button type="submit">Buscar</button>
</form>

  <div id="card"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
=== fin de index.html ===

=== HTML generado dentro de #card (copiado de DevTools) ===
<div class="character-card">
      <img src="https://rickandmortyapi.com/api/character/avatar/1.jpeg" alt="Rick Sanchez">
      <h2>Rick Sanchez</h2>
      <p>Alive — Human</p>
      <p>Origen: Earth (C-137)</p>
      <p>Ubicación: Citadel of Ricks</p>
</div>
=== fin del HTML generado ===

Formato de salida:
1. El contenido completo de un archivo nuevo src/style.css, con comentarios por sección.
2. La línea exacta que debo agregar en index.html y en qué lugar.
3. Una explicación breve de por qué cada regla importante resuelve un síntoma de la evidencia.
4. Una checklist para verificar en el navegador a 320, 768 y 1280px.

Criterios de éxito:
- En 320px no hay scroll horizontal y la imagen no se sale de la tarjeta.
- En 768px y 1280px la tarjeta queda centrada y no ocupa más de unos 480px de ancho.
- El input y el botón miden al menos 44px de alto.
- Al navegar con la tecla Tab, el input y el botón muestran un foco visible.
- Al buscar "rick", la tarjeta se ve con sus datos completos en los tres anchos.
- Los mensajes de carga y error siguen viéndose bien.
```

**Respuesta recibida (resumen):** Entregó un `src/style.css` de 172 líneas (mobile-first, con un solo `@media (min-width: 480px)`), la línea `<link>` para `index.html`, una explicación por síntoma y una checklist para 320, 768 y 1280 px. Usó solo selectores que existen en mi HTML (por ejemplo `#card > p` para los mensajes de estado y `.character-card img`), sin inventar clases ni tocar el JavaScript.

**Qué apliqué:** Pegué el CSS completo en `src/style.css` y agregué `<link rel="stylesheet" href="/src/style.css" />` debajo de `<title>`. Al principio no se aplicó ningún estilo: en DevTools (pestaña Calculados) el `body` seguía con margen 8 px y fuente Times New Roman, y en el Explorer de VS Code vi que `style.css` había quedado en la raíz del proyecto y no dentro de `src/`. Lo moví a `src/` y recargué.

### Prompt 4 (iteración, mismo chat)

```text
Apliqué tu src/style.css y casi todo funciona bien en 320, 768 y 1280px. Hay un problema con el foco del teclado:

Evidencia:
- Al navegar con la tecla Tab, el input #search-input muestra un aro azul visible. Eso está bien.
- El botón button[type="submit"] ("Buscar") NO muestra ningún aro visible al recibir el foco, en ninguno de los tres anchos.

Objetivo:
Que el botón muestre un foco claramente visible con Tab, sin cambiar cómo se ve cuando no tiene el foco.

Restricciones:
- Cambia solo las reglas del botón (button[type="submit"] y button[type="submit"]:focus-visible). No toques ninguna otra regla.
- Solo CSS puro y solo selectores que ya existen.

Formato de salida:
1. Explica primero cuál es la causa del problema.
2. Las reglas del botón que cambian, completas (listas para reemplazar las actuales).
3. Cómo verificarlo con la tecla Tab.
```

**Respuesta recibida (resumen):** Explicó que el aro del foco (un `box-shadow` azul semitransparente) se confundía con el fondo azul del botón. Propuso, para `button[type="submit"]:focus-visible`, un contorno blanco interior (`outline: 2px solid #ffffff; outline-offset: -3px;`) y una sombra azul oscura (`box-shadow: 0 0 0 3px var(--accent-hover);`).

**Qué apliqué:** Solo el bloque `button[type="submit"]:focus-visible`: reemplacé la línea del `box-shadow` por las tres líneas nuevas. No toqué las demás reglas del botón (hay una dentro del `@media`).

### Verificación

- **Antes (medido en DevTools):** contenedor de 304 / 752 / 1264 px en 320 / 768 / 1280 px, imagen fija de 300×300 px, `body` con margen de 8 px y contenido pegado a la izquierda.
- **Después:** `body` de 288 / 736 / 1248 px (ancho de pantalla menos 32 de padding) con margen 0; `#card` con un ancho máximo de 480 px; contenido centrado; formulario apilado en 320 px y en una sola fila desde 480 px (visto en 768 y 1280).
- **Foco con Tab:** antes, el input mostraba aro azul y el botón no mostraba ninguno; después de la iteración, el botón muestra un contorno blanco.
- **Mensajes:** `xyzxyz` muestra "No encontramos ningún personaje con ese nombre." en una caja blanca con borde; con red en 3G rápido aparece "Buscando..."; sin conexión aparece "No pudimos conectarnos..." con el mismo estilo.
- **git diff:** una línea quitada y tres agregadas, solo en `button[type="submit"]:focus-visible`.
- **Pendiente de evaluar:** en pantallas anchas la imagen se estira de 300 px a unos 478 px (calculado a partir del `#card` de 480 px) y podría perder nitidez.

### Dónde la IA asumió mal o falló

- **Foco del botón:** su checklist decía que el input y el botón mostrarían un contorno azul de foco, pero el botón no mostraba ninguno. Lo detecté probando: recargué `http://localhost:5173/`, hice clic dentro de la página y presioné Tab.
- **Lectura de mi evidencia:** dijo que en 320 px el contenedor "desbordaba", pero mi medición decía que cabía con 4 px de sobra.
- **Instrucción ambigua:** "reemplaza únicamente las reglas del botón", pero el archivo tiene cuatro reglas del botón, una de ellas dentro del `@media`. Reemplazar esa habría roto la fila del formulario, así que cambié solo la que realmente cambiaba y lo confirmé con `git diff`.

### Lo que aprendí

Darle a la IA medidas reales (anchos, tamaños, margen) y reglas claras (solo CSS, solo selectores que existen, no tocar el JavaScript) hizo que su respuesta se pudiera aplicar casi tal cual, sin clases inventadas. Aun así, su checklist prometía algo que no se cumplía, y solo lo descubrí probando con Tab. El segundo problema se resolvió mejor con una iteración corta en el mismo chat (un solo problema, con evidencia y alcance acotado) que empezando de cero.