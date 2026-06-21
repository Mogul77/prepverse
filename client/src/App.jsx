import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Tests from "./pages/Tests";
import TestPage from "./pages/TestPages";
import Results from "./pages/Results";
import CreateTest from "./pages/CreateTest";
import ManageTest from "./pages/ManageTest";
import AddQuestions from "./pages/AddQuestions";
import AddCodingQuestions from "./pages/AddCodingQuestion";
import CodingTest from "./pages/CodingTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/test/:id" element={<TestPage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/create-test" element={<CreateTest />}/>
        <Route path="/manage-test" element={<ManageTest />}/>
        <Route path="/add-question/:id"element={<AddQuestions />}/>
        <Route path="/add-coding-questions/:id" element={<AddCodingQuestions />}/>
        <Route path="/coding-test/:testId" element={<CodingTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;