import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { animated, useSpring } from "react-spring";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { ButtonBase, useTheme, springs, GU, RADIUS } from "ui";
import ButtonIcon from "components/MenuPanel/ButtonIcon.png";
import PocketLogo from "assets/pnlogo.png";

const DASHBOARD_BASE_PREFIX = "dashboard";

const MENU_ROUTES = [
  {
    icon: ButtonIcon,
    id: "home",
    title: "Network",
  },
  {
    icon: ButtonIcon,
    id: "apps",
    title: "My Apps",
  },
];

function getLocationId(pathname) {
  const [, , id = ""] = pathname.split("/");

  return id;
}

export default function MenuPanel() {
  const { pathname } = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const { within } = useViewport();
  const [activeId, setActiveId] = useState(() => getLocationId(pathname));

  const compactMode = within(-1, "medium");

  useEffect(() => {
    const [, , id = ""] = pathname.split("/");

    setActiveId(id);
  }, [pathname]);

  return (
    !compactMode && (
      <div
        css={`
          width: ${17 * GU}px;
          height: 100vh;
          background: ${theme.surface};
          border-radius: 0px 20px 20px 0;
          flex-grow: 0;
          padding: ${2 * GU}px 0;
          button:not(:last-child) {
            margin-bottom: ${5 * GU}px;
          }
        `}
      >
        <ButtonBase
          css={`
            width: 100%;
            position: relative;
            &:active {
              top: 1px;
            }
          `}
        >
          <img src={PocketLogo} alt="Pocket Network Logo link" />
        </ButtonBase>
        {MENU_ROUTES.map(({ icon, id, title }) => (
          <MenuPanelButton
            active={activeId === id}
            element={id === "docs" ? "a" : "button"}
            href={
              id === "docs"
                ? "https://dashboard.docs.pokt.network/docs/using-pocket-gateway#"
                : ""
            }
            external={id === "docs"}
            icon={icon}
            key={id}
            label={title}
            onClick={() => {
              if (id !== "docs") {
                history.push({
                  pathname: `/${DASHBOARD_BASE_PREFIX}/${id}`,
                });
              }
            }}
          />
        ))}
      </div>
    )
  );
}

function MenuPanelButton({ active, icon, label, onClick, ...props }) {
  const { openProgress } = useSpring({
    to: { openProgress: Number(active) },
    config: springs.smooth,
  });
  const theme = useTheme();

  return (
    <ButtonBase
      css={`
        position: relative;
        width: 100%;
        min-height: ${10 * GU}px;
        border-radius: 0px;
        color: black;
        transition: background 150ms ease-in-out;
        background: ${active ? theme.surfacePressed : "transparent"};
      `}
      onClick={onClick}
      {...props}
    >
      <animated.div
        css={`
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: ${theme.accent};
          border-radius: ${RADIUS}px;
        `}
        style={{
          opacity: openProgress,
          transform: openProgress.interpolate(
            (v) => `translate3d(-${(1 - v) * 100}%, 0, 0)`
          ),
        }}
      />
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          img {
            display: block;
            width: ${5 * GU}px;
            height: ${5 * GU}px;
          }
        `}
      >
        <img src={icon} alt={`${label} icon`} />
        {label}
      </div>
    </ButtonBase>
  );
}

MenuPanelButton.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.string,
  label: PropTypes.string,
  onClcik: PropTypes.func,
};
