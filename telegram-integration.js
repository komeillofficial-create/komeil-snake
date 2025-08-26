// telegram-integration.js
const urlParams = new URLSearchParams(window.location.search);
const tgData = urlParams.get("tgWebAppData");
let telegramUser = null;
if (tgData) {
  try { telegramUser = JSON.parse(decodeURIComponent(tgData)); }
  catch(e){ console.error("TG parse error", e); }
}
function sendScoreToTelegram(score){
  if (window.Telegram && window.Telegram.WebApp){
    window.Telegram.WebApp.sendData(JSON.stringify({ score }));
  }
}
