// rules/serviceRules.js

const services = require('../data/services')
const { resolveComposite } = require('./bundleRules')

function addServiceToDraft(draft, serviceId) {
  if (!draft.services.includes(serviceId)) {
    draft.services.push(serviceId)
  }

  const composite = resolveComposite(draft.services)

  if (composite) {
    draft.compositeId = composite.id
    draft.duration = composite.duration
  } else {
    draft.compositeId = null
    draft.duration = services
      .filter(s => draft.services.includes(s.id))
      .reduce((sum, s) => sum + s.duration, 0)
  }

  return draft
}

module.exports = {
  addServiceToDraft
}
