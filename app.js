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
const { User } = require("./database/models/User.model");

// Middleware

// On va avoir besoin de parser le json entrant dans req.body
app.use(express.json());

const authGuard = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ error: "Vous devez vous connecter" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;

    // Le middleware a fait son boulot et peut laisser la place au suivant.
    next();
  } catch (err) {
    return res.status(400).json({ error: "Token invalide" });
  }
};

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
 * Inscription d'un utilisateur
 */
app.post("/signup", async (req, res) => {
  const payload = req.body;
  const schema = joi.object({
    username: joi.string().min(3).max(50).required(),
    email: joi.string().max(255).required().email(),
    motdepasse: joi.string().min(3).max(50).required(),
  });

  const { value: account, error } = schema.validate(payload);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Avant d'inscrire on vérifie que le compte est unique
  const found = await User.findOne({ email: account.email });
  if (found) return res.status(400).send("Please signin instead of signup !");

  // Hachage du mot de passe
  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(account.motdepasse, salt);
  account.motdepasse = passwordHashed;

  // Création du nouvel utilisateur
  const newUser = new User(account);
  newUser.save().then((account) => {
    res.status(201).json({
      username: account.name,
      email: account.email,
    });
  });
});

/**
 * Connexion d'un utilisateur
 */
app.post("/signin", async (req, res) => {
  const payload = req.body;
  const schema = joi.object({
    email: joi.string().max(255).required().email(),
    motdepasse: joi.string().min(3).max(50).required(),
  });

  const { value: connexion, error } = schema.validate(payload);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // On cherche dans la DB
  const account = await User.findOne({ email: connexion.email });
  if (!account) return res.status(400).json({ error: "Email Invalide" });

  // On doit comparer les hash
  const passwordHashed = await bcrypt.compare(
    connexion.motdepasse,
    account.motdepasse
  );
  if (!passwordHashed)
    return res.status(400).json({ error: "Mot de passe invalide" });

  // On retourne un JWT
  const token = jwt.sign({ id: account._id }, process.env.JWT_PRIVATE_KEY);
  res
    .header("x-auth-token", token)
    .status(200)
    .json({ username: account.username });
});

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
app.post("/api/taches", [authGuard], async (req, res) => {
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
app.put("/api/taches/:id", [authGuard, verifyId], async (req, res) => {
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
app.delete("/api/taches/:id", [authGuard, verifyId], async (req, res) => {
  const id = req.params.id;
  const tache = await Tache.findByIdAndDelete(id);

  res.status(200).json(tache);
});

module.exports = app;
