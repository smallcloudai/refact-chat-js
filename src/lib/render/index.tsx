/**
 * Component for use with the self hosted service https://github.com/smallcloudai/refact
 */
import { renderApp } from "./RenderApp";
import { type Config } from "../../app/hooks";
import "./web.css";

export { renderApp } from "./RenderApp";
export { renderAppHost } from "./RenderAppHost";

export function render(element: HTMLElement, config: Config) {
  renderApp(element, config);
}
