/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3147372535")

  // update collection data
  unmarshal({
    "name": "uso_repuestos"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3147372535")

  // update collection data
  unmarshal({
    "name": "uso_repuesto"
  }, collection)

  return app.save(collection)
})
