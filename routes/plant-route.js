const express = require('express');
const { check } = require('express-validator');

const plantsControllers = require('../controllers/plants-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth')

const router = express.Router();



router.get('/:pid', plantsControllers.getPlantById);

router.get('/dctree/:pid', plantsControllers.getDctree);

router.get('/user/:uid', plantsControllers.getPlantsByUser);

router.get('/', plantsControllers.getPlant)

router.use(checkAuth); //checking auth token

router.post('/:pid/stats', 
[
  check('ph').not().isEmpty(),
  check('nitrogen').not().isEmpty(),
  check('phospor').not().isEmpty(),
  check('kalium').not().isEmpty(),
  check('temperature').not().isEmpty(),
  check('humidity').not().isEmpty()
],
plantsControllers.createHistory);

router.post('/', 
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({min:5})
  ], 
  plantsControllers.createPlant
);

router.patch('/:pid/stats', 
[
  check('ph').not().isEmpty(),
  check('nitrogen').not().isEmpty(),
  check('phospor').not().isEmpty(),
  check('kalium').not().isEmpty(),
  check('temperature').not().isEmpty(),
  check('humidity').not().isEmpty()
],
plantsControllers.updateStats);

router.patch('/:pid', 
[
  check('title').not().isEmpty(),
  check('description').isLength({min:5})
],
plantsControllers.updatePlant);

router.delete('/:pid', plantsControllers.deletePlant);

module.exports = router;