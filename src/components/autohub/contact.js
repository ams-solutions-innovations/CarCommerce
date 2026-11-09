import { openAutoHubDialog } from './dialog.js';
import { icon } from './icons.js';
import { t } from '../../core/i18n.js';
import { escHtml } from '../../utils/escHtml.js';

export function openSellerContact(listing) {
    const phone = listing.contact?.showPhone === false ? '' : listing.contact?.phone || listing.dealerDetails?.phone || listing.phone || '';
    const email = listing.contact?.email || listing.dealerDetails?.email || listing.email || '';
    const seller = listing.contact?.name || (typeof listing.seller === 'object' ? listing.seller?.name : listing.seller) || t('private_seller','Zasebni prodajalec');
    const questions = [t('ah_question_available','Ali je še na voljo?'),t('ah_question_viewing','Možen ogled?'),t('ah_question_price','Zadnja cena?'),t('ah_question_exchange','Menjava?')];
    const modal = openAutoHubDialog({
        title: escHtml(seller),
        body: `<p>${escHtml(listing.title || [listing.make,listing.model].filter(Boolean).join(' '))}</p>
        ${phone ? `<div class="ah-contact-phone"><span data-phone-number>${escHtml(String(phone).slice(0,3))} ••• •••</span><button type="button" class="ah-pill" data-reveal-phone>${t('show_phone','Pokaži številko')}</button></div>` : ''}
        ${email ? `<div class="ah-contact-questions">${questions.map((question,index)=>`<button type="button" class="ah-pill" data-question="${index}">${escHtml(question)}</button>`).join('')}</div><label class="ah-form-field">${t('message','Sporočilo')}<textarea name="message" rows="4" maxlength="4000"></textarea></label><a class="ah-blue-button" data-email-contact>${icon('mail')}${t('ah_continue_email','Nadaljuj v e-pošto')}</a>` : ''}
        ${phone ? `<a class="ah-blue-button" href="tel:${String(phone).replace(/[^\d+]/g,'')}">${icon('phone')}${t('call','Pokliči')}</a>` : ''}
        ${!phone && !email ? `<p>${t('ah_contact_unavailable','Prodajalec ni objavil kontaktnih podatkov.')}</p>` : ''}`,
    });
    modal.dialog.classList.add('ah-contact-dialog');
    const controller = new AbortController();
    document.addEventListener('beforeRouteChange',() => { modal.close(); controller.abort(); },{once:true,signal:controller.signal});
    modal.dialog.addEventListener('close',() => controller.abort(),{once:true});
    modal.dialog.querySelector('[data-reveal-phone]')?.addEventListener('click',event => {
        modal.dialog.querySelector('[data-phone-number]').textContent = phone;
        event.currentTarget.hidden = true;
    });
    const textarea = modal.dialog.querySelector('textarea');
    const syncEmail = () => {
        const link = modal.dialog.querySelector('[data-email-contact]');
        if (link) link.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(listing.title || '')}&body=${encodeURIComponent(textarea.value)}`;
    };
    modal.dialog.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click',() => {
        textarea.value = questions[Number(button.dataset.question)];
        syncEmail();
        textarea.focus();
    }));
    textarea?.addEventListener('input',syncEmail);
    if (textarea) syncEmail();
    return modal;
}
