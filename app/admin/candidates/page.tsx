// app/admin/candidates/page.tsx
"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { jobCategories } from "@/lib/job-categories";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CalendarDays } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getGeneralWaText = (candidate: any) => {
  return `\u{1F4B3} *ONLINE PAYMENT REQUEST* \u{1F4B3}
━━━━━━━━━━━━━━━━━━━━━
Dear *${candidate.user?.fullName || "Candidate"}*,

We are pleased to inform you that your profile has been processed successfully. To unlock exclusive job opportunities and proceed further with your application, please complete your Premium Candidate registration payment.

*Payment Details:*
\u{25AA}\u{FE0F} *Amount Due:* ₹499
\u{25AA}\u{FE0F} *Service:* Premium Candidate

\u{1F449} *Click below to pay securely via Razorpay:*
\u{1F517} https://razorpay.me/@shivshaktimultiservice?amount=n%2FUUsdogj%2F7sarE2WD13qg%3D%3D

\u{26A0}\u{FE0F} *Important Note:* Once the payment is completed, kindly reply to this message with a *screenshot of the payment receipt* for confirmation.

\u{2B50} *We Value Your Feedback*
\u{1F449} [Leave a Review: https://g.page/r/CZZBLKQak0G_EBE/review]

Thank you! \u{1F91D}

*Warm Regards,*
*Shiv Shakti Multi Service*
_Recruitment & Placement Services_
━━━━━━━━━━━━━━━━━━━━━`;
};

function CandidatesContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type"); // "paid" | "unpaid" | null
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interview Scheduling State
  const [schedulingFor, setSchedulingFor] = useState<any>(null);
  const [interviewForm, setInterviewForm] = useState({
    companyName: "",
    designation: "",
    date: "",
    time: "",
    location: "",
  });
  const [schedulingProcess, setSchedulingProcess] = useState(false);

  // Manual Add Candidate State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    selectedJobField: "",
    preferredJobField: "",
    experience: "",
    city: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // Online Pay State
  const [onlinePayFor, setOnlinePayFor] = useState<any>(null);
  const [onlinePayForm, setOnlinePayForm] = useState({
    amount: "499",
    link: "",
  });
  const [linkSentData, setLinkSentData] = useState<Record<string, number>>({});
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const [processingCashId, setProcessingCashId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  });

  const [search, setSearch] = useState("");

  const [experienceFilter, setExperienceFilter] = useState("All");
  const [jobCategoryFilter, setJobCategoryFilter] =
    useState("All");
  const [jobFieldFilter, setJobFieldFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const candidatesPerPage = 10;

  useEffect(() => {
    loadCandidates();
  }, [typeParam]);

  const loadCandidates = async () => {
    try {
      setLoading(true);

      const url = typeParam ? `/api/admin/candidates?type=${typeParam}` : "/api/admin/candidates";
      const response = await fetch(url);
      
      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        toast.error("Invalid server response. Please try again.");
        return;
      }

      if (response.ok && result.success) {
        setCandidates(result.candidates || []);
        setStats(result.stats || {
          total: 0, applied: 0, shortlisted: 0, interview: 0, selected: 0, rejected: 0
        });
      } else {
        toast.error(
          result.message || "Unable to load candidates."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while loading candidates.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      candidate.user?.fullName
        ?.toLowerCase()
        .includes(searchText) ||
      candidate.user?.email
        ?.toLowerCase()
        .includes(searchText) ||
      (candidate.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      (candidate.city || "")
        .toLowerCase()
        .includes(searchText) ||
      (candidate.state || "")
        .toLowerCase()
        .includes(searchText) ||
      (candidate.highestQualification || "")
        .toLowerCase()
        .includes(searchText) ||
      (candidate.skills || "")
        .toLowerCase()
        .includes(searchText) ||
      (candidate.selectedJobField || "")
        .toLowerCase()
        .includes(searchText) ||
      (candidate.preferredJobField || "")
        .toLowerCase()
        .includes(searchText);

    const matchesExperience =
      experienceFilter === "All" ||
      candidate.experience === experienceFilter;

    const matchesJobCategory =
      jobCategoryFilter === "All" ||
      candidate.selectedJobField === jobCategoryFilter;

    const matchesJobField =
      jobFieldFilter === "All" ||
      candidate.preferredJobField === jobFieldFilter;

    const matchesStatus =
      statusFilter === "All" ||
      candidate.status === statusFilter;

    return (
      matchesSearch &&
      matchesExperience &&
      matchesJobCategory &&
      matchesJobField &&
      matchesStatus
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / candidatesPerPage)
  );

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    experienceFilter,
    jobCategoryFilter,
    jobFieldFilter,
    statusFilter,
  ]);

  const deleteCandidate = async (id: string) => {
    try {
      const response = await fetch(
        `/api/admin/candidates/${id}`,
        {
          method: "DELETE",
        }
      );

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        toast.error("Invalid server response.");
        return;
      }

      if (response.ok && result.success) {
        await loadCandidates();
        toast.success("Candidate deleted successfully.");
      } else {
        toast.error(
          result.message || "Unable to delete candidate."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        "/api/admin/candidates/status",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        toast.error("Invalid server response.");
        return;
      }

      if (response.ok && result.success) {
        setCandidates((previousCandidates) =>
          previousCandidates.map((candidate) =>
            candidate.id === id
              ? {
                  ...candidate,
                  status,
                }
              : candidate
          )
        );

        toast.success("Status updated successfully.");
      } else {
        toast.error(
          result.message || "Unable to update status."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  const markAsPaidCash = async (id: string) => {
    const amountStr = window.prompt("Enter payment amount (e.g., 499 or 799):", "499");
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setProcessingCashId(id);
    try {
      const response = await fetch(`/api/admin/candidates/${id}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        toast.error("Invalid server response.");
        return;
      }

      if (response.ok && result.success) {
        await loadCandidates();
        toast.success("Candidate marked as paid via Cash.");

        if (result.receiptDetails) {
          const rd = result.receiptDetails;
          const waText = `\u{1F9FE} *OFFICIAL PAYMENT RECEIPT* \u{1F9FE}
━━━━━━━━━━━━━━━━━━━━━
Dear *${rd.candidateName}*,

We are pleased to confirm that your payment has been successfully received. Welcome to our Premium Candidate service! \u{1F389}

*Payment Details:*
\u{25AA}\u{FE0F} *Amount Paid:* ₹${rd.amount}
\u{25AA}\u{FE0F} *Payment Mode:* Cash \u{1F4B5}
\u{25AA}\u{FE0F} *Receipt ID:* ${rd.receiptNumber}
\u{25AA}\u{FE0F} *Date:* ${rd.dateStr}
\u{25AA}\u{FE0F} *Service:* Premium Candidate

\u{2705} Your Premium Candidate service is now *Active*.

\u{2B50} *We Value Your Feedback*
We would love to hear about your experience with Shiv Shakti Multi Service.
\u{1F449} [Leave a Review: https://g.page/r/CZZBLKQak0G_EBE/review]

Thank you for choosing us! \u{1F91D}

*Warm Regards,*
*Shiv Shakti Multi Service*
_Recruitment & Placement Services_
━━━━━━━━━━━━━━━━━━━━━`;

          window.open(`https://wa.me/91${rd.phone}?text=${encodeURIComponent(waText)}`, "_blank");
        }
      } else {
        toast.error(result.message || "Unable to update payment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setProcessingCashId(null);
    }
  };

  const scheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingFor) return;

    setSchedulingProcess(true);
    try {
      const response = await fetch(`/api/admin/candidates/${schedulingFor.id}/schedule-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewForm),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        toast.error("Invalid server response.");
        return;
      }

      if (response.ok && result.success) {
        toast.success("Interview scheduled & Email sent!");
        
        // Format the new WhatsApp message
        const waText = `✨ INTERVIEW INVITATION

Dear Sir/Mam ${schedulingFor.user?.fullName || "Candidate"},

Greetings from Shiv Shakti Multi Service.

We are pleased to inform you that your interview has been officially scheduled with ${interviewForm.companyName}. Kindly find the interview details below:

━━━━━━━━━━━━━━━━━━
🏢 Company: ${interviewForm.companyName}
💼 Designation: ${interviewForm.designation}
📅 Date: ${interviewForm.date}
⏰ Time: ${interviewForm.time}
📍 Location: ${interviewForm.location}
━━━━━━━━━━━━━━━━━━

Important:
Please arrive 10–15 minutes before the scheduled time and come prepared with the necessary documents and a copy of your updated resume.

We wish you success in your interview and look forward to your presence.
Please Provide Rating : https://g.page/r/CZZBLKQak0G_EBE/review 

Warm Regards,
Shiv Shakti Multi Service
Recruitment • Placement • Multi Services`;

        // Open WhatsApp automatically with pre-filled message
        window.open(`https://wa.me/91${schedulingFor.phone}?text=${encodeURIComponent(waText)}`, "_blank");
        
        setSchedulingFor(null);
        setInterviewForm({ companyName: "", designation: "", date: "", time: "", location: "" });
      } else {
        toast.error(result.message || "Unable to schedule interview.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSchedulingProcess(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName || !addForm.phone || !addForm.email || !addForm.selectedJobField || !addForm.preferredJobField || !addForm.experience || !addForm.city) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/candidates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Candidate added successfully!");
        setIsAddModalOpen(false);
        setAddForm({ fullName: "", phone: "", email: "", selectedJobField: "", preferredJobField: "", experience: "", city: "" });
        await loadCandidates();
      } else {
        toast.error(result.message || "Unable to add candidate.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while adding candidate.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleOnlinePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlinePayFor) return;

    if (!onlinePayForm.amount || !onlinePayForm.link) {
      toast.error("Please fill in both amount and link.");
      return;
    }

    const waText = `\u{1F4B3} *ONLINE PAYMENT REQUEST* \u{1F4B3}
━━━━━━━━━━━━━━━━━━━━━
Dear *${onlinePayFor.user?.fullName || "Candidate"}*,

We are pleased to inform you that your profile has been processed successfully. To unlock exclusive job opportunities and proceed further with your application, please complete your Premium Candidate registration payment.

*Payment Details:*
\u{25AA}\u{FE0F} *Amount Due:* ₹${onlinePayForm.amount}
\u{25AA}\u{FE0F} *Service:* Premium Candidate

\u{1F449} *Click below to pay securely via Razorpay:*
\u{1F517} ${onlinePayForm.link}

\u{26A0}\u{FE0F} *Important Note:* Once the payment is completed, kindly reply to this message with a *screenshot of the payment receipt* for confirmation.

\u{2B50} *We Value Your Feedback*
\u{1F449} [Leave a Review: https://g.page/r/CZZBLKQak0G_EBE/review]

Thank you! \u{1F91D}

*Warm Regards,*
*Shiv Shakti Multi Service*
_Recruitment & Placement Services_
━━━━━━━━━━━━━━━━━━━━━`;

    window.open(`https://wa.me/91${onlinePayFor.phone}?text=${encodeURIComponent(waText)}`, "_blank");
    
    setLinkSentData(prev => ({ ...prev, [onlinePayFor.id]: Number(onlinePayForm.amount) }));
    setOnlinePayFor(null);
    setOnlinePayForm({ amount: "499", link: "" });
  };

  const confirmOnlinePayment = async (id: string, amountToConfirm: number) => {
    setConfirmingPayment(id);
    try {
      const response = await fetch(`/api/admin/candidates/${id}/mark-paid-online`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountToConfirm }),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        toast.error("Invalid server response.");
        return;
      }

      if (response.ok && result.success) {
        await loadCandidates();
        toast.success("Candidate marked as paid via Online.");

        if (result.receiptDetails) {
          const rd = result.receiptDetails;
          const waText = `\u{1F9FE} *OFFICIAL ONLINE PAYMENT RECEIPT* \u{1F9FE}
━━━━━━━━━━━━━━━━━━━━━
Dear *${rd.candidateName}*,

We are pleased to confirm that your online payment has been successfully received. Welcome to our Premium Candidate service! \u{1F389}

*Payment Details:*
\u{25AA}\u{FE0F} *Amount Paid:* ₹${rd.amount}
\u{25AA}\u{FE0F} *Payment Mode:* Online \u{1F4B3}
\u{25AA}\u{FE0F} *Receipt ID:* ${rd.receiptNumber}
\u{25AA}\u{FE0F} *Date:* ${rd.dateStr}
\u{25AA}\u{FE0F} *Service:* Premium Candidate

\u{2705} Your Premium Candidate service is now *Active*.

\u{2B50} *We Value Your Feedback*
We would love to hear about your experience with Shiv Shakti Multi Service.
\u{1F449} [Leave a Review: https://g.page/r/CZZBLKQak0G_EBE/review]

Thank you for choosing us! \u{1F91D}

*Warm Regards,*
*Shiv Shakti Multi Service*
_Recruitment & Placement Services_
━━━━━━━━━━━━━━━━━━━━━`;

          window.open(`https://wa.me/91${rd.phone}?text=${encodeURIComponent(waText)}`, "_blank");
        }
      } else {
        toast.error(result.message || "Unable to confirm online payment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setConfirmingPayment(null);
    }
  };

  const getCategoryLabel = (selectedJobField?: string, preferredJobField?: string) => {
    const field = selectedJobField || preferredJobField;
    if (field) {
      if (jobCategories[field as keyof typeof jobCategories]) {
        return field;
      }
      const category = Object.entries(jobCategories).find(([, jobs]) =>
        jobs.includes(field)
      );
      if (category) return category[0];
    }
    return "-";
  };

  const availableJobFields =
    jobCategoryFilter === "All"
      ? Array.from(
          new Set(
            Object.values(jobCategories).flat()
          )
        )
      : jobCategories[
          jobCategoryFilter as keyof typeof jobCategories
        ] || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {typeParam === "paid" ? "Paid Candidates" : typeParam === "unpaid" ? "Unpaid Candidates" : "All Candidates"}
          </h1>
          {typeParam !== "paid" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl bg-black px-4 py-2 font-bold text-white transition hover:bg-zinc-800"
            >
              + Add Candidate
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          <div className="rounded-2xl border bg-white p-4 shadow sm:p-5">
            <p className="text-sm text-zinc-500">
              Total
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {stats.total}
            </h2>
          </div>

          <div className="rounded-2xl border bg-yellow-50 p-4 shadow sm:p-5">
            <p className="text-sm">Applied</p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {stats.applied}
            </h2>
          </div>

          <div className="rounded-2xl border bg-blue-50 p-4 shadow sm:p-5">
            <p className="text-sm">Shortlisted</p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {stats.shortlisted}
            </h2>
          </div>

          <div className="rounded-2xl border bg-purple-50 p-4 shadow sm:p-5">
            <p className="text-sm">Interview</p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {stats.interview}
            </h2>
          </div>

          <div className="rounded-2xl border bg-green-50 p-4 shadow sm:p-5">
            <p className="text-sm">Selected</p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {stats.selected}
            </h2>
          </div>

          <div className="rounded-2xl border bg-red-50 p-4 shadow sm:p-5">
            <p className="text-sm">Rejected</p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {stats.rejected}
            </h2>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-4 shadow-sm sm:p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
            {/* Search */}
            <div className="relative w-full lg:w-auto lg:flex-1 lg:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name, email, city..."
                className="w-full rounded-xl border border-zinc-300 bg-white text-zinc-900 py-2.5 pl-10 pr-10 text-sm outline-none transition-all duration-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 min-w-[200px]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Experience */}
            <select
              value={experienceFilter}
              onChange={(e) =>
                setExperienceFilter(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none lg:w-auto lg:max-w-[140px] shrink-0 truncate"
            >
              <option value="All">
                All Experience
              </option>
              <option value="Fresher">
                Fresher
              </option>
              <option value="Experienced">
                Experienced
              </option>
            </select>

            {/* JOB CATEGORY FILTER */}
            <select
              value={jobCategoryFilter}
              onChange={(e) => {
                setJobCategoryFilter(e.target.value);
                setJobFieldFilter("All");
              }}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none lg:w-auto lg:max-w-[180px] shrink-0 truncate"
            >
              <option value="All">
                All Job Categories
              </option>

              {Object.keys(jobCategories).map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>

            {/* PREFERRED JOB FILTER */}
            <select
              value={jobFieldFilter}
              onChange={(e) =>
                setJobFieldFilter(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none lg:w-auto lg:max-w-[180px] shrink-0 truncate"
            >
              <option value="All">
                All Preferred Jobs
              </option>

              {availableJobFields.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none lg:w-auto lg:max-w-[140px] shrink-0 truncate"
            >
              <option value="All">
                All Status
              </option>
              <option value="Applied">
                Applied
              </option>
              <option value="Shortlisted">
                Shortlisted
              </option>
              <option value="Interview">
                Interview
              </option>
              <option value="Selected">
                Selected
              </option>
              <option value="Rejected">
                Rejected
              </option>
            </select>
          </div>

          {loading ? (
            <div className="py-16 text-center text-zinc-500">
              Loading candidates...
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 lg:block">
                <table className="w-full min-w-[1250px] border-collapse">
                  <thead className="bg-zinc-100">
                    <tr>
                      <th className="p-4 text-left">
                        Name
                      </th>
                      <th className="p-4 text-left">
                        Email
                      </th>
                      <th className="p-4 text-left">
                        City
                      </th>
                      <th className="p-4 text-left">
                        Experience
                      </th>
                      <th className="p-4 text-left">
                        Status
                      </th>
                      <th className="p-4 text-left">
                        Job Category
                      </th>
                      <th className="p-4 text-left">
                        Preferred Job
                      </th>
                      <th className="p-4 text-left">
                        Interviews
                      </th>
                      <th className="p-4 text-left">
                        Phone
                      </th>
                      <th className="p-4 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedCandidates.length > 0 ? (
                      paginatedCandidates.map(
                        (candidate) => (
                          <tr
                            key={candidate.id}
                            className="border-b transition hover:bg-zinc-50"
                          >
                            <td className="p-4 font-medium">
                              {candidate.user?.fullName || "-"}
                            </td>

                            <td className="p-4">
                              {candidate.user?.email || "-"}
                            </td>

                            <td className="p-4">
                              {candidate.city || "-"}
                            </td>

                            <td className="p-4">
                              {candidate.experience || "-"}
                            </td>

                            <td className="p-4">
                              <select
                                value={candidate.status}
                                onChange={(e) =>
                                  updateStatus(
                                    candidate.id,
                                    e.target.value
                                  )
                                }
                                className="rounded-lg border px-3 py-2 text-sm"
                              >
                                <option value="Applied">
                                  Applied
                                </option>
                                <option value="Shortlisted">
                                  Shortlisted
                                </option>
                                <option value="Interview">
                                  Interview
                                </option>
                                <option value="Selected">
                                  Selected
                                </option>
                                <option value="Rejected">
                                  Rejected
                                </option>
                              </select>
                            </td>

                            <td className="p-4">
                              {getCategoryLabel(
                                candidate.selectedJobField
                              )}
                            </td>

                            <td className="p-4">
                              {candidate.preferredJobField || "-"}
                            </td>

                            <td className="p-4 text-center">
                              {candidate._count?.interviews || 0}
                            </td>

                            <td className="p-4">
                              {candidate.phone ? (
                                <div className="flex flex-col gap-2">
                                  <a
                                    href={`tel:${candidate.phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {candidate.phone}
                                  </a>

                                  <a
                                    href={`https://wa.me/91${candidate.phone}?text=${encodeURIComponent(getGeneralWaText(candidate))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-fit items-center justify-center rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
                                  >
                                    WhatsApp
                                  </a>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="p-4">
                              <div className="flex gap-2">
                                {!candidate.user?.payments?.some((p: any) => p.status === "SUCCESS") && (
                                  <>
                                    <button
                                      onClick={() => markAsPaidCash(candidate.id)}
                                      disabled={processingCashId === candidate.id}
                                      className="rounded bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                      {processingCashId === candidate.id ? "Processing..." : "Mark Paid (Cash)"}
                                    </button>
                                    
                                    {linkSentData[candidate.id] ? (
                                      <button
                                        onClick={() => confirmOnlinePayment(candidate.id, linkSentData[candidate.id])}
                                        disabled={confirmingPayment === candidate.id}
                                        className="rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                      >
                                        {confirmingPayment === candidate.id ? "Confirming..." : "Confirm Payment"}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setOnlinePayFor(candidate)}
                                        className="rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 cursor-pointer"
                                      >
                                        Fees (Online Pay)
                                      </button>
                                    )}
                                  </>
                                )}

                                <button
                                  onClick={() => setSchedulingFor(candidate)}
                                  className="flex items-center gap-1 rounded bg-orange-500 px-3 py-2 text-xs text-white transition hover:bg-orange-600 cursor-pointer"
                                >
                                  <CalendarDays size={14} />
                                  Schedule
                                </button>

                                <Link
                                  href={`/admin/candidates/${candidate.id}`}
                                  className="rounded bg-blue-600 px-3 py-2 text-xs text-white transition hover:bg-blue-700 cursor-pointer"
                                >
                                  View
                                </Link>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="rounded bg-red-600 px-3 py-2 text-xs text-white transition hover:bg-red-700 cursor-pointer">
                                      Delete
                                    </button>
                                  </AlertDialogTrigger>

                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete candidate?
                                      </AlertDialogTitle>

                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                        The candidate will be permanently
                                        deleted.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>

                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteCandidate(
                                            candidate.id
                                          )
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-10 text-center text-zinc-500"
                        >
                          No candidates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 lg:hidden">
                {paginatedCandidates.length > 0 ? (
                  paginatedCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="rounded-2xl border bg-white p-4 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold">
                        {candidate.user?.fullName || "-"}
                      </h3>

                      <p className="mt-1 break-all text-sm text-zinc-500">
                        {candidate.user?.email || "-"}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-zinc-700">
                            City
                          </span>
                          <p className="mt-1 text-zinc-600">
                            {candidate.city || "-"}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-zinc-700">
                            Experience
                          </span>
                          <p className="mt-1 text-zinc-600">
                            {candidate.experience || "-"}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-zinc-700">
                            Job Category
                          </span>
                          <p className="mt-1 wrap-break-words text-zinc-600">
                            {getCategoryLabel(
                              candidate.selectedJobField
                            )}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-zinc-700">
                            Preferred Job
                          </span>
                          <p className="mt-1 wrap-break-words text-zinc-600">
                            {candidate.preferredJobField || "-"}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-zinc-700">
                            Interviews
                          </span>
                          <p className="mt-1 text-zinc-600">
                            {candidate._count?.interviews || 0}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <span className="font-medium text-zinc-700">
                            Status
                          </span>

                          <select
                            value={candidate.status}
                            onChange={(e) =>
                              updateStatus(
                                candidate.id,
                                e.target.value
                              )
                            }
                            className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          >
                            <option value="Applied">
                              Applied
                            </option>
                            <option value="Shortlisted">
                              Shortlisted
                            </option>
                            <option value="Interview">
                              Interview
                            </option>
                            <option value="Selected">
                              Selected
                            </option>
                            <option value="Rejected">
                              Rejected
                            </option>
                          </select>
                        </div>
                      </div>

                      {candidate.phone && (
                        <div className="mt-4 border-t pt-4">
                          <span className="text-sm font-medium text-zinc-700">
                            Phone
                          </span>

                          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <a
                              href={`tel:${candidate.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {candidate.phone}
                            </a>

                            <a
                              href={`https://wa.me/91${candidate.phone}?text=${encodeURIComponent(getGeneralWaText(candidate))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        {!candidate.user?.payments?.some((p: any) => p.status === "SUCCESS") && (
                          <>
                            <button
                              onClick={() => markAsPaidCash(candidate.id)}
                              disabled={processingCashId === candidate.id}
                              className="col-span-1 rounded-xl bg-green-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-green-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {processingCashId === candidate.id ? "Processing..." : "Mark Paid (Cash)"}
                            </button>
                            
                            {linkSentData[candidate.id] ? (
                              <button
                                onClick={() => confirmOnlinePayment(candidate.id, linkSentData[candidate.id])}
                                disabled={confirmingPayment === candidate.id}
                                className="col-span-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {confirmingPayment === candidate.id ? "Confirming..." : "Confirm Payment"}
                              </button>
                            ) : (
                              <button
                                onClick={() => setOnlinePayFor(candidate)}
                                className="col-span-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-700 cursor-pointer"
                              >
                                Fees (Online Pay)
                              </button>
                            )}
                          </>
                        )}
                        
                        <button
                          onClick={() => setSchedulingFor(candidate)}
                          className="col-span-2 flex items-center justify-center gap-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 cursor-pointer"
                        >
                          <CalendarDays size={16} />
                          Schedule Interview
                        </button>

                        <Link
                          href={`/admin/candidates/${candidate.id}`}
                          className="rounded-xl bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
                        >
                          View
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 cursor-pointer">
                              Delete
                            </button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete candidate?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                This action cannot be undone.
                                The candidate will be permanently
                                deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() =>
                                  deleteCandidate(candidate.id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border p-8 text-center text-zinc-500">
                    No candidates found.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredCandidates.length > 0 &&
                totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-5 sm:flex-row">
                    <p className="text-sm text-zinc-500">
                      Showing{" "}
                      {(currentPage - 1) *
                        candidatesPerPage +
                        1}
                      {" – "}
                      {Math.min(
                        currentPage * candidatesPerPage,
                        filteredCandidates.length
                      )}{" "}
                      of {filteredCandidates.length} candidates
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(page - 1, 1)
                          )
                        }
                        disabled={currentPage === 1}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        ‹
                      </button>

                      <div className="flex h-9 min-w-[80px] items-center justify-center rounded-lg border bg-white px-3 text-sm font-medium text-zinc-700">
                        {currentPage} / {totalPages}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(
                              page + 1,
                              totalPages
                            )
                          )
                        }
                        disabled={
                          currentPage === totalPages
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Next page"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </main>

      {/* Schedule Interview Modal */}
      {schedulingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Schedule Interview</h2>
              <button 
                onClick={() => setSchedulingFor(null)}
                className="rounded-full p-2 hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="mb-4 text-sm text-zinc-500">
              Scheduling for <strong>{schedulingFor.user.fullName}</strong>.
            </p>

            <form onSubmit={scheduleInterview} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Company Name</label>
                <input
                  required
                  type="text"
                  value={interviewForm.companyName}
                  onChange={(e) => setInterviewForm({...interviewForm, companyName: e.target.value})}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Designation (Job Role)</label>
                <input
                  required
                  type="text"
                  value={interviewForm.designation}
                  onChange={(e) => setInterviewForm({...interviewForm, designation: e.target.value})}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Date</label>
                  <input
                    required
                    type="date"
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Time</label>
                  <input
                    required
                    type="time"
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Location / Meet Link</label>
                <input
                  required
                  type="text"
                  value={interviewForm.location}
                  onChange={(e) => setInterviewForm({...interviewForm, location: e.target.value})}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-zinc-900"
                />
              </div>

              <button
                type="submit"
                disabled={schedulingProcess}
                className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-center font-bold text-white transition hover:bg-zinc-800 disabled:opacity-70"
              >
                {schedulingProcess ? "Scheduling & Sending..." : "Schedule & Send Email + WA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CANDIDATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Candidate</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Email *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Experience *</label>
                <select
                  required
                  value={addForm.experience}
                  onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black"
                >
                  <option value="">Select Experience</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">City *</label>
                <input
                  type="text"
                  required
                  value={addForm.city}
                  onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                  placeholder="e.g. Haridwar"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <SearchableSelect
                label="Job Category"
                required
                value={addForm.selectedJobField}
                onChange={(val) =>
                  setAddForm({
                    ...addForm,
                    selectedJobField: val,
                    preferredJobField: "",
                  })
                }
                options={Object.keys(jobCategories)}
                placeholder="Select or search category..."
                searchPlaceholder="Search category..."
              />

              <SearchableSelect
                label="Preferred Job"
                required
                disabled={!addForm.selectedJobField}
                disabledMessage="Please select a Job Category first"
                value={addForm.preferredJobField}
                onChange={(val) =>
                  setAddForm({ ...addForm, preferredJobField: val })
                }
                options={
                  addForm.selectedJobField
                    ? jobCategories[addForm.selectedJobField as keyof typeof jobCategories] || []
                    : []
                }
                placeholder={
                  addForm.selectedJobField
                    ? "Select or search job..."
                    : "First select a Job Category"
                }
                searchPlaceholder="Search preferred job..."
              />

              <p className="text-xs text-zinc-500">
                Default password will be set to: <strong>00000000</strong>
              </p>

              <button
                type="submit"
                disabled={isAdding}
                className="mt-4 w-full rounded-xl bg-black py-3 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-70"
              >
                {isAdding ? "Adding..." : "Add Candidate"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ONLINE PAY MODAL */}
      {onlinePayFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Send Payment Link</h2>
              <button onClick={() => setOnlinePayFor(null)} className="rounded-full p-1 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            
            <p className="mb-4 text-sm text-zinc-500">
              Sending payment link to <strong>{onlinePayFor.user?.fullName}</strong>.
            </p>

            <form onSubmit={handleOnlinePaySubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Amount (₹) *</label>
                <input
                  type="text"
                  required
                  value={onlinePayForm.amount}
                  onChange={(e) => setOnlinePayForm({ ...onlinePayForm, amount: e.target.value })}
                  placeholder="e.g. 499"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Razorpay Link *</label>
                <input
                  type="url"
                  required
                  value={onlinePayForm.link}
                  onChange={(e) => setOnlinePayForm({ ...onlinePayForm, link: e.target.value })}
                  placeholder="https://rzp.io/..."
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-700"
              >
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <CandidatesContent />
    </Suspense>
  );
}
