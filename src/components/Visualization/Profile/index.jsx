import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import useSound from 'use-sound';

import { SoundTypes } from '@/models/SoundTypes';
import { UrlPratTypes } from '@/models/UrlPartTypes';

import repositoriesSlice from '@/redux/modules/repositories';

import { useRedirectTo } from '@/shared/hooks/useRedirectTo';

import Tab from '../shared/Tab';
import Application from './Application';

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
  const [app, setApp] = useState(null);
  const [container, setContainer] = useState(null);
  const dataRef = useRef([]);
  const { selected: repo, items } = useSelector(repositoriesSlice.selectors.getState);
  const { name: selected } = repo || {};
  const redirectTo = useRedirectTo(UrlPratTypes.repository);

  const [clickSoundPlay, { stop: clickSoundStop }] = useSound(SoundTypes.click, { volume: 0.25 });
  const [hoverSoundPlay, { stop: hoverSoundStop }] = useSound(SoundTypes.hover, { volume: 0.25 });

  const onSelectItem = useRef(null);
  const onOverItem = useRef(null);
  const onOutItem = useRef(null);

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
        clickSoundPlay();
        redirectTo(item?.name || '');
      };
    },
    [clickSoundPlay, redirectTo],
  );

  useEffect(
    () => {
      onOverItem.current = () => {
        clickSoundStop();
        hoverSoundPlay();
      };
    },
    [hoverSoundPlay, clickSoundStop],
  );

  useEffect(
    () => {
      onOutItem.current = () => {
        hoverSoundStop();
      };
    },
    [hoverSoundStop],
  );

  useEffect(
    () => {
      if (!container) {
        return;
      }
      const instance = new Application(container);
      instance.key((item) => item.name);
      instance.on('selectItem', (...args) => onSelectItem.current(...args));
      instance.on('overItem', (...args) => onOverItem.current(...args));
      instance.on('outItem', (...args) => onOutItem.current(...args));
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
