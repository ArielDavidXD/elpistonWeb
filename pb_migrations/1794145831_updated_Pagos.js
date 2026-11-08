/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3491535888")

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "date27834329",
    "max": "",
    "min": "",
    "name": "fecha",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select791686310",
    "maxSelect": 0,
    "name": "metodo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "efectivo",
      "transferencia"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3491535888")

  // remove field
  collection.fields.removeById("date27834329")

  // remove field
  collection.fields.removeById("select791686310")

  return app.save(collection)
})
