"use client";

import { useState, useEffect } from "react";
import styles from "./members.module.css";

export default function MembersAdmin() {
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

  // Fetch members
  useEffect(() => {
    fetchMembers();
  }, []);

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
        // Update existing member
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
        // Add new member
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

  return (
    <div className={styles.container}>
      <h1>সদস্য ব্যবস্থাপনা</h1>

      {/* Form */}
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

      {/* Members List */}
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
