"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admins.module.css";

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        const data = await response.json();
        setRole(data.role);
        if (data.role === "main-admin") {
          setAuthenticated(true);
          fetchAdmins();
        } else {
          router.push("/members-admin");
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
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
    setSubmitLoading(true);

    try {
      if (!formData.username || !formData.password) {
        alert("সব ফিল্ড পূরণ করুন");
        setSubmitLoading(false);
        return;
      }

      if (editingId) {
        const response = await fetch("/api/admins", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        if (response.ok) {
          alert("অ্যাডমিন আপডেট হয়েছে!");
          setEditingId(null);
          setFormData({ username: "", password: "" });
          fetchAdmins();
        } else {
          const error = await response.json();
          alert(error.error || "আপডেটে ব্যর্থ");
        }
      } else {
        const response = await fetch("/api/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("নতুন অ্যাডমিন তৈরি হয়েছে!");
          setFormData({ username: "", password: "" });
          fetchAdmins();
        } else {
          const error = await response.json();
          alert(error.error || "তৈরিতে ব্যর্থ");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditAdmin = (admin) => {
    setFormData({
      username: admin.username,
      password: admin.password,
    });
    setEditingId(admin.id);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ username: "", password: "" });
  };

  const handleDeleteAdmin = async (id) => {
    if (confirm("এই অ্যাডমিনকে মুছে ফেলতে চান?")) {
      try {
        const response = await fetch("/api/admins", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          alert("অ্যাডমিন মুছে ফেলা হয়েছে!");
          fetchAdmins();
        } else {
          const error = await response.json();
          alert(error.error || "মুছতে ব্যর্থ");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("মুছতে ব্যর্থ!");
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>লোড হচ্ছে...</div>;
  }

  if (!authenticated) {
    return <div className={styles.error}>অনুমতি অস্বীকৃত। শুধুমাত্র মূল অ্যাডমিন প্রবেশ করতে পারবেন।</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>অ্যাডমিন ব্যবস্থাপনা</h1>
      </div>

      <div className={styles.formSection}>
        <h2>{editingId ? "অ্যাডমিন সম্পাদনা করুন" : "নতুন অ্যাডমিন যোগ করুন"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>ব্যবহারকারীর নাম *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="অ্যাডমিনের ব্যবহারকারীর নাম"
            />
          </div>

          <div className={styles.formGroup}>
            <label>পাসওয়ার্ড *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="শক্তিশালী পাসওয়ার্ড দিন"
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={submitLoading} className={styles.submitBtn}>
              {submitLoading ? (editingId ? "আপডেট করছি..." : "যোগ করছি...") : (editingId ? "আপডেট করুন" : "নতুন অ্যাডমিন যোগ করুন")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelBtn}
                style={{
                  padding: "12px 24px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                বাতিল করুন
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.listSection}>
        <h2>সকল অ্যাডমিন ({admins.length})</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SL</th>
                <th>ব্যবহারকারীর নাম</th>
                <th>ভূমিকা</th>
                <th>তৈরির তারিখ</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    কোন অ্যাডমিন নেই
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.username}</td>
                    <td>
                      <span className={admin.role === "main-admin" ? styles.roleMain : styles.roleSub}>
                        {admin.role === "main-admin" ? "মূল অ্যাডমিন" : "সাব অ্যাডমিন"}
                      </span>
                    </td>
                    <td>{new Date(admin.createdAt).toLocaleDateString("bn-BD")}</td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        style={{
                          padding: "6px 12px",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        সম্পাদনা
                      </button>
                      {admin.role !== "main-admin" && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className={styles.deleteBtn}
                        >
                          মুছুন
                        </button>
                      )}
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
