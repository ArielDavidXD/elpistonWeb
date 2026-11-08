/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3147372535")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || @request.body.orden.mecanico = @request.auth.id",
    "deleteRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "listRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || orden.mecanico = @request.auth.id",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || orden.mecanico = @request.auth.id",
    "viewRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || orden.mecanico = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3147372535")

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
