/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2713917805")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"duenno\"",
    "deleteRule": "@request.auth.rol = \"duenno\"",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"duenno\" || (@request.auth.rol = \"mecanico\" && @request.body.nombre:isset = false && @request.body.codigo:isset = false && @request.body.precio:isset = false && @request.body.stock_minimo:isset = false)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2713917805")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "deleteRule": "@request.auth.rol = \"dueno\"",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || (@request.auth.rol = \"mecanico\" && @request.body.nombre:isset = false && @request.body.codigo:isset = false && @request.body.precio:isset = false && @request.body.stock_minimo:isset = false)"
  }, collection)

  return app.save(collection)
})
