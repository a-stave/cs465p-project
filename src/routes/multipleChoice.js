const express = require("express");
const router = express.Router();

const mcqController = require("../controllers/multipleChoiceController");

router.get("/", mcqController.mcq_list);

router.get("/create", mcqController.mcq_create_get);
router.post("/create", mcqController.mcq_create_post);

router.get("/:id/delete", mcqController.mcq_delete_get);
router.post("/:id/delete", mcqController.mcq_delete_post);

router.get("/:id/update", mcqController.mcq_update_get);
router.post("/:id/update", mcqController.mcq_update_post);

router.get("/:id", mcqController.mcq_detail);

module.exports = router;
