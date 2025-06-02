// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ValidationContract {
    
    // Hospital ka data structure
    struct Hospital {
        string name;
        string licenseId;
        string location;
        string contactNumber;
        string email;
        uint256 beds;
        string departments;
    }
    
    // Doctor ka data structure
    struct Doctor {
        string name;
        string licenseNo;
        string specialization;
        uint256 experience;
        string phone;
        string email;
        string hospital;
    }
    
    // Function jo check karta hai ke string empty nahi hai
    function isNotEmpty(string memory str) internal pure returns (bool) {
        return bytes(str).length > 0;
    }
    
    // Basic email validation: '@' aur '.' ki presence check karta hai
    function isValidEmail(string memory email) internal pure returns (bool) {
        bytes memory emailBytes = bytes(email);
        bool hasAt = false;
        bool hasDot = false;
        for (uint i = 0; i < emailBytes.length; i++) {
            if (emailBytes[i] == '@') hasAt = true;
            if (emailBytes[i] == '.') hasDot = true;
        }
        return hasAt && hasDot;
    }
    
    // Hospital ke data ko validate karne ka function
    function validateHospital(Hospital memory hospital) public pure returns (bool) {
        if (!isNotEmpty(hospital.name)) return false; // Name empty nahi hona chahiye
        if (!isNotEmpty(hospital.location)) return false; // Location empty nahi hona chahiye
        if (!isNotEmpty(hospital.contactNumber)) return false; // Contact number empty nahi hona chahiye
        if (!isNotEmpty(hospital.email) || !isValidEmail(hospital.email)) return false; // Email valid hona chahiye
        if (hospital.beds == 0) return false; // Beds kam se kam 1 hone chahiye
        if (!isNotEmpty(hospital.departments)) return false; // Departments empty nahi hone chahiye
        return true;
    }
    
    // Doctor ke data ko validate karne ka function
    function validateDoctor(Doctor memory doctor) public pure returns (bool) {
        if (!isNotEmpty(doctor.name)) return false; // Name empty nahi hona chahiye
        if (!isNotEmpty(doctor.licenseNo)) return false; // License number empty nahi hona chahiye
        if (!isNotEmpty(doctor.specialization)) return false; // Specialization empty nahi hona chahiye
        if (doctor.experience < 0 || doctor.experience > 100) return false; // Experience 0 se 100 ke beech honi chahiye
        if (!isNotEmpty(doctor.phone)) return false; // Phone empty nahi hona chahiye
        if (!isNotEmpty(doctor.email) || !isValidEmail(doctor.email)) return false; // Email valid hona chahiye
        if (!isNotEmpty(doctor.hospital)) return false; // Hospital affiliation empty nahi honi chahiye
        return true;
    }
    
    // Hospital add karne ka example function with validation
    function addHospital(Hospital memory hospital) public {
        require(validateHospital(hospital), "Invalid hospital data");
        // Yahan hospital data store karne ka logic add kar sakte hain
    }
    
    // Doctor add karne ka example function with validation
    function addDoctor(Doctor memory doctor) public {
        require(validateDoctor(doctor), "Invalid doctor data");
        // Yahan doctor data store karne ka logic add kar sakte hain
    }
}