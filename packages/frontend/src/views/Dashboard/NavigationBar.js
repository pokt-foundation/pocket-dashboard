import React from "react";
import { useMutation } from "react-query";
import "styled-components/macro";
import { textStyle, GU } from "ui";
import env from "environment";
import axios from "axios";

export default function NavigationBar() {
  const { mutate } = useMutation(async function logout() {
    const path = `${env("BACKEND_URL")}/api/users/logout`;

    try {
      await axios.post(
        path,
        {},
        {
          withCredentials: true,
        }
      );
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
        <li onClick={mutate}>Logout</li>
      </ul>
    </nav>
  );
}
