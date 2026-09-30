// ==========================================================================
// FORO.JS — Foro de Empresas Amy (Fiel a Boceto 6)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // BÚSQUEDA EN TIEMPO REAL
    // --------------------------------------------------
    const searchInput = document.getElementById('forum-search-input') || document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();

            // Filtrar hilos
            const threads = document.querySelectorAll('.thread-item-boceto');
            threads.forEach(thread => {
                const text = thread.textContent.toLowerCase();
                thread.style.display = (!term || text.includes(term)) ? 'flex' : 'none';
            });

            // Filtrar empresas
            const companies = document.querySelectorAll('.company-item-boceto');
            companies.forEach(comp => {
                const text = comp.textContent.toLowerCase();
                comp.style.display = (!term || text.includes(term)) ? 'flex' : 'none';
            });

            // Filtrar mentores
            const mentors = document.querySelectorAll('.mentor-card-boceto');
            mentors.forEach(m => {
                const text = m.textContent.toLowerCase();
                m.style.display = (!term || text.includes(term)) ? 'flex' : 'none';
            });
        });
    }

    // --------------------------------------------------
    // UPVOTES EN HILOS POPULARES
    // --------------------------------------------------
    const threadVotes = document.querySelectorAll('.thread-votes-pill');
    threadVotes.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            const numSpan = pill.querySelector('.vote-num');
            if (!numSpan) return;
            let current = parseInt(numSpan.textContent, 10);
            if (pill.classList.contains('voted')) {
                pill.classList.remove('voted');
                pill.style.background = 'var(--teal-soft)';
                pill.style.color = 'var(--teal-deep)';
                numSpan.textContent = current - 1;
            } else {
                pill.classList.add('voted');
                pill.style.background = 'var(--teal-primary)';
                pill.style.color = '#ffffff';
                numSpan.textContent = current + 1;
            }
        });
    });

    // --------------------------------------------------
    // MODAL NUEVO HILO
    // --------------------------------------------------
    const btnNewThread = document.getElementById('btn-nuevo-hilo');
    const modalNewThread = document.getElementById('new-thread-modal');
    const closeNewThread = document.getElementById('close-thread-modal');
    const formNewThread = document.getElementById('new-thread-form');
    const threadsContainer = document.getElementById('threads-container');

    if (btnNewThread && modalNewThread) {
        btnNewThread.addEventListener('click', () => {
            modalNewThread.classList.add('active');
        });
    }

    if (closeNewThread && modalNewThread) {
        closeNewThread.addEventListener('click', () => {
            modalNewThread.classList.remove('active');
        });
    }

    if (formNewThread && threadsContainer) {
        formNewThread.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('thread-title-input').value.trim();
            const author = document.getElementById('thread-author-input').value.trim();

            if (!title || !author) return;

            const newEntry = document.createElement('div');
            newEntry.className = 'thread-item-boceto';
            newEntry.innerHTML = `
                <div>
                    <div class="thread-title">${escapeHTML(title)}</div>
                    <div class="thread-subtitle">Por <strong>${escapeHTML(author)}</strong> • Recién publicado • 0 respuestas</div>
                </div>
                <div class="thread-votes-pill">▲ <span class="vote-num">1</span></div>
            `;

            threadsContainer.prepend(newEntry);
            formNewThread.reset();
            modalNewThread.classList.remove('active');

            // Asignar click de voto al nuevo elemento
            const newPill = newEntry.querySelector('.thread-votes-pill');
            if (newPill) {
                newPill.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const numSpan = newPill.querySelector('.vote-num');
                    let curr = parseInt(numSpan.textContent, 10);
                    numSpan.textContent = curr + 1;
                });
            }
        });
    }

    // --------------------------------------------------
    // UNIRSE AL GRUPO EMPRESARIAL
    // --------------------------------------------------
    const btnJoin = document.getElementById('btn-unirse-grupo');
    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const originalText = btnJoin.textContent;
            btnJoin.textContent = '✓ Solicitud de Vinculación Enviada';
            btnJoin.style.background = 'var(--teal-dark)';
            setTimeout(() => {
                btnJoin.textContent = originalText;
                btnJoin.style.background = '';
            }, 3000);
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

});
