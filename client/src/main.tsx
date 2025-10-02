import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Add this line
createRoot(document.getElementById("root")!).render(<App />);
