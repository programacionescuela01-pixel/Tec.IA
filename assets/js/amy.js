// ==========================================================================
// AMY.JS — Lógica específica de amy.html
// Asistente Clínico Inteligente & Módulos BD / CD (Boceto 1 & Arquitectura)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const chatBox = document.getElementById('amy-chat-box');
    const userInput = document.getElementById('amy-user-input');
    const sendBtn = document.getElementById('btn-send-amy');
    const modePills = document.querySelectorAll('.mode-pills-row .mode-pill');
    const quickPrompts = document.querySelectorAll('.quick-prompt-btn');

    let currentMode = 'clinico';

    // Manejo de cambio de modos
    if (modePills) {
        modePills.forEach(pill => {
            pill.addEventListener('click', () => {
                modePills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentMode = pill.dataset.mode;

                const modeLabels = {
                    clinico: '🩺 Modo Clínico & Asistencial',
                    bd: '🗄️ Modo Base de Datos (BD)',
                    cd: '⚡ Modo Contenido Dinámico (CD)'
                };

                addAmyMsg(`Cambiado a **${modeLabels[currentMode]}**. Sistemas listos para procesar tus consultas.`);
            });
        });
    }

    // Quick prompts
    if (quickPrompts) {
        quickPrompts.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                if (query) {
                    processUserMessage(query);
                }
            });
        });
    }

    // Input y botón de envío
    if (sendBtn && userInput) {
        const handleSend = () => {
            const text = userInput.value.trim();
            if (!text) return;
            processUserMessage(text);
            userInput.value = '';
        };

        sendBtn.addEventListener('click', handleSend);
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    function processUserMessage(text) {
        addUserMsg(text);

        // Simulación de respuesta inteligente
        setTimeout(() => {
            const reply = generateResponse(text, currentMode);
            addAmyMsg(reply);
        }, 500);
    }

    function addUserMsg(text) {
        if (!chatBox) return;
        const msg = document.createElement('div');
        msg.className = 'chat-msg msg-user';
        msg.innerHTML = `
            <div class="chat-avatar">Tú</div>
            <div class="chat-bubble-body">${escapeHTML(text)}</div>
        `;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addAmyMsg(html) {
        if (!chatBox) return;
        const msg = document.createElement('div');
        msg.className = 'chat-msg msg-amy';
        msg.innerHTML = `
            <div class="chat-avatar">A</div>
            <div class="chat-bubble-body">${html}</div>
        `;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function generateResponse(input, mode) {
        const q = input.toLowerCase();

        if (q.includes('resumen') || q.includes('s.c.') || q.includes('historia')) {
            return `📋 <strong>Resumen Clínico Generado — Paciente S.C. (ID: #48920)</strong>:<br>
            • <strong>Edad:</strong> 54 años | <strong>Signos Vitales:</strong> 120 bpm, TA 120/80 mmHg, SpO2 98%.<br>
            • <strong>Diagnóstico de ingreso:</strong> Cuadro febril remitido, recuperación posoperatoria favorable.<br>
            • <strong>Plan sugerido:</strong> Reducción de analgésicos intravenosos a vía oral. Control ambulatorio programado para el 15 de Octubre.<br>
            <em>Registrado con éxito en el sistema hospitalario central.</em>`;
        }

        if (q.includes('guía') || q.includes('hipertensión') || q.includes('evidencia')) {
            return `📖 <strong>Guía de Práctica Clínica Actualizada (Nivel de Evidencia A)</strong>:<br>
            Para pacientes con hipertensión arterial estadio 2, los protocolos de la Red TEC AI recomiendan iniciar con terapia combinada de dos antihipertensivos de primera línea (IECA/ARA-II + Calcioantagonista o diurético tiazídico). Monitoreo de función renal a las 2 semanas.`;
        }

        if (q.includes('predictivo') || q.includes('riesgo') || q.includes('120')) {
            return `📈 <strong>Análisis Predictivo de Pacientes</strong>:<br>
            • Frecuencia cardíaca en 120 bpm detecta taquicardia sinusal transitoria.<br>
            • <strong>Índice de Alerta Temprana (NEWS2):</strong> 2 puntos (Riesgo Bajo a Moderado).<br>
            • <strong>Recomendación:</strong> Repetir toma en 30 minutos y descartar deshidratación o respuesta al dolor.`;
        }

        if (q.includes('bd') || q.includes('base de datos') || q.includes('camas')) {
            return `🗄️ <strong>Consulta a Base de Datos (BD) en Tiempo Real</strong>:<br>
            Conexión con el servidor hospitalario establecida.<br>
            • Camas de Terapia Intensiva disponibles: <strong>4 de 20</strong>.<br>
            • Camas de Sala General disponibles: <strong>18 de 50</strong>.<br>
            • Latencia de respuesta: 0.08ms. Cifrado AES-256 verificado.`;
        }

        if (q.includes('cd') || q.includes('contenido dinámico') || q.includes('reporte')) {
            return `⚡ <strong>Módulo de Contenido Dinámico (CD)</strong>:<br>
            Reporte generado en formato interoperable HL7/FHIR listo para exportar a la historia clínica electrónica o enviar por canal seguro a los médicos de guardia.`;
        }

        if (q.includes('planes') || q.includes('precio')) {
            return `💎 <strong>Planes de TEC AI & Amy</strong>:<br>
            • <strong>Plan Simple:</strong> $0 / mes (Uso individual y educativo).<br>
            • <strong>Plan Pro:</strong> $29 / mes (Para consultorios médicos y profesionales).<br>
            • <strong>Plan Para Empresa:</strong> Solución dedicada para hospitales y clínicas con alta disponibilidad.<br>
            Puedes revisar los detalles completos en la sección <a href="empresas.html#planes" style="color: var(--teal-dark); font-weight: 600; text-decoration: underline;">Para Empresas</a>.`;
        }

        return `Comprendido. Como tu asistente clínica inteligente, proceso tu consulta bajo el modo activo <strong>${mode.toUpperCase()}</strong>. Si requieres redactar notas de consulta, contrastar evidencias o verificar registros en la Base de Datos, puedes indicármelo en cualquier momento.`;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
