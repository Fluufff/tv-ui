import { getNow } from "./util";

const clockEl = document.getElementById("clock");

if (clockEl) {
  setInterval(() => {
    clockEl.textContent = getNow().toLocaleString()
  }, 200);
}