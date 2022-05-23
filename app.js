// Validation
const joi = require("joi");
const bcrypt = require("bcrypt");
const ObjectID = require("mongoose").Types.ObjectId;

// Express + async errors
const express = require("express");
require("express-async-errors"); // bcrypt est asynchrone
const app = express();

// JWT + dotenv + vérification de la présence d'une variable d'environnement
const jwt = require("jsonwebtoken");
require("dotenv").config();
if (!process.env.JWT_PRIVATE_KEY) {
  console.log(
    "Vous devez créer un fichier .env qui contient la variable JWT_PRIVATE_KEY"
  );
  process.exit(1);
}

// Base de données
require("./database/connection");
const { Tache } = require("./database/models/Tache.model");

// Middleware

// On va avoir besoin de parser le json entrant dans req.body
app.use(express.json());

const verifyId = async (req, res, next) => {
  const params = req.params;
  let id = params.id;

  // Vérification
  if (ObjectID.isValid(id)) {
    const tache = await Tache.findById(id);

    if (tache) next();
    else res.status(400).json({ error: "Id must exists !" });
  }

  // Sinon
  else {
    res.status(400).json({ error: "Id must exists !" });
  }
};

// ROUTES

/**
 * Lister toutes les tâches
 */
app.get("/api/taches", async (req, res) => {
  const taches = await Tache.find({});
  res.status(200).json(taches);
});

/**
 * Détailler une tâche
 */
app.get("/api/taches/:id", [verifyId], async (req, res) => {
  const tache = await Tache.findById(req.params.id);
  res.status(200).json(tache);
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

/**
 * Mise à jour d'une tâche
 */
app.put("/api/taches/:id", [verifyId], async (req, res) => {
  const id = req.params.id;
  const payload = req.body;

  // validation
  const schema = joi.object({
    description: joi.string().min(5).max(50),
    faite: joi.boolean(),
  });
  const { value, error } = schema.validate(payload);

  // Erreur => Renvoie erreur
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  } else {
    // Ajout valeur dans base de données
    let tache = await Tache.findByIdAndUpdate(id, value);
    tache = await Tache.findById(tache._id);
    // Renvoie objet créé
    res.status(200).json(tache);
  }
});

/**
 * Suppression d'une tâche
 */
app.delete("/api/taches/:id", [verifyId], async (req, res) => {
  const id = req.params.id;
  const tache = await Tache.findByIdAndDelete(id);

  res.status(200).json(tache);
});

module.exports = app;
