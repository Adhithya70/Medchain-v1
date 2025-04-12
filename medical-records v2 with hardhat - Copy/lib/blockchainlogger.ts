import { ethers } from "ethers";
import contractJson from "@/blockchain/abi/RecordTransactionTracker.json";

const abi = contractJson as unknown as { abi: any };
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY!, provider);

const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  abi.abi,
  signer
);

// ✅ 1. Add Record
export const logRecordAdded = async (
  recordId: string,
  recordHash: string,
  patientId: string,
  createdBy: string
) => {
  try {
    const tx = await contract.logRecordAdded(recordId, recordHash, patientId, createdBy);
    await tx.wait();
    console.log("📦 Record Added Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RecordAdded:", error);
  }
};

// ✅ 2. Approve Record
export const logRecordApproved = async (
  recordId: string,
  recordHash: string
) => {
  try {
    const tx = await contract.logRecordApproved(recordId, recordHash);
    await tx.wait();
    console.log("✅ Record Approved Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RecordApproved:", error);
  }
};

// ✅ 3. Delete Record
export const logRecordDeleted = async (recordId: string) => {
  try {
    const tx = await contract.logRecordDeleted(recordId);
    await tx.wait();
    console.log("🗑️ Record Deleted Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RecordDeleted:", error);
  }
};

// ✅ 4. Modify Record
export const logRecordModified = async (recordId: string) => {
  try {
    const tx = await contract.logRecordModified(recordId);
    await tx.wait();
    console.log("✏️ Record Modified Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RecordModified:", error);
  }
};

// ✅ 5. Submit Request
export const logRequestSubmitted = async (
  requestId: string,
  recordHash: string,
  patientId: string
) => {
  try {
    const tx = await contract.logRequestSubmitted(requestId, recordHash, patientId);
    await tx.wait();
    console.log("📨 Request Submitted Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RequestSubmitted:", error);
  }
};

// ✅ 6. Approve Request
export const logRequestApproved = async (requestId: string) => {
  try {
    const tx = await contract.logRequestApproved(requestId);
    await tx.wait();
    console.log("👍 Request Approved Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RequestApproved:", error);
  }
};

// ✅ 7. Reject Request
export const logRequestRejected = async (requestId: string) => {
  try {
    const tx = await contract.logRequestRejected(requestId);
    await tx.wait();
    console.log("🚫 Request Rejected Logged:", tx.hash);
  } catch (error) {
    console.error("Error logging RequestRejected:", error);
  }
};
