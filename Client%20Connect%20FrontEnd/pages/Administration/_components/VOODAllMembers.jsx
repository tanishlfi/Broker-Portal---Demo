import React, { useState, useMemo, useEffect } from "react";
import { Button, Stack } from "@mui/material";
import axios from "axios";
import { useMutation } from "react-query";
import { nodeSa } from "../../../src/AxiosParams";
import useToken from "../../../hooks/useToken";
import AlertPopup from "../../../components/Bits/AlertPopup";

const VOODAllMembers = ({ PolicyMembers, setPolicyMembers }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [Success, setSuccess] = useState(false);

  const accessToken = useToken();

  const [unverifiedMembers, setUnverifiedMembers] = useState([]);

  useEffect(() => {
    if (PolicyMembers && PolicyMembers.length > 0) {
      const unverified = PolicyMembers.filter((member) => {
        return (
          (member.IsVopdVerified === false ||
            member.IsVopdVerified === "" ||
            member.IsVopdVerified === null) &&
          Number(member.IdTypeId) === 1
        );
      });

      setUnverifiedMembers(unverified);
    }
  }, [PolicyMembers]);
  const {
    mutateAsync: validateMember,
    isLoading,
    isError,
  } = useMutation(
    async (member) =>
      await axios.post(
        `${nodeSa}/vopd`,
        { idNumber: member.IdNumber.toString() },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
  );

  const handleVOODAllMembers = async () => {
    if (!unverifiedMembers || unverifiedMembers.length === 0) return;

    setIsProcessing(true);

    const updatedMembers = [...PolicyMembers]; // Clone the list to avoid direct state mutation

    for (const member of unverifiedMembers) {
      try {
        const response = await validateMember(member);
        const data = response.data?.data;

        const index = updatedMembers.findIndex(
          (m) => m.IdNumber.toString() === member.IdNumber.toString()
        );

        if (index !== -1) {
          updatedMembers[index] = {
            ...member,
            FirstName: data.firstName || "",
            Surname: data.surname || "",
            IsVopdVerified: true,
            vopdResponse: response.data || {},
            DateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : "",
            Gender: data.gender === "M" ? 1 : 2,
            DateOfBirth: new Date(data.dateOfBirth),
            MaritalStatus: data.maritalStatus || "",
            dateVopdVerified: data.updatedAt || new Date(),
            exceptions: [],
          };
        }
      } catch (error) {
        const errorData = error.response?.data || {};

        const index = updatedMembers.findIndex(
          (m) => m.IdNumber.toString() === member.IdNumber.toString()
        );

        if (index !== -1) {
          updatedMembers[index] = {
            ...member,
            vopdResponse: errorData,
            exceptions: [
              ...(member.exceptions || []),
              {
                field: "VOPD",
                message: errorData.message || "Validation failed",
                date: new Date(),
              },
            ],
          };
        }
      }
    }

    setPolicyMembers(updatedMembers);
    setIsProcessing(false);
    setSuccess(true);
  };

  return (
    <Stack>
      {unverifiedMembers?.length > 0 ? (
        <Stack>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={handleVOODAllMembers}
            disabled={isProcessing || isLoading}>
            {isProcessing ? "Processing..." : "VOPD (ID Validation) Required"}
          </Button>
          {isError && (
            <AlertPopup
              open={isError}
              severity="error"
              message="Some members failed validation"
            />
          )}
        </Stack>
      ) : (
        <Stack>
          <Button fullWidth variant="contained" color="primary" disabled>
            VOPD Complete
          </Button>
          {Success && (
            <AlertPopup
              open={Success}
              setOpen={setSuccess}
              severity="success"
              message="All members have been processed"
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default VOODAllMembers;
