// ==========================================================================
// AMY.JS — Lógica específica de amy.html
// Depende de: shared.js (cargado antes en el HTML)
// Incluye: Motor de chat interactivo de Amy AI, cambio de modos
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // CAMBIO DE MODOS (BD, CD, Programación, General)
    // --------------------------------------------------
    const modeItems = document.querySelectorAll('.mode-item');
    const currentModeTitle = document.getElementById('current-mode-name');

    let currentAmyMode = 'General';

    if (modeItems) {
        modeItems.forEach(item => {
            item.addEventListener('click', () => {
                modeItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentAmyMode = item.dataset.mode;
                if (currentModeTitle) {
                    currentModeTitle.textContent = `Modo: ${currentAmyMode}`;
                }
                appendAmyMessage(`Modo cambiado a **${currentAmyMode}**. ¿En qué puedo asistirte ahora?`);
            });
        });
    }

    // --------------------------------------------------
    // ENVÍO DE MENSAJES AL CHAT
    // --------------------------------------------------
    const chatInput = document.getElementById('amy-chat-input');
    const sendBtn = document.getElementById('amy-send-btn');
    const messagesContainer = document.getElementById('amy-messages');

    if (sendBtn && chatInput) {
        const handleSendMessage = () => {
            const userMsg = chatInput.value.trim();
            if (!userMsg) return;

            // Agregar mensaje del usuario
            appendUserMessage(userMsg);
            chatInput.value = '';

            // Generar respuesta simulada de Amy después de 600ms
            setTimeout(() => {
                generateAmyResponse(userMsg, currentAmyMode);
            }, 600);
        };

        sendBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }

    // --------------------------------------------------
    // FUNCIONES AUXILIARES DEL CHAT
    // --------------------------------------------------
    function appendUserMessage(text) {
        if (!messagesContainer) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-bubble user';
        msgDiv.innerHTML = `
            <div class="message-avatar">Tú</div>
            <div class="message-content">${escapeHTML(text)}</div>
        `;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendAmyMessage(text) {
        if (!messagesContainer) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-bubble';
        msgDiv.innerHTML = `
            <div class="message-avatar">Amy</div>
            <div class="message-content">${formatMarkdown(text)}</div>
        `;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function generateAmyResponse(input, mode) {
        const lower = input.toLowerCase();
        let reply = "";

        if (lower.includes('hola') || lower.includes('buenas')) {
            reply = `¡Hola! Soy **Amy**, tu asistente de Inteligencia Artificial en TEC AI. ¿En qué te puedo colaborar hoy?`;
        } else if (lower.includes('planes') || lower.includes('precio') || lower.includes('costo')) {
            reply = `Contamos con 3 planes ajustados a tus necesidades: 
            <br>• **Plan Simple**: Ideal para proyectos personales ($0 / mes)
            <br>• **Plan Pro**: Para desarrolladores avanzados ($19 / mes)
            <br>• **Plan Para Empresas**: Solución corporativa completa con soporte 24/7 y modelos adaptados. Puedes consultarlos en nuestra sección [Para Empresas](empresas.html).`;
        } else if (lower.includes('bd') || lower.includes('base de datos')) {
            reply = `En el modo **Base de Datos (BD)** puedo ayudarte a realizar consultas SQL, estructurar modelos relacionales o integrar bases de datos no relacionales con alta eficiencia.`;
        } else if (lower.includes('cd') || lower.includes('contenido')) {
            reply = `El módulo de **Contenido Dinámico (CD)** te permite generar artículos, resúmenes, respuestas en tiempo real y personalizaciones de experiencia de usuario al instante.`;
        } else if (lower.includes('empresa') || lower.includes('empresas')) {
            reply = `Para negocios y organizaciones ofrecemos cifrado de extremo a extremo, SLA de 99.9% y despliegue dedicado. Revisa más en la pestaña **Para Empresas**.`;
        } else {
            reply = `He procesado tu consulta sobre "${escapeHTML(input)}" en modo **${mode}**. Como asistente de TEC AI, estoy lista para ayudarte a implementar código, optimizar flujos o resolver dudas en nuestro [Centro de Ayuda](ayuda.html) o [Foro](foro.html).`;
        }

        appendAmyMessage(reply);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function formatMarkdown(str) {
        return str
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

});
