// Keyboard and screen-reader lifecycle for the existing mobile filter/sort sheets.
export function initMobileSheets({sheets,close}) {
    const controller = new AbortController();
    const options = {signal:controller.signal};
    const media = window.matchMedia('(max-width: 1023px)');
    let active = null;
    let origin = null;
    const background = new Map();
    const focusable = sheet => [...sheet.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')]
        .filter(element => !element.disabled && !element.closest('[hidden],[inert]') && element.getClientRects().length);

    function sync() {
        sheets.forEach(({sheet,trigger,label}) => {
            if (!sheet) return;
            sheet.inert = media.matches && sheet !== active;
            trigger?.setAttribute('aria-expanded',String(sheet === active));
            if (media.matches) {
                sheet.setAttribute('role','dialog');
                sheet.setAttribute('aria-label',label);
                sheet.setAttribute('aria-modal','true');
                sheet.setAttribute('aria-hidden',String(sheet !== active));
            } else {
                ['role','aria-label','aria-modal','aria-hidden'].forEach(attribute => sheet.removeAttribute(attribute));
            }
        });
    }
    function restoreBackground() {
        background.forEach((wasInert,element) => {element.inert = wasInert;});
        background.clear();
    }
    function activate(sheet,trigger) {
        if (!media.matches || !sheet) return;
        restoreBackground();
        active = sheet;
        origin = trigger;
        sync();
        // Disable sibling branches while keeping the sheet and its backdrop interactive.
        for (let branch = sheet; branch.parentElement; branch = branch.parentElement) {
            [...branch.parentElement.children].forEach(element => {
                if (element === branch || element.id === 'mobileSheetBackdrop' || ['SCRIPT','STYLE','LINK'].includes(element.tagName)) return;
                background.set(element,element.inert);
                element.inert = true;
            });
            if (branch.parentElement === document.body) break;
        }
        focusable(sheet)[0]?.focus({preventScroll:true});
        requestAnimationFrame(() => {
            if (active === sheet && !sheet.contains(document.activeElement)) focusable(sheet)[0]?.focus({preventScroll:true});
            Promise.allSettled(sheet.getAnimations().map(animation => animation.finished)).then(() => {
                if (active === sheet && !sheet.contains(document.activeElement)) focusable(sheet)[0]?.focus({preventScroll:true});
            });
        });
    }
    function deactivate(restoreFocus = true) {
        const previous = origin;
        active = null;
        origin = null;
        restoreBackground();
        sync();
        if (restoreFocus && previous?.isConnected) previous.focus({preventScroll:true});
    }
    document.addEventListener('keydown',event => {
        if (!active) return;
        if (event.key === 'Escape') {event.preventDefault();close();return;}
        if (event.key !== 'Tab') return;
        const items = focusable(active);
        const first = items[0], last = items.at(-1);
        if (!first) {event.preventDefault();return;}
        if (event.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) {
            event.preventDefault();last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) {
            event.preventDefault();first.focus();
        }
    },options);
    media.addEventListener('change',() => {close(false);sync();},options);
    sync();
    return {activate,deactivate,destroy() {close(false);controller.abort();sheets.forEach(({sheet}) => {
        if (!sheet) return;
        sheet.inert = false;
        ['role','aria-label','aria-modal','aria-hidden'].forEach(attribute => sheet.removeAttribute(attribute));
    });}};
}
