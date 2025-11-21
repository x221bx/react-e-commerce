import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import Button from "../../components/ui/Button";


export default function Complaints() {
  const [complaints, setComplaints] = useState([]);

  const user = useSelector(selectCurrentUser);
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // Load user's complaints
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "support"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const complaintsData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aDate = a.createdAt?.toMillis?.() || 0;
          const bDate = b.createdAt?.toMillis?.() || 0;
          return bDate - aDate;
        });
      setComplaints(complaintsData);
    });

    return () => unsubscribe();
  }, [user?.uid]);


  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "in-progress": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
      case "resolved": return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "closed": return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "high": return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30";
      case "urgent": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("account.login_required_title", "Please log in to view your complaints")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("account.login_required_subtitle", "You need to be logged in to access your complaint history.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("account.complaints_title", "My Complaints")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("account.complaints_subtitle", "Track your submitted complaints and their resolution status.")}
          </p>
        </div>

        {/* New Complaint Button */}
        <div className="mb-6">
          <Button
            text={t("account.submit_new_complaint", "Submit New Complaint")}
            onClick={() => navigate('/account/support')}
          />
        </div>


        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("account.no_complaints_title", "No complaints yet")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("account.no_complaints_subtitle", "You haven't submitted any complaints yet. Click the button above to submit your first complaint.")}
              </p>
            </div>
          ) : (
            complaints.map((complaint) => {
              const topicKey = complaint.topic
                ? `account.complaints_topics.${complaint.topic}`
                : "account.complaints_topic_fallback";
              const statusKey = complaint.status
                ? `account.complaints_status.${complaint.status}`
                : "account.complaints_status.pending";
              return (
              <div key={complaint.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t(topicKey, complaint.topic || t("account.complaints.topic_fallback", "General support"))}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {complaint.message}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {t(statusKey, complaint.status || "pending")}
                      </span>
                      {complaint.phoneNumber && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {`\u{1F4DE} ${complaint.phoneNumber}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {complaint.createdAt?.toDate?.()?.toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}

