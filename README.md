# Jorge Pindado — Ideas en forma

Portfolio estático con Astro 5, Three.js, TypeScript y GSAP/ScrollTrigger. Diseño responsive en español. Publicado mediante GitHub Pages en https://www.jorgepindadogfx.com.

## Desarrollo

Usar Node.js 22.19 o posterior compatible con Astro 5 y las dependencias fijadas. `npm ci` y `npm run dev`. `npm run build` genera `dist/`.

## Traslado a GitHub — 30 de octubre de 2026

La base visual procede de la versión 3 del portfolio privado de Sites, desde el commit `778b086f92d17a612698dcda5738685a5313db1f`. La versión anterior de la web permanece en el historial de Git.

La publicación pública está autorizada por el propietario. En Settings → Pages, la fuente debe ser GitHub Actions y el dominio personalizado debe conservarse como `www.jorgepindadogfx.com`, con HTTPS activado. El workflow `.github/workflows/deploy.yml` instala las dependencias fijadas, compila Astro y publica únicamente `dist/` en cada actualización de `main`; también permite una ejecución manual. Los cambios en otras ramas no se publican.

Para seguir mejorando la web, editar `src/` y `public/`, validar con `npm run build` y revisar los cambios antes de integrarlos en `main`. No editar la salida `dist/` a mano. El dominio, la URL canónica y `robots.txt` están preparados para la versión pública.

Comprobación del traslado: `npm ci` y `npm run build` completados, con seis páginas estáticas generadas. Las verificaciones visuales descritas más abajo pertenecen a la versión original; este traslado no añade una nueva validación visual de WebGL.

## El expositor de vinilos

Portada fija sin scroll. Tocadiscos a la izquierda y colección de cuatro vinilos a la derecha. Abrir la colección muestra un carrusel horizontal con navegación táctil, flechas y teclado. Al seleccionar una portada, el vinilo pasa al plato, el brazo se mueve y se abre el caso original. Sobre mí y contacto se presentan en diálogos que conservan la composición.

La escena usa Three.js. El tocadiscos es un modelo propio creado en Blender: `assets/tocadiscos-jorge.blend` contiene las piezas y el estudio editables, y `public/models/tocadiscos.glb` es la versión optimizada para la web. Las fundas y los vinilos se generan de forma dinámica. GSAP coordina el movimiento y la transición. Se respeta `prefers-reduced-motion`. Si falla el GLB o WebGL se muestra `public/models/tocadiscos-poster.webp`, render del mismo modelo, con acceso a la colección. Ya no se muestra otro tocadiscos procedural ni una recreación CSS durante la carga.

La portada muestra una pantalla de carga hasta el primer render; el progreso corresponde a la descarga del modelo. Tras cinco segundos permite explorar la colección sin esperar. Un límite de quince segundos elimina la pantalla si el módulo no termina y deja enlaces nativos a los casos. Las entradas de portada y proyecto respetan movimiento reducido. El brillo del aluminio y el vinilo se controla con iluminación de estudio, materiales físicos y mapas de rugosidad; las fundas tienen grano en el color y en la superficie, y el selector HTML añade el mismo acabado de papel.

El script `tools/build-turntable.py` documenta y permite regenerar el modelo original con Blender 5.2. Para preservar cambios hechos manualmente en el `.blend`, no ejecutar el generador sobre el archivo editado: exportar desde Blender solo la colección del modelo como GLB y mantener el objeto `TONEARM_PIVOT`, necesario para la animación del brazo. El estudio del `.blend` sirve para editar y presentar el modelo; la iluminación del sitio se controla en `src/scripts/record-scene.ts`.

## Añadir un caso

Añadir un objeto en `src/data/projects.ts`, incluyendo `record.color`, `record.ink` y `record.label`. La portada del carrusel y la página `/proyectos/[slug]/` se generan desde esos datos. Guardar las imágenes optimizadas en `public/images/`. `ProjectArtwork.astro` contiene las cubiertas de los casos y `RecordSleeve.astro` las carátulas del expositor; extender ambos temas al añadir una identidad. `record-scene.ts` carga el tocadiscos y genera los vinilos y fundas. `record-room.ts` contiene los diálogos, carrusel y reproducción/transición. La dirección editorial de los casos sigue definida en `global.css`; el expositor en `record-room.css`.

## Contenido y procedencia

- BULK: proyecto académico de fin de grado. Textos traducidos y editados a partir del portfolio anterior; cinco piezas originales recuperadas de jorgepindadogfx.com/img, convertidas a WebP. No se atribuyen métricas comerciales.
- One More, Li-Onna y F1 Week: aportaciones extraídas del contexto del usuario. Fichas iniciales con cubiertas editoriales nuevas, identificadas en la interfaz. Pendiente incorporar piezas originales y profundizar en el proceso.
- CV: archivo original `CV-Jorge-Pindado-ES.pdf`, aportado por el usuario. Datos de experiencia y correo contrastados con el CV.
- La pregunta de la portada interactiva es una formulación editorial del concepto de BULK; no se presenta como un boceto histórico.
- Tipografía DM Sans servida localmente mediante Fontsource. La firma gestual es el logotipo original del usuario, extraído como vector de LOGUITO.ai y recortado al área del dibujo sin alterar sus curvas.

## Privacidad

La web de GitHub Pages y los archivos del repositorio, incluido el CV, son públicos por autorización del propietario. La copia alojada en Sites conserva su acceso privado y se administra de forma independiente.

## Validación de la versión del expositor

- Compilación de las seis rutas estáticas de Astro.
- Navegador de escritorio a 1363 × 936: portada fija, colección, desplazamiento horizontal, selección de BULK, animación alternativa, apertura del caso y regreso a la colección.
- Layouts de 390 × 844 y 360 × 800 mediante iframes con viewport independiente: portada, menú, colección y selección de One More. Sin desbordamiento horizontal en las vistas medidas.
- Diálogos nativos con Escape, retorno de foco y navegación por teclado. CV y contacto conservados; correo con copia y alternativa compatible.
- Límite de QA: el navegador del entorno tiene WebGL desactivado. El render Three.js compila, pero no se ha podido verificar visualmente aquí. La composición alternativa y su recorrido de interacción sí se han comprobado. Pendiente comprobar el render en un dispositivo físico con WebGL.
- Se mantienen las piezas originales de BULK y las cubiertas editoriales identificadas de los otros tres casos. No se ha añadido audio.

## Dirección de arte — edición de la firma

Las siete imágenes de REFES.zip guían el contraste entre firma gestual, grotesk compacta y amplios espacios vacíos. Se utiliza el logotipo propio, sin reproducir los logotipos ni piezas de las referencias. Fondo casi blanco, grafito y acentos rojos selectivos. Se sustituye la cursiva editorial genérica por DM Sans con pesos diferenciados en portada, colección, diálogos y casos. El logotipo se aplica como SVG en cabecera, composición principal y detalles del tocadiscos.

La iluminación Three.js incorpora RoomEnvironment + PMREM para reflejos de estudio. Laca de grafito con clearcoat, aluminio satinado con anisotropía y microtextura, vinilo con surcos y barniz, cubiertas mate con textura de papel y materiales que reciben luz. Exposición y luz principal reducidas; mapa de sombras adaptado al dispositivo. La alternativa CSS comparte paleta y acabados. El entorno de QA sigue sin WebGL: estos materiales se compilan pero requieren revisión visual en un dispositivo compatible.

Validación de esta edición: compilación de las seis rutas; revisión visual del expositor y colección a 1363 × 936; layouts de 390 × 844, 360 × 800 y 844 × 390; menú y diálogo Sobre mí en móvil; carrusel y apertura de Li-Onna en escritorio y F1 Week en móvil; regreso a la colección y cierre con Escape. SVG original cargado en todas sus aplicaciones, sin deformación. Sin desbordamiento horizontal en las vistas medidas. La iluminación WebGL mantiene el límite de verificación descrito arriba.
