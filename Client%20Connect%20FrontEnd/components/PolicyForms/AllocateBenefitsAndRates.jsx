import { getAccessToken } from "@auth0/nextjs-auth0";
import {
  Alert,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import {
  StyledTableCell,
  StyledTableRow,
} from "components/Bits/TableCellAndTableRow";
import useToken from "hooks/useToken";
import React, { useEffect, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import { v4 as uuidv4 } from "uuid";

const AllocateBenefitsAndRates = ({
  members,
  setMembers,
  policyDetails,
  SubmitData,
}) => {
  const accessToken = useToken();

  const [exceptions, setExceptions] = React.useState([]);

  const [manually, setManuallyAllocate] = React.useState(false);

  const AllocateBenefit = useMutation(
    "AllocateBenefits",
    (data) => {
      return axios.post(`${nodeSa}/onboarding/benefit_rules/allocation`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,

      onSuccess: (data) => {
        function ensureIdForObjects(array) {
          return array.map((item) => {
            if (typeof item.id === "undefined" || item.id === null) {
              return { ...item, id: uuidv4() }; // Assign a new UUIDv4 to the item
            }
            return item;
          });
        }

        setMembers(ensureIdForObjects(data.data.data.members));
      },
      onError: (error) => {
        // console.log(error?.response?.data?.data?.members);
        if (error?.response?.data?.data?.members) {
          setExceptions(error?.response?.data?.data?.members);
        }
      },
    },
  );

  const handleAllocateBenefit = () => {
    let subData = { ...policyDetails, members: members };

    AllocateBenefit.mutate(subData);
  };

  const allocateBenefitData = useQueries(
    members?.map((member, index) => ({
      queryKey: `benefitData${index}`,
      queryFn: () =>
        axios.get(
          `${rmaAPI}/clc/api/Product/Benefit/${member.statedBenefitId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      enabled:
        member.statedBenefitId && policyDetails.commissionPercentage
          ? true
          : false && !!accessToken,

      onSuccess: (data) => {
        members[index].benefitRate =
          policyDetails.commissionPercentage &&
          Number(data?.data?.benefitRates[0]?.baseRate) /
            Number(1 - policyDetails.commissionPercentage).toFixed(1);
        setMembers([...members]);
      },
    })),
    {
      enabled: members?.length > 0 ? true : false,
    },
  );

  const [options, setOptions] = useState({
    productOptionId: "",
    selectedCategory: "",
    selectedAmount: "",
  });

  useEffect(() => {
    setOptions({
      productOptionId: policyDetails?.productOptionId,
      selectedCategory: policyDetails?.selectedCategory,
      selectedAmount: policyDetails?.selectedAmount,
    });
  }, [
    policyDetails?.productOptionId,
    policyDetails?.selectedCategory,
    policyDetails?.selectedAmount,
  ]);

  const AllBenefits = useQuery(
    `productOptionId${options}`,
    async () =>
      await axios.get(
        `${nodeSa}/benefits/${policyDetails?.productOptionId}?selectedCategory=${policyDetails.selectedCategory}&coverAmount=${policyDetails.coverAmount}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),

    {
      enabled:
        !!accessToken &&
        options?.productOptionId &&
        options?.selectedCategory &&
        options?.selectedAmount
          ? true
          : false,
      cacheTime: 0,
    },
  );

  // will perhaps add this for manual benefit allocation
  // list of cover member types
  // may have add this as query using /mdm/api/CoverMemberType
  // const coverMemberTypes = [
  //   {
  //     id: 3,
  //     name: "Child",
  //     description: "Child",
  //   },
  //   {
  //     id: 4,
  //     name: "Extended Family",
  //     description: "Extended Family",
  //   },
  //   {
  //     id: 1,
  //     name: "Main Member",
  //     description: "Main Member",
  //   },
  //   {
  //     id: 6,
  //     name: "Not Applicable",
  //     description: "Not Applicable",
  //   },
  //   {
  //     id: 2,
  //     name: "Spouse",
  //     description: "Spouse",
  //   },
  //   {
  //     id: 5,
  //     name: "Stillborn",
  //     description: "Stillborn",
  //   },
  // ];

  // const RMALiveBenefits = useQuery(
  //   `RMALiveBenefits${options}`,
  //   async () =>
  //     await axios.get(
  //       `${rmaAPI}/clc/api/Product/ProductOption/${policyDetails?.productOptionId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     ),

  //   {
  //     enabled: !!accessToken && options?.productOptionId ? true : false,
  //     cacheTime: 0,
  //     onSuccess: (data) => {
  //       // for each benefit in data?.data?.benefits add the coverMemberType based on coverMemberType and coverMemberType
  //       data?.data?.benefits?.map((benefit) => {
  //         const coverMemberTypeId = benefit.coverMemberType;
  //         const coverMemberTypeData = coverMemberTypes.find(
  //           (coverMember) => coverMember.id === coverMemberTypeId,
  //         );
  //         benefit.coverMemberType = coverMemberTypeData?.name;
  //         benefit.coverMemberTypeId = coverMemberTypeId;
  //         return benefit;
  //       });
  //       console.log(data);
  //     },
  //   },
  // );

  const queryClient = useQueryClient();

  // useEffect(() => {
  //   queryClient.invalidateQueries(
  //     `productOptionId${
  //       (policyDetails?.productOptionId,
  //       policyDetails?.selectedCategory,
  //       policyDetails?.selectedAmount)
  //     }`
  //   );
  // }, [
  //   policyDetails?.productOptionId,
  //   policyDetails?.selectedCategory,
  //   policyDetails?.selectedAmount,
  //   queryClient,
  // ]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Stack direction="row" spacing={5}>
          <Stack>
            {AllocateBenefit.isLoading ? (
              <Button color="secondary" variant="contained" disabled>
                Loading
              </Button>
            ) : AllocateBenefit.isError ? (
              <Button color="secondary" variant="contained" disabled>
                Unable to Auto Allocate Benefits
              </Button>
            ) : (
              <Button
                color="primary"
                variant="contained"
                onClick={handleAllocateBenefit}
              >
                Allocate Benefits
              </Button>
            )}
            {AllocateBenefit.isSuccess && (
              <>
                {AllocateBenefit.data?.data?.success === false ? (
                  <Alert severity="error">
                    {AllocateBenefit.data?.data?.message}
                  </Alert>
                ) : (
                  <Alert severity="success">
                    {AllocateBenefit.data?.data?.message}
                  </Alert>
                )}
              </>
            )}
          </Stack>

          {/* {!manually ? (
            <Button
              color="inherit"
              onClick={() => {
                setManuallyAllocate(!manually);
                AllBenefits.refetch();
              }}
            >
              manually Allocate Benefits
            </Button>
          ) : (
            <Button
              color="warning"
              onClick={() => {
                setManuallyAllocate(!manually);
              }}
            >
              Close Allocation
            </Button>
          )} */}
        </Stack>

        {/* {manually && (
          <Stack sx={{ mt: 4 }} direction="row">
            <ManuallyAllocateBenefits
              members={members}
              setMembers={setMembers}
              AllBenefits={AllBenefits}
              coverAmount={policyDetails.coverAmount}
            />
          </Stack>
        )} */}
      </Grid>

      {AllocateBenefit.error?.response?.data?.data && (
        <Grid sx={{ mt: 2 }} item xs={12}>
          {AllocateBenefit.error?.response?.data?.data?.members?.map(
            (member, index) => {
              return (
                <React.Fragment key={index}>
                  {member?.PolicyMember?.exceptions?.map((exception, index) => {
                    return (
                      <Alert key={index} severity="error">
                        {member.id} {exception?.error || exception?.message}
                      </Alert>
                    );
                  })}
                </React.Fragment>
              );
            },
          )}
        </Grid>
      )}
    </Grid>
  );
};

export default AllocateBenefitsAndRates;

const ManuallyAllocateBenefits = ({
  members,
  setMembers,
  AllBenefits,
  coverAmount,
}) => {
  const [MainMemberBenefit, setMainMemberBenefit] = React.useState("");

  // console.log("AllBenefits", AllBenefits);

  const handleResetBenefits = () => {
    setMembers((prev) => {
      return prev.map((member) => {
        member.benefitId = null;
        member.statedBenefitId = null;
        member.statedBenefit = null;
        return member;
      });
    });
    AllBenefits.refetch();
  };

  const [otherBenefits, setOtherBenefits] = React.useState([]);

  React.useEffect(() => {
    if (MainMemberBenefit) {
      setOtherBenefits(
        groupByCoverMemberType(MainMemberBenefit.DependantBenefitRules),
      );
    }
  }, [MainMemberBenefit]);

  const handleMainMemberChange = (data) => {
    setMainMemberBenefit(data.benefit);
    setMembers((prev) => {
      return prev.map((member) => {
        if (member.id === data.member.id) {
          member.benefitId = data.benefit.benefitId;
          member.statedBenefitId = data.benefit.benefitId;
          member.statedBenefit = data.benefit.benefit;
        }

        return member;
      });
    });
  };

  const handleChangeOnMember = (data) => {
    setMembers((prev) => {
      return prev.map((member) => {
        if (member.id === data.member.id) {
          member.benefitId = data.benefit.id;
          member.statedBenefitId = data.benefit.id;
          member.statedBenefit = data.benefit.benefit;
        }
        return member;
      });
    });
  };

  return (
    <>
      <Stack sx={{ width: "100%" }}>
        {/* <AlertPopup severity="success" open={allocated} message="Allocated" /> */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button color="error" onClick={() => handleResetBenefits()}>
            Reset All Benefits
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Member Name</StyledTableCell>
                <StyledTableCell align="right">Member Type</StyledTableCell>
                <StyledTableCell align="right">Age</StyledTableCell>
                <StyledTableCell>Select Benefit</StyledTableCell>
                <StyledTableCell>Current Benefit</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members
                .sort((a, b) => a.memberTypeId - b.memberTypeId)
                .map((row, index) => {
                  // if row.status == Deleted then dont show
                  if (row.status === "Deleted") {
                    return;
                  }

                  let memberType = row.memberTypeId;

                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell component="th" scope="row">
                        {row.firstName} {row.surname}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <CoverMemberTypeChip id={memberType} />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {calculateAge(row.dateOfBirth)}
                      </StyledTableCell>
                      <StyledTableCell>
                        {memberType === 1 && (
                          <FormControl sx={{ width: 600 }}>
                            <InputLabel id="MainMemberBenefitLabel">
                              Main Member Benefit
                            </InputLabel>
                            <Select
                              labelId="MainMemberBenefitLabel"
                              id="MainMemberBenefit"
                              label="MainMemberBenefitLabel"
                              value={MainMemberBenefit}
                              onChange={(event) => {
                                handleMainMemberChange({
                                  member: row,
                                  benefit: event.target.value,
                                });
                              }}
                            >
                              {AllBenefits?.data?.data?.data?.map(
                                (benefit, index) => {
                                  return (
                                    <MenuItem key={index} value={benefit}>
                                      {benefit.benefit}
                                    </MenuItem>
                                  );
                                },
                              )}
                            </Select>
                          </FormControl>
                        )}
                        {memberType === 2 && otherBenefits.Spouse && (
                          <FormControl sx={{ width: 600 }}>
                            <InputLabel id="SpouseBenefitLabel">
                              Spouse Benefit
                            </InputLabel>
                            <Select
                              labelId="SpouseBenefitLabel"
                              id="SpouseBenefit"
                              label="SpouseBenefitLabel"
                              value={row.benefitId}
                              onChange={(event) => {
                                handleChangeOnMember({
                                  member: row,
                                  benefit: event.target.value,
                                });
                              }}
                            >
                              {otherBenefits?.Spouse?.map((benefit, index) => {
                                return (
                                  <MenuItem key={index} value={benefit}>
                                    {benefit.benefit}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        )}
                        {memberType === 3 && otherBenefits.Child && (
                          <FormControl sx={{ width: 600 }}>
                            <InputLabel id="ChildBenefitLabel">
                              Child Benefit
                            </InputLabel>
                            <Select
                              labelId="ChildBenefitLabel"
                              id="ChildBenefit"
                              label="ChildBenefitLabel"
                              value={row.benefitId}
                              onChange={(event) => {
                                handleChangeOnMember({
                                  member: row,
                                  benefit: event.target.value,
                                });
                              }}
                            >
                              {otherBenefits?.Child?.map((benefit, index) => {
                                return (
                                  <MenuItem key={index} value={benefit}>
                                    {benefit.benefit}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        )}
                        {memberType === 4 &&
                          otherBenefits["Extended Family"] && (
                            <FormControl sx={{ width: 600 }}>
                              <InputLabel id="ExtendedBenefitLabel">
                                Extended Benefit
                              </InputLabel>
                              <Select
                                labelId="ExtendedBenefitLabel"
                                id="ExtendedBenefit"
                                label="ExtendedBenefitLabel"
                                value={row.benefitId}
                                onChange={(event) => {
                                  handleChangeOnMember({
                                    member: row,
                                    benefit: event.target.value,
                                  });
                                }}
                              >
                                {otherBenefits["Extended Family"]?.map(
                                  (benefit, index) => {
                                    return (
                                      <MenuItem key={index} value={benefit}>
                                        {benefit.benefit}
                                      </MenuItem>
                                    );
                                  },
                                )}
                              </Select>
                            </FormControl>
                          )}
                      </StyledTableCell>
                      <StyledTableCell>
                        {row.PolicyMember?.benefit}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => {
            SaveMemberPolicies();
          }}>
          {" "}
          Save Selected benefits
        </Button> */}
      </Stack>
    </>
  );
};

function groupByCoverMemberType(data) {
  const groupedData = {};
  for (const item of data) {
    const coverMemberType = item.coverMemberType;
    if (!groupedData[coverMemberType]) {
      groupedData[coverMemberType] = [];
    }
    groupedData[coverMemberType].push(item);
  }

  return groupedData;
}

function allocateUserToBenefit(user, AllBenefits) {
  const userAge = calculateAge(user.dateOfBirth);

  for (const benefit of AllBenefits) {
    if (userAge >= benefit.minAge && userAge <= benefit.maxAge) {
      if (benefit.benefit.includes("Student") && !user.isStudent) {
        return "No Benefit found";
      }
      if (benefit.benefit.includes("Disabled") && !user.isDisabled) {
        return "No Benefit found";
      }

      // if (
      //   user.memberTypeId === 3 &&
      //   !user.isDisabled &&
      //   !user.isStudent &&
      // ) {
      //   return "No Benefit found";
      // }
      return benefit;
    }
  }
  return "No Benefit found"; // No matching benefit found
}
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
