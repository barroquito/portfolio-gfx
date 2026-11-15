type Piece = {kind: string; src: string; label: string; poster?: string; wide?: boolean};
type Chapter = {id: string; title: string; pieces: Piece[]; link?: {href: string; label: string}};
export const projectMedia: Partial<Record<string, Chapter[]>> = {
  "bonbonniere": [
    {
      "id": "piezas-digitales",
      "title": "Piezas digitales",
      "pieces": [
        {
          "kind": "video",
          "src": "/media/recap/bonbonniere-artes-bbm-st-animada-lee-burridge-26jul.mp4",
          "label": "Lee Burridge · 26 julio",
          "poster": "/media/recap/bonbonniere-artes-bbm-st-animada-lee-burridge-26jul.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/bonbonniere-artes-bbm-st-animada-residents-03sep.mp4",
          "label": "Residents · 3 septiembre",
          "poster": "/media/recap/bonbonniere-artes-bbm-st-animada-residents-03sep.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/bonbonniere-artes-bbm-st-animada-residents-24ago.mp4",
          "label": "Residents · 24 agosto",
          "poster": "/media/recap/bonbonniere-artes-bbm-st-animada-residents-24ago.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/bonbonniere-artes-marco-carola-bbm-st-animada-marco-carola-1080x1080-jul5.mp4",
          "label": "Marco Carola · 5 julio",
          "poster": "/media/recap/bonbonniere-artes-marco-carola-bbm-st-animada-marco-carola-1080x1080-jul5.jpg"
        }
      ]
    }
  ],
  "houdinni": [
    {
      "id": "piezas-digitales",
      "title": "Piezas digitales",
      "pieces": [
        {
          "kind": "video",
          "src": "/media/recap/houdinni-artes-houdinni-st-animada-alex-puche.mp4",
          "label": "Alex Puche",
          "poster": "/media/recap/houdinni-artes-houdinni-st-animada-alex-puche.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/houdinni-artes-houdinni-st-animada-macarena.mp4",
          "label": "Macarena",
          "poster": "/media/recap/houdinni-artes-houdinni-st-animada-macarena.jpg"
        }
      ]
    },
    {
      "id": "f1-week",
      "title": "F1 WEEK",
      "pieces": [
        {
          "kind": "video",
          "src": "/media/recap/houdinni-f1-week-artes-st-animado-l-f1-2.mp4",
          "label": "F1 Week · Motion 1",
          "poster": "/media/recap/houdinni-f1-week-artes-st-animado-l-f1-2.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/houdinni-f1-week-artes-st-animado-l-f1-3.mp4",
          "label": "F1 Week · Motion 2",
          "poster": "/media/recap/houdinni-f1-week-artes-st-animado-l-f1-3.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/houdinni-f1-week-artes-st-animado-l-f1-4.mp4",
          "label": "F1 Week · Motion 3",
          "poster": "/media/recap/houdinni-f1-week-artes-st-animado-l-f1-4.jpg"
        }
      ]
    }
  ],
  "li-onna": [
    {
      "id": "aniversario",
      "title": "ANIVERSARIO",
      "pieces": [
        {
          "kind": "video",
          "src": "/media/recap/li-onna-aniversario-reel-aniversario-li-onna-reel-aniversario.mp4",
          "label": "Reel de aniversario",
          "poster": "/media/recap/li-onna-aniversario-reel-aniversario-li-onna-reel-aniversario.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-aniversario-st-aniversario-felicitacio-un-li-onna-st-felicitacio-un.mp4",
          "label": "Felicitación de aniversario",
          "poster": "/media/recap/li-onna-aniversario-st-aniversario-felicitacio-un-li-onna-st-felicitacio-un.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-aniversario-st-menu-1-li-onna-st-menu-1.mp4",
          "label": "Menú de aniversario",
          "poster": "/media/recap/li-onna-aniversario-st-menu-1-li-onna-st-menu-1.jpg"
        }
      ]
    },
    {
      "id": "evento-sake",
      "title": "EVENTO SAKE",
      "pieces": [
        {
          "kind": "image",
          "src": "/media/recap/li-onna-evento-sake-crm-lionna-crm-evento-sake-oct16-01.png",
          "label": "Invitación a la cata"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-evento-sake-publi-1-li-onna-eventosake-publi-1.mp4",
          "label": "Cata de sake · Motion 1",
          "poster": "/media/recap/li-onna-evento-sake-publi-1-li-onna-eventosake-publi-1.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-evento-sake-publi-2-li-onna-eventosake-publi-2.mp4",
          "label": "Cata de sake · Motion 2",
          "poster": "/media/recap/li-onna-evento-sake-publi-2-li-onna-eventosake-publi-2.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-evento-sake-publi-3-li-onna-eventosake-publi-3.mp4",
          "label": "Cata de sake · Motion 3",
          "poster": "/media/recap/li-onna-evento-sake-publi-3-li-onna-eventosake-publi-3.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-evento-sake-reel-fotos-li-onna-eventosake-reel-fotos-oct26.mp4",
          "label": "Cata de sake · Reel fotográfico",
          "poster": "/media/recap/li-onna-evento-sake-reel-fotos-li-onna-eventosake-reel-fotos-oct26.jpg"
        }
      ]
    },
    {
      "id": "f1-week",
      "title": "F1 WEEK",
      "pieces": [
        {
          "kind": "video",
          "src": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-05.mp4",
          "label": "Race Weekend · Motion 1",
          "poster": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-05.jpg"
        },
        {
          "kind": "image",
          "src": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-06.png",
          "label": "Race Weekend · Story"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-07.mp4",
          "label": "Race Weekend · Motion 2",
          "poster": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-07.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-08.mp4",
          "label": "Race Weekend · Motion 3",
          "poster": "/media/recap/li-onna-f1-week-artes-li-onna-st-f1-08.jpg"
        }
      ]
    }
  ],
  "one-more": [
    {
      "id": "piezas-digitales",
      "title": "Piezas digitales",
      "pieces": [
        {
          "kind": "video",
          "src": "/media/recap/one-more-artes-om-reel-halloween-15oct.mp4",
          "label": "Halloween · Reel",
          "poster": "/media/recap/one-more-artes-om-reel-halloween-15oct.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/one-more-artes-om-reel-pantallas-nov09.mp4",
          "label": "Visuales para pantallas",
          "poster": "/media/recap/one-more-artes-om-reel-pantallas-nov09.jpg"
        },
        {
          "kind": "image",
          "src": "/media/recap/one-more-artes-om-st-halloween-15oct.png",
          "label": "Halloween · Story"
        },
        {
          "kind": "video",
          "src": "/media/recap/one-more-artes-om-st-halloween-oct28.mp4",
          "label": "Halloween · Motion",
          "poster": "/media/recap/one-more-artes-om-st-halloween-oct28.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/one-more-artes-om-st-horario.mp4",
          "label": "Horario · Motion",
          "poster": "/media/recap/one-more-artes-om-st-horario.jpg"
        },
        {
          "kind": "video",
          "src": "/media/recap/one-more-artes-one-more-reel-sep14.mp4",
          "label": "One More · Reel",
          "poster": "/media/recap/one-more-artes-one-more-reel-sep14.jpg"
        }
      ]
    }
  ],
  "sala-de-despecho": [
    {
      "id": "f1-week",
      "title": "F1 WEEK",
      "pieces": [
        {
          "kind": "image",
          "src": "/media/recap/sdd-f1-week-artes-sdd-st-f1-01.png",
          "label": "F1 Week · Story 1"
        },
        {
          "kind": "image",
          "src": "/media/recap/sdd-f1-week-artes-sdd-st-f1-02.png",
          "label": "F1 Week · Story 2"
        },
        {
          "kind": "image",
          "src": "/media/recap/sdd-f1-week-artes-sdd-st-f1-03.png",
          "label": "F1 Week · Story 3"
        }
      ]
    }
  ]
};
