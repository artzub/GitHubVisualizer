export const drawDashedPolygon = (
  node,
  polygons,
  x,
  y,
  rotation,
  dash,
  gap,
  offsetPercentage,
) => {
  let i;
  let p1;
  let p2;
  let dx;
  let dy;
  let dashLeft = 0;
  let gapLeft = 0;

  if (offsetPercentage > 0) {
    const progressOffset = (dash + gap) * offsetPercentage;

    if (progressOffset < dash) {
      dashLeft = dash - progressOffset;
    } else {
      gapLeft = gap - (progressOffset - dash);
    }
  }

  const rotatedPolygons = [];
  for (i = 0; i < polygons.length; i += 1) {
    if (!polygons[i]) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const p = { x: polygons[i].x, y: polygons[i].y };
    const cosAngle = Math.cos(rotation);
    const sinAngle = Math.sin(rotation);
    dx = p.x;
    dy = p.y;
    p.x = dx * cosAngle - dy * sinAngle;
    p.y = dx * sinAngle + dy * cosAngle;
    rotatedPolygons.push(p);
  }

  for (i = 0; i < rotatedPolygons.length; i += 1) {
    p1 = rotatedPolygons[i];
    if (i === rotatedPolygons.length - 1) {
      return;
    }

    p2 = rotatedPolygons[i + 1];

    dx = p2.x - p1.x;
    dy = p2.y - p1.y;

    const len = Math.sqrt(dx * dx + dy * dy);
    const normal = { x: dx / len, y: dy / len };

    let progressOnLine = 0;

    node.moveTo(x + p1.x + gapLeft * normal.x, y + p1.y + gapLeft * normal.y);

    while (progressOnLine <= len) {
      progressOnLine += gapLeft;
      if (dashLeft > 0) {
        progressOnLine += dashLeft;
      } else {
        progressOnLine += dash;
      }

      if (progressOnLine > len) {
        dashLeft = progressOnLine - len;
        progressOnLine = len;
      } else {
        dashLeft = 0;
      }

      node.lineTo(
        x + p1.x + progressOnLine * normal.x,
        y + p1.y + progressOnLine * normal.y,
      );

      progressOnLine += gap;

      if (progressOnLine > len && !dashLeft) {
        gapLeft = progressOnLine - len;
      } else {
        gapLeft = 0;
        node.moveTo(
          x + p1.x + progressOnLine * normal.x,
          y + p1.y + progressOnLine * normal.y,
        );
      }
    }
  }
};
