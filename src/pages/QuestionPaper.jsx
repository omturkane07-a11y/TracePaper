import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  FileText,
  Upload,
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  Loader2,
  Fingerprint,
  Download,
  Eye,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { embedWatermark } from "../utils/watermark";

// ============================================================
// API
// ============================================================

const API_BASE_URL = "http://localhost:5000/api";

// ============================================================
// STORAGE KEYS
// ============================================================

const CURRENT_PAPER_ID_KEY =
  "tracepaper_current_paper_id";

const CURRENT_PAPER_META_KEY =
  "tracepaper_current_paper_meta";

const WATERMARK_META_KEY =
  "tracepaper_current_watermark_meta";

// ============================================================
// INDEXED DB
// ============================================================

const DB_NAME = "TracePaperDB";
const DB_VERSION = 1;
const STORE_NAME = "files";

function openTracePaperDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function saveFileToIndexedDB(file) {
  if (!file) return;

  try {
    const db = await openTracePaperDB();

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        STORE_NAME,
        "readwrite"
      );

      const store =
        transaction.objectStore(STORE_NAME);

      const request = store.put(
        {
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          blob: file,
        },
        "current-question-paper"
      );

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error(
      "IndexedDB save failed:",
      error
    );
  }
}

async function getFileFromIndexedDB() {
  try {
    const db = await openTracePaperDB();

    const record = await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            STORE_NAME,
            "readonly"
          );

        const store =
          transaction.objectStore(
            STORE_NAME
          );

        const request = store.get(
          "current-question-paper"
        );

        request.onsuccess = () =>
          resolve(request.result);

        request.onerror = () =>
          reject(request.error);
      }
    );

    db.close();

    if (!record?.blob) {
      return null;
    }

    return new File(
      [record.blob],
      record.name || "question-paper.pdf",
      {
        type:
          record.type ||
          "application/pdf",
        lastModified:
          record.lastModified ||
          Date.now(),
      }
    );
  } catch (error) {
    console.error(
      "IndexedDB read failed:",
      error
    );

    return null;
  }
}

// ============================================================
// SHA-256
// ============================================================

async function calculateSHA256(file) {
  const arrayBuffer =
    await file.arrayBuffer();

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      arrayBuffer
    );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  return hashArray
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

async function fileToBase64(file) {
  const bytes = new Uint8Array(
    await file.arrayBuffer()
  );
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, index + chunkSize)
    );
  }

  return btoa(binary);
}

// ============================================================
// JWT PAYLOAD
// ============================================================

function getUserFromToken() {
  try {
    const token =
      localStorage.getItem(
        "tracepaper_token"
      ) ||
      localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );
  } catch (error) {
    console.error(
      "JWT decode failed:",
      error
    );

    return null;
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function QuestionPaper() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const paperIdFromUrl =
    searchParams.get("id");

  const mode =
    searchParams.get("mode");

  // ==========================================================
  // MODE
  // ==========================================================

  const isReviewMode =
    mode === "review" &&
    Boolean(paperIdFromUrl);

  const isApproveMode =
    mode === "approve" &&
    Boolean(paperIdFromUrl);

  const isViewMode =
    mode === "view" &&
    Boolean(paperIdFromUrl);

  const isWorkflowMode =
    isReviewMode ||
    isApproveMode ||
    isViewMode;

  // ==========================================================
  // USER
  // ==========================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  // ==========================================================
  // CREATOR FORM
  // ==========================================================

  const [formData, setFormData] =
    useState({
      examName: "",
      examCode: "",
      subject: "",
      examDate: "",
      center: "",
    });

  const [file, setFile] =
    useState(null);

  // ==========================================================
  // PAPER DATA
  // ==========================================================

  const [paperId, setPaperId] =
    useState(null);

  const [traceId, setTraceId] =
    useState("");

  const [backendFingerprint, setBackendFingerprint] =
    useState("");

  const [fileHash, setFileHash] =
    useState("");

  const [watermarkFingerprint, setWatermarkFingerprint] =
    useState("");

  const [workflowStatus, setWorkflowStatus] =
    useState("");

  const [generated, setGenerated] =
    useState(false);

  // ==========================================================
  // SECURITY
  // ==========================================================

  const [securityStage, setSecurityStage] =
    useState("idle");

  const [watermarkVerified, setWatermarkVerified] =
    useState(false);

  const [
    downloadingSecurePaper,
    setDownloadingSecurePaper,
  ] = useState(false);

  const [creatingPaper, setCreatingPaper] =
    useState(false);

  const [restoringPaper, setRestoringPaper] =
    useState(false);

  // ==========================================================
  // WORKFLOW
  // ==========================================================

  const [reviewPaper, setReviewPaper] =
    useState(null);

  const [auditTrail, setAuditTrail] =
    useState([]);

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [
    reviewActionLoading,
    setReviewActionLoading,
  ] = useState(false);

  const [reviewComment, setReviewComment] =
    useState("");

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [previewLoading, setPreviewLoading] =
    useState(false);

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [finalDownloadAuthorized, setFinalDownloadAuthorized] =
    useState(false);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return (
      localStorage.getItem(
        "tracepaper_token"
      ) ||
      localStorage.getItem("token")
    );
  };

  const fetchFinalDownloadPermission = async (
    selectedPaperId
  ) => {
    setFinalDownloadAuthorized(false);

    if (!selectedPaperId) {
      return false;
    }

    const token = getToken();

    if (!token) {
      return false;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/question-papers/${selectedPaperId}/download-permission/secure-pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const authorized =
        response.data?.status === "success" &&
        response.data?.authorized === true;

      setFinalDownloadAuthorized(authorized);
      return authorized;
    } catch (error) {
      setFinalDownloadAuthorized(false);
      console.warn(
        "FINAL PAPER DOWNLOAD PERMISSION CHECK:",
        error.response?.data?.message || error.message
      );
      return false;
    }
  };

  // ==========================================================
  // USER LOAD
  // ==========================================================

  useEffect(() => {
    const user =
      getUserFromToken();

    setCurrentUser(user);
  }, []);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  // ==========================================================
  // FILE CHANGE
  // ==========================================================

  const handleFileChange = async (e) => {
    const selectedFile =
      e.target.files?.[0] ||
      null;

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      alert(
        "Please select a PDF question paper."
      );

      return;
    }

    setFile(selectedFile);
    setGenerated(false);
    setPaperId(null);
    setTraceId("");
    setBackendFingerprint("");
    setWatermarkFingerprint("");
    setFileHash("");
    setWorkflowStatus("");
    setWatermarkVerified(false);
    setSecurityStage("idle");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const hash =
        await calculateSHA256(
          selectedFile
        );

      setFileHash(hash);

      await saveFileToIndexedDB(
        selectedFile
      );

      console.log(
        "PDF SHA-256:",
        hash
      );
    } catch (error) {
      console.error(
        "SHA-256 calculation failed:",
        error
      );

      alert(
        "Unable to calculate PDF fingerprint."
      );
    }
  };

  // ==========================================================
  // SAVE PAPER LOCALLY
  // ==========================================================

  const saveCurrentPaperLocally = (
    paper,
    extraData = {}
  ) => {
    if (!paper?.id) {
      return;
    }

    localStorage.setItem(
      CURRENT_PAPER_ID_KEY,
      String(paper.id)
    );

    const meta = {
      id: paper.id,

      paper_code:
        paper.paper_code || "",

      paper_title:
        paper.paper_title || "",

      exam_code:
        paper.exam_code ||
        formData.examCode ||
        "",

      exam_name:
        paper.exam_name ||
        formData.examName ||
        paper.paper_title ||
        "",

      subject:
        paper.subject ||
        formData.subject ||
        "",

      exam_date:
        paper.exam_date ||
        formData.examDate ||
        "",

      center:
        extraData.center ||
        formData.center ||
        "",

      file_name:
        paper.file_name ||
        file?.name ||
        "",

      file_hash:
        paper.file_hash ||
        fileHash ||
        "",

      fingerprint:
        paper.fingerprint ||
        "",

      workflow_status:
        paper.workflow_status ||
        extraData.workflow_status ||
        "pending_review",

      updated_at:
        paper.updated_at ||
        new Date().toISOString(),
    };

    localStorage.setItem(
      CURRENT_PAPER_META_KEY,
      JSON.stringify(meta)
    );
  };

  // ==========================================================
  // WATERMARK LOCAL SAVE
  // ==========================================================

  const saveWatermarkLocally = (
    fingerprint,
    verified
  ) => {
    const data = {
      paperId:
        paperId ||
        localStorage.getItem(
          CURRENT_PAPER_ID_KEY
        ),

      fingerprint:
        fingerprint || "",

      verified:
        Boolean(verified),
    };

    localStorage.setItem(
      WATERMARK_META_KEY,
      JSON.stringify(data)
    );
  };

  // ==========================================================
  // LOAD SAVED CREATOR PAPER
  // ==========================================================

  const loadSavedPaper = async () => {
    if (isWorkflowMode) {
      return;
    }

    const savedId =
      localStorage.getItem(
        CURRENT_PAPER_ID_KEY
      );

    if (!savedId) {
      return;
    }

    const token = getToken();

    if (!token) {
      return;
    }

    try {
      setRestoringPaper(true);

      const response =
        await axios.get(
          `${API_BASE_URL}/question-papers/${savedId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (
        response.data.status !==
        "success"
      ) {
        return;
      }

      const paper =
        response.data.paper;

      if (!paper) {
        return;
      }

      await fetchFinalDownloadPermission(paper.id);

      setPaperId(paper.id);

      setTraceId(
        paper.paper_code || ""
      );

      setBackendFingerprint(
        paper.fingerprint || ""
      );

      setFileHash(
        paper.file_hash || ""
      );

      setWorkflowStatus(
        paper.workflow_status || ""
      );

      setGenerated(true);

      let savedMeta = null;

      try {
        const raw =
          localStorage.getItem(
            CURRENT_PAPER_META_KEY
          );

        if (raw) {
          savedMeta =
            JSON.parse(raw);
        }
      } catch {
        savedMeta = null;
      }

      setFormData({
        examName:
          savedMeta?.exam_name ||
          paper.exam_name ||
          paper.paper_title ||
          "",

        examCode:
          savedMeta?.exam_code ||
          paper.exam_code ||
          "",

        subject:
          savedMeta?.subject ||
          paper.subject ||
          "",

        examDate:
          savedMeta?.exam_date ||
          paper.exam_date ||
          "",

        center:
          savedMeta?.center ||
          "",
      });

      const savedFile =
        await getFileFromIndexedDB();

      if (savedFile) {
        setFile(savedFile);
      }

      try {
        const rawWatermark =
          localStorage.getItem(
            WATERMARK_META_KEY
          );

        if (rawWatermark) {
          const watermarkData =
            JSON.parse(
              rawWatermark
            );

          if (
            String(
              watermarkData.paperId
            ) ===
            String(paper.id)
          ) {
            setWatermarkFingerprint(
              watermarkData.fingerprint ||
                ""
            );

            setWatermarkVerified(
              Boolean(
                watermarkData.verified
              )
            );
          }
        }
      } catch {
        // ignore
      }

      setSecurityStage(
        "registered"
      );

      saveCurrentPaperLocally(
        paper,
        {
          center:
            savedMeta?.center || "",
        }
      );
    } catch (error) {
      console.error(
        "RESTORE PAPER ERROR:",
        error
      );

      if (
        error.response?.status ===
        404
      ) {
        localStorage.removeItem(
          CURRENT_PAPER_ID_KEY
        );

        localStorage.removeItem(
          CURRENT_PAPER_META_KEY
        );
      }
    } finally {
      setRestoringPaper(false);
    }
  };

  // ==========================================================
  // INITIAL CREATOR LOAD
  // ==========================================================

  useEffect(() => {
    if (!isWorkflowMode) {
      loadSavedPaper();
    }
  }, [isWorkflowMode]);

  // ==========================================================
  // CREATE QUESTION PAPER
  // ==========================================================

  const handleGenerate = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !formData.examName.trim() ||
      !formData.examCode.trim() ||
      !formData.subject.trim() ||
      !formData.examDate ||
      !formData.center.trim() ||
      !file
    ) {
      alert(
        "Please fill all fields and upload the question paper."
      );

      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      alert(
        "Please upload a PDF question paper."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Authentication token not found. Please login again."
      );

      navigate("/login");

      return;
    }

    const user =
      getUserFromToken();

    const role =
      String(
        user?.role || ""
      )
        .trim()
        .toLowerCase();

    if (role !== "creator") {
      alert(
        "Only Creator can create a question paper."
      );

      return;
    }

    try {
      setCreatingPaper(true);
      setSecurityStage(
        "processing"
      );

      await saveFileToIndexedDB(
        file
      );

      let calculatedHash =
        fileHash;

      if (!calculatedHash) {
        calculatedHash =
          await calculateSHA256(
            file
          );

        setFileHash(
          calculatedHash
        );
      }

      const payload = {
        exam_code:
          formData.examCode.trim(),

        paper_title:
          formData.examName.trim(),

        file_name:
          file.name,

        file_path:
          null,

        file_hash:
          calculatedHash,

        fingerprint:
          null,

        file_data: await fileToBase64(file),
      };

      const response =
        await axios.post(
          `${API_BASE_URL}/question-papers`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      if (
        response.data.status !==
        "success"
      ) {
        throw new Error(
          response.data.message ||
            "Question paper creation failed."
        );
      }

      const paper =
        response.data.paper;

      setPaperId(
        paper.id
      );

      setTraceId(
        paper.paper_code ||
          ""
      );

      setBackendFingerprint(
        paper.fingerprint ||
          ""
      );

      setWorkflowStatus(
        paper.workflow_status ||
          "pending_review"
      );

      setGenerated(true);

      setSecurityStage(
        "registered"
      );

      setWatermarkVerified(
        false
      );

      setWatermarkFingerprint(
        ""
      );

      saveCurrentPaperLocally(
        paper,
        {
          center:
            formData.center,

          workflow_status:
            paper.workflow_status ||
            "pending_review",
        }
      );

      localStorage.removeItem(
        WATERMARK_META_KEY
      );

      setSuccessMessage(
        "Question paper registered successfully and submitted for Reviewer approval."
      );
    } catch (error) {
      console.error(
        "QUESTION PAPER CREATION ERROR:",
        error
      );

      setSecurityStage(
        "idle"
      );

      setGenerated(false);

      if (
        error.response?.status ===
        401
      ) {
        alert(
          "Your login session has expired. Please login again."
        );

        navigate("/login");

        return;
      }

      if (
        error.response?.status ===
        403
      ) {
        alert(
          error.response?.data
            ?.message ||
            "Only Creator can create a question paper."
        );

        return;
      }

      if (
        error.response?.status ===
        409
      ) {
        alert(
          error.response?.data
            ?.message ||
            "This question paper already exists."
        );

        return;
      }

      const message =
        error.response?.data
          ?.message ||
        error.response?.data
          ?.detail ||
        error.message ||
        "Unable to register question paper.";

      setErrorMessage(
        message
      );

      alert(message);
    } finally {
      setCreatingPaper(
        false
      );
    }
  };

  // ==========================================================
  // SANITIZE FILE NAME
  // ==========================================================

  const sanitizeFileName = (
    text
  ) => {
    return String(
      text ?? "TracePaper"
    )
      .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "_"
      )
      .replace(
        /\s+/g,
        "_"
      );
  };

  const authorizeFinalDownload = async (
    downloadType
  ) => {
    if (!canDownloadFinalPaper) {
      alert(
        "Final paper downloads are available only to authorized users after approval."
      );

      return false;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Authentication token not found. Please login again."
      );

      navigate("/login");

      return false;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/question-papers/${paperId}/download-permission/${downloadType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data?.status === "success";
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "You are not authorized to download this final paper file.";

      alert(message);
      return false;
    }
  };

  // ==========================================================
  // SECURE PAPER DOWNLOAD
  // ==========================================================

  const handleDownloadSecurePaper =
    async () => {
      if (
        String(workflowStatus || "")
          .trim()
          .toLowerCase() !== "approved"
      ) {
        alert(
          "Secure paper download is available only after Final Approver approval."
        );

        return;
      }

      if (
        !traceId ||
        !paperId
      ) {
        alert(
          "Secure paper information is not available."
        );

        return;
      }

      let currentFile =
        file;

      if (!currentFile) {
        currentFile =
          await getFileFromIndexedDB();

        if (currentFile) {
          setFile(
            currentFile
          );
        }
      }

      if (!currentFile) {
        alert(
          "Original PDF is not available. Please upload the original PDF again."
        );

        return;
      }

      if (
        currentFile.type !==
        "application/pdf"
      ) {
        alert(
          "Only PDF question papers can be secured."
        );

        return;
      }

      const token = getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );

        navigate("/login");

        return;
      }

      try {
        if (!(await authorizeFinalDownload("secure-pdf"))) {
          return;
        }

        setDownloadingSecurePaper(
          true
        );

        const result =
          await embedWatermark(
            currentFile,
            traceId
          );

        if (
          result?.fingerprint
        ) {
          setWatermarkFingerprint(
            result.fingerprint
          );
        }

        const blob =
          new Blob(
            [
              result.pdfBytes,
            ],
            {
              type:
                "application/pdf",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `TracePaper_Secure_${sanitizeFileName(
            traceId
          )}.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        setTimeout(() => {
          URL.revokeObjectURL(
            url
          );
        }, 1000);

        setWatermarkVerified(
          true
        );

        setSecurityStage(
          "verified"
        );

        saveWatermarkLocally(
          result?.fingerprint ||
            "",
          true
        );

        setSuccessMessage(
          "Secure watermarked question paper generated successfully."
        );

        try {
          await axios.put(
            `${API_BASE_URL}/question-papers/${paperId}/lifecycle`,
            {
              status:
                "printed",
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
        } catch (auditError) {
          console.error(
            "PAPER_PRINTED audit failed:",
            auditError
          );
        }
      } catch (error) {
        console.error(
          "Secure paper generation failed:",
          error
        );

        alert(
          "Unable to create secure question paper. Please make sure the uploaded file is a valid PDF."
        );
      } finally {
        setDownloadingSecurePaper(
          false
        );
      }
    };

  // ==========================================================
  // CERTIFICATE
  // ==========================================================

  const handleDownloadCertificate =
    async () => {
      if (
        String(workflowStatus || "")
          .trim()
          .toLowerCase() !== "approved"
      ) {
        alert(
          "Certificate download is available only after Final Approver approval."
        );

        return;
      }

      if (!(await authorizeFinalDownload("certificate"))) {
        return;
      }

      if (!traceId) {
        alert(
          "Certificate information is not available."
        );

        return;
      }

      const certificateWindow =
        window.open(
          "",
          "_blank"
        );

      if (
        !certificateWindow
      ) {
        alert(
          "Please allow pop-ups to generate the certificate."
        );

        return;
      }

      certificateWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>
            TracePaper Certificate - ${traceId}
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 15mm;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, Helvetica, sans-serif;
              background: #f1f5f9;
              color: #0f172a;
            }

            .certificate {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 42px;
              border: 2px solid #10b981;
              border-radius: 16px;
            }

            .header {
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 26px;
            }

            .logo {
              width: 60px;
              height: 60px;
              margin: 0 auto 14px;
              border-radius: 14px;
              background: #dcfce7;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
            }

            h1 {
              margin: 0;
              font-size: 27px;
              letter-spacing: 1px;
            }

            .subtitle {
              margin-top: 8px;
              color: #64748b;
              font-size: 14px;
            }

            .certificate-title {
              margin-top: 18px;
              font-size: 18px;
              font-weight: bold;
              color: #047857;
            }

            .trace-box {
              background: #0f172a;
              color: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
            }

            .trace-label {
              color: #94a3b8;
              font-size: 11px;
              margin-bottom: 7px;
              letter-spacing: 1px;
            }

            .trace-id {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              word-break: break-word;
            }

            .box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 15px;
              border-radius: 10px;
              margin-bottom: 18px;
            }

            .label {
              color: #64748b;
              font-size: 10px;
              margin-bottom: 7px;
              text-transform: uppercase;
            }

            .value {
              font-size: 13px;
              color: #334155;
              word-break: break-all;
              font-family: monospace;
            }

            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin: 24px 0 14px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              margin-bottom: 25px;
            }

            .detail {
              padding: 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
            }

            .detail-label {
              font-size: 10px;
              color: #64748b;
              margin-bottom: 5px;
              text-transform: uppercase;
            }

            .detail-value {
              font-size: 14px;
              font-weight: bold;
              color: #1e293b;
              word-break: break-word;
            }

            .security {
              padding: 18px;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 12px;
              margin-bottom: 25px;
            }

            .security-title {
              color: #047857;
              font-weight: bold;
              margin-bottom: 10px;
            }

            .security-item {
              color: #065f46;
              font-size: 13px;
              margin: 6px 0;
            }

            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 18px;
              text-align: center;
              color: #64748b;
              font-size: 11px;
              line-height: 1.5;
            }

            .print-button {
              display: block;
              margin: 25px auto 0;
              padding: 12px 25px;
              background: #059669;
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
            }

            @media print {
              body {
                background: white;
                padding: 0;
              }

              .certificate {
                max-width: none;
                border-radius: 0;
                box-shadow: none;
              }

              .print-button {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="certificate">

            <div class="header">
              <div class="logo">
                🔐
              </div>

              <h1>
                TRACEPAPER
              </h1>

              <div class="subtitle">
                Enterprise Examination Security System
              </div>

              <div class="certificate-title">
                Secure Question Paper Registration Certificate
              </div>
            </div>

            <div class="trace-box">
              <div class="trace-label">
                UNIQUE PAPER CODE
              </div>

              <div class="trace-id">
                ${traceId}
              </div>
            </div>

            <div class="box">
              <div class="label">
                SHA-256 FILE HASH
              </div>

              <div class="value">
                ${fileHash || "N/A"}
              </div>
            </div>

            <div class="box">
              <div class="label">
                TRACEPAPER BACKEND FINGERPRINT
              </div>

              <div class="value">
                ${backendFingerprint || "N/A"}
              </div>
            </div>

            <div class="box">
              <div class="label">
                SECURE PDF WATERMARK FINGERPRINT
              </div>

              <div class="value">
                ${
                  watermarkFingerprint ||
                  "Not generated yet"
                }
              </div>
            </div>

            <div class="section-title">
              Paper Details
            </div>

            <div class="details">

              <div class="detail">
                <div class="detail-label">
                  Exam Name
                </div>

                <div class="detail-value">
                  ${formData.examName || "N/A"}
                </div>
              </div>

              <div class="detail">
                <div class="detail-label">
                  Exam Code
                </div>

                <div class="detail-value">
                  ${formData.examCode || "N/A"}
                </div>
              </div>

              <div class="detail">
                <div class="detail-label">
                  Subject
                </div>

                <div class="detail-value">
                  ${formData.subject || "N/A"}
                </div>
              </div>

              <div class="detail">
                <div class="detail-label">
                  Exam Date
                </div>

                <div class="detail-value">
                  ${formData.examDate || "N/A"}
                </div>
              </div>

              <div class="detail">
                <div class="detail-label">
                  Exam Center
                </div>

                <div class="detail-value">
                  ${formData.center || "N/A"}
                </div>
              </div>

              <div class="detail">
                <div class="detail-label">
                  Original File
                </div>

                <div class="detail-value">
                  ${file?.name || "N/A"}
                </div>
              </div>

            </div>

            <div class="security">

              <div class="security-title">
                ✓ Security Verification
              </div>

              <div class="security-item">
                ✓ Question Paper Registered
              </div>

              <div class="security-item">
                ✓ SHA-256 File Hash Generated
              </div>

              <div class="security-item">
                ✓ TracePaper Fingerprint Generated
              </div>

              <div class="security-item">
                ${
                  watermarkFingerprint
                    ? "✓ Hidden Watermark Embedded"
                    : "○ Hidden Watermark Not Yet Generated"
                }
              </div>

              <div class="security-item">
                ✓ Workflow Status:
                ${workflowStatus || "pending_review"}
              </div>

            </div>

            <div class="footer">
              TracePaper Enterprise Security System
              <br />
              Secure • Traceable • Verifiable
            </div>

            <button
              class="print-button"
              onclick="window.print()"
            >
              Save Certificate as PDF
            </button>

          </div>
        </body>
        </html>
      `);

      certificateWindow.document.close();

      certificateWindow.onload =
        () => {
          setTimeout(() => {
            certificateWindow.focus();
            certificateWindow.print();
          }, 500);
        };
    };

  // ==========================================================
  // FETCH WORKFLOW PAPER
  // ==========================================================

  const fetchReviewPaper =
    async ({ showError = true } = {}) => {
      if (!paperIdFromUrl) {
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setReviewLoading(true);
        if (showError) {
          setErrorMessage("");
        }

        const response =
          await axios.get(
            `${API_BASE_URL}/question-papers/${paperIdFromUrl}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        console.log(
          "WORKFLOW PAPER:",
          response.data
        );

        if (
          response.data.status ===
          "success"
        ) {
          const paper =
            response.data.paper;

          setReviewPaper(
            paper
          );

          await fetchFinalDownloadPermission(paper.id);

          setAuditTrail(
            response.data.auditTrail ||
              []
          );

          // ----------------------------------------------------
          // Keep workflow state synchronized
          // ----------------------------------------------------

          setPaperId(
            paper?.id || null
          );

          setWorkflowStatus(
            paper?.workflow_status || ""
          );

          setTraceId(
            paper?.paper_code || ""
          );

          setBackendFingerprint(
            paper?.fingerprint || ""
          );

          setFileHash(
            paper?.file_hash || ""
          );

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          "FETCH WORKFLOW PAPER ERROR:",
          error
        );

        if (showError) {
          const message =
            error.response?.data
              ?.message ||
            "Unable to load question paper.";

          setErrorMessage(
            message
          );
        }

        return false;
      } finally {
        setReviewLoading(
          false
        );
      }
    };

    const handlePreviewPaper = async () => {
      if (!reviewPaper?.id) {
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setPreviewLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/question-papers/${reviewPaper.id}/preview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );

        setPreviewUrl(URL.createObjectURL(response.data));
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Unable to preview the original question paper."
        );
      } finally {
        setPreviewLoading(false);
      }
    };

    const closePreview = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");
    };

  // ==========================================================
  // LOAD WORKFLOW PAPER
  // ==========================================================

  useEffect(() => {
    if (
      isWorkflowMode &&
      paperIdFromUrl
    ) {
      fetchReviewPaper();
    }
  }, [
    isWorkflowMode,
    paperIdFromUrl,
  ]);

  // ==========================================================
  // WORKFLOW ACTION
  // ==========================================================

  const handleWorkflowAction =
    async (decision) => {
      if (!reviewPaper) {
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const user =
        getUserFromToken();

      const role =
        String(
          user?.role || ""
        )
          .trim()
          .toLowerCase();

      const status =
        String(
          reviewPaper.workflow_status ||
            ""
        )
          .trim()
          .toLowerCase();

      let endpoint = "";
      let roleName = "";

      // ========================================================
      // REVIEWER
      // ========================================================

      if (
        role === "reviewer" &&
        status ===
          "pending_review"
      ) {
        endpoint =
          `${API_BASE_URL}/question-papers/${reviewPaper.id}/review`;

        roleName =
          "Reviewer";
      }

      // ========================================================
      // FINAL APPROVER
      // ========================================================

      else if (
        (role === "approver" ||
          role === "final_approver") &&
        status ===
          "pending_final_approval"
      ) {
        endpoint =
          `${API_BASE_URL}/question-papers/${reviewPaper.id}/approve`;

        roleName =
          "Final Approver";
      }

      // ========================================================
      // CREATOR / INVALID ROLE
      // ========================================================

      else {
        alert(
          `You cannot process this paper.\n\nRole: ${
            role || "unknown"
          }\nStatus: ${
            status || "unknown"
          }`
        );

        return;
      }

      const actionText =
        decision === "approve"
          ? role === "reviewer"
            ? "approve and send to Final Approver"
            : "give final approval"
          : "reject";

      // ========================================================
      // CONFIRM
      // ========================================================

      const confirmed =
        window.confirm(
          `Are you sure you want to ${actionText} this question paper as ${roleName}?`
        );

      if (!confirmed) {
        return;
      }

      // ========================================================
      // VALIDATE REJECTION COMMENT
      // ========================================================

      if (
        decision === "reject" &&
        !reviewComment.trim()
      ) {
        alert(
          "Please enter a comment/reason before rejecting the question paper."
        );

        return;
      }

      try {
        setReviewActionLoading(
          true
        );

        setErrorMessage("");
        setSuccessMessage("");

        // ======================================================
        // API REQUEST
        // ======================================================

        const response =
          await axios.put(
            endpoint,
            {
              decision,

              comment:
                reviewComment.trim() ||
                null,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        console.log(
          "WORKFLOW ACTION RESPONSE:",
          response.data
        );

        if (
          response.data.status !==
          "success"
        ) {
          throw new Error(
            response.data.message ||
              "Workflow action failed."
          );
        }

        // ======================================================
        // SUCCESS MESSAGE
        // ======================================================

        setSuccessMessage(
          response.data.message ||
            (
              decision === "approve"
                ? role === "reviewer"
                  ? "Paper approved by Reviewer and sent to Final Approver."
                  : "Final approval completed successfully."
                : "Question paper rejected successfully."
            )
        );

        setReviewComment("");

        const updatedPaper =
          response.data.paper;

        if (updatedPaper) {
          setReviewPaper((currentPaper) => ({
            ...currentPaper,
            ...updatedPaper,
          }));

          setWorkflowStatus(
            updatedPaper.workflow_status ||
              ""
          );
        }

        // ======================================================
        // IMPORTANT:
        // Fetch fresh paper + audit trail from backend
        // ======================================================

        await fetchReviewPaper({
          showError: false,
        });

        // ======================================================
        // UPDATE CREATOR LOCAL STORAGE
        // ======================================================

        if (
          updatedPaper &&
          updatedPaper.workflow_status
        ) {
          setWorkflowStatus(
            updatedPaper.workflow_status ||
              ""
          );

          saveCurrentPaperLocally(
            updatedPaper
          );
        }

        // ======================================================
        // Small success notification
        // ======================================================

        console.log(
          "Workflow status and audit trail refreshed."
        );
      } catch (error) {
        console.error(
          "WORKFLOW ACTION ERROR:",
          error
        );

        const message =
          error.response?.data
            ?.message ||
          error.response?.data
            ?.detail ||
          error.message ||
          "Unable to process workflow action.";

        setErrorMessage(
          message
        );

        alert(message);
      } finally {
        setReviewActionLoading(
          false
        );
      }
    };

  // ==========================================================
  // WORKFLOW LABEL
  // ==========================================================

  const getWorkflowLabel =
    (status) => {
      switch (
        String(
          status || ""
        ).toLowerCase()
      ) {
        case "pending_review":
          return "PENDING REVIEW";

        case "pending_final_approval":
          return "PENDING FINAL APPROVAL";

        case "approved":
          return "APPROVED";

        case "review_rejected":
          return "REVIEW REJECTED";

        case "final_rejected":
          return "FINAL REJECTED";

        case "draft":
          return "DRAFT";

        default:
          return (
            status ||
            "UNKNOWN"
          );
      }
    };

  // ==========================================================
  // ROLE
  // ==========================================================

  const userRole =
    String(
      currentUser?.role ||
        ""
    )
      .trim()
      .toLowerCase();

  // ==========================================================
  // REVIEW PERMISSIONS
  // ==========================================================

  const canReview =
    userRole ===
      "reviewer" &&
    reviewPaper?.workflow_status ===
      "pending_review";

  // ==========================================================
  // FINAL APPROVER PERMISSIONS
  // ==========================================================

  const canFinalApprove =
    (userRole === "approver" ||
      userRole === "final_approver") &&
    reviewPaper?.workflow_status ===
      "pending_final_approval";

  // ==========================================================
  // CREATOR READ ONLY
  // ==========================================================

  const isCreatorReadOnly =
    userRole === "creator" &&
    isWorkflowMode;

  // ==========================================================
  // SECURE DOWNLOAD
  // ==========================================================

  const canDownloadFinalPaper =
    (userRole === "approver" ||
      userRole === "final_approver" ||
      userRole === "admin") &&
    finalDownloadAuthorized &&
    String(
      isWorkflowMode
        ? reviewPaper?.workflow_status
        : workflowStatus
    )
      .trim()
      .toLowerCase() ===
    "approved";

  const canDownloadSecurePaper =
    canDownloadFinalPaper;

  // ==========================================================
  // REVIEW / APPROVAL PAGE
  // ==========================================================

  if (isWorkflowMode) {
    const displayedStatus =
      reviewPaper?.workflow_status ||
      "";

    const workflowTitle =
      isApproveMode
        ? "Final Approval"
        : "Review Question Paper";

    const workflowDescription =
      isApproveMode
        ? "Verify the question paper before giving final approval."
        : "Verify the question paper before approving the next workflow stage.";

    return (
      <div className="space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                ← Back
              </button>

              <h1 className="text-3xl font-bold text-slate-900">
                {workflowTitle}
              </h1>

            </div>

            <p className="text-slate-500 mt-2">
              {workflowDescription}
            </p>

          </div>

          <button
            onClick={
              fetchReviewPaper
            }
            disabled={
              reviewLoading ||
              reviewActionLoading
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >

            <RefreshCw
              size={18}
              className={
                reviewLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">

            <CheckCircle2
              size={20}
            />

            {successMessage}

          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {reviewLoading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

            <Loader2
              size={36}
              className="mx-auto text-blue-600 animate-spin"
            />

            <p className="mt-4 text-slate-500">
              Loading question paper...
            </p>

          </div>
        )}

        {/* ====================================================
            PAPER
        ==================================================== */}

        {!reviewLoading &&
          reviewPaper && (
            <>

              {/* ==================================================
                  PAPER HEADER
              ================================================== */}

              <div className="bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-[0_14px_34px_rgba(1,8,20,0.22)] overflow-hidden">

                <div className="p-6 border-b border-slate-700/80">

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-2xl font-bold text-slate-100">
                          {reviewPaper.paper_title ||
                            "Question Paper"}
                        </h2>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            displayedStatus ===
                            "approved"
                              ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/25"
                              : displayedStatus ===
                                "review_rejected"
                              ? "bg-red-500/10 text-red-200 border-red-400/25"
                              : displayedStatus ===
                                "final_rejected"
                              ? "bg-red-500/10 text-red-200 border-red-400/25"
                              : "bg-orange-500/10 text-orange-200 border-orange-400/25"
                          }`}
                        >
                          {getWorkflowLabel(
                            displayedStatus
                          )}
                        </span>

                      </div>

                      <p className="font-mono text-blue-300 mt-2">
                        {reviewPaper.paper_code}
                      </p>

                    </div>

                    <div className="flex items-center gap-2">

                      <button
                        onClick={handlePreviewPaper}
                        disabled={previewLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition"
                      >
                        {previewLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Eye size={18} />
                        )}
                        {previewLoading ? "Opening..." : "View Paper"}
                      </button>

                      <span className="px-3 py-2 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700 text-sm">

                        Role:{" "}

                        <strong>
                          {userRole ||
                            "Unknown"}
                        </strong>

                      </span>

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    DETAILS
                ================================================== */}

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                  <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Exam Code
                    </p>

                    <p className="font-semibold text-slate-100 mt-1">
                      {reviewPaper.exam_code ||
                        "—"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Exam Name
                    </p>

                    <p className="font-semibold text-slate-100 mt-1">
                      {reviewPaper.exam_name ||
                        reviewPaper.paper_title ||
                        "—"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Subject
                    </p>

                    <p className="font-semibold text-slate-100 mt-1">
                      {reviewPaper.subject ||
                        "—"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Exam Date
                    </p>

                    <p className="font-semibold text-slate-100 mt-1">
                      {reviewPaper.exam_date
                        ? new Date(
                            reviewPaper.exam_date
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400">
                      File
                    </p>

                    <p className="font-semibold text-slate-100 mt-1 break-all">
                      {reviewPaper.file_name ||
                        "—"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Created By
                    </p>

                    <p className="font-semibold text-slate-100 mt-1">
                      {reviewPaper.created_by_name ||
                        `User #${
                          reviewPaper.created_by ||
                          "—"
                        }`}
                    </p>
                  </div>

                </div>

              </div>

              {/* ==================================================
                  SECURITY
              ================================================== */}

              <div className="bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-[0_14px_34px_rgba(1,8,20,0.2)] p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-400/20">

                    <ShieldCheck
                      size={23}
                      className="text-cyan-300"
                    />

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-slate-100">
                      Security Information
                    </h2>

                    <p className="text-sm text-slate-400">
                      Verify the registered paper identity.
                    </p>

                  </div>

                </div>

                <div className="space-y-4">

                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">

                    <div className="flex items-center gap-2">

                      <Fingerprint
                        size={18}
                        className="text-cyan-300"
                      />

                      <span className="font-semibold text-slate-200">
                        SHA-256 File Hash
                      </span>

                    </div>

                    <p className="font-mono text-xs text-slate-300 break-all mt-2">
                      {reviewPaper.file_hash ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20">

                    <div className="flex items-center gap-2">

                      <Fingerprint
                        size={18}
                        className="text-cyan-300"
                      />

                      <span className="font-semibold text-cyan-200">
                        TracePaper Fingerprint
                      </span>

                    </div>

                    <p className="font-mono text-xs text-cyan-100 break-all mt-2">
                      {reviewPaper.fingerprint ||
                        "Not available"}
                    </p>

                  </div>

                </div>

              </div>

              {canDownloadFinalPaper && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                  <div className="flex flex-col md:flex-row gap-3">

                    <button
                      onClick={
                        handleDownloadSecurePaper
                      }
                      disabled={
                        downloadingSecurePaper
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      {downloadingSecurePaper ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <Download
                          size={19}
                        />
                      )}

                      Download Secure Paper

                    </button>

                    <button
                      onClick={
                        handleDownloadCertificate
                      }
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      <Download
                        size={19}
                      />

                      Download Certificate PDF

                    </button>

                  </div>

                </div>
              )}

              {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
                  <div className="flex h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                      <h2 className="font-semibold text-slate-800">
                        {reviewPaper.file_name || "Question Paper Preview"}
                      </h2>
                      <button
                        onClick={closePreview}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
                      >
                        <XCircle size={18} />
                        Close
                      </button>
                    </div>
                    <iframe
                      title="Question paper PDF preview"
                      src={previewUrl}
                      className="min-h-0 w-full flex-1"
                    />
                  </div>
                </div>
              )}

              {/* ==================================================
                  WORKFLOW ACTION
              ================================================== */}

              {(canReview ||
                canFinalApprove) && (
                <div className="bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-[0_14px_34px_rgba(1,8,20,0.2)] p-6">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-400/20">

                      <Eye
                        size={23}
                        className="text-violet-300"
                      />

                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-slate-100">
                        {canReview
                          ? "Reviewer Decision"
                          : "Final Approval Decision"}
                      </h2>

                      <p className="text-sm text-slate-400">

                        {canReview
                          ? "Review this paper and approve it for Final Approver or reject it."
                          : "Give the final approval or reject the question paper."}

                      </p>

                    </div>

                  </div>

                  {/* COMMENT */}

                  <textarea
                    value={
                      reviewComment
                    }
                    onChange={(e) =>
                      setReviewComment(
                        e.target.value
                      )
                    }
                    placeholder={
                      canReview
                        ? "Optional comment for approval. Required when rejecting..."
                        : "Optional comment for final approval. Required when rejecting..."
                    }
                    rows={4}
                    disabled={
                      reviewActionLoading
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100"
                  />

                  <p className="text-xs text-slate-400 mt-2">
                    A rejection reason is required.
                  </p>

                  {/* BUTTONS */}

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">

                    <button
                      onClick={() =>
                        handleWorkflowAction(
                          "approve"
                        )
                      }
                      disabled={
                        reviewActionLoading
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold transition"
                    >

                      {reviewActionLoading ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2
                          size={19}
                        />
                      )}

                      {canReview
                        ? "Approve & Send to Final Approver"
                        : "Give Final Approval"}

                    </button>

                    <button
                      onClick={() =>
                        handleWorkflowAction(
                          "reject"
                        )
                      }
                      disabled={
                        reviewActionLoading
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold transition"
                    >

                      {reviewActionLoading ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle
                          size={19}
                        />
                      )}

                      Reject Paper

                    </button>

                  </div>

                </div>
              )}

              {/* ==================================================
                  CREATOR READ ONLY
              ================================================== */}

              {isCreatorReadOnly && (
                <div className="bg-[#101f33] border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-start gap-3">

                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700">

                      <Eye
                        size={23}
                        className="text-slate-200"
                      />

                    </div>

                    <div>

                      <h3 className="font-bold text-slate-100">
                        Read-Only Workflow View
                      </h3>

                      <p className="text-sm text-slate-300 mt-1">
                        Creator can view the workflow status and audit trail,
                        but cannot approve or reject the question paper.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* ==================================================
                  WORKFLOW STATUS
              ================================================== */}

              {!canReview &&
                !canFinalApprove && (
                  <div className="bg-[#101e33] border border-blue-400/30 rounded-2xl p-6">

                    <div className="flex items-start gap-3">

                      <ArrowRight
                        size={23}
                        className="text-blue-300 mt-1"
                      />

                      <div>

                        <h3 className="font-bold text-slate-100">
                          Workflow Status
                        </h3>

                        <p className="text-sm text-slate-200 mt-1">

                          Current status is{" "}

                          <strong>
                            {getWorkflowLabel(
                              displayedStatus
                            )}
                          </strong>

                          .

                        </p>

                        {displayedStatus ===
                          "pending_review" && (
                          <p className="text-sm text-blue-200 mt-1">
                            Waiting for Reviewer action.
                          </p>
                        )}

                        {displayedStatus ===
                          "pending_final_approval" && (
                          <p className="text-sm text-blue-200 mt-1">
                            Waiting for Final Approver action.
                          </p>
                        )}

                        {displayedStatus ===
                          "approved" && (
                          <p className="text-sm text-emerald-200 mt-1 font-semibold">
                            Paper is fully approved and can proceed to printing.
                          </p>
                        )}

                        {displayedStatus ===
                          "review_rejected" && (
                          <p className="text-sm text-red-200 mt-1 font-semibold">
                            Paper was rejected by the Reviewer.
                          </p>
                        )}

                        {displayedStatus ===
                          "final_rejected" && (
                          <p className="text-sm text-red-200 mt-1 font-semibold">
                            Paper was rejected by the Final Approver.
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                )}

              {/* ==================================================
                  AUDIT TRAIL
              ================================================== */}

              <div className="bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-[0_14px_34px_rgba(1,8,20,0.2)] p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-11 h-11 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700">

                    <Lock
                      size={22}
                      className="text-slate-200"
                    />

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-slate-100">
                      Audit Trail
                    </h2>

                    <p className="text-sm text-slate-400">
                      Complete activity history of this paper.
                    </p>

                  </div>

                </div>

                {auditTrail.length ===
                0 ? (
                  <p className="text-sm text-slate-400">
                    No audit activity found.
                  </p>
                ) : (
                  <div className="space-y-4">

                    {auditTrail.map(
                      (activity) => (
                        <div
                          key={
                            activity.id
                          }
                          className="flex gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-700"
                        >

                          <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-400/20">

                            <FileText
                              size={17}
                              className="text-cyan-300"
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="font-bold text-slate-100">
                              {
                                activity.action
                              }
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {
                                activity.description ||
                                "No description available."
                              }
                            </p>

                            <p className="text-xs text-slate-400 mt-2">

                              {activity.user_name ||
                                "System"}

                              {" • "}

                              {activity.created_at
                                ? new Date(
                                    activity.created_at
                                  ).toLocaleString(
                                    "en-IN"
                                  )
                                : ""}

                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* ==================================================
                  NAVIGATION
              ================================================== */}

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Back to Dashboard
                </button>

              </div>

            </>
          )}

      </div>
    );
  }

  // ==========================================================
  // CREATOR PAGE
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Question Paper
        </h1>

        <p className="text-slate-500 mt-1">
          Create and secure examination papers with TracePaper
        </p>

      </div>

      {/* ======================================================
          RESTORING
      ====================================================== */}

      {restoringPaper && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-2">

          <Loader2
            size={19}
            className="animate-spin"
          />

          Restoring your previous question paper...

        </div>
      )}

      {/* ======================================================
          ROLE WARNING
      ====================================================== */}

      {userRole &&
        userRole !==
          "creator" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">

            You are logged in as{" "}

            <strong>
              {userRole}
            </strong>

            . Only Creator can create a new question paper.

          </div>
        )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {errorMessage}
        </div>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">

          <CheckCircle2
            size={20}
          />

          {successMessage}

        </div>
      )}

      {/* ======================================================
          CREATION CARD
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">

              <FileText
                size={24}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Create Secure Question Paper
              </h2>

              <p className="text-sm text-slate-500">
                Register the original examination paper
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            FORM
        ==================================================== */}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Name
            </label>

            <input
              type="text"
              name="examName"
              value={
                formData.examName
              }
              onChange={
                handleChange
              }
              placeholder="BCA Semester Examination"
              disabled={
                userRole !==
                "creator"
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

          </div>

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Code
            </label>

            <input
              type="text"
              name="examCode"
              value={
                formData.examCode
              }
              onChange={
                handleChange
              }
              placeholder="EXAM-TP-001"
              disabled={
                userRole !==
                "creator"
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

          </div>

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject
            </label>

            <input
              type="text"
              name="subject"
              value={
                formData.subject
              }
              onChange={
                handleChange
              }
              placeholder="Computer Science"
              disabled={
                userRole !==
                "creator"
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

          </div>

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Date
            </label>

            <input
              type="date"
              name="examDate"
              value={
                formData.examDate
              }
              onChange={
                handleChange
              }
              disabled={
                userRole !==
                "creator"
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

          </div>

          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Center
            </label>

            <input
              type="text"
              name="center"
              value={
                formData.center
              }
              onChange={
                handleChange
              }
              placeholder="KOP-024"
              disabled={
                userRole !==
                "creator"
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

          </div>

          {/* FILE */}

          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Original Question Paper
            </label>

            <label
              className={`border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center transition ${
                userRole ===
                "creator"
                  ? "cursor-pointer hover:bg-slate-50"
                  : "cursor-not-allowed opacity-60"
              }`}
            >

              <Upload
                size={32}
                className="text-blue-600 mb-3"
              />

              <p className="font-semibold text-slate-700 text-center break-all">
                {file
                  ? file.name
                  : "Click to upload question paper"}
              </p>

              <p className="text-sm text-slate-400 mt-1">
                PDF format required
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={
                  userRole !==
                  "creator"
                }
                onChange={
                  handleFileChange
                }
              />

            </label>

            {fileHash && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">

                <div className="flex items-center gap-2 mb-2">

                  <Fingerprint
                    size={18}
                    className="text-blue-600"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    SHA-256 File Hash
                  </p>

                </div>

                <p className="text-xs font-mono text-slate-500 break-all">
                  {fileHash}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ====================================================
            SECURITY INFO
        ==================================================== */}

        <div className="mx-6 mb-6 p-5 rounded-xl bg-blue-50 border border-blue-100">

          <div className="flex items-start gap-3">

            <ShieldCheck
              size={25}
              className="text-blue-600 mt-1"
            />

            <div>

              <h3 className="font-bold text-slate-800">
                TracePaper Security Workflow
              </h3>

              <p className="text-sm text-slate-600 mt-1">
                Creator registers the paper. The registered paper then moves to Reviewer and Final Approver before final approval.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-semibold">

                <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                  Creator
                </span>

                <ArrowRight
                  size={14}
                  className="text-slate-400"
                />

                <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700">
                  Reviewer
                </span>

                <ArrowRight
                  size={14}
                  className="text-slate-400"
                />

                <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">
                  Final Approver
                </span>

                <ArrowRight
                  size={14}
                  className="text-slate-400"
                />

                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                  Approved
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            GENERATE
        ==================================================== */}

        <div className="px-6 pb-6">

          <button
            onClick={
              handleGenerate
            }
            disabled={
              userRole !==
                "creator" ||
              creatingPaper ||
              securityStage ===
                "processing"
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
          >

            {creatingPaper ||
            securityStage ===
              "processing" ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Registering Secure Paper...
              </>
            ) : (
              <>
                <KeyRound
                  size={20}
                />

                Generate Secure Paper
              </>
            )}

          </button>

        </div>

      </div>

      {/* ======================================================
          GENERATED RESULT
      ====================================================== */}

      {generated && (
        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Question Paper Registered
                </h2>

                <p className="text-sm text-slate-500">
                  Paper submitted for Reviewer approval
                </p>

              </div>

            </div>

          </div>

          <div className="p-6">

            {/* PAPER CODE */}

            <div className="bg-slate-900 rounded-xl p-5">

              <p className="text-sm text-slate-400">
                Unique Paper Code
              </p>

              <p className="text-2xl font-bold text-white mt-1 tracking-wider break-all">
                {traceId}
              </p>

            </div>

            {/* WORKFLOW */}

            <div className="mt-5 p-5 rounded-xl bg-[#101e33] border border-orange-400/30">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">

                  <Eye
                    size={21}
                    className="text-orange-600"
                  />

                </div>

                <div>

                  <p className="font-bold text-orange-800">
                    {getWorkflowLabel(
                      workflowStatus ||
                        "pending_review"
                    )}
                  </p>

                  <p className="text-sm text-orange-700 mt-1">

                    {workflowStatus ===
                    "pending_review"
                      ? "The paper is waiting for Reviewer action."
                      : workflowStatus ===
                        "pending_final_approval"
                      ? "The paper is waiting for Final Approver action."
                      : workflowStatus ===
                        "approved"
                      ? "The paper has been approved and can proceed to printing."
                      : workflowStatus ===
                        "review_rejected"
                      ? "The paper was rejected by Reviewer."
                      : workflowStatus ===
                        "final_rejected"
                      ? "The paper was rejected by Final Approver."
                      : "Current workflow status of this paper."}

                  </p>

                </div>

              </div>

            </div>

            {/* BACKEND FINGERPRINT */}

            {backendFingerprint && (
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-5">

                <div className="flex items-center gap-2">

                  <Fingerprint
                    size={20}
                    className="text-blue-600"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    TracePaper Backend Fingerprint
                  </p>

                </div>

                <p className="text-xs font-mono text-slate-500 mt-2 break-all">
                  {backendFingerprint}
                </p>

              </div>
            )}

            {/* SECURITY */}

            <div className="mt-5 p-5 rounded-xl border border-slate-700/80 bg-[#0d1b2a]">

              <div className="flex items-center gap-3">

                {securityStage ===
                "processing" ? (
                  <Loader2
                    size={24}
                    className="text-blue-600 animate-spin"
                  />
                ) : (
                  <ShieldCheck
                    size={24}
                    className="text-emerald-600"
                  />
                )}

                <div>

                  <p className="font-bold text-slate-800">
                    Security Processing
                  </p>

                  <p className="text-sm text-slate-500">

                    {securityStage ===
                    "processing"
                      ? "Registering paper..."
                      : "Registration completed. Secure watermark can be generated after final approval."}

                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={18}
                      className="text-emerald-600"
                    />

                    <p className="font-semibold text-slate-700">
                      Paper Code
                    </p>

                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Generated
                  </p>

                </div>

                <div
                  className={`p-4 rounded-xl ${
                    watermarkVerified
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-amber-50 border border-amber-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {watermarkVerified ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600"
                      />
                    ) : (
                      <Lock
                        size={18}
                        className="text-amber-600"
                      />
                    )}

                    <p className="font-semibold text-slate-700">
                      Hidden Watermark
                    </p>

                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    {watermarkVerified
                      ? "Embedded"
                      : "Available after approval"}
                  </p>

                </div>

                <div className="p-4 rounded-xl bg-[#101e33] border border-orange-400/30">

                  <div className="flex items-center gap-2">

                    <Eye
                      size={18}
                      className="text-orange-600"
                    />

                    <p className="font-semibold text-slate-700">
                      Workflow
                    </p>

                  </div>

                  <p className="text-xs text-orange-700 mt-2 font-semibold">
                    {getWorkflowLabel(
                      workflowStatus ||
                        "pending_review"
                    )}
                  </p>

                </div>

              </div>

            </div>

            {/* DETAILS */}

            <div className="mt-6">

              <h3 className="font-bold text-slate-800 mb-4">
                Paper Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Exam
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.examName ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Exam Code
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.examCode ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Subject
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.subject ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Exam Date
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.examDate ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Exam Center
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.center ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Original File
                  </p>

                  <p className="font-semibold text-slate-800 break-all">
                    {file?.name ||
                      "N/A"}
                  </p>
                </div>

              </div>

            </div>

            {/* HASH */}

            {fileHash && (
              <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200">

                <div className="flex items-center gap-2">

                  <Fingerprint
                    size={20}
                    className="text-blue-600"
                  />

                  <h3 className="font-bold text-slate-800">
                    SHA-256 File Hash
                  </h3>

                </div>

                <p className="text-xs font-mono text-slate-500 mt-3 break-all">
                  {fileHash}
                </p>

              </div>
            )}

            {/* WATERMARK */}

            {watermarkFingerprint && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5">

                <div className="flex items-center gap-2">

                  <Lock
                    size={20}
                    className="text-emerald-600"
                  />

                  <p className="text-sm font-semibold text-emerald-800">
                    Secure PDF Watermark Fingerprint
                  </p>

                </div>

                <p className="text-xs font-mono text-emerald-700 mt-2 break-all">
                  {watermarkFingerprint}
                </p>

              </div>
            )}

            {/* ==================================================
                SECURE PAPER
            ================================================== */}

            {canDownloadSecurePaper ? (
              <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200">

                <div className="flex flex-col gap-5">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">

                      <ShieldCheck
                        size={22}
                        className="text-emerald-600"
                      />

                    </div>

                    <div>

                      <h3 className="font-bold text-emerald-800">
                        Secure Paper Available
                      </h3>

                      <p className="text-sm text-emerald-700 mt-1">
                        This question paper has received final approval.
                        You can now generate the secure watermarked PDF.
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-col md:flex-row gap-3">

                    <button
                      onClick={
                        handleDownloadSecurePaper
                      }
                      disabled={
                        downloadingSecurePaper
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      {downloadingSecurePaper ? (
                        <>
                          <Loader2
                            size={19}
                            className="animate-spin"
                          />

                          Embedding Watermark...
                        </>
                      ) : (
                        <>
                          <Download
                            size={19}
                          />

                          Download Secure Paper
                        </>
                      )}

                    </button>

                    <button
                      onClick={
                        handleDownloadCertificate
                      }
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      <Download
                        size={19}
                      />

                      Download Certificate PDF

                    </button>

                  </div>

                </div>

              </div>
            ) : (
              <div className="mt-6 p-5 rounded-xl bg-amber-50 border border-amber-200">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">

                    <Eye
                      size={22}
                      className="text-amber-600"
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-amber-800">
                      Secure Download Locked
                    </h3>

                    <p className="text-sm text-amber-700 mt-1">
                      Secure paper download will be available only after
                      Reviewer and Final Approver approval.
                    </p>

                    <p className="text-sm font-semibold text-amber-800 mt-2">
                      Current Status:{" "}
                      {getWorkflowLabel(
                        workflowStatus ||
                          "pending_review"
                      )}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                NAVIGATION
            ================================================== */}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">

              <button
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
              >
                Back to Dashboard
              </button>

              {paperId && (
                <button
                  onClick={() =>
                    navigate(
                      `/question-paper?id=${paperId}&mode=review`
                    )
                  }
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center justify-center gap-2"
                >

                  <Eye
                    size={18}
                  />

                  View Workflow

                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}