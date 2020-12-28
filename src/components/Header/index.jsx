import React, { useState } from 'react';

import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { Collapse, Grid } from "@material-ui/core";
import User from "@/components/Header/User";
import UserSearch from "@/components/Header/UserSearch";
import FetchTopUser from "@/components/Header/FetchTopUser";

const PaperStyled = withStyles(() => ({
  root: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translate(-50%, 0)',
  },
}))(Paper);

const Header = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <PaperStyled square>
      <FetchTopUser />
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        // variant="fullWidth"
        centered
        onChange={handleChange}
      >
        <Tab label="User" />
        <Tab label="Repository" />
        <Tab label="Show" />
      </Tabs>
      <Grid container>
        <User />
        <div>
          Repository
        </div>
        <div>
          Show
        </div>
      </Grid>
      <Collapse in>
        <UserSearch />
      </Collapse>
    </PaperStyled>
  );
};

export default Header;
