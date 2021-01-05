import { max } from 'd3-array';
import { quadtree } from 'd3-quadtree';

const forceCollide = () => {
  let strength = 0.2;
  let padInside = 2; // separation between same-color nodes
  let padOutside = 6; // separation between different-color nodes
  let group = (node) => node.data.group;
  let radius = (node) => node.r;
  let nodes;
  let maxRadius;

  function force(alpha) {
    const qt = quadtree(nodes, (d) => d.x, (d) => d.y);

    nodes.forEach((node) => {
      const r = radius(node) + maxRadius;
      const nx1 = node.x - r;
      const ny1 = node.y - r;
      const nx2 = node.x + r;
      const ny2 = node.y + r;

      qt.visit((q, x1, y1, x2, y2) => {
        if (!q.length) {
          do {
            if (q.data !== node) {
              const pad = (group(node) === group(q.data) ? padInside : padOutside);
              const r = radius(node) + radius(q.data) + pad;
              let x = node.x - q.data.x;
              let y = node.y - q.data.y;
              let l = Math.hypot(x, y);

              if (l < r) {
                l = (l - r) / (l || 1) * alpha * strength;
                x *= l;
                y *= l;

                node.x -= x;
                node.y -= y;

                q.data.vx += x;
                q.data.vy += y;
              }
            }

            q = q.next;
          } while (q);
        }

        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  }

  force.initialize = (_) => {
    nodes = _ || [];
    maxRadius = max(nodes, radius) + Math.max(padInside, padOutside);
  };

  force.padInside = (...args) => {
    if (args.length < 1) {
      return padInside;
    }
    padInside = +args[0];
    return force;
  };

  force.padOutside = (...args) => {
    if (args.length < 1) {
      return padOutside;
    }
    padOutside = +args[0];
    return force;
  };

  force.group = (...args) => {
    if (args.length < 1) {
      return group;
    }
    group = args[0];
    return force;
  };

  force.strength = (...args) => {
    if (args.length < 1) {
      return strength;
    }
    strength = +args[0];
    return force;
  };

  force.radius = (...args) => {
    if (args.length < 1) {
      return radius;
    }
    radius = args[0];
    return force;
  };

  return force;
};

export default forceCollide;
