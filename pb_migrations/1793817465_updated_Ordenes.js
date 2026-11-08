/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_185828924")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "deleteRule": "@request.auth.rol = \"dueno\"",
    "listRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || mecanico = @request.auth.id",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || (mecanico = @request.auth.id && @request.body.mecanico:isset = false)",
    "viewRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || mecanico = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_185828924")

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
