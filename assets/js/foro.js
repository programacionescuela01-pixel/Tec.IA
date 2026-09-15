// ==========================================================================
// FORO.JS — Lógica específica de foro.html
// Depende de: shared.js (cargado antes en el HTML)
// Incluye: Búsqueda de hilos, filtro por categoría, upvotes
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // BÚSQUEDA DE HILOS
    // --------------------------------------------------
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            const threads = document.querySelectorAll('.forum-thread-card');
            threads.forEach(thread => {
                const title = thread.querySelector('h4').textContent.toLowerCase();
                const desc = thread.querySelector('.thread-meta').textContent.toLowerCase();
                if (title.includes(term) || desc.includes(term)) {
                    thread.style.display = 'flex';
                } else {
                    thread.style.display = 'none';
                }
            });
        });
    }

    // --------------------------------------------------
    // FILTRO POR CATEGORÍA (TAG BUTTONS)
    // --------------------------------------------------
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tagBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            const threads = document.querySelectorAll('.forum-thread-card');
            threads.forEach(thread => {
                if (category === 'all' || thread.dataset.category === category) {
                    thread.style.display = 'flex';
                } else {
                    thread.style.display = 'none';
                }
            });
        });
    });

    // --------------------------------------------------
    // UPVOTES (VOTACIÓN DE HILOS)
    // --------------------------------------------------
    const voteBtns = document.querySelectorAll('.vote-btn');
    voteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const countSpan = btn.querySelector('.vote-count');
            let currentVotes = parseInt(countSpan.textContent, 10);
            if (btn.classList.contains('voted')) {
                btn.classList.remove('voted');
                countSpan.textContent = currentVotes - 1;
            } else {
                btn.classList.add('voted');
                countSpan.textContent = currentVotes + 1;
            }
        });
    });

});
