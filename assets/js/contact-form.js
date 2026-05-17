/**
 * Contact form + EmailJS (vanilla JS)
 *
 * React equivalent of useRef():
 *   const formRef = useRef(null);
 *   <form ref={formRef} />
 * Here we use:
 *   const formRef = document.getElementById('contact-form');
 * which is the same DOM reference as formRef.current in React.
 */

(function initEmailContactForm() {
  const CONFIG = window.EMAILJS_CONFIG;

  const SUCCESS_MESSAGE = 'Message sent successfully!';
  const ERROR_MESSAGE = 'Failed to send message';

  let toastTimer;
  let isBound = false;

  function log(...args) {
    console.log('[EmailJS]', ...args);
  }

  function logError(...args) {
    console.error('[EmailJS]', ...args);
  }

  function showToast(message) {
    const toast = document.querySelector('.toast');
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');

    toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  }

  function setSendingState(button, labelEl, defaultLabel, isSending) {
    if (!button) {
      return;
    }

    button.disabled = isSending;
    button.classList.toggle('is-sending', isSending);
    button.setAttribute('aria-busy', String(isSending));

    if (labelEl) {
      labelEl.textContent = isSending ? 'Sending...' : defaultLabel;
    }
  }

  /**
   * Sends the form via emailjs.sendForm().
   * @param {HTMLFormElement} formElement - same as formRef.current in React
   * @returns {Promise<import('@emailjs/browser').EmailJSResponseStatus>}
   */
  async function sendEmail(formElement) {
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS SDK failed to load. Check the script tag in index.html.');
    }

    if (!CONFIG?.publicKey || !CONFIG?.serviceId || !CONFIG?.templateId) {
      throw new Error('EmailJS config is missing. Check assets/js/email-config.js');
    }

    log('Sending email...', {
      serviceId: CONFIG.serviceId,
      templateId: CONFIG.templateId,
      fields: {
        from_name: formElement.from_name?.value,
        from_email: formElement.from_email?.value,
        message: formElement.message?.value,
      },
    });

    const response = await emailjs.sendForm(
      CONFIG.serviceId,
      CONFIG.templateId,
      formElement,
      CONFIG.publicKey,
    );

    log('Success response:', {
      status: response?.status,
      text: response?.text,
    });

    return response;
  }

  function bindContactForm() {
    if (isBound) {
      log('Form handler already bound, skipping.');
      return;
    }

    /** @type {HTMLFormElement | null} */
    const formRef = document.getElementById('contact-form');

    if (!formRef) {
      logError('Form #contact-form not found in DOM.');
      return;
    }

    if (typeof emailjs === 'undefined') {
      logError('EmailJS SDK not loaded. Add the CDN script before this file.');
      return;
    }

    emailjs.init({ publicKey: CONFIG.publicKey });
    log('SDK initialized with public key:', CONFIG.publicKey);

    const submitButton = formRef.querySelector('.send-button');
    const labelEl = submitButton?.querySelector('.send-button-label');
    const defaultLabel = labelEl?.textContent?.trim() || 'Send Message';

    formRef.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      log('Submit intercepted — page refresh prevented.');

      if (!formRef.checkValidity()) {
        formRef.reportValidity();
        log('Validation failed — submission stopped.');
        return;
      }

      setSendingState(submitButton, labelEl, defaultLabel, true);

      try {
        const response = await sendEmail(formRef);

        if (response?.status !== 200) {
          throw new Error(`Unexpected status: ${response?.status} — ${response?.text}`);
        }

        formRef.reset();
        showToast(SUCCESS_MESSAGE);
        log('Form cleared after successful send.');
      } catch (error) {
        logError('Error response:', error);
        logError('Status:', error?.status);
        logError('Message:', error?.text || error?.message);

        showToast(ERROR_MESSAGE);
      } finally {
        setSendingState(submitButton, labelEl, defaultLabel, false);
      }
    });

    submitButton?.addEventListener('click', () => {
      log('Send button clicked — submit event will fire next.');
    });

    isBound = true;
    log('Contact form connected to EmailJS sendForm().');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindContactForm);
  } else {
    bindContactForm();
  }
})();
