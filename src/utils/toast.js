// toast.js — Global Toast Notification System

let toastContainer = null;

function initToastContainer() {
    if (toastContainer) return;
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

/**
 * Prikazovanje obvestila (Toast).
 * @param {string} message - Besedilo obvestila.
 * @param {string} icon - Ime Lucide ikone (npr. 'check-circle').
 * @param {object|null} action - Neobvezna akcija { label: string, onClick: function }.
 */
export function showToast(message, icon = 'check-circle', action = null) {
    initToastContainer();

    const toast = document.createElement('div');
    toast.className = 'ux-toast';
    
    // Ustvarjanje strukture
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
        ${action ? `<button type="button" class="ux-toast-action" style="margin-left:10px;padding:3px 10px;border-radius:999px;border:1px solid currentColor;background:rgba(255,255,255,0.15);color:inherit;font-size:11.5px;font-weight:700;cursor:pointer">${action.label}</button>` : ''}
    `;

    if (action && typeof action.onClick === 'function') {
        const btn = toast.querySelector('.ux-toast-action');
        if (btn) {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                toast.remove();
                action.onClick();
            });
        }
    }

    toastContainer.appendChild(toast);
    
    // Osvežimo Lucide ikone (če lucide obstaja globalno)
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toast });
    }

    // Po treh sekundah (ali 4.5s če ima gumb za akcijo) odstranimo
    const duration = action ? 4500 : 3000;
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}
