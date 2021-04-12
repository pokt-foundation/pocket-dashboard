import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { animated, useSpring } from "react-spring";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { ButtonBase, Spacer, useTheme, springs, GU, RADIUS } from "ui";
import IconApp from "components/MenuPanel/IconApp";
import IconNetwork from "components/MenuPanel/IconNetwork";
import PocketLogo from "assets/pnlogo.png";

const CHILD_INSTANCE_HEIGHT = 4 * GU;

const MENU_ROUTES = [
  {
    icon: IconNetwork,
    id: "/home",
    label: "Network",
  },
  {
    icon: IconApp,
    id: "/apps",
    label: "My Apps",
  },
];

const CREATE_APP_ROUTE = [
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

export default function MenuPanel({ appsLoading = true, userApps = [] }) {
  const theme = useTheme();
  const { within } = useViewport();
  const { activeId } = useActiveRouteName();

  const compactMode = within(-1, "medium");

  const instanceGroups = useMemo(() => {
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
      groups[1].push(...CREATE_APP_ROUTE);
    }

    return groups;
  }, [userApps]);

  const renderInstanceGroup = useCallback(
    (group) => {
      const activeIndex = group.findIndex(({ id }) => activeId.includes(id));
      const isActive = activeIndex !== -1;

      return (
        <MenuPanelGroup
          active={isActive}
          activeIndex={activeIndex}
          appsLoading={appsLoading}
          instances={group}
          key={group[0].id}
        />
      );
    },
    [activeId, appsLoading]
  );

  return (
    !compactMode && (
      <div
        css={`
          min-width: ${17 * GU}px;
          height: 100vh;
          padding: ${2 * GU}px 0;
          background: ${theme.backgroundInverted};
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

function MenuPanelGroup({ active, activeIndex, appsLoading, instances }) {
  const { openProgress } = useSpring({
    from: { openProgress: Number(appsLoading) },
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
        background: ${active ? theme.surfacePressedInverted : "transparent"};
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
          width: ${GU / 2}px;
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
        active={active}
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

  const InstanceIcon = instance.icon;

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
        <InstanceIcon color={active ? theme.accent : "black"} />
        <Spacer size={1 * GU} />
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
