// ==========================================================================
// SUPABASE.JS — Configuración e Inicialización Centralizada de Supabase
// Proyecto: TEC AI / Amy (insssbffnzrhjcmynvrz)
// ==========================================================================

const SUPABASE_URL = 'https://insssbffnzrhjcmynvrz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rdAflpQLMLDEUe9DAQxXVA_F9Gi4R2-';

if (typeof window.supabase === 'undefined') {
    console.error('❌ Error: La librería de Supabase no se cargó antes de este script.');
} else {
    // 1. Inicializar cliente global
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase Client inicializado para TEC AI.');

    // 2. Funciones auxiliares globales de Autenticación y Perfil

    /**
     * Obtiene el usuario autenticado actual y su sesión
     */
    window.obtenerUsuarioActual = async function () {
        if (!window.supabaseClient) return null;
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error || !session) return null;
        return session.user;
    };

    /**
     * Obtiene el perfil público del usuario desde la tabla public.profiles
     */
    window.obtenerPerfilUsuario = async function (userId) {
        if (!window.supabaseClient || !userId) return null;
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            console.warn('No se pudo cargar el perfil de la base de datos:', error.message);
            return null;
        }
        return data;
    };

    /**
     * Cierra la sesión activa en Supabase y limpia almacenamiento local
     */
    window.cerrarSesion = async function () {
        if (!window.supabaseClient) return;
        await window.supabaseClient.auth.signOut();
        try {
            localStorage.removeItem('amy_user_nickname');
            localStorage.removeItem('amy_user_auth');
        } catch (e) { }
        window.location.href = 'login.html';
    };
}
