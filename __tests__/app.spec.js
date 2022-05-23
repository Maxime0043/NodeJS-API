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

  test("GET /api/taches/628b731ff7222c461f80e0fd - Retourne le détail de la tâche et renvoie 200", async () => {
    const id = "628b731ff7222c461f80e0fd";

    const res = await request(app)
      .get("/api/taches/" + id)
      .expect(200)
      .expect("content-type", /json/);

    // On doit procéder de la sorte pour récupérer seulement le texte du paramètre _id
    // Exemple : _id: new ObjectID("identifiant") => _id: "identifiant"
    const tache = JSON.parse(JSON.stringify(await Tache.findById(id)));
    expect(JSON.parse(res.text)).toMatchObject(tache);
  });

  test("GET /api/taches/Z67D58Z67Q987D89 - Récupération d'une tâche innexistante et renvoie 400", async () => {
    const id = "Z67D58Z67Q987D89";

    const res = await request(app)
      .get("/api/taches/" + id)
      .expect(400)
      .expect("content-type", /json/);
  });

  test("POST /api/taches - Ajoute une tache dans la base de données et renvoie 201", async () => {
    const tache = {
      description: "description test",
      faite: true,
    };

    const res = await request(app)
      .post("/api/taches")
      .send(tache)
      .expect(201)
      .expect("content-type", /json/);

    expect(JSON.parse(res.text)).toMatchObject(tache);
  });

  test.each([
    { description: "bla" },
    { faite: false },
    { description: "bla", faite: false },
  ])(
    "POST /api/taches - Ajoute une tache avec des données invalide et renvoie erreur 400 -> %p",
    async (tache) => {
      const res = await request(app)
        .post("/api/taches")
        .send(tache)
        .expect(400)
        .expect("content-type", /json/);
    }
  );
});
