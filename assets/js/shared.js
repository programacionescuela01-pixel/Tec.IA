// ==========================================================================
// SHARED.JS — Lógica compartida por todas las páginas
// Incluye: Modal de Login
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // MODAL DE LOGIN
    // --------------------------------------------------
    const loginModal = document.getElementById('login-modal');
    const openLoginBtns = document.querySelectorAll('.trigger-login');
    const closeLoginBtn = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');

    if (loginModal) {
        openLoginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.classList.add('open');
            });
        });

        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', () => {
                loginModal.classList.remove('open');
            });
        }

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('open');
            }
        });

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                alert(`¡Bienvenido a TEC AI, ${email}! Has iniciado sesión con éxito.`);
                loginModal.classList.remove('open');
            });
        }
    }

});
