'use strict'

const test = require('tap').test
const service = require('../../lib/service')

var opts = {
  logLevel: 'warn'
}

test('authorize check on a resource and action', (t) => {
  t.plan(7)

  service({}, (svc) => {
    let testUserId

    svc.createUser(['Salman', 'WONKA'], (err, result) => {
      t.error(err, 'should be no error')

      testUserId = result.id

      svc.updateUser([testUserId, 'Salman', [{id: 4}], [{id: 1}]], (err, result) => {
        t.error(err, 'should be no error')

        svc.isUserAuthorized({
          userId: testUserId,
          resource: 'database:pg01:balancesheet',
          action: 'finance:ReadBalanceSheet'
        }, (err, result) => {
          t.error(err, 'should be no error')
          t.ok(result, 'result should be supplied')
          t.deepEqual(result.access, true, 'data should be as expected')

          svc.deleteUserById([testUserId], (err, result) => {
            t.error(err, 'should be no error')

            svc.destroy({}, (err, result) => {
              t.error(err, 'should be no error')
            })
          })
        })
      })
    })
  })
})
