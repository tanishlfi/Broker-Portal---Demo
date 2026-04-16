import { Stack } from "@mui/system";
import { Skeleton } from "@mui/material";

const LoadingStack = () => {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" sx={{ width: "100%", height: 350 }} />
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rectangular" sx={{ width: "100%", height: 50 }} />
        <Skeleton variant="rectangular" sx={{ width: "100%", height: 50 }} />
        <Skeleton variant="rectangular" sx={{ width: "100%", height: 50 }} />
      </Stack>
      <Stack spacing={0.2}>
        {[...Array(20)].map((item, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={"auto"}
            height={50}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default LoadingStack;
