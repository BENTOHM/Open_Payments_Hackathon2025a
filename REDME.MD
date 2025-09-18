# Project Documentation: Nexus - Immediate Local Support

---

## **English Version**

### **Phase 2: Prototyping**

#### **1. Problem Statement**

In our communities, there are many creators, urban artists, small vendors, and community causes (e.g., "funds for the neighborhood park") that rely on cash transactions. If people don't carry coins, they cannot support them. This limits their income and community engagement. The challenge is to provide a frictionless, digital, and immediate way for anyone to support these local causes.

#### **2. Impact and Benefits of the Proposed Solution**

The **Nexus** platform provides a simple web page listing local causes. Anyone with a smartphone can click a link to send a small donation or tip instantly using Open Payments, eliminating the need for complex banking apps and with nearly zero fees.

* **Business Impact & Benefits:**
    * **Direct Local Impact:** Directly aids the informal economy and neighborhood initiatives, fostering goodwill and a strong community-focused brand image.
    * **Financial Inclusion:** Does not require the recipient to have a traditional bank account, only a digital wallet compatible with Open Payments, thus expanding the potential user base to unbanked individuals.
    * **Rapid Prototyping & Market Entry:** The simple payment flow (select cause, define amount, pay) is ideal for rapid development and validation, allowing for quick entry into the micro-donation market.
    * **Core Technology Integration:** It centrally uses Open Payments, positioning the solution at the forefront of modern, open standards for value transfer.

#### **3. Technical Solution Description (Component Overview)**

The solution is a client-server web application comprised of two main components:

* **Frontend (Client-Side):** A static, responsive web interface built with **HTML, CSS, and JavaScript**. It presents the different local causes in a visually engaging manner. It features an interactive modal for users to input their donation amount and currency, and it communicates asynchronously with the backend to initiate the payment process.
* **Backend (Server-Side):** A **Node.js** server using the **Express.js** framework. This server exposes a single, crucial API endpoint (`/api/create-payment-request`). Its primary responsibility is to securely communicate with the **Open Payments** network. It uses credentials stored in environment variables to authenticate, request authorization grants, and create "incoming payment" requests on behalf of the cause's digital wallet.

#### **4. Technical Implementation Details**

##### **Required Functionality & Technology Justification**

* **Frontend:**
    * **HTML5 (`index.html`):** Structures the content, including the header, the grid of cause cards, and the payment modal.
    * **CSS3 (`style.css`):** Provides the visual styling, including a futuristic "scanlines" aesthetic, responsive layout for the cause cards, and smooth animations for the user interface.
    * **JavaScript (`scripts.js`):** Handles all user interactions, such as opening the modal when a "Support Cause" button is clicked, capturing user input, and making asynchronous `fetch` API calls to the backend to generate the payment request.
    * **Justification:** These are standard, universally supported web technologies, ensuring maximum compatibility and accessibility without requiring external frameworks, which is ideal for a lightweight and fast-loading prototype.

* **Backend:**
    * **Node.js:** A JavaScript runtime chosen for its non-blocking, event-driven architecture, making it highly efficient for handling concurrent API requests.
    * **Express.js (`server.js`):** A minimal and flexible Node.js web application framework used to set up the server and define the API routes.
    * **`@interledger/open-payments`:** The official client library for interacting with the Open Payments standard. It simplifies the processes of creating an authenticated client, requesting grants, and creating incoming payment requests.
    * **`dotenv`:** A module used to load sensitive environment variables from a `.env` file (like API keys) into the application, keeping them separate from the source code.
    * **`cors`:** Middleware to enable Cross-Origin Resource Sharing, allowing the frontend (served from a file or different domain) to make requests to the backend API.
    * **Justification:** The full-stack JavaScript approach (Node.js) allows for code consistency. Express.js is a mature and widely-adopted standard for building APIs. Using the official Open Payments library and `dotenv` are essential best practices for a correct and secure implementation.

#### **5. Complete Functional Prototype**

The provided code constitutes a complete and functional prototype that demonstrates the core user flow.

* **User Flow:**
    1.  The user visits the `index.html` page and sees three local causes: "El Guitarrero," "Jardín Comunitario," and "Café 'El Despertar'".
    2.  The user clicks the "Apoyar Causa" button on a card.
    3.  A modal window appears, pre-filled with the cause's title (e.g., "Apoyo para El Guitarrero").
    4.  The user enters a donation amount and selects a currency (USD, MXN, EUR, etc.).
    5.  Upon clicking "¡Apoyar Ahora!", the frontend sends a POST request to the backend's `/api/create-payment-request` endpoint.
    6.  The backend server receives the request, validates the presence of required data, and uses the Open Payments client to create an "incoming payment" request with the specified details.
    7.  The server responds to the frontend with the payment details, including the wallet's Payment Pointer and the unique Payment ID.
    8.  The frontend dynamically displays this information in the modal, instructing the user on how to complete the payment.

##### **Security Best Practices (Hardening)**

* **Secrets Management:** Sensitive credentials (`KEY_ID`, `PRIVATE_KEY_BASE64`, `WALLET_ADDRESS_URL`) are correctly stored in a `.env` file and are not hardcoded in the source code. This file should be included in `.gitignore` to prevent it from being committed to version control.
* **Input Validation:** The backend checks for the presence of `amount`, `currency`, and `description` in API requests, returning a 400 Bad Request error if they are missing. For production, this should be enhanced to validate data types and formats.
* **Error Handling:** The backend includes `try-catch` blocks to manage errors during the Open Payments API calls, preventing the server from crashing and providing meaningful error logs.
* **CORS Configuration:** The `cors` library is used. In a production environment, this should be configured with a whitelist to allow requests only from the specific frontend domain.
* **Production Recommendations:**
    * **HTTPS:** A production deployment must use HTTPS to encrypt all traffic.
    * **Rate Limiting:** Implement rate limiting on the API to prevent abuse and denial-of-service attacks.

#### **6. Source Code (BE, FE) and Database Script**

The complete source code is provided in the uploaded files.

* **Frontend Source Code:**
    * `index.html`: Main page structure.
    * `style.css`: Stylesheet.
    * `scripts.js`: Client-side logic and API interaction.
    * Image assets: `guitarrero.jpg`, `jardin_comunitario.jpg`, `cafeteria-in.jpg`.

* **Backend Source Code:**
    * `server.js`: Main server file with all API and Open Payments logic.
    * `.env`: Configuration file for credentials.
    * (Implied) `package.json`: Would be used to manage Node.js dependencies.

* **Database Script:**
    * This prototype **does not require a database**. It is stateless; payment requests are generated and managed via the Open Payments API, and no user or transaction data is persisted on the Nexus server.

##### **Instructions for Compilation and Execution**

1.  **Prerequisites:**
    * Node.js installed.
    * An active Open Payments wallet with a generated **Key ID** and **Private Key**.

2.  **Backend Setup:**
    * In the backend directory, create a `.env` file and populate it with your credentials as shown in the provided `.env` file.
    * Open a terminal and run `npm install express cors dotenv @interledger/open-payments` to install dependencies.
    * Run `node server.js` to start the backend server. The console will confirm that it's running and connected to Open Payments.

3.  **Frontend Setup:**
    * Open `index.html` in a web browser. The application is now ready to use.

#### **7. Additional Documentation**

##### **Data Dictionary (API)**

**Endpoint:** `POST /api/create-payment-request`

* **Request Body (JSON):**

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `amount` | String | Yes | The donation amount. | `"5"` |
| `currency` | String | Yes | The currency code (e.g., ISO 4217). | `"USD"` |
| `description`| String | Yes | A brief description of the payment. | `"Apoyo para El Guitarrero"` |

* **Success Response Body (200 OK - JSON):**

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `paymentId` | String | The unique URL/ID of the created incoming payment. | `"https://wallet.example/incoming-payments/123-abc"` |
| `paymentPointer`| String | The wallet address where the payment should be sent. | `"https://ilp.interledger-test.dev/artista_urbano"` |
| `amount` | String | The requested amount. | `"5"` |
| `currency` | String | The currency code for the payment. | `"USD"` |
| `description` | String | The description associated with the payment. | `"Apoyo para El Guitarrero"` |

---
---

## **Versión en Español**

### **Fase 2: Prototipado**

#### **1. Declaración del Problema**

En nuestras comunidades, hay muchísimos creadores, artistas urbanos, pequeños vendedores o causas comunitarias (ej. "fondos para el parque del barrio") que dependen del efectivo. Si la gente no lleva monedas, no puede apoyarlos. Esto limita su ingreso y la participación de la comunidad. El reto es ofrecer una forma digital, inmediata y sin fricciones para que cualquiera pueda apoyar a estas causas locales.

#### **2. Impacto y Beneficios de la Solución Propuesta**

La plataforma **Nexus** proporciona una simple página web donde se listan "causas locales". Cualquier persona con un smartphone puede dar clic en un enlace para enviar una pequeña donación o propina instantáneamente usando Open Payments, eliminando la necesidad de apps bancarias complejas y con comisiones casi nulas.

* **Impacto y Beneficios para el Negocio:**
    * **Impacto Local Directo:** Ayuda directamente a la economía informal y a las iniciativas de barrio, fomentando la buena voluntad y una imagen de marca fuerte y centrada en la comunidad.
    * **Inclusión Financiera:** No requiere que el receptor tenga una cuenta bancaria tradicional, solo una billetera digital compatible con Open Payments, expandiendo así la base de usuarios potenciales a personas no bancarizadas.
    * **Prototipado Rápido y Entrada al Mercado:** El flujo de pago simple (seleccionar causa, definir monto, pagar) es ideal para un desarrollo y validación rápidos, permitiendo una entrada ágil al mercado de las micro-donaciones.
    * **Integración de Tecnología Clave:** Utiliza Open Payments de forma central, posicionando la solución a la vanguardia de los estándares modernos y abiertos para la transferencia de valor.

#### **3. Descripción de la Solución Técnica (Descripción de Componentes)**

La solución es una aplicación web cliente-servidor compuesta por dos componentes principales:

* **Frontend (Lado del Cliente):** Una interfaz web estática y responsiva construida con **HTML, CSS y JavaScript**. Presenta las diferentes causas locales de una manera visualmente atractiva. Cuenta con un modal interactivo para que los usuarios introduzcan el monto y la divisa de su donación, y se comunica de forma asíncrona con el backend para iniciar el proceso de pago.
* **Backend (Lado del Servidor):** Un servidor **Node.js** que utiliza el framework **Express.js**. Este servidor expone un único y crucial endpoint de API (`/api/create-payment-request`). Su responsabilidad principal es comunicarse de forma segura con la red de **Open Payments**. Utiliza credenciales almacenadas en variables de entorno para autenticarse, solicitar permisos (grants) y crear solicitudes de "pago entrante" (incoming payment) en nombre de la billetera digital de la causa.

#### **4. Detalles de Implementación Técnica**

##### **Funcionalidad Requerida y Justificación de Tecnologías**

* **Frontend:**
    * **HTML5 (`index.html`):** Estructura el contenido, incluyendo el encabezado, la cuadrícula de tarjetas de causas y el modal de pago.
    * **CSS3 (`style.css`):** Proporciona el estilo visual, incluyendo una estética futurista de "scanlines", un diseño responsivo para las tarjetas y animaciones fluidas para la interfaz de usuario.
    * **JavaScript (`scripts.js`):** Maneja todas las interacciones del usuario, como abrir el modal al hacer clic en un botón "Apoyar Causa", capturar los datos del usuario y realizar llamadas `fetch` asíncronas a la API del backend para generar la solicitud de pago.
    * **Justificación:** Son tecnologías web estándar y universalmente soportadas, lo que garantiza la máxima compatibilidad y accesibilidad sin requerir frameworks externos, ideal para un prototipo ligero y de carga rápida.

* **Backend:**
    * **Node.js:** Un entorno de ejecución de JavaScript elegido por su arquitectura no bloqueante y orientada a eventos, lo que lo hace muy eficiente para manejar peticiones de API concurrentes.
    * **Express.js (`server.js`):** Un framework de aplicación web para Node.js, minimalista y flexible, utilizado para configurar el servidor y definir las rutas de la API.
    * **`@interledger/open-payments`:** La librería cliente oficial para interactuar con el estándar Open Payments. Simplifica los procesos de creación de un cliente autenticado, solicitud de permisos (grants) y creación de solicitudes de pago entrante.
    * **`dotenv`:** Un módulo utilizado para cargar variables de entorno sensibles desde un archivo `.env` (como claves de API) en la aplicación, manteniéndolas separadas del código fuente.
    * **`cors`:** Middleware para habilitar el Intercambio de Recursos de Origen Cruzado (CORS), permitiendo que el frontend (servido desde un archivo o un dominio diferente) realice peticiones a la API del backend.
    * **Justificación:** El enfoque full-stack en JavaScript (Node.js) permite consistencia en el código. Express.js es un estándar maduro y ampliamente adoptado para construir APIs. Usar la librería oficial de Open Payments y `dotenv` son mejores prácticas esenciales para una implementación correcta y segura.

#### **5. Prototipo Funcional Completo**

El código proporcionado constituye un prototipo completo y funcional que demuestra el flujo de usuario principal.

* **Flujo de Usuario:**
    1.  El usuario visita la página `index.html` y ve tres causas locales: "El Guitarrero", "Jardín Comunitario" y "Café 'El Despertar'".
    2.  El usuario hace clic en el botón "Apoyar Causa" en una tarjeta.
    3.  Aparece una ventana modal, precargada con el título de la causa (ej. "Apoyo para El Guitarrero").
    4.  El usuario introduce un monto para la donación y selecciona una divisa (USD, MXN, EUR, etc.).
    5.  Al hacer clic en "¡Apoyar Ahora!", el frontend envía una petición POST al endpoint `/api/create-payment-request` del backend.
    6.  El servidor backend recibe la petición, valida la presencia de los datos requeridos y utiliza el cliente de Open Payments para crear una solicitud de "pago entrante" con los detalles especificados.
    7.  El servidor responde al frontend con los detalles del pago, incluyendo el Payment Pointer de la billetera y el ID único del pago.
    8.  El frontend muestra dinámicamente esta información en el modal, instruyendo al usuario sobre cómo completar el pago.

##### **Mejores Prácticas de Seguridad (Hardening)**

* **Gestión de Secretos:** Las credenciales sensibles (`KEY_ID`, `PRIVATE_KEY_BASE64`, `WALLET_ADDRESS_URL`) se almacenan correctamente en un archivo `.env` y no están codificadas en el código fuente. Este archivo debe ser incluido en `.gitignore` para evitar que se envíe al control de versiones.
* **Validación de Entradas:** El backend comprueba la presencia de `amount`, `currency` y `description` en las peticiones de la API, devolviendo un error 400 Bad Request si faltan. Para producción, esto debe mejorarse para validar tipos de datos y formatos.
* **Manejo de Errores:** El backend incluye bloques `try-catch` para gestionar errores durante las llamadas a la API de Open Payments, evitando que el servidor se bloquee y proporcionando registros de error significativos.
* **Configuración de CORS:** Se utiliza la librería `cors`. En un entorno de producción, debe configurarse con una lista blanca (whitelist) para permitir peticiones únicamente desde el dominio específico del frontend.
* **Recomendaciones para Producción:**
    * **HTTPS:** Un despliegue en producción debe usar HTTPS para cifrar todo el tráfico.
    * **Límite de Tasa (Rate Limiting):** Implementar un límite de tasa en la API para prevenir abusos y ataques de denegación de servicio.

#### **6. El Código Fuente (BE, FE) y SCRIPT de BD**

El código fuente completo se proporciona en los archivos subidos.

* **Código Fuente Frontend:**
    * `index.html`: Estructura de la página principal.
    * `style.css`: Hoja de estilos.
    * `scripts.js`: Lógica del lado del cliente e interacción con la API.
    * Recursos de imagen: `guitarrero.jpg`, `jardin_comunitario.jpg`, `cafeteria-in.jpg`.

* **Código Fuente Backend:**
    * `server.js`: Archivo principal del servidor con toda la lógica de la API y de Open Payments.
    * `.env`: Archivo de configuración para las credenciales.
    * (Implícito) `package.json`: Se usaría para gestionar las dependencias de Node.js.

* **Script de Base de Datos:**
    * Este prototipo **no requiere una base de datos**. Es sin estado (stateless); las solicitudes de pago se generan y gestionan a través de la API de Open Payments, y no se persiste ningún dato de usuario o transacción en el servidor de Nexus.

##### **Instrucciones para Compilación y Ejecución**

1.  **Prerrequisitos:**
    * Node.js instalado.
    * Una billetera Open Payments activa con un **ID de Clave** y una **Clave Privada** generados.

2.  **Configuración del Backend:**
    * En el directorio del backend, crea un archivo `.env` y llénalo con tus credenciales como se muestra en el archivo `.env` proporcionado.
    * Abre una terminal y ejecuta `npm install express cors dotenv @interledger/open-payments` para instalar las dependencias.
    * Ejecuta `node server.js` para iniciar el servidor backend. La consola confirmará que está en ejecución y conectado a Open Payments.

3.  **Configuración del Frontend:**
    * Abre `index.html` en un navegador web. La aplicación ya está lista para usarse.

#### **7. Documentación Adicional**

##### **Diccionario de Datos (API)**

**Endpoint:** `POST /api/create-payment-request`

* **Cuerpo de la Petición (JSON):**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- | :--- |
| `amount` | String | Sí | El monto de la donación. | `"5"` |
| `currency` | String | Sí | El código de la divisa (ej. ISO 4217). | `"USD"` |
| `description`| String | Sí | Una breve descripción del pago. | `"Apoyo para El Guitarrero"` |

* **Cuerpo de la Respuesta Exitosa (200 OK - JSON):**

| Campo | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `paymentId` | String | La URL/ID única del pago entrante creado. | `"https://wallet.example/incoming-payments/123-abc"` |
| `paymentPointer`| String | La dirección de la billetera a la que se debe enviar el pago. | `"https://ilp.interledger-test.dev/artista_urbano"` |
| `amount` | String | El monto solicitado. | `"5"` |
| `currency` | String | El código de la divisa para el pago. | `"USD"` |
| `description` | String | La descripción asociada con el pago. | `"Apoyo para El Guitarrero"` |