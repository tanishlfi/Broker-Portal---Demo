const { Chip } = require("@mui/material");
const {
  default: useRolePlayerTypes,
} = require("hooks/LookUps/useRolePlayerTypes");

const RolePlayerChip = ({ rolePlayerTypeId }) => {
  const { RolePlayer, loadingRolePlayers, RolePlayersError } =
    useRolePlayerTypes();

  if (loadingRolePlayers) {
    return <Chip label="Loading" />;
  }

  if (RolePlayersError) {
    return <Chip label="Error" />;
  }

  const Color = () => {
    switch (
      RolePlayer?.find((x) => x.rolePlayerTypeId === rolePlayerTypeId)?.name
    ) {
      case "Main Member (self)":
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
      case "Other":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={
        RolePlayer?.find((x) => x.rolePlayerTypeId === rolePlayerTypeId)?.name
      }
      color={Color()}
    />
  );
};

export default RolePlayerChip;
