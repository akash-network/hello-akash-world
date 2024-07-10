import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../layout/Layout";
import { makeStyles } from "tss-react/mui";
import { ReactNode } from "react";

type Props = {
  errors: string;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  root: {
    paddingTop: "2rem",
    paddingBottom: "2rem",
    marginLeft: "0"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  }
}));

const Error: React.FunctionComponent<Props> = ({ errors }) => {
  const { classes } = useStyles();

  return (
    <Layout title="Error | Hello Akash World!">
      <Container className={classes.root}>
        <Typography variant="h1" className={classes.title}>
          An error has occured
        </Typography>

        <Typography variant="body2">{errors}</Typography>
      </Container>
    </Layout>
  );
};

export default Error;
