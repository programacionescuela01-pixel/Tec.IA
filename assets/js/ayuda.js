// ==========================================================================
// AYUDA.JS — Centro de Ayuda de Amy (Bocetos 4 y 5)
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

            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    // --------------------------------------------------
    // BÚSQUEDA EN TIEMPO REAL (Boceto 4 & 5)
    // --------------------------------------------------
    const searchInput = document.getElementById('help-search-input') || document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();

            // Filtrar preguntas del acordeón
            const accItems = document.querySelectorAll('.accordion-item');
            accItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (!term || text.includes(term)) {
                    item.style.display = 'block';
                    if (term && text.includes(term)) {
                        item.classList.add('active');
                    }
                } else {
                    item.style.display = 'none';
                    item.classList.remove('active');
                }
            });

            // Filtrar categorías populares
            const catBlocks = document.querySelectorAll('.category-block');
            catBlocks.forEach(block => {
                const text = block.textContent.toLowerCase();
                block.style.opacity = (!term || text.includes(term)) ? '1' : '0.3';
            });
        });
    }

    // --------------------------------------------------
    // PESTAÑAS (Últimas Actualizaciones vs Comunidad Amy)
    // --------------------------------------------------
    const tabUpdates = document.getElementById('tab-updates');
    const tabCommunity = document.getElementById('tab-community');
    const updatesContainer = document.querySelector('.updates-cards-grid');

    if (tabUpdates && tabCommunity && updatesContainer) {
        const communityContent = `
            <div class="update-subcard">
                <h4>🏥 Red Hospitalaria</h4>
                <ul class="update-tags-list">
                    <li>Más de 40 instituciones conectadas</li>
                    <li>Foros de discusión clínica activos</li>
                    <li>Soporte de pares entre directores médicos</li>
                </ul>
            </div>
            <div class="update-subcard">
                <h4>💡 Contribución de Prompts</h4>
                <ul class="update-tags-list">
                    <li>Prompts validados para triaje de emergencias</li>
                    <li>Estandarización de fichas de anestesia</li>
                    <li>Modelos compartidos para diagnósticos diferenciales</li>
                </ul>
            </div>
            <div class="update-subcard">
                <h4>🤝 Eventos & Webinars</h4>
                <ul class="update-tags-list">
                    <li>Webinar mensual con fundadores de TEC AI</li>
                    <li>Talleres de buenas prácticas con Amy</li>
                    <li>Certificación oficial en IA Clínica</li>
                </ul>
            </div>
        `;

        const originalUpdatesContent = updatesContainer.innerHTML;

        tabCommunity.addEventListener('click', () => {
            tabCommunity.classList.add('active');
            tabUpdates.classList.remove('active');
            updatesContainer.innerHTML = communityContent;
        });

        tabUpdates.addEventListener('click', () => {
            tabUpdates.classList.add('active');
            tabCommunity.classList.remove('active');
            updatesContainer.innerHTML = originalUpdatesContent;
        });
    }

    // Enlaces de categorías a FAQ
    const faqLinks = document.querySelectorAll('.faq-link');
    faqLinks.forEach(link => {
        link.addEventListener('click', () => {
            const accItems = document.querySelectorAll('.accordion-item');
            if (accItems.length > 0) {
                accItems[0].scrollIntoView({ behavior: 'smooth' });
                accItems[0].classList.add('active');
            }
        });
    });

});
