import { color } from 'd3-color';
import { scaleSqrt } from 'd3-scale';
import { select as d3select } from 'd3-selection';
import * as PIXI from 'pixi.js-legacy';

import { colorConvert, colorScale, roundedRectangularTexture } from '@/shared/utils';

const textStyle = {
  fontSize: '2.4em',
  fontFamily: "'JetBrains Mono',monospace",
  lineJoin: 'round',
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

  if (graphic.opacity !== opacity) {
    graphic.alpha = opacity;
    graphic.visible = opacity > 0;
  }

  if (!graphic.visible) {
    return;
  }

  const [nameNode, barNode, countNode] = graphic.children;

  if (nameNode.text !== text) {
    nameNode.text = text;
    nameNode.updateText();
  }

  let hasChanges = false;
  let tint = colorConvert(nameColor);
  if (tint !== nameNode.tint) {
    nameNode.tint = tint;
  }

  tint = colorConvert(barColor);
  if (tint !== barNode.tint) {
    barNode.tint = tint;
  }

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

    this._scale = scaleSqrt().range([5, 100]);

    this._getBarHeight = (node) => this._scale(+getValue(node));
    this._getBarColor = (node) => this._colors(getKey(node));
    this._getNameColor = (node) => this._colors(getKey(node));
    this._getValueColor = (node) => color(this._colors(getKey(node))).darker(2.5);

    this._awaitRendering = 0;
    this._incRenderCounter = () => {
      this._awaitRendering += 1;
    };
    this._decRenderCounter = () => {
      this._awaitRendering = Math.max(this._awaitRendering - 1, 0);
    };
    this._removeGraphic = function () {
      if (this.graphic) {
        const parent = this.graphic.parent || nodesGroup;
        parent.removeChild(this.graphic);
        this.graphic = null;
      }
    };

    this.data();
  }

  destroy(...args) {
    super.destroy(...args);
    this._destroyed = true;
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
      .each(this._addNode)
      .each(updateNodeGraphic)
    ;

    this._shadowNodes = nodes.merge(nodesEnter)
      .attr('value', getValue)
      .attr('text', getKey)
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
      .on('start', this._incRenderCounter)
      .on('cancel interrupt end', this._decRenderCounter);

    nodes.exit()
      .each(this._removeGraphic)
      .remove();

    return this;
  }

  _addNodeFactory() {
    const that = this;

    return function (node) {
      const graphic = new PIXI.Container();

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
      barNode.y = 2;
      barNode.width = width * 0.8;
      barNode.anchor.set(0.5, 0);
      barNode.name = 'bar';

      const countNode = new PIXI.Text(getValue(node), {
        ...textStyle,
        fill: '#fff',
      });
      countNode.scale.set(0.5);
      countNode.anchor.set(0, 0.5);
      countNode.rotation = -Math.PI / 2;
      countNode.name = 'count';

      graphic.addChild(nameNode);
      graphic.addChild(barNode);
      graphic.addChild(countNode);

      that._nodesGroup.addChild(graphic);

      this.graphic = graphic;
    };
  }

  _render(_renderer) {
    super._render(_renderer);

    if (this._awaitRendering < 1) {
      return;
    }

    this._shadowNodes?.each(updateNodeGraphic);
  }
}

export default GroupsLegend;
