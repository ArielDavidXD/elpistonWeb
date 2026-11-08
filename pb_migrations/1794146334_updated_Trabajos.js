/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1109314274")

  // update collection data
  unmarshal({
    "name": "trabajos"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1109314274")

  // update collection data
  unmarshal({
    "name": "Trabajos"
  }, collection)

  return app.save(collection)
})
