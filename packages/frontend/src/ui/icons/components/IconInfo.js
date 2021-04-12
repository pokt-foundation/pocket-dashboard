import React from "react";
import useIconSize from "ui/icons/icon-size";
import IconPropTypes from "ui/icons/IconPropTypes";

function IconInfo({ size, ...props }) {
  const sizeValue = useIconSize(size);

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 4 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 1.47581C0 0.491935 0.513725 0 1.54118 0C2.56863 0 3.08235 0.491935 3.08235 1.47581C3.08235 1.94463 2.95237 2.3111 2.69242 2.57523C2.43865 2.83275 2.0549 2.96151 1.54118 2.96151C0.513725 2.96151 0 2.46628 0 1.47581ZM2.95237 13.9959C2.95237 14.7779 2.31848 15.4118 1.53653 15.4118C0.754588 15.4118 0.120695 14.7779 0.120695 13.9959V5.75411C0.120695 4.97217 0.754588 4.33827 1.53653 4.33827C2.31848 4.33827 2.95237 4.97217 2.95237 5.75411V13.9959Z"
        fill="currentColor"
      />
    </svg>
  );
}

IconInfo.propTypes = IconPropTypes;
export default IconInfo;
