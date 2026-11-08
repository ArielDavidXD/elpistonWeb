# Taller automotriz "El Pistón"

Sistema web para llevar el trabajo diario de un taller mecánico de barrio: clientes, vehículos, órdenes de servicio, trabajos, repuestos, inventario y pagos. Lo usan la recepcionista (desde la computadora), los mecánicos (desde el teléfono) y el dueño.

Proyecto individual de la asignatura **Programación para Dispositivos Móviles**.

- **Autor:** COMPLETAR: nombre
- **Profesor:** Ing. Roilán Rodríguez Castillo

## Tecnologías

|Parte|Tecnología|
|---|---|
|Servidor|[PocketBase](https://pocketbase.io) (base de datos SQLite, API REST, autenticación y reglas de acceso)|
|Cliente|HTML, CSS y JavaScript puros, con el SDK oficial de PocketBase (módulos ES)|

## Estructura del repositorio

```
taller-el-piston/
├── servidor/
│   ├── pb_migrations/     colecciones, campos y reglas (se aplican solos al arrancar)
│   └── pb_hooks/          (opcional) lógica del servidor
├── cliente/
│   ├── index.html
│   ├── css/estilos.css
│   └── js/                app.js, pb.js, vistas.js
├── capturas/              capturas de la aplicación en uso
└── README.md
```

`pocketbase.exe` y `pb_data/` **no están en el repositorio** (ver más abajo).

## Cómo ejecutar el proyecto

### Requisitos

- El ejecutable de PocketBase para tu sistema, descargado de https://pocketbase.io/docs/ (versión usada: COMPLETAR: versión).
- Un navegador moderno y la extensión **Live Server** de VS Code (o cualquier servidor estático).
- Conexión a internet, porque el SDK se carga desde un CDN (jsdelivr).

### 1. Servidor

1. Descomprime el ejecutable dentro de la carpeta `servidor/`.
2. Abre una terminal en esa carpeta y ejecuta:
    - Windows: `pocketbase.exe serve`
    - Mac/Linux: `./pocketbase serve`
3. Al arrancar, PocketBase aplica automáticamente las migraciones de `pb_migrations/` y crea todas las colecciones con sus reglas.
4. Abre el panel de administración en http://127.0.0.1:8090/_/ y crea tu cuenta de superusuario (la primera vez te lo pide).

### 2. Usuarios de prueba

Las cuentas no vienen en el repositorio (la base de datos no se sube). Créalas en el panel: **Collections → users → New record**, con `name`, `email`, contraseña y `rol`:

|Nombre|Correo|Rol|
|---|---|---|
|Carlos|dueno@taller.com|`dueno`|
|Ana|recepcion@taller.com|`recepcion`|
|Pedro|mecanico1@taller.com|`mecanico`|
|Luis|mecanico2@taller.com|`mecanico`|

El valor de `rol` debe escribirse exactamente así (minúsculas y sin tildes). Usa la contraseña que prefieras (mínimo 8 caracteres).

### 3. Cliente

1. Abre la carpeta `cliente/` en VS Code.
2. Clic derecho sobre `index.html` → **Open with Live Server**.
3. Entra con alguno de los usuarios anteriores.

No se puede abrir `index.html` con doble clic: los módulos de JavaScript requieren http. Si PocketBase corre en otra dirección o puerto, cambia la URL en `cliente/js/pb.js`.

## Modelo de datos

```
clientes ──< vehiculos ──< ordenes ──< trabajos
                              │  └───< uso_repuestos >── repuestos
                              │  └───< pagos
                              └── mecanico (users)
```

|Colección|Campos principales|
|---|---|
|`users`|name, email, **rol** (dueno / recepcion / mecanico)|
|`clientes`|nombre, telefono, direccion (opcional)|
|`vehiculos`|cliente, matricula, marca, modelo, anio, kilometraje|
|`repuestos`|nombre, codigo, precio_venta, existencias, stock_minimo|
|`ordenes`|vehiculo, mecanico, fecha, problema, estado, kilometraje|
|`trabajos`|orden, descripcion, precio (mano de obra)|
|`uso_repuestos`|orden, repuesto, cantidad, precio_unitario|
|`pagos`|orden, monto, fecha, metodo|

Estados de una orden: `recibida`, `en_diagnostico`, `en_reparacion`, `lista`, `entregada`, `cancelada`.

## Decisiones de diseño

**Mecánicos como usuarios con rol.** No hay una colección `mecanicos`: son usuarios de `users` con `rol = mecanico`. Así el mismo registro sirve para iniciar sesión y para asignar órdenes. La recepcionista y el dueño son usuarios con su propio rol.

**Un cliente, varios vehículos; un vehículo, varias órdenes.** Cada relación uno a muchos tiene su propia colección. Los campos de relación apuntan "hacia arriba" (`vehiculos.cliente`, `ordenes.vehiculo`).

**`repuestos` y `uso_repuestos` separados.** `repuestos` es el inventario (cada repuesto aparece una vez, con su stock). `uso_repuestos` es el historial de cuándo se usó cada uno en una orden. Esto resuelve la relación muchos a muchos entre órdenes y repuestos.

**`precio_unitario` se copia en `uso_repuestos`.** Si el precio de un repuesto cambia, las órdenes antiguas conservan el precio que tenían, y los totales históricos no se alteran.

**El total y el saldo no se guardan.** Se calculan siempre: `total = suma(trabajos.precio) + suma(cantidad × precio_unitario)` y `saldo = total − suma(pagos.monto)`. Al no duplicar el dato, nunca queda desincronizado.

**Pagos en una colección aparte.** Una orden puede pagarse en varias partes, y cada pago queda registrado con su fecha y método. La web no permite pagar más que el saldo pendiente.

**Stock bajo.** Cada repuesto tiene su `stock_minimo`. Cuando `existencias <= stock_minimo`, aparece resaltado en el inventario y en el panel del dueño.

**Facturación por período.** Se suma el total de las órdenes en estado `entregada` cuya fecha cae dentro del rango elegido. Se usa la fecha de entrada de la orden porque no se guarda una fecha de entrega por separado.

**Historial protegido.** Los campos de relación no borran en cascada, y solo el dueño puede eliminar registros. Así no se pierde historial por error.

**Seguridad en el servidor, no en la interfaz.** La web oculta opciones según el rol para que el uso sea cómodo, pero quien realmente decide es PocketBase con las API Rules.

**Una sola página (SPA).** La navegación usa el hash de la URL (`#/ordenes`, `#/orden/ID`), por lo que el botón "atrás" del navegador funciona sin librerías.

## Reglas de acceso por rol

|Colección|Dueño|Recepción|Mecánico|
|---|---|---|---|
|`users`|todo|ver|ver (para asignar mecánicos)|
|`clientes`, `vehiculos`|todo|ver, crear, editar|solo ver|
|`repuestos`|todo|ver, crear, editar|ver y descontar existencias|
|`ordenes`|todo|ver, crear, editar|ver y cambiar el estado **solo de las suyas**|
|`trabajos`, `uso_repuestos`|todo|ver, crear, editar|ver y crear **solo en sus órdenes**|
|`pagos`|todo|ver, crear, editar|solo ver los de sus órdenes|

Solo el dueño puede borrar registros (y crear usuarios). Un usuario no puede cambiarse su propio rol. Las reglas exactas están en `servidor/pb_migrations/`.

## Pantallas del cliente

|Pantalla|Quién la ve|Qué permite|
|---|---|---|
|Login|todos|Iniciar sesión; el menú cambia según el rol|
|Panel|dueño|Órdenes abiertas por estado, carga por mecánico, repuestos por agotarse y facturación por período|
|Órdenes|todos (el mecánico solo las suyas)|Lista con filtro por estado y alta de órdenes|
|Detalle de orden|todos|Cambiar estado, anotar trabajos y repuestos, registrar pagos, ver total, pagado y saldo|
|Clientes|recepción y dueño|Búsqueda, alta y ficha con vehículos, historial y saldo|
|Repuestos|recepción y dueño|Inventario con alerta de stock bajo y alta de repuestos|
|Deudores|recepción y dueño|Clientes con saldo pendiente, de mayor a menor|

### Experiencia de usuario

- Diseño adaptable (computadora y teléfono).
- Colores por estado de la orden.
- Confirmación antes de cancelar una orden.
- Mensajes de éxito y de error visibles, y mensajes claros cuando una lista está vacía.
- Validaciones en formularios (campos requeridos, números mínimos, no pagar más del saldo ni usar más repuestos de los que hay).
- Búsqueda de clientes por nombre o teléfono mientras se escribe.

## Qué necesita saber el dueño y dónde lo ve

|Necesidad|Dónde|
|---|---|
|Órdenes abiertas y su estado|Panel y Órdenes|
|Trabajo asignado a cada mecánico|Panel (carga por mecánico)|
|Historial de un cliente y de un vehículo|Ficha del cliente|
|Cuánto debe cada cliente|Deudores|
|Repuestos por agotarse|Repuestos y Panel|
|Facturación de un período|Panel|

## Limitaciones y mejoras futuras

- Las existencias se descuentan desde el cliente al agregar un repuesto a una orden. Si dos personas lo hacen a la vez podría haber inconsistencias. La mejora es hacerlo en el servidor con un hook en `pb_hooks`.
- No hay edición ni borrado de registros desde la interfaz (solo desde el panel de PocketBase).
- El historial por vehículo aparece dentro de la ficha del cliente, sin pantalla propia.
- No hay paginación: con el volumen de un taller de barrio no hace falta, pero haría falta con muchos datos.
- Migrar el cliente a Vite para gestionar el SDK con npm y usar variables de entorno.

## Capturas

Las capturas de la aplicación en uso están en la carpeta `capturas/`.

|||
|---|---|
|Login|Panel|
|Órdenes|Detalle de orden|
|Clientes|Repuestos|
|Deudores|Vista del mecánico en móvil|#   e l p i s t o n W e b  
 #   e l p i s t o n W e b  
 #   e l p i s t o n W e b  
 #   e l p i s t o n W e b  
 