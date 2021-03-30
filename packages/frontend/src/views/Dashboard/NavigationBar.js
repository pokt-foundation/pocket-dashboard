import React, { useCallback, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useMutation } from "react-query";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  ButtonBase,
  ButtonIcon,
  IconCog,
  Popover,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from "ui";
import env from "environment";
import axios from "axios";

export default function NavigationBar() {
  const history = useHistory();
  const { mutate: onLogout } = useMutation(async function logout() {
    const path = `${env("BACKEND_URL")}/api/users/logout`;

    try {
      await axios.post(
        path,
        {},
        {
          withCredentials: true,
        }
      );

      history.push("/login");
    } catch (err) {
      console.log("err", err);
    }
  });

  return (
    <nav
      css={`
        display: flex;
        flex-direction: row;
        margin-top: ${5 * GU}px;
        align-items: center;
      `}
    >
      <span
        css={`
          display: inline-block;
          flex-grow: 1;
          ${textStyle("title1")}
        `}
      >
        Pocket Dashboard
      </span>
      <ul
        css={`
          list-style: none;
          display: flex;
          justify-content: center;
          align-items: center;
          li {
            display: inline-block;
          }
          li:not(:last-child) {
            margin-right: ${7 * GU}px;
          }
        `}
      >
        <li>Support</li>
        <li>Community</li>
        <li>
          <SettingsButton onLogout={onLogout} />
        </li>
      </ul>
    </nav>
  );
}

function SettingsButton({ onLogout }) {
  const theme = useTheme();
  const { below } = useViewport();

  const [opened, setOpened] = useState(false);
  const containerRef = useRef();

  const handleToggle = useCallback(() => setOpened((opened) => !opened), []);
  const handleClose = useCallback(() => setOpened(false), []);

  return (
    <React.Fragment>
      <div ref={containerRef}>
        <ButtonIcon
          element="div"
          onClick={handleToggle}
          css={`
            width: ${4.25 * GU}px;
            height: 100%;
            border-radius: 0;
          `}
          label="Global preferences"
        >
          <IconCog
            css={`
              color: ${theme.hint};
            `}
          />
        </ButtonIcon>
      </div>
      <Popover
        closeOnOpenerFocus
        placement="bottom-end"
        onClose={handleClose}
        visible={opened}
        opener={containerRef.current}
      >
        <ul
          css={`
            /* Use 20px as the padding setting for popper is 10px */
            width: ${below("medium") ? `calc(100vw - 20px)` : `${30 * GU}px`};
            padding: 0;
            margin: 0;
            list-style: none;
            background: ${theme.surface};
            color: ${theme.content};
            border-radius: ${RADIUS}px;
          `}
        >
          <li
            css={`
              display: flex;
              align-items: center;
              height: ${4 * GU}px;
              padding-left: ${2 * GU}px;
              border-bottom: 1px solid ${theme.border};
              ${textStyle("label2")}
              color: ${theme.surfaceContentSecondary};
            `}
          >
            Settings
          </li>
          <Item onClick={() => onLogout()} icon={IconCog} label="Logout" />
        </ul>
      </Popover>
    </React.Fragment>
  );
}

function Item({ icon, label, onClick, lastItem }) {
  const theme = useTheme();

  return (
    <li
      css={`
        & + & {
          border-top: 1px solid ${theme.border};
        }
      `}
    >
      <ButtonBase
        onClick={onClick}
        label={label}
        css={`
          width: 100%;
          height: ${7 * GU}px;
          border-radius: 0;
        `}
      >
        <div
          css={`
            display: flex;
            width: 100%;
            height: 100%;
            padding: ${2 * GU}px;
            justify-content: left;
            align-items: center;

            &:active,
            &:focus {
              background: ${theme.surfacePressed};
            }
          `}
        >
          {icon && <img src={icon} alt="" />}
          <div
            css={`
              flex-grow: 1;
              display: flex;
              align-items: center;
              margin-left: ${icon ? 1 * GU : 0}px;
            `}
          >
            {label}
          </div>
        </div>
      </ButtonBase>
    </li>
  );
}
