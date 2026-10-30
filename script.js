document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  const apply = (t) => {
    root.setAttribute('data-theme', t);
    // Updates screen-reader text
    if (toggleBtn) toggleBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  };
  apply(theme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Show the dock only when hero scrolled out of view
  const dock = document.querySelector('.jump');
  const hero = document.querySelector('.hero');
  if (dock && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => dock.classList.toggle('visible', !e.isIntersecting))
      .observe(hero);
  } else if (dock) {
    dock.classList.add('visible');
  }

  // Highlight quick-jump for section in view
  const links = [...document.querySelectorAll('.jump a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const sections = [...map.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.remove('active'));
          map.get(e.target.id)?.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(s => io.observe(s));
  }
});