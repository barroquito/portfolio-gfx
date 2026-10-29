# Jorge Pindado — Ideas en forma

Portfolio estático con Astro 5, TypeScript y GSAP/ScrollTrigger. Diseño responsive en español. Despliegue privado mediante Sites.

## Desarrollo

Usar Node.js 22.19 o posterior compatible con Astro 5 y las dependencias fijadas. `npm ci` y `npm run dev`. `npm run build` genera `dist/`.

## Traslado a GitHub — 30 de octubre de 2026

Esta rama incorpora la versión 3 del portfolio privado de Sites, desde el commit `778b086f92d17a612698dcda5738685a5313db1f`. El código de la aplicación y los recursos se conservan sin cambios; la versión anterior de la web permanece en el historial de Git.

GitHub Pages está activado en el repositorio de destino. Esta propuesta no debe integrarse en la rama publicada hasta decidir cómo mantener la nueva web sin publicar. No incorpora automatizaciones de despliegue ni el antiguo `CNAME`. El repositorio es público: la privacidad del enlace de Sites no convierte el código de GitHub en privado.

Comprobación del traslado: `npm ci` y `npm run build` completados, con seis páginas estáticas generadas. Las verificaciones visuales descritas más abajo pertenecen a la versión original; este traslado no añade una nueva validación visual de WebGL.

## El expositor de vinilos

Portada fija sin scroll. Tocadiscos a la izquierda y colección de cuatro vinilos a la derecha. Abrir la colección muestra un carrusel horizontal con navegación táctil, flechas y teclado. Al seleccionar una portada, el vinilo pasa al plato, el brazo se mueve y se abre el caso original. Sobre mí y contacto se presentan en diálogos que conservan la composición.

La escena usa Three.js con geometrías y texturas procedurales; no requiere archivos de Blender. GSAP coordina el movimiento y la transición. El render se detiene cuando no hay animación y cuando la pestaña está oculta. Se respeta `prefers-reduced-motion`. Si WebGL no está disponible, se utiliza una composición CSS con la misma animación de selección. Los enlaces a los casos siguen funcionando y hay una lista de enlaces sin JavaScript.

## Añadir un caso

Añadir un objeto en `src/data/projects.ts`, incluyendo `record.color`, `record.ink` y `record.label`. La portada del carrusel y la página `/proyectos/[slug]/` se generan desde esos datos. Guardar las imágenes optimizadas en `public/images/`. `ProjectArtwork.astro` contiene las cubiertas de los casos y `RecordSleeve.astro` las carátulas del expositor; extender ambos temas al añadir una identidad. `record-scene.ts` contiene el modelo procedural y sus texturas. `record-room.ts` contiene los diálogos, carrusel y reproducción/transición. La dirección editorial de los casos sigue definida en `global.css`; el expositor en `record-room.css`.

## Contenido y procedencia

- BULK: proyecto académico de fin de grado. Textos traducidos y editados a partir del portfolio anterior; cinco piezas originales recuperadas de jorgepindadogfx.com/img, convertidas a WebP. No se atribuyen métricas comerciales.
- One More, Li-Onna y F1 Week: aportaciones extraídas del contexto del usuario. Fichas iniciales con cubiertas editoriales nuevas, identificadas en la interfaz. Pendiente incorporar piezas originales y profundizar en el proceso.
- CV: archivo original `CV-Jorge-Pindado-ES.pdf`, aportado por el usuario. Datos de experiencia y correo contrastados con el CV.
- La pregunta de la portada interactiva es una formulación editorial del concepto de BULK; no se presenta como un boceto histórico.
- Tipografía DM Sans servida localmente mediante Fontsource. La firma gestual es el logotipo original del usuario, extraído como vector de LOGUITO.ai y recortado al área del dibujo sin alterar sus curvas.

## Privacidad

El acceso se controla mediante el despliegue privado de Sites, no con una contraseña en JavaScript. Se incluye `noindex` y `robots.txt`. No cambiar el acceso ni conectar el dominio público sin aprobación del propietario.

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
