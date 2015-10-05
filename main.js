function main () {

  screenW = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
  screenH = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

  canvasW = screenW > 500 ? screenW/2 : screenW;

  var xy = {
    width: canvasW,
    height: 300
  }

  xy.o = [xy.width/2, xy.height/2]

  var xz = xy;

  var coilOpts = {
    w: 150,
    l: 150,
    lead: 30
  }

  var magnetOpts = {
    w: coilOpts.w,
    h: coilOpts.l,
    l: 70,
    tesla: 2
  }

  var tOpts = {
    omega: Math.PI
  }


  // how do they work?
  var Magnet = function( p, color, t ) {
    // p is 3D coordinate of center of magnet
    // example [0, 0, 0]
    var o = magnetOpts;
    this.faces = [
      // Top face represented by a set of lines
      [
        [p[0] + o.l/2, p[1] + o.w/2, -p[2] - o.h/2 ],
        [p[0] + o.l/2, p[1] - o.w/2, -p[2] - o.h/2 ],
        [p[0] - o.l/2, p[1] - o.w/2, -p[2] - o.h/2 ],
        [p[0] - o.l/2, p[1] + o.w/2, -p[2] - o.h/2 ], 
        [p[0] + o.l/2, p[1] + o.w/2, -p[2] - o.h/2 ]
      ],
      // Front face
      [
        [p[0] + o.l/2, p[1] - o.w/2, +p[2] + o.h/2 ],
        [p[0] + o.l/2, p[1] - o.w/2, -p[2] - o.h/2 ],
        [p[0] - o.l/2, p[1] - o.w/2, -p[2] - o.h/2 ],
        [p[0] - o.l/2, p[1] - o.w/2, +p[2] + o.h/2 ], 
        [p[0] + o.l/2, p[1] - o.w/2, +p[2] + o.h/2 ]
      ],
    ]
    this.fillStyle = color
    this.text = {
      content: t,
      pos: p
    }
  }

  var nMagnet = new Magnet([-coilOpts.l/2 - magnetOpts.l/2 - 20, 0, 0], '#FF5252', 'N')
    , sMagnet = new Magnet([+coilOpts.l/2 + magnetOpts.l/2 + 20, 0, 0], '#3F51B5', 'S')

  // Coil, the mvp
  var Coil = function() {
    var o = coilOpts
      , me = this

    this.faces = [
      [ 
        [ -o.lead/3, + o.w/2 + o.lead, 0  ], 
        [ -o.lead/3, +o.w/2, 0 ],
        [ -o.l/2, +o.w/2, 0 ],
        [ -o.l/2, -o.w/2, 0 ],
        [ o.l/2, -o.w/2, 0 ],
        [ o.l/2, +o.w/2, 0 ],
        [ o.lead/3, +o.w/2, 0 ],
        [ o.lead/3, +o.w/2 + o.lead, 0 ]
      ]
    ]

    this.rect = [ [ -o.l/2, -o.w/2, -o.l/2 ], [ o.l/2, o.w/2 + o.lead, o.l/2 ] ]

    this.strokeStyle = "black"

    this.update = function(t) {
      // x becomes x * cos(t)
      // z becomes z * sin(t)
      var cosT = Math.cos(tOpts.omega * t);
      var sinT = Math.sin(tOpts.omega * t);

      me.faces = [
        [ 
          [ -o.lead/3 * cosT, + o.w/2 + o.lead, -o.lead/3 * sinT  ], 
          [ -o.lead/3 * cosT, +o.w/2, -o.lead/3 * sinT ],
          [ -o.l/2 * cosT, +o.w/2, -o.l/2 * sinT ],
          [ -o.l/2 * cosT, -o.w/2, -o.l/2 * sinT ],
          [ o.l/2 * cosT, -o.w/2, o.l/2 * sinT ],
          [ o.l/2 * cosT, +o.w/2, o.l/2 * sinT ],
          [ o.lead/3 * cosT, +o.w/2, o.lead/3 * sinT ],
          [ o.lead/3 * cosT, +o.w/2 + o.lead, +o.lead/3 * sinT ]
        ]
      ]
    }
  }

  var coil = new Coil();



  //
  // PLOTTING
  // 

  function cA (x) {
    return xy.o[0] + x;
  }

  function cB (y) {
    return xy.o[1] + y;
  }

  function plotFace(face, path, a, b) {
    var len = face.length;
    path.moveTo( cA(face[a]), cB(face[b]) );
    for ( var i = 0; i < len; i++ ) {
      var point = face[i];
      path.lineTo(cA(point[a]), cB(point[b]));
    }
  }

  function plot ( item, ctx, a, b ) {
    var edges = item.edges;
    var path;

    if ( item.faces ) {
      path = new Path2D();
      ctx.beginPath();
      item.faces.map(function(face) {
        plotFace(face, path, a, b);
      })
      ctx.closePath();
    }

    if ( item.fillStyle ) {
      ctx.fillStyle = item.fillStyle;
      ctx.fill(path);
    }

    if ( item.strokeStyle ) {
      ctx.strokeStyle = item.strokeStyle;
      ctx.stroke(path);
    }

    if ( item.text ) {
      ctx.fillStyle = "white";
      ctx.font = "24px Segoe UI, Arial, Helvetica";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText( item.text.content, cA(item.text.pos[a]), cB(item.text.pos[b]) )
    }
  }



  //
  // XY view
  //
  var canvasXY = document.querySelector('canvas.xy')
    , ctxXY = canvasXY.getContext('2d')
    
  canvasXY.width = xy.width
  canvasXY.height = xy.height

  plot( nMagnet, ctxXY, 0, 1 )
  plot( sMagnet, ctxXY, 0, 1 )
  plot( coil, ctxXY, 0, 1 )


  //
  // XZ view
  //
  var canvasXZ = document.querySelector('canvas.xz')
    , ctxXZ = canvasXZ.getContext('2d')

  canvasXZ.height = xz.height;
  canvasXZ.width = xz.width;

  plot( nMagnet, ctxXZ, 0, 2 )
  plot( sMagnet, ctxXZ, 0, 2 )
  plot( coil, ctxXZ, 0, 2 )


  //
  // Animate
  //
  var t = 0;

  function anim () {
    // Need to remove only magnet
    // console.log(coil.rect[0][0]);
    ctxXY.clearRect(cA(coil.rect[0][0]) - 1, cB(coil.rect[0][1]) - 1, coilOpts.w + 2, coilOpts.l + coilOpts.lead + 2 )
    ctxXZ.clearRect(cA(coil.rect[0][0]) - 1, cB(coil.rect[0][2]) - 1, coilOpts.w + 2, coilOpts.l + 2 );
    
    coil.update(t);
    t += 1/60;

    plot( coil, ctxXY, 0, 1 )
    plot( coil, ctxXZ, 0, 2 )

    window.requestAnimationFrame(anim);
  }
  window.requestAnimationFrame( anim );
}

window.addEventListener('DOMContentLoaded', main);