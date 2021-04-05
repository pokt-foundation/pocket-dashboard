import React from "react";
import { useTheme } from "ui";
import { IconEllipsis } from "../../icons";

const PaginationSeparator = React.memo(function PaginationSeparator() {
  const theme = useTheme();

  return (
    <div
      css={`
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <IconEllipsis
        css={`
          color: ${theme.surfaceContentSecondary.alpha(0.4)};
        `}
      />
    </div>
  );
});

export { PaginationSeparator };
