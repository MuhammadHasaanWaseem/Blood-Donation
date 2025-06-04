import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const initialHospitalForm = {
  name: "",
  licenseId: "",
  location: "",
  contactNumber: "",
  email: "",
  beds: "",
  departments: "",
  rating: "",
  establishedYear: "",
  manager: "",
  address: "",
  website: "",
};

const contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B";

const contractABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "licenseNo", "type": "string" },
          { "internalType": "string", "name": "specialization", "type": "string" },
          { "internalType": "uint256", "name": "experience", "type": "uint256" },
          { "internalType": "string", "name": "phone", "type": "string" },
          { "internalType": "string", "name": "email", "type": "string" },
          { "internalType": "string", "name": "hospital", "type": "string" }
        ],
        "internalType": "struct ValidationContract.Doctor",
        "name": "doctor",
        "type": "tuple"
      }
    ],
    "name": "addDoctor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "licenseId", "type": "string" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "string", "name": "contactNumber", "type": "string" },
          { "internalType": "string", "name": "email", "type": "string" },
          { "internalType": "uint256", "name": "beds", "type": "uint256" },
          { "internalType": "string", "name": "departments", "type": "string" }
        ],
        "internalType": "struct ValidationContract.Hospital",
        "name": "hospital",
        "type": "tuple"
      }
    ],
    "name": "addHospital",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const initialDoctorForm = {
  name: "",
  licenseNo: "",
  specialization: "",
  experience: "",
  phone: "",
  email: "",
  hospital: "",
  qualifications: "",
  awards: "",
  languagesKnown: "",
  availability: "",
  fee: "",
  gender: "",
  age: "",
  address: "",
};

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Hospital State
  const [hospitals, setHospitals] = useState([]);
  const [hospitalForm, setHospitalForm] = useState(initialHospitalForm);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [hospitalSearch, setHospitalSearch] = useState("");

  // Doctor State
  const [doctors, setDoctors] = useState([]);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");

  // Donor State
  const [donors, setDonors] = useState([]);
  const [donorSearch, setDonorSearch] = useState("");

  // Appointment State
  const [appointments, setAppointments] = useState([]);
  const [appointmentSearch, setAppointmentSearch] = useState("");

  // Blood Request State
  const [bloodRequest, setBloodRequest] = useState("");

  // Fetch user and data on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);
      else setUser(user);
    };

    const fetchHospitals = async () => {
      const { data, error } = await supabase.from("hospitals").select("*");
      if (error) console.error("Error fetching hospitals:", error);
      else setHospitals(data);
    };

    const fetchDoctors = async () => {
      const { data, error } = await supabase.from("doctors").select("*");
      if (error) console.error("Error fetching doctors:", error);
      else setDoctors(data);
    };

    const fetchDonors = async () => {
      const { data, error } = await supabase.from("registrations").select("*");
      if (error) console.error("Error fetching donors:", error);
      else setDonors(data);
    };

const fetchAppointments = async () => {
  console.log("Fetching appointments started");
  const { data, error } = await supabase.from("appointments").select("*");
  if (error) {
    console.error("Error fetching appointments:", error);
  } else {
    console.log("Appointments fetched:", data);
    setAppointments(data);
  }
  console.log("Fetching appointments ended");
};

    getUser();
    fetchHospitals();
    fetchDoctors();
    fetchDonors();
    fetchAppointments();
  }, []);

  // Handlers
  const handleHospitalChange = (e) => setHospitalForm({ ...hospitalForm, [e.target.name]: e.target.value });
  const handleDoctorChange = (e) => setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  const handleBloodRequestChange = (e) => setBloodRequest(e.target.value);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate("/admin-login");
    } catch (error) {
      setErrorMessage(`Error logging out: ${error.message}`);
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hospital CRUD
  const submitHospital = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      setErrorMessage("You must be logged in to perform this action.");
      setLoading(false);
      return;
    }

    const requiredFields = ["name", "location", "contactNumber", "email", "beds", "departments"];
    for (const field of requiredFields) {
      if (!hospitalForm[field]) {
        setErrorMessage(`Please fill in the ${field} field.`);
        setLoading(false);
        return;
      }
    }

    try {
      // Blockchain interaction
      if (!window.ethereum) {
        setErrorMessage("MetaMask is not installed.");
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.addHospital({
        name: hospitalForm.name,
        licenseId: hospitalForm.licenseId,
        location: hospitalForm.location,
        contactNumber: hospitalForm.contactNumber,
        email: hospitalForm.email,
        beds: Number(hospitalForm.beds),
        departments: hospitalForm.departments,
      });
      await tx.wait();

      // Check for duplicate email before insert/update
      const { data: existingHospitals, error: fetchError } = await supabase
        .from("hospitals")
        .select("id")
        .eq("email", hospitalForm.email);

      if (fetchError) {
        throw fetchError;
      }

      if (existingHospitals.length > 0 && (!editingHospitalId || existingHospitals[0].id !== editingHospitalId)) {
        setErrorMessage("A hospital with this email already exists.");
        setLoading(false);
        return;
      }

      // Existing Supabase logic
      if (editingHospitalId) {
        const { error } = await supabase.from("hospitals").update(hospitalForm).eq("id", editingHospitalId);
        if (error) throw error;
        setHospitals(hospitals.map((h) => (h.id === editingHospitalId ? { ...hospitalForm, id: editingHospitalId } : h)));
        setSuccessMessage("Hospital updated successfully!");
      } else {
        const { data, error } = await supabase.from("hospitals").insert([{ ...hospitalForm, user_id: user.id }]).select();
        if (error) throw error;
        setHospitals([...hospitals, data[0]]);
        setSuccessMessage("Hospital added successfully!");
      }
      setHospitalForm(initialHospitalForm);
      setEditingHospitalId(null);
      setActivePage("viewHospitals");
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      console.error("Error submitting hospital:", error);
    } finally {
      setLoading(false);
    }
  };

  const editHospital = (id) => {
    const hosp = hospitals.find((h) => h.id === id);
    setHospitalForm(hosp);
    setEditingHospitalId(id);
    setActivePage("addHospital");
  };

  const deleteHospital = async (id) => {
    if (window.confirm("Are you sure you want to delete this hospital?")) {
      setLoading(true);
      try {
        const { error } = await supabase.from("hospitals").delete().eq("id", id);
        if (error) throw error;
        setHospitals(hospitals.filter((h) => h.id !== id));
        setSuccessMessage("Hospital deleted successfully!");
      } catch (error) {
        setErrorMessage(`Error deleting hospital: ${error.message}`);
        console.error("Error deleting hospital:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Doctor CRUD
  const submitDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      setErrorMessage("You must be logged in to perform this action.");
      setLoading(false);
      return;
    }

    const requiredFields = ["name", "specialization", "hospital", "experience", "phone", "email"];
    for (const field of requiredFields) {
      if (!doctorForm[field]) {
        setErrorMessage(`Please fill in the ${field} field.`);
        setLoading(false);
        return;
      }
    }

    try {
      // Blockchain interaction
      if (!window.ethereum) {
        setErrorMessage("MetaMask is not installed.");
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.addDoctor({
        name: doctorForm.name,
        licenseNo: doctorForm.licenseNo,
        specialization: doctorForm.specialization,
        experience: Number(doctorForm.experience),
        phone: doctorForm.phone,
        email: doctorForm.email,
        hospital: doctorForm.hospital,
      });
      await tx.wait();

      // Existing Supabase logic
      if (editingDoctorId) {
        const { error } = await supabase.from("doctors").update(doctorForm).eq("id", editingDoctorId);
        if (error) throw error;
        setDoctors(doctors.map((d) => (d.id === editingDoctorId ? { ...doctorForm, id: editingDoctorId } : d)));
        setSuccessMessage("Doctor updated successfully!");
      } else {
        const { data, error } = await supabase.from("doctors").insert([{ ...doctorForm, user_id: user.id }]).select();
        if (error) throw error;
        setDoctors([...doctors, data[0]]);
        setSuccessMessage("Doctor added successfully!");
      }
      setDoctorForm(initialDoctorForm);
      setEditingDoctorId(null);
      setActivePage("viewDoctors");
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      console.error("Error submitting doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  const editDoctor = (id) => {
    const doc = doctors.find((d) => d.id === id);
    setDoctorForm(doc);
    setEditingDoctorId(id);
    setActivePage("addDoctor");
  };

  const deleteDoctor = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      setLoading(true);
      try {
        const { error } = await supabase.from("doctors").delete().eq("id", id);
        if (error) throw error;
        setDoctors(doctors.filter((d) => d.id !== id));
        setSuccessMessage("Doctor deleted successfully!");
      } catch (error) {
        setErrorMessage(`Error deleting doctor: ${error.message}`);
        console.error("Error deleting doctor:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Blood Request
  const submitBloodRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      setErrorMessage("You must be logged in to perform this action.");
      setLoading(false);
      return;
    }

    if (!bloodRequest) {
      setErrorMessage("Please enter a blood group.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("blood_requests")
        .insert([{ blood_group: bloodRequest, user_id: user.id, requested_at: new Date().toISOString() }])
        .select();
      if (error) throw error;
      setSuccessMessage("Blood group request submitted successfully!");
      setBloodRequest("");
    } catch (error) {
      setErrorMessage(`Error submitting request: ${error.message}`);
      console.error("Error submitting blood request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Appointment Approval/Rejection
  const approveAppointment = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
      setSuccessMessage("Appointment approved successfully!");
    } catch (error) {
      setErrorMessage(`Error approving appointment: ${error.message}`);
      console.error("Error approving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const rejectAppointment = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)));
      setSuccessMessage("Appointment rejected successfully!");
    } catch (error) {
      setErrorMessage(`Error rejecting appointment: ${error.message}`);
      console.error("Error rejecting appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Lists
  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.location.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const filteredDonors = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.cnic.toLowerCase().includes(donorSearch.toLowerCase())
  );

  const filteredAppointments = appointments.filter(
    (a) =>
      a.name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      a.blood_group.toLowerCase().includes(appointmentSearch.toLowerCase())
  );

  // Render Pages
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div>
            <h3 className="mb-4 text-danger">Dashboard Overview</h3>
            <div className="row">
              <div className="col-md-4 mb-3">
                <div
                  className="card shadow-sm p-4 text-center"
                  style={{
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, #f44336, #d32f2f)",
                    color: "white",
                    boxShadow: "0 8px 16px rgba(244, 67, 54, 0.4)",
                    border: "none",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <i className="fas fa-hospital fa-3x mb-3"></i>
                  <h5>Total Hospitals</h5>
                  <p className="fs-2 fw-bold">{hospitals.length}</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div
                  className="card shadow-sm p-4 text-center"
                  style={{
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, #e91e63, #c2185b)",
                    color: "white",
                    boxShadow: "0 8px 16px rgba(233, 30, 99, 0.4)",
                    border: "none",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <i className="fas fa-user-md fa-3x mb-3"></i>
                  <h5>Total Doctors</h5>
                  <p className="fs-2 fw-bold">{doctors.length}</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div
                  className="card shadow-sm p-4 text-center"
                  style={{
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
                    color: "white",
                    boxShadow: "0 8px 16px rgba(156, 39, 176, 0.4)",
                    border: "none",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <i className="fas fa-user-friends fa-3x mb-3"></i>
                  <h5>Total Donors</h5>
                  <p className="fs-2 fw-bold">{donors.length}</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div
                  className="card shadow-sm p-4 text-center"
                  style={{
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, #ff5722, #e64a19)",
                    color: "white",
                    boxShadow: "0 8px 16px rgba(255, 87, 34, 0.4)",
                    border: "none",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <i className="fas fa-calendar-check fa-3x mb-3"></i>
                  <h5>Pending Appointments</h5>
                  <p className="fs-2 fw-bold">{appointments.filter(a => a.status === "pending").length}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "addHospital":
        return (
          <div>
            <h3 className="mb-4 text-danger">{editingHospitalId ? "Edit Hospital" : "Add Hospital"}</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <form onSubmit={submitHospital}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Hospital Name *</label>
                  <input type="text" name="name" value={hospitalForm.name} onChange={handleHospitalChange} required className="form-control" placeholder="Enter hospital name" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">License ID</label>
                  <input type="text" name="licenseId" value={hospitalForm.licenseId} onChange={handleHospitalChange} className="form-control" placeholder="License ID" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Location *</label>
                  <input type="text" name="location" value={hospitalForm.location} onChange={handleHospitalChange} required className="form-control" placeholder="City/Area" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Contact Number *</label>
                  <input type="tel" name="contactNumber" value={hospitalForm.contactNumber} onChange={handleHospitalChange} required className="form-control" placeholder="+92XXXXXXXXXX" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email *</label>
                  <input type="email" name="email" value={hospitalForm.email} onChange={handleHospitalChange} required className="form-control" placeholder="email@example.com" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Number of Beds *</label>
                  <input type="number" name="beds" value={hospitalForm.beds} onChange={handleHospitalChange} required className="form-control" placeholder="e.g., 100" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Departments *</label>
                  <input type="text" name="departments" value={hospitalForm.departments} onChange={handleHospitalChange} required className="form-control" placeholder="e.g., Cardiology, Pediatrics" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Rating (out of 5)</label>
                  <input type="number" step="0.1" min="0" max="5" name="rating" value={hospitalForm.rating} onChange={handleHospitalChange} className="form-control" placeholder="e.g., 4.5" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Established Year</label>
                  <input type="number" name="establishedYear" value={hospitalForm.establishedYear} onChange={handleHospitalChange} className="form-control" placeholder="e.g., 1999" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Manager Name</label>
                  <input type="text" name="manager" value={hospitalForm.manager} onChange={handleHospitalChange} className="form-control" placeholder="Manager's name" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" value={hospitalForm.address} onChange={handleHospitalChange} className="form-control" placeholder="Full address" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Website</label>
                  <input type="url" name="website" value={hospitalForm.website} onChange={handleHospitalChange} className="form-control" placeholder="https://example.com" />
                </div>
              </div>
              <button type="submit" className="btn btn-danger me-2" disabled={loading}>
                {loading ? "Processing..." : editingHospitalId ? "Update Hospital" : "Add Hospital"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setHospitalForm(initialHospitalForm); setEditingHospitalId(null); setActivePage("viewHospitals"); }} disabled={loading}>
                Cancel
              </button>
            </form>
          </div>
        );

      case "viewHospitals":
        return (
          <div>
            <h3 className="mb-4 text-danger">Hospitals List</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <input type="text" className="form-control w-50" placeholder="Search hospitals by name or location" value={hospitalSearch} onChange={(e) => setHospitalSearch(e.target.value)} />
              <button className="btn btn-danger" onClick={() => { setHospitalForm(initialHospitalForm); setEditingHospitalId(null); setActivePage("addHospital"); }}>
                <i className="fas fa-plus me-2"></i>Add Hospital
              </button>
            </div>
            {filteredHospitals.length === 0 ? (
              <p>No hospitals found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-danger">
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Beds</th>
                      <th>Departments</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.map((h) => (
                      <tr key={h.id}>
                        <td>{h.name}</td>
                        <td>{h.location}</td>
                        <td>{h.contactNumber}</td>
                        <td>{h.email}</td>
                        <td>{h.beds}</td>
                        <td>{h.departments}</td>
                        <td>{h.rating || "N/A"}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editHospital(h.id)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteHospital(h.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "addDoctor":
        return (
          <div>
            <h3 className="mb-4 text-danger">{editingDoctorId ? "Edit Doctor" : "Add Doctor"}</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <form onSubmit={submitDoctor}>
              <div className="row">
                {Object.entries(doctorForm).map(([key, value], idx) => (
                  <div className="col-md-6 mb-3" key={idx}>
                    <label className="form-label">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      {["name", "specialization", "hospital", "experience", "phone", "email"].includes(key) ? " *" : ""}
                    </label>
                    <input
                      type={key === "email" ? "email" : key === "phone" ? "tel" : key === "experience" || key === "fee" || key === "age" ? "number" : "text"}
                      name={key}
                      value={value}
                      onChange={handleDoctorChange}
                      required={["name", "specialization", "hospital", "experience", "phone", "email"].includes(key)}
                      className="form-control"
                      placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                      step={key === "fee" ? "0.01" : undefined}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-danger me-2" disabled={loading}>
                {loading ? "Processing..." : editingDoctorId ? "Update Doctor" : "Add Doctor"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setDoctorForm(initialDoctorForm); setEditingDoctorId(null); setActivePage("viewDoctors"); }} disabled={loading}>
                Cancel
              </button>
            </form>
          </div>
        );

      case "viewDoctors":
        return (
          <div>
            <h3 className="mb-4 text-danger">Doctors List</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <input type="text" className="form-control w-50" placeholder="Search doctors by name or specialization" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} />
              <button className="btn btn-danger" onClick={() => { setDoctorForm(initialDoctorForm); setEditingDoctorId(null); setActivePage("addDoctor"); }}>
                <i className="fas fa-plus me-2"></i>Add Doctor
              </button>
            </div>
            {filteredDoctors.length === 0 ? (
              <p>No doctors found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-danger">
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Hospital</th>
                      <th>Experience (yrs)</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>{d.specialization}</td>
                        <td>{d.hospital}</td>
                        <td>{d.experience}</td>
                        <td>{d.phone}</td>
                        <td>{d.email}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editDoctor(d.id)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDoctor(d.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "viewDonors":
        return (
          <div>
            <h3 className="mb-4 text-danger">Donors List</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <input type="text" className="form-control w-50" placeholder="Search donors by name or CNIC" value={donorSearch} onChange={(e) => setDonorSearch(e.target.value)} />
            </div>
            {filteredDonors.length === 0 ? (
              <p>No donors found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-danger">
                    <tr>
                      <th>Name</th>
                      <th>CNIC</th>
                      <th>Blood Group</th>
                      <th>Age</th>
                      <th>Medical History</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>{d.cnic}</td>
                        <td>{d.blood_group}</td>
                        <td>{d.age}</td>
                        <td>{d.medical_history || "N/A"}</td>
                        <td>{new Date(d.created_at).toLocaleString()}</td>
                        <td>{new Date(d.updated_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "requestBlood":
        return (
          <div>
            <h3 className="mb-4 text-danger">Request Blood Group</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <form onSubmit={submitBloodRequest}>
              <div className="mb-3">
                <label className="form-label">Blood Group *</label>
                <input type="text" className="form-control" placeholder="e.g., A+, B-, O+" value={bloodRequest} onChange={handleBloodRequestChange} required />
              </div>
              <button type="submit" className="btn btn-danger me-2" disabled={loading}>
                {loading ? "Processing..." : "Submit Request"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setBloodRequest("")} disabled={loading}>
                Clear
              </button>
            </form>
          </div>
        );

      case "viewAppointments":
        return (
          <div>
            <h3 className="mb-4 text-danger">Appointments List</h3>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {loading && <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <input type="text" className="form-control w-50" placeholder="Search appointments by name or blood group" value={appointmentSearch} onChange={(e) => setAppointmentSearch(e.target.value)} />
            </div>
            {filteredAppointments.length === 0 ? (
              <p>No appointments found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-danger">
                    <tr>
                      <th>Name</th>
                      <th>Blood Group</th>
                      <th>Medical History</th>
                      <th>Contact</th>
                      <th>Requested At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.name}</td>
                        <td>{a.blood_group}</td>
                        <td>{a.medical_history || "N/A"}</td>
                        <td>{a.contact}</td>
                        <td>{new Date(a.requested_at).toLocaleString()}</td>
                        <td>{a.status}</td>
                        <td>
                          {a.status === "pending" && (
                            <>
                              <button className="btn btn-sm btn-success me-2" onClick={() => approveAppointment(a.id)} disabled={loading}>Approve</button>
                              <button className="btn btn-sm btn-danger" onClick={() => rejectAppointment(a.id)} disabled={loading}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  // Sidebar Navigation
  const navItems = [
    { page: "dashboard", icon: "tachometer-alt", label: "Dashboard" },
    { page: "addHospital", icon: "hospital", label: "Add Hospital" },
    { page: "viewHospitals", icon: "list", label: "View Hospitals" },
    { page: "addDoctor", icon: "user-md", label: "Add Doctor" },
    { page: "viewDoctors", icon: "users", label: "View Doctors" },
    { page: "viewDonors", icon: "user-friends", label: "View Donors" },
    { page: "requestBlood", icon: "tint", label: "Request Blood Group" },
    { page: "viewAppointments", icon: "calendar-check", label: "View Appointments" },
  ];

  return (
    <div className="d-flex vh-100 overflow-hidden" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8f9fa" }}>
      <div
        className={`text-white flex-shrink-0 d-flex flex-column`}
        style={{
          width: sidebarCollapsed ? "60px" : "230px",
          background: "linear-gradient(135deg, #c82333, #a71d2a)",
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        <div className="p-3 border-bottom border-white d-flex justify-content-between align-items-center" style={{ background: "rgba(255,255,255,0.1)" }}>
          {!sidebarCollapsed && <h3 className="mb-0 fw-bold" style={{ letterSpacing: "1.5px" }}>Blood Link Admin</h3>}
          <button
            className="btn btn-sm btn-light"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ width: "30px", height: "30px", padding: 0 }}
          >
            <i className={`fas fa-${sidebarCollapsed ? "angle-right" : "angle-left"}`}></i>
          </button>
        </div>
        <nav className="nav flex-column p-2 flex-grow-1">
          {navItems.map((item) => (
            <button
              key={item.page}
              className={`btn text-start mb-2 w-100 d-flex align-items-center ${
                activePage === item.page ? "bg-gradient text-white shadow-lg" : "text-white"
              }`}
              onClick={() => setActivePage(item.page)}
              style={{
                borderRadius: "12px",
                transition: "all 0.3s ease",
                boxShadow: activePage === item.page ? "0 0 15px rgba(255, 0, 0, 0.8)" : "none",
                transform: activePage === item.page ? "scale(1.05)" : "scale(1)",
                background: activePage === item.page ? "linear-gradient(45deg, #ff4e50, #f9d423)" : undefined,
                color: activePage === item.page ? "#fff" : "#f8f9fa",
              }}
              title={sidebarCollapsed ? item.label : undefined}
              onMouseEnter={e => {
                if (!activePage === item.page) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.transform = "scale(1.03)";
                }
              }}
              onMouseLeave={e => {
                if (!activePage === item.page) {
                  e.currentTarget.style.background = "";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <i
                className={`fas fa-${item.icon} me-2`}
                style={{
                  minWidth: "20px",
                  textAlign: "center",
                  transition: "color 0.3s ease",
                  color: activePage === item.page ? "#fff" : "#f8f9fa",
                }}
              ></i>
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-3 border-top border-white" style={{ background: "rgba(255,255,255,0.1)" }}>
          <button
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
            disabled={loading}
            title="Logout"
            style={{
              borderRadius: "12px",
              transition: "all 0.3s ease",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.7)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 1)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.7)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </div>
      <div className="flex-grow-1 d-flex flex-column">
        <nav className="navbar navbar-light bg-light px-4 shadow-sm">
          <span className="navbar-brand mb-0 h1 text-danger">Blood Link Admin Panel</span>
        </nav>
        <main className="p-5 overflow-auto" style={{ height: "calc(100vh - 56px)" }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;