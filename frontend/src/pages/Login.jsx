import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField';
import useFocusFirstInvalid from '../hooks/useFocusFirstInvalid';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { hasErrors, validateEmail } from '../utils/validators';

export default function Login() {
  usePageTitle('Sign in');
  const { login } = useAuth();
  const toast = useToast();

  // Controlled form: React state is the single source of truth for each input
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  useFocusFirstInvalid(errors);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default full-page form submit

    const found = {
      email: validateEmail(form.email),
      password: form.password ? '' : 'Password is required',
    };
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    setFormError('');
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      // No navigate() needed: <GuestRoute> notices the user is now logged in
      // and redirects them to the page they were trying to reach.
    } catch (err) {
      setFormError(err.message); // e.g. "Invalid email or password"
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="nova-card nova-card-pad">
          <h1>Sign in</h1>
          <p className="text-muted-nova mb-4">Welcome back. Pick up where you left off.</p>

          {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <FormField id="email" name="email" type="email" label="Email" autoComplete="email"
              value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
            <FormField id="password" name="password" type="password" label="Password" autoComplete="current-password"
              value={form.password} onChange={handleChange} error={errors.password} />
            <button type="submit" className="btn btn-nova-primary w-100 mt-2" disabled={submitting}>
              {submitting ? <LoadingSpinner inline label="Signing in" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-muted-nova mt-4 mb-0">
            New to NOVA? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
