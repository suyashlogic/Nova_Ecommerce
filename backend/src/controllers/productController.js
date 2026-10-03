import * as productService from '../services/productService.js';
import parseSpecs from '../utils/parseSpecs.js';
import {
  PRODUCT_URL_PREFIX,
  deleteFileAtPath,
  deleteProductImageByUrl,
} from '../utils/files.js';

// IMPORTANT (Express 5): req.query is re-parsed on every access, so express-validator
// sanitizers like .toInt() cannot change it. Validators check the query; we convert here.
function toNumber(value) {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function list(req, res) {
  const q = req.query;
  const result = await productService.listProducts({
    search: q.search?.trim() || undefined,
    category: q.category || undefined,
    minPrice: toNumber(q.minPrice),
    maxPrice: toNumber(q.maxPrice),
    sort: q.sort || 'newest',
    page: Math.max(1, Math.floor(toNumber(q.page) ?? 1)),
    limit: Math.min(50, Math.max(1, Math.floor(toNumber(q.limit) ?? 12))),
    featured: q.featured === 'true',
    inStock: q.inStock === 'true',
  });
  res.json({ status: 'success', ...result });
}

export async function getOne(req, res) {
  const detail = await productService.getProductDetail(Number(req.params.id));
  res.json({ status: 'success', ...detail });
}

// Pick and convert fields explicitly. Multipart forms deliver everything as strings.
function readProductBody(body) {
  return {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    discountPercent: Number(body.discountPercent ?? 0),
    stock: Number(body.stock),
    categoryId: Number(body.categoryId),
    specs: parseSpecs(body.specs),
    isFeatured: body.isFeatured === true || body.isFeatured === 'true',
  };
}

const imageUrlFor = (file) => (file ? `${PRODUCT_URL_PREFIX}${file.filename}` : null);

export async function create(req, res) {
  try {
    const product = await productService.createProduct(
      readProductBody(req.body),
      imageUrlFor(req.file)
    );
    res.status(201).json({ status: 'success', product });
  } catch (err) {
    await deleteFileAtPath(req.file?.path); // don't keep an image for a product that failed
    throw err;
  }
}

export async function update(req, res) {
  try {
    const { product, previousImageUrl } = await productService.updateProduct(
      Number(req.params.id),
      readProductBody(req.body),
      imageUrlFor(req.file)
    );
    if (req.file) await deleteProductImageByUrl(previousImageUrl); // remove the replaced image
    res.json({ status: 'success', product });
  } catch (err) {
    await deleteFileAtPath(req.file?.path);
    throw err;
  }
}

export async function updateStock(req, res) {
  const product = await productService.updateStock(Number(req.params.id), Number(req.body.stock));
  res.json({ status: 'success', product });
}

export async function remove(req, res) {
  const imageUrl = await productService.deleteProduct(Number(req.params.id));
  await deleteProductImageByUrl(imageUrl);
  res.json({ status: 'success', message: 'Product deleted' });
}
