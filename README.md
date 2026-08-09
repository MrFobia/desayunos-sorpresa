# Aurora Desayunos

Ecommerce de desayunos sorpresa para días especiales, con panel de administración.
Corre entero sobre **Cloudflare Workers**: un solo Worker sirve la aplicación React y
la API, con **D1** (SQLite de Cloudflare) como base de datos.

**«Aurora Desayunos» es un nombre provisional.** Se cambia en el panel, en
*Contenido del sitio → Marca*.

## Arrancar en local

```bash
npm install
npm run db:migrate     # crea y llena la D1 local (sólo la primera vez)
npm run dev            # Worker en :8787 y Vite en :5173
```

`npm run dev` levanta las dos partes: `wrangler dev` emula Workers y D1 en tu máquina,
y Vite sirve el front con proxy de `/api` al Worker. Es el mismo runtime que en
producción, así que lo que funciona acá funciona desplegado.

Para ver el sitio tal como queda publicado (Worker sirviendo también los estáticos):

```bash
npm run preview        # compila y sirve todo desde :8787
```

Panel: `/admin`. En local la contraseña es `aurora2026` (el valor por defecto del
código); en producción manda el secreto `ADMIN_PASSWORD`, que es distinto.

## En producción

**https://desayunos-sorpresa.nbdesigner23.workers.dev**

La base D1 `desayunos-sorpresa` ya existe, con las migraciones aplicadas y la carta
cargada. Los secretos `ADMIN_PASSWORD` y `SESSION_SECRET` están configurados en el
Worker, así que la contraseña por defecto del código no sirve en producción.

Para publicar cambios:

```bash
npm run deploy
```

Con el proyecto conectado a GitHub, Cloudflare también corre `npm run build` y
`npx wrangler deploy` en cada push a `main`.

Si cambiás el esquema, agregá una migración nueva en `migrations/` y aplicala:

```bash
npm run db:migrate          # local
npm run db:migrate:remote   # producción
```

### Si hay que rearmar todo desde cero

```bash
npx wrangler login
npx wrangler d1 create desayunos-sorpresa   # copiar el database_id a wrangler.toml
npm run db:migrate:remote
openssl rand -base64 32 | npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_PASSWORD
npm run deploy
```

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Home: hero fotográfico, ocasiones, más pedidos, ofertas, carta, diario |
| `/desayunos` | Carta con filtros de tipo, precio, tamaño y orden (viajan en la URL) |
| `/desayunos/:slug` | Ficha: galería, qué trae la caja, adicionales, día y hora, tarjeta |
| `/checkout` | Datos de entrega, con o sin cuenta |
| `/gracias/:code` | Confirmación con el código del pedido |
| `/pedido` · `/pedido/:code` | Seguimiento por código |
| `/diario` · `/diario/:slug` | Blog |
| `/cuenta` | Ingreso y registro (opcional) |
| `/admin` | Panel |

## Cómo está armado

```
worker/          API sobre Hono: index.js (rutas), db.js (D1), auth.js (contraseñas y token)
migrations/      Esquema y carga inicial de D1
data/seed.js     Contenido inicial: la carta transcrita del cuaderno
scripts/         Generadores del SQL de carga y del manifiesto de imágenes
src/             Aplicación React
tokens.css       Sistema de diseño
```

El Worker atiende `/api/*` y todo lo demás lo resuelven los assets de `dist`, con
reescritura de SPA para que las rutas del router devuelvan `index.html`.

### Base de datos

D1 con siete tablas. Se normaliza lo que se consulta o se filtra —precio, categoría,
estado, correo— y se guardan como JSON los arreglos que siempre se leen junto a su
registro padre: fotos, qué trae la caja, etiquetas, reseñas, líneas del pedido.
Partirlos en tablas obligaría a media docena de consultas por pantalla sin ganar nada;
nadie busca «cajas que traigan kiwi».

Para cambiar la carta de arranque se edita `data/seed.js` y se corre `npm run
db:generate`, que regenera `migrations/0002_seed.sql`. Una vez desplegado, el contenido
se administra desde el panel.

### Autenticación

Dos cosas del servidor Express original no sobreviven en Workers, y por eso cambiaron:

- **Contraseñas.** `crypto.scryptSync` no existe en Workers. Se usa PBKDF2-SHA256 con
  100.000 iteraciones vía WebCrypto, con salt por usuario.
- **Sesión del panel.** El `Set` de tokens en memoria no sirve: cada request puede caer
  en una instancia distinta. El token pasa a ser un valor firmado con HMAC que lleva su
  propio vencimiento (8 h), así que se verifica sin guardar nada.

### Precios

`POST /api/orders` recalcula subtotal, descuento y domicilio leyendo la base; el total
que manda el navegador se ignora. El descuento del primer pedido y la marca de
«ya usado» en la cuenta se escriben en el mismo `batch`: van juntos o no van.

## Decisiones de diseño

**El lenguaje visual es fotográfico.** La imagen ocupa el primer plano y la interfaz
desaparece: superficies mate en hueso y lino, filetes de 1 px casi invisibles en vez de
bordes, sombras muy difusas, radios de 2–4 px, un solo acento vino apagado y grano
fílmico sutil. Las clases viven en `src/index.css` dentro de `@layer components`:
`shot` (marco de foto), `veil` (velo para texto sobre imagen), `panel` / `panel-dark`,
`label` (versalitas de sistema), `filter` (filtro tipográfico subrayado), `tag`.

Una versión anterior usaba bordes negros de 1,5 px, sombras duras desplazadas y amarillo
saturado. Para un regalo de día especial leía como caricatura; por eso se reemplazó.

**Sistema de diseño en `tokens.css`.** Color en OKLCH, tipografía, escala de espacio y
motion viven ahí y se exponen a Tailwind con `@theme static`. Ningún color ni familia
tipográfica se escribe fuera de ese archivo. Fuentes: Fraunces (display) y Switzer
(cuerpo).

**Todo el CSS propio va dentro de `@layer`.** Escrito fuera de una capa gana sobre las
utilidades de Tailwind y `mt-6` deja de funcionar, sin ningún error que lo delate.

**Texto sobre fotografía.** Nunca va suelto sobre la imagen: o cae sobre una tarjeta de
papel apoyada encima, o sobre un `veil` de dos degradados. Una sábana blanca no admite
texto claro por mucho velo que se le ponga.

**El revelado al hacer scroll no puede ocultar nada.** `Reveal` arranca visible y sólo
se oculta si al montar está fuera de la ventana y hay `IntersectionObserver`, con un
respaldo de 3 s. Un efecto de entrada jamás debe ser la razón por la que una página
aparece en blanco.

**Nada de valoraciones inventadas.** Las tarjetas y la ficha muestran estrellas sólo si
el producto tiene reseñas cargadas desde el panel. Lo mismo con «los más pedidos»: el
orden sale de las unidades realmente vendidas y sólo cae a los destacados del panel
mientras no haya pedidos. Las cifras del hero se calculan de la base.

**El 3D se gana su lugar.** El bol de fruta es manipulable —se arrastra para girarlo y
al pasar por cada fruta aparece su nombre—, se carga en un chunk aparte y sólo si la
pantalla es ancha, no hay `prefers-reduced-motion` y no está activo el ahorro de datos.

## Cosas que hay que confirmar con el cliente

En el cuaderno hay tres ítems que no se leen con seguridad. Están marcados con
`needsReview: true` en `data/seed.js` y puestos con la lectura más probable:

- **Detox Box** — «bolitas de queso» (podría ser otra cosa).
- **Brunch Gourmet** — «avena con tocineta» y «bolitas de queso».

Además, **Detox Box y Brunch Gourmet tienen un precio tachado de ejemplo**
(`compareAt`) para que la sección de Ofertas tenga contenido. No es un descuento
acordado: se cambia o se borra desde el panel.

Las fotos son de Unsplash, para maquetar. Hay que reemplazarlas por fotos propias de
las cajas reales.

## Pendiente para producción

- No hay pasarela de pago: el checkout registra el pedido y el flujo sigue por WhatsApp.
- No hay envío de correos; la confirmación se coordina a mano.
- El panel se protege con una sola contraseña, sin usuarios ni roles.
