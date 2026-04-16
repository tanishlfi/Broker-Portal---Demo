// @ts-nocheck
import {
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
} from "@mui/material";

import React from "react";
import { useRouter } from "next/router";

const PageHeader = ({
  title = "",
  subTitle = "",
  breadcrumbs = [{ title: "Home", href: "/" }],
  noBack,
}) => {
  const router = useRouter();

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        title={title}
        subheader={subTitle && subTitle}
        action={!noBack && <Button onClick={() => router.back()}>Back</Button>}
      />

      <CardContent>
        <Breadcrumbs aria-label="breadcrumb">
          {breadcrumbs?.map((breadcrumb, index) => (
            <Link
              key={index}
              href={breadcrumb.href}
              color="inherit"
              underline="none"
              variant="body2"
            >
              {breadcrumb.title}
            </Link>
          ))}
        </Breadcrumbs>
      </CardContent>
    </Card>
  );
};

export default PageHeader;
