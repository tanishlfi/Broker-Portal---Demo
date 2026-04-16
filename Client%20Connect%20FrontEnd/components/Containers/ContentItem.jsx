import { ListItem, ListItemText, Typography } from "@mui/material";

const ContentItem = ({ title, value }) => {
  return (
    <>
      <ListItem dense alignItems="flex-start">
        <ListItemText
          primary={
            <>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.secondary">
                {title}
              </Typography>
            </>
          }
          secondary={
            <>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body1"
                color="text.primary">
                {value}
              </Typography>
            </>
          }
        />
      </ListItem>
    </>
  );
};

export default ContentItem;
