# Valle Verde · América Prime

Página inmobiliaria basada en los mockups proporcionados, implementada con **HTML5, CSS, jQuery 3.7.1 y Bootstrap 5.3.8**. Incluye las imágenes, fuentes y bibliotecas locales para funcionar sin CDN.

## Abrir la página

Abra `index.html` en su navegador. También puede utilizar un servidor local con Node.js:

```sh
npm ci
npm start
```

Visite **http://localhost:4173**. No se necesita compilar el sitio. Node.js solo se utiliza para el servidor de desarrollo, la actualización de dependencias y las pruebas.

## Funcionalidades

- Colección de siete edificios, con superficies, precio inicial, amenidades y fichas de información.
- Filtros combinados por tipología, etapa y precio inicial; contador, estado sin resultados y restablecimiento.
- Cinco imágenes por edificio, miniaturas seleccionables, ampliación, zoom y navegación con flechas del teclado.
- Fichas que trasladan el proyecto seleccionado a la consulta de contacto.
- Asesores con llamadas y WhatsApp directo; selección de asesor en el formulario.
- Formulario con validación de nombre, teléfono, correo, consentimiento y fecha de visita. Prepara un enlace a WhatsApp con el mensaje codificado; el visitante revisa y envía el mensaje. Editar el formulario invalida la consulta preparada.
- Mapa de la zona con acceso a Google Maps, menú móvil, navegación por secciones y soporte de movimiento reducido.

## Contenido y contacto

Los edificios, imágenes, importes y contactos provienen de los mockups. Edite `assets/js/projects.js` para actualizar los proyectos, tipologías y asesores. El teléfono central también aparece en los enlaces estáticos de `index.html`; actualícelos junto con la configuración. El showroom y los horarios se encuentran en `index.html`.

Los precios son **valores iniciales del edificio**, no cotizaciones de cada tipología. Los planos técnicos no fueron proporcionados: la ficha permite solicitarlos al asesor, sin inventar documentos. Lumière no especifica dormitorios en el mockup, por lo que solo aparece cuando el filtro de tipología está en «Todas las unidades».

Antes de utilizar el sitio como catálogo comercial real, confirme con la inmobiliaria los datos y la disponibilidad del contenido de los mockups. No se incluyeron promesas de rentabilidad ni certificaciones sin documentación de respaldo.

El formulario no utiliza un backend ni almacena datos personales. **No envía correos, registra reservas ni confirma citas automáticamente**. El envío se completa en WhatsApp y la cita se coordina con el asesor. WhatsApp y el mapa requieren conexión a Internet; las imágenes, estilos, tipografías y scripts se sirven localmente.

## Archivos

```text
index.html              Estructura y secciones
assets/css/styles.css   Diseño adaptable
assets/js/projects.js   Contenido de edificios y asesores
assets/js/app.js        Filtros, galerías, fichas y contacto
assets/images/          Recursos visuales del sitio
assets/fonts/           Fuentes locales y licencias
assets/vendor/          Bootstrap, jQuery e iconos con sus licencias
scripts/                Servidor local y copia de dependencias
tests/                  Pruebas funcionales con Playwright
```

`mockups/`, `node_modules/` y los resultados de pruebas se mantienen excluidos de Git. La página no depende de la carpeta `mockups/`. Los recursos visuales necesarios se copiaron o descargaron a `assets/images/`.

## Pruebas

```sh
npm ci
npm test
```

Las pruebas utilizan Microsoft Edge en modo headless (instalado en el equipo de desarrollo). Verifican imágenes locales, filtros combinados, galerías, fichas, validación y enlaces de WhatsApp, visitas, navegación móvil entre 320 y 1024 px y apertura directa del HTML. El mapa externo se sustituye en las pruebas para no depender de Google; las pruebas no envían mensajes.

## Publicación

Puede publicar `index.html` y la carpeta `assets/` en cualquier alojamiento estático. En GitHub Pages, seleccione la rama `main` y la carpeta raíz desde **Settings → Pages**. Subir el código al repositorio no activa por sí solo GitHub Pages.

Las versiones de dependencias están registradas en `package-lock.json`. `npm ci` vuelve a copiar las bibliotecas y fuentes a `assets/` mediante `scripts/vendor.mjs`.
