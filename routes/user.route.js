const { Router } = require("express");
const {
  CreateAccount,
  reportUser,
} = require("../controllers/user.accounts.controller");

const router = Router();

router.route("/account").post(CreateAccount);
router.route("/report").post(reportUser);

module.exports = router;
