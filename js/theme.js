try { document.documentElement.dataset.theme = localStorage.getItem('bcs-theme') === 'light' ? 'light' : 'dark'; } catch { /* private browsing keeps default */ }
