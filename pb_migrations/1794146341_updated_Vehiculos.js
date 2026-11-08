/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1679032476")

  // update collection data
  unmarshal({
    "name": "vehiculos"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1679032476")

  // update collection data
  unmarshal({
    "name": "Vehiculos"
  }, collection)

  return app.save(collection)
})
