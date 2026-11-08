/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2713917805")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "deleteRule": "@request.auth.rol = \"dueno\"",
    "listRule": "",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || (@request.auth.rol = \"mecanico\" && @request.body.nombre:isset = false && @request.body.codigo:isset = false && @request.body.precio:isset = false && @request.body.stock_minimo:isset = false)",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2713917805")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
