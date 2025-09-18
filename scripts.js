document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Nexus.io: System Online. Awaiting Connection...");

    // --- CONSTANTES Y VARIABLES ---
    const API_URL = 'http://localhost:3001/api/create-payment-request';
    const modal = document.getElementById('payment-modal');
    const closeModalButton = document.querySelector('.close-button');
    const supportButtons = document.querySelectorAll('.support-button');
    const confirmSupportButton = document.getElementById('confirm-support-button');
    
    const amountInput = document.getElementById('amount-input');
    const currencyInput = document.getElementById('currency-input');
    const paymentInfoDiv = document.getElementById('payment-info');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');

    let currentCauseDescription = '';

    // --- LÓGICA DE LA MODAL ---
    
    const openModal = (causeDescription) => {
        currentCauseDescription = causeDescription;
        modalTitle.textContent = causeDescription;
        amountInput.value = '';
        paymentInfoDiv.innerHTML = '';
        modalForm.style.display = 'block';
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    // --- EVENT LISTENERS ---
    
    supportButtons.forEach(button => {
        button.addEventListener('click', () => {
            const causeDescription = button.getAttribute('data-cause');
            openModal(causeDescription);
        });
    });

    closeModalButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    confirmSupportButton.addEventListener('click', async () => {
        const amount = amountInput.value;
        const currency = currencyInput.value;
        const description = currentCauseDescription;

        if (!amount || amount <= 0) {
            alert('Por favor, ingresa un monto válido.');
            return;
        }

        paymentInfoDiv.innerHTML = '<p>Generando link de pago... ⌛</p>';
        modalForm.style.display = 'none';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency, description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo generar la solicitud.');
            }
            
            const orderData = await response.json();

            paymentInfoDiv.innerHTML = `
                <h3>¡Gracias por tu apoyo!</h3>
                <p>Para completar la donación, envía el monto a la siguiente dirección:</p>
                <p><strong>Payment Pointer:</strong> ${orderData.paymentPointer}</p>
                <p><strong>Monto:</strong> ${orderData.amount} ${orderData.currency}</p>
                <hr style="border-color: #00f6ff; margin: 10px 0;">
                <p><i>(En una app real, aquí aparecería un QR o un botón para pagar).</i></p>
                <p><small><strong>ID de Referencia:</strong> ${orderData.paymentId}</small></p>
            `;

        } catch (error) {
            console.error('Error:', error);
            paymentInfoDiv.innerHTML = `<p style="color: #ff00e1;"><strong>Error:</strong> ${error.message}</p>`;
            // Volvemos a mostrar el formulario si hay un error para que el usuario pueda reintentar
            modalForm.style.display = 'block';
        }
    });
});