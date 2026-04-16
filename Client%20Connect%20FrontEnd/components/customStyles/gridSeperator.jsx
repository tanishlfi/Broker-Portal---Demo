// check which theme is being used and then set the custom style accordingly
//
// For more info: https://mui.com/customization/components/

const customGridSeperator = (theme) => ({
  my: 2,
  borderTop:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.6)"
      : "1px solid rgba(0, 0, 0, 0.6)",
});

export default customGridSeperator;
