import React from "react";
import { useQuery, useMutation } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { Card, CardHeader, CardContent } from "@mui/material";
import SchemeFileUpload from "components/FormComponents.jsx/UploadQuotesFiles";
import DisplayFiles from "./DisplayFiles";
import useToken from "../../hooks/useToken";

const FileHandler = ({ title, description, newSchemeId, DocumentType }) => {
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
    <Card>
      <CardHeader title={title} subheader={description ? description : ""} />
      <CardContent>
        <SchemeFileUpload
          UploadDocument={UploadDocument}
          DocumentType={DocumentType}
          newSchemeId={newSchemeId}
        />
        <DisplayFiles
          deleteDocument={deleteDocument}
          GetDocuments={GetDocuments}
          DocumentType={DocumentType}
          newSchemeId={newSchemeId}
        />
      </CardContent>
    </Card>
  );
};

export default FileHandler;
