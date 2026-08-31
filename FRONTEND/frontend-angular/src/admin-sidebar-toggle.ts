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

  // Siempre abrir el panel con el menú COMPLETO.
  // También borra cualquier preferencia antigua que lo dejaba minimizado.
  localStorage.removeItem('mallqui_admin_sidebar_collapsed');
  shell.classList.remove('admin-sidebar-collapsed');

  nav.querySelectorAll<HTMLButtonElement>('nav button').forEach((item) => {
    const label = item.textContent?.replace(/\s+/g, ' ').trim();
    if (label) item.setAttribute('title', label);
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-sidebar-toggle';
  applySidebarState(shell, button, false);

  button.addEventListener('click', () => {
    const collapsed = !shell.classList.contains('admin-sidebar-collapsed');
    applySidebarState(shell, button, collapsed);
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
