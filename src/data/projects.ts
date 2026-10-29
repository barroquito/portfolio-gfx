export type Project = {
  slug: string; number: string; title: string; subtitle: string; category: 'Identidad' | 'Campañas';
  record: { color: string; ink: string; label: string };
  context: string; scope: string[]; intro: string; challenge: string; approach: string;
  contribution: string; theme: string; original: boolean; gallery: {src: string; alt: string; caption: string}[];
};

// Add a project here to create its card, filter entry and case-study page automatically.
export const projects: Project[] = [
  {
    slug: 'bulk', number: '01', title: 'BULK', subtitle: 'Comer bien. Sin bajar el volumen.',
    record: {color:'#a7c6c0',ink:'#25251f',label:'IDENTIDAD CON ACTITUD'},
    category: 'Identidad', context: 'Proyecto de fin de grado · UDIT',
    scope: ['Concepto', 'Naming', 'Identidad visual', 'Packaging'], theme: 'bulk', original: true,
    intro: 'Una identidad de alimentación saludable que cambia la contención por la actitud. Un proyecto académico para conectar con un público joven desde un lenguaje más directo, lúdico y cultural.',
    challenge: 'La alimentación saludable suele representarse con códigos suaves y mensajes intercambiables. El reto era explorar otra manera de contarla: con energía, humor y una personalidad reconocible.',
    approach: 'Hacer de lo saludable una elección con carácter. El concepto se convierte en una identidad atrevida que une naming, tono de voz, packaging y aplicaciones de marca.',
    contribution: 'Desarrollo del concepto y del sistema de identidad: naming, lenguaje gráfico, tono de voz, packaging y aplicaciones. Proyecto académico de fin de grado.',
    gallery: [
      {src:'/images/bulk-drink.webp', alt:'Vaso Berry Recovery de BULK, aplicación de la identidad al packaging', caption:'01 — Packaging / Berry Recovery'},
      {src:'/images/bulk-billboard.webp', alt:'Aplicación de la campaña BULK en un soporte de publicidad exterior', caption:'02 — La identidad en la calle'},
      {src:'/images/bulk-burger.webp', alt:'Pieza gráfica de BULK con una hamburguesa como protagonista', caption:'03 — Producto y lenguaje de marca'},
      {src:'/images/bulk-bag.webp', alt:'Aplicación de la identidad de BULK a una mochila', caption:'04 — La marca fuera del packaging'},
      {src:'/images/bulk-hero.webp', alt:'Mockup de una valla de BULK en una fachada con el mensaje Double is Better', caption:'05 — Publicidad exterior / Double is Better'},
    ]
  },
  {
    slug: 'one-more', number: '02', title: 'One More', subtitle: 'La noche tiene memoria.',
    record: {color:'#493469',ink:'#f1e8db',label:'NIGHT CULTURE / 2000s'},
    category: 'Identidad', context: 'Mandala Group · Proyecto en desarrollo',
    scope: ['Branding', 'Desarrollo visual', 'Contenido digital'], theme: 'one-more', original: false,
    intro: 'Trabajo de branding para One More, la evolución de Fenómeno. Una discoteca cuya identidad musical mira a los 2000 y ofrece un territorio propio para desarrollar su personalidad visual.',
    challenge: 'Dar personalidad a una marca de ocio y trasladar su universo musical a una comunicación visual reconocible.',
    approach: 'El punto de partida es la música de los 2000 como referencia cultural. El desarrollo visual explora cómo convertir ese carácter en un lenguaje para la marca y sus contenidos.',
    contribution: 'Trabajo en el desarrollo del branding y la comunicación visual de One More. Caso en desarrollo dentro de mi trabajo para Mandala Group.',
    gallery: []
  },
  {
    slug: 'li-onna', number: '03', title: 'Li-Onna', subtitle: 'Japón, con alma latina.',
    record: {color:'#d66645',ink:'#30231d',label:'JAPÓN × ALMA LATINA'},
    category: 'Identidad', context: 'Mandala Group · Identidad de evento',
    scope: ['Concepto de evento', 'Logotipo', 'Desarrollo visual'], theme: 'li-onna', original: false,
    intro: 'Una cata de sakes dentro del universo de Li-Onna: un restaurante japonés de propietarios latinos. Un evento con personalidad propia, conectado con la marca que lo acoge.',
    challenge: 'Dar entidad a una experiencia puntual sin perder la conexión con la identidad del restaurante.',
    approach: 'Trabajar la personalidad del evento desde el encuentro entre la cultura japonesa y el alma latina de Li-Onna.',
    contribution: 'Creación del logotipo y de la personalidad visual de la cata de sakes, alineadas con la marca Li-Onna.',
    gallery: []
  },
  {
    slug: 'formula-1', number: '04', title: 'F1 Week', subtitle: 'Una semana. Distintas personalidades.',
    record: {color:'#cbd34f',ink:'#25251f',label:'EVENT ACTIVATION'},
    category: 'Campañas', context: 'Mandala Group · Activación de evento',
    scope: ['Identidad de evento', 'Creatividades', 'Stories'], theme: 'f1', original: false,
    intro: 'Piezas promocionales para la semana de Fórmula 1 en varios locales del grupo. Un mismo contexto de comunicación que debía encontrar su expresión en cada marca.',
    challenge: 'Comunicar una activación compartida manteniendo las distintas personalidades de los locales.',
    approach: 'Partir del evento y adaptar su expresión a cada universo de marca y al formato de stories.',
    contribution: 'Creación del logotipo y creatividades del evento, junto con stories promocionales para Houdinni, Sala de Despecho y Fenómeno, entre otros locales del grupo.',
    gallery: []
  }
];
