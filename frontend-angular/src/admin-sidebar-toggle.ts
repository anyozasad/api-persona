const STORAGE_KEY = 'mallqui_admin_sidebar_collapsed';

function applySidebarState(shell: HTMLElement, button: HTMLButtonElement, collapsed: boolean): void {
  shell.classList.toggle('admin-sidebar-collapsed', collapsed);
  button.textContent = collapsed ? '›' : '‹';
  button.setAttribute('aria-label', collapsed ? 'Expandir menú lateral' : 'Minimizar menú lateral');
  button.setAttribute('title', collapsed ? 'Expandir menú' : 'Minimizar menú');
}

function setupAdminSidebar(): void {
  const shell = document.querySelector<HTMLElement>('.admin-shell');
  const nav = document.querySelector<HTMLElement>('.admin-nav');

  if (!shell || !nav || nav.querySelector('.admin-sidebar-toggle')) {
    return;
  }

  nav.querySelectorAll<HTMLButtonElement>('nav button').forEach((item) => {
    const label = item.textContent?.replace(/\s+/g, ' ').trim();
    if (label) item.setAttribute('title', label);
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-sidebar-toggle';

  const saved = localStorage.getItem(STORAGE_KEY) === 'true';
  applySidebarState(shell, button, saved);

  button.addEventListener('click', () => {
    const collapsed = !shell.classList.contains('admin-sidebar-collapsed');
    applySidebarState(shell, button, collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  });

  nav.appendChild(button);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAdminSidebar);
} else {
  setupAdminSidebar();
}

const observer = new MutationObserver(() => setupAdminSidebar());
observer.observe(document.documentElement, { childList: true, subtree: true });
