import { icon } from './icons.js';
import { t } from '../../core/i18n.js';

export function openAutoHubDialog({title,body,submitLabel,onSubmit,signal}) {
    const dialog=document.createElement('dialog');
    dialog.className='ah-dialog';
    const id=`ah-dialog-${crypto.randomUUID()}`;
    dialog.setAttribute('aria-labelledby',id);
    dialog.innerHTML=`<form><div class="ah-dialog-heading"><h2 id="${id}">${title}</h2><button type="button" class="ah-icon-button" data-close-dialog aria-label="${t('close','Zapri')}">${icon('close')}</button></div><div class="ah-dialog-body">${body}</div><p class="ah-dialog-error" role="alert" hidden></p><div class="ah-dialog-actions"><button type="button" class="ah-pill" data-close-dialog>${t('cancel','Prekliči')}</button>${onSubmit?`<button type="submit" class="ah-blue-button">${submitLabel||t('save_btn','Shrani')}</button>`:''}</div></form>`;
    document.body.append(dialog);
    const origin=document.activeElement;
    let closed=false;
    function remove() {
        dialog.close();dialog.remove();signal?.removeEventListener('abort',remove);
        if(origin?.isConnected)origin.focus();
    }
    function close() {
        if(closed)return;closed=true;
        dialog.classList.add('is-leaving');
        if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)remove();else setTimeout(remove,160);
    }
    signal?.addEventListener('abort',remove,{once:true});
    dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',close));
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('click',event=>{
        const rect=dialog.getBoundingClientRect();
        if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))close();
    });
    dialog.querySelector('form').addEventListener('submit',async event=>{
        event.preventDefault();if(!onSubmit)return;
        const button=dialog.querySelector('[type="submit"]');
        const error=dialog.querySelector('.ah-dialog-error');button.disabled=true;error.hidden=true;
        try{await onSubmit(new FormData(event.target),dialog);if(dialog.isConnected)close();}
        catch(failure){if(dialog.isConnected){error.textContent=failure.message||t('ah_save_failed','Shranjevanje ni uspelo. Poskusite znova.');error.hidden=false;button.disabled=false;}}
    });
    dialog.showModal();
    return {dialog,close};
}
