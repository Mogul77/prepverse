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
import CodingResultPage from "./pages/CodingResultPage";
import Leaderboard from "./pages/Leaderboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyDashboard from "./pages/CompanyDashboard";
import PlacementDrives from "./pages/PlacementDrives";
import ManageCompanies from "./pages/ManageCompanies";

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
        <Route path="/coding-results" element={<CodingResultPage />} />
        <Route path="/coding-result/:id" element={<CodingResultPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/placement-drives" element={<PlacementDrives />} />
        <Route path="/admin/companies" element={<ManageCompanies />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;