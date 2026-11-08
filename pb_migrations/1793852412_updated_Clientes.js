/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3922083224")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\"",
    "deleteRule": "@request.auth.rol = \"dueno\"",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"dueno\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3922083224")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"duenno\"",
    "deleteRule": "@request.auth.rol = \"duenno\"",
    "updateRule": "@request.auth.rol = \"recepcion\" || @request.auth.rol = \"duenno\""
  }, collection)

  return app.save(collection)
})
