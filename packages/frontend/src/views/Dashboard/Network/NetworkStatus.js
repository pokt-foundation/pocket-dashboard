import React from "react";
import "styled-components/macro";
import { Spacer, GU } from "ui";
import FloatUp from "components/FloatUp/FloatUp";
import RelayInfo from "views/Dashboard/Network/RelayInfo";
import NetworkInfo from "views/Dashboard/Network/NetworkInfo";

export default function NetworkStatus() {
  return (
    <FloatUp
      loading={false}
      content={() => (
        <>
          <RelayInfo />
          <Spacer size={2 * GU} />
          <NetworkInfo />
        </>
      )}
    />
  );
}
