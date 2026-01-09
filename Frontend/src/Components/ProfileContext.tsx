import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";

const ProfileContext = createContext<any>(null);

export const ProfileProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    if (!token) return;

    const res = await axios.get("/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const u = res.data.user;

    setUser({
      ...u,
      avatar: u.avatar || ""
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, setUser }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
