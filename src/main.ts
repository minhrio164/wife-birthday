import "./style.css"
import App from "./app"
import { mountAgentation } from "./agentation"

const app = new App()
app.start()
void mountAgentation({ enabled: import.meta.env.DEV })
