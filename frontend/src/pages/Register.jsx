import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField';
import useFocusFirstInvalid from '../hooks/useFocusFirstInvalid';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { hasErrors, validateEmail, validateName, validatePassword } from '../utils/validators';

export default function Register() {
  usePageTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  useFocusFirstInvalid(errors);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();

    const found = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: form.confirm === form.password ? '' : 'Passwords do not match',
    };
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    setFormError('');
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(`Welcome to NOVA, ${user.name.split(' ')[0]}`);
    } catch (err) {
      // 409 = email already registered. Show it under the email field.
      if (err.status === 409) setErrors({ email: err.message });
      else if (Object.keys(err.fieldErrors ?? {}).length) setErrors(err.fieldErrors); // 422 from the server
      else setFormError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="nova-card nova-card-pad">
          <h1>Create account</h1>
          <p className="text-muted-nova mb-4">Save your cart, track orders and check out faster.</p>

          {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <FormField id="name" name="name" label="Full name" autoComplete="name"
              value={form.name} onChange={handleChange} error={errors.name} />
            <FormField id="email" name="email" type="email" label="Email" autoComplete="email"
              value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
            <FormField id="password" name="password" type="password" label="Password" autoComplete="new-password"
              value={form.password} onChange={handleChange} error={errors.password}
              hint="8 or more characters, with at least one letter and one number." />
            <FormField id="confirm" name="confirm" type="password" label="Confirm password" autoComplete="new-password"
              value={form.confirm} onChange={handleChange} error={errors.confirm} />
            <button type="submit" className="btn btn-nova-primary w-100 mt-2" disabled={submitting}>
              {submitting ? <LoadingSpinner inline label="Creating account" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-muted-nova mt-4 mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
