// ==========================================================================
// SHARED.JS — Lógica compartida por todas las páginas
// Incluye: Modal de Login (Conectado conceptualmente a Base de Datos BD)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const loginModal = document.getElementById('login-modal');
    const openLoginBtns = document.querySelectorAll('.trigger-login');
    const closeLoginBtn = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');

    if (loginModal) {
        const openModal = (e) => {
            if (e) e.preventDefault();
            loginModal.classList.add('active');
            loginModal.classList.add('open');
        };

        const closeModal = () => {
            loginModal.classList.remove('active');
            loginModal.classList.remove('open');
        };

        openLoginBtns.forEach(btn => {
            btn.addEventListener('click', openModal);
        });

        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', closeModal);
        }

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal();
            }
        });

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('login-email');
                const email = emailInput ? emailInput.value : 'Usuario';
                alert(`✓ Autenticación exitosa con la Base de Datos (BD).\n¡Bienvenido al sistema, ${email}!`);
                closeModal();
                loginForm.reset();
            });
        }
    }

});
