const express = require('express');

const dctreeController = require('../controllers/dctree-controller');

const router = express.Router();

router.get('/', dctreeController.getDctree);

module.exports = router;
