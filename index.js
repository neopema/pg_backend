require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db = false;

async function connectDB() {
  try {
    await mongoClient.connect();

    db = await mongoClient.db("pedrogeovanny");
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log(error);
  }
  //   finally {
  //     // Ensures that the client will close when you finish/error
  //     await client.close();
  //   }
}

app.get("/", async (req, res) => {
  if (!db) {
    res.status(500).send("Error: No se pudo conectar a la base de datos");
    return;
  }
  res.send("¡Backend con Node.js, Express y MongoDB Atlas funcionando!");
});

app.get("/articles", async (req, res) => {
  if (!db) {
    res.status(500).send("Error: No se pudo conectar a la base de datos");
    return;
  }
  try {
    const articles = db.collection("articles");
    // const query = { slug: "articulo-test" };
    const article = await articles.find().sort({ createdAt: -1 }).toArray();

    console.log(article);
    res.json(article);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/articles/create", async (req, res) => {
  console.log("Creando un nuevo artículo...");
  if (!db) {
    res.status(500).send("Error: No se pudo conectar a la base de datos");
    return;
  }

  const new_article = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    // const new_article = {
    //   title: "Segundo artículo de prueba",
    //   slug: "articulo-dos-para-test",
    //   summary: "Otro simple y sencillo artículo de prueba",
    //   content:
    //     "Este artículo fue creado con el fin de probar la creación de documentos con MongoDB Atlas.",
    //   image: "/images/blog/concept.jpg",
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };
    const articles_collection = db.collection("articles");
    const insertedArticle = await articles_collection.insertOne(new_article);

    res.status(204).end();
  } catch (error) {
    console.log("Error al crear artículo:", error);
    res.status(500).json(error);
  }
});

app.get("/articles/update/:slug", async (req, res) => {
  if (!db) {
    res.status(500).send("Error: No se pudo conectar a la base de datos");
    return;
  }

  try {
    const articles_update = db.collection("articles");
    const query = { slug: req.params.slug };
    const update = {
      $set: {
        title: "Segundo artículo de prueba modificado",
        slug: "articulo-dos-para-test",
        summary: "Otro simple y sencillo artículo de prueba, modificado.",
        content:
          "Este artículo fue creado con el fin de probar la creación y actualización de documentos con MongoDB Atlas.",
        image: "/images/blog/concept.jpg",
        updatedAt: new Date(),
      },
    };
    articles_update.updateOne(query, update);
    res.send("¡Artículo actualizado exitosamente!");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/articles/delete/:slug", async (req, res) => {
  if (!db) {
    res.status(500).send("Error: No se pudo conectar a la base de datos");
    return;
  }

  try {
    const articles_col = db.collection("articles");
    const query = { slug: req.params.slug };
    const result = await articles_col.deleteOne(query);

    if (result.deletedCount === 1) {
      console.log("Artículo eliminado correctamente.");
      res.send("¡Artículo eliminado exitosamente!");
    } else {
      console.log(
        "Ningún documento se encontro con el slug. 0 modificaciones."
      );
      res.send("¡No se encontró ningún artículo con ese slug para eliminar!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/articles/:slug", async (req, res) => {
  if (!db) {
    res.status(500).send("Error: No se pudo conectar a la base de datos");
    return;
  }

  if (req.params.slug == "") {
    res.status(500).send("Error: el slug no es válido");
    return;
  }
  try {
    const articles = db.collection("articles");
    const query = { slug: req.params.slug };
    const article = await articles.findOne(query);

    console.log(article);
    res.json(article);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Conectar a la base de datos y luego iniciar el servidor
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
});
