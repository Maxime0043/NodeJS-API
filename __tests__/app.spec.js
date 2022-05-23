const request = require("supertest");
const app = require("../app");
const { Tache } = require("../Datatable");

describe("API CRUD /api/taches", () => {
  test("GET /api/taches - Retourne la liste des taches de la base de données", async () => {
    const res = await request(app)
      .get("/api/taches")
      .expect(200)
      .expect("content-type", /json/);

    // On doit procéder de la sorte pour récupérer seulement le texte du paramètre _id
    // Exemple : _id: new ObjectID("identifiant") => _id: "identifiant"
    const taches = JSON.parse(JSON.stringify(await Tache.find({})));
    expect(JSON.parse(res.text)).toMatchObject(taches);
  });
});
