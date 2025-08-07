// Helper para obtener variables CSS
function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// === HOVER BOTONES .project-button ===
document.querySelectorAll('.project-button').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, {
      scale: 1.08,
      y: -4,
      boxShadow: `0 8px 32px ${getVar('--color-accent')}aa`,
      backgroundColor: getVar('--color-accent'),
      color: getVar('--color-text'),
      duration: 0.28,
      ease: 'power2.out'
    });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      scale: 1,
      y: 0,
      boxShadow: '0 0 0 transparent',
      backgroundColor: getVar('--color-btn-bg'),
      color: getVar('--color-btn-text'),
      duration: 0.28,
      ease: 'power2.inOut'
    });
  });
});

// === ANIMACIONES GSAP EN CARGA ===
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    gsap.from(navbar, {
      x: -200,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
      delay: 0.1,
      onComplete: () => {
        gsap.set(navbar, { opacity: 1 });
      }
    });

    navbar.addEventListener('mouseenter', () => {
      gsap.to(navbar, {
        y: -8,
        boxShadow: '0 8px 32px #54F0A2aa',
        backgroundColor: '#282828',
        scale: 1.04,
        duration: 0.35,
        ease: 'power2.out'
      });
    });
    navbar.addEventListener('mouseleave', () => {
      gsap.to(navbar, {
        y: 0,
        boxShadow: '0 0 0 transparent',
        backgroundColor: '#1E1E1E',
        scale: 1,
        duration: 0.35,
        ease: 'power2.inOut'
      });
    });
  }

  gsap.from('.box:not(.project-box)', {
    x: -120,
    opacity: 0,
    duration: 1.1,
    stagger: 0.18,
    ease: 'back.out(1.7)',
    delay: 0.3
  });

const projectWrappers = document.querySelectorAll('.project-image-wrapper');
projectWrappers.forEach((projectWrapper, index) => {
  gsap.from(projectWrapper, {
    x: -120,
    scale: 0.92,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    delay: 0.4 + index * 0.2 // animaciones escalonadas
  });

  const projectContent = projectWrapper.querySelector('.project-content');
  if (projectContent) {
    gsap.from(projectContent, {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.8 + index * 0.2,
      ease: 'power3.out'
    });
  }

  projectWrapper.addEventListener('mouseenter', () => {
  const image = projectWrapper.querySelector('.project-image');
  const content = projectWrapper.querySelector('.project-content');
  if (image) {
    gsap.to(image, {
      scale: 1.05,
      filter: 'brightness(0.85) drop-shadow(0 8px 32px rgba(0,0,0,0.2))',
      rotate: gsap.utils.random(-2, 2),
      duration: 0.6,
      ease: 'power2.out'
    });
  }
  if (content) {
    gsap.to(content, {
      y: '-20%',
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    });
  }
});

projectWrapper.addEventListener('mouseleave', () => {
  const image = projectWrapper.querySelector('.project-image');
  const content = projectWrapper.querySelector('.project-content');
  if (image) {
    gsap.to(image, {
      scale: 1,
      filter: 'brightness(1) drop-shadow(0 0 0 transparent)',
      rotate: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    });
  }
  if (content) {
    gsap.to(content, {
      y: '0%',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    });
  }
});
});

  const aboutBtn = document.querySelector('.box.description + .project-button');
  if (aboutBtn) {
    gsap.from(aboutBtn, {
      x: -120,
      opacity: 0,
      duration: 1.1,
      ease: 'back.out(1.7)',
      delay: 0.55
    });
  }

  const bg = document.querySelector('.contact-bg');
  if (bg) {
    gsap.set(bg, { x: '-100%' });
    gsap.to(bg, { x: '0%', duration: 1, ease: 'power2.out', delay: 1.3 });
  }

  const descEl = document.querySelector('.description');
  if (descEl) {
    const rawHTML = descEl.innerHTML;
    const fragments = rawHTML.split(/(<br\s*\/?>)/i);
    const processed = fragments.map(fragment => {
      if (/^<br/i.test(fragment)) return '<br/>';
      return fragment.split(/(\s+)/).map(word => {
        if (/^\s+$/.test(word)) return word;
        return `<span class="desc-word" style="display:inline-block;white-space:pre;">${word}</span>`;
      }).join('');
    }).join('');
    descEl.innerHTML = processed;

    gsap.utils.toArray('.desc-word').forEach(span => {
      span.addEventListener('mouseenter', () => {
        gsap.to(span, {
          color: '#54F0A2',
          scale: 1.18,
          y: -6,
          rotation: gsap.utils.random(-10, 10),
          boxShadow: '0 4px 16px #54F0A255',
          duration: 0.32,
          ease: 'power2.out'
        });
      });
      span.addEventListener('mouseleave', () => {
        gsap.to(span, {
          color: '#1E1E1E',
          scale: 1,
          y: 0,
          rotation: 0,
          boxShadow: '0 0 0 transparent',
          duration: 0.32,
          ease: 'power2.inOut'
        });
      });
    });
  }
});

// === HOVERS ABOUT ===
window.addEventListener('DOMContentLoaded', () => {
  // Skills
  document.querySelectorAll('.skills-list li').forEach(li => {
    const svg = li.querySelector('svg');
    const text = li;
    li.addEventListener('mouseenter', () => {
      if (svg) {
        gsap.to(svg, {
          scale: 1.18,
          filter: 'drop-shadow(0 4px 16px #54F0A2aa)',
          duration: 0.28,
          ease: 'power2.out'
        });
      }
      gsap.to(text, {
        color: '#54F0A2',
        scale: 1.08,
        duration: 0.28,
        ease: 'power2.out'
      });
    });
    li.addEventListener('mouseleave', () => {
      if (svg) {
        gsap.to(svg, {
          scale: 1,
          filter: 'none',
          duration: 0.28,
          ease: 'power2.inOut'
        });
      }
      gsap.to(text, {
        color: '#1E1E1E',
        scale: 1,
        duration: 0.28,
        ease: 'power2.inOut'
      });
    });
  });
});

// === HOVER CONTACTO ===
const contactText = document.querySelector('.contact-title');
const contactBg = document.querySelector('.contact-bg');
if (contactText && contactBg) {
  contactText.addEventListener('mouseenter', () => {
    gsap.to(contactBg, {
      x: '100%',
      backgroundColor: '#54F0A2',
      duration: 0.6,
      ease: 'power2.inOut'
    });
    gsap.to(contactText, { color: '#1E1E1E', duration: 0.3 });
  });
  contactText.addEventListener('mouseleave', () => {
    gsap.to(contactBg, {
      x: '0%',
      backgroundColor: '#1E1E1E',
      duration: 0.6,
      ease: 'power2.inOut'
    });
    gsap.to(contactText, { color: '#F9F1E1', duration: 0.3 });
  });
}

// === BOTÓN SHAPE ===
const questionBtn = document.getElementById('question-toggle');
if (questionBtn) {
  questionBtn.addEventListener('click', createShape);
}

function randomInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function randomColor() {
  const colors = [
    'var(--color-accent)', 'var(--color-bg-dark)'];
  return colors[randomInt(0, colors.length - 1)];
}

function createShape() {
  const shapes = [
    `<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="${randomColor()}" /></svg>`,
    `<svg width="48" height="48" viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="6" fill="${randomColor()}" /></svg>`,
    `<svg width="48" height="48" viewBox="0 0 48 48"><polygon points="24,6 44,42 4,42" fill="${randomColor()}" /></svg>`,
    `<svg width="48" height="48" viewBox="0 0 48 48"><polygon points="24,6 44,18 44,36 24,48 4,36 4,18" fill="${randomColor()}" /></svg>`
  ];
  const div = document.createElement('div');
  div.className = 'flying-shape';
  div.style.left = `${randomInt(40, window.innerWidth - 88)}px`;
  div.style.top = `${randomInt(60, window.innerHeight - 180)}px`;
  div.innerHTML = shapes[randomInt(0, shapes.length - 1)];
  document.body.appendChild(div);

  gsap.fromTo(div,
    { opacity: 1, y: 0, scale: 0.7, rotate: 0 },
    {
      opacity: 0,
      y: -randomInt(120, 220),
      scale: 1.2,
      rotate: randomInt(-180, 180),
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => div.remove()
    }
  );
}
// === SCROLL PROJECTS ===

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.projects-scroll');
  function fadeProjects() {
    const boxes = container.querySelectorAll('.project-box');
    const containerRect = container.getBoundingClientRect();
    const centerZone = containerRect.height * 0.32; // zona central con opacidad máxima (más grande)
    boxes.forEach(box => {
      const rect = box.getBoundingClientRect();
      const boxCenter = rect.top + rect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;
      const dist = Math.abs(boxCenter - containerCenter);

      let opacity;
      if (dist < centerZone) {
        opacity = 1;
      } else {
        // fade más brusco fuera del centro
        const fadeZone = (containerRect.height - centerZone) / 1.2; // zona de transición más corta
        opacity = 1 - Math.min((dist - centerZone) / fadeZone, 1);
        opacity = Math.max(opacity, 0.15); // nunca totalmente invisible
      }
      box.style.opacity = opacity;
      box.style.transition = 'opacity 0.22s';
    });
  }
  container.addEventListener('scroll', fadeProjects);
  window.addEventListener('resize', fadeProjects);
  fadeProjects();
});
 

// === Obtener ID del proyecto desde la URL ===
if (window.location.pathname.endsWith('project.html')) {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  // === Base de datos local de proyectos ===
  const projects = {
    bulk: {
      title: 'BULK',
      brief: 'Healthy food brands often fall into bland visuals and generic messages, failing to connect with young audiences. For my final degree proyect, I set out to explore how design can make healthy eating feel bold, fun, and culturally relevant.',
      solution: 'I created a full brand identity that’s playful, rebellious, and visually refined. Through naming, packaging, and tone of voice, the project reframes healthy eating as something exciting — even a little rebellious.',
      gallery: [
        { src: 'img/BERRYRECOVERY.png', col: 'one-col' },
        { src: 'img/BILLBOARD.png', col: 'one-col' },
        { src: 'img/BILLBOARD4.png', col: 'one-col' },
        { src: 'img/MOCHILA.png', col: 'one-col' },
        { src: 'img/GORRA.png', col: 'one-col' },
        { src: 'img/BILLBOARD2.png', col: 'one-col' },
        { src: 'img/BILLBOARD3 1.png', col: 'one-col' },
        { src: 'img/BILLBOARD5.png', col: 'one-col' },
        { src: 'img/BURGIR.png', col: 'one-col' },
        { src: 'img/PIZZA.png', col: 'one-col' }
      ]
    },

    pump: {
      title: 'PUMP',
      brief: 'PUMP is a beer brand we created as a team, based on exaggerated male stereotypes treated with irony and internet humor. The goal was to stand out by using a bold, provocative tone and building a strong presence on social media through viral, meme-inspired content.',
      solution: 'We developed a visual identity full of humor, bold graphics and absurd references. The whole brand was designed to go viral online: eye-catching visuals, ironic messaging, and content made to spark conversation and reactions among a young, internet-savvy audience.',
      gallery: [
        { src: 'img/PUMP.png', col: 'two-col' },
        { src: 'img/pumpflyr.png', col: 'one-col' },
        { src: 'img/pumpyt.png', col: 'one-col' },
        { src: 'img/NOTICIAS_WEB_PUMP.png', col: 'two-col' },
        { src: 'img/ABOUT_WEB_PUMP 1.png', col: 'one-col' },
        { src: 'img/postpump.png', col: 'one-col' }
      ]
    },

    editorial: {
      title: 'Editorial Projects',
      brief: 'This section features two academic editorial projects: a series of dystopian book cover designs and a full re-layout of I, Robot. Both aimed to explore how design can shape the reading experience and communicate complex narratives visually.',
      solution: 'The dystopian covers experiment with bold, messy compositions and typographic tension to evoke unsettling futures. For I, Robot, the layout was reimagined to create a modern, clean reading flow while preserving the book’s retro-futuristic tone.',
      gallery: [
        { src: 'img/1984 mockup.png', col: 'two-col' },
        { src: 'img/un mundo mockup.png', col: 'one-col' },
        { src: 'img/Fahrenheit mockup.png', col: 'one-col' },
        { src: 'img/i, robot.png', col: 'two-col' },
      ]
    },

    web: {
      title: 'Web Design',
      brief: 'This projects showcases my development in web design, focusing on creating user-friendly, visually appealing websites that enhance the user experience. It includes a variety of projects that highlight my ability to blend aesthetics with functionality.',
      solution: 'The designs prioritize clean layouts, intuitive navigation, and responsive design to ensure optimal performance across devices. Each project reflects a commitment to modern design principles and a deep understanding of user needs.',
      gallery: [
        { src: 'img/webbulk1.png', col: 'one-col' },
        { src: 'img/web defqon1.png', col: 'one-col' },
        { src: 'img/web ciudad.png', col: 'one-col' },
        { src: 'img/web cine.png', col: 'one-col' }
      ]
    },
    // ... otros proyectos ...
  };

  // === Esperar a que el DOM esté listo ===
  window.addEventListener('DOMContentLoaded', () => {
    const project = projects[projectId];

    // Asegúrate de que los elementos existen antes de usarlos
    const titleEl = document.getElementById('project-title');
    const briefEl = document.getElementById('project-brief');
    const solutionEl = document.getElementById('project-solution');
    const galleryContainer = document.getElementById('project-gallery');

    if (project && titleEl && briefEl && solutionEl && galleryContainer) {
      // Aplica la tipografía solo si es BULK
      if (projectId === 'bulk', 'pump') {
        titleEl.innerHTML = `<span style="font-family:'Archivo Black','Darker Grotesque',sans-serif;">${project.title}</span>`;
      } else {
        titleEl.textContent = project.title;
      }
      briefEl.textContent = project.brief;
      solutionEl.textContent = project.solution;
      galleryContainer.innerHTML = '';
      project.gallery.forEach(img => {
        const div = document.createElement('div');
        div.className = `gallery-item ${img.col}`;
        div.innerHTML = `<img src="${img.src}" alt="${project.title} image">`;
        galleryContainer.appendChild(div);
      });
    } else if (titleEl && briefEl && solutionEl && galleryContainer) {
      // Si no hay proyecto, muestra el error solo si los elementos existen
      document.querySelector('.layout').innerHTML = `
        <div class="container" style="padding: 4rem;">
          <h1 style="font-size: 3rem;">Project not found.</h1>
          <p><a href="projects.html" style="color: var(--color-accent);">← Back to projects</a></p>
        </div>
      `;
    }
  });
}


