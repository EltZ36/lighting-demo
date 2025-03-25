import "./styles/style.css";
import lightsetup from "./ts/lights";

const APPLICATION_NAME = "Drawing App";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APPLICATION_NAME;

function main(): void {
  lightsetup(app);
}

main();
