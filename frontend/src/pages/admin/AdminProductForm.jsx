import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormField from '../../components/FormField';
import useFocusFirstInvalid from '../../hooks/useFocusFirstInvalid';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import Skeleton from '../../components/Skeleton';
import useFetch from '../../hooks/useFetch';
import usePageTitle from '../../hooks/usePageTitle';
import useToast from '../../hooks/useToast';
import { getProduct } from '../../services/productService';
import { listCategories } from '../../services/categoryService';
import { createProduct, updateProduct } from '../../services/adminProductService';
import imageUrl from '../../utils/imageUrl';

const MAX_IMAGE_MB = 2; // keep in step with MAX_UPLOAD_MB in backend/.env
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validate(form, file) {
  const errors = {};
  const nameLength = form.name.trim().length;
  const descLength = form.description.trim().length;
  if (nameLength < 2 || nameLength > 200) errors.name = 'Name must be 2 to 200 characters';
  if (descLength < 10 || descLength > 5000) errors.description = 'Description must be 10 to 5000 characters';
  if (!(Number(form.price) > 0)) errors.price = 'Price must be greater than 0';
  if (!/^\d+$/.test(form.discountPercent) || Number(form.discountPercent) > 90) errors.discountPercent = 'Discount must be a whole number from 0 to 90';
  if (!/^\d+$/.test(form.stock)) errors.stock = 'Stock must be a whole number, 0 or more';
  if (!form.categoryId) errors.categoryId = 'Choose a category';
  if (file) {
    if (!IMAGE_TYPES.includes(file.type)) errors.image = 'Use a JPG, PNG or WebP image';
    else if (file.size > MAX_IMAGE_MB * 1024 * 1024) errors.image = `Image must be under ${MAX_IMAGE_MB} MB`;
  }
  return errors;
}

// The form itself. It receives its starting values as props, so no "sync state from data" effects are needed.
function ProductFormFields({ product, categories }) {
  const isEdit = Boolean(product);
  const navigate = useNavigate();
  const toast = useToast();
  usePageTitle(isEdit ? 'Edit product | Admin' : 'New product | Admin');

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    discountPercent: product ? String(product.discountPercent) : '0',
    stock: product ? String(product.stock) : '',
    categoryId: product ? String(product.category.id) : '',
    isFeatured: product?.isFeatured ?? false,
  });
  const [specRows, setSpecRows] = useState(() => {
    const rows = Object.entries(product?.specs ?? {}).map(([name, value]) => ({ name, value }));
    return rows.length > 0 ? rows : [{ name: '', value: '' }];
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  useFocusFirstInvalid(errors);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Local preview of the chosen file. The browser URL is released when it is replaced.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };
  const updateSpec = (index, field, value) =>
    setSpecRows(specRows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate(form, file);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Blank spec rows are ignored; the rest become a { name: value } object
    const specs = Object.fromEntries(
      specRows.filter((r) => r.name.trim() && r.value.trim()).map((r) => [r.name.trim(), r.value.trim()])
    );

    // FormData is how a browser sends text fields AND a file together
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('description', form.description.trim());
    body.append('price', form.price);
    body.append('discountPercent', form.discountPercent);
    body.append('stock', form.stock);
    body.append('categoryId', form.categoryId);
    body.append('isFeatured', String(form.isFeatured));
    body.append('specs', JSON.stringify(specs));
    if (file) body.append('image', file);

    setSaving(true);
    setFormError('');
    try {
      if (isEdit) await updateProduct(product.id, body);
      else await createProduct(body);
      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      if (Object.keys(err.fieldErrors ?? {}).length > 0) setErrors(err.fieldErrors);
      else setFormError(err.message);
      setSaving(false);
    }
  }

  const currentImage = previewUrl ?? (product?.imageUrl ? imageUrl(product.imageUrl) : null);

  return (
    <>
      <Link to="/admin/products" className="text-muted-nova small">&larr; All products</Link>
      <h1 className="admin-title mt-1">{isEdit ? 'Edit product' : 'Add product'}</h1>

      <form onSubmit={handleSubmit} noValidate className="admin-card admin-form">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

        <div className="row g-4">
          <div className="col-lg-8">
            <FormField id="name" name="name" label="Product name" value={form.name} onChange={handleChange} error={errors.name} />

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" name="description" rows={5} className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                value={form.description} onChange={handleChange} aria-invalid={Boolean(errors.description)} />
              {errors.description && <div className="field-error">{errors.description}</div>}
            </div>

            <div className="row">
              <div className="col-sm-6">
                <div className="mb-3">
                  <label htmlFor="categoryId" className="form-label">Category</label>
                  <select id="categoryId" name="categoryId" className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`} value={form.categoryId} onChange={handleChange}>
                    <option value="">Choose a category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <div className="field-error">{errors.categoryId}</div>}
                </div>
              </div>
              <div className="col-sm-6"><FormField id="price" name="price" type="number" min="0" step="0.01" label="Price" value={form.price} onChange={handleChange} error={errors.price} hint="Before discount and tax." /></div>
              <div className="col-sm-6"><FormField id="discountPercent" name="discountPercent" type="number" min="0" max="90" label="Discount (%)" value={form.discountPercent} onChange={handleChange} error={errors.discountPercent} /></div>
              <div className="col-sm-6"><FormField id="stock" name="stock" type="number" min="0" label="Stock (units)" value={form.stock} onChange={handleChange} error={errors.stock} /></div>
            </div>

            <div className="form-check mb-4">
              <input id="isFeatured" name="isFeatured" type="checkbox" className="form-check-input" checked={form.isFeatured} onChange={handleChange} />
              <label htmlFor="isFeatured" className="form-check-label">Featured on the homepage</label>
            </div>

            <h2 className="h6 text-uppercase text-muted-nova mb-2">Specifications</h2>
            {errors.specs && <div className="field-error mb-2">{errors.specs}</div>}
            <div className="spec-editor">
              {specRows.map((row, index) => (
                <div className="spec-row" key={index}>
                  <input className="form-control" placeholder="Name (e.g. Battery)" aria-label={`Specification ${index + 1} name`} value={row.name} onChange={(e) => updateSpec(index, 'name', e.target.value)} maxLength={60} />
                  <input className="form-control" placeholder="Value (e.g. 30 hours)" aria-label={`Specification ${index + 1} value`} value={row.value} onChange={(e) => updateSpec(index, 'value', e.target.value)} maxLength={200} />
                  <button type="button" className="btn btn-nova-outline btn-sm" onClick={() => setSpecRows(specRows.filter((_, i) => i !== index))} aria-label={`Remove specification ${index + 1}`}><Icon name="close" size={16} /></button>
                </div>
              ))}
              {specRows.length < 20 && (
                <button type="button" className="btn btn-nova-ghost btn-sm" onClick={() => setSpecRows([...specRows, { name: '', value: '' }])}>
                  <Icon name="plus" size={16} className="me-1" /> Add specification
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="form-label">Product image</div>
            <div className="image-drop">
              {currentImage ? <img src={currentImage} alt="Product preview" /> : <div className="image-drop-empty"><Icon name="upload" size={28} /><span>No image yet</span></div>}
            </div>
            <input id="image" type="file" accept={IMAGE_TYPES.join(',')} className={`form-control mt-2 ${errors.image ? 'is-invalid' : ''}`}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-label="Product image" />
            {errors.image ? <div className="field-error">{errors.image}</div> : <div className="field-hint">JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB.{isEdit && ' Leave empty to keep the current image.'}</div>}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Link to="/admin/products" className="btn btn-nova-outline">Cancel</Link>
          <button type="submit" className="btn btn-nova-primary" disabled={saving}>
            {saving ? <LoadingSpinner inline label="Saving" /> : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </>
  );
}

// Loads what the form needs (categories, and the product when editing), then renders the form.
export default function AdminProductForm() {
  const { id } = useParams();
  const categories = useFetch(listCategories, []);
  const existing = useFetch(() => (id ? getProduct(id) : Promise.resolve(null)), [id]);

  if (categories.loading || existing.loading) {
    return <div aria-hidden="true"><Skeleton height={36} width="30%" className="mb-4" /><Skeleton height={420} radius="20px" /></div>;
  }
  if (existing.error) {
    const missing = existing.error.status === 404 || existing.error.status === 422;
    return missing
      ? <EmptyState icon="search" title="Product not found" message="It may have been deleted." action={{ to: '/admin/products', label: 'Back to products' }} />
      : <ErrorState title="Unable to load this product" message={existing.error.message} onRetry={existing.reload} />;
  }
  if (categories.error) {
    return <ErrorState title="Unable to load categories" message={categories.error.message} onRetry={categories.reload} />;
  }

  return <ProductFormFields key={id ?? 'new'} product={existing.data?.product ?? null} categories={categories.data} />;
}
