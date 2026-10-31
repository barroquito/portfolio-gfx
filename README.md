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


## Regla de iconos de interfaz

Cada SVG de interfaz se usa como máximo una vez por página, incluidos los diálogos ocultos. La portada reserva la flecha al CTA principal, el signo más a la pila de vinilos y la cruz al cierre de la colección. Los demás controles usan texto. Las fichas reservan la cruz al visor y el signo más al acordeón de todos los proyectos; las imágenes se amplían sin repetir iconos. Tamaño actual: 60 px; el signo más de la pila es rojo desde el inicio, mide 160 px en escritorio y 48 px en móvil (área de pulsación de 56 px), y se muestra sin círculo. Los iconos giran 90 grados al pasar el cursor o recibir foco de teclado y vuelven al salir; respetan la preferencia de movimiento reducido. El menú conserva su dibujo CSS original y su espaciado anterior.

La compilación ejecuta `tools/check-icon-usage.mjs` sobre todas las páginas generadas y falla si un símbolo de interfaz se repite.


## Edición de claridad e Inter

La web utiliza Inter Variable alojada con los assets del sitio; también los rótulos generados en canvas. Se retiran las instrucciones duplicadas de portada y colección y las leyendas que rodeaban la firma. La composición de portada pasa a título/firma, objetos y acción principal. El título conserva sus colores, aumenta a peso 800 y usa tracking −0.075em. El plus de escritorio baja a 160 px; en móvil conserva 48 px y su zona de pulsación. Se mantienen los avisos de procedencia de cada proyecto y la regla de iconos únicos.

## Navegación entre casos y galería animada

`ProjectNavigator.astro` muestra los cuatro trabajos en un acordeón nativo al final de cada ficha. Con JavaScript, seleccionar otro caso pasa por `/?play=slug`, espera la entrada del expositor y coloca su vinilo antes de abrirlo. La petición se consume una sola vez y la navegación temporal se sustituye para que Atrás vuelva al caso anterior. Sin JavaScript, los enlaces abren directamente cada ficha. Los límites de carga y navegación y la alternativa estática siguen disponibles; movimiento reducido evita la secuencia larga.

`BentoGallery.astro` y `project-gallery.ts` preparan ocho encuadres con dos caras por celda. BULK usa sus cinco imágenes originales, con detalles y distintos recortes; no son ocho piezas originales distintas. One More, Li-Onna y F1 Week usan sus portadas editoriales como placeholders en las ocho celdas hasta incorporar imágenes originales en `projects.ts`. Las fuentes se reutilizan desde la caché, sin añadir imágenes pesadas.

`bento-gallery.ts` coordina giros de cubo de 0,9–1,2 segundos con esperas irregulares de 6–15 segundos y un máximo de dos giros simultáneos. Solo se animan las celdas visibles; se detienen al ocultar la pestaña, abrir el menú o visor y al activar movimiento reducido. Hover, foco y el botón de pausa asientan suavemente la imagen; el visor abre siempre la cara visible. Se limpian los temporizadores y animaciones al abandonar la página. `case-interactions.css` contiene las composiciones de escritorio y móvil, sin cambiar los materiales del tocadiscos.

Validación de esta edición: build de las seis rutas y regla de iconos únicos correctos; Chrome a 1920 px, 1366 × 900, 390 × 844 y 360 × 800 sin desbordamiento horizontal; ocho dimensiones distintas de celda. Giros y pausa, visor de la cara visible, acordeón, cambio a One More a través del expositor y Atrás a BULK comprobados en la compilación local. La escena WebGL cargó correctamente en este Chrome. Los tamaños móviles son simulaciones de viewport, no pruebas en teléfonos físicos.

Las cuatro fichas comienzan con la descripción y los datos del proyecto, seguidos de reto, enfoque y aportación. Se elimina la imagen de apertura: el bento es su única zona de imágenes. Las portadas provisionales de los casos sin material se identifican como composiciones editoriales y se sirven como SVG locales.
