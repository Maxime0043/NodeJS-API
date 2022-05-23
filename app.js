// Validation
const joi = require("joi");

// Express
const express = require("express");
const app = express();

// Base de données
const { Tache } = require("./Datatable");

// On va avoir besoin de parser le json entrant dans req.body
app.use(express.json());

// ROUTES

/**
 * Lister toutes les tâches
 */
app.get("/api/taches", async (req, res) => {
  const taches = await Tache.find({});
  res.status(200).json(taches);
});

module.exports = app;
