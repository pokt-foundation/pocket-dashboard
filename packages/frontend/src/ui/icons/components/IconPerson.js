import React from "react";
import useIconSize from "ui/icons/icon-size";
import IconPropTypes from "ui/icons/IconPropTypes";

function IconPerson({ size, ...props }) {
  const sizeValue = useIconSize(size);

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 10 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.5 3.30005C7.5 4.68076 6.38071 5.80005 5 5.80005C3.61929 5.80005 2.5 4.68076 2.5 3.30005C2.5 1.91934 3.61929 0.800049 5 0.800049C6.38071 0.800049 7.5 1.91934 7.5 3.30005Z"
        stroke="currentColor"
      />
      <path
        d="M9.29995 10.7648C9.29995 11.9664 8.80117 13.5317 7.97545 14.7958C7.13827 16.0775 6.06938 16.9 4.99995 16.9C3.93053 16.9 2.86164 16.0775 2.02445 14.7958C1.19873 13.5317 0.699951 11.9664 0.699951 10.7648C0.699951 8.41289 2.62166 6.5 4.99995 6.5C7.37825 6.5 9.29995 8.41289 9.29995 10.7648Z"
        stroke="currentColor"
      />
    </svg>
  );
}

IconPerson.propTypes = IconPropTypes;
export default IconPerson;
