// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

contract Voting {

    struct Campaign {
        string code;
        string name;
        string[] areaKeys;
        mapping(string => Area) areas;
        mapping(string => Voted) voted;
        uint256 startTime;
        uint256 endTime;
        bool isDeleted;
    }

    struct Voted {
        string voterId;
    }

    struct Area {
        string code;
        string name;
        Candidate[] candidates;
        bool isDeleted;
    }

    struct Candidate {
        string code;
        string name;
        string sign;
        uint votes;
        bool isDeleted;
    }

    struct VoterList {
        string hashcode;
    }

    mapping(string => Campaign) public campaigns;
    mapping(string => VoterList) public voterList;
    string [] public campKeys;
    address public admin;

    struct CampaignDto {
        string code;
        string name;
        uint256 startTime;
        uint256 endTime;
    }

    struct AreaDto {
        string code;
        string name;
    }

    struct ResultsDto {
        string code;
        string name;
        string sign;
        uint votes;
    }

    constructor() {
        admin = msg.sender;
    }

    /*
    *   Election campaign operations.
    */

    function addCampaign(string memory campaignCode, string memory campaignName, uint256 startTime, uint256 endTime) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaigns[campaignCode].code).length == 0, 'Campaign already exists');
        require(bytes(campaignCode).length != 0, 'Code required');

        Campaign storage comp = campaigns[campaignCode];
        comp.name = campaignName;
        comp.code = campaignCode;
        campKeys.push(campaignCode);
        comp.startTime = startTime;
        comp.endTime = endTime;
        comp.isDeleted = false;

    }

    function deleteCampaign(string memory campaignCode) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign does not exist');
        require(bytes(campaignCode).length != 0, 'Code required');

        campaigns[campaignCode].isDeleted = true;

    }


    function updateCampaign(string memory campaignCode, string memory campaignName, uint256 startTime, uint256 endTime) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign does not exist');
        require(bytes(campaignCode).length != 0, 'Code is required');
        require(campaigns[campaignCode].isDeleted != true, 'Deleted');

        Campaign storage comp = campaigns[campaignCode];

        if (bytes(campaignName).length != 0) {
            comp.name = campaignName;
        }

        if (startTime > 0) {
            comp.startTime = startTime;
        }

        if (endTime > 0) {
            comp.endTime = endTime;
        }

    }

    /*
    *   Election area operations.
    */

    function addAreas( string memory campaignCode, string memory areaCode, string memory areaName) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaignCode).length != 0, 'Campaign required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found.');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length == 0, 'Area  already exists');

        // Check starting date time before adding new candidates.
        require(block.timestamp < campaigns[campaignCode].startTime, 'Campaign already started');


        Area storage area = campaigns[campaignCode].areas[areaCode];
        area.code = areaCode;
        area.name = areaName;
        area.isDeleted = false;
        campaigns[campaignCode].areaKeys.push(areaCode);

    }

    function updateArea( string memory campaignCode, string memory areaCode, string memory areaName) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaignCode).length != 0, 'Campaign required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area does not exist');

        // Check starting date time before adding new candidates.
        require(block.timestamp < campaigns[campaignCode].startTime, 'Campaign already started');


        Area storage area = campaigns[campaignCode].areas[areaCode];
        if (bytes(areaName).length != 0) {
            area.name = areaName;
        }

    }

    function deleteArea( string memory campaignCode, string memory areaCode) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaignCode).length != 0, 'Campaign required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area does not exist');

        // Check starting date time before adding new candidates.
        require(block.timestamp < campaigns[campaignCode].startTime, 'Campaign already started');

        Area storage area = campaigns[campaignCode].areas[areaCode];
        area.isDeleted = true;

    }

    /*
    *   Election candidates operations.
    */

    function addCandidate( string memory campaignCode, string memory areaCode, string memory candidateCode, string memory candidateName, string memory candidateSign) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaignCode).length != 0, 'Campaign required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(candidateCode).length != 0, 'Candidate Code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area not found');

        // Check starting date time before adding new areas.
        require(block.timestamp < campaigns[campaignCode].startTime, 'Campaign already started');

        // Check If candidate already exists.

        bool alreadyExists = false;
        for(uint i = 0; i < campaigns[campaignCode].areas[areaCode].candidates.length; i++) {
            Candidate memory candidate = campaigns[campaignCode].areas[areaCode].candidates[i];
            if (keccak256(bytes(candidate.code)) == keccak256(bytes(candidateCode))) {
                alreadyExists = true;
            }
        }

        require(alreadyExists == false, 'Candidate already exists in given area.');

        campaigns[campaignCode].areas[areaCode].candidates.push(Candidate(candidateCode, candidateName, candidateSign, 0, false));
    }

    function updateCandidate( string memory campaignCode, string memory areaCode, string memory candidateCode, string memory candidateName, string memory candidateSign) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaignCode).length != 0, 'Campaign required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(candidateCode).length != 0, 'Candidate Code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area not found');
        require(campaigns[campaignCode].isDeleted == false, 'Deleted Campaign');
        require(campaigns[campaignCode].areas[areaCode].isDeleted == false, 'Deleted area');

        // Check starting date time before adding new areas.
        require(block.timestamp < campaigns[campaignCode].startTime, 'Campaign already started');

        // Check If candidate already exists.
        for(uint i = 0; i < campaigns[campaignCode].areas[areaCode].candidates.length; i++) {
            Candidate storage candidate = campaigns[campaignCode].areas[areaCode].candidates[i];
            if (keccak256(bytes(candidate.code)) == keccak256(bytes(candidateCode))) {
                if (bytes(candidateName).length != 0) {
                    candidate.name = candidateName;
                }
                if (bytes(candidateSign).length != 0) {
                    candidate.sign = candidateSign;
                }
            }
        }

    }


    function deleteCandidate( string memory campaignCode, string memory areaCode, string memory candidateCode) public {
        require(msg.sender == admin, 'Admin required');
        require(bytes(campaignCode).length != 0, 'Campaign required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(candidateCode).length != 0, 'Candidate Code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area not found');

        // Check starting date time before adding new areas.
        require(block.timestamp < campaigns[campaignCode].startTime, 'Campaign already started.');

        // Check If candidate already exists.
        for(uint i = 0; i < campaigns[campaignCode].areas[areaCode].candidates.length; i++) {
            Candidate storage candidate = campaigns[campaignCode].areas[areaCode].candidates[i];
            if (keccak256(bytes(candidate.code)) == keccak256(bytes(candidateCode))) {
                candidate.isDeleted = true;
            }
        }

    }


    /*
    *   Election voting operation.
    */

    function voteForCandidate( string memory campaignCode, string memory areaCode, string memory candidateCode, string memory voterId) public {
        require(msg.sender == admin, 'Only authorized account can vote');

        // Check starting and ending date time before voting.
        require(block.timestamp > campaigns[campaignCode].startTime, 'Campaign not started yet');
        require(block.timestamp < campaigns[campaignCode].endTime, 'Campaign has ended');

        // Further checks.
        require(bytes(campaignCode).length != 0, 'Campaign code required');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(candidateCode).length != 0, 'Candidate Code required');
        require(bytes(voterId).length != 0, 'Voter ID required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area not found');
        require(bytes(campaigns[campaignCode].voted[voterId].voterId).length == 0, 'Already voted');

        bool voted = false;
        for(uint i = 0; i < campaigns[campaignCode].areas[areaCode].candidates.length; i++) {
            Candidate memory candidate = campaigns[campaignCode].areas[areaCode].candidates[i];
            if (keccak256(bytes(candidate.code)) == keccak256(bytes(candidateCode))) {
                campaigns[campaignCode].areas[areaCode].candidates[i].votes++;
                voted = true;
            }
        }

        require(voted == true, 'Candidate not found');
        Voted storage voter = campaigns[campaignCode].voted[voterId];
        voter.voterId = voterId;
    }

    /*
    *   Functions for voting list.
    */

    function addVoterToVotingList(string memory voterId,  string memory hash) public {
        require(bytes(voterId).length != 0, 'Voter ID required');
        require(bytes(hash).length != 0, 'Hashcode required');
        require(bytes(voterList[voterId].hashcode).length == 0, 'Voter ID exists');

        VoterList storage voter = voterList[voterId];
        voter.hashcode = hash;
    }

    function getVoterHash(string memory voterId) public view returns (string memory hashcode) {
        require(bytes(voterId).length != 0, 'Voter ID required');
        require(bytes(voterList[voterId].hashcode).length != 0, 'Not found');

        return voterList[voterId].hashcode;
    }

    /*
    *   Functions to see voting related info.
    */

    function getCompaignsList() public view returns (CampaignDto[] memory) {
        CampaignDto[] memory camplist = new CampaignDto[](campKeys.length);
        for(uint i = 0; i < campKeys.length; i++) {
            if (campaigns[campKeys[i]].isDeleted == false) {
                camplist[i] = CampaignDto(campaigns[campKeys[i]].code,
                    campaigns[campKeys[i]].name,
                    campaigns[campKeys[i]].startTime,
                    campaigns[campKeys[i]].endTime);
            }
        }
        return camplist;
    }

    function getAreasList( string memory campaignCode) public view returns (AreaDto[] memory) {
        require(bytes(campaignCode).length != 0, 'Campaign code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');

        AreaDto[] memory areaList = new AreaDto[](campaigns[campaignCode].areaKeys.length);
        for(uint i = 0; i < campaigns[campaignCode].areaKeys.length; i++) {
            if (campaigns[campaignCode].areas[campaigns[campaignCode].areaKeys[i]].isDeleted == false) {
                areaList[i] = AreaDto(campaigns[campaignCode].areas[campaigns[campaignCode].areaKeys[i]].code, campaigns[campaignCode].areas[campaigns[campaignCode].areaKeys[i]].name);
            }
        }
        return areaList;
    }


    function getCandidatesList( string memory campaignCode, string memory areaCode) public view returns (Candidate[] memory) {
        require(bytes(campaignCode).length != 0, 'Campaign code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area not found');

        return campaigns[campaignCode].areas[areaCode].candidates;
    }

    function getResults( string memory campaignCode, string memory areaCode) public view returns (ResultsDto[] memory) {
        require(bytes(campaignCode).length != 0, 'Campaign code required');
        require(bytes(campaigns[campaignCode].code).length != 0, 'Campaign not found');
        require(bytes(areaCode).length != 0, 'Area Code required');
        require(bytes(campaigns[campaignCode].areas[areaCode].code).length != 0, 'Area not found');
        require(block.timestamp > campaigns[campaignCode].endTime, 'Campaign not ended');

        ResultsDto[] memory resultList = new ResultsDto[](campaigns[campaignCode].areas[areaCode].candidates.length);

        for(uint i = 0; i < campaigns[campaignCode].areas[areaCode].candidates.length; i++) {
            resultList[i] = ResultsDto(campaigns[campaignCode].areas[areaCode].candidates[i].code, campaigns[campaignCode].areas[areaCode].candidates[i].name, campaigns[campaignCode].areas[areaCode].candidates[i].sign, campaigns[campaignCode].areas[areaCode].candidates[i].votes);
        }

        return resultList;
    }
}