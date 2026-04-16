import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import axios from "axios";
import ContentItem from "components/Containers/ContentItem";
import { Form, Formik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import TextfieldWrapper from "./TextFieldWrapper";
import useToken from "hooks/useToken";
import PropTypes from "prop-types";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { styled } from "@mui/material/styles";
import FolderIcon from "@mui/icons-material/Folder";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  InputAdornment,
  Grid,
  AvatarGroup,
} from "@mui/material";

const getPolicyNotes = (accessToken, policyId) => {
  return axios.get(`${nodeSa}/edit/notes/${policyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const getDocuments = (accessToken, policyId) => {
  return axios.get(`${nodeSa}/policyDocuments/${policyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const PolicyNotes = ({ policyId, onboarding_logs }) => {
  const accessToken = useToken();

  const [newNote, setNewNote] = React.useState(false);

  const PolicyNotes = useQuery(
    `getPolicyNotes${policyId}`,
    () => getPolicyNotes(accessToken, policyId),
    {
      enabled: !!accessToken,
    }
  );

  const PolicyDocuments = useQuery(
    `getPolicyDocuments${policyId}`,
    () => getDocuments(accessToken, policyId),
    {
      enabled: !!accessToken,
    }
  );

  const addPolicyNotes = useMutation(
    async (body) =>
      (await axios.post(`${nodeSa}/edit/notes/${policyId}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })) && PolicyNotes.refetch()
  );

  const uploadDocument = useMutation(["upload", policyId], async (body) => {
    return (
      axios.post(`${nodeSa}/policyDocuments/${policyId}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }) && PolicyDocuments.refetch()
    );
  });

  const handleReset = () => {
    setNewNote(false);
  };

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Card sx={{ my: 4 }}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Notes" {...a11yProps(0)} />
            <Tab label="Documents" {...a11yProps(1)} />
            <Tab label="Logs" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {PolicyNotes?.isFetching && <LinearProgress />}
          <CardContent>
            <Button
              sx={{ mb: 2 }}
              onClick={() => {
                setNewNote(!newNote);
              }}
            >
              Add Note
            </Button>

            {newNote && (
              <Formik
                initialValues={{
                  note: "",
                }}
                onSubmit={(values) => {
                  addPolicyNotes.mutate(values);
                  handleReset();
                }}
              >
                {() => {
                  return (
                    <Form>
                      <Stack spacing={2}>
                        <TextfieldWrapper
                          name="note"
                          label="Note"
                          multiline
                          rows={4}
                        />
                        <Stack direction="row" spacing={2}>
                          <Button type="submit" variant="contained">
                            Save Note
                          </Button>
                          <Button onClick={handleReset} color="inherit">
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Form>
                  );
                }}
              </Formik>
            )}

            <List>
              {PolicyNotes?.data?.data?.data?.map((item, index) => {
                return (
                  <ContentItem
                    key={index}
                    title={` ${new Date(
                      item.createdAt
                    ).toLocaleDateString()} - ${new Date(
                      item.createdAt
                    ).toLocaleTimeString()} - ${item.createdBy}`}
                    value={item.note}
                  />
                );
              })}
            </List>
          </CardContent>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <CardContent>
            <AddDocument
              uploadDocument={uploadDocument}
              accessToken={accessToken}
              id={policyId}
            />

            <List>
              <ListDocuments documents={PolicyDocuments?.data?.data?.data} />
            </List>
          </CardContent>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          {/* <DisplayHistory id={policyId} /> */}
          <DisplayPolicyLogs onboarding_logs={onboarding_logs} />
        </CustomTabPanel>
      </Box>
    </Card>
  );
};

export default PolicyNotes;

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
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

const Input = styled("input")({
  display: "none",
});

const AddDocument = React.memo(({ uploadDocument }) => {
  //   const { values, setFieldValue } = useFormikContext();
  const [document, setDocument] = useState("");

  const handleFileChange = useCallback((event) => {
    setDocument(event.target.files[0]);
  }, []);

  const handleSubmit = useCallback(() => {
    const data = new FormData();
    data.append("file", document);
    data.append("documentType", "Child Document");

    uploadDocument.mutate(data, {
      onSuccess: (response) => {
        setDocument("");
      },
    });

    setDocument("");
  }, [document, uploadDocument]);

  return (
    <div>
      {uploadDocument.isLoading ? (
        <Button fullWidth startIcon={<FileOpenIcon />} disabled>
          Uploading...
        </Button>
      ) : (
        <>
          {!document ? (
            <label htmlFor="contained-button-file">
              <Input
                id="contained-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <Button startIcon={<FileOpenIcon />} component="span">
                Upload Supporting Documents
              </Button>
            </label>
          ) : (
            <Button
              onClick={handleSubmit}
              color="secondary"
              fullWidth
              variant="contained"
            >
              Save Document
            </Button>
          )}
        </>
      )}
    </div>
  );
});

AddDocument.displayName = "AddDocument";

const ListDocuments = ({ documents }) => {
  const accessToken = useToken();

  const handleDownload = async ({ url, name }) => {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {documents?.map((document) => {
        console.log(document);
        return (
          <React.Fragment key={document.id}>
            <ListItemButton
              onClick={() => {
                handleDownload({
                  url: `${nodeSa}/policyDocuments/download/${document.id}`,
                  name: document.orgFileName,
                });
              }}
              sx={{ m: 0, pt: 1 }}
              alignItems="flex-start"
            >
              <ListItemAvatar>
                <Avatar>
                  <FolderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      Document Name
                    </Typography>
                    {"   -   "}
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {new Date(document.createdAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
                secondary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body1"
                      color="text.primary"
                    >
                      {document.orgFileName}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          </React.Fragment>
        );
      })}
    </>
  );
};

const DisplayHistory = ({ id }) => {
  const accessToken = useToken();

  const getHistory = useQuery(
    `getHistory${id}`,
    () =>
      axios.get(`${nodeSa}/onboarding/history/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  return (
    <>
      <Accordion>
        <AccordionSummary
          sx={{
            border: 1,
            borderColor: "divider",
          }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            Policy Changes
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Expand to view History [
            {getHistory?.data?.data?.data?.policyChanges?.length}]
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ marginBottom: 2, width: "100%" }}>
          <ChangesListDisplay
            changes={getHistory?.data?.data?.data?.policyChanges}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          sx={{
            border: 1,
            borderColor: "divider",
          }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            Member Changes
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Expand to view History [
            {getHistory?.data?.data?.data?.memberChanges?.length}]
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MemberChangesDisplay
            memberChanges={getHistory?.data?.data?.data?.memberChanges}
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

const MemberChangesDisplay = ({ memberChanges }) => {
  console.log("🚀 ~ MemberChangesDisplay ~ memberChanges:", memberChanges);
  return (
    <div style={{ width: "100%" }}>
      {memberChanges?.map((member, index) => (
        <Card key={index} variant="outlined" sx={{ width: "100%" }}>
          <CardContent>
            <Stack direction="row" spacing={3}>
              <Typography> {member.firstName}</Typography>
              <Typography> {member.surname}</Typography>
            </Stack>
            <List>
              {member.changes.map((change, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Change Type: ${change.changeType}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Changed Value: {JSON.stringify(change.changedValue)}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Updated By: {change.updatedBy || "N/A"}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Created At:{" "}
                          {new Date(change.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ChangesListDisplay = ({ changes }) => {
  return (
    <div>
      {changes?.map((change, index) => (
        <Accordion key={index}>
          <AccordionSummary
            sx={{
              backgroundColor: "background.default",
            }}
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Stack
              sx={{ width: "100%" }}
              direction="row"
              justifyContent="space-between"
            >
              <Typography>Change ID: {change.id}</Typography>
              <Typography>
                Change At: {new Date(change.createdAt).toLocaleString()}
              </Typography>
              <Typography>Change Type: {change.changeType}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Card variant="outlined" sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">
                  Updated By: {change.updatedBy}
                </Typography>
                <Typography variant="subtitle1">
                  Created At: {new Date(change.createdAt).toLocaleString()}
                </Typography>
                <List>
                  {Object.entries(change.changedValue).map(
                    ([key, values], idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={key.charAt(0).toUpperCase() + key.slice(1)}
                          secondary={values.join(", ")}
                        />
                      </ListItem>
                    )
                  )}
                </List>
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

const DisplayPolicyLogs = ({ onboarding_logs }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const filteredLogs = (onboarding_logs || []).filter(
    (log) =>
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const communicationTypes = {
    1: "Email",
    2: "Phone",
    3: "Post",
    4: "SMS",
  };

  const selectedGender = {
    1: "Male",
    2: "Female",
  };

  function transformChanges(data) {
    return data.map((changeRecord) => {
      return {
        ...changeRecord,
        member_changes: (changeRecord.member_changes || []).map((member) => {
          return {
            ...member,
            modifications: (member.modifications || [])
              .filter((mod) => {
                if (mod.field === "notes") {
                  /*This will be use for Report or Auditing 
                  Purpose to export a larger data set of notes(Logs) */
                  // console.log("Notes Mod:", mod);
                  return false;
                }
                return true; // Keep all others Fields
              })
              .map((mod) => {
                if (mod.field === "preferredCommunicationTypeId") {
                  return {
                    ...mod,
                    oldValue:
                      communicationTypes?.[mod.oldValue] ?? mod.oldValue,
                    newValue:
                      communicationTypes?.[mod.newValue] ?? mod.newValue,
                  };
                }

                if (mod.field === "gender") {
                  return {
                    ...mod,
                    oldValue: selectedGender?.[mod.oldValue] ?? mod.oldValue,
                    newValue: selectedGender?.[mod.newValue] ?? mod.newValue,
                  };
                }

                if (mod.field === "exceptions") {
                  return {
                    ...mod,
                    oldValue: Array.isArray(mod.oldValue)
                      ? mod.oldValue.map(
                          (item) =>
                            item.message || item.value || JSON.stringify(item)
                        )
                      : [],
                    newValue: Array.isArray(mod.newValue)
                      ? mod.newValue.map(
                          (item) =>
                            item.message || item.value || JSON.stringify(item)
                        )
                      : [],
                  };
                }

                if (mod.field === "dateOfBirth") {
                  return {
                    ...mod,
                    oldValue: mod.oldValue
                      ? new Date(mod.oldValue).toLocaleDateString("en-ZA")
                      : "N/A",
                    newValue: mod.newValue
                      ? new Date(mod.newValue).toLocaleDateString("en-ZA")
                      : "N/A",
                  };
                }

                return mod;
              }),
          };
        }),
      };
    });
  }

  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, " ID");
  };

  const getUserDisplayName = (email) => {
    return email
      .split("@")[0]
      .replace(/[.+]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getChangeTypeColor = (type) => {
    switch (type) {
      case "MODIFIED":
        return "#FF9800";
      case "ADDED":
        return "#4CAF50";
      case "REMOVED":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const renderModificationRow = (mod) => (
    <>
      <TableCell sx={{ fontWeight: "medium" }}>
        {formatFieldName(mod.field)}
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            bgcolor: "error.lighter",
            color: "error.main",
            p: 0.5,
            borderRadius: 1,
            display: "inline-block",
          }}
        >
          {mod.oldValue === null || mod.oldValue === undefined
            ? "N/A"
            : typeof mod.oldValue === "object"
            ? JSON.stringify(mod.oldValue)
            : String(mod.oldValue)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            bgcolor: "success.lighter",
            color: "success.main",
            p: 0.5,
            borderRadius: 1,
            display: "inline-block",
          }}
        >
          {mod.newValue === null || mod.newValue === undefined
            ? "N/A"
            : typeof mod.newValue === "object"
            ? JSON.stringify(mod.newValue)
            : String(mod.newValue)}
        </Typography>
      </TableCell>
    </>
  );

  const renderMemberChanges = (memberChanges) => {
    if (!memberChanges?.length) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No member changes recorded
        </Alert>
      );
    }

    return memberChanges.map((change, index) => (
      <Paper variant="outlined" key={index} sx={{ p: 1.5, mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24 }}>
            <Typography fontSize={12}>{change.memberId}</Typography>
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Member ID: {change.memberId}
            </Typography>
          </Box>
          <Chip
            label={change.type}
            size="small"
            sx={{
              bgcolor: getChangeTypeColor(change.type),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>{" "}
        <Card variant="outlined">
          {change.modifications && (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "30%", fontWeight: "bold" }}>
                      Field
                    </TableCell>
                    <TableCell sx={{ width: "35%", fontWeight: "bold" }}>
                      Previous Value
                    </TableCell>
                    <TableCell sx={{ width: "35%", fontWeight: "bold" }}>
                      New Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {change.modifications.map((mod, idx) => (
                    <TableRow key={idx} hover>
                      {renderModificationRow(mod)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Paper>
    ));
  };

  const renderPolicyChanges = (policyChanges) => {
    if (!policyChanges || Object.keys(policyChanges).length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No policy changes recorded
        </Alert>
      );
    }

    const formatValue = (value) => {
      if (value === null || value === undefined) return "N/A";

      if (
        value instanceof Date ||
        (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/))
      ) {
        return new Date(value).toLocaleDateString();
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return "None";
        }

        if (
          value.every((v) => typeof v === "object" && v.message !== undefined)
        ) {
          return value
            .map(
              (ex, idx) =>
                `• ${ex.message}${
                  ex.field ? ` (Field: ${formatFieldName(ex.field)})` : ""
                }`
            )
            .join("\n");
        }

        // Existing note handler (keep it)
        if (
          value.length > 0 &&
          value.every(
            (v) =>
              typeof v === "object" &&
              v !== null &&
              v.note &&
              v.createdBy &&
              v.createdAt
          )
        ) {
          return value
            .map(
              (v) =>
                `${v.note} (by ${v.createdBy.split("@")[0]} on ${new Date(
                  v.createdAt
                ).toLocaleDateString("en-ZA")})`
            )
            .join("\n");
        }

        return JSON.stringify(value);
      }

      if (typeof value === "object" && value !== null) {
        // Same logic as before (notes or from/to structure)
        if (value.note && value.createdAt && value.createdBy) {
          return `${value.note} (by ${value.createdBy} on ${new Date(
            value.createdAt
          ).toLocaleDateString("en-ZA")})`;
        }

        if (value.from !== undefined || value.to !== undefined) {
          const fromValue = formatValue(value.from);
          const toValue = formatValue(value.to);
          return `${fromValue} → ${toValue}`;
        }

        try {
          return JSON.stringify(value);
        } catch (error) {
          return "[Complex Object]";
        }
      }

      return String(value);
    };

    const values = Object.entries(policyChanges).map(([field, change]) => {
      return {
        field,
        from: formatValue(change.from),
        to: formatValue(change.to),
      };
    });
    // console.log("🚀 ~ values ~ values:", values);

    return (
      <Card variant="outlined">
        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Previous Value</TableCell>
                <TableCell>New Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(policyChanges).map(([field, change], index) => (
                <TableRow key={field}>
                  <TableCell>{formatFieldName(field)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: "error.lighter",
                        color: "error.main",
                        p: 0.5,
                        borderRadius: 1,
                        display: "inline-block",
                      }}
                    >
                      {" "}
                      {formatValue(change.from)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: "success.lighter",
                        color: "success.main",
                        p: 0.5,
                        borderRadius: 1,
                        display: "inline-block",
                      }}
                    >
                      {formatValue(change.to)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  if (!onboarding_logs || onboarding_logs.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
          p: 2,
        }}
      >
        <DescriptionIcon
          sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No policy logs available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Policy change logs will appear here when available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxHeight: 600, // adjust as needed
        overflowY: "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1,
      }}
    >
      <Stack
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {" "}
        <Box>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search by user email or log ID..."
            value={searchQuery}
            type="search"
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 350,
              borderRadius: 6,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "divider",
                  borderRadius: 6,
                },
              },
            }}
          />
        </Box>
        <Stack sx={{ display: "flex", gap: 1 }} direction="row">
          <Chip
            color="warning"
            label={` Total Logs ${onboarding_logs.length}`}
          />
          <Chip
            color="primary"
            label={` Member Changes ${onboarding_logs.reduce(
              (acc, log) => acc + (log.member_changes?.length || 0),
              0
            )}`}
          />
          <Chip
            color="success"
            label={` Policy Changes ${onboarding_logs.reduce(
              (acc, log) => acc + Object.keys(log.policy_changes || {}).length,
              0
            )}`}
          />
        </Stack>
      </Stack>

      <Stack spacing={3} sx={{ mt: 1 }}>
        {filteredLogs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((log) => (
            <Paper variant="outlined" key={log.id} sx={{ p: 1 }}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Grid item>
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 42, height: 42 }}
                  >
                    <PersonIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography color="primary.main" variant="h6">
                    {getUserDisplayName(log.user)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontSize={11}
                  >
                    {log.user}
                  </Typography>
                </Grid>
                <Grid
                  item
                  sm="auto"
                  sx={{ textAlign: { xs: "left", sm: "right" } }}
                >
                  <Typography variant="body2" color="primary.main">
                    Date: {new Date(log.createdAt).toLocaleDateString()} | Time:{" "}
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Policy ID: {log.policy_id} | Log ID: {log.id.slice(0, 8)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />

              <Accordion
                onChange={() => toggleLogExpansion(`${log.id}-member`)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <GroupIcon />
                    <Typography>Member Changes</Typography>
                    <Chip
                      label={log.member_changes?.length || 0}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1, pt: 0 }}>
                  <AccordionDetails sx={{ p: 1, pt: 0 }}>
                    {renderMemberChanges(
                      transformChanges([log])[0].member_changes
                    )}
                  </AccordionDetails>
                </AccordionDetails>
              </Accordion>

              <Accordion
                onChange={() => toggleLogExpansion(`${log.id}-policy`)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SecurityIcon />
                    <Typography>Policy Changes</Typography>
                    <Chip
                      label={Object.keys(log.policy_changes || {}).length}
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1, pt: 0 }}>
                  {renderPolicyChanges(log.policy_changes)}
                </AccordionDetails>
              </Accordion>
            </Paper>
          ))}
      </Stack>

      {filteredLogs.length === 0 && searchQuery && (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
            mt: 3,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No logs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search query
          </Typography>
        </Box>
      )}
    </Box>
  );
};
