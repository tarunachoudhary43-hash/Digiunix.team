import { useState } from "react";
import axios from "../api/axios";

interface User {
  fullName: string;
  avatar?: string;
}

interface ProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const [name, setName] = useState(user.fullName);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", name);
    if (image) formData.append("profileImage", image);

    try {
      const res = await axios.put(
        "/api/profile/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(res.data.user);
      alert("Profile updated");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <img
        src={user.avatar || "https://via.placeholder.com/100"}
        width={100}
      />


      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="file"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) {
            setImage(e.target.files[0]);
          }
        }}
      />

      <button>Save</button>
    </form>
  );
};

export default Profile;
