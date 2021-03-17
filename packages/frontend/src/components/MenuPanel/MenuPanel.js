import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { animated, useSpring } from "react-spring";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { ButtonBase, Spacer, useTheme, springs, GU, RADIUS } from "ui";
import ButtonIcon from "components/MenuPanel/ButtonIcon.png";
import PocketLogo from "assets/pnlogo.png";

// Zapper.fi
// TODO: Remove this
const TEST_APP_ID = "5f62b485be3591c4dea85667";

const CHILD_INSTANCE_HEIGHT = 4 * GU;

const MENU_ROUTES = [
  {
    icon: ButtonIcon,
    id: "/home",
    label: "Network",
  },
  {
    icon: ButtonIcon,
    id: "/apps",
    label: "My Apps",
  },
];

const DEFAULT_APP_INSTANCE = [
  {
    id: "/create",
    label: "Create",
  },
];

function useActiveRouteName() {
  const { pathname } = useLocation();
  const [activeId, setActiveId] = useState(pathname);

  useEffect(() => {
    const id = pathname;

    setActiveId(id);
  }, [pathname]);

  return {
    activeId,
  };
}

export default function MenuPanel({
  userApps = [
    {
      appName: "Ethers.js 1",
      appId: TEST_APP_ID,
    },
  ],
}) {
  const theme = useTheme();
  const { within } = useViewport();
  const { activeId } = useActiveRouteName();

  const compactMode = within(-1, "medium");

  const instanceGroups = useMemo(() => {
    // Compose
    const groups = [[MENU_ROUTES[0]]];

    groups.push([MENU_ROUTES[1]]);

    if (userApps.length) {
      groups[1].push(
        ...userApps.map(({ appName, appId }) => ({
          label: appName,
          id: `/app/${appId}`,
        }))
      );
    }

    if (!userApps.length) {
      groups[1].push(...DEFAULT_APP_INSTANCE);
    }

    return groups;
  }, [userApps]);

  const renderInstanceGroup = useCallback(
    (group) => {
      const activeIndex = group.findIndex(({ id }) => id === activeId);
      const isActive = activeIndex !== -1;

      return (
        <MenuPanelGroup
          active={isActive}
          activeIndex={activeIndex}
          instances={group}
          key={group[0].id}
        />
      );
    },
    [activeId]
  );

  return (
    !compactMode && (
      <div
        css={`
          min-width: ${17 * GU}px;
          height: 100vh;
          padding: ${2 * GU}px 0;
          background: ${theme.surface};
          border-radius: 0px 20px 20px 0;
          flex-grow: 0;
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
          <img src={PocketLogo} alt="Menu Icon" />
        </ButtonBase>
        <Spacer size={5 * GU} />
        {instanceGroups.map((group) => renderInstanceGroup(group))}
      </div>
    )
  );
}

function MenuPanelGroup({ active, activeIndex, instances }) {
  const { openProgress } = useSpring({
    to: { openProgress: Number(active) },
    config: springs.smooth,
  });
  const history = useHistory();
  const theme = useTheme();

  const [primaryInstance, ...childInstances] = instances;

  const handleInstanceClick = useCallback(() => {
    if (!childInstances.length) {
      history.push({
        pathname: `${primaryInstance.id}`,
      });
      return;
    }

    const [nextInstance] = childInstances;

    history.push({
      pathname: `${nextInstance.id}`,
    });
  }, [childInstances, history, primaryInstance]);

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: ${10 * GU}px;
        background: ${active ? theme.surfacePressed : "transparent"};
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
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
      <MenuPanelButton
        active={activeIndex === 0}
        instance={primaryInstance}
        onClick={handleInstanceClick}
      />
      {childInstances.length ? (
        <animated.ul
          css={`
            overflow: hidden;
            list-style: none;
            width: 100%;
            padding-left: ${6 * GU}px;
          `}
          style={{
            height: openProgress.interpolate(
              (v) =>
                `${(childInstances.length * CHILD_INSTANCE_HEIGHT + 0) * v}px`
            ),
          }}
        >
          {childInstances.map(({ id, label }, index) => (
            <li key={id}>
              <ButtonBase
                onClick={() => history.push({ pathname: `${id}` })}
                css={`
                  display: flex;
                  align-items: center;
                  border-radius: 0px;
                  text-align: left;
                  width: 100%;
                  height: ${4 * GU}px;
                  color: ${activeIndex - 1 === index ? theme.accent : "black"};
                `}
              >
                {label}
              </ButtonBase>
            </li>
          ))}
        </animated.ul>
      ) : (
        ""
      )}
    </div>
  );
}

function MenuPanelButton({ active, instance, onClick, ...props }) {
  const theme = useTheme();

  return (
    <ButtonBase
      css={`
        width: 100%;
        height: ${10 * GU}px;
        padding-top: ${1 * GU}px;
        border-radius: 0px;
        color: ${active ? theme.accent : "black"};
        transition: background 150ms ease-in-out;
      `}
      onClick={onClick}
      {...props}
    >
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
        <img src={instance.icon} alt={`${instance.label} icon`} />
        {instance.label}
      </div>
    </ButtonBase>
  );
}

MenuPanelButton.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  onClcik: PropTypes.func,
};
