import * as cartService from '../services/cartService.js';

const sendCart = (res, cart, statusCode = 200) => res.status(statusCode).json({ status: 'success', cart });

// Keep only the two fields we need and force them to numbers
const readLines = (items) =>
  items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) }));

export async function getCart(req, res) {
  sendCart(res, await cartService.getCartView(req.user.id));
}

export async function addItem(req, res) {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(req.user.id, Number(productId), Number(quantity ?? 1));
  sendCart(res, cart, 201);
}

export async function updateItem(req, res) {
  const cart = await cartService.updateQuantity(
    req.user.id,
    Number(req.params.itemId),
    Number(req.body.quantity)
  );
  sendCart(res, cart);
}

export async function removeItem(req, res) {
  sendCart(res, await cartService.removeItem(req.user.id, Number(req.params.itemId)));
}

export async function mergeCart(req, res) {
  sendCart(res, await cartService.mergeGuestCart(req.user.id, readLines(req.body.items)));
}

export async function previewCart(req, res) {
  sendCart(res, await cartService.previewCart(readLines(req.body.items)));
}
