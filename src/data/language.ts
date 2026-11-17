export type Language = 'es' | 'en';

export function localize(language: Language) {
  return (spanish: string, english: string) => language === 'en' ? english : spanish;
}

export function localizedPath(language: Language, path = '/') {
  return language === 'en' ? `/en${path}` : path;
}

export function projectPath(language: Language, slug: string) {
  return localizedPath(language, `/proyectos/${slug}/`);
}
