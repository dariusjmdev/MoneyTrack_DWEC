/* =====================================================
   MoneyTrack · app.js
   Práctica final de JavaScript · 2º DAW
   ===================================================== */


/* =====================================================
   NIVEL 1 · Variables y formato de dinero
   ===================================================== */

const titular = "Ana García";  // Titular de la cuenta (texto)
const saldoInicial = 1000;     // Saldo de partida (número)
const moneda = "€";            // Símbolo de la moneda (texto)

/**
 * Convierte un número en texto monetario con dos decimales,
 * coma decimal y símbolo de moneda. Ej.: 85.5 -> "85,50 €"
 * @param {number} cantidad - Importe a formatear.
 * @returns {string} Importe formateado.
 */
function formatearDinero(cantidad) {
  return cantidad.toFixed(2).replace(".", ",") + " " + moneda;
}


/* =====================================================
   NIVEL 2 · Modelo de datos
   Ingresos = importes positivos · Gastos = importes negativos
   ===================================================== */

// Categorías disponibles: única fuente para el formulario y el filtro
const categorias = ["Comida", "Ocio", "Transporte", "Hogar", "Nómina", "Otros"];

// Lista de movimientos. Es "let" porque al borrar se reasigna con filter().
let movimientos = [
  { id: 1, concepto: "Nómina de septiembre", importe: 1450,  categoria: "Nómina",     fecha: "2026-09-01" },
  { id: 2, concepto: "Alquiler",             importe: -520,   categoria: "Hogar",      fecha: "2026-09-02" },
  { id: 3, concepto: "Compra semanal",       importe: -86.45, categoria: "Comida",     fecha: "2026-09-05" },
  { id: 4, concepto: "Cine con amigos",      importe: -24,    categoria: "Ocio",       fecha: "2026-09-12" },
  { id: 5, concepto: "Abono de transporte",  importe: -20,    categoria: "Transporte", fecha: "2026-09-14" },
  { id: 6, concepto: "Venta de bicicleta",   importe: 120,    categoria: "Otros",      fecha: "2026-09-18" },
  { id: 7, concepto: "Cena en restaurante",  importe: -42.9,  categoria: "Comida",     fecha: "2026-09-21" }
];


/* =====================================================
   NIVEL 3 · Cálculos con funciones y bucles
   ===================================================== */

/**
 * Suma los importes positivos recorriendo el array con un bucle.
 * @returns {number} Total de ingresos.
 */
function totalIngresos() {
  let suma = 0;
  for (const mov of movimientos) {
    if (mov.importe > 0) {
      suma += mov.importe;
    }
  }
  return suma;
}

/**
 * Suma los importes negativos recorriendo el array con un bucle.
 * @returns {number} Total de gastos (número negativo).
 */
function totalGastos() {
  let suma = 0;
  for (const mov of movimientos) {
    if (mov.importe < 0) {
      suma += mov.importe;
    }
  }
  return suma;
}

/**
 * Calcula el saldo: saldo inicial + ingresos + gastos.
 * Los gastos ya son negativos, por lo que se suman directamente.
 * @returns {number} Saldo actual.
 */
function saldoActual() {
  return saldoInicial + totalIngresos() + totalGastos();
}


/* =====================================================
   NIVEL 4 · Tabla y filtro por categoría
   ===================================================== */

// Referencias a los elementos del DOM que se usan varias veces
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const selectFiltro = document.getElementById("filtro");
const selectCategoria = document.getElementById("categoria");

/**
 * Rellena un desplegable con la lista de categorías.
 * @param {HTMLSelectElement} select - Desplegable a rellenar.
 * @param {boolean} conTodas - Si es true, añade la opción "Todas".
 */
function rellenarSelect(select, conTodas) {
  if (conTodas) {
    select.innerHTML = '<option value="todas">Todas</option>';
  }
  for (const cat of categorias) {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  }
}

/**
 * Pinta la tabla recorriendo la lista que recibe. Al recibirla por
 * parámetro sirve tanto para todos los movimientos como para una lista filtrada.
 * Los ingresos se muestran en verde y los gastos en rojo.
 * @param {Array} lista - Movimientos a mostrar.
 */
function pintarTabla(lista) {
  cuerpoTabla.innerHTML = "";

  // Mensaje cuando no hay nada que mostrar
  if (lista.length === 0) {
    cuerpoTabla.innerHTML = '<tr><td colspan="5" class="vacio">No hay movimientos.</td></tr>';
    return;
  }

  for (const mov of lista) {
    const clase = mov.importe >= 0 ? "positivo" : "negativo";
    const fecha = mov.fecha.split("-").reverse().join("/");  // AAAA-MM-DD -> DD/MM/AAAA

    cuerpoTabla.innerHTML += `
      <tr>
        <td>${fecha}</td>
        <td>${mov.concepto}</td>
        <td>${mov.categoria}</td>
        <td class="num ${clase}">${formatearDinero(mov.importe)}</td>
        <td><button class="borrar" onclick="borrarMovimiento(${mov.id})">Borrar</button></td>
      </tr>`;
  }
}

/**
 * Devuelve los movimientos de la categoría elegida en el filtro,
 * usando el método filter. Con "todas" devuelve la lista completa.
 * @returns {Array} Movimientos filtrados.
 */
function movimientosFiltrados() {
  const categoria = selectFiltro.value;
  if (categoria === "todas") {
    return movimientos;
  }
  return movimientos.filter(mov => mov.categoria === categoria);
}

// Al cambiar el filtro se vuelve a pintar la tabla con la lista filtrada
selectFiltro.addEventListener("change", () => pintarTabla(movimientosFiltrados()));


/* =====================================================
   NIVEL 5 · Estadísticas con reduce
   ===================================================== */

/**
 * Calcula el total gastado (en positivo) con reduce.
 * @returns {number} Total gastado.
 */
function totalGastado() {
  return movimientos.reduce((acumulado, mov) => {
    return mov.importe < 0 ? acumulado + Math.abs(mov.importe) : acumulado;
  }, 0);
}

/**
 * Agrupa el gasto por categoría con reduce. El acumulador es un objeto
 * cuyas claves son las categorías. Si la clave aún no existe, parte de 0.
 * @returns {Object} Ej.: { Comida: 129.35, Ocio: 24 }
 */
function gastoPorCategoria() {
  return movimientos.reduce((acumulado, mov) => {
    if (mov.importe < 0) {
      acumulado[mov.categoria] = (acumulado[mov.categoria] || 0) + Math.abs(mov.importe);
    }
    return acumulado;
  }, {});
}

/**
 * Pinta las estadísticas: total gastado, categoría con más gasto
 * y el gasto de cada categoría.
 */
function pintarEstadisticas() {
  const gastos = gastoPorCategoria();
  const entradas = Object.entries(gastos);  // [["Comida", 129.35], ["Ocio", 24], ...]

  document.getElementById("total-gastado").textContent = formatearDinero(totalGastado());

  // Lista del gasto por categoría
  const lista = document.getElementById("lista-categorias");
  lista.innerHTML = "";
  for (const [categoria, total] of entradas) {
    lista.innerHTML += `<li><span>${categoria}</span><span>${formatearDinero(total)}</span></li>`;
  }

  // Categoría con más gasto: se queda con la entrada de mayor importe
  const textoMayor = document.getElementById("mayor");
  if (entradas.length === 0) {
    textoMayor.textContent = "Todavía no hay gastos.";
    return;
  }
  const [catMayor, totalMayor] = entradas.reduce((max, actual) => actual[1] > max[1] ? actual : max);
  textoMayor.textContent = `Donde más gastas: ${catMayor} (${formatearDinero(totalMayor)})`;
}


/* =====================================================
   NIVEL 6 · Interacción completa
   ===================================================== */

/**
 * Pinta la cabecera: titular, saldo, ingresos y gastos.
 */
function pintarResumen() {
  document.getElementById("titular").textContent = titular;
  document.getElementById("saldo").textContent = formatearDinero(saldoActual());
  document.getElementById("ingresos").textContent = formatearDinero(totalIngresos());
  document.getElementById("gastos").textContent = formatearDinero(totalGastos());
}

/**
 * Actualiza toda la interfaz. Se llama tras cada cambio para que
 * ni la tabla, ni las estadísticas, ni el saldo queden desactualizados.
 */
function refrescar() {
  pintarResumen();
  pintarTabla(movimientosFiltrados());
  pintarEstadisticas();
}

/**
 * Elimina un movimiento por id. filter crea un array nuevo
 * con todos los movimientos excepto el borrado.
 * @param {number} id - Identificador del movimiento a borrar.
 */
function borrarMovimiento(id) {
  movimientos = movimientos.filter(mov => mov.id !== id);
  refrescar();
}

/**
 * Valida el formulario, crea el movimiento, lo añade al array
 * y refresca la interfaz. Valida: concepto no vacío e importe numérico.
 * @param {Event} evento - Evento "submit" del formulario.
 */
function anadirMovimiento(evento) {
  evento.preventDefault();  // Evita que la página se recargue

  const concepto = document.getElementById("concepto").value.trim();
  const importe = parseFloat(document.getElementById("importe").value);
  const error = document.getElementById("error");

  // Validaciones
  if (concepto === "") {
    error.textContent = "Escribe un concepto.";
    return;
  }
  if (isNaN(importe) || importe === 0) {
    error.textContent = "Escribe un importe numérico distinto de 0.";
    return;
  }
  error.textContent = "";

  // Creación del objeto y alta en el array
  movimientos.push({
    id: Date.now(),                                // Identificador único basado en la hora
    concepto: concepto,
    importe: importe,
    categoria: selectCategoria.value,
    fecha: new Date().toISOString().slice(0, 10)   // Fecha de hoy (AAAA-MM-DD)
  });

  evento.target.reset();  // Vacía el formulario
  refrescar();
}

document.getElementById("formulario").addEventListener("submit", anadirMovimiento);


/* =====================================================
   FONDO ANIMADO · Partículas con canvas
   Las partículas se mueven lentamente y se unen con líneas
   cuando están cerca unas de otras.
   ===================================================== */

const lienzo = document.getElementById("fondo");
const ctx = lienzo.getContext("2d");
let particulas = [];

/**
 * Ajusta el tamaño del lienzo a la ventana y crea las partículas.
 * El número de partículas depende del área de pantalla.
 */
function iniciarParticulas() {
  lienzo.width = window.innerWidth;
  lienzo.height = window.innerHeight;

  const cantidad = Math.floor((lienzo.width * lienzo.height) / 15000);
  particulas = [];
  for (let i = 0; i < cantidad; i++) {
    particulas.push({
      x: Math.random() * lienzo.width,
      y: Math.random() * lienzo.height,
      vx: (Math.random() - 0.5) * 0.4,   // Velocidad horizontal
      vy: (Math.random() - 0.5) * 0.4,   // Velocidad vertical
      radio: Math.random() * 1.5 + 0.8
    });
  }
}

/**
 * Dibuja un fotograma: mueve cada partícula, la hace rebotar en los
 * bordes y traza líneas entre las que están a menos de 120 px.
 */
function animarParticulas() {
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);

  for (let i = 0; i < particulas.length; i++) {
    const p = particulas[i];

    // Movimiento y rebote en los bordes
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > lienzo.width) p.vx *= -1;
    if (p.y < 0 || p.y > lienzo.height) p.vy *= -1;

    // Punto
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(61, 219, 176, 0.7)";
    ctx.fill();

    // Líneas con las partículas cercanas (más tenues cuanto más lejos)
    for (let j = i + 1; j < particulas.length; j++) {
      const q = particulas[j];
      const distancia = Math.hypot(p.x - q.x, p.y - q.y);
      if (distancia < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(61, 219, 176, ${0.15 * (1 - distancia / 120)})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animarParticulas);  // Siguiente fotograma
}

// Al redimensionar la ventana se regeneran las partículas
window.addEventListener("resize", iniciarParticulas);


/* =====================================================
   ARRANQUE DE LA APLICACIÓN
   ===================================================== */

// Nivel 3: resumen por consola usando formatearDinero
console.log("Saldo inicial:", formatearDinero(saldoInicial));
console.log("Ingresos:", formatearDinero(totalIngresos()));
console.log("Gastos:", formatearDinero(totalGastos()));
console.log("Saldo actual:", formatearDinero(saldoActual()));

rellenarSelect(selectFiltro, true);
rellenarSelect(selectCategoria, false);
refrescar();
iniciarParticulas();
animarParticulas();