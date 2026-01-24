export const parseComboBody = (req, res, next) => {
  if (typeof req.body.services === "string") {
    req.body.services = JSON.parse(req.body.services)
  }
  if (typeof req.body.pricing === "string") {
    req.body.pricing = JSON.parse(req.body.pricing)
  }
  next()
}
