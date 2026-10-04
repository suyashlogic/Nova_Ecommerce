import * as orderService from '../services/orderService.js';

export async function create(req, res) {
  // Pick fields explicitly. Prices are NEVER read from the request: the server recalculates them.
  const { shipping, paymentMethod } = req.body;
  const orderId = await orderService.placeOrder(req.user.id, {
    shipping: {
      name: shipping.name,
      phone: shipping.phone,
      line1: shipping.line1,
      line2: shipping.line2,
      city: shipping.city,
      state: shipping.state,
      postalCode: shipping.postalCode,
      country: shipping.country,
    },
    paymentMethod,
  });
  const order = await orderService.getOrder(req.user, orderId);
  res.status(201).json({ status: 'success', order });
}

export async function list(req, res) {
  const orders = await orderService.listOrders(req.user.id);
  res.json({ status: 'success', orders });
}

export async function getOne(req, res) {
  const order = await orderService.getOrder(req.user, Number(req.params.id));
  res.json({ status: 'success', order });
}

export async function cancel(req, res) {
  const order = await orderService.cancelOrder(req.user, Number(req.params.id));
  res.json({ status: 'success', order });
}
