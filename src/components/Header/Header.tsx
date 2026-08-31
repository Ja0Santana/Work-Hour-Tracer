import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon">⏱</div>
        <span>Work Hours</span>
      </div>

      <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Histórico
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Configurações
        </NavLink>
      </nav>

      <div className="header-actions">
        <span className="header-date">{today}</span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Menu de navegação"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
