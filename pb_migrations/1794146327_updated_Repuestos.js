/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2713917805")

  // update collection data
  unmarshal({
    "name": "repuestos"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2713917805")

  // update collection data
  unmarshal({
    "name": "Repuestos"
  }, collection)

  return app.save(collection)
})
