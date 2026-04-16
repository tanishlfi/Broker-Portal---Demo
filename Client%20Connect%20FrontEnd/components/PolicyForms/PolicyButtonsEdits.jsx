import { Stack } from "@mui/material";
import SpouseDialog from "components/PolicyForms/SpouseDialog";
import React from "react";
import ChildDialog from "./ChildDialog";
import BeneficiaryDialog from "./BeneficiaryDialog";
import SubMemberDialog from "./SubMemberDialog";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const PolicyButtonsEdits = ({
  policyDetails,
  members,
  setMembers,
  waitingPeriod,
  policyInceptionDate,
  benefits,
}) => {
  const [rule, setRule] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(0);

  // console.log("policyDetails", policyDetails);

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
    setSelectedCategory(Number(policyDetails.selectedCategory));
    // setSelectedCategory(3);
    let spouseCount = 0;
    let childrenCount = 0;
    let extendedCount = 0;
    members.forEach((member) => {
      if (
        member.PolicyMember.memberTypeId === 2 &&
        member.PolicyMember.status !== "Deleted"
      ) {
        spouseCount++;
      } else if (
        member.PolicyMember.memberTypeId === 3 &&
        member.PolicyMember.status !== "Deleted"
      ) {
        childrenCount++;
      } else if (
        member.PolicyMember.memberTypeId === 4 &&
        member.PolicyMember.status !== "Deleted"
      ) {
        extendedCount++;
      }
    });
    setMemberCounter({
      spouse: spouseCount,
      children: childrenCount,
      extended: extendedCount,
    });
  }, [members, policyDetails?.selectedCategory]);

  if (selectedCategory) {
    // console.log("selectedCategory", selectedCategory);
    switch (selectedCategory) {
      case 2:
        return (
          <div>
            <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
              {!memberCounter.spouse && (
                <SpouseDialog
                  edit={false}
                  client_type="spouse"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                  benefits={benefits}
                />
              )}

              {memberCounter.children < 6 && (
                <ChildDialog
                  selectedCategory={selectedCategory}
                  client_type="child"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                  benefits={benefits}
                />
              )}

              {
                // if policyDetails?.providerInceptionDate is not null and >= 2023-03-01 then show SubMemberDialog
                policyDetails?.providerInceptionDate &&
                  (dayjs(policyDetails?.providerInceptionDate).isSame(
                    "2023-03-01",
                  ) ||
                    dayjs(policyDetails?.providerInceptionDate).isAfter(
                      "2023-03-01",
                    )) &&
                  memberCounter.extended < rule?.extended && (
                    <SubMemberDialog
                      selectedCategory={selectedCategory}
                      client_type="extended"
                      setMembers={setMembers}
                      waitingPeriod={waitingPeriod}
                      policyInceptionDate={policyInceptionDate}
                    />
                  )
              }

              <BeneficiaryDialog setMembers={setMembers} />
            </Stack>
          </div>
        );

      case 3:
        return (
          <div>
            <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
              {!memberCounter.spouse && (
                <SpouseDialog
                  edit={false}
                  client_type="spouse"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                  benefits={benefits}
                />
              )}

              {memberCounter.children <= 6 && (
                <ChildDialog
                  selectedCategory={selectedCategory}
                  client_type="child"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                  benefits={benefits}
                />
              )}

              {/* {memberCounter.extended < rule?.extended && ( */}
              <SubMemberDialog
                selectedCategory={selectedCategory}
                client_type="extended"
                setMembers={setMembers}
                waitingPeriod={waitingPeriod}
                policyInceptionDate={policyInceptionDate}
                benefits={benefits}
              />
              {/* )} */}

              <BeneficiaryDialog setMembers={setMembers} />
            </Stack>
          </div>
        );

      case 4:
        return (
          <div>
            <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
              {!memberCounter.spouse && (
                <SpouseDialog
                  edit={false}
                  client_type="spouse"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                />
              )}

              {memberCounter.extended < rule?.extended && (
                <SubMemberDialog
                  selectedCategory={selectedCategory}
                  client_type="extended"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                />
              )}

              <BeneficiaryDialog setMembers={setMembers} />
            </Stack>
          </div>
        );

      case 5:
        return (
          <div>
            <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
              {memberCounter.children < rule?.children && (
                <ChildDialog
                  selectedCategory={selectedCategory}
                  client_type="child"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                />
              )}
              {memberCounter.extended < rule?.extended && (
                <SubMemberDialog
                  selectedCategory={selectedCategory}
                  client_type="extended"
                  setMembers={setMembers}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                />
              )}

              <BeneficiaryDialog setMembers={setMembers} />
            </Stack>
          </div>
        );

      default:
        return (
          <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
            <BeneficiaryDialog setMembers={setMembers} />
          </Stack>
        );
    }
  } else {
    return (
      <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
        <BeneficiaryDialog setMembers={setMembers} />
      </Stack>
    );
  }
};

export default PolicyButtonsEdits;
