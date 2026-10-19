# rick-profile

Tarjeta de perfil de un personaje de Rick and Morty.

## Endpoint elegido

`GET https://rickandmortyapi.com/api/character/?name=<texto>&page=1`

**Por qué busco por name y no por id:**

Se busca por name porque el usuario escribe el nombre del personaje que quiere ver, y no conoce su número de id. Buscar por nombre devuelve una lista (por eso uso `results[0]`), y buscar por id devuelve un solo objeto.

## Ruta a los datos en el JSON

- Primer resultado: `results[0]`
- Origen: `results[0].origin.name`
- Ubicación: `results[0].location.name`