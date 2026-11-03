export type Project = {
  slug: string; number: string; title: string; subtitle: string; description: string; category: 'Identidad' | 'Campañas' | 'Personal';
  record: { color: string; ink: string; label: string };
  context: string; scope: string[]; intro: string; challenge: string; approach: string;
  contribution: string; theme: string; original: boolean; gallery: {src: string; alt: string; caption: string}[];
  story?: { title: string; text: string }[];
};

// Add a project here to create its card, filter entry and case-study page automatically.
export const projects: Project[] = [
  {
    slug: 'bulk', number: '01', title: 'BULK', subtitle: 'Comer bien. Sin bajar el volumen.',
    description: 'Mi proyecto de fin de grado: una marca de alimentación saludable llevada al naming, la identidad y el packaging.',
    record: {color:'#a7c6c0',ink:'#25251f',label:'IDENTIDAD CON ACTITUD'},
    category: 'Identidad', context: 'Proyecto de fin de grado · UDIT',
    scope: ['Concepto', 'Naming', 'Identidad visual', 'Packaging'], theme: 'bulk', original: true,
    intro: 'BULK nació como mi proyecto de fin de grado en UDIT. Quería diseñar una marca de alimentación saludable con un lenguaje más directo, que pudiera conectar con un público joven sin parecerse a todas las demás.',
    challenge: 'Muchas marcas de este sector recurren a colores suaves y mensajes muy parecidos. Me interesaba probar otra vía: hablar de comer bien con más energía y algo de humor.',
    approach: 'Trabajé el nombre, el tono y la identidad como partes de una misma idea. Después los llevé al packaging y a distintas aplicaciones para ver cómo funcionaban juntos.',
    contribution: 'Desarrollé el concepto, el naming, la identidad visual, el tono de voz y las aplicaciones. Es un proyecto académico; las imágenes muestran las piezas que preparé para presentarlo.',
    gallery: [
      {src:'/images/bulk-drink.webp', alt:'Vaso Berry Recovery de BULK, aplicación de la identidad al packaging', caption:'01 — Packaging / Berry Recovery'},
      {src:'/images/bulk-billboard.webp', alt:'Aplicación de la campaña BULK en un soporte de publicidad exterior', caption:'02 — La identidad en la calle'},
      {src:'/images/bulk-burger.webp', alt:'Pieza gráfica de BULK con una hamburguesa como protagonista', caption:'03 — Producto y lenguaje de marca'},
      {src:'/images/bulk-bag.webp', alt:'Aplicación de la identidad de BULK a una mochila', caption:'04 — La marca fuera del packaging'},
      {src:'/images/bulk-hero.webp', alt:'Mockup de una valla de BULK en una fachada con el mensaje Double is Better', caption:'05 — Publicidad exterior / Double is Better'},
    ]
  },
  {
    slug: 'one-more', number: '02', title: 'One More', subtitle: 'Identidad para una noche de los 2000.',
    description: 'Branding y comunicación visual para la evolución de Fenómeno, con la música de los 2000 como punto de partida.',
    record: {color:'#493469',ink:'#f1e8db',label:'NIGHT CULTURE / 2000s'},
    category: 'Identidad', context: 'Mandala Group · Proyecto en desarrollo',
    scope: ['Branding', 'Desarrollo visual', 'Contenido digital'], theme: 'one-more', original: false,
    intro: 'One More es la evolución de Fenómeno, una discoteca que toma la música de los 2000 como referencia. Dentro de mi trabajo para Mandala Group, participé en el desarrollo de su branding y su comunicación visual.',
    challenge: 'El cambio de nombre necesitaba una identidad que se reconociera y tuviera relación con lo que suena en el local.',
    approach: 'Partí de las referencias de los 2000 para trabajar el lenguaje visual de la marca y sus contenidos digitales. La música marca la dirección del proyecto.',
    contribution: 'Mi trabajo se centra en el branding, el desarrollo visual y el contenido digital. El caso sigue en desarrollo.',
    gallery: []
  },
  {
    slug: 'li-onna', number: '03', title: 'Li-Onna', subtitle: 'Una identidad para una cata de sakes.',
    description: 'Logotipo y desarrollo visual para una cata de sakes en Li-Onna, un restaurante japonés de propietarios latinos.',
    record: {color:'#d66645',ink:'#30231d',label:'JAPÓN × ALMA LATINA'},
    category: 'Identidad', context: 'Mandala Group · Identidad de evento',
    scope: ['Concepto de evento', 'Logotipo', 'Desarrollo visual'], theme: 'li-onna', original: false,
    intro: 'Para esta cata de sakes en Li-Onna desarrollé un logotipo y una identidad de evento. El restaurante combina cocina japonesa y propietarios latinos; esa mezcla fue el punto de partida.',
    challenge: 'La cata necesitaba reconocerse como un evento propio y, a la vez, seguir formando parte de Li-Onna.',
    approach: 'Trabajé a partir de la identidad del restaurante para encontrar un lenguaje específico para la cata, manteniendo la relación entre ambas culturas.',
    contribution: 'Me encargué del logotipo y del desarrollo visual del evento, dentro de la identidad de Li-Onna.',
    gallery: []
  },
  {
    slug: 'formula-1', number: '04', title: 'F1 Week', subtitle: 'Un evento, varias marcas.',
    description: 'Creatividades para la semana de Fórmula 1 en distintos locales de Mandala Group, adaptadas a la identidad de cada uno.',
    record: {color:'#cbd34f',ink:'#25251f',label:'EVENT ACTIVATION'},
    category: 'Campañas', context: 'Mandala Group · Activación de evento',
    scope: ['Identidad de evento', 'Creatividades', 'Stories'], theme: 'f1', original: false,
    intro: 'Durante la semana de Fórmula 1 preparé piezas promocionales para varios locales de Mandala Group. El evento era el mismo, pero cada local tenía su propia forma de comunicarlo.',
    challenge: 'Había que mantener una relación entre las piezas sin hacer que todas las marcas parecieran la misma.',
    approach: 'Adapté el lenguaje del evento a cada local y a los formatos que necesitaba, especialmente stories. El trabajo consistía en encontrar qué compartir y qué debía cambiar en cada versión.',
    contribution: 'Diseñé el logotipo y las creatividades del evento, además de stories para Houdinni, Sala de Despecho y Fenómeno, entre otros locales del grupo.',
    gallery: []
  },
  {
    slug: 'sobre-mi', number: '05', title: 'Sobre mí', subtitle: 'Una forma de mirar.',
    description: 'Soy Jorge Pindado. Diseño desde la curiosidad y me interesa cómo una idea acaba tomando forma.',
    record: {color:'#ce3024',ink:'#f5f4ef',label:'JORGE PINDADO / DISEÑO GRÁFICO'},
    category: 'Personal', context: 'Jorge Pindado', scope: [], theme: 'personal', original: true,
    intro: 'Soy Jorge Pindado, diseñador gráfico en Madrid. Me gusta entender de dónde sale una idea y seguir con ella hasta que se puede ver, tocar o usar.',
    challenge: '', approach: '', contribution: '',
    story: [
      {title:'', text:'Me reconozco en las ganas de probar otra versión aunque la primera ya funcione. A veces el cambio está en algo pequeño: mover un texto, bajar un poco la luz o quitar un elemento que lleva ahí desde el principio. Cuando acierto, la pieza se entiende mejor y se parece más a lo que quería decir.'},
      {title:'', text:'Diseñé mi firma porque quería que mi nombre se sintiera mío también al verlo. En este portfolio me interesaba que elegir un trabajo tuviera algo del gesto de sacar un disco de su funda. Me gusta ese momento en el que puedes acercarte a un objeto y descubrir un detalle a tu ritmo. Es una forma de mirar que también intento llevar a mis proyectos.'},
      {title:'', text:'En el trabajo disfruto al pasar de una idea a sus aplicaciones. Una identidad cambia cuando sale de la pantalla y tiene que funcionar en un envase, una publicación o un evento. Ahí aparecen preguntas que el primer boceto no tenía, y esa parte del proceso es la que más me interesa.'},
    ],
    gallery: []
  }
];
