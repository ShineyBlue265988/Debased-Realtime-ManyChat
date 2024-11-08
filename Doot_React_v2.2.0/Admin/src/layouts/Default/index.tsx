import React, { useEffect } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// actions
import { changelayoutMode } from "../../redux/actions";

// components
import SideMenu from "./SideMenu";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

interface IndexProps {
  children: any;
}
const Index = (props: IndexProps) => {
  const dispatch = useDispatch();

  const layoutData = createSelector(
    (state: any) => state.Layout,
    (state: any) => ({
      layoutMode: state.layoutMode,
    })
  );
  // Inside your component
  const { layoutMode } = useSelector(layoutData);

  /*
  call dark/light mode
  */

  useEffect(() => {
    dispatch(changelayoutMode(layoutMode));
  }, [dispatch, layoutMode]);

  const onChangeLayoutMode = (value: any) => {
    if (changelayoutMode) {
      dispatch(changelayoutMode(value));
    }
  };

  return (
    <div className="layout-wrapper d-lg-flex">
      {/* side menu */}
      <SideMenu onChangeLayoutMode={onChangeLayoutMode} />

      {props.children}
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default Index;
