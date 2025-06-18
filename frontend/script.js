// script.js - Funcionalidades generales del sitio web
// Responsable de: navegación, sidebar toggle, interacciones básicas de UI

// ===== EVENTO DE CARGA DEL DOM =====

/**
 * Event listener que se ejecuta cuando el DOM está completamente cargado
 * Inicializa las funcionalidades básicas de navegación y UI
 */
document.addEventListener('DOMContentLoaded', () => {
    // ===== INICIALIZACIÓN DEL TOGGLE DE SIDEBAR =====
    
    // Obtener referencias a los elementos necesarios para el toggle de la sidebar
    const sidebarToggle = document.getElementById('sidebarToggle'); // Botón hamburguesa
    const sidebar = document.getElementById('sidebar');             // Barra lateral de navegación
    const mainContent = document.getElementById('mainContent');     // Contenido principal
  
    // Verificar que todos los elementos existan en el DOM antes de agregar funcionalidad
    if (sidebarToggle && sidebar && mainContent) {
        /**
         * Event listener para el botón toggle de la sidebar
         * Alterna la visibilidad de la sidebar y ajusta el contenido principal
         */
        sidebarToggle.addEventListener('click', () => {
            // Alternar clase 'sidebar-collapsed' en la sidebar
            // Esta clase oculta/muestra la sidebar con animaciones CSS
            sidebar.classList.toggle('sidebar-collapsed');
            
            // Alternar clase 'content-expanded' en el contenido principal
            // Esta clase expande el contenido principal cuando la sidebar está oculta
            mainContent.classList.toggle('content-expanded');
        });
        /*
         * Funcionamiento del toggle:
         * - Al hacer clic en el botón hamburguesa:
         *   1. sidebar-collapsed: oculta la sidebar (transform: translateX(-100%))
         *   2. content-expanded: expande el contenido principal (margin-left: 0)
         * - Permite navegación responsive en dispositivos móviles y tablets
         * - Las transiciones CSS proporcionan animaciones suaves
         */
    }
});
  