const { Pool } = require("pg");
require("dotenv").config();
const format = require("pg-format");
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  allowExitOnIdle: true,
});

const agregarJoya = async (nombre, categoria, metal, precio, stock) => {
  try {
    const consulta = "INSERT INTO inventario (nombre, categoria, metal, precio, stock) VALUES ($1, $2, $3, $4, $5)";
    const values = [nombre, categoria, metal, precio, stock];
    await pool.query(consulta, values);
    console.log("Producto agregado");
  } catch (error) {
    console.error("Error agregando joya:", error.message);
    throw error;
  }
};

const agregarJoyas = async (joyas) => {
  const consulta = "INSERT INTO inventario (nombre, categoria, metal, precio, stock) VALUES ($1, $2, $3, $4, $5)";
  for (const joya of joyas) {
    const { nombre, categoria, metal, precio, stock } = joya;
    const values = [nombre, categoria, metal, precio, stock];
    try {
      await pool.query(consulta, values);
      console.log(`Producto agregado: ${nombre}`);
    } catch (error) {
      console.error(`Error agregando producto ${nombre}:`, error.message);
    }
  }
};

const obtenerJoyas = async ({ limit = 3, order_by = "stock_ASC", page = 2 }) => {
  try {
    const [nombre, direction] = order_by.split("_");
    const offset = (Math.abs(page) - 1) * Math.abs(limit);

    // Validate limit
    if (isNaN(limit) || limit <= 0) {
      throw new Error("Invalid limit value");
    }

    // Validate order_by
    const validDirections = ["ASC", "DESC"];
    const validColumns = ["id", "nombre", "categoria", "metal", "precio", "stock"];
    if (!validDirections.includes(direction.toUpperCase())) {
      throw new Error("Invalid order direction");
    }
    if (!validColumns.includes(nombre)) {
      throw new Error("Invalid column name");
    }

    // Validate page
    if (isNaN(page) || page <= 0) {
      throw new Error("Invalid page value");
    }

    const formattedQuery = format(
      "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
      nombre,
      direction,
      Math.abs(limit),
      offset
    );
    const { rows: joyas } = await pool.query(formattedQuery);
    return joyas;
  } catch (error) {
    console.error("Error obteniendo joyas:", error.message);
    throw error;
  }
};

const modificarJoya = async (id, nombre, categoria, metal, precio, stock) => {
  try {
    const consulta = "UPDATE inventario SET nombre = $2, categoria = $3, metal = $4, precio = $5, stock = $6 WHERE id = $1";
    const values = [id, nombre, categoria, metal, precio, stock];
    const { rowCount } = await pool.query(consulta, values);
    if (rowCount === 0) {
      throw { code: 404, message: "No se consiguió ninguna joya con este id" };
    }
  } catch (error) {
    console.error("Error modificando joya:", error.message);
    throw error;
  }
};

const eliminarJoya = async (id) => {
  try {
    const consulta = "DELETE FROM inventario WHERE id = $1";
    const values = [id];
    await pool.query(consulta, values);
  } catch (error) {
    console.error("Error eliminando joya:", error.message);
    throw error;
  }
};

const obtenerJoyasPorFiltros = async ({ precio_max, precio_min, categoria, metal, stock_max, stock_min }) => {
  try {
    let filtros = [];
    const values = [];

    if (precio_max) {
      filtros.push(`precio <= $${filtros.length + 1}`);
      values.push(precio_max);
    }
    if (precio_min) {
      filtros.push(`precio >= $${filtros.length + 1}`);
      values.push(precio_min);
    }
    if (categoria) {
      filtros.push(`categoria = $${filtros.length + 1}`);
      values.push(categoria);
    }
    if (metal) {
      filtros.push(`metal = $${filtros.length + 1}`);
      values.push(metal);
    }
    if (stock_max) {
      filtros.push(`stock <= $${filtros.length + 1}`);
      values.push(stock_max);
    }
    if (stock_min) {
      filtros.push(`stock >= $${filtros.length + 1}`);
      values.push(stock_min);
    }

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
      consulta += ` WHERE ${filtros.join(" AND ")}`;
    }

    const { rows: inventario } = await pool.query(consulta, values);
    return inventario;
  } catch (error) {
    console.error("Error obteniendo joyas por filtros:", error.message);
    throw error;
  }
};

const prepararHATEOAS = (joyas) => {
  const results = joyas
    .map((m) => {
      return {
        name: m.nombre,
        href: `/joyas/joya/${m.id}`,
      };
    })
    .slice(0, 3);
  const totalJoyas = joyas.length;
  const stockTotal = joyas.reduce((acc, cur) => acc + cur.stock, 0);
  const HATEOAS = {
    totalJoyas,
    stockTotal,
    results,
  };
  return HATEOAS;
};

module.exports = {
  agregarJoya,
  agregarJoyas,
  obtenerJoyas,
  modificarJoya,
  eliminarJoya,
  obtenerJoyasPorFiltros,
  prepararHATEOAS,
};
