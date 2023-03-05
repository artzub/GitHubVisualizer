import { select as d3select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
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

    this._onlyZoom = true;

    this._zoom = d3zoom()
      .scaleExtent([0.5, 1])
      .on('zoom', this._zoomed.bind(this))
      .on('start', (event) => {
        if (this._onlyZoom) {
          return;
        }

        if (event.sourceEvent?.type === 'mousedown') {
          this._lastCursor = this._d3view.style('cursor');
          this._d3view.style('cursor', 'move');
        }
      })
      .on('end', () => {
        if (this._onlyZoom) {
          return;
        }

        this._d3view.style('cursor', this._lastCursor || 'none');
      })
      .filter((event) => {
        if (event.type === 'wheel') {
          return true;
        }

        return event.ctrlKey;
      });

    this._d3view = d3select(this._instance.view).call(this._zoom);

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

  _zoomed(event) {
    const { transform } = event;

    if (!this._onlyZoom) {
      this._group.x = transform.x;
      this._group.y = transform.y;
    }
    this._group.scale.x = transform.k;
    this._group.scale.y = transform.k;
  }

  _resize(width, height) {
    if (this._onlyZoom) {
      this._group.x = width * 0.5;
      this._group.y = height * 0.5;
    } else {
      this._prevTransform = this._prevTransform || zoomIdentity.translate(0, 0);

      const transform = zoomTransform(this._d3view.node())
        .translate(-this._prevTransform.x, -this._prevTransform.y)
        .translate(width * 0.5, height * 0.5);

      this._prevTransform = zoomIdentity.translate(width * 0.5, height * 0.5);

      this._d3view.call(this._zoom.transform, transform);
    }

    this._groupsLegend.x = 25;
    this._groupsLegend.y = height - 120;

    this._grid.resize(width, height);
  }
}

export default Application;
