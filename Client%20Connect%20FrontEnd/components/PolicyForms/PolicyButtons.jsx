import { Stack } from "@mui/material";
import SpouseDialog from "./SpouseDialog";
import React from "react";
import ChildDialog from "./ChildDialog";
import BeneficiaryDialog from "./BeneficiaryDialog";
import SubMemberDialog from "./SubMemberDialog";
import MemberDialog from "./MemberDialog";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const PolicyButtons = ({
  policyDetails,
  members,
  setMembers,
  waitingPeriod,
  policyInceptionDate,
  benefits,
  updatedMainMember,
}) => {
  const [rule, setRule] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(0);

  // console.log("members", members);

  const [memberCounter, setMemberCounter] = useState({
    spouse: 0,
    children: 0,
    extended: 0,
  });

  useEffect(() => {
    if (policyDetails?.rules) {
      setRule(policyDetails?.rules[0]);
    }
  }, [policyDetails]);

  useEffect(() => {
    // setSelectedCategory(Number(policyDetails.selectedCategory));
    setSelectedCategory(3);
    let spouseCount = 0;
    let childrenCount = 0;
    let extendedCount = 0;
    members.forEach((member) => {
      if (member?.memberTypeId === 2 && member.status !== "Deleted") {
        spouseCount++;
      } else if (member.memberTypeId === 3 && member.status !== "Deleted") {
        childrenCount++;
      } else if (member.memberTypeId === 4 && member.status !== "Deleted") {
        extendedCount++;
      }
    });
    setMemberCounter({
      spouse: spouseCount,
      children: childrenCount,
      extended: extendedCount,
    });
  }, [members, policyDetails?.selectedCategory]);

  // console.log("selectedCategory", selectedCategory);

  return (
    <div>
      <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
        {!memberCounter.spouse && (
          <MemberDialog
            memberType={"Spouse"}
            edit={false}
            setMembers={setMembers}
            waitingPeriod={waitingPeriod}
            policyInceptionDate={policyInceptionDate}
            benefits={updatedMainMember}
          />
        )}

        {memberCounter.children < 6 && (
          <MemberDialog
            memberType={"Child"}
            selectedCategory={selectedCategory}
            setMembers={setMembers}
            waitingPeriod={waitingPeriod}
            policyInceptionDate={policyInceptionDate}
            benefits={updatedMainMember}
          />
        )}

        {/* {memberCounter.extended < rule?.extended && ( */}
        <MemberDialog
          memberType={"Extended Family"}
          selectedCategory={selectedCategory}
          setMembers={setMembers}
          waitingPeriod={waitingPeriod}
          policyInceptionDate={policyInceptionDate}
          benefits={updatedMainMember}
        />

        <BeneficiaryDialog setMembers={setMembers} />
      </Stack>
    </div>
  );
};

export default PolicyButtons;
