import { pb } from './pb.js';
import { vistas, aviso } from './vistas.js';

const $ = s => document.querySelector(s);
const MENU = {
  dueno: [['panel','Panel'],['ordenes','Órdenes'],['clientes','Clientes'],['repuestos','Repuestos'],['deudores','Deudores']],
  recepcion: [['ordenes','Órdenes'],['clientes','Clientes'],['repuestos','Repuestos'],['deudores','Deudores']],
  mecanico: [['ordenes','Mis órdenes']]
};

function pintar() {
  const logueado = pb.authStore.isValid;
  $('#login').hidden = logueado;
  $('#app').hidden = !logueado;
  if (!logueado) return;

  const u = pb.authStore.record;
  $('#usuario').textContent = `${u.name || u.email} (${u.rol})`;
  const items = MENU[u.rol] || [];

  // Si el rol no coincide, lo dice en pantalla en vez de quedar en blanco
  if (!items.length) {
    $('#menu').innerHTML = '';
    $('#contenido').innerHTML =
      `<p class="vacio">Tu usuario tiene un rol no válido: "${u.rol}". Debe ser dueno, recepcion o mecanico. Cierra sesión y vuelve a entrar.</p>`;
    return;
  }

  const [ruta, arg] = location.hash.slice(2).split('/');
  $('#menu').innerHTML = items.map(([r, t]) =>
    `<a href="#/${r}" class="${r === ruta ? 'activo' : ''}">${t}</a>`).join('');

  const vista = vistas[ruta] || vistas[items[0][0]];
  $('#contenido').innerHTML = '<p class="vacio">Cargando…</p>';

  // Si falla la carga de datos, el error se queda escrito en pantalla
  vista(arg).catch(e => {
    console.error(e);
    $('#contenido').innerHTML = `<p class="vacio">Error: ${e.message}</p>`;
    aviso(e.message, true);
  });
}

$('#form-login').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await pb.collection('users').authWithPassword($('#email').value, $('#clave').value);
    location.hash = '';
    pintar();
  } catch (err) {
    console.error(err);
    aviso(err.status === 0
      ? 'No se pudo conectar con el servidor. ¿Está PocketBase encendido?'
      : 'Correo o contraseña incorrectos', true);
  }
});

$('#salir').addEventListener('click', () => {
  pb.authStore.clear();
  location.hash = '';
  pintar();
});

window.addEventListener('hashchange', pintar);
pintar();