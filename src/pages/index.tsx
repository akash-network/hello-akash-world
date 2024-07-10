import Layout from "../components/layout/Layout";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { ReactNode, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import { DiscordIcon } from "@src/components/shared/icons";
import PageContainer from "@src/components/shared/PageContainer";
import ColorModeSwitch from "@src/components/layout/ColorModeSwitch";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { Trail } from "@src/components/shared/Trail";

type Props = {
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "4rem",
    fontWeight: "bold"
  },
  subTitle: {
    fontSize: "2rem",
    fontWeight: "300",
    marginBottom: "2rem"
  },
  socials: {
    paddingTop: "2rem",
    maxWidth: "500px",
    margin: "0 auto"
  },
  socialLink: {
    padding: "1rem",
    transition: ".3s all ease",
    "& path": {
      fill: theme.palette.mode === "dark" ? "#fff" : theme.palette.primary.main,
      transition: ".3s all ease"
    },
    "&:hover": {
      color: theme.palette.grey[500],
      "& path": {
        fill: theme.palette.grey[500]
      }
    }
  },
  socialIcon: {
    height: "3rem",
    width: "3rem",
    fontSize: "3rem",
    display: "block",
    margin: "0 auto"
  }
}));

const IndexPage: React.FunctionComponent<Props> = () => {
  const { classes } = useStyles();
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Layout title="Hello Akash World!">
      <PageContainer>
        <Box mb={4} sx={{ textAlign: "center" }}>
          <Trail open={isMounted}>
            <Typography variant="h1" className={classes.title}>
              Hello from Akash!
            </Typography>
            <Typography variant="h1" className={classes.subTitle}>
              Welcome to Akash Console
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              This is a{" "}
              <a href="https://nextjs.org/" target="_blank">
                NextJS
              </a>{" "}
              app running inside a{" "}
              <a href="https://www.docker.com/" target="_blank">
                Docker container
              </a>{" "}
              on the{" "}
              <a href="https://akash.network" target="_blank">
                Akash Network.
              </a>
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 300 }}>
              You can find all the documentation to deploy on akash{" "}
              <a href="https://akash.network/docs" target="_blank">
                here!
              </a>
            </Typography>

            <Grid container spacing={1} className={classes.socials}>
              <Grid item xs={6} sm={3}>
                <a href="https://discord.akash.network/" target="_blank" className={classes.socialLink}>
                  <DiscordIcon className={classes.socialIcon} />
                </a>
              </Grid>
              <Grid item xs={6} sm={3}>
                <a href="https://youtube.com/@AkashNetwork?si=cd2P3ZlAa4gNQw0X?sub_confirmation=1" target="_blank" className={classes.socialLink}>
                  <YouTubeIcon className={classes.socialIcon} />
                </a>
              </Grid>
              <Grid item xs={6} sm={3}>
                <a href="https://x.com/akashnet_" target="_blank" className={classes.socialLink}>
                  <XIcon className={classes.socialIcon} />
                </a>
              </Grid>
              <Grid item xs={6} sm={3}>
                <a href="https://github.com/akash-network/console" target="_blank" className={classes.socialLink}>
                  <GitHubIcon className={classes.socialIcon} />
                </a>
              </Grid>
            </Grid>

            <Box sx={{ pt: 5 }}>
              <ColorModeSwitch />
            </Box>

            <Box sx={{ height: "85px", position: "relative", width: "100%", pt: 5 }}>
              <a href="https://akash.network" target="_blank">
                <Image
                  alt="Akash Network Logo"
                  src={theme.palette.mode === "dark" ? "/images/akash-logo-white.svg" : "/images/akash-logo-black.svg"}
                  quality={100}
                  priority
                  width={280}
                  height={100}
                />
              </a>
            </Box>
          </Trail>
        </Box>
      </PageContainer>
    </Layout>
  );
};

export default IndexPage;
