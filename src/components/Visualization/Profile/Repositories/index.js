// TODO use it after migration to pixi.js v7
// import { OutlineFilter } from '@pixi/filter-outline';
import { extent } from 'd3-array';
import { color as d3color } from 'd3-color';
import { dispatch } from 'd3-dispatch';
import {
  forceCollide as d3ForceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import { scaleLinear, scaleLog } from 'd3-scale';
import { select as d3select } from 'd3-selection';
import * as PIXI from 'pixi.js-legacy';

import { cursor } from '@/services/CursorFocusService';
import { OutlineFilter } from '@/shared/graphics/filtres';
import {
  colorConvert,
  colorScale,
  discolor,
  filledCircleTexture,
  hasTransition,
} from '@/shared/utils';

import forceCluster from './forceCluster';
import forceCollide from './forceCollide';

const getX = (d) => d.x ?? 0;
const getY = (d) => d.y ?? 0;

const groupDefault = (node) => node.language;
const radiusDefault = (node) => node.stars;
const alphaDefault = (node) => +node.updatedAt;
const keyDefault = (node) => node.id;
const textDefault = (node) => node.name;

const textStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 24,
  // fontWeight: 'lighter',
  align: 'center',
  lineJoin: 'round',

  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 1,
  dropShadowAngle: 0,
  dropShadowDistance: 1,
};

export const Events = {
  overItem: 'overItem',
  outItem: 'outItem',
  selectItem: 'selectItem',
  dragStart: 'dragStart',
  drag: 'drag',
  dragEnd: 'dragEnd',
};

const bleach = (color, rate) => {
  return discolor(color, 0.05, rate);
};

const removeNodeFactory = (container) => function () {
  if (this.graphic) {
    const parent = this.graphic.parent || container;
    parent.removeChild(this.graphic);
    this.graphic = null;
  }
};

const addNodeFactory = (container) => function () {
  const graphic = new PIXI.Container();

  const circleNode = new PIXI.Sprite(filledCircleTexture('#fff', 128));
  circleNode.anchor.set(0.5);

  const boundsNode = new PIXI.Sprite(filledCircleTexture('#fff', 128));
  boundsNode.anchor.set(0.5);
  boundsNode.filters = [
    new OutlineFilter(2, colorConvert('#fff'), 1, 0.5, true),
  ];

  const textNode = new PIXI.Text('', {
    ...textStyle,
    fill: '#fff',
  });
  textNode.scale.set(0.5);
  textNode.anchor.set(0.5);

  graphic.addChild(circleNode);
  graphic.addChild(boundsNode);
  graphic.addChild(textNode);

  graphic.alpha = 0;

  graphic.interactive = true;
  graphic.on('pointerover', container._onPointerOver(this));
  graphic.on('pointerout', container._onPointerOut(this));
  graphic.on('pointerdown', container._onDragStart);

  this.graphic = graphic;

  container.addChild(graphic);
};

const updateNodePosition = function () {
  const { graphic } = this;

  if (!graphic?.visible) {
    return;
  }

  const attrs = this.attributes;

  const x = +attrs.x?.value ?? 0;
  const y = +attrs.y?.value ?? 0;

  graphic.x = x;
  graphic.y = y;
};

const updateNodeGraphic = function () {
  const { graphic } = this;

  const attrs = this.attributes;

  const radius = Math.max(+attrs.radius?.value ?? 0, 0);
  const diameter = radius * 2;
  const color = attrs.color?.value ?? '#000';
  const fill = attrs.fill?.value ?? '#fff';
  const stroke = attrs.stroke?.value ?? '#000';
  const text = attrs.text?.value ?? '';
  const backgroundAlpha = +attrs.backgroundAlpha?.value ?? 1;
  const opacity = +attrs.opacity?.value ?? 1;

  const hovered = +attrs.hovered?.value ?? 0;
  const selected = +attrs.selected?.value ?? 0;
  const colorless = +attrs.colorless?.value ?? 0;

  if (graphic && graphic.alpha !== opacity) {
    graphic.alpha = opacity;
    graphic.visible = opacity > 0;
  }

  if (!graphic?.visible) {
    return;
  }

  const [circleNode, boundsNode, textNode] = graphic.children;
  const [filter] = boundsNode.filters;

  const bgAlpha = Math.max(backgroundAlpha, selected * 0.8, hovered * 0.9);

  if (circleNode.alpha !== bgAlpha) {
    circleNode.alpha = bgAlpha;
  }

  let tint = d3color(fill);

  const rate = Math.max(hovered, selected) * 0.5;
  if (rate > 0) {
    tint = tint.brighter(rate);
  }

  tint = colorConvert(bleach(tint, colorless));
  if (tint !== circleNode.tint) {
    circleNode.tint = tint;
  }

  if (boundsNode.width !== diameter - 4) {
    boundsNode.width = diameter - 4;
    boundsNode.height = diameter - 4;
  }

  tint = colorConvert(bleach(stroke, colorless));
  if (boundsNode.tint !== tint) {
    boundsNode.tint = tint;
    filter.color = tint;
  }

  let hasChanged = false;
  if (circleNode.width !== diameter) {
    circleNode.width = diameter;
    circleNode.height = diameter;
    hasChanged = true;
  }

  if (textNode.text !== text) {
    textNode.text = text;
    textNode.updateText();
    hasChanged = true;
  }

  tint = colorConvert(bleach(color, colorless));
  if (tint !== textNode.tint) {
    textNode.tint = tint;
  }

  if (hasChanged) {
    textNode.visible = textNode.width < radius * 4.2;
  }

  updateNodePosition.call(this);
};

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

class Repositories extends PIXI.Container {
  _radiusGetter = radiusDefault;

  _groupGetter = groupDefault;

  _alphaGetter = alphaDefault;

  _keyGetter = keyDefault;

  _textGetter = textDefault;

  constructor(interaction, options = {}) {
    super();

    this.interactive = true;

    this._interaction = interaction;

    this._bindMethods();

    this._shadow = d3select(document.createElement('shadow'));

    const radius = this._radiusOfItem;
    const group = (node) => this._groupGetter(node);

    this._forceCluster = forceCluster()
      .group(group)
      .strength(0.05)
      .radius(radius);

    this._forceCollide = d3ForceCollide()
      .strength(0.3)
      .radius((node) => radius(node) * 1.15 + 2);

    this._forceCollide = forceCollide()
      .strength(0.3)
      .radius((node) => radius(node) * 1.15 + 2)
      .group(group)
      .padOutside(50)
      .padInside(0);

    this._simulation = forceSimulation()
      .velocityDecay(0.05)
      .alphaTarget(0.1)
      .force('x', forceX(0).strength(0.05))
      .force('y', forceY(0).strength(0.05))
      .force('charge', forceManyBody())
      .force('cluster', this._forceCluster)
      .force('collide', this._forceCollide);

    this._simulation.nodes([]);

    this._radius = scaleLinear().range([10, 50]);
    this._alpha = scaleLog().range([0.1, 0.3, 0.7]);
    this._colors = options.colorScale || colorScale();

    this._event = dispatch(...Object.values(Events));

    this._simulation.on('tick', this._tick.bind(this));

    const draw = () => {
      this._neededRendering = this._neededRendering ?? true;

      if (this._neededRendering || hasTransition(this._shadowNodes)) {
        this._shadowNodes?.each(updateNodeGraphic);
      }

      this._neededRendering = false;
    };

    const drawLoop = async () => {
      if (this.destroyed) {
        return;
      }

      this._drawTimer = requestAnimationFrame(drawLoop);

      await delay(10);

      draw();
    };

    this._drawTimer = requestAnimationFrame(drawLoop);
  }

  destroy(...args) {
    if (this._stopEarlyTimer) {
      clearTimeout(this._stopEarlyTimer);
    }

    if (this._drawTimer) {
      cancelAnimationFrame(this._drawTimer);
    }

    super.destroy(...args);
    this._simulation.stop().nodes([]);
    this._simulation = null;
  }

  on(...args) {
    const value = this._event.on(...args);
    return value === this._event ? this : value;
  }

  data(data) {
    if (this.destroyed) {
      return this;
    }

    this._calcRadiusDomain(data);
    this._calcAlphaDomain(data);

    const nodes = this._simulation.nodes();
    nodes.length = 0;
    nodes.push(...data);
    this._simulation.nodes(data);

    this._restartSimulation();

    return this.updateLayout();
  }

  updateLayout() {
    const data = this._simulation.nodes();

    const nodes = this._shadow.selectAll('.node').data(data, this._keyOfItem);

    const nodesEnter = nodes
      .enter()
      .append('shadow')
      .attr('class', 'node')
      .attr('id', this._keyOfItem)
      .attr('backgroundAlpha', 1)
      .attr('opacity', 1)
      .attr('hovered', 0)
      .attr('selected', 0)
      .attr('colorless', 0)
      .attr('radius', 0)
      .each(this._addNode);

    this._shadowNodes = nodesEnter
      .merge(nodes)
      .attr('text', this._textOfItem)
      .attr('x', getX)
      .attr('y', getY)
      .attr('radius', this._radiusOfItem);

    this._shadowNodes
      .transition()
      .duration(500)
      .attr('color', this._textColorOfItem)
      .attr('stroke', this._borderColorOfItem)
      .attr('fill', this._colorOfItem)
      .attr('backgroundAlpha', this._alphaOfItem)
      .attr('hovered', this._hoveredOfItem)
      .attr('selected', this._selectedOfItem)
      .attr('colorless', this._colorlessOfItem);

    nodes
      .exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .each(this._removeNode)
      .remove();

    this.forceRendering();

    return this;
  }

  forceRendering() {
    this._neededRendering = true;
  }

  radius(getter) {
    if (this.destroyed) {
      return this;
    }

    this._radiusGetter = getter || radiusDefault;
    this._calcRadiusDomain(this._simulation.nodes());
    this.updateLayout();
    this._restartSimulation();

    return this;
  }

  text(getter) {
    if (this.destroyed) {
      return this;
    }

    this._textGetter = getter || textDefault;
    this.updateLayout();

    return this;
  }

  alpha(getter) {
    if (this.destroyed) {
      return this;
    }

    this._alphaGetter = getter || alphaDefault;
    this._calcAlphaDomain(this._simulation.nodes());
    this.updateLayout();

    return this;
  }

  group(getter) {
    if (this.destroyed) {
      return this;
    }

    this._groupGetter = getter || groupDefault;
    this._restartSimulation();

    return this;
  }

  colorScale(scale) {
    if (this.destroyed) {
      return this;
    }

    this._colors = scale || colorScale();
    this.updateLayout();

    return this;
  }

  key(getter) {
    if (this.destroyed) {
      return this;
    }

    this._keyGetter = getter || keyDefault;
    this.updateLayout();

    return this;
  }

  select(key) {
    if (this.destroyed) {
      return this;
    }

    this._selected = key;

    return this;
  }

  hoveredGroup(group) {
    if (this.destroyed) {
      return this;
    }

    this._hoveredGroup = group;

    return this;
  }

  _bindMethods() {
    this._addNode = addNodeFactory(this);
    this._removeNode = removeNodeFactory(this);

    this._radiusOfItem = this._radiusOfItem.bind(this);
    this._colorOfItem = this._colorOfItem.bind(this);
    this._borderColorOfItem = (node) => d3color(this._colorOfItem(node)).darker(0.1);
    this._textColorOfItem = (node) => d3color(this._colorOfItem(node)).brighter(1.1);
    this._alphaOfItem = this._alphaOfItem.bind(this);
    this._keyOfItem = this._keyOfItem.bind(this);
    this._textOfItem = this._textOfItem.bind(this);
    this._selectedOfItem = (node) => +(this._keyOfItem(node) === this._selected);
    this._colorlessOfItem = (node) => {
      const group = this._groupGetter(node);

      const isColorless = this._hoveredGroup != null && group !== this._hoveredGroup;

      return +isColorless;
    };
    this._hoveredOfItem = (node) => {
      if (this._hoveredGroup != null) {
        return (1 - this._colorlessOfItem(node)) * 0.5;
      }

      return +(this._keyOfItem(node) === this._keyOfHovered());
    };

    this._onPointerOver = this._onPointerOver.bind(this);
    this._onPointerOut = this._onPointerOut.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
  }

  _emit(eventName, target, event, data) {
    this._event.call(eventName, target, event, data);
  }

  _onPointerOver(node) {
    return (event) => {
      if (this._dragging) {
        return;
      }

      const data = d3select(node).datum();

      event.stopPropagation();

      this._restartSimulation();

      const graphic = event.currentTarget;
      this._emit(Events.overItem, graphic, event, data);

      this.cursor = 'pointer';

      if (!node) {
        return;
      }

      this._hovered = node;
      cursor.focusOn(graphic);

      if (!data) {
        return;
      }

      data.fx = data.x;
      data.fy = data.y;
    };
  }

  _onPointerOut(node) {
    return (event) => {
      if (this._dragging) {
        return;
      }

      if (this._hovered !== node) {
        return;
      }

      const data = d3select(node).datum();

      event.stopPropagation();

      this._hovered = null;
      cursor.focusOn(null);

      this._restartSimulation();

      const graphic = event.currentTarget;
      this._emit(Events.outItem, graphic, event, data);

      this.cursor = 'none';

      if (!graphic) {
        return;
      }

      if (!data) {
        return;
      }

      delete data.fx;
      delete data.fy;
    };
  }

  _onDragStart(event) {
    event.stopPropagation();
    if (event?.target !== this._hovered?.graphic) {
      return;
    }

    const node = this._hovered;

    this._clicked = node;

    node.startPoint = event.data.getLocalPosition(this);

    cursor.press();

    const data = d3select(node).datum();
    const { graphic } = node;

    this.cursor = 'grabbing';

    d3select(document.body).style('user-select', 'none');

    this._emit(Events.dragStart, graphic, event, data);

    this.parent.interactiveChildren = false;

    this._interaction
      .on('pointermove', this._onDrag)
      .on('pointerupoutside', this._onDragEnd)
      .on('pointerup', this._onDragEnd);
  }

  _onDrag(event) {
    event.stopPropagation();
    if (!this._clicked) {
      return;
    }

    const node = this._clicked;

    const { x, y } = node.startPoint;
    const point = event.data.getLocalPosition(this);

    this._dragging = this._dragging || Math.hypot(point.x - x, point.y - y) > 0;

    if (!this._dragging) {
      return;
    }

    const data = d3select(node).datum();

    event.currentTarget = node.graphic;

    cursor.onPointerMove(event);

    data.fx = point.x;
    data.fy = point.y;

    data.x = point.x;
    data.y = point.y;

    this._emit(Events.drag, node.graphic, event, data);
  }

  _onDragEnd(event) {
    event.stopPropagation();
    if (!this._clicked) {
      return;
    }

    const node = this._clicked;
    this._clicked = null;

    const prevDragging = this._dragging;
    this._dragging = false;

    const data = d3select(node).datum();

    cursor.release();

    this.cursor = 'pointer';

    this.parent.interactiveChildren = true;

    this._interaction
      .off('pointermove', this._onDrag)
      .off('pointerupoutside', this._onDragEnd)
      .off('pointerup', this._onDragEnd);

    d3select(document.body).style('user-select', null);

    this._event.call(Events.dragEnd, node.graphic, event, data);

    if (!prevDragging) {
      const key = this._keyOfItem(data);

      if (this._selected === key) {
        this._selected = null;
      } else {
        this._selected = key;
      }

      this._event.call(
        Events.selectItem,
        node.graphic,
        event,
        this._selected ? data : null,
      );
      return;
    }

    if (event.type === 'pointerupoutside') {
      this._onPointerOut(node)(event);
    }
  }

  _calcRadiusDomain(data) {
    const bounds = extent(data, this._radiusGetter);
    this._radius.domain(bounds);
  }

  _calcAlphaDomain(data) {
    const bounds = extent(data, this._alphaGetter);
    this._alpha.domain(bounds);
  }

  _keyOfHovered() {
    return this._keyOfItem(d3select(this._hovered || {}).datum() || {});
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

  _textOfItem(node) {
    return this._textGetter(node);
  }

  _updateFocused() {
    this._shadowNodes
      ?.transition('focus')
      .duration(200)
      .attr('hovered', this._hoveredOfItem)
      .attr('selected', this._selectedOfItem)
      .attr('colorless', this._colorlessOfItem);
  }

  _updateColorless() {
    this._shadowNodes
      ?.transition('colorless')
      .duration(200)
      .attr('hovered', this._hoveredOfItem)
      .attr('colorless', this._colorlessOfItem);
  }

  get _selected() {
    return this.__selected;
  }

  set _selected(value) {
    this.__selected = value;
    this._updateFocused();
  }

  get _hovered() {
    return this.__hovered;
  }

  set _hovered(value) {
    this.__hovered = value;
    this._updateFocused();
  }

  get _hoveredGroup() {
    return this.__hoveredGroup;
  }

  set _hoveredGroup(value) {
    this.__hoveredGroup = value ?? null;
    this._updateColorless();
  }

  _restartSimulation() {
    this._simulation.alpha(0.5).restart();
    this._stopEarly(5e3);
  }

  _stopEarly(ms) {
    if (ms == null) {
      return;
    }

    if (this._stopEarlyTimer) {
      clearTimeout(this._stopEarlyTimer);
    }

    this._stopEarlyTimer = setTimeout(() => {
      this._stopEarlyTimer = null;
      this._simulation.alpha(this._simulation.alphaTarget());
    }, ms);
  }

  _tick() {
    if (this.destroyed) {
      return this;
    }

    const alpha = this._simulation.alpha();
    const alphaTarget = this._simulation.alphaTarget();
    if (!this._hovered && +alpha.toFixed(4) <= alphaTarget) {
      this._simulation.stop();
    }

    this._shadowNodes?.attr('x', getX).attr('y', getY);
    this.forceRendering();

    return this;
  }
}

export default Repositories;
