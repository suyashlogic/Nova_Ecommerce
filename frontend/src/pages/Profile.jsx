import { useState } from 'react';
import FormField from '../components/FormField';
import useFocusFirstInvalid from '../hooks/useFocusFirstInvalid';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { hasErrors, validateName } from '../utils/validators';

// null from the database becomes '' so inputs stay "controlled"
const orEmpty = (value) => value ?? '';

export default function Profile() {
  usePageTitle('Your profile');
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: orEmpty(user.name),
    phone: orEmpty(user.phone),
    addressLine1: orEmpty(user.addressLine1),
    addressLine2: orEmpty(user.addressLine2),
    city: orEmpty(user.city),
    state: orEmpty(user.state),
    postalCode: orEmpty(user.postalCode),
    country: orEmpty(user.country),
  });
  const [errors, setErrors] = useState({});
  useFocusFirstInvalid(errors);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();

    const found = { name: validateName(form.name) };
    setErrors(found);
    if (hasErrors(found)) return;

    setSaving(true);
    setFormError('');
    try {
      await updateProfile(form);
      toast.success('Profile saved');
    } catch (err) {
      if (Object.keys(err.fieldErrors ?? {}).length) setErrors(err.fieldErrors);
      else setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page-section" style={{ maxWidth: 760 }}>
      <h1 className="page-title">Your profile</h1>
      <p className="page-subtitle">Your saved details pre-fill the checkout form.</p>

      <div className="nova-card nova-card-pad">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6">
              <FormField id="name" name="name" label="Full name" value={form.name} onChange={handleChange} error={errors.name} />
            </div>
            <div className="col-md-6">
              <FormField id="email" label="Email" value={user.email} readOnly disabled hint="Email cannot be changed." />
            </div>
            <div className="col-md-6">
              <FormField id="phone" name="phone" type="tel" label="Phone" value={form.phone} onChange={handleChange} error={errors.phone} />
            </div>
          </div>

          <hr className="my-4" />
          <h2 className="h5 mb-3">Default shipping address</h2>

          <FormField id="addressLine1" name="addressLine1" label="Address line 1" value={form.addressLine1} onChange={handleChange} error={errors.addressLine1} />
          <FormField id="addressLine2" name="addressLine2" label="Address line 2 (optional)" value={form.addressLine2} onChange={handleChange} error={errors.addressLine2} />
          <div className="row">
            <div className="col-md-6"><FormField id="city" name="city" label="City" value={form.city} onChange={handleChange} error={errors.city} /></div>
            <div className="col-md-6"><FormField id="state" name="state" label="State" value={form.state} onChange={handleChange} error={errors.state} /></div>
            <div className="col-md-6"><FormField id="postalCode" name="postalCode" label="Postal code" value={form.postalCode} onChange={handleChange} error={errors.postalCode} /></div>
            <div className="col-md-6"><FormField id="country" name="country" label="Country" value={form.country} onChange={handleChange} error={errors.country} /></div>
          </div>

          <button type="submit" className="btn btn-nova-primary mt-2" disabled={saving}>
            {saving ? <LoadingSpinner inline label="Saving" /> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
