/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_185828924")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1679032476",
    "help": "",
    "hidden": false,
    "id": "relation3951990288",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "vehiculo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_185828924")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1679032476",
    "help": "",
    "hidden": false,
    "id": "relation3951990288",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "ordenes_vehiculos",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
