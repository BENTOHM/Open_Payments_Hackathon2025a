// --- DEPENDENCIAS ---
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { createAuthenticatedClient, isPendingGrant } = require("@interledger/open-payments");

// --- CONFIGURACIÓN ---
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- LÓGICA DE OPEN PAYMENTS ---
let openPaymentsClient;

async function getOpenPaymentsClient() {
    if (openPaymentsClient) {
        return openPaymentsClient;
    }

    try {
        if (!process.env.WALLET_ADDRESS_URL) {
            throw new Error("WALLET_ADDRESS_URL no está definido");
        }
        if (!process.env.PRIVATE_KEY_BASE64) {
            throw new Error("PRIVATE_KEY_BASE64 no está definido");
        }
        if (!process.env.KEY_ID) {
            throw new Error("KEY_ID no está definido");
        }

        const privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, "base64").toString("utf-8");

        const client = await createAuthenticatedClient({
            walletAddressUrl: process.env.WALLET_ADDRESS_URL,
            privateKey: privateKey,
            keyId: process.env.KEY_ID,
        });
        
        openPaymentsClient = client;
        console.log("✨ Cliente de Open Payments conectado y autenticado.");
        return client;
    } catch (error) {
        console.error("🔴 Error creando el cliente:", error.message);
        throw error;
    }
}

// --- ENDPOINT PARA CREAR SOLICITUD DE PAGO ---
app.post("/api/create-payment-request", async (req, res) => {
    const { amount, currency, description } = req.body;

    if (!amount || !currency || !description) {
        return res.status(400).json({ error: "Faltan datos: amount, currency, description" });
    }

    try {
        const client = await getOpenPaymentsClient();
        const WALLET_ADDRESS = process.env.WALLET_ADDRESS_URL;

        // 1. Obtener información de la wallet address del destinatario
        console.log("🔍 Obteniendo información de wallet address...");
        const walletAddress = await client.walletAddress.get({
            url: WALLET_ADDRESS,
        });

        // 2. Solicitar grant de autorización para incoming payment
        console.log("🔍 Solicitando grant de autorización...");
        const grant = await client.grant.request(
            {
                url: walletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            type: "incoming-payment",
                            actions: ["list", "read", "read-all", "complete", "create"],
                        },
                    ],
                },
            }
        );

        if (!grant.access_token || !grant.access_token.value) {
            throw new Error("No se recibió token de acceso en el grant");
        }

        const INCOMING_PAYMENT_ACCESS_TOKEN = grant.access_token.value;

        // 3. Crear incoming payment
        console.log("🔍 Creando incoming payment...");
        const incomingPayment = await client.incomingPayment.create(
            {
                url: new URL(WALLET_ADDRESS).origin,
                accessToken: INCOMING_PAYMENT_ACCESS_TOKEN,
            },
            {
                walletAddress: WALLET_ADDRESS,
                incomingAmount: {
                    value: amount.toString(),
                    assetCode: currency,
                    assetScale: 2,
                },
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                metadata: {
                    description: description
                }
            }
        );

        console.log(`✅ Incoming payment creado: ${incomingPayment.id}`);

        // Devolver información al frontend
        res.json({
            paymentId: incomingPayment.id,
            paymentPointer: WALLET_ADDRESS,
            amount: amount,
            currency: currency,
            incomingPaymentUrl: incomingPayment.id, // URL completa del incoming payment
            description: description
        });

    } catch (error) {
        console.error("🔴 Error en /api/create-payment-request:");
        console.error("Mensaje:", error.message);
        console.error("Stack:", error.stack);
        
        if (error.response?.data) {
            console.error("Datos de respuesta:", error.response.data);
        }
        
        res.status(500).json({ 
            error: "Error interno del servidor",
            details: error.message
        });
    }
});

// --- ENDPOINT PARA CREAR COTIZACIÓN ---
app.post("/api/create-quote", async (req, res) => {
    const { incomingPaymentUrl, senderWalletAddress } = req.body;

    if (!incomingPaymentUrl || !senderWalletAddress) {
        return res.status(400).json({ error: "Faltan datos: incomingPaymentUrl, senderWalletAddress" });
    }

    try {
        const client = await getOpenPaymentsClient();

        // 1. Obtener información de la wallet address del remitente
        const walletAddress = await client.walletAddress.get({
            url: senderWalletAddress,
        });

        // 2. Solicitar grant de autorización para quote
        const grant = await client.grant.request(
            {
                url: walletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            type: "quote",
                            actions: ["create", "read", "read-all"],
                        },
                    ],
                },
            }
        );

        if (!grant.access_token || !grant.access_token.value) {
            throw new Error("No se recibió token de acceso para quote");
        }

        const QUOTE_ACCESS_TOKEN = grant.access_token.value;

        // 3. Crear quote
        const quote = await client.quote.create(
            {
                url: new URL(senderWalletAddress).origin,
                accessToken: QUOTE_ACCESS_TOKEN,
            },
            {
                method: "ilp",
                walletAddress: senderWalletAddress,
                receiver: incomingPaymentUrl,
            }
        );

        console.log(`✅ Quote creada: ${quote.id}`);

        res.json({
            quoteId: quote.id,
            quoteUrl: quote.id,
            debitAmount: quote.debitAmount,
            receiveAmount: quote.receiveAmount,
            expiresAt: quote.expiresAt
        });

    } catch (error) {
        console.error("🔴 Error en /api/create-quote:", error.message);
        res.status(500).json({ error: "Error creando cotización", details: error.message });
    }
});

// --- ENDPOINT PARA INICIAR PAGO SALIENTE ---
app.post("/api/initiate-outgoing-payment", async (req, res) => {
    const { quoteUrl, senderWalletAddress, finishUri, nonce } = req.body;

    if (!quoteUrl || !senderWalletAddress || !finishUri || !nonce) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
        const client = await getOpenPaymentsClient();

        // 1. Obtener información de la wallet address del remitente
        const walletAddress = await client.walletAddress.get({
            url: senderWalletAddress,
        });

        // 2. Obtener información de la quote
        const quote = await client.quote.get({ url: quoteUrl });

        // 3. Solicitar grant interactivo para outgoing payment
        const grant = await client.grant.request(
            {
                url: walletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            identifier: walletAddress.id,
                            type: "outgoing-payment",
                            actions: ["list", "list-all", "read", "read-all", "create"],
                            limits: {
                                debitAmount: {
                                    assetCode: quote.debitAmount.assetCode,
                                    assetScale: quote.debitAmount.assetScale,
                                    value: quote.debitAmount.value,
                                },
                            },
                        },
                    ],
                },
                interact: {
                    start: ["redirect"],
                    finish: {
                        method: "redirect",
                        uri: finishUri,
                        nonce: nonce,
                    },
                },
            }
        );

        if (!isPendingGrant(grant)) {
            throw new Error("Se esperaba un grant interactivo");
        }

        // Devolver información para redirección
        res.json({
            redirectUrl: grant.interact.redirect,
            continueAccessToken: grant.continue.access_token.value,
            continueUri: grant.continue.uri,
            interactRef: grant.interact.finish
        });

    } catch (error) {
        console.error("🔴 Error en /api/initiate-outgoing-payment:", error.message);
        res.status(500).json({ error: "Error iniciando pago", details: error.message });
    }
});

// --- HEALTH CHECK ---
app.get("/api/health", async (req, res) => {
    try {
        await getOpenPaymentsClient();
        res.json({ 
            status: "healthy",
            walletAddress: process.env.WALLET_ADDRESS_URL
        });
    } catch (error) {
        res.status(500).json({ 
            status: "unhealthy",
            error: error.message 
        });
    }
});

// --- INICIAR SERVIDOR ---
app.listen(port, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
    console.log(`🔍 Wallet Address: ${process.env.WALLET_ADDRESS_URL}`);
    
    // Conectar con Open Payments al iniciar
    getOpenPaymentsClient().catch(error => {
        console.error("⚠️  Error conectando con Open Payments:", error.message);
    });
});
