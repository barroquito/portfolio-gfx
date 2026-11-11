export type Project = {
  slug: string; number: string; title: string; subtitle: string; description: string; category: 'Identidad' | 'Campañas' | 'Personal';
  record: { color: string; ink: string; label: string };
  context: string; scope: string[]; intro: string; challenge: string; approach: string;
  contribution: string; theme: string; original: boolean; gallery: {src: string; alt: string; caption: string}[];
  cover?: string;
  story?: { title: string; text: string }[];
};

export const projects: Project[] = [
{
  "slug": "li-onna",
  "number": "01",
  "title": "Li-Onna",
  "subtitle": "Una marca, distintas ocasiones.",
  "description": "Una marca, distintas ocasiones.",
  "context": "Mandala Group · Restaurante",
  "scope": [
    "Dirección de arte",
    "Eventos",
    "Impresos"
  ],
  "record": {
    "color": "#f5eedb",
    "ink": "#294580",
    "label": "RESTAURANTE · IDENTIDAD Y EVENTOS"
  },
  "cover": "/images/record-covers/01-li-onna.jpg",
  "theme": "li-onna",
  "original": false,
  "intro": "Li-Onna es un restaurante japonés con alma latina. Mi trabajo ha sido dar forma visual a distintos momentos del restaurante, desde sus impresos de mesa hasta su segundo aniversario y una cata de sake.",
  "challenge": "Cada ocasión necesitaba su propio carácter y una relación reconocible con la identidad del restaurante.",
  "approach": "Los impresos habituales y el aniversario comparten papel claro, azul e ilustración fina. Para la cata introduje un rojo más presente y un motivo propio, manteniendo el lenguaje editorial de Li-Onna.",
  "contribution": "Desarrollé la identidad de la cata y su logotipo, además de creatividades y aplicaciones impresas para distintos encargos de Li-Onna.",
  "gallery": [
    {
      "src": "/images/portfolio-mockups/li-onna-impresos-de-mesa.jpg",
      "alt": "Marcapáginas, portacuentas y pegatinas de Li-Onna",
      "caption": "Impresos de mesa · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/li-onna-aniversario.jpg",
      "alt": "Portacuentas del segundo aniversario de Li-Onna",
      "caption": "Segundo aniversario · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/li-onna-cata-de-sake.jpg",
      "alt": "Cartel y flyer de la cata de sake de Li-Onna",
      "caption": "Cata de sake · Mockup"
    }
  ],
  "category": "Identidad"
},
{
  "slug": "one-more",
  "number": "02",
  "title": "One More",
  "subtitle": "Identidad para una noche de los 2000.",
  "description": "Identidad para una noche de los 2000.",
  "context": "Mandala Group · Club",
  "scope": [
    "Identidad visual",
    "Brandbook",
    "Impresos"
  ],
  "record": {
    "color": "#1644aa",
    "ink": "#fff9ec",
    "label": "NIGHT CULTURE / 2000s"
  },
  "cover": "/images/record-covers/02-one-more.jpg",
  "theme": "one-more",
  "original": false,
  "intro": "One More es la evolución de Fenómeno. La música de los 2000 dio el punto de partida para construir la identidad de una nueva noche.",
  "challenge": "El cambio de nombre necesitaba un lenguaje que tuviera relación con lo que suena en el local y funcionara en soportes físicos y digitales.",
  "approach": "Trabajé con azul intenso, recortes de cultura pop, formas angulares y contrastes saturados. Los vouchers llevan ese lenguaje a la mano. El PVC cruzó One More con Sala de Despecho desde el baño del local.",
  "contribution": "Desarrollé íntegramente el brandbook de One More y diseñé las aplicaciones que se muestran en el caso.",
  "gallery": [
    {
      "src": "/images/portfolio-mockups/one-more-vouchers.jpg",
      "alt": "Dos vouchers de One More sobre una superficie azul",
      "caption": "Vouchers · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/one-more-pvc-bano.jpg",
      "alt": "PVC de One More y Sala de Despecho recreado en un baño",
      "caption": "Vente pa’ One More · Mockup"
    }
  ],
  "category": "Identidad"
},
{
  "slug": "formula-1",
  "number": "03",
  "title": "F1 Week",
  "subtitle": "Una campaña con distintas formas de vivir la carrera.",
  "description": "Una campaña con distintas formas de vivir la carrera.",
  "context": "Mandala Group · Campaña",
  "scope": [
    "Identidad de campaña",
    "Impresos",
    "Creatividades"
  ],
  "record": {
    "color": "#212121",
    "ink": "#f4efe5",
    "label": "CAMPAÑA MULTIMARCA"
  },
  "cover": "/images/record-covers/03-f1-week.jpg",
  "theme": "f1",
  "original": false,
  "intro": "La semana de Fórmula 1 fue la ocasión para convertir la retransmisión en un plan para varios locales de Mandala Group.",
  "challenge": "El mismo evento debía funcionar en locales con públicos y lenguajes visuales distintos.",
  "approach": "Houdinni llevó la campaña al rojo, el negro y el damero. Li-Onna la trasladó a marfil, azul y tipografía editorial. Sala de Despecho la vistió de verde oscuro y dorado, con una frase en su propio tono.",
  "contribution": "Diseñé el logotipo y las creatividades de la campaña. Todas las piezas de F1 Week que se muestran son diseños míos, adaptados al estilo visual de su marca.",
  "gallery": [
    {
      "src": "/images/portfolio-mockups/f1-houdinni-cartel-y-mapa.jpg",
      "alt": "Cartel y mapa de F1 Week para Houdinni",
      "caption": "Houdinni · Cartel y mapa · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/f1-li-onna-portacuentas.jpg",
      "alt": "Portacuentas de Race Weekend para Li-Onna",
      "caption": "Li-Onna · Portacuentas · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/f1-sdd-polo.jpg",
      "alt": "Frente y espalda del polo de Sala de Despecho",
      "caption": "Sala de Despecho · Polo · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/f1-houdinni-pulsera.jpg",
      "alt": "Pulsera roja y negra de F1 Week para Houdinni",
      "caption": "Houdinni · Pulsera · Mockup"
    }
  ],
  "category": "Campañas"
},
  {
    slug: 'bulk', number: '04', title: 'BULK', subtitle: 'Comer bien. Sin bajar el volumen.',
    description: 'Mi proyecto de fin de grado: una marca de alimentación saludable llevada al naming, la identidad y el packaging.',
    record: {color:'#a7c6c0',ink:'#25251f',label:'IDENTIDAD CON ACTITUD'},
    category: 'Identidad', context: 'Proyecto de fin de grado · UDIT',
    scope: ['Concepto', 'Naming', 'Identidad visual', 'Packaging'], cover: '/images/record-covers/04-bulk.jpg', theme: 'bulk', original: true,
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
  "slug": "houdinni",
  "number": "",
  "title": "Houdinni",
  "subtitle": "Un aniversario en clave de club urbano.",
  "description": "Un aniversario en clave de club urbano.",
  "context": "Mandala Group · Club",
  "scope": [
    "Aplicaciones de marca",
    "Impresos"
  ],
  "record": {
    "color": "#202020",
    "ink": "#fff",
    "label": "ANIVERSARIO"
  },
  "theme": "houdinni",
  "original": false,
  "intro": "Houdinni toma como referencia el metro de Nueva York. Dos aplicaciones del primer aniversario llevan esa identidad al espacio y al objeto.",
  "challenge": "El aniversario necesitaba un tratamiento reconocible en soportes de escalas y materiales distintos.",
  "approach": "El rótulo iluminado pone el nombre y la firma del aniversario en contraste. El grabado traslada la composición a una botella metálica.",
  "contribution": "Diseñé las aplicaciones de aniversario que se muestran en este caso.",
  "gallery": [
    {
      "src": "/images/portfolio-mockups/houdinni-lightbox-aniversario.jpg",
      "alt": "Rótulo iluminado del primer aniversario de Houdinni",
      "caption": "Lightbox · Mockup"
    },
    {
      "src": "/images/portfolio-mockups/houdinni-grabado-aniversario.jpg",
      "alt": "Botella negra con el grabado del aniversario de Houdinni",
      "caption": "Grabado de aniversario · Mockup"
    }
  ],
  "category": "Identidad"
},
{
  "slug": "sala-de-despecho",
  "number": "",
  "title": "Sala de Despecho",
  "subtitle": "Una gráfica de barra para (des)ahogar tus penas.",
  "description": "Una gráfica de barra para (des)ahogar tus penas.",
  "context": "Mandala Group · Bar y discoteca",
  "scope": [
    "Diseño gráfico",
    "Impresos"
  ],
  "record": {
    "color": "#244239",
    "ink": "#fff",
    "label": "IMPRESOS"
  },
  "theme": "sdd",
  "original": false,
  "intro": "Sala de Despecho lleva el humor y el desamor a la barra. La colaboración con Maestro Dobel es una muestra de cómo se aplica ese tono a un impreso.",
  "challenge": "La pieza debía integrar el producto invitado dentro del lenguaje de Sala de Despecho.",
  "approach": "La portada usa verde menta, tipografía cálida y una botella central. Las prendas de la campaña de carreras se muestran en F1 Week.",
  "contribution": "Diseñé la portada del menú Dobel y las piezas de Sala de Despecho que se muestran en F1 Week.",
  "gallery": [
    {
      "src": "/images/portfolio-mockups/sala-de-despecho-menu-dobel.jpg",
      "alt": "Portada verde del menú Maestro Dobel sobre una barra",
      "caption": "Menú Dobel · Mockup"
    }
  ],
  "category": "Identidad"
},
  {
    slug: 'sobre-mi', number: '', title: 'Sobre mí', subtitle: 'Una forma de mirar.',
    description: 'Soy Jorge Pindado. Diseño desde la curiosidad y me interesa cómo una idea acaba tomando forma.',
    record: {color:'#ce3024',ink:'#f5f4ef',label:'JORGE PINDADO / DISEÑO GRÁFICO'},
    category: 'Personal', context: 'Jorge Pindado', scope: [], theme: 'personal', original: true,
    intro: 'Soy Jorge Pindado, diseñador gráfico en Madrid. Me gusta entender de dónde sale una idea y seguir con ella hasta que se puede ver, tocar o usar.',
    challenge: '', approach: '', contribution: '',
    story: [
      {title:'', text:'Me reconozco en las ganas de probar otra versión aunque la primera ya funcione. A veces el cambio está en algo pequeño: mover un texto, bajar un poco la luz o quitar un elemento que lleva ahí desde el principio. Cuando acierto, la pieza se entiende mejor y se parece más a lo que quería decir.'},
      {title:'', text:'Diseñé mi firma porque quería que mi nombre se sintiera mío también al verlo. En este portfolio me interesaba que elegir un trabajo tuviera algo del gesto de sacar un disco de su funda. Me gusta ese momento en el que puedes acercarte a un objeto y descubrir un detalle a tu ritmo. Es una forma de mirar que también intento llevar a mis proyectos.'},
      {title:'', text:'En Good Rebels trabajé como director de arte junior. En Mandala Group he aplicado ese enfoque a identidades y campañas que pasan de la pantalla al espacio físico.'},
      {title:'', text:'En el trabajo disfruto al pasar de una idea a sus aplicaciones. Una identidad cambia cuando sale de la pantalla y tiene que funcionar en un envase, una publicación o un evento. Ahí aparecen preguntas que el primer boceto no tenía, y esa parte del proceso es la que más me interesa.'},
    ],
    gallery: []
  }

];

export const recordProjects = projects.filter(project => project.cover);
export const projectIndex = projects.filter(project => project.category !== 'Personal');
