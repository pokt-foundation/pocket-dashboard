import React from "react";
import PropTypes from "prop-types";
import { createGlobalStyle } from "styled-components";
import { textStyle } from "ui/style";
import { useTheme } from "ui/theme";

const BaseStyles = React.memo(function BaseStyles(props) {
  const theme = useTheme();

  return (
    <GlobalStyle {...props} theme={theme} textStyleCss={textStyle("body2")} />
  );
});

BaseStyles.propTypes = {
  publicUrl: PropTypes.string,
  fontFamily: PropTypes.string,
};

BaseStyles.defaultProps = {
  publicUrl: "/",
};

const GlobalStyle = createGlobalStyle`
  *, *:before, *:after {
    box-sizing: border-box;
  }

  *::-webkit-scrollbar { 
    width: 0 !important 
  }

  * { 
    overflow: -moz-scrollbars-none; 
    -ms-overflow-style: none;
  }

  html {
    -webkit-overflow-scrolling: touch;
  }
  body {
    height: 0;
    min-height: 100vh;
    color: ${(p) => p.theme.content};
    font-family: 'Manrope', Helvetica, serif;
    ${(p) => p.textStyleCss};
  }
  html, body {
    overflow: hidden;
    overflow-y: scroll;
  }
  body, ul, p, h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
  }
  button, select, input, textarea, h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
  a, button, select, input, textarea {
    color: inherit;
  }
  strong, b {
    font-weight: 600;
  }
  ::selection {
    background: ${(p) => p.theme.selected};
    color: ${(p) => p.theme.selectedContent};
  }
`;

export default BaseStyles;
