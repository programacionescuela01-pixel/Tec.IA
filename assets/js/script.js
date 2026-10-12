// ==========================================================================
// TEC AI & AMY INTERACTIVE SCRIPT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. LOGIN MODAL LOGIC
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // 2. ACCORDION (HELP CENTER / CENTRO DE AYUDAS)
    // ----------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const isActive = accordionItem.classList.contains('active');

            // Close all
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------
    // 3. SEARCH FILTER (FORO & CENTRO DE AYUDA)
    // ----------------------------------------------------
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            // Forum Thread Filter
            const threads = document.querySelectorAll('.forum-thread-card');
            threads.forEach(thread => {
                const title = thread.querySelector('h4').textContent.toLowerCase();
                const desc = thread.querySelector('.thread-meta').textContent.toLowerCase();
                if (title.includes(term) || desc.includes(term)) {
                    thread.style.display = 'flex';
                } else {
                    thread.style.display = 'none';
                }
            });

            // Accordion Filter
            const accItems = document.querySelectorAll('.accordion-item');
            accItems.forEach(item => {
                const qText = item.querySelector('.accordion-header').textContent.toLowerCase();
                const aText = item.querySelector('.accordion-content').textContent.toLowerCase();
                if (qText.includes(term) || aText.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Tag buttons filtering
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tagBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            const threads = document.querySelectorAll('.forum-thread-card');
            threads.forEach(thread => {
                if (category === 'all' || thread.dataset.category === category) {
                    thread.style.display = 'flex';
                } else {
                    thread.style.display = 'none';
                }
            });
        });
    });

    // ----------------------------------------------------
    // 4. FORUM UPVOTE SIMULATION
    // ----------------------------------------------------
    const voteBtns = document.querySelectorAll('.vote-btn');
    voteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const countSpan = btn.querySelector('.vote-count');
            let currentVotes = parseInt(countSpan.textContent, 10);
            if (btn.classList.contains('voted')) {
                btn.classList.remove('voted');
                countSpan.textContent = currentVotes - 1;
            } else {
                btn.classList.add('voted');
                countSpan.textContent = currentVotes + 1;
            }
        });
    });

    // ----------------------------------------------------
    // 5. AMY INTERACTIVE CHAT ENGINE (amy.html)
    // ----------------------------------------------------
    const chatInput = document.getElementById('amy-chat-input');
    const sendBtn = document.getElementById('amy-send-btn');
    const messagesContainer = document.getElementById('amy-messages');
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

    if (sendBtn && chatInput) {
        const handleSendMessage = () => {
            const userMsg = chatInput.value.trim();
            if (!userMsg) return;

            // Append User Message
            appendUserMessage(userMsg);
            chatInput.value = '';

            // Simulated Typing & Response
            setTimeout(() => {
                generateAmyResponse(userMsg, currentAmyMode);
            }, 600);
        };

        sendBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }

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

        if (lower.includes('caso de una enfermedad') || lower.includes('enfermedad') || lower.includes('enfermo') || lower.includes('que hago si')) {
            reply = `❤️ <strong>Comprendo lo difícil y preocupante que es sentirse enfermo.</strong> No estás solo/a en esto. 
            <br><br><strong>Pautas clínicas clave:</strong>
            <br>1. <strong>Reposo:</strong> Dale a tu cuerpo el descanso necesario para recuperarse.
            <br>2. <strong>Hidratación:</strong> Bebe abundante agua o caldos tibios en pequeños sorbos.
            <br>3. <strong>Registro de síntomas:</strong> Mide y anota tu temperatura y cuándo empezaron los malestares.
            <br>4. <strong>Automedicación:</strong> Evita tomar medicamentos complejos o antibióticos sin indicación médica.
            <br><br>🚨 <em>Acude a urgencias si presentas dificultad para respirar, dolor de pecho o fiebre mayor a 39°C que no baja.</em>
            <br><br>¿Qué síntomas específicos estás sintiendo en este momento? Cuéntame y te acompaño.`;
        } else if (lower.includes('pastilla') || lower.includes('pastillas') || lower.includes('medicamento') || lower.includes('tomar') || lower.includes('remedio')) {
            reply = `💊 <strong>Sé que cuando hay dolor o malestar, lo que uno más desea es alivio rápido.</strong> 
            <br><br>• <strong>Para dolor o fiebre leve:</strong> El <strong>Paracetamol</strong> (500mg-1g en adultos) suele ser la opción más segura y gentil con el estómago.
            <br>• <strong>Para inflamación:</strong> El <strong>Ibuprofeno</strong> (400mg) desinflama, pero tómalo siempre con alimentos y evítalo si tienes gastritis o úlceras.
            <br>• ⚠️ <strong>¡Nunca tomes antibióticos por tu cuenta!</strong> No curan virus y pueden perjudicar tu salud.
            <br><br>¿Para qué dolor o molestia necesitas alivio? Cuéntame para orientarte mejor.`;
        } else if (lower.includes('hola') || lower.includes('buenas')) {
            reply = `¡Hola con mucho cariño! Soy **Amy**, tu asistente de salud e Inteligencia Artificial en TEC AI. ¿Cómo te encuentras hoy? ¿En qué puedo colaborar contigo?`;
        } else if (lower.includes('gracias')) {
            reply = `💖 ¡No tienes nada que agradecer! Cuidar de ti y acompañarte es una alegría enorme. Cuídate mucho y descansa. Si necesitas algo más, aquí estaré.`;
        } else if (lower.includes('planes') || lower.includes('precio') || lower.includes('costo')) {
            reply = `Contamos con 3 planes ajustados a tus necesidades: 
            <br>• **Plan Simple**: Ideal para proyectos personales ($0 / mes)
            <br>• **Plan Pro**: Para desarrolladores y consultorios ($29 / mes)
            <br>• **Plan Para Empresas**: Solución corporativa completa con soporte 24/7 y modelos adaptados. Puedes consultarlos en nuestra sección [Para Empresas](empresas.html).`;
        } else if (lower.includes('bd') || lower.includes('base de datos')) {
            reply = `En el modo **Base de Datos (BD)** puedo ayudarte a realizar consultas SQL, estructurar modelos relacionales o integrar bases de datos hospitalarias con alta eficiencia y seguridad.`;
        } else if (lower.includes('cd') || lower.includes('contenido')) {
            reply = `El módulo de **Contenido Dinámico (CD)** te permite generar artículos, resúmenes clínicos, respuestas en tiempo real y reportes interoperables al instante.`;
        } else {
            reply = `He recibido con total atención tu consulta sobre "${escapeHTML(input)}" en modo **${mode}**. Como asistente de TEC AI, estoy a tu lado para ayudarte ante cualquier consulta de salud, triaje o soporte del sistema. ¿En qué más te gustaría profundizar?`;
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
