const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController'); // 引入剛剛寫的

// 首頁 -> 交給 pageController 的 showIndex 處理
router.get('/', pageController.showIndex);

module.exports = router;