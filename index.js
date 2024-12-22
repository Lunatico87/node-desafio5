const express = require("express");
const cors = require("cors");
const {
  agregarJoya,
  obtenerJoyas,
  modificarJoya,
  eliminarJoya,
  obtenerJoyasPorFiltros,
  prepararHATEOAS,
} = require("./consultas.js");
const { reportarConsulta } = require("./report/index.js");

const app = express();
app.use(express.json());
app.use(cors());
app.listen(3000, console.log("¡Servidor encendido!"));

app.get("/joyas", reportarConsulta, async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await obtenerJoyas(queryStrings);
    const HATEOAS = await prepararHATEOAS(joyas);
    res.json(HATEOAS);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/joyas", reportarConsulta, async (req, res) => {
  try {
    const { nombre, categoria, metal, precio, stock } = req.body;
    await agregarJoya(nombre, categoria, metal, precio, stock);
    res.send("Producto generado correctamente");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.put("/joyas/:id", reportarConsulta, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, metal, precio, stock } = req.body;
    await modificarJoya(id, nombre, categoria, metal, precio, stock);
    res.status(200).send("Producto modificado con éxito");
  } catch ({ code, message }) {
    res.status(code || 500).send(message);
  }
});

app.delete("/joyas/:id", reportarConsulta, async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarJoya(id);
    res.send("Producto eliminado con éxito");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/joyas/filtros", reportarConsulta, async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await obtenerJoyasPorFiltros(queryStrings);
    res.json(joyas);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});
