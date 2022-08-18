import { scaleOrdinal } from 'd3-scale';
import { select as d3select } from 'd3-selection';
import * as PIXI from 'pixi.js-legacy';

import * as palettes from '@mui/material/colors';

import { colorConvert } from '@/shared/utils';

const sortLang = ({ key: a }, { key: b }) => {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  return (la > lb ? 1 : (la < lb ? -1 : 0));
};

const byKey = (d) => d.key;

class Languages extends PIXI.Container {
  constructor() {
    super();

    this._shadow = d3select(document.createElement('shadow'));

    this._nodesGroup = new PIXI.Container();
    this.addChild(this._nodesGroup);

    this._addNode = this._addNodeFactory();

    this.data();
  }

  data(data) {
    this._data = (data || []).reduce((acc, item) => {
      const key = item.language;
      const row = acc[key] || {
        key,
        value: 0,
      };
      row.value += 1;

      acc[key] = row;

      return acc;
    }, {});
    this._data = Object.values(this._data).sort(sortLang);

    return this.updateLayout();
  }

  resize(width, height) {
  }

  updateLayout() {
    const nodes = this._shadow
      .selectAll('shadow.node')
      .data(this._data, byKey)
    ;

    const nodesEnter = nodes.enter()
      .append('shadow')
      .attr('class', 'node')
      .attr('id', byKey)
      .attr('color', '#fff')
      .attr('background', '#000')
      .attr('opacity', 0)
      .attr('text', byKey)
      .each(this._addNode)
    ;

    nodes.merge(nodesEnter)
      .attr('opacity', 1)
    ;

    return this;
  }

  _addNodeFactory() {
    const that = this;

    return function (node) {
      const graphic = new PIXI.Container();

      // graphic.cursor = 'pointer';
      // graphic.on('pointerover', that._onNodeOver(this));
      // graphic.on('pointerout', that._onNodeOut(this));
      // graphic.on('pointermove', that._onNodeMove(this));
      // graphic.on('click', that._onNodeClick(this));
      //
      // const radius = 7;
      //
      // const circle = new PIXI.Sprite(circleTexture('#fff', 128));
      // circle.width = radius * 2;
      // circle.height = radius * 2;
      // circle.anchor.set(0, 0.5);
      //
      // const text = new PIXI.Text(getText(node), {
      //   ...that._textStyle,
      //   fill: '#fff',
      // });
      // text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      // // text.resolution = 2;
      // text.anchor.set(0, 0.5);
      // text.x = radius * 3 + 8;
      // text.y = -1;
      //
      // const boundWidth = text.width + 16;
      //
      // const bound = new PIXI.Sprite(boundTexture('#fff', boundWidth, 30, 8));
      // bound.anchor.set(0, 0.5);
      // bound.x = radius * 3;
      //
      // drawLabel(node.data.name, text, bound);
      //
      // graphic.addChild(circle);
      // graphic.addChild(bound);
      // graphic.addChild(text);

      graphic.alpha = 0;

      that._nodesGroup.addChild(graphic);

      this.graphic = graphic;
    };
  }

  _draw() {
  }

  _tick() {
  }
}

export default Languages;
