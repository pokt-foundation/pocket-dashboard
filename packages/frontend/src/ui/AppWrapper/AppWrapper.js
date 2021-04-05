import React from "react";
import PropTypes from "prop-types";
import { Root } from "ui/Root/Root";
import BaseStyles from "ui/BaseStyles/BaseStyles";
import { Theme } from "ui/theme";
import "@fontsource/inter";
import "@fontsource/source-code-pro";

export default function AppWrapper({ children }) {
  return (
    <Root.Provider>
      <BaseStyles />
      <Theme theme="dark">{children}</Theme>
    </Root.Provider>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.node,
};
