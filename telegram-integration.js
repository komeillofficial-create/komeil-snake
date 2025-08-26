// telegram-integration.js

const urlParams = new URLSearchParams(window.location.search);
const tgData = urlParams.get("tgWebAppData");

let telegramUser = null;

if (tgData) {
  try {
    telegramUser = JSON.parse(decodeURIComponent(tgData));
    console.log("Player from Telegram:", telegramUser.user.first_name);
  } catch (e) {
    console.error("Error parsing Telegram data:", e);
  }
}

function sendScoreToTelegram(score) {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ score: score }));
    console.log("Score sent to Telegram:", score);
  }
}