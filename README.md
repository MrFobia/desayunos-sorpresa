# Aurora Desayunos

Ecommerce de desayunos sorpresa con panel de administración. React + Tailwind v4 en el
frente, Express + un archivo JSON en el fondo. Todo el contenido del sitio —productos,
adicionales, notas del diario, textos del home, precios de domicilio— se maneja desde
`/admin` y se refleja en la web al instante.

**«Aurora Desayunos» es un nombre provisional.** Se cambia en el panel, en
*Contenido del sitio → Marca*.

## Arrancar

```bash
npm install
npm run seed     # crea server/db.json con los 8 desayunos (sólo la primera vez)
npm run dev      # API en :5174 y web en :5173 (o el primer puerto libre)
```

`npm run dev` levanta las dos partes a la vez. La web consume `/api` por proxy, así que
no hay que configurar nada más.

Panel: `/admin` · contraseña por defecto `aurora2026`.
Se cambia con la variable de entorno `ADMIN_PASSWORD`:

```bash
ADMIN_PASSWORD="la-que-quieras" npm run dev
```

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Home: hero 3D, más pedidos, cómo funciona, ofertas, carta con filtros, diario |
| `/desayunos` | Carta completa con filtros de tipo, precio, tamaño y orden |
| `/desayunos/:slug` | Ficha: galería grande, qué trae la caja, adicionales, día y hora, tarjeta |
| `/checkout` | Datos de entrega, con o sin cuenta |
| `/gracias/:code` | Confirmación con el código del pedido |
| `/pedido` · `/pedido/:code` | Seguimiento por código |
| `/diario` · `/diario/:slug` | Blog |
| `/cuenta` | Ingreso y registro (opcional) |
| `/admin` | Panel |

## Datos

`server/db.json` guarda todo. Se genera desde `server/seed.js`, que contiene **los ocho
desayunos y sus precios transcritos de las fotos del cuaderno** (Desktop/Desayunos,
07-ago-2026).

Para reescribirlo desde cero: `node server/seed.js --force`.

### Cosas que hay que confirmar con el cliente

En el cuaderno hay tres ítems que no se leen con seguridad. Están marcados con
`needsReview: true` en `server/seed.js` y puestos con la lectura más probable:

- **Detox Box** — «bolitas de queso» (podría ser otra cosa).
- **Brunch Gourmet** — «avena con tocineta» y «bolitas de queso».

Además, **Detox Box y Brunch Gourmet tienen un precio tachado de ejemplo**
(`compareAt`) para que la sección de Ofertas tenga contenido. No es un descuento
acordado: se cambia o se borra desde el panel.

## Panel

- **Desayunos** — precio, precio tachado, fotos, qué trae la caja ítem por ítem,
  categoría, para cuántas personas, etiquetas, reseñas de clientes, publicar/ocultar,
  marcar destacado.
- **Adicionales** — lo que el cliente puede sumarle a cualquier caja.
- **Pedidos** — listado con filtro por estado, cambio de estado y detalle completo
  (dirección, franja, adicionales, texto de la tarjeta).
- **Diario** — notas del blog, borrador o publicada.
- **Contenido del sitio** — marca, banner superior, titular del hero, qué secciones se
  ven en el home, costo y umbral de domicilio, descuento del primer pedido, ciudades,
  franjas de entrega, textos del newsletter y lista de suscriptores.

Las fotos salen de `public/img`. Para agregar nuevas, copiá los archivos ahí y aparecen
en el selector de imágenes del panel.

## Decisiones

**Precios en el servidor.** `POST /api/orders` recalcula subtotal, descuento y domicilio
desde la base; el total que manda el navegador no se usa. El descuento del primer pedido
se marca como usado en la cuenta al confirmar.

**El 3D se gana su lugar.** El bol del hero es manipulable: se arrastra para girarlo y
al pasar por cada fruta aparece su nombre. Se carga en un chunk aparte y sólo si la
pantalla es ancha, no hay `prefers-reduced-motion` y no está activo el ahorro de datos.
En el resto de los casos va la fotografía. El bundle de la escena no entra en la carga
inicial.

**Sistema de diseño en `tokens.css`.** Color en OKLCH, tipografía, escala de espacio y
motion viven ahí y se exponen a Tailwind con `@theme static`. Ningún color ni familia
tipográfica se escribe fuera de ese archivo. Fuentes: Fraunces (display) y Switzer
(cuerpo).

El lenguaje visual es de bloques: superficies oscuras cálidas (`tile-dark`) y amarillo
yema (`tile-yolk`) para pintar secciones enteras, borde firme de 1,5 px, sombra dura
desplazada en lugar de blur, grano sutil sobre los bloques oscuros, y etiquetas
compactas (`chip`) para la información de las tarjetas. Las clases viven en
`src/index.css` dentro de `@layer components`.

**Nada de valoraciones inventadas.** Las tarjetas y la ficha muestran estrellas sólo si
el producto tiene reseñas cargadas desde el panel; sin reseñas no aparece ninguna
puntuación. Lo mismo con «los más pedidos»: el orden sale de las unidades realmente
vendidas (`unitsSold` en `server/index.js`) y sólo cae a los destacados del panel
mientras no haya pedidos. Las cifras del hero —cantidad de desayunos, adicionales,
franjas, primera entrega— se calculan de la base.

**Todo el CSS propio va dentro de `@layer`.** Escrito fuera de una capa gana sobre las
utilidades de Tailwind y `mt-6` deja de funcionar.

## Antes de producción

Esto es un prototipo funcional, no un sistema listo para internet:

- El panel se protege con una sola contraseña y un token en memoria que se pierde al
  reiniciar el proceso. No hay rate limiting ni HTTPS.
- La base es un archivo JSON con escritura sincrónica: sirve para una máquina, no para
  concurrencia real.
- No hay pasarela de pago. El checkout registra el pedido y el flujo sigue por WhatsApp.
- Las fotos son de Unsplash, para maquetar. Hay que reemplazarlas por fotos propias de
  las cajas reales.
