# Dirección artística: ideas impresas, música de fondo

Investigación aplicada al portfolio de Jorge Pindado. Revisión: 30 de octubre de 2026.

## Lectura de las siete referencias

Las imágenes de REFES.zip se usan como referencias de lenguaje visual; sus marcas, textos y composiciones no se incorporan como obra propia.

1. **Out of Office / Spring Summer.** Papel con fibra, tinta que sangra y pierde definición, círculo rosa irregular y pequeñas marcas de registro. Enseña a combinar una estructura tipográfica sencilla con imperfecciones materiales localizadas.
2. **Oh Wonder / New York.** Mayúsculas de mucho peso y poco aire vertical; el gesto rojo convive con una masa negra compacta. La energía procede del contraste de escalas y de la tinta, no de multiplicar adornos.
3. **Omnee World.** Firma roja amplia frente a información sans pequeña y densa. Respalda mantener la firma de Jorge como gesto personal dominante, sin repetirla en cada control.
4. **March 2004.** Caligrafía seca y listado musical compacto sobre un eje inclinado. Sugiere el vínculo con el vinilo, la selección y el archivo; la inclinación se reserva a gestos puntuales, sin comprometer la lectura de navegación.
5. **On Lunch Break.** Logotipo gestual, texto apretado y vacíos deliberados. Demuestra que una identidad expresiva no necesita llenar cada rincón ni convertir el grunge en desorden.
6. **Artific Studios.** Fondo marfil, firma negra, pequeños bloques centrales y marcas de corte discretas. Aporta el tono de una pieza impresa y una jerarquía fuerte entre identidad e información auxiliar.
7. **The Alchemy of David.** Fondo oscuro texturado, blanco roto, firma enorme y créditos minúsculos. Aporta atmósfera cinematográfica por contraste tonal y materialidad, sin exigir vídeo, niebla ni efectos continuos.

## Criterio de implementación

La idea es una **colección de proyectos que se manipula como discos y se lee como material impreso**. Papel, tinta y metal pertenecen al mismo espacio; la decoración debe proceder de ese mundo.

- **Soporte:** textura estática de papel, fibras y desgaste tonal sutil. Compartir el lenguaje entre portada, carga y ventanas. Evitar filtros de ruido animados sobre toda la pantalla.
- **Tinta:** pequeñas pérdidas mediante máscara en títulos grandes y gestos de identidad. Mantener cuerpos, botones e información de contacto limpios y legibles. Una máscara raster debe tener transparencia real o emplear luminancia: un archivo negro/blanco completamente opaco no desgasta nada en el modo alpha predeterminado.
- **Tipografía:** títulos principales en mayúsculas, peso marcado e interlineado compacto. La jerarquía se construye con tamaño, peso y posición. El cuerpo conserva un interlineado cómodo.
- **Tracking:** interpretar «−50» como −0.05em, según las unidades tipográficas de Adobe. Revisarlo ópticamente por tamaño; no sumar indiscriminadamente otro −0.05em a titulares que ya estaban muy cerrados. Evitar solapamientos y comprobar móvil.
- **Enlaces y controles:** sin palabras subrayadas. Dar respuesta mediante color, cambio de posición corto e indicador de foco visible. Los SVG entregados por Jorge se usan pequeños y discretos; se preserva el icono del menú hamburguesa.
- **3D:** conservar los materiales metálicos y los reflejos del vinilo. Para papel o desgaste, preferir mapas de superficie y color estáticos. No convertir el tocadiscos en un shader de ilustración ni sumar postprocesado solo para aparentar inmersión.
- **Movimiento:** una transición coherente y breve; conservar render bajo demanda, límites de resolución y reducción de movimiento. La atmósfera debe funcionar con la escena quieta.

## Fuentes y decisiones que sustentan

- [Chrome: texturizar contenido](https://developer.chrome.com/docs/modern-web-guidance/guides/visual-design/visually-texture-content): máscaras repetidas, distinción alpha/luminancia y mejora progresiva si no hay soporte.
- [Adobe: kerning y tracking](https://helpx.adobe.com/indesign/desktop/format-and-style-text/tabs-indents-and-spacing/about-kerning-and-tracking.html): unidades relativas de 1/1000 em.
- [MDN: letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/letter-spacing): el espacio negativo se añade al espaciado natural; valores extremos pueden hacer irreconocibles las palabras.
- [MDN: rendimiento CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS): reducir animaciones innecesarias y favorecer transform/opacity; no aplicar will-change indiscriminadamente.
- [Three.js: render bajo demanda](https://threejs.org/manual/pages/rendering-on-demand.html): actualizar cuando cambia la escena, adecuado para un expositor interactivo.
- [Codrops: grano risograph](https://tympanus.net/codrops/2022/03/07/creating-a-risograph-grain-light-effect-in-three-js/): referencia de grano vinculado a luz. Es un tutorial de 2022; no copiar sus shaders sin contrastar versiones.
- [Foro Three.js: postprocesado para PBR](https://discourse.threejs.org/t/post-processing-recommendation-for-pbr/33855) y [coste a resoluciones altas](https://discourse.threejs.org/t/performance-drops-at-higher-resolutions/52074): experiencias comunitarias sobre pasadas y resolución. Orientan hipótesis; no son mediciones de este portfolio.

## Skills evaluadas

Las guías locales de diseño frontend, rendimiento, GSAP y revisión web cubren la implementación general. Los equivalentes de Anthropic y Vercel en skills.sh duplican capacidades existentes.

Como complemento específico destaca [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills): se revisaron [threejs-materials](https://www.skills.sh/cloudai-x/threejs-skills/threejs-materials) y [threejs-performance](https://www.skills.sh/cloudai-x/threejs-skills/threejs-performance). El catálogo mostraba 15.8K instalaciones de materials y GitHub 3.9K estrellas del paquete. No es un paquete oficial de Three.js. Sus ejemplos apuntan a r186 y este proyecto usa r180: aplicar conceptos contrastados con la versión instalada, sin actualizar la dependencia por seguir la skill. No se instalaron skills nuevas.

## Alcance de la evidencia

Este documento separa referencias observadas, criterios de diseño y recomendaciones técnicas. No contiene mediciones de FPS, Core Web Vitals ni resultados en el Mac del usuario. La valoración visual y la fluidez deben verificarse en el navegador, a distintos anchos y con las interacciones reales; ninguna textura o recomendación garantiza por sí sola una mejora de rendimiento.

## Revisión de esta edición

La guía de diseño propuso «The pinned poster», semilla 501467115. Se adapta a la colección de vinilos ya existente: firma y encabezado permanecen como cartel, y la selección cambia el proyecto. Se conserva el recorrido de una pantalla solicitado previamente, sin sustituirlo por el ejemplo de scroll de la guía. Las referencias del usuario prevalecen en textura, numeración y carácter editorial.

Revisión visual interna: diseño 8/10, uso 8/10, creatividad 7.5/10 y contenido 8/10; no es una evaluación externa. Se observaron portada, selección, contacto y ficha, con variantes de escritorio, 768 y 390 píxeles. Se corrigieron exceso de grano, visibilidad de flechas sobre rojo y tamaño del botón Copiar. Compilación de seis rutas correcta. La textura no añade animación ni pases 3D. Quedan sin medir FPS y experiencia en dispositivos físicos.
