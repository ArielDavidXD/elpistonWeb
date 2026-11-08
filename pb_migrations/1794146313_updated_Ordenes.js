/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_185828924")

  // update collection data
  unmarshal({
    "name": "ordenes"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_185828924")

  // update collection data
  unmarshal({
    "name": "Ordenes"
  }, collection)

  return app.save(collection)
})
