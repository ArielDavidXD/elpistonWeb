/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "select240467767",
    "maxSelect": 0,
    "name": "rol",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "duenno",
      "recepcion",
      "mecanico1",
      "mecanico2"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select240467767")

  return app.save(collection)
})
