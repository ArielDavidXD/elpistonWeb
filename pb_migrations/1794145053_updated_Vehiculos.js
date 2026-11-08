/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1679032476")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3922083224",
    "help": "",
    "hidden": false,
    "id": "relation1524196506",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "cliente",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1679032476")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3922083224",
    "help": "",
    "hidden": false,
    "id": "relation1524196506",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "vehiculo_cliente",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
