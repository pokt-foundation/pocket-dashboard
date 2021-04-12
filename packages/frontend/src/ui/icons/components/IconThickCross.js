import React from "react";
import useIconSize from "ui/icons/icon-size";
import IconPropTypes from "ui/icons/IconPropTypes";

function IconThickCross({ size, ...props }) {
  const sizeValue = useIconSize(size);

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.455344 9.05297C1.06246 9.66008 2.04679 9.66008 2.65391 9.05297L4.82234 6.88454L6.9908 9.053C7.59792 9.66012 8.58225 9.66012 9.18936 9.053C9.79648 8.44589 9.79648 7.46156 9.18936 6.85444L7.0209 4.68598L9.05298 2.6539C9.66009 2.04678 9.66009 1.06245 9.05298 0.455336C8.44586 -0.15178 7.46153 -0.151778 6.85441 0.455338L4.82234 2.48742L2.79029 0.45537C2.18318 -0.151746 1.19885 -0.151746 0.59173 0.45537C-0.0153855 1.06249 -0.0153836 2.04682 0.591732 2.65393L2.62378 4.68598L0.455345 6.85441C-0.151771 7.46152 -0.151772 8.44585 0.455344 9.05297Z"
        fill="currentColor"
      />
    </svg>
  );
}

IconThickCross.propTypes = IconPropTypes;
export default IconThickCross;
