(() => {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem('math-theme'); } catch {}
  const apply = () => {
    const dark = preference ? preference === 'dark' : system.matches;
    root.dataset.theme = dark ? 'dark' : 'light';
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.title = dark ? 'Light mode' : 'Dark mode';
      button.innerHTML = dark ? '&#9788;' : '&#9790;';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#182027' : '#ffffff');
  };
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.id = 'theme-toggle';
    button.type = 'button';
    button.onclick = () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('math-theme', preference); } catch {}
      apply();
    };
    document.body.append(button);
    apply();
  });
})();
