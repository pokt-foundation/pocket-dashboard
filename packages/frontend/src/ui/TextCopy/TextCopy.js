import React, { useCallback, useImperativeHandle, useRef } from "react";
import PropTypes from "prop-types";
import "styled-components/macro";
import { IconCopy } from "ui/icons";
import { GU, RADIUS, textStyle } from "ui/style";
import { useTheme } from "ui/theme";
import { noop, warn } from "ui/utils";
import TextInput from "ui/TextInput/TextInput";
import ButtonIcon from "ui/Button/ButtonIcon";

const HEIGHT = 5 * GU;

const TextCopy = React.memo(
  React.forwardRef(function TextCopy(
    { adornment, autofocus, message, monospace, onCopy, value, ...props },
    ref
  ) {
    const theme = useTheme();
    const inputRef = useRef(null);

    // Allows to focus the component from the outside
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current.focus();
      },
    }));

    // Select the content on focus
    const handleFocus = useCallback(() => {
      inputRef.current && inputRef.current.select();
    }, []);

    // If onCopy is set (either to a function or null), Toast is not used.
    const onCopyOrToast = onCopy === undefined ? noop : onCopy || noop;

    const handleCopy = useCallback(() => {
      if (inputRef.current) {
        inputRef.current.focus();

        try {
          document.execCommand("copy");
          onCopyOrToast(message);
        } catch (err) {
          warn(err);
        }
      }
    }, [message, onCopyOrToast]);

    return (
      <div
        css={`
          position: relative;
          display: inline-flex;
          width: ${52.5 * GU}px;
          max-width: 100%;
          height: ${HEIGHT}px;
          padding-left: ${adornment ? `${HEIGHT}px` : "0"};
        `}
        {...props}
      >
        <TextInput
          ref={inputRef}
          adornment={
            <ButtonIcon
              onClick={handleCopy}
              label="Copy"
              css={`
                width: ${HEIGHT - 2}px;
                height: ${HEIGHT - 2}px;
                border-radius: 0;
                color: ${theme.surfaceIcon};
              `}
            >
              {adornment ?? <IconCopy />}
            </ButtonIcon>
          }
          adornmentPosition="end"
          adornmentSettings={{
            // Keep the button square
            width: HEIGHT - 2,
            padding: 0,
          }}
          autofocus={autofocus}
          onFocus={handleFocus}
          readOnly
          value={value}
          wide
          css={`
            text-overflow: ellipsis;
            height: ${HEIGHT}px;
            max-width: 100%;
            border: 1px solid ${theme.border};
            ${adornment
              ? `
                  border-top-left-radius: 0;
                  border-bottom-left-radius: 0;
                  border-left: 0;
                `
              : ""};
            ${textStyle(monospace ? "address2" : "body3")};
            &:read-only {
              color: ${theme.surfaceContent};
              text-shadow: none;
            }
          `}
        />
      </div>
    );
  })
);

TextCopy.propTypes = {
  adornment: PropTypes.node,
  autofocus: PropTypes.bool,
  message: PropTypes.string,
  monospace: PropTypes.bool,
  onCopy: PropTypes.func,
  value: PropTypes.string,
};

TextCopy.defaultProps = {
  autofocus: false,
  message: "Copied",
  monospace: true,
};

export default TextCopy;
