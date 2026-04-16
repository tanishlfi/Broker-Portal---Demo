import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectBenefit({
  benefits,
  id,
  setPolicyMembers,
  currentBenefit,
}) {
  const [benefit, setBenefit] = React.useState("");

  React.useEffect(() => {
    setBenefit(currentBenefit);
  }, [currentBenefit]);

  console.log("benefits", benefits);

  const handleChange = (event) => {
    setBenefit(event.target.value);

    setPolicyMembers((prev) => {
      let benefit = benefits.find(
        (benefit) => benefit.id === event.target.value,
      );

      // console.log("Selected benefit", benefit);

      return prev.map((member) => {
        if (member.RolePlayerId === id) {
          return {
            ...member,
            benefitId: benefit.id,
            Benefit: benefit.benefit,
            CoverAmount: benefit.benefitAmount,
            Premium: benefit.baseRate,
            BenefitCode: benefit.benefitCode,
          };
        }
        return member;
      });
    });
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="demo-simple-select-label">Select Benefit</InputLabel>
      <Select
        sx={{
          border: 1,
          borderColor: "warning.main",
          borderRadius: 1,
        }}
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={benefit}
        label="Select Benefit"
        onChange={handleChange}
      >
        {benefits &&
          benefits.map((benefit) => {
            return (
              <MenuItem key={benefit.id} value={benefit.id}>
                {benefit.benefit}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
}
