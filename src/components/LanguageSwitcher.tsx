import { Link, useLocation } from 'react-router-dom';
import { LANGS, langFromPath, languageSwitchPath } from '@/i18n/routing';

interface LanguageSwitcherProps {
  /** 'light' = texte blanc (sur fond sombre hero), 'dark' = texte foncé (header scrollé) */
  variant?: 'light' | 'dark';
}

/** Real links to the same page in each language: crawlers follow them, visitors keep their place. */
export default function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { pathname, search } = useLocation();
  const currentLang = langFromPath(pathname);

  const textClass = variant === 'light'
    ? 'text-white/70 hover:text-white'
    : 'text-muted-foreground hover:text-foreground';

  const activeClass = variant === 'light'
    ? 'text-white font-semibold'
    : 'text-foreground font-semibold';

  return (
    <nav className="flex items-center gap-2" aria-label="Language switcher">
      {LANGS.map((code) => (
        <Link
          key={code}
          to={languageSwitchPath(pathname, search, code)}
          hrefLang={code}
          className={`flex items-center text-[10px] tracking-widest uppercase transition-colors duration-300 px-1 py-0.5
            ${currentLang === code ? activeClass : textClass}`}
          aria-label={`Switch to ${code.toUpperCase()}`}
          aria-current={currentLang === code ? 'true' : undefined}
        >
          <span>{code.toUpperCase()}</span>
        </Link>
      ))}
    </nav>
  );
}
