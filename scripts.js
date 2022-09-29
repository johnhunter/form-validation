// TODO refactor these function names

const supressInvalidEvent = (e) => e.preventDefault();

const supressInvalidSubmit = (e) => {
  if (!e.target.checkValidity()) {
    e.preventDefault();
  }
};

const extractFormData = (elements) =>
  Object.entries(elements).reduce((acc, [key, field]) => {
    if (key === field.id) {
      acc[key] = field.value;
    }
    return acc;
  }, {});

const getSubmitButton = (form) =>
  form.querySelector(
    'button:not([type=button], [type=reset]), input[type=submit]'
  );

const getErrorId = (field) => `${field.id}-error-message`;

const setFieldError = (field) => {
  const { validity, validationMessage } = field;

  resetFieldError(field);
  if (validity.valid) {
    return;
  }

  // create error message
  const errorId = getErrorId(field);
  field.insertAdjacentHTML(
    'afterend',
    `<div id="${errorId}" role="alert">${validationMessage}</div>`
  );

  // assocate with field
  field.setAttribute('aria-invalid', true);
  field.setAttribute('aria-errormessage', errorId);
};

const setInvalidFieldState = (form) =>
  form.querySelectorAll(':invalid').forEach(setFieldError);

const resetFieldError = (field) => {
  const errorId = field.getAttribute('aria-errormessage');
  if (errorId) {
    document.getElementById(errorId).remove();
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
  }
};

const resetOnFieldBlur = (e) => {
  setFieldError(e.target);
};

const resetInvalidFieldState = (form) =>
  form.querySelectorAll('[aria-invalid="true"]').forEach(resetFieldError);

export const setupForm = (form, config = {}) => {
  const submitButton = config.submitButton ?? getSubmitButton(form);

  // Use submit click as form submit event is blocked by invalid event
  const handleSubmitClick = (e) => {
    const { target } = e;

    // resetInvalidFieldState(form);
    setInvalidFieldState(form);

    if (!form.checkValidity()) {
      e.preventDefault();
      return;
    }

    if (config.onSubmit) {
      e.preventDefault();
      config.onSubmit?.(extractFormData(form.elements));
    }
  };

  form.addEventListener('invalid', supressInvalidEvent, true);
  form.addEventListener('submit', supressInvalidSubmit);
  form.addEventListener('focusout', resetOnFieldBlur);
  // TODO use delegation and allow rechecking on any button
  submitButton.addEventListener('click', handleSubmitClick);

  // return teardown function
  return () => {
    form.removeEventListener('invalid', supressInvalidEvent);
    form.removeEventListener('submit', supressInvalidSubmit);
    form.removeEventListener('focusout', resetOnFieldBlur);
    submitButton.removeEventListener('click', handleSubmitClick);
  };
};
