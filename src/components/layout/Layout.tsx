import React, { ReactNode, useEffect, useState } from "react";
import PageHead from "./PageHead";
import Box from "@mui/material/Box";
import { IntlProvider } from "react-intl";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../shared/ErrorFallback";
import { makeStyles } from "tss-react/mui";
import { cx } from "@emotion/css";
import { animated, useSpring } from "@react-spring/web";

type Props = {
  children?: ReactNode;
  title?: string;
};

const useStyles = makeStyles()(theme => ({
  background: {
    backgroundImage: "url('/images/akash-sign-red.svg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    filter: "blur(8px)",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    opacity: 0.2
  }
}));

const Layout: React.FunctionComponent<Props> = ({ children, title = "Hello Akash World" }) => {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <IntlProvider locale={locale}>
      <LayoutApp title={title}>{children}</LayoutApp>
    </IntlProvider>
  );
};

const LayoutApp: React.FunctionComponent<Props> = ({ children, title }) => {
  const { classes } = useStyles();
  const [isMounted, setIsMounted] = useState(false);
  const styles = useSpring({ opacity: isMounted ? 0.2 : 0, config: { duration: 3000 } });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        color: "text.primary",
        position: "relative"
      }}
    >
      <animated.div style={styles} className={cx("animated-background", classes.background)} />
      <PageHead headTitle={title} />

      <Box sx={{ height: "100%" }}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
      </Box>
    </Box>
  );
};

export default Layout;

