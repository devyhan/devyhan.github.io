// Blog Search functionality using Fuse.js
(function() {
    let searchIndex = [];
    let fuse = null;
    let searchContainer = null;
    let searchInput = null;
    let searchResults = null;

    // Initialize search when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeSearch();
    });

    function initializeSearch() {
        // Create inline search HTML
        createInlineSearch();

        // Load search index
        loadSearchIndex();

        // Setup event listeners
        setupEventListeners();
    }

    function createInlineSearch() {
        // Create inline search HTML structure
        const searchHTML = `
            <div id="search-container" class="search-container">
                <div class="search-box">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="search-input" class="search-input" placeholder="검색..." autocomplete="off">
                    <span class="search-shortcut">⌘K</span>
                </div>
                <div id="search-results" class="search-results" style="display: none;"></div>
            </div>
        `;

        // Add search to header navigation
        const nav = document.querySelector('nav');
        const header = document.querySelector('header .wrapper');

        if (nav) {
            // Insert search after nav
            nav.insertAdjacentHTML('afterend', searchHTML);
        } else if (header) {
            // Or add to header wrapper
            header.insertAdjacentHTML('beforeend', searchHTML);
        } else {
            // Fallback: add to body
            document.body.insertAdjacentHTML('afterbegin', searchHTML);
        }

        // Get references to elements
        searchContainer = document.getElementById('search-container');
        searchInput = document.getElementById('search-input');
        searchResults = document.getElementById('search-results');
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
        // Focus search with Cmd+K or Ctrl+K
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            // Hide results on Escape
            if (e.key === 'Escape') {
                searchResults.style.display = 'none';
                searchInput.blur();
            }
        });

        // Show results on focus
        searchInput.addEventListener('focus', function() {
            if (searchInput.value.length >= 2) {
                searchResults.style.display = 'block';
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
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

    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.style.display = 'block';

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