'use strict'

var mu = require('mu')()
var tcp = require('mu/drivers/tcp')

mu.outbound({role: 'authorization'}, tcp.client({port: process.env.SERVICE_PORT || 8080, host: process.env.SERVICE_HOST || 'localhost'}))

function handleRoleCommandType (role, command, type, params, request, reply) {
  mu.dispatch({role: role, cmd: command, type: type, params: params}, function (err, res) {
    reply({result: err ? 'error' : res, err: err})
  })
}

// TODO: add input validation
module.exports = function (server) {
  // curl http://localhost:8000/authorization/users
  server.route({
    method: 'GET',
    path: '/authorization/users',
    handler: function (request, reply) {
      handleRoleCommandType('authorization', 'list', 'users', null, request, reply)
    }
  })
  // curl http://localhost:8000/authorization/user/123
  server.route({
    method: 'GET',
    path: '/authorization/user/{id}',
    handler: function (request, reply) {
      handleRoleCommandType('authorization', 'read', 'user', [request.params.id], request, reply)
    }
  })
  // NOTE: create method currently takes an ID, but later on that will be auto-assigned
  // curl http://localhost:8000/authorization/user -X POST -H 'Content-Type: application/json' -d '{"id":"123","name":"Violet Beauregarde","org_id":"1"}'
  server.route({
    method: 'POST',
    path: '/authorization/user',
    handler: function (request, reply) {
      // console.log("rawPayload: " + request.rawPayload)
      if (request.payload.id && request.payload.name) {
        console.log('Received POST, name= ' + request.payload.name + ', id=' + request.payload.id)
        handleRoleCommandType('authorization', 'create', 'user', [request.payload.id, request.payload.name, request.payload.org_id], request, reply)
      }
    }
  })
  // curl -X DELETE http://localhost:8000/authorization/user/123
  server.route({
    method: 'DELETE',
    path: '/authorization/user/{id}',
    handler: function (request, reply) {
      // console.log("rawPayload: " + request.rawPayload)
      if (request.params.id) {
        console.log('Received DELETE, id=' + request.params.id)
        handleRoleCommandType('authorization', 'delete', 'user', [request.params.id], request, reply)
      }
    }
  })
  // curl -X PUT http://localhost:8000/authorization/user/123 -H 'Content-Type: application/json' -d '{"name": "Mrs Beauregarde"}'
  server.route({
    method: 'PUT',
    path: '/authorization/user/{id}',
    handler: function (request, reply) {
      // console.log("rawPayload: " + request.rawPayload)
      //
      // TODO: allow for updating more than just 'name'
      //
      if (request.params.id && request.payload.name) {
        console.log('Received PUT, name= ' + request.payload.name + ', id=' + request.params.id)
        handleRoleCommandType('authorization', 'update', 'user', [request.params.id, request.payload.name], request, reply)
      }
    }
  })
}