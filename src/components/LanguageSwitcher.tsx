import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
] as const;

interface LanguageSwitcherProps {
  /** 'light' = texte blanc (sur fond sombre hero), 'dark' = texte foncé (header scrollé) */
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.slice(0, 2) ?? 'fr';

  const textClass = variant === 'light'
    ? 'text-white/70 hover:text-white'
    : 'text-muted-foreground hover:text-foreground';

  const activeClass = variant === 'light'
    ? 'text-white font-semibold'
    : 'text-foreground font-semibold';

  return (
    <div className="flex items-center gap-2" aria-label="Language switcher">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`flex items-center text-[10px] tracking-widest uppercase transition-colors duration-300 px-1 py-0.5
            ${currentLang === code ? activeClass : textClass}`}
          aria-label={`Switch to ${label}`}
          aria-pressed={currentLang === code}
        >
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
