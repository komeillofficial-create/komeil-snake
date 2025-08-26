// telegram-integration.js – ساده و امن
(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  window.sendScoreToTelegram = function (score) {
    if (tg && tg.initData) {
      try {
        tg.sendData(JSON.stringify({ score }));
      } catch (e) {
        console.log("TG sendData error:", e);
      }
    }
  };
})();
