import * as PIXI from 'pixi.js-legacy';

import { colorScale } from '@/shared/utils';

import BackgroundGrid from '../shared/BackgroundGrid';

import GroupsLegend, { Events as EventsGroupsLegend } from './GroupsLegend';
import Repositories, { Events as EventsRepositories } from './Repositories';

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
PIXI.settings.RESOLUTION = window.devicePixelRatio;

export const Events = {
  ...EventsRepositories,
  ...EventsGroupsLegend,
};

class Application {
  constructor(container) {
    this._instance = new PIXI.Application({
      antialias: true,
      backgroundAlpha: 0,
      resizeTo: container,
    });

    this._instance.renderer.on('resize', this._resize.bind(this));
    this._instance.renderer.plugins.interaction.cursorStyles.default = 'none';

    container.append(this._instance.view);

    this._instance.queueResize();

    this._grid = new BackgroundGrid(70);
    this._grid.alpha = 0.4;
    this._instance.stage.addChild(this._grid);

    this._colorScale = colorScale();

    const colorScaleFn = (...args) => this._colorScale(...args);

    this._group = new Repositories(
      this._instance.renderer.plugins.interaction,
      { colorScale: colorScaleFn },
    );
    this._instance.stage.addChild(this._group);

    this._groupsLegend = new GroupsLegend({ colorScale: colorScaleFn });

    this._groupsLegend.on(
      `${EventsGroupsLegend.overItemLegend}.inside`,
      (_, data) => {
        this._group.hoveredGroup(data.key);
      },
    );
    this._groupsLegend.on(`${EventsGroupsLegend.outItemLegend}.inside`, () => {
      this._group.hoveredGroup();
    });

    this._instance.stage.addChild(this._groupsLegend);
  }

  destroy() {
    this._destroyed = true;
    this._instance.destroy(true, true);
  }

  on(...args) {
    const [eventName] = args;
    const emitter = EventsGroupsLegend[eventName]
      ? this._groupsLegend
      : this._group;

    const value = emitter.on(...args);
    return value === emitter ? this : value;
  }

  data(data) {
    if (this._destroyed) {
      return this;
    }

    this._group.data(data);
    this._groupsLegend.data(data);

    return this;
  }

  radius(getter) {
    if (this._destroyed) {
      return this;
    }

    this._group.radius(getter);

    return this;
  }

  alpha(getter) {
    if (this._destroyed) {
      return this;
    }

    this._group.alpha(getter);

    return this;
  }

  group(getter) {
    if (this._destroyed) {
      return this;
    }

    this._group.group(getter);
    this._groupsLegend.group(getter);

    return this;
  }

  key(getter) {
    if (this._destroyed) {
      return this;
    }

    this._group.key(getter);

    return this;
  }

  select(key) {
    if (this._destroyed) {
      return this;
    }

    this._group.select(key);

    return this;
  }

  _resize(width, height) {
    this._group.resize(width, height);

    this._groupsLegend.x = 25;
    this._groupsLegend.y = height - 120;

    this._grid.resize(width, height);
  }
}

export default Application;
