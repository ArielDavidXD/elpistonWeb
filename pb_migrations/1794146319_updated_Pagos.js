/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3491535888")

  // update collection data
  unmarshal({
    "name": "pagos"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3491535888")

  // update collection data
  unmarshal({
    "name": "Pagos"
  }, collection)

  return app.save(collection)
})
