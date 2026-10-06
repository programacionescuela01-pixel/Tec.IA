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
});
