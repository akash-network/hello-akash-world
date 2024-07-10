import React from "react";
import { useColorMode } from "../../context/colorMode";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export const ColorModeSwitch = () => {
  const { mode, toggleMode } = useColorMode();

  return (
    <IconButton onClick={() => toggleMode()} color="inherit">
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ColorModeSwitch;
