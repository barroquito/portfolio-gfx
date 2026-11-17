import type { Project } from './projects';
import type { Language } from './language';

type ProjectCopy = Pick<Project, 'subtitle' | 'description' | 'intro' | 'challenge' | 'approach' | 'contribution' | 'story'> & {
  title?: string;
};

const copy: Partial<Record<string, ProjectCopy>> = {
  'li-onna': {
    subtitle: 'One brand, different occasions.',
    description: 'One brand, different occasions.',
    intro: 'Li-Onna is a Japanese restaurant with a Latin soul. I gave visual form to different moments in the life of the restaurant, from its table stationery to its second anniversary and a sake tasting.',
    challenge: 'Each occasion needed a character of its own and a recognizable connection to the restaurant’s identity.',
    approach: 'The everyday stationery and anniversary pieces share light-colored paper, blue ink and delicate illustration. For the tasting, I brought red to the foreground and introduced a distinct motif, while keeping Li-Onna’s editorial style.',
    contribution: 'I developed the sake tasting’s identity and logo, along with creative assets and print pieces for several Li-Onna briefs.',
  },
  'one-more': {
    subtitle: 'A visual identity for a night inspired by the 2000s.',
    description: 'A visual identity for a night inspired by the 2000s.',
    intro: 'One More grew out of Fenómeno. Music from the 2000s was the starting point for the identity of this new club night.',
    challenge: 'The new name needed a visual language rooted in the music played at the venue, with room to work across print and digital formats.',
    approach: 'I worked with vivid blues, pop culture cutouts, angular shapes and saturated contrasts. The vouchers put that visual language into people’s hands. A PVC sign in the venue’s bathroom brought One More and Sala de Despecho together.',
    contribution: 'I developed the complete One More brand book and designed the applications shown here.',
  },
  bulk: {
    subtitle: 'Eat well. Keep the volume up.',
    description: 'My final degree project brought a healthy food brand to life through naming, visual identity and packaging.',
    intro: 'BULK began as my final degree project at UDIT. I wanted to design a healthy food brand with a direct voice that could connect with younger people and stand out in its category.',
    challenge: 'Many brands in this category use soft colors and sound alike. I wanted to talk about eating well with more energy and a sense of humor.',
    approach: 'I developed the name, voice and identity around a single idea, then applied them to packaging and other formats to see how they worked together.',
    contribution: 'I developed the concept, name, visual identity, tone of voice and applications. The images show the pieces I created to present this academic project.',
  },
  houdinni: {
    subtitle: 'Brand identity and communications for an urban club.',
    description: 'Brand identity and communications for an urban club.',
    intro: 'Houdinni takes its cues from the New York subway. Two first-anniversary pieces bring that identity into the venue and onto a physical object.',
    challenge: 'The anniversary needed a recognizable visual treatment across very different scales and materials.',
    approach: 'The illuminated sign uses contrast to highlight the name and anniversary mark. I adapted the same composition for engraving on a metal bottle.',
    contribution: 'I designed the anniversary pieces shown here.',
  },
  'sala-de-despecho': {
    subtitle: 'Bar graphics for drowning your sorrows with a smile.',
    description: 'Bar graphics for drowning your sorrows with a smile.',
    intro: 'Sala de Despecho brings humor and heartbreak to the bar. Its collaboration with Maestro Dobel shows how that tone carries through to print.',
    challenge: 'The piece needed to feature a guest product while still feeling like Sala de Despecho.',
    approach: 'The cover pairs mint green and warm typography with a bottle at the center. The racing campaign apparel appears in F1 Week.',
    contribution: 'I designed the Dobel menu cover and the Sala de Despecho pieces featured in F1 Week.',
  },
  bonbonniere: {
    subtitle: 'A music lineup in motion.',
    description: 'Animated pieces for club nights and artists.',
    intro: 'A selection of animated pieces for Bonbonniere’s music lineup.',
    challenge: 'Promote the club nights and their artists across digital formats.',
    approach: 'I created animations to announce Lee Burridge, Marco Carola and Residents.',
    contribution: 'I created the digital promotional pieces featured in this selection.',
  },
  'sobre-mi': {
    title: 'About me',
    subtitle: 'A way of looking.',
    description: 'I’m Jorge Pindado. Curiosity guides my work, and I’m interested in how an idea takes shape.',
    intro: 'I’m Jorge Pindado, a graphic designer based in Madrid. I like to understand where an idea comes from and follow it until it becomes something you can see, touch or use.',
    challenge: '',
    approach: '',
    contribution: '',
    story: [
      { title: '', text: 'I’m the kind of person who wants to try another version even when the first one works. Sometimes it’s a small change: shifting some text, dimming the light or removing something that’s been there from the start. When I get it right, the piece is easier to understand and closer to what I wanted to say.' },
      { title: '', text: 'I designed my signature because I wanted my name to feel like mine when I saw it. In this portfolio, I wanted choosing a project to feel a little like slipping a record out of its sleeve. I like the moment when you can get close to an object and discover a detail at your own pace. It’s a way of looking that I try to bring to my projects, too.' },
      { title: '', text: 'At Good Rebels, I worked as a junior art director. At Mandala Group, I’ve applied that approach to identities and campaigns that move from the screen into physical spaces.' },
      { title: '', text: 'I enjoy taking an idea and seeing how it works in practice. An identity changes when it leaves the screen and has to work on a package, in a publication or at an event. That raises questions the first sketch didn’t, and it’s the part of the process I find most interesting.' },
    ],
  },
};

// Key the copy to the image filename so it follows the work when the gallery is reordered.
const galleryCopy: Partial<Record<string, [alt: string, caption: string]>> = {
  'f1-li-onna-portacuentas.jpg': ['Race Weekend bill holder for Li-Onna', 'Li-Onna · Bill holder · Mockup'],
  'li-onna-impresos-de-mesa.jpg': ['Li-Onna bookmarks, bill holders and stickers', 'Table stationery · Mockup'],
  'li-onna-cata-de-sake.jpg': ['Poster and flyer for Li-Onna’s sake tasting', 'Sake tasting · Mockup'],
  'one-more-vouchers.jpg': ['Two One More vouchers on a blue surface', 'Vouchers · Mockup'],
  'one-more-pvc-bano.jpg': ['One More and Sala de Despecho PVC sign shown in a bathroom', 'Vente pa’ One More · Mockup'],
  'bulk-drink.webp': ['BULK Berry Recovery cup showing the brand identity on packaging', '01 — Packaging / Berry Recovery'],
  'bulk-billboard.webp': ['BULK campaign on an outdoor advertising display', '02 — The identity on the street'],
  'bulk-burger.webp': ['BULK graphic featuring a burger', '03 — Product and brand language'],
  'bulk-bag.webp': ['Backpack with the BULK brand identity', '04 — The brand beyond packaging'],
  'bulk-hero.webp': ['Mockup of a BULK billboard on a building reading Double is Better', '05 — Outdoor advertising / Double is Better'],
  'bulk-valla-edificio.webp': ['BULK billboard on the corner of a building', '06 — Outdoor advertising / Building billboard'],
  'bulk-cartel-suelo.webp': ['BULK poster on the pavement', '07 — Campaign / Poster'],
  'bulk-valla-palmeras.webp': ['Green BULK billboard among palm trees', '08 — Outdoor advertising / Billboard among palms'],
  'bulk-bowl.webp': ['BULK bowl on a dark table', '09 — Product / Bowl'],
  'bulk-gorra.webp': ['Black BULK cap reading Protein Staff', '10 — Uniform / Protein Staff'],
  'bulk-local-interior.webp': ['BULK shop interior with a green counter', '11 — Space / Shop interior'],
  'bulk-local-fachada.webp': ['BULK storefront seen from the street', '12 — Space / Storefront'],
  'bulk-packaging.webp': ['BULK paper bag with the Spanish slogan Engullir y repetir', '13 — Packaging / Engullir y repetir (Devour and repeat)'],
  'bulk-pizza.webp': ['Pizza in front of an open fridge', '14 — Product / Pizza'],
  'bulk-stand.webp': ['BULK booth lit in green', '15 — Space / Booth'],
  'f1-houdinni-pulsera.jpg': ['Red and black F1 Week wristband for Houdinni', 'Houdinni · Wristband · Mockup'],
  'f1-houdinni-cartel-y-mapa.jpg': ['F1 Week poster and map for Houdinni', 'Houdinni · Poster and map · Mockup'],
  'houdinni-lightbox-aniversario.jpg': ['Illuminated Houdinni first-anniversary sign', 'Lightbox · Mockup'],
  'houdinni-grabado-aniversario.jpg': ['Black bottle with the Houdinni anniversary engraving', 'Anniversary engraving · Mockup'],
  'f1-sdd-polo.jpg': ['Front and back of the Sala de Despecho polo shirt', 'Sala de Despecho · Polo shirt · Mockup'],
  'sala-de-despecho-menu-dobel.jpg': ['Green Maestro Dobel menu cover on a bar', 'Dobel menu · Mockup'],
};

const mediaLabels: Partial<Record<string, string>> = {
  'Lee Burridge · 26 julio': 'Lee Burridge · 26 July',
  'Residents · 3 septiembre': 'Residents · 3 September',
  'Residents · 24 agosto': 'Residents · 24 August',
  'Marco Carola · 5 julio': 'Marco Carola · 5 July',
  'Reel de aniversario': 'Anniversary reel',
  'Felicitación de aniversario': 'Anniversary greeting',
  'Menú de aniversario': 'Anniversary menu',
  'Invitación a la cata': 'Tasting invitation',
  'Cata de sake · Motion 1': 'Sake tasting · Motion 1',
  'Cata de sake · Motion 2': 'Sake tasting · Motion 2',
  'Cata de sake · Motion 3': 'Sake tasting · Motion 3',
  'Cata de sake · Reel fotográfico': 'Sake tasting · Photo reel',
  'Visuales para pantallas': 'On-screen visuals',
  'Horario · Motion': 'Opening hours · Motion',
};

export function localizeProject(project: Project, language: Language): Project {
  if (language === 'es') return project;
  const gallery = project.gallery.map(piece => {
    const translation = galleryCopy[piece.src.split('/').at(-1)!];
    if (!translation) return piece;
    const [alt, caption] = translation;
    return { ...piece, alt, caption };
  });
  return { ...project, ...copy[project.slug], gallery };
}

export function localizeMediaLabel(label: string, language: Language) {
  return language === 'en' ? mediaLabels[label] ?? label : label;
}
