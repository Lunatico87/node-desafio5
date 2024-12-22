const reportarConsulta = async (req, res, next) => {
  const parametros = req.query;
  const url = req.url;
  console.log(
    `Hoy ${new Date().toLocaleString()} Se ha realizado la consulta en la ruta ${url} con los parametros:`,
    parametros
  );
  next();
};

module.exports = { reportarConsulta };
