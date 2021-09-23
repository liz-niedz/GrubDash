const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];

function resultStatusIsValid(request, response, next) {
  const { data: { status } = {} } = request.body;
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: `Value of the 'status' property must be one of ${validStatus}. Received: ${status}`,
  });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}.`,
  });
}
function bodyHasDeliverTo(request, response, next) {
  const {
    data: { deliverTo },
  } = request.body;
  if (deliverTo) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}
function bodyHasMobileNumber(request, response, next) {
  const {
    data: { mobileNumber },
  } = request.body;
  if (mobileNumber) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}
function bodyHasDishes(request, response, next) {
  const {
    data: { dishes },
  } = request.body;
  if (Array.isArray(dishes) === true && dishes.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a dish",
  });
}
function bodyHasQuantity(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  dishes.forEach((dish, index) => {
    const quantity = dish.quantity;
    if (!quantity || quantity <= 0 || typeof quantity !== "number") {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}

function create(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
  };
  console.log(newOrder);
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.json({ data: foundOrder });
}

function list(req, res) {
  const { orderId } = req.params;
  const byResult = orderId ? (order) => order.id === orderId : () => true;
  res.json({ data: orders.filter(byResult) });
}

function update(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const {
    data: { id, deliverTo, mobileNumber, status, dishes },
  } = req.body;
  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
  const updatedOrder = {
    id: orderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  res.json({ data: updatedOrder });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasQuantity,
    create,
  ],
  list,
  read: [orderExists, read],
  update: [
    orderExists,
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasQuantity,
    resultStatusIsValid,
    update,
  ],
  delete: [orderExists, destroy],
  orderExists,
};
