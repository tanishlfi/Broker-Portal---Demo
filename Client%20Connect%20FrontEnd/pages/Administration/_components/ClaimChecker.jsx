import React, { useEffect } from "react";
import useToken from "../../../hooks/useToken";
import { useQueries, useQuery } from "react-query";
import axios from "axios";
import { rmaAPI } from "../../../src/AxiosParams";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ClaimChecker = ({ rolePlayerList, PolicyMembersOrg, setCanEdit }) => {
  const accessToken = useToken();

  const [allPolicies, setAllPolicies] = React.useState([]);

  const [claims, setClaims] = React.useState([]);

  const [claimStatuses, setClaimStatuses] = React.useState([]);

  const [problematicClaims, setProblematicClaims] = React.useState([]);

  const RolePlayerPolicies = useQueries(
    rolePlayerList?.map((id) => {
      return {
        queryKey: ["messages", id],
        queryFn: () =>
          axios.get(
            `${rmaAPI}/clc/api/Policy/Policy/GetPoliciesByRolePlayer/${id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ),
        onSuccess: (data) => {
          data.data.map((policy) => {
            setAllPolicies((prev) => {
              if (prev.find((item) => item.policyId === policy.policyId))
                return prev; // if the policy is already in the list, do nothing

              return [...prev, policy];
            });
          });
        },
        enabled: accessToken !== undefined && id !== undefined,
      };
    })
  );

  const getPolicyClaims = useQueries(
    allPolicies.map((policy) => {
      return {
        queryKey: ["messages", policy.policyId],
        queryFn: () =>
          axios.get(
            `${rmaAPI}/clm/api/Claim/GetClaimsByPolicyId/${policy.policyId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ),
        onSuccess: (data) => {
          data.data.map((claim) => {
            setClaims((prev) => {
              if (prev.find((item) => item.claimId === claim.claimId))
                return prev; // if the claim is already in the list, do nothing

              return [...prev, claim];
            });
          });
        },
      };
    })
  );

  const getClaimEvent = useQueries(
    claims.map((claim) => {
      return {
        queryKey: ["messages", claim.claimId],
        queryFn: () =>
          axios.get(
            `${rmaAPI}/clm/api/Claim/GetClaimAndEventByClaimId/${claim.claimId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ),
        onSuccess: (data) => {
          setProblematicClaims((prev) => {
            if (rolePlayerList.includes(data.data.insuredLifeId)) {
              return [
                ...prev,
                {
                  ...claim,
                  claimEvent: data.data,
                  memberData: PolicyMembersOrg.find(
                    (member) => member.RolePlayerId === data.data.insuredLifeId
                  ),
                },
              ];
            }
            return prev;
          });

          setClaims((prev) => {
            return prev.map((item) => {
              if (item.claimId === data.data.claimId) {
                return {
                  ...item,
                  claimEvent: data.data,
                };
              }
              return item;
            });
          });
        },
      };
    })
  );

  useEffect(() => {
    if (problematicClaims.length > 0) {
      setCanEdit(false);
    }
  }, [problematicClaims, setCanEdit]);

  const getClaimStatuses = useQuery({
    queryKey: ["ClaimStatus"],
    queryFn: () =>
      axios.get(`${rmaAPI}/clm/api/Claim/ClaimStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSuccess: (data) => {
      setClaimStatuses(data.data);
    },
    enabled: accessToken !== undefined,
  });

  const [viewClaims, setViewClaims] = React.useState(false);

  if (
    RolePlayerPolicies.isLoading ||
    getPolicyClaims.isLoading ||
    getClaimEvent.isLoading ||
    getClaimStatuses.isLoading
  ) {
    return <Alert severity="info">Checking claims...</Alert>;
  }

  function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    let rolePlayerIds = allPolicies
      ?.find((policy) => policy.policyId === row.policyId)
      ?.policyInsuredLives?.map((insured) => insured?.rolePlayerId);

    let correct = rolePlayerList.find((id) => rolePlayerIds.includes(id));

    let getRolePlayer = PolicyMembersOrg.find(
      (member) => member.RolePlayerId === correct
    );

    let found = allPolicies?.find((policy) => policy.policyId === row.policyId);

    console.log("found", found);

    return (
      <React.Fragment>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.policyId}
          </TableCell>
          <TableCell component="th" scope="row">
            {row.claimId}
          </TableCell>
          <TableCell component="th" scope="row">
            {new Date(row.claimStatusChangeDate).toLocaleDateString("en-ZA")}
          </TableCell>
          <TableCell component="th" scope="row">
            {
              claimStatuses.find(
                (status) => status.id === row?.claimEvent?.claimStatusId
              )?.name
            }
          </TableCell>
          <TableCell component="th" scope="row">
            {row?.claimEvent?.claimUniqueReference}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Policy
                </Typography>

                {
                  allPolicies?.find(
                    (policy) => policy.policyId === row.policyId
                  )?.policyNumber
                }
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  if (problematicClaims.length > 0) {
    return (
      <Stack sx={{ mt: 2 }}>
        <Typography variant="h5" component="div">
          View Claims - {problematicClaims.length} Claims Found
        </Typography>
        <TableContainer sx={{ my: 2 }} component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>View Previous Claims</TableCell>
                <TableCell>Policy Id</TableCell>
                <TableCell>Claim Id</TableCell>
                <TableCell>Claim Status</TableCell>
                <TableCell>Claim Date Change</TableCell>
                <TableCell>Claim Unique Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {problematicClaims.map((row, index) => {
                return <Row key={index} row={row} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  } else {
    return <Alert severity="success">No active claims found</Alert>;
  }
};

export default ClaimChecker;
