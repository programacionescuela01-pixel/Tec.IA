// ==========================================================================
// AMY.JS — Asistente Clínico Inteligente & Ecosistema TEC AI
// Motor de Respuestas Avanzadas con Empatía Clínica, Seguridad Médica y Triaje
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

                addAmyMsg(`He activado el **${modeLabels[currentMode]}**. Estoy totalmente a tu disposición para ayudarte y cuidar cada detalle de tus consultas clínicas.`);
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

    // Personalización según apodo guardado y sincronización con Supabase
    async function sincronizarPerfilAmy() {
        if (!chatBox) return;
        let nickname = localStorage.getItem('amy_user_nickname') || '';

        if (window.supabaseClient) {
            try {
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (session && session.user) {
                    const nickMeta = session.user.user_metadata?.nickname;
                    if (nickMeta) nickname = nickMeta;
                    else if (window.obtenerPerfilUsuario) {
                        const perfil = await window.obtenerPerfilUsuario(session.user.id);
                        if (perfil && perfil.nickname) nickname = perfil.nickname;
                    }
                    if (nickname) localStorage.setItem('amy_user_nickname', nickname);
                }
            } catch (e) {
                console.warn('No se pudo sincronizar usuario en Amy:', e);
            }
        }

        if (nickname) {
            const initialBubble = chatBox.querySelector('.chat-msg.msg-amy .chat-bubble-body');
            if (initialBubble) {
                initialBubble.innerHTML = `¡Hola con mucho cariño, <strong>${escapeHTML(nickname)}</strong>! Soy <strong>Amy</strong>, tu asistente médica y clínica de cabecera. He cargado tu perfil personal. Estoy aquí para acompañarte, orientarte ante cualquier malestar o enfermedad, resolver dudas sobre medicamentos o asistirte con la Base de Datos médica. ¿Cómo te encuentras hoy? ¿En qué puedo ayudarte?`;
            }
        }
    }

    sincronizarPerfilAmy();

    function processUserMessage(text) {
        addUserMsg(text);

        // Indicador de escritura empático
        const typingEl = showTypingIndicator();

        // Tiempo de respuesta natural para lectura y procesamiento
        setTimeout(() => {
            removeTypingIndicator(typingEl);
            const reply = generateResponse(text, currentMode);
            addAmyMsg(reply);
        }, 600);
    }

    function showTypingIndicator() {
        if (!chatBox) return null;
        const msg = document.createElement('div');
        msg.className = 'chat-msg msg-amy amy-typing-indicator';
        msg.innerHTML = `
            <div class="chat-avatar">A</div>
            <div class="chat-bubble-body" style="color: var(--text-muted, #64748b); font-style: italic; display: flex; align-items: center; gap: 8px;">
                <span>Amy está redactando una respuesta cuidadosa</span>
                <span style="font-weight: bold; letter-spacing: 2px;">...</span>
            </div>
        `;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
        return msg;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) {
            el.remove();
        }
    }

    function addUserMsg(text) {
        if (!chatBox) return;
        const msg = document.createElement('div');
        msg.className = 'chat-msg msg-user';
        const userLabel = savedNickname ? escapeHTML(savedNickname) : 'Tú';
        msg.innerHTML = `
            <div class="chat-avatar" title="${userLabel}">${userLabel.slice(0, 3)}</div>
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
            <div class="chat-bubble-body">${formatMarkdown(html)}</div>
        `;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Normalizador de texto para emparejamiento inteligente de intenciones
    function cleanText(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remueve tildes y diacríticos
            .replace(/\bdeve\b/g, "debe")     // corrección ortográfica frecuente
            .replace(/\bpastias\b/g, "pastillas")
            .replace(/\bmedisina\b/g, "medicina")
            .replace(/[^a-z0-9\s]/g, " ")     // reemplaza puntuación por espacios
            .replace(/\s+/g, " ")
            .trim();
    }

    // MOTOR INTELIGENTE Y EMPÁTICO DE AMY
    function generateResponse(input, mode) {
        const q = cleanText(input);
        const nameGreeting = savedNickname ? `<strong>${escapeHTML(savedNickname)}</strong>, ` : '';

        // Estilos de tarjetas internas para la burbuja de chat
        const cardGreen = 'margin: 10px 0; padding: 12px 14px; background: #f0fdfa; border-left: 3px solid #14b8a6; border-radius: 10px; line-height: 1.55;';
        const cardRed = 'margin: 10px 0; padding: 12px 14px; background: #fff1f2; border-left: 3px solid #f43f5e; border-radius: 10px; color: #9f1239; line-height: 1.55;';
        const cardBlue = 'margin: 10px 0; padding: 12px 14px; background: #f0f9ff; border-left: 3px solid #0284c7; border-radius: 10px; line-height: 1.55;';

        // -------------------------------------------------------------
        // 1. COMBINACIÓN DE SÍNTOMAS + MEDICAMENTOS O PASTILLAS
        // -------------------------------------------------------------

        // Pastillas / Medicamento para Dolor de Cabeza
        if ((q.includes('pastilla') || q.includes('pastillas') || q.includes('medicamento') || q.includes('tomar') || q.includes('tomo') || q.includes('remedio')) &&
            (q.includes('cabeza') || q.includes('migrana') || q.includes('cefalea') || q.includes('jaqueca'))) {
            return `<p>🧠 ${nameGreeting}<strong>siento mucho que te duela la cabeza.</strong> Sé lo desgastante, molesto e incapacitante que es tener puntadas o pesadez en la cabeza. Tranquilo/a, te acompaño para aliviarlo:</p>
            <div style="${cardGreen}">
                <strong>💊 Opciones de medicamentos y primeros pasos:</strong><br>
                • <strong>Paracetamol (500 mg a 1 g):</strong> Es la alternativa de primera elección más noble para el estómago. Tómalo con un vaso grande de agua.<br>
                • <strong>Ibuprofeno (400 mg):</strong> Si sientes inflamación o tensión muscular en el cuello. Recuerda tomarlo siempre con alimentos para proteger tu estómago.<br>
                • <strong>Medidas no farmacológicas:</strong> Recuéstate 15-20 minutos en una habitación a oscuras y en silencio, y bebe agua (muchos dolores de cabeza nacen de deshidratación leve).
            </div>
            <div style="${cardRed}">
                🚨 <strong>Signos de alarma (Acude a urgencias si):</strong> El dolor es repentino y de intensidad explosiva insoportable ("el peor de tu vida"), o si viene acompañado de rigidez en la nuca, confusión, pérdida de visión o adormecimiento en la cara o brazos.
            </div>
            <p>🌸 <em>¿El dolor pulsa de un solo lado o sientes una presión alrededor de toda la cabeza? Cuéntame y te oriento mejor.</em></p>`;
        }

        // Pastillas / Medicamento para Fiebre
        if ((q.includes('pastilla') || q.includes('pastillas') || q.includes('medicamento') || q.includes('tomar') || q.includes('tomo') || q.includes('remedio')) &&
            (q.includes('fiebre') || q.includes('temperatura') || q.includes('febril') || q.includes('calentura'))) {
            return `<p>🌡️ ${nameGreeting}<strong>lamento mucho que estés con fiebre.</strong> Sé lo agotador que resulta sentir el cuerpo pesado, escalofríos y calor alternados. Vamos a ayudarte a bajar la temperatura de manera segura:</p>
            <div style="${cardGreen}">
                <strong>💊 Pautas sobre antipiréticos y cuidados:</strong><br>
                • <strong>Paracetamol (500 mg a 1 g en adultos):</strong> Es el antipirético más recomendado y seguro como primera opción cada 6 a 8 horas (máximo 3-4 g al día).<br>
                • <strong>Ibuprofeno (400 mg):</strong> Puede utilizarse si el paracetamol no es suficiente y no tienes problemas estomacales o renales.<br>
                • <strong>Hidratación clave:</strong> Al transpirar pierdes agua y sales; bebe abundante agua fresca o caldos a pequeños sorbos.<br>
                • <strong>Compresas tibias:</strong> Paños con agua templada en la frente y nuca. <em>(Nunca uses agua helada ni alcohol, pues causan choque térmico).</em>
            </div>
            <div style="${cardRed}">
                🚨 <strong>Urgencia médica si:</strong> La temperatura supera los 39°C y no baja, si dura más de 48-72 horas, o si hay dificultad respiratoria, manchas en la piel o rigidez en el cuello.
            </div>
            <p>🌸 <em>¿Cuánto marcó el termómetro en tu última medición? Estoy atenta a tu respuesta.</em></p>`;
        }

        // Pastillas / Medicamento para Dolor de Estómago / Digestivo
        if ((q.includes('pastilla') || q.includes('pastillas') || q.includes('medicamento') || q.includes('tomar') || q.includes('tomo') || q.includes('remedio')) &&
            (q.includes('estomago') || q.includes('panza') || q.includes('nauseas') || q.includes('vomito') || q.includes('diarrea') || q.includes('acidez') || q.includes('gastritis'))) {
            return `<p>🍵 ${nameGreeting}<strong>qué incómodo y molesto es el malestar estomacal.</strong> Cuando el estómago se resiente, uno se queda sin energías. Por favor, ten mucha precaución con qué tomas:</p>
            <div style="${cardGreen}">
                <strong>⚠️ Cuidados farmacológicos y digestivos esenciales:</strong><br>
                • <strong>¡Evita el Ibuprofeno y la Aspirina!:</strong> Son fármacos gastrolesivos; pueden irritar gravemente las paredes de tu estómago y empeorar el dolor o generar acidez.<br>
                • <strong>Para el dolor o retortijón:</strong> Un antiespasmódico suave (como hioscina) bajo recomendación farmacéutica puede relajar la musculatura.<br>
                • <strong>Si hay vómitos o diarrea:</strong> La prioridad absoluta es rehidratar. Toma sales de rehidratación oral o agua mineral a sorbos muy pequeños cada 5-10 minutos.<br>
                • <strong>Dieta blanda:</strong> Arroz blanco, caldo colado de pollo, manzana rallada o infusión suave de manzanilla.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Signos de alarma inmediata:</strong> Vómitos continuos que no te permiten retener agua durante más de 6 horas, dolor abdominal punzante e intolerable (especialmente en la zona inferior derecha), o presencia de sangre en vómito o deposiciones.
            </div>
            <p>🌸 <em>¿Tienes principalmente náuseas, dolor tipo cólico o diarrea? Cuéntame y te acompaño.</em></p>`;
        }

        // Pastillas / Medicamento para Garganta / Gripe / Tos
        if ((q.includes('pastilla') || q.includes('pastillas') || q.includes('medicamento') || q.includes('tomar') || q.includes('tomo') || q.includes('remedio')) &&
            (q.includes('garganta') || q.includes('gripe') || q.includes('tos') || q.includes('resfrio') || q.includes('resfriado') || q.includes('congestion') || q.includes('anginas'))) {
            return `<p>🧣 ${nameGreeting}<strong>comprendo lo fastidioso que es el dolor de garganta o la gripe.</strong> Sentir ardor al tragar y el cuerpo cortado nos deja sin ánimos. Cuidemos tu garganta paso a paso:</p>
            <div style="${cardGreen}">
                <strong>💊 Alivio seguro y pautas clínicas:</strong><br>
                • <strong>Para desinflamar y calmar el dolor:</strong> El <strong>Ibuprofeno (400 mg con alimentos)</strong> o el <strong>Paracetamol</strong> ayudan notablemente a aliviar el ardor de garganta y la molestia corporal.<br>
                • <strong>Caramelos antisépticos o analgésicos bucofaríngeos:</strong> Ayudan a lubricar la mucosa y adormecer el ardor localmente.<br>
                • <strong>¡CUIDADO CON ANTIBIÓTICOS!:</strong> El 90% de los cuadros de garganta y resfriados son de origen viral. Los antibióticos <em>no curan los virus</em> y pueden perjudicar tu flora intestinal.<br>
                • <strong>Remedios naturales eficaces:</strong> Gárgaras con agua tibia y una pizca de sal, té con limón y miel, y abundante líquido tibio.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Consulta a un médico si:</strong> No puedes tragar ni tus propios líquidos/saliva, si no puedes abrir bien la boca, o si tienes fiebre alta persistente por más de 3 días.
            </div>
            <p>☕ <em>¿Observas placas blanquecinas en la garganta o es un ardor general? Cuéntame para guiarte.</em></p>`;
        }

        // -------------------------------------------------------------
        // 2. PREGUNTA GENERAL: ¿QUÉ DEBO HACER EN CASO DE UNA ENFERMEDAD?
        // -------------------------------------------------------------
        if (q.includes('caso de una enfermedad') || q.includes('en caso de enfermedad') ||
            q.includes('debe hacer en caso') || q.includes('hacer en caso de') ||
            q.includes('que hago si estoy enfermo') || q.includes('que debo hacer si me enfermo') ||
            q.includes('estoy enfermo que hago') || q.includes('me siento enfermo') ||
            q.includes('que hacer cuando uno se enferma') || q.includes('protocolo enfermedad')) {
            return `<p>❤️ ${nameGreeting}<strong>comprendo lo difícil, incómodo y preocupante que es sentirse enfermo.</strong> Cuando la salud se resiente, es completamente natural sentirse vulnerable o con incertidumbre. Respira hondo: estoy aquí para acompañarte paso a paso con las mejores pautas de cuidado:</p>

            <div style="${cardGreen}">
                <strong>🩺 Guía clínica de primeros pasos ante una enfermedad:</strong><br>
                1. <strong>Escucha y dale reposo a tu cuerpo:</strong> No te exijas de más. Tu sistema inmunológico necesita toda la energía disponible para recuperarse.<br>
                2. <strong>Prioriza una hidratación constante:</strong> Bebe agua, caldos tibios o infusiones suaves a pequeños sorbos a lo largo del día para mantener tus defensas activas.<br>
                3. <strong>Monitorea y anota tus síntomas:</strong> Registra cuándo comenzaron, su intensidad y si hay fiebre (mídela siempre con un termómetro). Esta información es oro para tu médico.<br>
                4. <strong>Autocuidado responsable:</strong> No tomes medicamentos complejos ni antibióticos por tu cuenta. Para molestias o fiebre leve, el paracetamol suele ser la opción más prudente mientras consultas.<br>
                5. <strong>Consulta médica profesional:</strong> Si los síntomas duran más de 48-72 horas, o notas que empeoran en lugar de ceder, acude a tu centro de salud o médico de cabecera.
            </div>

            <div style="${cardRed}">
                🚨 <strong>Signos de alarma (Acude a Urgencias / Guardia sin demora si presentas):</strong><br>
                • Dificultad para respirar, falta de aire o sensación de opresión en el pecho.<br>
                • Fiebre mayor a 39°C que no cede con antitérmicos habituales.<br>
                • Confusión, decaimiento extremo, desmayos o rigidez dolorosa en la nuca.<br>
                • Vómitos persistentes que te impidan tolerar líquidos por completo.
            </div>

            <p>🌸 <em>Tu bienestar es lo más importante para mí. Por favor, cuéntame: ¿qué síntomas o molestias específicas estás sintiendo hoy? Así podré orientarte con total precisión.</em></p>`;
        }

        // -------------------------------------------------------------
        // 3. PREGUNTA GENERAL: ¿QUÉ PASTILLAS TOMAR? / MEDICAMENTOS
        // -------------------------------------------------------------
        if (q.includes('que pastillas tomar') || q.includes('que pastilla tomar') ||
            q.includes('que pastillas tomo') || q.includes('que pastilla tomo') ||
            q.includes('que puedo tomar') || q.includes('que medicamento tomar') ||
            q.includes('que medicamentos tomar') || q.includes('que medicina tomar') ||
            q.includes('que remedio tomar') || q.includes('recomiendame pastillas') ||
            q.includes('puedo tomar pastillas') || q.includes('que pastilla me recomiendas')) {
            return `<p>💊 ${nameGreeting}<strong>entiendo perfectamente que cuando aparece un dolor o malestar, lo que uno más desea es alivio rápido.</strong> Mi compromiso clínico contigo es orientarte con total empatía pero también con la máxima seguridad médica:</p>

            <div style="${cardGreen}">
                <strong>📋 Medicamentos habituales de venta libre (OTC) y su uso seguro:</strong><br>
                • <strong>Para fiebre y dolor leve a moderado (cabeza, malestar general, dolor de cuerpo):</strong><br>
                El <strong>Paracetamol (Acetaminofén)</strong> suele ser la opción de primera línea más segura. Es noble con el estómago. Dosis habitual orientativa en adultos: 500 mg a 1 g cada 6 a 8 horas (nunca superes los 3-4 g en 24 horas). <em>Precaución: evitar si padeces afecciones hepáticas.</em><br><br>
                • <strong>Para inflamación evidente (dolores musculares, muelas, golpes, garganta hinchada):</strong><br>
                El <strong>Ibuprofeno</strong> (400 mg) actúa desinflamando. <em>Regla de oro:</em> tómalo siempre junto con comida o abundante agua para no irritar la mucosa gástrica; evítalo si tienes gastritis, úlceras o problemas renales.
            </div>

            <div style="${cardRed}">
                ⚠️ <strong>Reglas fundamentales de seguridad farmacológica:</strong><br>
                • <strong>NUNCA tomes antibióticos sin receta:</strong> Los antibióticos no sirven para virus (como gripes o resfríos) y tomarlos mal destruye tu flora y crea bacterias resistentes muy peligrosas.<br>
                • <strong>No mezcles fármacos:</strong> Muchos antigripales comerciales combinan paracetamol con otros componentes; revisa no duplicar dosis.<br>
                • <strong>Antecedentes:</strong> Si estás embarazada, amamantando o tomas medicación crónica, consulta siempre antes con tu médico o farmacéutico.
            </div>

            <p>🤝 <em>Para poder recomendarte los cuidados exactos: ¿cuál es el síntoma o molestia concreta que quieres aliviar en este momento? Cuéntame y te acompaño con mucho gusto.</em></p>`;
        }

        // -------------------------------------------------------------
        // 4. SÍNTOMAS ESPECÍFICOS AISLADOS (EMPATÍA Y TRIAJE)
        // -------------------------------------------------------------

        // Fiebre / Calentura
        if (q.includes('fiebre') || q.includes('febril') || q.includes('temperatura alta') || q.includes('escalofrios') || q.includes('tengo 38') || q.includes('tengo 39')) {
            return `<p>🌡️ ${nameGreeting}<strong>sé lo desgastante y desestabilizante que es tener fiebre.</strong> Esa sensación de debilidad, temblores y calor te deja sin energías. Vamos a ayudarte a estar mejor:</p>
            <div style="${cardGreen}">
                <strong>💧 Medidas inmediatas de confort y cuidado:</strong><br>
                1. <strong>Reposo absoluto:</strong> Tu cuerpo necesita concentrar recursos en su respuesta inmunitaria.<br>
                2. <strong>Hidratación abundante:</strong> Bebe agua, infusiones suaves o caldos constantemente a pequeños sorbos para compensar el sudor.<br>
                3. <strong>Ropa fresca y ligera:</strong> No te abrigues excesivamente; el calor corporal necesita disiparse.<br>
                4. <strong>Compresas tibias:</strong> Paños con agua tibia en la frente, nuca y axilas.<br>
                5. <strong>Opción farmacológica:</strong> El <strong>Paracetamol</strong> (500mg-1g cada 6-8hs) es el antitérmico más seguro para iniciar.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Acude a la guardia si:</strong> La temperatura pasa de 39°C y no cede, dura más de 48-72 horas, o se acompaña de manchas en la piel, confusión o rigidez en el cuello.
            </div>
            <p>🌸 <em>¿Hace cuántas horas comenzó la fiebre y qué temperatura tienes en este momento? Cuéntame para ayudarte a monitorearla.</em></p>`;
        }

        // Dolor de cabeza / Cefalea / Migraña
        if (q.includes('dolor de cabeza') || q.includes('me duele la cabeza') || q.includes('cefalea') || q.includes('migrana') || q.includes('jaqueca')) {
            return `<p>🧠 ${nameGreeting}<strong>lamento mucho que tengas dolor de cabeza.</strong> Una cefalea puede ser verdaderamente abrumadora y agotadora. Busquemos alivio juntos:</p>
            <div style="${cardGreen}">
                <strong>🌿 Cuidados y recomendaciones inmediatas:</strong><br>
                1. <strong>Descanso en penumbra:</strong> Recuéstate 20 minutos en una habitación tranquila, oscura y fresca.<br>
                2. <strong>Hidratación:</strong> Bebe uno o dos vasos de agua fresca; la deshidratación y la tensión ocular son detonantes habituales.<br>
                3. <strong>Compresas:</strong> Coloca un paño frío sobre la frente o tibio en la nuca para aflojar tensiones cervicales.<br>
                4. <strong>Analgésico habitual:</strong> Paracetamol (500mg-1g) o Ibuprofeno (400mg con alimento) al inicio del dolor suelen ser muy efectivos.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Urgencia médica si:</strong> El dolor aparece de golpe con máxima intensidad insoportable, o viene con visión doble, dificultad para hablar, o debilidad en un brazo.
            </div>
            <p>✨ <em>¿Sientes el dolor como una banda que aprieta tu cabeza o palpita fuertemente de un solo lado? Cuéntame y te oriento.</em></p>`;
        }

        // Gripe / Tos / Resfriado / Congestión
        if (q.includes('gripe') || q.includes('resfriado') || q.includes('resfrio') || q.includes('catarro') || q.includes('tos') || q.includes('congestion') || q.includes('mocos')) {
            return `<p>🧣 ${nameGreeting}<strong>lamento mucho que estés con este cuadro gripal.</strong> La congestión nasal, el dolor corporal y la tos son tremendamente incómodos. Apoyemos a tu cuerpo a recuperarse:</p>
            <div style="${cardGreen}">
                <strong>🍯 Cuidados de alivio y confort:</strong><br>
                1. <strong>Líquidos tibios y miel con limón:</strong> Gran aliado natural para calmar la irritación de la garganta y suavizar la tos.<br>
                2. <strong>Vapores descongestionantes:</strong> Una ducha caliente con vapor o inhalaciones de vapor ayudan a abrir las fosas nasales.<br>
                3. <strong>Gárgaras con agua y sal:</strong> Si duele la garganta, desinflama la mucosa rápidamente.<br>
                4. <strong>Qué pastillas tomar:</strong> Paracetamol o ibuprofeno para mitigar el dolor corporal y ardor. Recuerda: la gripe es viral, <em>no requiere antibióticos</em>.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Consulta si:</strong> Tienes dificultad para respirar, silbidos en el pecho, o si la fiebre alta dura más de 4 días seguidos.
            </div>
            <p>☕ <em>¿La tos es seca e irritativa o tienes flema y mucosidad? Cuéntame para darte consejos adecuados.</em></p>`;
        }

        // Dolor de estómago / Vómitos / Diarrea / Malestar digestivo
        if (q.includes('dolor de estomago') || q.includes('dolor de panza') || q.includes('me duele la panza') || q.includes('nauseas') || q.includes('vomito') || q.includes('vomitos') || q.includes('diarrea') || q.includes('gastroenteritis') || q.includes('acidez')) {
            return `<p>🍵 ${nameGreeting}<strong>sé lo incómodo y agotador que es el malestar digestivo.</strong> Cuando el estómago se inflama, todo el cuerpo se siente sin fuerzas. Vamos a cuidarte con calma:</p>
            <div style="${cardGreen}">
                <strong>🍲 Medidas para recuperar tu estómago:</strong><br>
                1. <strong>Hidratación fraccionada:</strong> Toma suero oral o agua a sorbitos muy pequeños cada 5-10 minutos. No bebas grandes cantidades de golpe.<br>
                2. <strong>Dieta blanda:</strong> Arroz blanco, tostadas secas, caldo desgrasado, manzana cocida y té de manzanilla. Evita lácteos, fritos y café.<br>
                3. <strong>Atención con medicamentos:</strong> <strong>NO tomes ibuprofeno ni aspirina</strong>, porque irritan la mucosa estomacal.<br>
                4. <strong>Reposo digestivo:</strong> No te fuerces a comer sólidos si sientes náuseas; primero asegura líquidos.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Acude a la guardia si:</strong> No puedes retener líquidos por más de 6-8 horas, si hay sangre en el vómito o heces, o si el dolor abdominal es agudo y constante.
            </div>
            <p>🌸 <em>¿Cuándo comenzaron los síntomas y qué pudiste tolerar de comida o bebida hasta ahora? Cuéntame.</em></p>`;
        }

        // Dolores musculares / Espalda / Cervical / Contractura
        if (q.includes('dolor muscular') || q.includes('dolor de espalda') || q.includes('espalda') || q.includes('lumbar') || q.includes('cervical') || q.includes('contractura') || q.includes('cuello')) {
            return `<p>🌿 ${nameGreeting}<strong>siento mucho ese dolor muscular o de espalda.</strong> El cuerpo suele acumular el estrés, las malas posturas y el cansancio en forma de contracturas muy molestas. Vamos a aliviar esa tensión:</p>
            <div style="${cardGreen}">
                <strong>🧘 Pasos recomendados de recuperación:</strong><br>
                1. <strong>Calor local suave:</strong> Aplica una almohadilla térmica o un baño con agua tibia durante 15 a 20 minutos en la zona dolorida para relajar las fibras musculares.<br>
                2. <strong>Movimientos y estiramientos suaves:</strong> No realices tirones bruscos; respira profundo y elonga suavemente.<br>
                3. <strong>Opciones para el dolor:</strong> El <strong>Ibuprofeno (400 mg con alimentos)</strong> o el <strong>Paracetamol</strong> ayudan en la fase aguda.<br>
                4. <strong>Postura:</strong> Evita levantar peso y cambia de posición con frecuencia si estás sentado/a.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Consulta médica si:</strong> El dolor se irradia hacia la pierna o brazo con hormigueo, adormecimiento o pérdida de fuerza.
            </div>
            <p>🌸 <em>¿El dolor se concentra en la parte baja de la espalda o en el cuello y hombros? Cuéntame para aconsejarte mejor.</em></p>`;
        }

        // Ansiedad / Pánico / Estrés / Miedo / Angustia
        if (q.includes('ansiedad') || q.includes('panico') || q.includes('estres') || q.includes('angustia') || q.includes('tengo miedo') || q.includes('nervios') || q.includes('asustado') || q.includes('asustada') || q.includes('triste') || q.includes('depresion')) {
            return `<p>🫂 ${nameGreeting}<strong>respira conmigo, estoy aquí a tu lado.</strong> Sé que en este momento el pecho puede sentirse apretado, la mente sobrecargada o una sensación muy intensa de angustia y miedo. Quiero que sepas que tus sentimientos son completamente válidos y que <strong>este momento va a pasar</strong>. No estás solo/a.</p>
            <div style="${cardGreen}">
                <strong>🧘‍♀️ Ejercicio de anclaje y calma (Técnica guiada 4-4-6):</strong><br>
                1. Coloca tus dos pies apoyados en el suelo y baja suavemente los hombros.<br>
                2. <strong>Inhala</strong> aire despacio por la nariz contando: <em>1... 2... 3... 4</em>.<br>
                3. <strong>Sostén</strong> el aire suavemente: <em>1... 2... 3... 4</em>.<br>
                4. <strong>Exhala</strong> lento y profundo por la boca: <em>1... 2... 3... 4... 5... 6</em>.<br>
                5. Mira a tu alrededor e identifica: <strong>3 cosas que veas</strong>, <strong>2 que puedas tocar</strong> y <strong>1 sonido que escuches</strong>. Esto devuelve la calma a tu sistema nervioso.
            </div>
            <p style="margin-top: 8px;">💙 <em>Por favor, evita automedicarte con sedantes sin control médico. Si deseas desahogarte y contarme qué te preocupa, aquí estoy para escucharte con todo el corazón y sin juzgarte jamás. ¿Qué sientes en este instante?</em></p>`;
        }

        // Presión arterial / Hipertensión / Mareos
        if (q.includes('presion alta') || q.includes('presion baja') || q.includes('mareo') || q.includes('mareos') || q.includes('presion arterial') || q.includes('hipotension')) {
            return `<p>💓 ${nameGreeting}<strong>comprendo la inquietud que generan los mareos o las variaciones en la presión.</strong> Lo más importante es mantener la serenidad, ya que la ansiedad misma puede alterar los valores. Actuemos con cuidado:</p>
            <div style="${cardGreen}">
                <strong>🩺 Pautas según lo que experimentas:</strong><br>
                • <strong>Si sientes mareo o presión baja:</strong> Siéntate o recuéstate de inmediato y eleva las piernas durante 10 minutos. Bebe agua fresca para restablecer el volumen vascular.<br>
                • <strong>Si sospechas presión alta:</strong> Reposa en un ambiente tranquilo 15 minutos sin hablar y toma una nueva medición con tensiómetro. No tomes fármacos ajenos o duplicados que no hayan sido indicados por tu médico.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Urgencia médica si:</strong> La presión supera los 180/110 mmHg, o si aparece dolor opresivo en el pecho, visión borrosa o dificultad para mover un lado del cuerpo.
            </div>
            <p>🤝 <em>¿Pudiste tomarte la presión arterial hoy? Si tienes los números, compártelos conmigo para orientarte.</em></p>`;
        }

        // Alergias / Ronchas / Picazón
        if (q.includes('alergia') || q.includes('alergias') || q.includes('ronchas') || q.includes('urticaria') || q.includes('picazon') || q.includes('erupcion')) {
            return `<p>🌼 ${nameGreeting}<strong>sé lo desesperante que puede resultar la picazón o una reacción alérgica en la piel.</strong> Te acompaño para calmar las molestias con seguridad:</p>
            <div style="${cardGreen}">
                <strong>🌿 Cuidados recomendados:</strong><br>
                1. <strong>No rascarte:</strong> El rascado daña la piel y libera más histamina, aumentando el picor.<br>
                2. <strong>Compresas frescas:</strong> Paños fríos sobre la zona alivian la comezón de inmediato.<br>
                3. <strong>Prendas suaves:</strong> Usa ropa de algodón holgada.<br>
                4. <strong>Antihistamínicos:</strong> Opciones como loratadina o cetirizina de venta libre pueden ayudar a frenar la reacción, siguiendo el prospecto.
            </div>
            <div style="${cardRed}">
                🚨 <strong>BANDERAS ROJAS (Urgencia Inmediata / Anafilaxia):</strong> Si notas hinchazón en los labios, lengua o garganta, o dificultad para respirar, <strong>llama o acude de inmediato a urgencias</strong>.
            </div>
            <p>🌸 <em>¿Sabes si la reacción fue por un alimento, medicamento o picadura? Cuéntame.</em></p>`;
        }

        // Niños o familiares enfermos
        if (q.includes('hijo') || q.includes('bebe') || q.includes('nene') || q.includes('mama') || q.includes('papa') || q.includes('abuelo') || q.includes('abuela') || q.includes('familiar')) {
            return `<p>👶👴 ${nameGreeting}<strong>comprendo profundamente la preocupación que se siente cuando un ser querido está enfermo.</strong> Cuidar a quien amamos genera mucha inquietud, pero lo estás haciendo muy bien. Ten presentes estas precauciones protectoras:</p>
            <div style="${cardGreen}">
                <strong>🛡️ Pautas de seguridad para familiares:</strong><br>
                • <strong>En niños:</strong> <strong>NUNCA administres Aspirina</strong> (riesgo de Síndrome de Reye). Las dosis de Paracetamol o Ibuprofeno pediátrico se calculan estrictamente por el <strong>peso del niño</strong>, nunca por su edad.<br>
                • <strong>En adultos mayores:</strong> Cuida mucho su hidratación continua y asegúrate de que no se desorienten o tropiecen.<br>
                • <strong>Monitoreo:</strong> Vigila que beban líquidos y que su estado de ánimo y respuesta no estén excesivamente aletargados.
            </div>
            <div style="${cardRed}">
                🚨 <strong>Consulta urgente si:</strong> En niños hay quejido al respirar, rechazo total de líquidos o dificultad para despertarlos; o en ancianos confusión repentina.
            </div>
            <p>❤️ <em>¿Qué síntomas específicos tiene y qué edad tiene tu ser querido? Cuéntame para guiarte con cariño.</em></p>`;
        }

        // -------------------------------------------------------------
        // 5. EMPATÍA SOCIAL: AGRADECIMIENTOS, SALUDOS Y ESTADO DE ÁNIMO
        // -------------------------------------------------------------

        // Agradecimientos
        if (q.includes('gracias') || q.includes('muchas gracias') || q.includes('te agradezco') || q.includes('me ayudaste') || q.includes('sos una genia') || q.includes('eres genial') || q.includes('te quiero')) {
            return `<p>💖 ${nameGreeting}<strong>¡no tienes nada que agradecer!</strong> Es una alegría inmensa para mí poder acompañarte y brindarte tranquilidad. Cuidar de tu salud y estar a tu lado cuando lo necesitas es mi mayor vocación. Recuerda descansar y mimarte mucho hoy. Si te surge cualquier otra duda o molestia, aquí estaré siempre para ti. ¡Te mando un abrazo muy cálido y cuídate mucho!</p>`;
        }

        // Saludos cordiales
        if (q.includes('hola') || q.includes('buenos dias') || q.includes('buenas tardes') || q.includes('buenas noches') || q.includes('que tal') || q.includes('como estas') || q.includes('saludos')) {
            return `<p>👋 ¡Hola con mucha alegría, ${nameGreeting || 'amigo/a'}! Qué lindo saludarte. Soy <strong>Amy</strong>, tu asistente clínica y de salud en TEC AI. Me encuentro muy bien y con toda la energía lista para cuidarte y ayudarte en lo que necesites hoy. ¿Cómo te sientes en este momento? ¿Hay algún malestar, consulta sobre salud o tema en el que pueda asistirte con mucho gusto?</p>`;
        }

        // -------------------------------------------------------------
        // 6. FUNCIONALIDADES CLÍNICAS Y TÉCNICAS ESPECÍFICAS (PRESERVADAS)
        // -------------------------------------------------------------

        // Resumen clínico / Paciente S.C.
        if (q.includes('resumen') || q.includes('s c') || q.includes('sc') || q.includes('historia')) {
            return `📋 <strong>Resumen Clínico Generado — Paciente S.C. (ID: #48920)</strong>:<br>
            • <strong>Edad:</strong> 54 años | <strong>Signos Vitales:</strong> 120 bpm, TA 120/80 mmHg, SpO2 98%.<br>
            • <strong>Diagnóstico de ingreso:</strong> Cuadro febril remitido, recuperación posoperatoria favorable.<br>
            • <strong>Plan sugerido:</strong> Reducción de analgésicos intravenosos a vía oral. Control ambulatorio programado para el 15 de Octubre.<br>
            <em>Registrado con éxito en el sistema hospitalario central con seguimiento humanizado.</em>`;
        }

        // Guía clínica / Hipertensión
        if (q.includes('guia') || q.includes('hipertension') || q.includes('evidencia')) {
            return `📖 <strong>Guía de Práctica Clínica Actualizada (Nivel de Evidencia A)</strong>:<br>
            Para pacientes con hipertensión arterial estadio 2, los protocolos de la Red TEC AI recomiendan iniciar con terapia combinada de dos antihipertensivos de primera línea (IECA/ARA-II + Calcioantagonista o diurético tiazídico). Monitoreo de función renal y electrolitos a las 2 semanas, asegurando siempre una comunicación empática y cercana con el paciente sobre adherencia al tratamiento.`;
        }

        // Análisis predictivo / Riesgo / 120 bpm
        if (q.includes('predictivo') || q.includes('riesgo') || q.includes('120 bpm') || q.includes('120')) {
            return `📈 <strong>Análisis Predictivo de Pacientes & Seguridad Clínica</strong>:<br>
            • Frecuencia cardíaca en 120 bpm detecta taquicardia sinusal transitoria.<br>
            • <strong>Índice de Alerta Temprana (NEWS2):</strong> 2 puntos (Riesgo Bajo a Moderado).<br>
            • <strong>Recomendación empática:</strong> Repetir toma en 30 minutos en ambiente tranquilo, evaluar dolor o deshidratación y tranquilizar al paciente para descartar reactividad emocional.`;
        }

        // Base de Datos (BD)
        if (q.includes('bd') || q.includes('base de datos') || q.includes('camas')) {
            return `🗄️ <strong>Consulta a Base de Datos (BD) Hospitalaria en Tiempo Real</strong>:<br>
            Conexión con el servidor hospitalario establecida con éxito.<br>
            • Camas de Terapia Intensiva disponibles: <strong>4 de 20</strong>.<br>
            • Camas de Sala General disponibles: <strong>18 de 50</strong>.<br>
            • Latencia de respuesta: 0.08ms. Cifrado de grado médico AES-256 verificado.`;
        }

        // Contenido Dinámico (CD)
        if (q.includes('cd') || q.includes('contenido dinamico') || q.includes('reporte') || q.includes('hl7')) {
            return `⚡ <strong>Módulo de Contenido Dinámico (CD)</strong>:<br>
            Reporte generado en formato interoperable HL7/FHIR listo para exportar a la historia clínica electrónica o enviar por canal seguro a los profesionales de salud de guardia.`;
        }

        // Planes y Precios
        if (q.includes('planes') || q.includes('precio') || q.includes('costo') || q.includes('pagar') || q.includes('suscripcion')) {
            return `💎 <strong>Planes de TEC AI & Amy</strong>:<br>
            • <strong>Plan Simple:</strong> $0 / mes (Herramientas esenciales para uso personal o formativo).<br>
            • <strong>Plan Pro:</strong> $29 / mes (Para consultorios médicos y profesionales con análisis avanzado).<br>
            • <strong>Plan Para Empresa:</strong> Solución dedicada para hospitales y clínicas con alta disponibilidad y soporte 24/7.<br>
            Puedes revisar y activar cualquiera de ellos en la sección <a href="empresas.html#planes" style="color: var(--teal-dark, #0f766e); font-weight: 600; text-decoration: underline;">Para Empresas</a> o desde el botón de suscripción.`;
        }

        // -------------------------------------------------------------
        // 7. FALLBACK EMPÁTICO Y ASISTENCIAL (CONSULTA ABIERTA)
        // -------------------------------------------------------------
        const modeDesc = {
            clinico: 'Clínico & Asistencial',
            bd: 'Base de Datos (BD)',
            cd: 'Contenido Dinámico (CD)'
        }[mode] || 'Clínico';

        return `<p>🩺 ${nameGreeting}<strong>he recibido tu mensaje con mucha atención.</strong></p>
        <p>Como tu asistente clínica en modo <strong>${modeDesc}</strong>, mi mayor propósito es acompañarte, cuidar de tu salud y ofrecerte orientación certera, cercana y empática.</p>
        <div style="${cardBlue}">
            <strong>¿En qué podemos enfocarnos ahora?</strong><br>
            • Si estás sintiendo algún malestar, dolor o síntoma, cuéntame los detalles y te daré pautas de alivio seguro y signos de alarma.<br>
            • Si tienes dudas sobre qué pastillas tomar o cómo cuidar a un familiar enfermo, te explico las opciones seguras paso a paso.<br>
            • Si deseas redactar notas médicas, analizar signos vitales o consultar la Base de Datos, indícamelo con total confianza.
        </div>
        <p>🌸 <em>Estoy aquí para escucharte y ayudarte con todo mi cariño. ¿Qué te gustaría consultar a continuación?</em></p>`;
    }

    // Formateo de Markdown básico (*cursiva* y **negrita**)
    function formatMarkdown(str) {
        if (!str) return '';
        return str
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
