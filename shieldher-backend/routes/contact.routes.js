// routes/contact.routes.js
const express = require("express");
const r = express.Router();
const { addContact, getContacts, updateContact, deleteContact } = require("../controllers/allControllers");
const { protect } = require("../middleware/authMiddleware");
r.use(protect);
r.route("/").get(getContacts).post(addContact);
r.route("/:id").put(updateContact).delete(deleteContact);
module.exports = r;
