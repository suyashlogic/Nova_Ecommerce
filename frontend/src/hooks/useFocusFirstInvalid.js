import { useEffect } from 'react';

// When a form is submitted with mistakes, move the keyboard (and screen reader) focus to the
// first invalid field. Otherwise the error appears somewhere on screen and nothing tells the
// user. `errors` is the { fieldName: message } object each form already keeps in state.
export default function useFocusFirstInvalid(errors) {
  useEffect(() => {
    if (!errors || !Object.values(errors).some(Boolean)) return undefined;
    // Wait one frame so the inputs have re-rendered with their invalid state
    const frame = requestAnimationFrame(() => {
      document.querySelector('.is-invalid, [aria-invalid="true"]')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [errors]);
}
