/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3147372535")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_185828924",
    "help": "",
    "hidden": false,
    "id": "relation3777548247",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "orden",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2713917805",
    "help": "",
    "hidden": false,
    "id": "relation2765642171",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "repuesto",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3147372535")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_185828924",
    "help": "",
    "hidden": false,
    "id": "relation3777548247",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "orden",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2713917805",
    "help": "",
    "hidden": false,
    "id": "relation2765642171",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "repuesto",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
