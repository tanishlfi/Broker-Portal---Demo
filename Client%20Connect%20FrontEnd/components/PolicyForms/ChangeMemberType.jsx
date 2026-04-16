import { Alert, Button, Stack } from "@mui/material";
import React, { useState } from "react";

const ChangeMemberType = ({
  id,
  setMembers,
  hasMainMember,
  hasSpouse,
  open,
  childrenCount,
}) => {
  const [change, setChange] = useState(open ? true : false);

  const MemberTypes = [
    { id: 1, name: "Main Member" },
    { id: 2, name: "Spouse" },
    { id: 3, name: "Child" },
    { id: 4, name: "Extended Member" },
    { id: 6, name: "Beneficiary" },
  ];

  const onMemberChangeClearMemberTypeError = (MemberType) => {
    setMembers((prev) => {
      prev.map((member) => {
        if (member.id === id) {
          // console.log("member", member);
          member.memberTypeId = MemberType;
          member.clientType = MemberTypes.find((x) => x.id === MemberType).name;
          member.exceptions = member?.exceptions?.filter(
            (exception) => exception.field !== "MemberType",
          );
        }
      });
      const newMembers = [...prev];
      return newMembers;
    });
  };

  return (
    <div>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          onClick={() => {
            setChange(!change);
          }}
        >
          Change Member Type
        </Button>
      </Stack>

      {change && (
        <Stack
          justifyContent="flex-end"
          sx={{ my: 2 }}
          direction="row"
          spacing={2}
        >
          {!hasMainMember && (
            <Button
              variant="contained"
              onClick={() => onMemberChangeClearMemberTypeError(1)}
            >
              Main Member
            </Button>
          )}

          {!hasSpouse && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => onMemberChangeClearMemberTypeError(2)}
            >
              Spouse
            </Button>
          )}

          {childrenCount < 6 && (
            <Button
              variant="contained"
              color="success"
              onClick={() => onMemberChangeClearMemberTypeError(3)}
            >
              Child
            </Button>
          )}

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => onMemberChangeClearMemberTypeError(4)}
          >
            Extended Member
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onMemberChangeClearMemberTypeError(6)}
          >
            Beneficiary
          </Button>
        </Stack>
      )}
    </div>
  );
};

export default ChangeMemberType;
