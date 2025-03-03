import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import "./App.css";

import Maintenance from "./components/Maintenance";
import Members from "./components/Members";
import Billing from "./components/Billing";
import Events from "./components/Events";
import Register from "./components/Register";
import Complaints from "./components/Complaints";
import Login from "./components/Login";
import CreateNotice from "./components/CreateNotice";
import NoticeDetails from "./components/NoticeDetails";
import CreateNewBill from "./components/CreateNewBill";
import ComplaintDetails from "./components/CviewDetails";
import Home from "./routes/Home.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen  bg-gray-100 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/members" element={<Members />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/events" element={<Events />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/create-notice" element={<CreateNotice />} />
            <Route path="/notice/:noticeId" element={<NoticeDetails />} />
            <Route path="/create-new-bill" element={<CreateNewBill />} />
            <Route
              path="/complaint/:complaintId"
              element={<ComplaintDetails />}
            />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
