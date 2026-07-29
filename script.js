/* ==========================================================================
   Tran Cao Son - Interactive Webpage Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Theme Switcher (Dark / Light Mode) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
      } else {
        themeIcon.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
      }
    }
  }

  // --- 2. Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    
    // Close mobile menu on click link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // --- 3. Dynamic Publications Rendering & Filtering ---
  const pubList = document.getElementById('pub-list');
  const pubSearchInput = document.getElementById('pub-search');
  const yearFiltersContainer = document.getElementById('year-filters');
  const tagFiltersContainer = document.getElementById('tag-filters');
  const pubCountDisplay = document.getElementById('pub-count');

  let publications = window.PUBLICATIONS_DATA || [];
  let currentYearFilter = 'ALL';
  let currentTagFilter = 'ALL';
  let currentSearchQuery = '';

  function renderPublications() {
    if (!pubList) return;

    const filtered = publications.filter(pub => {
      // Year Filter
      let matchesYear = true;
      if (currentYearFilter !== 'ALL') {
        const yr = parseInt(pub.year, 10);
        if (currentYearFilter === '2020') matchesYear = pub.year === '2020';
        else if (currentYearFilter === '2019') matchesYear = pub.year === '2019';
        else if (currentYearFilter === '2018') matchesYear = pub.year === '2018';
        else if (currentYearFilter === '2017') matchesYear = pub.year === '2017';
        else if (currentYearFilter === '2016-2010') matchesYear = yr >= 2010 && yr <= 2016;
        else if (currentYearFilter === '2009-2000') matchesYear = yr >= 2000 && yr <= 2009;
        else if (currentYearFilter === '1990s') matchesYear = yr < 2000;
      }

      // Tag Filter
      let matchesTag = true;
      if (currentTagFilter !== 'ALL') {
        matchesTag = pub.tags && pub.tags.includes(currentTagFilter);
      }

      // Search Query
      let matchesSearch = true;
      if (currentSearchQuery.trim() !== '') {
        const q = currentSearchQuery.toLowerCase();
        const textMatch = pub.text.toLowerCase().includes(q);
        const yearMatch = pub.year.includes(q);
        matchesSearch = textMatch || yearMatch;
      }

      return matchesYear && matchesTag && matchesSearch;
    });

    if (pubCountDisplay) {
      pubCountDisplay.textContent = `Showing ${filtered.length} of ${publications.length} publications`;
    }

    if (filtered.length === 0) {
      pubList.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <p style="color: var(--text-muted); font-size: 1.1rem;">No publications found matching your filter criteria.</p>
        </div>
      `;
      return;
    }

    pubList.innerHTML = filtered.map(pub => {
      const pdfBtn = pub.pdf ? `
        <a href="${pub.pdf}" target="_blank" class="pub-btn">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Download PDF
        </a>
      ` : '';

      const otherLinksBtns = (pub.links || []).map(l => `
        <a href="${l.href}" target="_blank" class="pub-btn">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          ${l.text || 'Link'}
        </a>
      `).join('');

      const tagsHTML = (pub.tags || []).map(t => `<span class="pub-tag">${t}</span>`).join('');

      const authorsHTML = pub.authors ? `<div class="pub-authors">${pub.authors}</div>` : '';

      return `
        <div class="pub-card">
          <div class="pub-header">
            <span class="pub-year">${pub.year}</span>
            <div class="pub-tags">${tagsHTML}</div>
          </div>
          ${authorsHTML}
          <div class="pub-title-and-venue">${pub.title_and_venue}</div>
          <div class="pub-actions">
            ${pdfBtn}
            ${otherLinksBtns}
            <button class="pub-btn copy-cite-btn" data-text="${escapeAttr(pub.text)}">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Copy Citation
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach copy citation listeners
    document.querySelectorAll('.copy-cite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = btn.getAttribute('data-text');
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!`;
          setTimeout(() => btn.innerHTML = orig, 2000);
        });
      });
    });
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Bind Search Input
  if (pubSearchInput) {
    pubSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderPublications();
    });
  }

  // Bind Year Filter Chips
  if (yearFiltersContainer) {
    yearFiltersContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-chip')) {
        yearFiltersContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        currentYearFilter = e.target.getAttribute('data-year');
        renderPublications();
      }
    });
  }

  // Bind Tag Filter Chips
  if (tagFiltersContainer) {
    tagFiltersContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-chip')) {
        tagFiltersContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        currentTagFilter = e.target.getAttribute('data-tag');
        renderPublications();
      }
    });
  }

  // Initial render
  renderPublications();

  // --- 4. Team & Students Tab Switching ---
  const teamTabs = document.querySelectorAll('.team-tab');
  const teamContents = document.querySelectorAll('.team-content');

  teamTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      
      teamTabs.forEach(t => t.classList.remove('active'));
      teamContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const activeContent = document.getElementById(target);
      if (activeContent) activeContent.classList.add('active');
    });
  });

  // --- 5. Modal Lightbox for Gallery Photos ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');
  const modalClose = document.getElementById('modal-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && modal && modalImg) {
        modalImg.src = img.src;
        modal.classList.add('active');
      }
    });
  });

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // --- 6. Back to Top Button ---
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
