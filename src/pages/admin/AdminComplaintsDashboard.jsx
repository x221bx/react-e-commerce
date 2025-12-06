import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  getDoc,
  addDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";

// Import components
import ComplaintsStats from "./components/ComplaintsStats";
import ComplaintsFilters from "./components/ComplaintsFilters";
import ComplaintsList from "./components/ComplaintsList";
import ComplaintsModal from "./components/ComplaintsModal";

const AdminComplaintsDashboard = () => {
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  // State management
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [respondingTo, setRespondingTo] = useState(null);
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: ""
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0
  });

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status", color: "gray" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "in-progress", label: "In Progress", color: "blue" },
    { value: "resolved", label: "Resolved", color: "green" },
    { value: "closed", label: "Closed", color: "gray" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities", color: "gray" },
    { value: "urgent", label: "Urgent", color: "red" },
    { value: "high", label: "High", color: "orange" },
    { value: "normal", label: "Normal", color: "blue" },
    { value: "low", label: "Low", color: "green" }
  ];

  // Fetch complaints data
  useEffect(() => {
    const q = query(collection(db, "support"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const raw = doc.data();
        const normalizedStatus = (raw.status || "pending").toLowerCase();
        const repliesArray = Array.isArray(raw.replies)
          ? raw.replies
          : Array.isArray(raw.adminResponses)
          ? raw.adminResponses.map(r => ({
              id: r.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
              message: r.message,
              sender: r.sender || "admin",
              timestamp: r.timestamp || r.createdAt || raw.respondedAt || raw.createdAt
            }))
          : raw.adminResponse
          ? [{
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              message: raw.adminResponse,
              sender: "admin",
              timestamp: raw.respondedAt || raw.updatedAt || raw.createdAt
            }]
          : [];

        return {
          id: doc.id,
          ...raw,
          status: normalizedStatus,
          replies: repliesArray,
          createdAt: raw.createdAt?.toDate?.() || new Date(raw.createdAt),
          updatedAt: raw.updatedAt?.toDate?.() || new Date(raw.updatedAt)
        };
      });
      setComplaints(data);

      // Update selectedComplaint if it's currently selected and data has changed
      if (selectedComplaint) {
        const updatedComplaint = data.find(c => c.id === selectedComplaint.id);
        if (updatedComplaint) {
          setSelectedComplaint(updatedComplaint);
        }
      }

      calculateStats(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedComplaint?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [selectedComplaint?.replies]);

  // Calculate dashboard statistics
  const calculateStats = (complaintsData) => {
    const total = complaintsData.length;
    const pending = complaintsData.filter(c => c.status === "pending").length;
    const inProgress = complaintsData.filter(c => c.status === "in-progress").length;
    const resolved = complaintsData.filter(c => c.status === "resolved").length;
    const urgent = complaintsData.filter(c => c.priority === "urgent").length;

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      urgent
    });
  };

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesStatus = filters.status === "all" || complaint.status === filters.status;
      const matchesPriority = filters.priority === "all" || complaint.priority === filters.priority;
      const matchesCategory = filters.category === "all" || complaint.category === filters.category;
      const matchesSearch = !filters.search ||
        complaint.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.userEmail?.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.phoneNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.id?.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.ticketId?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [complaints, filters]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Get priority color and icon
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case "urgent": return { color: "text-red-600", bg: "bg-red-100", icon: () => null };
      case "high": return { color: "text-orange-600", bg: "bg-orange-100", icon: () => null };
      case "normal": return { color: "text-blue-600", bg: "bg-blue-100", icon: () => null };
      case "low": return { color: "text-green-600", bg: "bg-green-100", icon: () => null };
      default: return { color: "text-gray-600", bg: "bg-gray-100", icon: () => null };
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Handle status change
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const complaintRef = doc(db, "support", complaintId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date()
      };

      // If resolving, calculate SLA metrics
      if (newStatus === "resolved") {
        const complaint = complaints.find(c => c.id === complaintId);
        if (complaint) {
          const responseTime = Math.floor((new Date() - complaint.createdAt) / (1000 * 60 * 60)); // hours
          updateData.sla = {
            ...complaint.sla,
            actualResponseTime: responseTime,
            actualResolutionTime: responseTime
          };
        }
      }

      await updateDoc(complaintRef, updateData);

      // Update the selectedComplaint state immediately for UI feedback
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(prev => ({
          ...prev,
          status: newStatus,
          updatedAt: new Date()
        }));
      }

      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update ticket status");
    }
  };

  // Handle priority change with tracking
  const handlePriorityChange = async (complaintId, newPriority) => {
    try {
      const complaintRef = doc(db, "support", complaintId);
      const updateData = {
        priority: newPriority,
        prioritySetBy: "admin", // Track who set the priority
        prioritySetAt: new Date(),
        updatedAt: new Date()
      };

      await updateDoc(complaintRef, updateData);

      // Update the selectedComplaint state immediately for UI feedback
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(prev => ({
          ...prev,
          priority: newPriority,
          prioritySetBy: "admin",
          prioritySetAt: new Date(),
          updatedAt: new Date()
        }));
      }

      toast.success(`Priority updated to ${newPriority}`);
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    }
  };

  // Handle sending response
  const handleSendResponse = async (complaintId) => {
    if (!adminResponse.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const responseText = adminResponse.trim();
      const complaint = complaints.find(c => c.id === complaintId);
      const hasPreviousResponse = complaint.replies && complaint.replies.length > 0;
      const newStatus = hasPreviousResponse ? complaint.status : "in-progress";

      // Get current complaint data to append to replies array
      const complaintRef = doc(db, "support", complaintId);
      const complaintSnap = await getDoc(complaintRef);
      const currentData = complaintSnap.data() || {};
      const currentReplies = Array.isArray(currentData.replies) ? currentData.replies : [];

      const newReply = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: responseText,
        sender: "admin",
        timestamp: new Date()
      };

      await updateDoc(complaintRef, {
        replies: [...currentReplies, newReply],
        status: newStatus,
        respondedAt: new Date(),
        updatedAt: new Date()
      });

      // Create notification for user
      if (complaint && (complaint.uid || complaint.userId)) {
        await addDoc(collection(db, "notifications"), {
          uid: complaint.uid || complaint.userId,
          type: "support-response",
          category: "support",
          title: complaint.subject || "Support Response",
          message: responseText,
          createdAt: new Date(),
          read: false,
          target: "/account/complaints",
          meta: { complaintId }
        });
      }

      setAdminResponse("");
      // Keep input open for multiple replies
      // Removed success toast for live chat feel
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Customer Support Dashboard
            </h1>
            <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Manage and respond to customer inquiries
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <ComplaintsStats stats={stats} isDark={isDark} />

        {/* Filters */}
        <ComplaintsFilters
          filters={filters}
          setFilters={setFilters}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          isDark={isDark}
        />

        {/* Tickets List */}
        <ComplaintsList
          filteredComplaints={filteredComplaints}
          selectedComplaint={selectedComplaint}
          setSelectedComplaint={setSelectedComplaint}
          getStatusColor={getStatusColor}
          getPriorityInfo={getPriorityInfo}
          formatTimeAgo={formatTimeAgo}
          handleStatusChange={handleStatusChange}
          handlePriorityChange={handlePriorityChange}
          isDark={isDark}
        />

        {/* Ticket Detail Modal */}
        <ComplaintsModal
          selectedComplaint={selectedComplaint}
          setSelectedComplaint={setSelectedComplaint}
          respondingTo={respondingTo}
          setRespondingTo={setRespondingTo}
          adminResponse={adminResponse}
          setAdminResponse={setAdminResponse}
          handleSendResponse={handleSendResponse}
          handleStatusChange={handleStatusChange}
          handlePriorityChange={handlePriorityChange}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          getStatusColor={getStatusColor}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default AdminComplaintsDashboard;