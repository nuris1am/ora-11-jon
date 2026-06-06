"use client";

import { useState, useEffect } from "react";
import styles from "./membersList.module.css";

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>লোড হচ্ছে...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>ওরা এগারো জন সমিতির সদস্য</h1>

      <div className={styles.adminLink}>
        <a href="/members-admin">সদস্য ব্যবস্থাপনা (Admin)</a>
      </div>

      {members.length === 0 ? (
        <div className={styles.empty}>কোন সদস্য পাওয়া যায়নি</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SL</th>
                <th>নাম</th>
                <th>শেয়ার</th>
                <th>ঠিকানা</th>
                <th>সদস্যপদ ধরন</th>
                <th>কাজের স্থান</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={member.id}>
                  <td>{index + 1}</td>
                  <td>{member.name}</td>
                  <td>{member.share}</td>
                  <td>{member.address}</td>
                  <td>{member.membershipType}</td>
                  <td>{member.workingLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
