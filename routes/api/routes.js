const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

const Routes = require("../../models/Routes");
const Provinces = require("../../models/Provinces");

const auth = require("../../middleware/auth");

// @route   GET api/routes
// @desc    Get all routes
// @access  Public
router.get("/", async (req, res) => {
  try {
    const _result = await Routes.find()
      .sort({ date: -1 })
      .populate("destination_province", ["name"])
      .populate("origin_province", ["name"]);

    res.json(_result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// @route   GET api/routes/:id
// @desc    Get by id routes
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const _result = await Routes.findOne({ _id: req.params.id });
    res.json(_result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// @route   POST api/routes
// @desc    save the routes
// @access  Public
router.post(
  "/",
  [
    check("name", "Nombre es requerido")
      .not()
      .isEmpty(),
    check("origin_province", "La provincia origen es requerido")
      .not()
      .isEmpty(),
    check("destination_province", "La provincia destino es requerido")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      _id,
      name,
      origin_province,
      destination_province,
      active,
      stations
    } = req.body;

    const routeFields = {
      _id,
      name,
      origin_province,
      destination_province,
      active,
      stations
    };

    try {
      let _route = new Routes(routeFields);
      await _route.save();
      return res.json(_route);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST api/routes/:id
// @desc    update routes
// @access  Public
router.put(
  "/:id",
  [
    auth,
    [
      check("name", "Nombre es requerido")
        .not()
        .isEmpty(),
      check("origin_province", "La provincia origen es requerido")
        .not()
        .isEmpty(),
      check("destination_province", "La provincia destino es requerido")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const {
      name,
      origin_province,
      destination_province,
      active,
      stations
    } = req.body;

    try {
      let _route = await Routes.findOne({ _id: req.params.id });
      if (_route) {
        _route.name = name;
        _route.origin_province = origin_province;
        _route.destination_province = destination_province;
        _route.active = active;
        _route.stations = stations;
        res.json(_route);
      } else {
        res.status(400).json({
          errors: [
            {
              msg:
                "Ups hubo un error al intentar actualizar la información de la ruta"
            }
          ]
        });
      }
    } catch (err) {
      console.log(err.message);
      return res.status(500).send("Server error");
    }
  }
);

router.delete("/:id", auth, async (req, res) => {
  try {
    const _result = await Routes.findById(req.params.id);

    if (!_result) {
      return res.status(404).json({ msg: "La ruta no existe" });
    }

    await _result.remove();

    res.json({ msg: "Ruta eliminada" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Ruta no existe" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
