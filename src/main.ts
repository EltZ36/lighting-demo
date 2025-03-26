import "./styles/style.css";
import lightsetup from "./ts/lights";

const APPLICATION_NAME = "Drawing App";
const canvas = document.querySelector<HTMLDivElement>("#canvas")!;
document.title = APPLICATION_NAME;

function main(): void {
  lightsetup(canvas);
}

main();
