import React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Card } from "@mui/material";

// Example usage:  PROPS  = {titles: ["Policy Documents", "Claims"], contents: [DocumentsList, ClaimChecker]}

// const TabTitles = ["Policy Documents", "Claims"];

// const tabContents = [
//   <DocumentsList
//     policyId={PolicyData.PolicyId}
//     policyNumber={PolicyData.PolicyNumber}
//     key={"Policy Documents"}
//   />,
//   <ClaimChecker
//     key="Claims"
//     PolicyMembersOrg={PolicyMembersOrg}
//     setCanEdit={setCanEdit}
//     rolePlayerList={
//       PolicyMembersOrg && PolicyMembersOrg.length > 0
//         ? PolicyMembersOrg.filter(
//             (member) => member.insuredLifeStatus === 1
//           ).map((member) => member.RolePlayerId)
//         : []
//     }
//   />,
// ];

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function ReusableTabs({ titles, contents }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Card sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="reusable tabs">
          {titles.map((title, index) => (
            <Tab key={index} label={title} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {contents.map((content, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {content}
        </CustomTabPanel>
      ))}
    </Card>
  );
}

ReusableTabs.propTypes = {
  titles: PropTypes.arrayOf(PropTypes.string).isRequired,
  contents: PropTypes.arrayOf(PropTypes.node).isRequired,
};
