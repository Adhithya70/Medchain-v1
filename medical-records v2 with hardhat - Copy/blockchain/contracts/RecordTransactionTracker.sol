// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RecordTransactionTracker {
    event RecordAdded(address indexed user, string recordId, string recordHash, string patientId, string createdBy, uint256 timestamp);
    event RecordApproved(address indexed admin, string recordId, string recordHash, uint256 timestamp);
    event RecordDeleted(address indexed user, string recordId, uint256 timestamp);
    event RecordModified(address indexed user, string recordId, uint256 timestamp);

    event RequestSubmitted(address indexed user, string requestId, string recordHash, string patientId, uint256 timestamp);
    event RequestApproved(address indexed admin, string requestId, uint256 timestamp);
    event RequestRejected(address indexed admin, string requestId, uint256 timestamp);

    function logRecordAdded(string memory recordId, string memory recordHash, string memory patientId, string memory createdBy) public {
        emit RecordAdded(msg.sender, recordId, recordHash, patientId, createdBy, block.timestamp);
    }

    function logRecordApproved(string memory recordId, string memory recordHash) public {
        emit RecordApproved(msg.sender, recordId, recordHash, block.timestamp);
    }

    function logRecordDeleted(string memory recordId) public {
        emit RecordDeleted(msg.sender, recordId, block.timestamp);
    }

    function logRecordModified(string memory recordId) public {
        emit RecordModified(msg.sender, recordId, block.timestamp);
    }

    function logRequestSubmitted(string memory requestId, string memory recordHash, string memory patientId) public {
        emit RequestSubmitted(msg.sender, requestId, recordHash, patientId, block.timestamp);
    }

    function logRequestApproved(string memory requestId) public {
        emit RequestApproved(msg.sender, requestId, block.timestamp);
    }

    function logRequestRejected(string memory requestId) public {
        emit RequestRejected(msg.sender, requestId, block.timestamp);
    }
}
