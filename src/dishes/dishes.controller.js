const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function bodyHasNameProperty(request, response, next) {
  const { data: { name } = {} } = request.body;
  if (name) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}
function bodyHasDescription(request, response, next) {
  const { data: { description } = {} } = request.body;
  if (description) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}
function bodyHasImage(request, response, next) {
  const { data: { image_url } = {} } = request.body;
  if (image_url) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}
function bodyHasPrice(request, response, next) {
  const {
    data: { price },
  } = request.body;
  if (typeof price === "number" && price > 0) {
    return next();
  }
  if (price < 0) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }
}

function create(req, res, next) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  const { dishId } = req.params;
  const byResult = dishId ? (dish) => dish.id === dishId : () => true;
  res.json({ data: dishes.filter(byResult) });
}

function read(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: foundDish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { dishId } = req.params;
  const {
    data: { id, name, description, price, image_url },
  } = req.body;
  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  if (dish.description !== description || dish.name !== name) {
    dish.description = description;
    dish.name = name;
  }

  res.json({ data: dish });
}
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  orders.splice(index, 1);

  res.sendStatus(204);
}

module.exports = {
  create: [
    bodyHasNameProperty,
    bodyHasDescription,
    bodyHasImage,
    bodyHasPrice,
    create,
  ],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    bodyHasNameProperty,
    bodyHasDescription,
    bodyHasImage,
    bodyHasPrice,
    update,
  ],
  dishExists,
};