import PageHeader from "components/Bits/PageHeader";
import SelectUserSchemes from "components/FormComponents.jsx/SelectUserSchemes";
import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

import { DataGridPremium } from "@mui/x-data-grid-premium";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import {
  Stack,
  Button,
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useRouter } from "next/router";
import AlertPopup from "components/Bits/AlertPopup";
import { useMutation, useQuery, useQueryClient } from "react-query";
import styled from "@emotion/styled";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";
import useToken from "hooks/useToken";
import dayjs from "dayjs";
import {
  DateField,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers-pro";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";

const CreatePolicies = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const accessToken = useToken();

  const [upload, setUpload] = React.useState(false);
  const [productType, setProductType] = React.useState("");

  const [type, setType] = React.useState("");

  const SwitchType = (value) => {
    setType(value);
    setScheme(null);
  };

  const getProductTypes = useQuery(
    "ProductTypes",
    () => {
      return axios.get(`${nodeSa}/onboarding/product_types`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    },
  );

  const userSchemes = user?.rmaAppUserMetadata?.SchemeIds;

  const [scheme, setScheme] = React.useState("");

  return (
    <div>
      <PageHeader title="Create Policies" />

      <Stack sx={{ my: 2 }}>
        {getProductTypes.isLoading ? (
          <Skeleton variant="rectangular" width={500} height={50} />
        ) : (
          <FormControl
            sx={{
              width: "400px",
            }}
          >
            <InputLabel id="product_type_id">Select Product Type</InputLabel>
            <Select
              labelId="product_type_id"
              id="productType"
              value={productType}
              label="Select Product Type"
              onChange={(event) => {
                setProductType(event.target.value), SwitchType("Scheme");
              }}
            >
              {getProductTypes?.data?.data?.data?.map((product) => {
                if (product.description.toLowerCase() !== "scheme") {
                  return (
                    <MenuItem key={product.id} value={product.id} disabled>
                      {product.description}
                    </MenuItem>
                  );
                } else {
                  return (
                    <MenuItem key={product.id} value={product.id}>
                      {product.description}
                    </MenuItem>
                  );
                }
              })}
            </Select>
          </FormControl>
        )}
      </Stack>

      {type && (
        <>
          {userSchemes && userSchemes.length > 0 ? (
            <SelectUserSchemes
              scheme={scheme}
              setScheme={setScheme}
              userSchemes={userSchemes}
            />
          ) : (
            <div>No Schemes</div>
          )}
        </>
      )}

      {scheme?.policyId && (
        <>
          <Stack
            spacing={2}
            sx={{ mt: 3 }}
            direction="row"
            justifyContent="space-between"
          >
            {!upload && (
              <Button
                onClick={() => {
                  router.push(
                    `/BrokerManager/SchemaManagement/${scheme.brokerId}/Schema/${scheme.policyId}/CreateNewPolicy?type=aa9a11bc-bb63-44d4-a496-b879a9e1e590`,
                  );
                }}
                variant="contained"
                color="success"
                fullWidth
              >
                Add New Lives{" "}
              </Button>
            )}

            <Button
              onClick={() => {
                setUpload(!upload);
              }}
              variant="contained"
              color="primary"
              fullWidth
            >
              Upload File
            </Button>
          </Stack>

          {upload && <FileUpload productType={productType} scheme={scheme} />}
        </>
      )}
    </div>
  );
};

export default CreatePolicies;

const FileUpload = ({ scheme, productType }) => {
  const accessToken = useToken();

  const queryClient = useQueryClient();

  const [date, setDate] = React.useState(dayjs().startOf("month"));

  const [document, setDocument] = React.useState("");

  const uploadFileRequest = useMutation(
    (data) => {
      return axios.post(`${nodeSa}/onboarding/file_upload`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    {
      enabled: !!accessToken,
    },
  );

  const handleSubmit = () => {
    let providerId = scheme?.policyId || representative?.id;

    let joinDate = date;
    const data = new FormData();

    console.log("FormData", {
      file: document,
      providerId,
      joinDate,
      productType,
      brokerageId: scheme.brokerId,
    });

    data.append("file", document);
    data.append("providerId", providerId);
    data.append("joinDate", dayjs(joinDate).format("YYYY-MM-DD"));
    data.append("productTypeId", productType);
    uploadFileRequest.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["GetListOfFiles"] });
      },
    });
  };

  const handelDateChange = (value) => {
    // Initialize 'date' with the current date
    let date = dayjs(value);

    date = date.startOf("month");

    setDate(date);
  };

  // check if date is between +12 and -12 months

  const checkDate = (date) => {
    let currentDate = dayjs();
    let minDate = currentDate.subtract(1, "month").startOf("month");
    let maxDate = currentDate.add(12, "month").startOf("month");

    return date.isBetween(minDate, maxDate, "month", "[]");
  };

  const handleFileChange = (event) => {
    setDocument(event.target.files[0]);
  };

  return (
    <>
      <AlertPopup
        open={uploadFileRequest.isError}
        message={uploadFileRequest?.error?.message}
        severity="error"
      />
      <AlertPopup
        open={uploadFileRequest.isSuccess ? true : false}
        message={"File uploaded successfully"}
        severity="success"
      />

      {!document && scheme && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Join Date"
                value={date}
                views={["month", "year"]}
                openTo="month"
                onChange={(newValue) => handelDateChange(newValue)}
                format="LL"
                minDate={dayjs().subtract(0, "month").startOf("month")}
                maxDate={dayjs().add(12, "month").startOf("month")}
              />
            </LocalizationProvider>
          </Box>

          {checkDate(date) ? (
            <label htmlFor="contained-button-file">
              <Input
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                id="contained-button-file"
                type="file"
                autoFocus
                onChange={handleFileChange}
              />

              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<FileOpenIcon />}
                  fullWidth
                  sx={{
                    py: 2,
                    mb: 2,
                  }}
                  component="span"
                >
                  Upload
                </Button>
                <Button
                  sx={{ mt: 4 }}
                  variant="contained"
                  color="warning"
                  onClick={() => setDocument("")}
                >
                  Cancel
                </Button>
              </>
            </label>
          ) : (
            <Alert severity="warning">
              <Typography>
                Join date must be between{" "}
                {dayjs().subtract(1, "month").startOf("month").format("LL")} and{" "}
                {dayjs().add(12, "month").startOf("month").format("LL")}
              </Typography>
            </Alert>
          )}
        </Stack>
      )}

      {document && (
        <Stack sx={{ my: 4 }}>
          <Card>
            <CardHeader
              title={document.name}
              subheader={document.size}
              action={
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setDocument("")}
                >
                  Cancel
                </Button>
              }
            />
            <CardContent>
              {uploadFileRequest.isLoading ? (
                <Button
                  fullWidth
                  size="large"
                  disabled
                  variant="contained"
                  color="secondary"
                >
                  Loading
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  variant="contained"
                  color="secondary"
                >
                  Submit
                </Button>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </>
  );
};

const Input = styled("input")({
  display: "none",
});

const ListOfFiles = () => {
  const accessToken = useToken();

  const router = useRouter();

  const { user } = useUser();

  const GetListOfFiles = useQuery(
    "GetListOfFiles",
    () => {
      return axios.get(`${nodeSa}/onboarding/file_upload?createdBy=true`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      refetchInterval: 15000,
    },
  );

  const columns = [
    {
      field: "scheme",
      headerName: "Scheme",
      width: 300,
    },
    {
      field: "orgFileName",
      headerName: "File Name",
      width: 300,
    },
    {
      field: "statusDescription",
      headerName: "Status",
      width: 300,
      renderCell: (params) => {
        return (
          <Chip
            variant="outlined"
            color={
              params.row?.status === "pending"
                ? "warning"
                : params.row?.status === "processing" ||
                  params.row?.status === "downloaded"
                ? "secondary"
                : params.row?.status === "Uploaded"
                ? "info"
                : "error"
            }
            label={params.row?.statusDescription}
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Uploaded Date",
      width: 200,
      valueGetter: (params) => {
        return new Date(params.row.createdAt).toLocaleString();
      },
    },
    {
      field: "actions",
      headerName: "Original File",
      width: 250,
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={2}>
            <DownloadFileButton
              id={params.row.id}
              name={params.row?.orgFileName}
              label="Download Original File"
              url={`${nodeSa}/onboarding/file_upload/download/${params.row.id}`}
            />
          </Stack>
        );
      },
    },
    {
      field: "Members List",
      headerName: "Members List",
      width: 200,
      renderCell: (params) => {
        return (
          <>
            {params.row?.statusDescription === "Uploaded members" ? (
              <Button
                onClick={() => {
                  router.push(
                    `/SchemeUser/CreatedPolicies?fileName=${params.row?.orgFileName}`,
                  );
                }}
                variant="contained"
                color="secondary"
              >
                View Members List
              </Button>
            ) : (
              ""
            )}
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Stack sx={{ mt: 4 }}>
        {GetListOfFiles?.data?.data?.data &&
          GetListOfFiles?.data?.data?.data?.length > 0 && (
            <DataGridPremium
              getRowId={(row) => row.id}
              autoHeight
              rows={GetListOfFiles?.data?.data?.data}
              columns={columns}
            />
          )}
      </Stack>
    </div>
  );
};
