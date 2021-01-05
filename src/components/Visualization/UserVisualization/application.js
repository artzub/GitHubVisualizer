import * as palettes from '@material-ui/core/colors';
import { extent } from 'd3-array';
import { color as d3color } from 'd3-color';
import { dispatch } from 'd3-dispatch';
import {
 forceSimulation, forceCollide as d3ForceCollide,
 forceManyBody, forceX, forceY,
} from 'd3-force';
import { scaleLinear, scaleLog, scaleOrdinal } from 'd3-scale';
import * as PIXI from 'pixi.js';
import forceCluster from './forceCluster';
import forceCollide from './forceCollide';
import BackgroundGrid from '@/components/Visualization/shared/BackgroundGrid';

const groupDefault = (node) => node.language;
const radiusDefault = (node) => node.stars;
const alphaDefault = (node) => +node.updatedAt;
const keyDefault = (node) => node.id;

const colorIndexes = [100, 200, 300, 500, 600, 700];
const ignoreColors = ['common', 'grey', 'brown'];
const colors = Object.entries(palettes)
  .filter(([key]) => !ignoreColors.includes(key))
  .reduce((acc, [, palette]) => [
    ...acc,
    ...colorIndexes.map((key) => PIXI.utils.string2hex(palette[key])),
  ], [])
  .sort()
  .map((item) => PIXI.utils.hex2string(item))
;

const filterBrightness = new PIXI.filters.ColorMatrixFilter();
filterBrightness.brightness(1.2, true);

const textStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 'lighter',
  align: 'center',
  lineJoin: 'round',

  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 2,
  dropShadowAngle: 0,
  dropShadowDistance: 1,
};

class Application {
  _radiusGetter = radiusDefault;
  _groupGetter = groupDefault;
  _alphaGetter = alphaDefault;
  _keyGetter = keyDefault;

  constructor(container) {
    this._bindMethods();

    const radius = this._radiusOfItem;
    const group = (node) => this._groupGetter(node);

    this._forceCluster = forceCluster()
      .group(group)
      .strength(0.05)
      .radius(radius)
      ;
    this._forceCollide = d3ForceCollide()
      .strength(0.3)
      .radius((node) => radius(node) * 1.15 + 2)
      ;
    this._forceCollide = forceCollide()
      .strength(0.3)
      .radius((node) => radius(node) * 1.15 + 2)
      .group(group)
      .padOutside(50)
      .padInside(0)
      ;

    this._simulation = forceSimulation()
      .velocityDecay(0.05)
      .force('x', forceX(0).strength(0.05))
      .force('y', forceY(0).strength(0.05))
      .force('charge', forceManyBody())
      .force('cluster', this._forceCluster)
      .force('collide', this._forceCollide)
      ;

    this._radius = scaleLinear().range([10, 50]);
    this._alpha = scaleLog().range([0.1, 0.3, 0.7]);
    this._colors = scaleOrdinal(colors);

    this._event = dispatch(
      'itemOver', 'itemOut', 'selectItem',
      'dragStart', 'dragEnd',
    );

    if (process.env.NODE_ENV === 'production') {
      PIXI.utils.skipHello();
    }

    this._instance = new PIXI.Application({
      antialias: true,
      transparent: true,
      resizeTo: container,
    });

    this._instance.renderer.on('resize', this._resize.bind(this));

    container.append(this._instance.view);
    this._instance.queueResize();

    this._grid = new BackgroundGrid(70);
    this._grid.alpha = 0.4;

    this._instance.stage.addChild(this._grid);

    this._group = new PIXI.Container();

    this._instance.stage.addChild(this._group);

    this._simulation.on('tick', this._draw.bind(this));
  }

  destroy() {
    this._destroyed = true;
    this._instance.destroy(true, true);
    this._simulation.stop().nodes([]);
    this._simulation = null;
  }

  on() {
    const value = this._event.on.apply(this._event, arguments);
    return value === this._event ? this : value;
  }

  data(data) {
    if (this._destroyed) {
      return this;
    }

    this._calcRadiusDomain(data);
    this._calcAlphaDomain(data);
    this._simulation
      .nodes(data)
      .alphaTarget(0.3)
      .restart()
    ;
    this._data();

    return this;
  }

  radius(getter) {
    if (this._destroyed) {
      return this;
    }

    this._radiusGetter = getter || radiusDefault;
    this._calcRadiusDomain(this._simulation.nodes());
    this._group.children.forEach(this._updateNodes);

    return this;
  }

  alpha(getter) {
    if (this._destroyed) {
      return this;
    }

    this._alphaGetter = getter || alphaDefault;
    this._calcAlphaDomain(this._simulation.nodes());
    this._group.children.forEach(this._updateNodes);

    return this;
  }

  group(getter) {
    if (this._destroyed) {
      return this;
    }

    this._groupGetter = getter || groupDefault;
    this._colors = scaleOrdinal(colors);
    this._group.children.forEach(this._updateNodes);

    return this;
  }

  key(getter) {
    if (this._destroyed) {
      return this;
    }

    this._keyGetter = getter || keyDefault;
    this._data();
  }

  select(key) {
    if (this._destroyed) {
      return this;
    }

    this._selected = key;
  }

  _bindMethods() {
    this._updateNodes = this._updateNodes.bind(this);

    this._radiusOfItem = this._radiusOfItem.bind(this);
    this._colorOfItem = this._colorOfItem.bind(this);
    this._alphaOfItem = this._alphaOfItem.bind(this);
    this._keyOfItem = this._keyOfItem.bind(this);

    this._onPointerOver = this._onPointerOver.bind(this);
    this._onPointerOut = this._onPointerOut.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  _onPointerOver(event) {
    if (this._dragging) {
      return;
    }

    const node = event.currentTarget;
    this._event.call('itemOver', node, event, node);

    node.cursor = 'pointer';

    if (!node) {
      return;
    }

    const item = node.__data__;
    if (!item) {
      return;
    }

    this._hovered = this._keyOfItem(item);

    item.fx = item.x;
    item.fy = item.y;
  }

  _onPointerOut(event) {
    if (this._dragging) {
      return;
    }

    this._hovered = null;

    const node = event.currentTarget;
    this._event.call('itemOut', node, event, node);

    node.cursor = 'default';

    if (!node) {
      return;
    }

    const item = node.__data__;
    if (!item) {
      return;
    }

    node.children[0].alpha = this._alphaOfItem(item);
    delete item.fx;
    delete item.fy;
  }

  _onPointerDown(event) {
    if (event.data.originalEvent.ctrlKey || event.data.originalEvent.button) {
      return;
    }

    const node = event.currentTarget;
    if (!node) {
      return;
    }
    this._dragNode = node;
    this._dragPrevPoint = event.data.getLocalPosition(node.parent);
    this._dragging = false;

    node.on('pointermove', this._onPointerMove);
    node.on('pointerupoutside', this._onPointerUp);
    node.on('pointerup', this._onPointerUp);
  }

  _onPointerMove(event) {
    const node = this._dragNode;
    const { x, y } = this._dragPrevPoint;
    const { x: nx, y: ny } = event.data.getLocalPosition(this._dragNode.parent);

    if (!this._dragging) {
      this._dragging = Math.hypot(nx - x, ny - y) > 0;

      if (this._dragging) {
        node.cursor = 'grabbing';
        this._event.call('dragStart', node, event, node);
      }
    }

    const item = node.__data__;
    if (!this._dragging || !item) {
      return;
    }

    item.fx = nx;
    item.fy = ny;
  }

  _onPointerUp(event) {
    const node = this._dragNode;
    const item = node?.__data__;
    const key = this._keyOfItem(item || {});

    this._dragNode = null;
    this._dragPrevPoint = null;

    if (!this._dragging) {
      if (this._selected === key) {
        this._selected = null;
        this._event.call('selectItem', node, event, null);
      } else {
        this._selected = key;
        this._event.call('selectItem', node, event, item);
      }
    } else {
      this._event.call('dragEnd', node, event, node);

      if (item) {
        delete item.fx;
        delete item.fy;
      }
    }

    this._dragging = false;

    if (!node) {
      return;
    }

    node.off('pointermove', this._onPointerMove);
    node.off('pointerupoutside', this._onPointerUp);
    node.off('pointerup', this._onPointerUp);
  }

  _data() {
    if (this._destroyed) {
      return;
    }

    const data = this._simulation.nodes();

    const hash = this._group.children.reduce((acc, item) => ({
      ...acc,
      [item.name]: item,
    }), {});

    const result = [];

    data.forEach((item) => {
      const id = item.id;
      const node = hash[id];
      if (!node) {
        result.push([null, item]);
      } else {
        result.push([node, item]);
        delete hash[id];
      }
    });

    Object.values(hash).forEach((node) => {
      this._group.removeChild(node);
    });

    result.forEach(([_, item]) => {
      if (this._destroyed) {
        return;
      }

      let node = _;
      if (!node) {
        node = new PIXI.Container();
        node.name = item.id;

        node.interactive = true;
        node.on('pointerover', this._onPointerOver);
        node.on('pointerout', this._onPointerOut);
        node.on('pointerdown', this._onPointerDown);

        this._group.addChild(node);
      }
      node.__data__ = item;

      this._updateNodes(node);
    });
  }

  _updateNodes(node) {
    const item = node.__data__;

    if (!item) {
      return;
    }

    const color = d3color(this._colorOfItem(item));
    const radius = +this._radiusOfItem(item);
    const alpha = +this._alphaOfItem(item);

    let [circle, border] = node.children;
    if (!circle) {
      circle = new PIXI.Graphics();
      node.addChild(circle);
    } else {
      circle.clear();
    }

    if (!border) {
      border = new PIXI.Graphics();
      node.addChild(border);
    } else {
      border.clear();
    }

    border.lineStyle(1, PIXI.utils.string2hex(color.darker(0.1).formatHex()), 0.5);
    border.drawCircle(0, 0, radius);
    border.endFill();

    circle.beginFill(PIXI.utils.string2hex(color.formatHex()), 1);
    circle.drawCircle(0, 0, radius);
    circle.endFill();
    circle.alpha = alpha;

    let [, , text] = node.children;
    if (!text) {
      text = new PIXI.Text(item.name, {
        ...textStyle,
        fill: PIXI.utils.string2hex(color.brighter(2).formatHex()),
      });
      // text.roundPixels = true;
      text.anchor.set(0.5);
      node.addChild(text);
    }
    text.visible = text.width < radius * 4.2;
  }

  _calcRadiusDomain(data) {
    const bounds = extent(data, this._radiusGetter);
    this._radius.domain(bounds);
  }

  _calcAlphaDomain(data) {
    const bounds = extent(data, this._alphaGetter);
    this._alpha.domain(bounds);
  }

  _radiusOfItem(node) {
    return this._radius(this._radiusGetter(node));
  }

  _colorOfItem(node) {
    return this._colors(this._groupGetter(node));
  }

  _alphaOfItem(node) {
    return this._alpha(this._alphaGetter(node));
  }

  _keyOfItem(node) {
    return this._keyGetter(node);
  }

  _resize(width, height) {
    this._group.x = width * 0.5;
    this._group.y = height * 0.5;

    this._grid.resize(width, height);
  }

  _draw() {
    if (this._destroyed) {
      return this;
    }

    this._group.children.forEach((node) => {
      const item = node.__data__;
      if (!item) {
        return;
      }

      const key = this._keyOfItem(item);

      if (key === this._hovered || key === this._selected) {
        node.filters = [filterBrightness];
        node.children[0].alpha = key === this._hovered ? 0.8 : 0.9;
      } else if(node.filters) {
        node.filters = null;
        node.children[0].alpha = this._alphaOfItem(item);
      }

      node.x = item.x;
      node.y = item.y;
    });
  }
}

export default Application;
