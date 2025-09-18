document.addEventListener('DOMContentLoaded', () => {
    const supportButton = document.getElementById('support-button');
    const amountInput = document.getElementById('amount-input');
    const currencyInput = document.getElementById('currency-input');
    const paymentInfoDiv = document.getElementById('payment-info');

    // El endpoint de nuestro backend
    const API_URL = 'http://localhost:3001/api/create-payment-request';

    supportButton.addEventListener('click', async () => {
        const amount = amountInput.value;
        const currency = currencyInput.value;
        const description = "Apoyo para el Artista Urbano";

        if (!amount || amount <= 0) {
            alert('Por favor, ingresa un monto válido.');
            return;
        }

        paymentInfoDiv.innerHTML = '<p>Generando link de pago... ⌛</p>';

        try {
            // 1. Llamamos a nuestro backend para crear la solicitud
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, currency, description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo generar la solicitud.');
            }
            
            const orderData = await response.json();

            // 2. Mostramos la información al usuario para que pague
            paymentInfoDiv.innerHTML = `
                <h3>¡Gracias por tu apoyo!</h3>
                <p>Para completar la donación, envía el monto exacto a la siguiente dirección de pago:</p>
                <p><strong>Payment Pointer:</strong> ${orderData.paymentPointer}</p>
                <p><strong>Monto:</strong> ${orderData.amount} ${orderData.currency}</p>
                <hr>
                <p><i>(En una app real, aquí aparecería un QR o un botón para pagar desde una billetera compatible).</i></p>
                <p><strong>ID de Pago (para referencia):</strong> ${orderData.paymentId}</p>
            `;

        } catch (error) {
            console.error('Error:', error); 
            paymentInfoDiv.innerHTML = `<p style="color: red;"><strong>Error:</strong> ${error.message}</p>`;
        }
    });
});
