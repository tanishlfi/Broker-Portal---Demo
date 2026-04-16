import { Chip, CircularProgress } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const GetCoverMemberType = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/CoverMemberType`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const CoverMemberTypeChip = ({ id }) => {
  const accessToken = useToken();

  const CoverMemberType = useQuery(
    "CoverMemberType",
    () => GetCoverMemberType(accessToken),
    {
      enabled: !!accessToken,
      cacheTime: 100000,
    }
  );

  if (CoverMemberType.isLoading) {
    return <CircularProgress size="small" />;
  }

  if (CoverMemberType.isError) {
    return <Chip label="Unknown" color="default" />;
  }

  const Color = () => {
    switch (CoverMemberType?.data?.data?.find((x) => x?.id === id)?.name) {
      case "Main Member":
        return "primary";
      case "Spouse":
        return "secondary";
      case "Child":
        return "success";
      case "Parent":
        return "warning";
      case "Sibling":
        return "info";
      case "Grandparent":
        return "error";
      case "Extended Family":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <>
      {CoverMemberType?.data?.data &&
        CoverMemberType?.data?.data?.length > 0 && (
          <Chip
            label={
              id === 6
                ? "Beneficiary"
                : CoverMemberType?.data?.data?.find((x) => x?.id === id)?.name
            }
            color={Color()}
          />
        )}
    </>
  );
};

export default CoverMemberTypeChip;
