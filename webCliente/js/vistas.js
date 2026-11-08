
import { pb } from './pb.js';


// ############################################################
// 1. AYUDAS
// ############################################################
// Atajo para buscar un elemento de la página: $('#menu')
const $ = selector => document.querySelector(selector);

// Convierte caracteres peligrosos (< > & " ') para que un texto
// escrito por un usuario no pueda romper ni atacar la página.
function esc(texto) {
  const cambios = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto ?? '').replace(/[&<>"']/g, c => cambios[c]);
}

// 25 -> "$25.00"
const dinero = n => '$' + Number(n || 0).toFixed(2);

// "2026-11-05 10:30:00" -> "2026-11-05"
const soloFecha = f => (f || '').slice(0, 10);

// Suma una lista: sumar(trabajos, t => t.precio)
const sumar = (lista, valor) => lista.reduce((total, x) => total + valor(x), 0);

// Nombre para mostrar de un usuario (el email está oculto para otros usuarios)
const nombreUsuario = u => u?.name || u?.email || (u ? 'Mecánico ' + u.id.slice(0, 4) : '');

// ---------- Rol del usuario con sesión ----------
const rolActual = () => pb.authStore.record?.rol;
// El mecánico solo consulta; recepción y dueño pueden crear y editar
const puedeEditar = () => rolActual() !== 'mecanico';

// ---------- Estados de una orden ----------
const ESTADOS = {
  recibida: 'Recibida',
  en_diagnostico: 'En diagnóstico',
  en_reparacion: 'En reparación',
  lista: 'Lista para entregar',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};
// Etiqueta de color con el nombre del estado
const etiquetaEstado = e => `<span class="estado ${e}">${ESTADOS[e] || e}</span>`;

// ---------- Pintar en pantalla ----------
// Mete el HTML de la pantalla dentro de <main id="contenido">
const pintar = html => { $('#contenido').innerHTML = html; };

// Si la lista está vacía devuelve un mensaje; si no, devuelve ''
const mensajeVacio = (lista, mensaje) =>
  lista.length ? '' : `<p class="vacio">${mensaje}</p>`;

// Crea las <option> de un <select>. El valor de cada opción es el id.
const opciones = (lista, textoDe) =>
  lista.map(x => `<option value="${x.id}">${esc(textoDe(x))}</option>`).join('');

// Cuadro verde (ok) o rojo (error) que aparece arriba unos segundos
export function aviso(mensaje, esError = false) {
  const caja = $('#aviso');
  caja.textContent = mensaje;
  caja.className = esError ? 'error' : 'ok';
  caja.hidden = false;
  clearTimeout(aviso.temporizador);
  aviso.temporizador = setTimeout(() => { caja.hidden = true; }, 3500);
}

// ---------- Formularios ----------
// Conecta un formulario: al enviarlo lee sus campos, ejecuta "guardar",
// muestra "Guardado" y vuelve a cargar la pantalla. Si falla, muestra el error.
function conectarFormulario(selector, guardar, recargar) {
  $(selector).addEventListener('submit', async evento => {
    evento.preventDefault();
    try {
      const datos = Object.fromEntries(new FormData(evento.target));
      await guardar(datos);
      aviso('Guardado');
      recargar();
    } catch (error) {
      aviso(error.message || 'No se pudo guardar', true);
    }
  });
}

// ---------- Cálculo de totales ----------
// Trae todas las órdenes y a cada una le calcula:
//   total  = mano de obra + repuestos usados
//   pagado = suma de sus pagos
//   saldo  = total - pagado
// El total NO se guarda en la base de datos: siempre se calcula aquí.
async function ordenesConTotales() {
  const [ordenes, trabajos, usos, pagos] = await Promise.all([
    pb.collection('ordenes').getFullList({ sort: '-fecha', expand: 'vehiculo.cliente,mecanico' }),
    pb.collection('trabajos').getFullList(),
    pb.collection('uso_repuestos').getFullList(),
    pb.collection('pagos').getFullList(),
  ]);

  for (const o of ordenes) {
    const deEstaOrden = lista => lista.filter(x => x.orden === o.id);
    const manoDeObra = sumar(deEstaOrden(trabajos), t => t.precio);
    const repuestos = sumar(deEstaOrden(usos), u => u.cantidad * u.precio_unitario);
    o.total = manoDeObra + repuestos;
    o.pagado = sumar(deEstaOrden(pagos), p => p.monto);
    o.saldo = o.total - o.pagado;
  }
  return ordenes;
}


// ############################################################
// 2. ÓRDENES
// ############################################################
// ---------- LISTA DE ÓRDENES ----------

function tablaOrdenes(lista) {
  if (!lista.length) return '<p class="vacio">No hay órdenes con este filtro.</p>';
  const filas = lista.map(o => `
    <tr>
      <td>${soloFecha(o.fecha)}</td>
      <td>${esc(o.expand?.vehiculo?.matricula)}</td>
      <td>${esc(o.expand?.vehiculo?.expand?.cliente?.nombre)}</td>
      <td>${esc(nombreUsuario(o.expand?.mecanico))}</td>
      <td>${etiquetaEstado(o.estado)}</td>
      <td><a href="#/orden/${o.id}">Abrir</a></td>
    </tr>`).join('');
  return `<div class="tabla"><table>
    <tr><th>Fecha</th><th>Vehículo</th><th>Cliente</th><th>Mecánico</th><th>Estado</th><th></th></tr>
    ${filas}</table></div>`;
}

function formularioNuevaOrden(vehiculos, mecanicos) {
  return `
    <form class="caja" id="form-orden">
      <h3>Nueva orden</h3>
      <div class="fila">
        <label>Vehículo
          <select name="vehiculo" required><option value="">Elegir…</option>
            ${opciones(vehiculos, v => `${v.matricula} - ${v.expand?.cliente?.nombre || ''}`)}
          </select></label>
        <label>Mecánico
          <select name="mecanico" required><option value="">Elegir…</option>
            ${opciones(mecanicos, nombreUsuario)}
          </select></label>
        <label>Kilometraje <input type="number" name="kilometraje" min="0" required></label>
      </div>
      <label>Problema reportado <textarea name="problema" required></textarea></label>
      <button>Crear orden</button>
    </form>`;
}

async function ordenes() {
  const editor = puedeEditar();

  // 1. Pedir los datos (todo a la vez). El mecánico solo recibe SUS órdenes
  //    porque así lo decide la regla de la API en PocketBase.
  const [lista, vehiculos, mecanicos] = await Promise.all([
    pb.collection('ordenes').getFullList({ sort: '-fecha', expand: 'vehiculo.cliente,mecanico' }),
    editor ? pb.collection('vehiculos').getFullList({ sort: 'matricula', expand: 'cliente' }) : [],
    editor ? pb.collection('users').getFullList({ filter: 'rol = "mecanico"' }) : [],
  ]);

  // 2. Pintar la pantalla
  const opcionesEstado = Object.entries(ESTADOS)
    .map(([clave, nombre]) => `<option value="${clave}">${nombre}</option>`).join('');
  pintar(`
    <h2>${editor ? 'Órdenes de servicio' : 'Mis órdenes'}</h2>
    <div class="barra">
      <select id="filtro"><option value="">Todos los estados</option>${opcionesEstado}</select>
    </div>
    <div class="caja" id="lista"></div>
    ${editor ? formularioNuevaOrden(vehiculos, mecanicos) : ''}`);

  // 3. Filtro por estado
  const mostrar = estado => {
    const filtradas = lista.filter(o => !estado || o.estado === estado);
    $('#lista').innerHTML = tablaOrdenes(filtradas);
  };
  mostrar('');
  $('#filtro').addEventListener('change', e => mostrar(e.target.value));

  // 4. Crear orden (solo recepción y dueño)
  if (editor) {
    conectarFormulario('#form-orden', async datos => {
      await pb.collection('ordenes').create({
        vehiculo: datos.vehiculo,
        mecanico: datos.mecanico,
        problema: datos.problema,
        kilometraje: Number(datos.kilometraje),
        estado: 'recibida',
        fecha: new Date().toISOString(),
      });
      // El vehículo guarda el último kilometraje con el que llegó
      await pb.collection('vehiculos').update(datos.vehiculo, { kilometraje: Number(datos.kilometraje) });
    }, ordenes);
  }
}

// ---------- DETALLE DE UNA ORDEN ----------

function bloqueTrabajos(trabajos, cerrada) {
  const filas = trabajos.map(t => `<tr><td>${esc(t.descripcion)}</td><td>${dinero(t.precio)}</td></tr>`).join('');
  const formulario = cerrada ? '' : `
    <form id="form-trabajo" class="fila">
      <label>Descripción <input name="descripcion" required></label>
      <label>Mano de obra <input type="number" name="precio" min="0" step="0.01" required></label>
      <button>Agregar trabajo</button>
    </form>`;
  return `<div class="caja"><h3>Trabajos</h3>
    ${mensajeVacio(trabajos, 'Aún no hay trabajos.')}
    <table>${filas}</table>${formulario}</div>`;
}

function bloqueRepuestos(usos, inventario, cerrada) {
  const filas = usos.map(u => `
    <tr>
      <td>${esc(u.expand?.repuesto?.nombre)}</td>
      <td>${u.cantidad} × ${dinero(u.precio_unitario)}</td>
      <td>${dinero(u.cantidad * u.precio_unitario)}</td>
    </tr>`).join('');
  const formulario = cerrada ? '' : `
    <form id="form-uso" class="fila">
      <label>Repuesto
        <select name="repuesto" required><option value="">Elegir…</option>
          ${opciones(inventario, r => `${r.nombre} (quedan ${r.existencias})`)}
        </select></label>
      <label>Cantidad <input type="number" name="cantidad" min="1" value="1" required></label>
      <button>Agregar repuesto</button>
    </form>`;
  return `<div class="caja"><h3>Repuestos usados</h3>
    ${mensajeVacio(usos, 'Aún no hay repuestos.')}
    <table>${filas}</table>${formulario}</div>`;
}

function bloquePagos(pagos) {
  const filas = pagos.map(p => `
    <tr><td>${soloFecha(p.fecha)}</td><td>${esc(p.metodo)}</td><td>${dinero(p.monto)}</td></tr>`).join('');
  // Solo recepción y dueño registran pagos
  const formulario = !puedeEditar() ? '' : `
    <form id="form-pago" class="fila">
      <label>Monto <input type="number" name="monto" min="0.01" step="0.01" required></label>
      <label>Método
        <select name="metodo">
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select></label>
      <button>Registrar pago</button>
    </form>`;
  return `<div class="caja"><h3>Pagos</h3>
    ${mensajeVacio(pagos, 'Sin pagos registrados.')}
    <table>${filas}</table>${formulario}</div>`;
}

async function orden(id) {
  // 1. Pedir la orden y todo lo que cuelga de ella
  const deEstaOrden = pb.filter('orden = {:id}', { id });
  const [o, trabajos, usos, pagos, inventario] = await Promise.all([
    pb.collection('ordenes').getOne(id, { expand: 'vehiculo.cliente,mecanico' }),
    pb.collection('trabajos').getFullList({ filter: deEstaOrden }),
    pb.collection('uso_repuestos').getFullList({ filter: deEstaOrden, expand: 'repuesto' }),
    pb.collection('pagos').getFullList({ filter: deEstaOrden, sort: 'fecha' }),
    pb.collection('repuestos').getFullList({ sort: 'nombre' }),
  ]);

  // 2. Cálculos
  const total = sumar(trabajos, t => t.precio) + sumar(usos, u => u.cantidad * u.precio_unitario);
  const pagado = sumar(pagos, p => p.monto);
  const saldo = total - pagado;
  const vehiculo = o.expand?.vehiculo;
  const cliente = vehiculo?.expand?.cliente;
  const cerrada = o.estado === 'entregada' || o.estado === 'cancelada';
  const recargar = () => orden(id);

  // 3. Pintar
  const opcionesEstado = Object.entries(ESTADOS)
    .map(([clave, nombre]) => `<option value="${clave}" ${clave === o.estado ? 'selected' : ''}>${nombre}</option>`).join('');
  pintar(`
    <p><a href="#/ordenes">← Volver</a></p>
    <div class="caja">
      <h2>Orden: ${esc(vehiculo?.matricula)} ${etiquetaEstado(o.estado)}</h2>
      <p>${esc(vehiculo?.marca)} ${esc(vehiculo?.modelo)} ${esc(vehiculo?.anio)} ·
         Cliente: <a href="#/cliente/${cliente?.id}">${esc(cliente?.nombre)}</a> (${esc(cliente?.telefono)})</p>
      <p><b>Problema:</b> ${esc(o.problema)}</p>
      <label>Cambiar estado <select id="estado">${opcionesEstado}</select></label>
    </div>
    ${bloqueTrabajos(trabajos, cerrada)}
    ${bloqueRepuestos(usos, inventario, cerrada)}
    ${bloquePagos(pagos)}
    <div class="caja totales">
      Total: <b>${dinero(total)}</b> · Pagado: <b>${dinero(pagado)}</b> ·
      Saldo: <b class="${saldo > 0 ? 'bajo' : ''}">${dinero(saldo)}</b>
    </div>`);

  // 4. Cambiar el estado
  $('#estado').addEventListener('change', async e => {
    const nuevo = e.target.value;
    if (nuevo === 'cancelada' && !confirm('¿Cancelar esta orden?')) return recargar();
    try {
      await pb.collection('ordenes').update(id, { estado: nuevo });
      aviso('Estado actualizado');
      recargar();
    } catch (error) { aviso(error.message, true); }
  });

  // 5. Agregar un trabajo
  if ($('#form-trabajo')) {
    conectarFormulario('#form-trabajo', datos =>
      pb.collection('trabajos').create({ orden: id, descripcion: datos.descripcion, precio: Number(datos.precio) }),
    recargar);
  }

  // 6. Agregar un repuesto: se anota el uso y se restan las existencias
  if ($('#form-uso')) {
    conectarFormulario('#form-uso', async datos => {
      const repuesto = inventario.find(r => r.id === datos.repuesto);
      const cantidad = Number(datos.cantidad);
      if (cantidad > repuesto.existencias) {
        throw new Error(`Solo quedan ${repuesto.existencias} de ${repuesto.nombre}`);
      }
      await pb.collection('uso_repuestos').create({
        orden: id,
        repuesto: repuesto.id,
        cantidad,
        precio_unitario: repuesto.precio_venta, // se copia el precio de hoy
      });
      await pb.collection('repuestos').update(repuesto.id, { existencias: repuesto.existencias - cantidad });
    }, recargar);
  }

  // 7. Registrar un pago
  if ($('#form-pago')) {
    conectarFormulario('#form-pago', datos => {
      if (Number(datos.monto) > saldo) throw new Error('El pago supera el saldo pendiente');
      return pb.collection('pagos').create({
        orden: id, monto: Number(datos.monto), metodo: datos.metodo, fecha: new Date().toISOString(),
      });
    }, recargar);
  }
}


// ############################################################
// 3. CLIENTES
// ############################################################
async function clientes() {
  pintar(`
    <h2>Clientes</h2>
    <div class="caja">
      <input id="buscar" placeholder="Buscar por nombre o teléfono…" style="width:100%">
      <div id="lista"></div>
    </div>
    <form class="caja" id="form-cliente">
      <h3>Nuevo cliente</h3>
      <div class="fila">
        <label>Nombre <input name="nombre" required></label>
        <label>Teléfono <input name="telefono" required></label>
        <label>Dirección (opcional) <input name="direccion"></label>
      </div>
      <button>Guardar cliente</button>
    </form>`);

  // Busca en el servidor cada vez que se escribe algo
  async function buscar() {
    const texto = $('#buscar').value.trim();
    const filtro = texto ? pb.filter('nombre ~ {:t} || telefono ~ {:t}', { t: texto }) : '';
    const lista = await pb.collection('clientes').getFullList({ sort: 'nombre', filter: filtro });
    const filas = lista.map(c =>
      `<p><a href="#/cliente/${c.id}"><b>${esc(c.nombre)}</b></a> · ${esc(c.telefono)}</p>`).join('');
    $('#lista').innerHTML = mensajeVacio(lista, 'No hay clientes. Crea el primero abajo.') + filas;
  }
  $('#buscar').addEventListener('input', buscar);
  buscar();

  conectarFormulario('#form-cliente', datos => pb.collection('clientes').create(datos), clientes);
}

async function cliente(id) {
  // 1. Datos del cliente, sus vehículos y todas las órdenes (para su historial)
  const [datos, vehiculos, todasLasOrdenes] = await Promise.all([
    pb.collection('clientes').getOne(id),
    pb.collection('vehiculos').getFullList({ filter: pb.filter('cliente = {:id}', { id }) }),
    ordenesConTotales(),
  ]);

  // 2. Solo las órdenes de los vehículos de este cliente
  const historial = todasLasOrdenes.filter(o => o.expand?.vehiculo?.cliente === id);
  const deuda = sumar(historial.filter(o => o.estado !== 'cancelada'), o => o.saldo);

  const listaVehiculos = vehiculos.map(v =>
    `<p>${esc(v.matricula)} · ${esc(v.marca)} ${esc(v.modelo)} ${esc(v.anio)} · ${v.kilometraje} km</p>`).join('');
  const filasHistorial = historial.map(o => `
    <tr>
      <td>${soloFecha(o.fecha)}</td>
      <td>${esc(o.expand.vehiculo.matricula)}</td>
      <td>${etiquetaEstado(o.estado)}</td>
      <td>${dinero(o.total)}</td>
      <td><a href="#/orden/${o.id}">Ver</a></td>
    </tr>`).join('');

  // 3. Pintar la ficha
  pintar(`
    <p><a href="#/clientes">← Volver</a></p>
    <div class="caja">
      <h2>${esc(datos.nombre)}</h2>
      <p>Tel: ${esc(datos.telefono)} · ${esc(datos.direccion || 'Sin dirección')}</p>
      <p>Saldo pendiente: <b class="${deuda > 0 ? 'bajo' : ''}">${dinero(deuda)}</b></p>
    </div>
    <div class="caja">
      <h3>Vehículos</h3>
      ${mensajeVacio(vehiculos, 'Este cliente no tiene vehículos.')}
      ${listaVehiculos}
      <form id="form-vehiculo">
        <div class="fila">
          <label>Matrícula <input name="matricula" required></label>
          <label>Marca <input name="marca" required></label>
          <label>Modelo <input name="modelo" required></label>
          <label>Año <input type="number" name="anio" min="1950" max="2100" required></label>
          <label>Km <input type="number" name="kilometraje" min="0" required></label>
        </div>
        <button>Agregar vehículo</button>
      </form>
    </div>
    <div class="caja">
      <h3>Historial de servicios</h3>
      ${mensajeVacio(historial, 'Sin servicios todavía.')}
      <table>${filasHistorial}</table>
    </div>`);

  // 4. Agregar un vehículo: queda asignado a este cliente
  conectarFormulario('#form-vehiculo', datos =>
    pb.collection('vehiculos').create({
      cliente: id,
      matricula: datos.matricula,
      marca: datos.marca,
      modelo: datos.modelo,
      anio: Number(datos.anio),
      kilometraje: Number(datos.kilometraje),
    }),
  () => cliente(id));
}


// ############################################################
// 4. REPUESTOS
// ############################################################
async function repuestos() {
  const lista = await pb.collection('repuestos').getFullList({ sort: 'nombre' });

  const filas = lista.map(r => {
    // Stock bajo: quedan igual o menos que el mínimo definido
    const bajo = r.existencias <= r.stock_minimo;
    return `
      <tr>
        <td>${esc(r.codigo)}</td>
        <td>${esc(r.nombre)}</td>
        <td>${dinero(r.precio_venta)}</td>
        <td class="${bajo ? 'bajo' : ''}">${r.existencias}${bajo ? ' ⚠ Stock bajo' : ''}</td>
      </tr>`;
  }).join('');

  const formulario = !puedeEditar() ? '' : `
    <form class="caja" id="form-repuesto">
      <h3>Nuevo repuesto</h3>
      <div class="fila">
        <label>Nombre <input name="nombre" required></label>
        <label>Código <input name="codigo" required></label>
        <label>Precio de venta <input type="number" name="precio_venta" min="0" step="0.01" required></label>
        <label>Existencias <input type="number" name="existencias" min="0" required></label>
        <label>Stock mínimo <input type="number" name="stock_minimo" min="0" value="3" required></label>
      </div>
      <button>Guardar repuesto</button>
    </form>`;

  pintar(`
    <h2>Inventario de repuestos</h2>
    <div class="caja tabla">
      ${mensajeVacio(lista, 'No hay repuestos registrados.')}
      <table>
        <tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Existencias</th></tr>
        ${filas}
      </table>
    </div>
    ${formulario}`);

  if (puedeEditar()) {
    conectarFormulario('#form-repuesto', datos =>
      pb.collection('repuestos').create({
        nombre: datos.nombre,
        codigo: datos.codigo,
        precio_venta: Number(datos.precio_venta),
        existencias: Number(datos.existencias),
        stock_minimo: Number(datos.stock_minimo),
      }),
    repuestos);
  }
}


// ############################################################
// 5. REPORTES
// ############################################################
// ---------- DEUDORES: clientes con saldo pendiente ----------
async function deudores() {
  const todas = await ordenesConTotales();
  // Órdenes no canceladas que todavía deben dinero
  const conDeuda = todas.filter(o => o.estado !== 'cancelada' && o.saldo > 0.009);

  // Agrupar por cliente: { idCliente: { cliente, deuda, ordenes } }
  const porCliente = {};
  for (const o of conDeuda) {
    const c = o.expand?.vehiculo?.expand?.cliente;
    if (!c) continue;
    if (!porCliente[c.id]) porCliente[c.id] = { cliente: c, deuda: 0, ordenes: 0 };
    porCliente[c.id].deuda += o.saldo;
    porCliente[c.id].ordenes += 1;
  }
  const lista = Object.values(porCliente).sort((a, b) => b.deuda - a.deuda); // mayor deuda primero

  const filas = lista.map(x => `
    <tr>
      <td><a href="#/cliente/${x.cliente.id}">${esc(x.cliente.nombre)}</a></td>
      <td>${esc(x.cliente.telefono)}</td>
      <td>${x.ordenes}</td>
      <td class="bajo">${dinero(x.deuda)}</td>
    </tr>`).join('');

  pintar(`
    <h2>Clientes con saldo pendiente</h2>
    <div class="caja tabla">
      ${mensajeVacio(lista, 'Nadie debe nada. ¡Todo al día!')}
      ${lista.length ? `<table>
        <tr><th>Cliente</th><th>Teléfono</th><th>Órdenes</th><th>Debe</th></tr>${filas}</table>` : ''}
    </div>`);
}

// ---------- PANEL DEL DUEÑO ----------
async function panel() {
  const [todas, inventario] = await Promise.all([
    ordenesConTotales(),
    pb.collection('repuestos').getFullList(),
  ]);

  // Órdenes abiertas = ni entregadas ni canceladas
  const abiertas = todas.filter(o => o.estado !== 'entregada' && o.estado !== 'cancelada');
  const cuantas = estado => abiertas.filter(o => o.estado === estado).length;
  const resumenEstados = ['recibida', 'en_diagnostico', 'en_reparacion', 'lista']
    .map(e => `${etiquetaEstado(e)} ${cuantas(e)}`).join(' &nbsp; ');

  // Carga por mecánico: cuántas órdenes abiertas tiene cada uno
  const cargaPorMecanico = {};
  for (const o of abiertas) {
    const nombre = nombreUsuario(o.expand?.mecanico) || 'Sin asignar';
    cargaPorMecanico[nombre] = (cargaPorMecanico[nombre] || 0) + 1;
  }
  const filasCarga = Object.entries(cargaPorMecanico)
    .map(([nombre, n]) => `<p>${esc(nombre)}: <b>${n}</b> orden(es)</p>`).join('');

  // Repuestos que están en el mínimo o por debajo
  const porAgotarse = inventario.filter(r => r.existencias <= r.stock_minimo);
  const filasBajos = porAgotarse
    .map(r => `<p class="bajo">${esc(r.nombre)}: quedan ${r.existencias}</p>`).join('');

  // Fechas por defecto de la facturación: del día 1 del mes hasta hoy
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const aTexto = f => f.toISOString().slice(0, 10);

  pintar(`
    <h2>Panel</h2>
    <div class="caja"><h3>Órdenes abiertas (${abiertas.length})</h3><p>${resumenEstados}</p></div>
    <div class="caja"><h3>Carga por mecánico</h3>
      ${mensajeVacio(abiertas, 'Sin órdenes abiertas.')}${filasCarga}</div>
    <div class="caja"><h3>Repuestos por agotarse</h3>
      ${mensajeVacio(porAgotarse, 'Todo el stock está bien.')}${filasBajos}</div>
    <div class="caja"><h3>Facturación (órdenes entregadas)</h3>
      <div class="fila">
        <label>Desde <input type="date" id="desde" value="${aTexto(inicioMes)}"></label>
        <label>Hasta <input type="date" id="hasta" value="${aTexto(hoy)}"></label>
      </div>
      <p class="totales" id="facturacion"></p>
    </div>`);

  // Suma el total de las órdenes entregadas dentro del período elegido
  function calcularFacturacion() {
    const desde = $('#desde').value;
    const hasta = $('#hasta').value;
    const entregadas = todas.filter(o =>
      o.estado === 'entregada' && soloFecha(o.fecha) >= desde && soloFecha(o.fecha) <= hasta);
    $('#facturacion').innerHTML =
      `${entregadas.length} orden(es) · Total facturado: <b>${dinero(sumar(entregadas, o => o.total))}</b>`;
  }
  $('#desde').addEventListener('change', calcularFacturacion);
  $('#hasta').addEventListener('change', calcularFacturacion);
  calcularFacturacion();
}


// ############################################################
// 6. VISTAS — el nombre de cada una coincide con la ruta (#/ordenes, #/panel...)
// ############################################################
export const vistas = { ordenes, orden, clientes, cliente, repuestos, deudores, panel };