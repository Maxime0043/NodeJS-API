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

/**
 * Ajouter une tâche
 */
app.post("/api/taches", async (req, res) => {
  const payload = req.body;

  // validation
  const schema = joi.object({
    description: joi.string().min(5).max(50).required(),
    faite: joi.boolean().required(),
  });
  const { value, error } = schema.validate(payload);

  // Erreur => Renvoie erreur
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  } else {
    // Ajout valeur dans base de données
    let tache = new Tache(value);
    tache = await tache.save();

    // Renvoie objet créé
    res.status(201).json(tache);
  }
});

module.exports = app;
