import React from "react";
import styled from "styled-components";
import { animated, useSpring } from "react-spring";
import "styled-components/macro";
import {
  Button,
  CircleGraph,
  LineChart,
  MultiCircleGraph,
  Split,
  TextCopy,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  textStyle,
  GU,
  RADIUS,
} from "ui";
import FloatUp from "components/FloatUp/FloatUp";

const ENDPOINT_URL =
  "https://aion-32.gateway.pokt.network/v1/60010a10eea5fb002e5bc536";
const APP_ID = "60010a10eea5fb002e5bc536";

const LINES = [{ id: 1, values: [0.1, 0.8, 0.4, 1, 0.5, 0.2] }];
const LABELS = ["", "", "", "", "", ""];

const LINES_2 = [{ id: 1, values: [0.1, 0.8, 0.4, 1] }];

const LABELS_2 = ["4h", "2h", "1h", "30m"];

export default function MyApp() {
  const props = useSpring({ number: 100, from: { number: 0 } });

  return (
    <FloatUp
      content={() => (
        <Split
          primary={
            <>
              <Box
                title="Endpoint"
                css={`
                  padding-bottom: ${4 * GU}px;
                `}
              >
                <TextCopy
                  value={ENDPOINT_URL}
                  css={`
                    width: 100%;
                  `}
                />
              </Box>
              <Spacer />
              <Split
                css={`
                  padding-bottom: 0px;
                `}
                primary={
                  <div
                    css={`
                      width: 100%;
                      min-height: ${48 * GU}px;
                      display: grid;
                      grid-template-columns: 40% 1fr;
                      background: #1b2331;
                      border-radius: ${RADIUS / 2}px;
                    `}
                  >
                    <div
                      css={`
                        grid-column-start: 1;
                        grid-column-end: 2;
                        background: white;
                        border-radius: ${RADIUS / 2}px 0 0 ${RADIUS / 2}px;
                        color: black;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      `}
                    >
                      <animated.span
                        css={`
                          ${textStyle("title1")}
                        `}
                      >
                        {props.number.interpolate((x) => `${x.toFixed(1)}%`)}
                      </animated.span>
                    </div>
                    <div
                      css={`
                        grid-column-start: 2;
                        grid-column-end: 3;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle("title4")}
                          margin-bottom: ${3 * GU}px;
                          padding-left: ${1 * GU}px;
                        `}
                      >
                        Success rate
                      </h3>
                      <LineChart
                        lines={LINES}
                        label={(index) => LABELS[index]}
                        backgroundFill="#1B2331"
                        height={150}
                        color={() => `#ffffff`}
                        borderColor={`rgba(0,0,0,0)`}
                      />
                    </div>
                  </div>
                }
                secondary={
                  <Box
                    title="News"
                    css={`
                      min-height: ${48 * GU}px;
                    `}
                  />
                }
              />
              <Spacer />
              <Box title="Bandwith Usage">
                <div
                  css={`
                    display: flex;
                    align-items: center;
                    span {
                      margin: ${1 * GU}px;
                    }
                  `}
                >
                  <span
                    css={`
                      display: inline-block;
                      background: #ffffff;
                      border-radius: 50%;
                      width: 16px;
                      height: 16px;
                    `}
                  />{" "}
                  245,000
                </div>
                <LineChart
                  lines={LINES_2}
                  label={(index) => LABELS_2[index]}
                  backgroundFill="#1B2331"
                  height={150}
                  color={() => `#ffffff`}
                  width="100%"
                  borderColor={`rgba(0,0,0,0)`}
                />
              </Box>
              <Spacer />
              <Box
                title="Request Breakdown"
                css={`
                  padding-bottom: ${4 * GU}px;
                `}
              >
                <div
                  css={`
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  `}
                >
                  <div>
                    <MultiCircleGraph
                      values={[0.25, 0.5, 0.25, 0.4, 0.3]}
                      size={150}
                    />
                  </div>
                  <Table
                    noSideBorders
                    noTopBorders
                    css={`
                      background: transparent;
                    `}
                    header={
                      <>
                        <TableRow>
                          <TableHeader title="Request type" />
                          <TableHeader title="Amount of data" />
                        </TableRow>
                      </>
                    }
                  >
                    <TableRow>
                      <TableCell>
                        <p>eth_call</p>
                      </TableCell>
                      <TableCell>
                        <p>100kb</p>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <p>eth_call</p>
                      </TableCell>
                      <TableCell>
                        <p>100kb</p>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <p>eth_call</p>
                      </TableCell>
                      <TableCell>
                        <p>100kb</p>
                      </TableCell>
                    </TableRow>
                  </Table>
                </div>
              </Box>
            </>
          }
          secondary={
            <>
              <Box
                css={`
                  min-height: ${26 * GU}px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                `}
              >
                <ul
                  css={`
                    list-style: none;
                    height: 100%;
                    width: 100%;
                    li {
                      display: flex;
                      justify-content: space-between;
                      ${textStyle("body1")}
                    }
                    li:not(:last-child) {
                      margin-bottom: ${6 * GU}px;
                    }
                  `}
                >
                  <li>
                    Status: <span>Staked</span>
                  </li>
                  <li>
                    Amount: <span>2,000,000 POKT</span>
                  </li>
                </ul>
              </Box>
              <Spacer />
              <Button wide>Switch chains</Button>
              <Spacer />
              <Box
                title="Max relays per day"
                css={`
                  padding-bottom: ${4 * GU}px;
                `}
              >
                <CircleGraph
                  color="white"
                  size={30 * GU}
                  strokeWidth={10}
                  value={0.74}
                />
              </Box>
              <Spacer />
              <Box
                css={`
                  padding-bottom: ${4 * GU}px;
                  div:not(:last-child) {
                    margin-bottom: ${2 * GU}px;
                  }
                `}
              >
                <div
                  css={`
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                  `}
                >
                  <h3
                    css={`
                      ${textStyle("body1")};
                      margin-bottom: ${2 * GU}px;
                    `}
                  >
                    Gateway ID
                  </h3>
                  <TextCopy value={APP_ID} />
                </div>
                <div
                  css={`
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                  `}
                >
                  <h3
                    css={`
                      ${textStyle("body1")};
                      margin-bottom: ${2 * GU}px;
                    `}
                  >
                    App Secret
                  </h3>
                  <TextCopy value={APP_ID} />
                </div>
                <div
                  css={`
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                  `}
                >
                  <h3
                    css={`
                      ${textStyle("body1")};
                      margin-bottom: ${2 * GU}px;
                    `}
                  >
                    App public key
                  </h3>
                  <TextCopy value={APP_ID} />
                </div>
              </Box>
            </>
          }
        />
      )}
    />
  );
}

function Box({ children, title, ...props }) {
  return (
    <div
      css={`
        background: #1b2331;
        padding: ${2 * GU}px ${4 * GU}px;
        border-radius: ${RADIUS / 2}px;
      `}
      {...props}
    >
      {title && (
        <h3
          css={`
            ${textStyle("title3")}
            margin-bottom: ${5 * GU}px;
          `}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

const Spacer = styled.span`
  display: block;
  width: 100%;
  height: ${6 * GU}px;
`;
