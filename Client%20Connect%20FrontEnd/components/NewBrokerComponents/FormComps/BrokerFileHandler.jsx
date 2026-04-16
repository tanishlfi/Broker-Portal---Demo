import React from "react";
import { useQuery, useMutation } from "react-query";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";
import UploadBrokerDocuments from "./UploadBrokerDocuments";
import DisplayBrokerFiles from "./DisplayBrokerFiles";
import useToken from "../../../hooks/useToken";
import { nodeSa } from "../../../src/AxiosParams";

const BrokerFileHandler = ({
  title,
  description,
  newSchemeId,
  DocumentType,
}) => {
  const accessToken = useToken();

  const GetDocuments = useQuery({
    queryKey: ["getDocuments", DocumentType],
    queryFn: async () =>
      axios.get(
        `${nodeSa}/brokerscheme/file_upload/getFiles/${newSchemeId}/${DocumentType}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
    enabled: !!newSchemeId && !!accessToken,
  });

  const UploadDocument = useMutation({
    mutationFn: async (formData) =>
      axios.post(
        `${nodeSa}/brokerscheme/file_upload/${newSchemeId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      ),
    onSettled: () => {
      GetDocuments.refetch();
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${nodeSa}/brokerscheme/file_upload/download/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSettled: () => {
      GetDocuments.refetch();
    },
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{title}</Typography>

          {/* {description && <Typography variant="body1">{description}</Typography>} */}

          <UploadBrokerDocuments
            UploadDocument={UploadDocument}
            DocumentType={DocumentType}
            newSchemeId={newSchemeId}
          />
          <DisplayBrokerFiles
            deleteDocument={deleteDocument}
            GetDocuments={GetDocuments}
            DocumentType={DocumentType}
            newSchemeId={newSchemeId}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BrokerFileHandler;
