// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for selections
const Selection = require('../models/selection')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { selection: { title: '', text: 'foo' } } -> { selection: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /selections
router.get('/selections', requireToken, (req, res, next) => {
  Selection.find({ owner: req.user.id })
    .then(selections => {
      // `selections` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return selections.map(selection => selection.toObject())
    })
    // respond with status 200 and JSON of the selections
    .then(selections => res.status(200).json({ selections: selections }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /selections/5a7db6c74d55bc51bdf39793
router.get('/selections/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Selection.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "selection" JSON
    .then(selection => res.status(200).json({ selection: selection.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /selections
router.post('/selections', requireToken, (req, res, next) => {
  // set owner of new selection to be current user
  req.body.selection.owner = req.user.id

  Selection.create(req.body.selection)
    // respond to succesful `create` with status 201 and JSON of new "selection"
    .then(selection => {
      res.status(201).json({ selection: selection.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /selections/5a7db6c74d55bc51bdf39793
router.patch('/selections/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.selection.owner

  Selection.findById(req.params.id)
    .then(handle404)
    .then(selection => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, selection)

      // pass the result of Mongoose's `.update` to the next `.then`
      return selection.updateOne(req.body.selection)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /selections/5a7db6c74d55bc51bdf39793
router.delete('/selections/:id', requireToken, (req, res, next) => {
  Selection.findById(req.params.id)
    .then(handle404)
    .then(selection => {
      // throw an error if current user doesn't own `selection`
      requireOwnership(req, selection)
      // delete the selection ONLY IF the above didn't throw
      selection.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
