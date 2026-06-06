"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./members.module.css";

export default function MembersAdmin() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    share: "",
    address: "",
    membershipType: "GENERAL",
    workingLocation: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        const data = await response.json();
        setAuthenticated(true);
        setUserRole(data.role);
        setUsername(data.username);
        fetchMembers();
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const response = await fetch("/api/members", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        if (response.ok) {
          alert("সদস্য আপডেট হয়েছে!");
          setEditingId(null);
          setFormData({
            name: "",
            share: "",
            address: "",
            membershipType: "GENERAL",
            workingLocation: "",
          });
          fetchMembers();
        }
      } else {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("নতুন সদস্য যোগ হয়েছে!");
          setFormData({
            name: "",
            share: "",
            address: "",
            membershipType: "GENERAL",
            workingLocation: "",
          });
          fetchMembers();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      share: member.share,
      address: member.address,
      membershipType: member.membershipType,
      workingLocation: member.workingLocation,
    });
    setEditingId(member.id);
  };

  const handleDelete = async (id) => {
    if (confirm("এই সদস্যকে মুছে ফেলতে চান?")) {
      try {
        const response = await fetch("/api/members", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          alert("সদস্য মুছে ফেলা হয়েছে!");
          fetchMembers();
        }
      } catch (error) {
        console.error("Error:", error);
        alert("মুছতে ব্যর্থ!");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: "",
      share: "",
      address: "",
      membershipType: "GENERAL",
      workingLocation: "",
    });
  };

  if (authLoading) {
    return <div className={styles.loading}>লোড হচ্ছে...</div>;
  }

  if (!authenticated) {
    return <div className={styles.error}>অনুমতি অস্বীকৃত। লগইন করুন।</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>সদস্য ব্যবস্থাপনা</h1>
          <p className={styles.userInfo}>
            {username} - {userRole === "main-admin" ? "মূল অ্যাডমিন" : "সাব অ্যাডমিন"}
          </p>
        </div>
        <div className={styles.headerRight}>
          {userRole === "main-admin" && (
            <a href="/admins-management" className={styles.adminLink}>
              অ্যাডমিন ব্যবস্থাপনা
            </a>
          )}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            লগআউট
          </button>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2>{editingId ? "সদস্য সম্পাদন করুন" : "নতুন সদস্য যোগ করুন"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>নাম *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="সদস্যের নাম"
            />
          </div>

          <div className={styles.formGroup}>
            <label>শেয়ার সংখ্যা *</label>
            <input
              type="number"
              name="share"
              value={formData.share}
              onChange={handleInputChange}
              required
              placeholder="শেয়ার সংখ্যা"
            />
          </div>

          <div className={styles.formGroup}>
            <label>ঠিকানা *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="ঠিকানা"
            />
          </div>

          <div className={styles.formGroup}>
            <label>সদস্যপদ ধরন *</label>
            <select
              name="membershipType"
              value={formData.membershipType}
              onChange={handleInputChange}
            >
              <option>GENERAL</option>
              <option>LIFE</option>
              <option>STUDENT</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>কাজের স্থান *</label>
            <input
              type="text"
              name="workingLocation"
              value={formData.workingLocation}
              onChange={handleInputChange}
              required
              placeholder="কাজের স্থান"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading}>
              {loading ? "প্রক্রিয়া চলছে..." : editingId ? "আপডেট করুন" : "যোগ করুন"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
                বাতিল করুন
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.listSection}>
        <h2>সদস্যদের তালিকা ({members.length})</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SL</th>
                <th>নাম</th>
                <th>শেয়ার</th>
                <th>ঠিকানা</th>
                <th>সদস্যপদ</th>
                <th>কাজের স্থান</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    কোন সদস্য নেই
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr key={member.id}>
                    <td>{index + 1}</td>
                    <td>{member.name}</td>
                    <td>{member.share}</td>
                    <td>{member.address}</td>
                    <td>{member.membershipType}</td>
                    <td>{member.workingLocation}</td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleEdit(member)}
                        className={styles.editBtn}
                      >
                        সম্পাদন
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className={styles.deleteBtn}
                      >
                        মুছুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
