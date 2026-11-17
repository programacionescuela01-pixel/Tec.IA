// ==========================================================================
// SHARED.JS — Lógica compartida por todas las páginas
// Incluye: Modal de Elección de Planes, Métodos de Pago y Contratación
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const planesModal = document.getElementById('planes-modal') || document.getElementById('login-modal');
    const openPlanesBtns = document.querySelectorAll('.trigger-planes, .trigger-plan-checkout');
    const closePlanesBtn = document.getElementById('close-planes-modal') || document.getElementById('close-login');
    const checkoutForm = document.getElementById('planes-checkout-form');

    // 1. Manejo de Apertura y Cierre del Modal de Planes
    if (planesModal) {
        const openModal = (e) => {
            if (e) e.preventDefault();
            planesModal.classList.add('active');
            planesModal.classList.add('open');
        };

        const closeModal = () => {
            planesModal.classList.remove('active');
            planesModal.classList.remove('open');
        };

        openPlanesBtns.forEach(btn => {
            btn.addEventListener('click', openModal);
        });

        if (closePlanesBtn) {
            closePlanesBtn.addEventListener('click', closeModal);
        }

        planesModal.addEventListener('click', (e) => {
            if (e.target === planesModal) {
                closeModal();
            }
        });
    }

    // 2. Selección del Plan en el Formulario (Simple, Pro, Empresa)
    const planPickerCards = document.querySelectorAll('.plan-picker-card');
    const selectedPlanInput = document.getElementById('checkout-selected-plan');

    planPickerCards.forEach(card => {
        card.addEventListener('click', () => {
            planPickerCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const planVal = card.dataset.plan;
            if (selectedPlanInput) {
                selectedPlanInput.value = planVal;
            }
        });
    });

    // 3. Selección del Método de Pago (Tarjeta, Transferencia, Factura)
    const paymentBtns = document.querySelectorAll('.payment-method-btn');
    const paymentDetailBoxes = document.querySelectorAll('.payment-detail-group');
    const selectedPaymentInput = document.getElementById('checkout-selected-payment');

    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const method = btn.dataset.method;

            if (selectedPaymentInput) {
                selectedPaymentInput.value = method;
            }

            paymentDetailBoxes.forEach(box => {
                if (box.dataset.method === method) {
                    box.style.display = 'block';
                } else {
                    box.style.display = 'none';
                }
            });
        });
    });

    // 4. Procesamiento del Formulario de Suscripción / Pago
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const orgName = document.getElementById('checkout-org') ? document.getElementById('checkout-org').value : 'tu institución';
            const planVal = selectedPlanInput ? selectedPlanInput.value.toUpperCase() : 'PRO';

            alert(`🎉 ¡Suscripción Confirmada Exitosamente!\n\nSe ha activado el Plan ${planVal} para "${orgName}".\nRecibirás los detalles de confirmación y factura en tu correo electrónico.`);
            
            if (planesModal) {
                planesModal.classList.remove('active');
                planesModal.classList.remove('open');
            }
            checkoutForm.reset();
        });
    }

    // 5. Inicialización del Menú Hamburguesa & Drawer Móvil
    initMobileNavigation();

    // 6. Actualización dinámica del Navbar según sesión en Supabase
    actualizarNavbarAuth();
});

// ==========================================================================
// FUNCIÓN: ESTADO DE AUTENTICACIÓN EN NAVBAR & CIERRE DE SESIÓN
// ==========================================================================
async function actualizarNavbarAuth() {
    if (!window.supabaseClient) return;

    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const loginBtns = document.querySelectorAll('#btn-login-header, #btn-login-nav');

        if (session && session.user) {
            let nick = session.user.user_metadata?.nickname;
            if (!nick) {
                try {
                    const { data: perfil } = await window.supabaseClient
                        .from('profiles')
                        .select('nickname')
                        .eq('id', session.user.id)
                        .single();
                    if (perfil && perfil.nickname) nick = perfil.nickname;
                } catch (e) {}
            }
            if (!nick) nick = session.user.email ? session.user.email.split('@')[0] : 'Usuario';

            try { localStorage.setItem('amy_user_nickname', nick); } catch (e) {}

            loginBtns.forEach(btn => {
                const userBadge = document.createElement('div');
                userBadge.className = 'nav-user-session-pill';
                userBadge.style.cssText = 'display:inline-flex; align-items:center; gap:8px;';
                userBadge.innerHTML = `
                    <span style="font-size:0.83rem; font-weight:600; color:var(--teal-deep, #0f766e); background:var(--teal-soft, #ccfbf1); padding:4px 10px; border-radius:9999px;">
                        👤 ${escapeHTMLShared(nick)}
                    </span>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 9px; font-size:0.75rem;" onclick="window.cerrarSesion()">
                        Cerrar Sesión
                    </button>
                `;
                btn.replaceWith(userBadge);
            });
        }
    } catch (err) {
        console.warn('Error al verificar sesión en navbar:', err);
    }
}

function escapeHTMLShared(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ==========================================================================
// FUNCIÓN: MENÚ HAMBURGUESA & OFF-CANVAS DRAWER MÓVIL
// ==========================================================================
function initMobileNavigation() {
    const navbar = document.querySelector('.navbar');
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (!navbar || !navContainer || !navLinks) return;

    // 1. Obtener o crear el botón hamburguesa en el navbar
    let navToggle = document.getElementById('nav-toggle');
    if (!navToggle) {
        navToggle = document.createElement('button');
        navToggle.id = 'nav-toggle';
        navToggle.className = 'nav-toggle';
        navToggle.type = 'button';
        navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'nav-drawer');
        navToggle.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        if (navActions) {
            navActions.appendChild(navToggle);
        } else {
            navContainer.appendChild(navToggle);
        }
    }

    // 2. Crear el Backdrop (fondo oscuro desenfocado) si no existe
    let backdrop = document.querySelector('.nav-drawer-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-drawer-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);
    }

    // 3. Crear el Drawer lateral si no existe
    let drawer = document.getElementById('nav-drawer');
    if (!drawer) {
        drawer = document.createElement('aside');
        drawer.id = 'nav-drawer';
        drawer.className = 'nav-drawer';
        drawer.setAttribute('aria-label', 'Menú de navegación móvil');
        drawer.setAttribute('aria-hidden', 'true');

        // Cabecera del Drawer
        const drawerHeader = document.createElement('div');
        drawerHeader.className = 'nav-drawer-header';
        drawerHeader.innerHTML = `
            <div class="nav-drawer-brand">
                <div class="logo-badge-amy">A</div>
                <span>Amy AI</span>
            </div>
            <button class="nav-drawer-close" id="nav-drawer-close" type="button" aria-label="Cerrar menú">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Lista de Enlaces
        const drawerNav = document.createElement('nav');
        drawerNav.className = 'nav-drawer-nav';
        const clonedUl = document.createElement('ul');
        clonedUl.className = 'nav-drawer-links';

        const linkItems = navLinks.querySelectorAll('li');
        linkItems.forEach(li => {
            const a = li.querySelector('a');
            if (a) {
                const newLi = document.createElement('li');
                const newA = document.createElement('a');
                newA.href = a.getAttribute('href');
                newA.className = 'nav-drawer-link' + (a.classList.contains('active') ? ' active' : '');

                const text = a.textContent.trim();
                let icon = '🔹';
                if (/inicio/i.test(text)) icon = '🏠';
                else if (/amy/i.test(text)) icon = '🩺';
                else if (/ayuda/i.test(text)) icon = '❓';
                else if (/foro/i.test(text)) icon = '💬';
                else if (/empresa/i.test(text)) icon = '🏢';
                else if (/precio/i.test(text)) icon = '🏷️';
                else if (/funci|caracter/i.test(text)) icon = '⚡';
                else if (/qu[eé] soy/i.test(text)) icon = '🤖';

                newA.innerHTML = `<span class="nav-drawer-icon" aria-hidden="true">${icon}</span> <span class="nav-drawer-text">${text}</span>`;
                newLi.appendChild(newA);
                clonedUl.appendChild(newLi);
            }
        });
        drawerNav.appendChild(clonedUl);

        // Footer con Botones de Acción
        const drawerFooter = document.createElement('div');
        drawerFooter.className = 'nav-drawer-footer';
        if (navActions) {
            const actionElements = navActions.querySelectorAll('a, button');
            actionElements.forEach(el => {
                if (el.id === 'nav-toggle' || el.classList.contains('nav-toggle')) return;
                const clonedEl = el.cloneNode(true);
                clonedEl.classList.add('drawer-btn');
                if (clonedEl.id) clonedEl.id = 'drawer-' + clonedEl.id;

                clonedEl.addEventListener('click', () => {
                    closeDrawer();
                    if (el.tagName.toLowerCase() === 'button') {
                        el.click();
                    }
                });

                drawerFooter.appendChild(clonedEl);
            });
        }

        drawer.appendChild(drawerHeader);
        drawer.appendChild(drawerNav);
        drawer.appendChild(drawerFooter);
        document.body.appendChild(drawer);
    }

    const closeBtn = document.getElementById('nav-drawer-close');

    function openDrawer() {
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        drawer.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        backdrop.classList.add('active');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
    }

    function closeDrawer() {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        backdrop.classList.remove('active');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
    }

    function toggleDrawer() {
        if (drawer.classList.contains('active')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    // Eventos de Apertura y Cierre
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDrawer();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDrawer);
    }

    backdrop.addEventListener('click', closeDrawer);

    // Cerrar al navegar en el drawer
    const drawerLinks = drawer.querySelectorAll('.nav-drawer-link');
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });

    // Cerrar si se agranda la pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });
}
