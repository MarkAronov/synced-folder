import React, { useState, useRef } from "react";

import { IconButton, styled } from "@mui/material";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import { useInfo } from "../../context/useInfo";

/**
 * The RemoveFolderIcon component
 * @return {JSX.Element} returns a RemoveFolderIcon component
 */
const RemoveFolderIcon = () => {
  const info = useInfo();

  return (
    <>
      <IconButton size="large">
        <FolderDeleteIcon />
      </IconButton>
    </>
  );
};

export default RemoveFolderIcon;
