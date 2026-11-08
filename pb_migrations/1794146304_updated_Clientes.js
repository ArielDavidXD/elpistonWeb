/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3922083224")

  // update collection data
  unmarshal({
    "name": "clientes"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3922083224")

  // update collection data
  unmarshal({
    "name": "Clientes"
  }, collection)

  return app.save(collection)
})
