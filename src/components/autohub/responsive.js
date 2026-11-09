import { t } from '../../core/i18n.js';

// Reuse each section's existing accordion action and preserve its form state.
export function addFilterSectionNavigation(form) {
    if (!form || form.querySelector('.ah-filter-sections')) return;
    const nav = document.createElement('nav');
    nav.className = 'ah-filter-sections';
    nav.setAttribute('aria-label',t('ah_filter_sections','Razdelki filtrov'));
    [...form.querySelectorAll('.adv-accordion')].forEach((section,index) => {
        const trigger = section.querySelector('.adv-acc-trigger');
        const title = section.querySelector('.adv-acc-title');
        if (!trigger || !title) return;
        const button = document.createElement('button');
        button.type = 'button';
        if (!section.id) section.id = `ah-filter-section-${index}`;
        button.setAttribute('aria-controls',section.id);
        const update = () => {
            const count = [...section.querySelectorAll('input,select')].filter(input => {
                if (input.disabled || (form.id === 'advancedSearchForm' && !input.name)) return false;
                if (input.closest('.remember-toggle,.custom-select-dropdown') || ['hidden','range'].includes(input.type)) return false;
                return ['checkbox','radio'].includes(input.type) ? input.checked && input.value !== '' : Boolean(input.value);
            }).length;
            button.textContent = `${title.textContent.trim()}${count ? ` · ${count}` : ''}`;
            button.hidden = section.hidden || section.style.display === 'none';
        };
        button.addEventListener('click',() => {
            if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
            section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
            trigger.focus({preventScroll:true});
        });
        form.addEventListener('change',update);
        update();
        nav.append(button);
    });
    form.prepend(nav);
}

export function initResponsiveViewport() {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const sync = () => {
        const editing = document.activeElement?.matches('input,textarea,select,[contenteditable=true]');
        const keyboard = editing ? Math.max(0,innerHeight - viewport.height - viewport.offsetTop) : 0;
        document.documentElement.style.setProperty('--ah-keyboard-offset',`${keyboard}px`);
        document.body.classList.toggle('ah-keyboard-open',keyboard > 100);
    };
    viewport.addEventListener('resize',sync);
    viewport.addEventListener('scroll',sync);
    document.addEventListener('focusin',sync);
    document.addEventListener('focusout',() => requestAnimationFrame(sync));
}
