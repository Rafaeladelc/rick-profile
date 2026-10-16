export function getUserMessage(err) {
  if (err.code === "NO_RESULTS") {
    return "No encontramos ningún personaje con ese nombre.";
  }
  if (err.code === "NETWORK") {
    return "No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.";
  }
  return "Algo salió mal. Inténtalo de nuevo en unos minutos.";
}