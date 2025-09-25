// Blog Search functionality using Fuse.js
(function() {
    let searchIndex = [];
    let fuse = null;
    let searchModal = null;
    let searchInput = null;
    let searchResults = null;
    let searchButton = null;

    // Initialize search when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeSearch();
    });

    function initializeSearch() {
        // Create search modal HTML
        createSearchModal();

        // Load search index
        loadSearchIndex();

        // Setup event listeners
        setupEventListeners();
    }

    function createSearchModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div id="search-modal" class="search-modal" style="display: none;">
                <div class="search-modal-content">
                    <div class="search-header">
                        <input type="text" id="search-input" class="search-input" placeholder="검색어를 입력하세요..." autocomplete="off">
                        <button id="search-close" class="search-close">&times;</button>
                    </div>
                    <div id="search-results" class="search-results"></div>
                </div>
            </div>
        `;

        // Add search button to header
        const searchButtonHTML = `
            <button id="search-button" class="search-button" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </button>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add search button to navigation (if navigation exists)
        const nav = document.querySelector('nav') || document.querySelector('header');
        if (nav) {
            nav.insertAdjacentHTML('beforeend', searchButtonHTML);
        }

        // Get references to elements
        searchModal = document.getElementById('search-modal');
        searchInput = document.getElementById('search-input');
        searchResults = document.getElementById('search-results');
        searchButton = document.getElementById('search-button');
    }

    function loadSearchIndex() {
        fetch('/search-index.json')
            .then(response => response.json())
            .then(data => {
                searchIndex = data;

                // Initialize Fuse.js with search options
                const fuseOptions = {
                    keys: [
                        { name: 'title', weight: 0.4 },
                        { name: 'description', weight: 0.3 },
                        { name: 'content', weight: 0.2 },
                        { name: 'tags', weight: 0.1 }
                    ],
                    threshold: 0.3,
                    includeScore: true,
                    minMatchCharLength: 2,
                    shouldSort: true
                };

                fuse = new Fuse(searchIndex, fuseOptions);
            })
            .catch(error => {
                console.error('Failed to load search index:', error);
            });
    }

    function setupEventListeners() {
        // Open search modal
        if (searchButton) {
            searchButton.addEventListener('click', openSearch);
        }

        // Close search modal
        document.getElementById('search-close').addEventListener('click', closeSearch);

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            }
            // Open search with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
        });

        // Close when clicking outside
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                closeSearch();
            }
        });

        // Search input handler
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 200);
        });
    }

    function openSearch() {
        searchModal.style.display = 'flex';
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
        searchModal.style.display = 'none';
        searchInput.value = '';
        searchResults.innerHTML = '';
        document.body.style.overflow = '';
    }

    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.innerHTML = '<div class="search-no-results">검색어를 2자 이상 입력해주세요.</div>';
            return;
        }

        if (!fuse) {
            searchResults.innerHTML = '<div class="search-no-results">검색 인덱스를 로딩 중입니다...</div>';
            return;
        }

        const results = fuse.search(query);

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">검색 결과가 없습니다.</div>';
            return;
        }

        // Display results
        const resultsHTML = results.slice(0, 10).map(result => {
            const item = result.item;
            const date = new Date(item.date * 1000).toLocaleDateString('ko-KR');
            const tags = item.tags.length > 0 ? item.tags.map(tag => `<span class="search-tag">${tag}</span>`).join('') : '';

            return `
                <a href="${item.url}" class="search-result-item">
                    <div class="search-result-title">${highlightMatch(item.title, query)}</div>
                    <div class="search-result-description">${highlightMatch(item.description, query)}</div>
                    <div class="search-result-meta">
                        <span class="search-result-date">${date}</span>
                        ${tags}
                    </div>
                </a>
            `;
        }).join('');

        searchResults.innerHTML = resultsHTML;
    }

    function highlightMatch(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
})();