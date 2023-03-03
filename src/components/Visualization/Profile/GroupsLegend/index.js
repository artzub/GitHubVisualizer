import { color, hsl as hslColor } from 'd3-color';
import { dispatch } from 'd3-dispatch';
import { scaleSqrt } from 'd3-scale';
import { select as d3select } from 'd3-selection';
import * as PIXI from 'pixi.js-legacy';

import { cursor } from '@/services/CursorFocusService';
import { colorConvert, colorScale, hasTransition, roundedRectangularTexture } from '@/shared/utils';

const textStyle = {
  fontSize: '2.4em',
  fontFamily: "'JetBrains Mono',monospace",
  lineJoin: 'round',
};

export const Events = {
  overItemLegend: 'overItemLegend',
  outItemLegend: 'outItemLegend',
};

const groupDefault = (node) => node.language;

const getKey = (d) => d.key ?? '';
const getValue = (d) => d.value ?? 0;
const getPosition = (_, i) => i;

const sortByKey = (a, b) => {
  const la = getKey(a).toLowerCase();
  const lb = getKey(b).toLowerCase();
  return la.localeCompare(lb);
};

const MAX_HEIGHT = 100;

const updateBoundNode = (node, textHeight) => {
  node.height = MAX_HEIGHT + 6 + textHeight;
  node.y = -(2 + textHeight);
};

const updateNodeGraphic = function () {
  const { graphic } = this;

  const attrs = this.attributes;

  const position = attrs.position?.value ?? 0;
  const text = attrs.text?.value ?? '';
  const value = attrs.value?.value ?? 0;
  const height = attrs.height?.value ?? 0;
  const barColor = attrs.barColor?.value || '#fff';
  const nameColor = attrs.nameColor?.value || '#fff';
  const valueColor = attrs.valueColor?.value || '#fff';
  const opacity = attrs.opacity?.value ?? 1;
  const hovered = +attrs.hovered?.value ?? 0;

  if (graphic.alpha !== opacity) {
    graphic.alpha = opacity;
    graphic.visible = opacity > 0;
  }

  if (!graphic.visible) {
    return;
  }

  const [boundNode, nameNode, barNode, countNode] = graphic.children;

  boundNode.alpha = hovered * 0.1;

  if (nameNode.text !== text) {
    nameNode.text = text;
    nameNode.updateText();

    updateBoundNode(boundNode, nameNode.width);
  }

  let tint = colorConvert(nameColor);
  if (tint !== nameNode.tint) {
    nameNode.tint = tint;
  }

  tint = colorConvert(barColor);
  if (tint !== barNode.tint) {
    barNode.tint = tint;
  }

  let hasChanges = false;
  if (barNode.height !== height) {
    barNode.height = height;
    hasChanges = true;
  }

  if (countNode.text !== value) {
    countNode.text = value;
    countNode.updateText();
    hasChanges = true;
  }

  const isCountBigger = countNode.width + 2 >= barNode.height;

  if (hasChanges) {
    countNode.y = barNode.height;
    if (isCountBigger) {
      countNode.y = barNode.height + 6 + countNode.width;
    }
  }

  tint = isCountBigger ? colorConvert(barColor) : colorConvert(valueColor);
  if (tint !== countNode.tint) {
    countNode.tint = tint;
  }

  graphic.x = position * nameNode.height * 1.5;
};

class GroupsLegend extends PIXI.Container {
  _groupGetter = groupDefault;

  constructor(options = {}) {
    super();

    this._colors = options.colorScale || colorScale();

    this._shadow = d3select(document.createElement('shadow'));

    const nodesGroup = new PIXI.Container();
    this._nodesGroup = nodesGroup;
    this.addChild(nodesGroup);

    this._addNode = this._addNodeFactory();

    this._scale = scaleSqrt().range([5, MAX_HEIGHT]);

    const colorOrColorless = (node, expectedColor) => {
      if (!this._hovered || this._hovered === node) {
        return expectedColor;
      }

      const hsl = hslColor(color(expectedColor));
      hsl.s = 0.05;
      return hsl;
    };

    this._getBarHeight = (node) => this._scale(+getValue(node));
    this._getBarColor = (node) => colorOrColorless(node, this._colors(getKey(node)));
    this._getNameColor = (node) => colorOrColorless(node, this._colors(getKey(node)));
    this._getValueColor = (node) => colorOrColorless(node, color(this._colors(getKey(node))).darker(2.5));
    this._getIsHovered = (node) => +(this._hovered === node);

    this._removeGraphic = function () {
      if (this.graphic) {
        const parent = this.graphic.parent || nodesGroup;
        parent.removeChild(this.graphic);
        this.graphic = null;
      }
    };

    this._event = dispatch(...Object.values(Events));

    this.data();
  }

  destroy(...args) {
    super.destroy(...args);
    this._destroyed = true;
  }

  on() {
    const value = this._event.on.apply(this._event, arguments);
    return value === this._event ? this : value;
  }

  colorScale(scale) {
    this._colors = scale;
    return this;
  }

  group(getter) {
    if (this._destroyed) {
      return this;
    }

    this._groupGetter = getter || groupDefault;
    this.updateGroups();
  }

  data(data) {
    this._rawData = (data || []);

    return this.updateGroups();
  }

  resize(width, height) {
  }

  updateGroups() {
    let maxValue = 0;
    const data = this._rawData.reduce((acc, item) => {
      const key = item.language;
      const row = acc[key] || {
        key,
        value: 0,
      };
      row.value += 1;

      maxValue = Math.max(maxValue, row.value);

      acc[key] = row;

      return acc;
    }, {});
    this._groupData = Object.values(data).sort(sortByKey);
    this._scale.domain([Math.min(1, maxValue - 1), maxValue]);

    return this.updateLayout();
  }

  updateLayout() {
    const nodes = this._shadow
      .selectAll('.node')
      .data(this._groupData, getKey)
    ;

    const nodesEnter = nodes.enter()
      .append('shadow')
      .attr('class', 'node')
      .attr('id', getKey)
      .attr('opacity', 0)
      .attr('hovered', 0)
      .each(this._addNode)
    ;

    this._shadowNodes = nodes.merge(nodesEnter)
      .attr('value', getValue)
      .attr('text', getKey)
      .each(updateNodeGraphic)
    ;

    this._shadowNodes
      .transition()
      .duration(500)
      .attr('position', getPosition)
      .attr('height', this._getBarHeight)
      .attr('barColor', this._getBarColor)
      .attr('nameColor', this._getNameColor)
      .attr('valueColor', this._getValueColor)
      .attr('opacity', 1)
    ;

    nodes.exit()
      .each(this._removeGraphic)
      .remove();

    this.forceRendering();

    return this;
  }

  forceRendering() {
    this._neededRendering = true;
  }

  _emit(eventName, event, target, node) {
    this._event.call(eventName, target, event, node);
  }

  _addNodeFactory() {
    const that = this;

    return function (node) {
      const graphic = new PIXI.Container();
      graphic.name = getKey(node);
      graphic.interactive = true;
      graphic.on('pointerover', (event) => {
        graphic.cursor = 'help';
        cursor.focusOn(graphic);
        const data = this.__data__;
        that._hovered = data;
        that._shadowNodes
          .transition('fade')
          .duration(300)
          .attr('barColor', that._getBarColor)
          .attr('nameColor', that._getNameColor)
          .attr('valueColor', that._getValueColor)
          .attr('hovered', that._getIsHovered);
        that._emit(Events.overItemLegend, event, this, data);
      });
      graphic.on('pointerout', (event) => {
        graphic.cursor = 'none';
        cursor.focusOn(null);
        that._hovered = null;
        that._shadowNodes
          .transition('fade')
          .duration(700)
          .attr('barColor', that._getBarColor)
          .attr('nameColor', that._getNameColor)
          .attr('valueColor', that._getValueColor)
          .attr('hovered', 0);
        that._emit(Events.overItemLegend, event, this, this.__data__);
      });

      const nameNode = new PIXI.Text(getKey(node), {
        ...textStyle,
        fill: '#fff',
      });
      nameNode.scale.set(0.5);
      nameNode.anchor.set(0, 0.5);
      nameNode.rotation = -Math.PI / 2;
      nameNode.name = 'name';

      let width = nameNode.height * 1.5;

      const barNode = new PIXI.Sprite(roundedRectangularTexture('#fff', 1, 1, 0));
      barNode.width = width * 0.8;
      barNode.anchor.set(0.5, 0);
      barNode.y = 2;
      barNode.name = 'bar';

      const boundNode = new PIXI.Sprite(roundedRectangularTexture('#fff', 1, 1, 0));
      boundNode.width = width;
      boundNode.alpha = 0;
      boundNode.anchor.set(0.5, 0);
      boundNode.name = 'bound';
      updateBoundNode(boundNode, nameNode.width);

      const countNode = new PIXI.Text(getValue(node), {
        ...textStyle,
        fill: '#fff',
      });
      countNode.scale.set(0.5);
      countNode.anchor.set(0, 0.5);
      countNode.rotation = -Math.PI / 2;
      countNode.name = 'count';

      graphic.addChild(boundNode);
      graphic.addChild(nameNode);
      graphic.addChild(barNode);
      graphic.addChild(countNode);

      that._nodesGroup.addChild(graphic);

      this.graphic = graphic;
    };
  }

  _render(_renderer) {
    super._render(_renderer);

    this._neededRendering = this._neededRendering ?? true;

    if (this._neededRendering || hasTransition(this._shadowNodes)) {
      this._shadowNodes?.each(updateNodeGraphic);
    }

    this._neededRendering = false;
  }
}

export default GroupsLegend;
