/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"dueno\"",
    "deleteRule": "@request.auth.rol = \"dueno\"",
    "updateRule": "(id = @request.auth.id && @request.body.rol:isset = false) || @request.auth.rol = \"dueno\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"duenno\"",
    "deleteRule": "@request.auth.rol = \"duenno\"",
    "updateRule": "(id = @request.auth.id && @request.body.rol:isset = false) || @request.auth.rol = \"duenno\""
  }, collection)

  return app.save(collection)
})
