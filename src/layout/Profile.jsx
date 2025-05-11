import Swal from 'sweetalert2';
import axios from "axios";
import { useEffect, useState } from "react";

const getToken = () => {
  return localStorage.getItem("token"); // Replace "token" with the correct key if needed
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("http://localhost:8000/auth/userById/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(response.data);
        setEditData(response.data); // Initialize the edit form with current profile data
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    getProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.put("http://localhost:8000/auth/editprofile", editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(editData); // Update the profile state with new data
      setIsEditing(false); // Close the edit form

      // Show success alert using SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000, // Optional: auto-close after 2 seconds
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally, show an error alert
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update profile. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">
            ชื่อ: {profile.name} นามสกุล: {profile.lastName}
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            อีเมล: {profile.email}
          </p>
          <p className="text-gray-600 mt-2 text-center">
            เบอร์โทร: {profile.phone}
          </p>
        </div>
        <button
          className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition duration-200"
          onClick={() => setIsEditing(true)}
        >
          แก้ไขข้อมูลผู้ใช้
        </button>

        {isEditing && (
          <form onSubmit={handleEditSubmit} className="mt-4">
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              placeholder="Name"
              className="block w-full px-4 py-2 mt-2 border rounded-md"
            />
            <input
              type="text"
              name="lastName"
              value={editData.lastName}
              onChange={handleEditChange}
              placeholder="Last Name"
              className="block w-full px-4 py-2 mt-2 border rounded-md"
            />
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleEditChange}
              placeholder="Email"
              className="block w-full px-4 py-2 mt-2 border rounded-md"
            />
            <input
              type="text"
              name="phone"
              value={editData.phone}
              onChange={handleEditChange}
              placeholder="Phone"
              className="block w-full px-4 py-2 mt-2 border rounded-md"
            />
            <button
              type="submit"
              className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition duration-200"
            >
              บันทึก
            </button>
            <button
              type="button"
              className="mt-2 w-full py-2 px-4 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition duration-200"
              onClick={() => setIsEditing(false)}
            >
              ยกเลิก
            </button>
          </form>
        )}
      </div>
    </div>


  );
}

export default Profile;
