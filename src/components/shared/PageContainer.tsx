import Container from "@mui/material/Container";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const PageContainer: React.FunctionComponent<Props> = ({ children }) => {
  return <Container sx={{ paddingTop: { xs: "1rem", sm: "8rem" }, paddingBottom: "2rem", height: "100%" }}>{children}</Container>;
};

export default PageContainer;
