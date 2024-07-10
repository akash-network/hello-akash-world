import React, { useEffect, useState } from "react";
import { PaletteMode } from "@mui/material";
import { createTheme, ThemeProvider, ThemeOptions } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { customColors } from "@src/utils/colors";
import { grey } from "@mui/material/colors";
import { useDarkMode } from "next-dark-mode";

type ContextType = {
  mode: string;
  toggleMode: () => void;
};

const ColorModeProviderContext = React.createContext<ContextType>({ mode: "", toggleMode: null });

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // LIGHT
          primary: {
            main: customColors.darkBlue
          },
          secondary: {
            main: customColors.red
          },
          background: {
            default: "hsl(15 33% 98%)"
          }
        }
      : {
          // DARK
          primary: {
            main: customColors.darkBlue
          },
          secondary: {
            main: customColors.red
          },
          background: {
            default: "hsl(20 14.3% 4.1%)"
          }
        })
  },
  typography: {
    fontFamily: ["Geist", "sans-serif"].join(",")
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: "auto",
          height: "100%",
          width: "100%"
        },
        body: {
          height: "100%",
          width: "100%",
          overflowY: "auto !important",
          padding: "0 !important",
          "&::-webkit-scrollbar": {
            width: "10px"
          }
        },
        "*": {
          margin: 0,
          padding: 0,
          transition: "background-color .2s ease"
        },
        // Nextjs root div
        "#__next": {
          height: "100%"
        },
        // Page loading styling
        "#nprogress .bar": {
          background: `${customColors.red} !important`
        },
        "#nprogress .peg": {
          boxShadow: `0 0 10px ${customColors.red}, 0 0 5px ${customColors.red}`
        },
        "#nprogress .spinner-icon": {
          borderTopColor: `${customColors.red} !important`,
          borderLeftColor: `${customColors.red} !important`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "background-color .2s ease, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
        }
      }
    }
  }
});

const darkTheme = createTheme(getDesignTokens("dark"));
const lightTheme = createTheme(getDesignTokens("light"));

export const ColorModeProvider = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { darkModeActive, switchToDarkMode, switchToLightMode } = useDarkMode();
  const mode = darkModeActive ? "dark" : "light";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMode = () => {
    if (darkModeActive) {
      switchToLightMode();
    } else {
      switchToDarkMode();
    }
  };

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => (darkModeActive ? darkTheme : lightTheme), [darkModeActive]);

  return (
    <ColorModeProviderContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {isMounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
      </ThemeProvider>
    </ColorModeProviderContext.Provider>
  );
};

export const useColorMode = () => {
  return { ...React.useContext(ColorModeProviderContext) };
};
