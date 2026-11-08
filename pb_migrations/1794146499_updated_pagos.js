/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3491535888")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "deleteRule": "@request.auth.rol = \"dueno\"",
    "listRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || orden.mecanico = @request.auth.id",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "viewRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\" || orden.mecanico = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3491535888")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
