import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TokenScope from "@/pages/TokenScope";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TokenScope />} />
          <Route path="*" element={<TokenScope />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#10141C",
            color: "#F5F7FA",
            border: "1px solid #1E2532",
          },
        }}
      />
    </div>
  );
}

export default App;
