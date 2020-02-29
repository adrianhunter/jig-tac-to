import App from "./App.js";
import "/web_modules/smelte/src/tailwind.css.js";
const app = new App({
  target: document.body,
  props: {
    name: 'world'
  }
});
export default app;