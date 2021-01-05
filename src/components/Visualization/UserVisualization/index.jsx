import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { UrlPratTypes } from '@/models/UrlPartTypes';
import repositoriesSlice from '@/redux/modules/repositories';
import { useRedirectTo } from '@/shared/hooks/useRedirectTo';
import { useSelector } from 'react-redux';
import Tab from '../shared/Tab';
import Application from './application';

const merge = (data, newData) => {
  const hash = data.reduce((acc, item) => ({
    ...acc,
    [item.id]: item,
  }), {});

  return newData.map(({ id, ...rest }) => ({
    id,
    ...hash[id],
    ...rest,
  }));
};

const UserVisualization = (props) => {
  /**
   * @type {React.MutableRefObject<Application>}
   */
  const [container, setContainer] = useState(null);
  const [app, setApp] = useState(null);
  const dataRef = useRef([]);
  const { selected: repo, items } = useSelector(repositoriesSlice.selectors.getState);
  const { name: selected } = repo || {};
  const redirectTo = useRedirectTo(UrlPratTypes.repository);

  const onSelectItem = useRef(null);

  const data = useMemo(
    () => {
      if (!items?.length) {
        dataRef.current = [];
        return dataRef.current;
      }

      dataRef.current = merge(dataRef.current, items);
      return dataRef.current;
    },
    [items],
  );

  useEffect(
    () => {
      onSelectItem.current = (_, item) => {
        redirectTo(item?.name || '');
      };
    },
    [redirectTo],
  );

  useEffect(
    () => {
      if (!container) {
        return;
      }
      const instance = new Application(container);
      instance.key((item) => item.name);
      instance.on('selectItem', (...args) => onSelectItem.current(...args));
      setApp(instance);

      return () => {
        instance.destroy();
        setApp(null);
      };
    },
    [container],
  );

  useEffect(
    () => {
      if (!app) {
        return;
      }

      app.data(data);
    },
    [app, data],
  );

  useEffect(
    () => {
      if (!app) {
        return;
      }

      app.select(selected);
    },
    [app, selected],
  );

  return (
    <Tab {...props} ref={setContainer} />
  );
};

export default memo(UserVisualization);
