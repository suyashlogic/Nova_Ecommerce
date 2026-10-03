import * as wishlistService from '../services/wishlistService.js';

export async function list(req, res) {
  const products = await wishlistService.getWishlist(req.user.id);
  res.json({ status: 'success', products });
}

export async function add(req, res) {
  const productId = Number(req.body.productId);
  await wishlistService.addToWishlist(req.user.id, productId);
  res.status(201).json({ status: 'success', productId });
}

export async function remove(req, res) {
  const productId = Number(req.params.productId);
  await wishlistService.removeFromWishlist(req.user.id, productId);
  res.json({ status: 'success', productId });
}
