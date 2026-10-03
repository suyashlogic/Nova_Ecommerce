import * as categoryService from '../services/categoryService.js';

export async function list(req, res) {
  const categories = await categoryService.listCategories();
  res.json({ status: 'success', categories });
}
