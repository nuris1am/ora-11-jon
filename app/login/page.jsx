"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/financial-dashboard");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("লগইন করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>ওরা এগারো জন সমিতি</h1>
          <p>অ্যাডমিন প্যানেল</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">ব্যবহারকারীর নাম</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="ব্যবহারকারীর নাম প্রবেশ করুন"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">পাসওয়ার্ড</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="পাসওয়ার্ড প্রবেশ করুন"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <div className={styles.info}>
          <p>🔒 ডিফল্ট অ্যাকাউন্ট:</p>
          <p>ব্যবহারকারীর নাম: <strong>admin</strong></p>
          <p>পাসওয়ার্ড: <strong>admin123</strong></p>
          <p className={styles.warning}>⚠️ প্রথমে লগইন করার পর পাসওয়ার্ড পরিবর্তন করুন</p>
        </div>
      </div>
    </div>
  );
}
