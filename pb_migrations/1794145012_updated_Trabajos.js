/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1109314274")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_185828924",
    "help": "",
    "hidden": false,
    "id": "relation2593287892",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "orden",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1109314274")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_185828924",
    "help": "",
    "hidden": false,
    "id": "relation2593287892",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "trabajos_ordenes",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
