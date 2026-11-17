// ==========================================================================
// FORO.JS — Foro de Empresas Amy | Integrado con Supabase
// Proyecto: insssbffnzrhjcmynvrz
// ==========================================================================

// ─── CONFIGURACIÓN SUPABASE ───────────────────────────────────────────────────
// IMPORTANTE: Reemplazá SUPABASE_ANON_KEY con tu clave real desde:
// https://supabase.com/dashboard/project/insssbffnzrhjcmynvrz/settings/api
const SUPABASE_URL = 'https://insssbffnzrhjcmynvrz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rdAflpQLMLDEUe9DAQxXVA_F9Gi4R2-';

const supabase = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {

    // Cargar datos del foro desde Supabase
    await cargarEmpresas();
    await cargarRecursos();
    await cargarMentores();
    await cargarHilos();

    // Configurar búsqueda en tiempo real
    iniciarBusqueda();

    // Configurar modales de los cuadrantes
    configurarFormularios();

    // Upvotes en Hilos Populares
    configurarUpvotes();

    // Modal Nuevo Hilo (ya existente)
    configurarModalNuevoHilo();

});

// ==========================================================================
// CUADRANTE 2: COMUNIDAD EMPRESAS
// ==========================================================================
async function cargarEmpresas() {
    const container = document.getElementById('companies-container');
    const emptyState = document.getElementById('companies-empty');
    if (!container) return;

    const { data, error } = await supabase
        .from('forum_companies')
        .select('*')
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

    if (error) { console.error('Error cargando empresas:', error); return; }

    if (!data || data.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    data.forEach(empresa => {
        const initials = empresa.company_name.substring(0, 2).toUpperCase();
        const item = document.createElement('div');
        item.className = 'company-item-boceto';
        item.innerHTML = `
            <div class="company-avatar-box">${initials}</div>
            <div class="company-info">
                <h5>${escapeHTML(empresa.company_name)}</h5>
                <span>${escapeHTML(empresa.description || 'Miembro activo de la comunidad')}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

// Modal: Unirse a Comunidad Empresas
function abrirModalEmpresa() {
    document.getElementById('modal-empresa').style.display = 'flex';
}

async function handleFormEmpresa(e) {
    e.preventDefault();
    const btn = document.getElementById('empresa-submit-btn');
    const msgBox = document.getElementById('empresa-msg');
    const nombre = document.getElementById('empresa-nombre').value.trim();
    const desc = document.getElementById('empresa-desc').value.trim();

    btn.disabled = true;
    btn.textContent = 'Registrando...';

    // Verificar si hay sesión
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('forum_companies').insert({
        company_name: nombre,
        description: desc,
        user_id: user ? user.id : null,
        status: 'active'
    });

    if (error) {
        mostrarMensaje(msgBox, '❌ Error al registrar: ' + error.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Unirse a la Comunidad';
        return;
    }

    mostrarMensaje(msgBox, '✅ ¡Tu empresa fue registrada con éxito en la comunidad!', 'success');
    setTimeout(() => {
        cerrarModal('modal-empresa');
        document.getElementById('form-empresa').reset();
        cargarEmpresas(); // Recargar la lista
    }, 1800);
}

// ==========================================================================
// CUADRANTE 3: RECURSOS DESTACADOS
// ==========================================================================
async function cargarRecursos() {
    const container = document.getElementById('resources-container');
    const emptyState = document.getElementById('resources-empty');
    if (!container) return;

    const { data, error } = await supabase
        .from('forum_resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) { console.error('Error cargando recursos:', error); return; }

    if (!data || data.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    data.forEach(recurso => {
        const item = document.createElement('a');
        item.className = 'resource-boceto-entry';
        item.href = recurso.url || '#';
        if (recurso.url) item.target = '_blank';
        item.innerHTML = `
            <div class="resource-icon-boceto">${recurso.icon || '📄'}</div>
            <div class="resource-entry-text">
                <h5>${escapeHTML(recurso.title)}</h5>
                <p>${escapeHTML(recurso.description || '')}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// Modal: Compartir Recurso
function abrirModalRecurso() {
    document.getElementById('modal-recurso').style.display = 'flex';
}

async function handleFormRecurso(e) {
    e.preventDefault();
    const btn = document.getElementById('recurso-submit-btn');
    const msgBox = document.getElementById('recurso-msg');
    const titulo = document.getElementById('recurso-titulo').value.trim();
    const desc = document.getElementById('recurso-desc').value.trim();
    const url = document.getElementById('recurso-url').value.trim();

    btn.disabled = true;
    btn.textContent = 'Publicando...';

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('forum_resources').insert({
        title: titulo,
        description: desc,
        url: url || null,
        user_id: user ? user.id : null,
        icon: '📄'
    });

    if (error) {
        mostrarMensaje(msgBox, '❌ Error al publicar: ' + error.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Publicar Recurso';
        return;
    }

    mostrarMensaje(msgBox, '✅ ¡Recurso publicado con éxito!', 'success');
    setTimeout(() => {
        cerrarModal('modal-recurso');
        document.getElementById('form-recurso').reset();
        cargarRecursos(); // Recargar
    }, 1800);
}

// ==========================================================================
// CUADRANTE 4: MENTORES DESTACADOS (solo doctores)
// ==========================================================================
async function cargarMentores() {
    const container = document.getElementById('mentors-container');
    const emptyState = document.getElementById('mentors-empty');
    if (!container) return;

    const { data, error } = await supabase
        .from('forum_mentors')
        .select('*')
        .order('verified', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) { console.error('Error cargando mentores:', error); return; }

    if (!data || data.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    data.forEach(mentor => {
        const item = document.createElement('div');
        item.className = 'mentor-card-boceto';
        item.innerHTML = `
            <div class="mentor-avatar">${mentor.avatar_emoji || '👨‍⚕️'}</div>
            <div class="mentor-info">
                <h5>${escapeHTML(mentor.medical_title)} ${escapeHTML(mentor.full_name)}</h5>
                <span>${escapeHTML(mentor.specialty)}</span>
                ${mentor.verified ? '<span style="color:#16a34a; font-size:0.75rem; font-weight:600;">✓ Verificado</span>' : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

// Modal: Postularse como Mentor Doctor
function abrirModalMentor() {
    document.getElementById('modal-mentor').style.display = 'flex';
}

async function handleFormMentor(e) {
    e.preventDefault();
    const btn = document.getElementById('mentor-submit-btn');
    const msgBox = document.getElementById('mentor-msg');
    const titulo = document.getElementById('mentor-titulo').value;
    const nombre = document.getElementById('mentor-nombre').value.trim();
    const especialidad = document.getElementById('mentor-especialidad').value.trim();

    // Validación: título de Doctor obligatorio
    if (!titulo) {
        mostrarMensaje(msgBox, '⚠️ Debés seleccionar tu título médico (Dr./Dra.)', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Postulando...';

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('forum_mentors').insert({
        full_name: nombre,
        specialty: especialidad,
        medical_title: titulo,
        user_id: user ? user.id : null,
        avatar_emoji: titulo === 'Dra.' ? '👩‍⚕️' : '👨‍⚕️',
        verified: false // Se verifica manualmente por el admin
    });

    if (error) {
        mostrarMensaje(msgBox, '❌ Error al postularse: ' + error.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Postularme como Mentor';
        return;
    }

    mostrarMensaje(msgBox, '✅ ¡Postulación enviada! Será revisada y verificada por nuestro equipo.', 'success');
    setTimeout(() => {
        cerrarModal('modal-mentor');
        document.getElementById('form-mentor').reset();
        cargarMentores(); // Recargar
    }, 2200);
}

// ==========================================================================
// HILOS DEL FORO (Cuadrante 1 - ya existente, ahora conectado a BD)
// ==========================================================================
async function cargarHilos() {
    const container = document.getElementById('threads-container');
    if (!container) return;

    const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .order('votes', { ascending: false })
        .limit(10);

    if (error || !data || data.length === 0) return;

    // Limpiar hilos estáticos del HTML solo si hay datos en la BD
    container.innerHTML = '';

    data.forEach(hilo => {
        const timeAgo = getTimeAgo(hilo.created_at);
        const item = document.createElement('div');
        item.className = 'thread-item-boceto';
        item.dataset.topic = hilo.topic || 'general';
        item.dataset.threadId = hilo.id;
        item.innerHTML = `
            <div>
                <div class="thread-title">${escapeHTML(hilo.title)}</div>
                <div class="thread-subtitle">Por <strong>${escapeHTML(hilo.author_name)}</strong> • ${timeAgo} • ${hilo.reply_count} respuestas</div>
            </div>
            <div class="thread-votes-pill" data-id="${hilo.id}">▲ <span class="vote-num">${hilo.votes}</span></div>
        `;
        container.appendChild(item);
    });

    // Re-asignar upvotes
    configurarUpvotes();
}

// ==========================================================================
// UTILIDADES
// ==========================================================================

function configurarFormularios() {
    const formEmpresa = document.getElementById('form-empresa');
    if (formEmpresa) formEmpresa.addEventListener('submit', handleFormEmpresa);

    const formRecurso = document.getElementById('form-recurso');
    if (formRecurso) formRecurso.addEventListener('submit', handleFormRecurso);

    const formMentor = document.getElementById('form-mentor');
    if (formMentor) formMentor.addEventListener('submit', handleFormMentor);
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// Cerrar modales al hacer click fuera
document.addEventListener('click', (e) => {
    ['modal-empresa', 'modal-recurso', 'modal-mentor'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal && e.target === modal) modal.style.display = 'none';
    });
});

function mostrarMensaje(el, text, tipo) {
    if (!el) return;
    el.style.display = 'block';
    el.textContent = text;
    el.style.background = tipo === 'success' ? '#f0fdf4' : '#fef2f2';
    el.style.color = tipo === 'success' ? '#166534' : '#991b1b';
    el.style.border = `1px solid ${tipo === 'success' ? '#bbf7d0' : '#fecaca'}`;
}

function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs} hora${hrs > 1 ? 's' : ''}`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"/]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '/': '&#x2F;' }[tag] || tag)
    );
}

// ==========================================================================
// BÚSQUEDA EN TIEMPO REAL
// ==========================================================================
function iniciarBusqueda() {
    const searchInput = document.getElementById('forum-search-input') || document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();

        document.querySelectorAll('.thread-item-boceto').forEach(el => {
            el.style.display = (!term || el.textContent.toLowerCase().includes(term)) ? 'flex' : 'none';
        });
        document.querySelectorAll('.company-item-boceto').forEach(el => {
            el.style.display = (!term || el.textContent.toLowerCase().includes(term)) ? 'flex' : 'none';
        });
        document.querySelectorAll('.resource-boceto-entry').forEach(el => {
            el.style.display = (!term || el.textContent.toLowerCase().includes(term)) ? 'flex' : 'none';
        });
        document.querySelectorAll('.mentor-card-boceto').forEach(el => {
            el.style.display = (!term || el.textContent.toLowerCase().includes(term)) ? 'flex' : 'none';
        });
    });
}

// ==========================================================================
// UPVOTES EN HILOS (con actualización en Supabase)
// ==========================================================================
function configurarUpvotes() {
    document.querySelectorAll('.thread-votes-pill').forEach(pill => {
        // Remover listeners anteriores clonando el nodo
        const newPill = pill.cloneNode(true);
        pill.parentNode.replaceChild(newPill, pill);

        newPill.addEventListener('click', async (e) => {
            e.stopPropagation();
            const numSpan = newPill.querySelector('.vote-num');
            if (!numSpan) return;

            let current = parseInt(numSpan.textContent, 10);
            if (newPill.classList.contains('voted')) {
                newPill.classList.remove('voted');
                numSpan.textContent = current - 1;
            } else {
                newPill.classList.add('voted');
                numSpan.textContent = current + 1;
            }

            // Si tiene ID del hilo, actualizar en Supabase
            const threadId = newPill.dataset.id;
            if (threadId) {
                await supabase
                    .from('forum_threads')
                    .update({ votes: parseInt(numSpan.textContent, 10) })
                    .eq('id', threadId);
            }
        });
    });
}

// ==========================================================================
// MODAL NUEVO HILO (conectado a Supabase)
// ==========================================================================
function configurarModalNuevoHilo() {
    const btnNewThread = document.getElementById('btn-nuevo-hilo');
    const modalNewThread = document.getElementById('new-thread-modal');
    const closeNewThread = document.getElementById('close-thread-modal');
    const formNewThread = document.getElementById('new-thread-form');
    const threadsContainer = document.getElementById('threads-container');

    if (btnNewThread && modalNewThread) {
        btnNewThread.addEventListener('click', () => modalNewThread.classList.add('active'));
    }
    if (closeNewThread && modalNewThread) {
        closeNewThread.addEventListener('click', () => modalNewThread.classList.remove('active'));
    }

    if (formNewThread) {
        formNewThread.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('thread-title-input').value.trim();
            const author = document.getElementById('thread-author-input').value.trim();
            const content = document.getElementById('thread-content-input')?.value.trim() || '';

            if (!title || !author) return;

            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase.from('forum_threads').insert({
                title,
                author_name: author,
                content,
                user_id: user ? user.id : null,
                votes: 1,
                reply_count: 0,
                topic: 'general'
            }).select().single();

            if (error) {
                console.error('Error publicando hilo:', error);
                return;
            }

            // Agregar al DOM sin recargar
            if (threadsContainer && data) {
                const newEntry = document.createElement('div');
                newEntry.className = 'thread-item-boceto';
                newEntry.dataset.threadId = data.id;
                newEntry.innerHTML = `
                    <div>
                        <div class="thread-title">${escapeHTML(title)}</div>
                        <div class="thread-subtitle">Por <strong>${escapeHTML(author)}</strong> • Recién publicado • 0 respuestas</div>
                    </div>
                    <div class="thread-votes-pill" data-id="${data.id}">▲ <span class="vote-num">1</span></div>
                `;
                threadsContainer.prepend(newEntry);
                configurarUpvotes();
            }

            formNewThread.reset();
            modalNewThread.classList.remove('active');
        });
    }
}
