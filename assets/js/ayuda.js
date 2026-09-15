// ==========================================================================
// AYUDA.JS — Lógica específica de ayuda.html
// Depende de: shared.js (cargado antes en el HTML)
// Incluye: Acordeón de preguntas frecuentes, búsqueda de FAQ
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // ACORDEÓN DE PREGUNTAS FRECUENTES
    // --------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const isActive = accordionItem.classList.contains('active');

            // Cerrar todos los items abiertos
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });

            // Abrir el item clickeado (toggle)
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    // --------------------------------------------------
    // BÚSQUEDA DE FAQ
    // --------------------------------------------------
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();

            const accItems = document.querySelectorAll('.accordion-item');
            accItems.forEach(item => {
                const qText = item.querySelector('.accordion-header').textContent.toLowerCase();
                const aText = item.querySelector('.accordion-content').textContent.toLowerCase();
                if (qText.includes(term) || aText.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

});
