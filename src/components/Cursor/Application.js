import * as cursor from '@/services/CursorService';
import * as focus from '@/services/FocusService';
import * as PIXI from 'pixi.js-legacy';

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

    this._locator = cursor.getInstance();
    this._locator.x = -10;
    this._locator.y = -10;
    this._instance.stage.addChild(this._locator);

    this._focuser = focus.getInstance();
    this._focuser.x = -10;
    this._focuser.y = -10;
    this._instance.stage.addChild(this._focuser);

    this._group = new PIXI.Container();
    this._group.interactive = true;
    this._group.on('pointermove', this._locator.onPointerMove);
    this._instance.stage.addChild(this._group);
  }

  destroy() {
    this._destroyed = true;
    this._instance.destroy(true, true);
  }

  _resize(width, height) {
    this._group.x = width * 0.5;
    this._group.y = height * 0.5;

    this._locator.resize(width, height);
  }
}

export default Application;
