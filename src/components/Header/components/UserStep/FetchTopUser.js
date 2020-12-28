import { useEffect } from "react";
import slice from '@/redux/modules/profiles';
import { useDispatch } from "react-redux";

const FetchTopUser = () => {
  const dispatch = useDispatch();

  useEffect(
    () => {
      dispatch(slice.actions.fetchTop());
    },
    [dispatch],
  );

  return null;
};

export default FetchTopUser;
