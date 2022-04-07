// To be implemented using PyGame.

// Planned functionality: GUI for very easily creating and modifying 2D matrices
// 2D matrices could be of any given size/dimensions
// Visually and intuitively, the user should be able to: 
//   - see a grid where each position holds it's corresponding value and/or a color-coded representation (done)
//   - zoom in and out and pan around at will with a re-centering feature (done)
//   - increase the matrix resolution by an integer factor: Turn every pixel into a 2x2 or 3x3 etc. of the same value as original pixel (done, but factor is fixed and can only be changed from console)
//   - automatically console-log current matrix (done)
//   - change the matrix dimensions at any point (cut/fill with default depending on current matrix size) (done, but only doable from console)
//   - infinite undo/redo of moidifications (done)
//   - pick fill value intuitively
//   - single pixel value modification (free draw tool)
//   - multiple pixel value modification (rectangle tool, line tool, circle tool, free draw tool)
//   - select -> copy/cut -> move tool



// Inner logic
p5.disableFriendlyErrors = true
let m     = [] // Matrix
let mw    = 4 // Matrix width
let mh    = 4 // Matrix height
let dv    = 0 // Default matrix value
// let prevm = [] // Previous frame matrix
let mod   = false // Modified during this frame
let mHist = [] // Matrix history
let cm    = 0  // Current matrix, index for mh



// General visuals
let w // Sketch width  (set in setup)
let h // Sketch height (set in setup)
let pxd    = 1 // Pixel density 
let pxwh   = 20   // True pixels of width and height of each square at the most zoomed-out level
let zoom   = 1.0  // Amount of zoom
let zFac   = 1.0  // Zoom constrained between 0 and 1
let minZ   = 0.25 // Lower bound of allowed zoom range
let maxZ   = 5    // Upper bound of allowed zoom range
let s      = pxwh*zoom // Actual size (width and height) of each square
let mwpx   = s*mw // Width of matrix in pixels
let mhpx   = s*mh // Height of matrix in pixels
let hRef   = 0 // Horizontal reference pixel
let vRed   = 0 // Vertical reference pixel
let hPan   = 0 // Horizontal camera pan
let vPan   = 0 // Vertical camera pan
let pan    = [] // Holds hPan and vPan
let bgc    = 35 // Background color
let tca    = [255, 69] // Text color and alpha (constant)
let ta     = 0   // Text alpha (dynamic, based on zoom)
let lineca = [120, 255] // Gridline color and alpha (constant)
let linea  = 255 // Gridline alpha (dynamic, based on zoom)
let linew  = 1   // Gridline width
let valc   = [[125,0,0], [bgc, bgc, bgc]] // Index based value-color array, starting from -1 at index 0



// Interactivity
let prevx // Previous mouseX pos
let prevy // Previous mouseY pos
let uipx  = 30 // UI button length
let uibc  = 80 // UI button color
let uihc  = 200 // UI highlight color
let clickButtonArray // Holds all relevant clickable button data in the form [[button1xPos, button1yPos, button1function, button1drawFunction, functionArgs]](set in setup)
let undoredo = true // Undo or Redo was used during the previous frame
let verbose = true // If true, prints m whenever a change is made to it

let cPick // Color picked from color wheel
let cPicking = false // Currently picking a color using the color wheel
let vMod = false // Currently modifying lightning value on color wheel
let pxIndex // Index of current pixel 
let v = 0.8 // luminosity value
let cWx // Color wheel x pos (set in setup)
let cWy // Color wheel y pos (set in setup)
let cWd = 100 // Color wheel diameter



function preload() {
  cWheel = loadImage('colorWheel.png')
}



function setup() {
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault()) // Prevent context menu popup on right click
  }
  
  w = windowWidth
  h = windowHeight
  noSmooth()
  createCanvas(w, h)
  for (let y = 0; y < mh; y++) {
    m[y] = []
    for (let x = 0; x < mw; x++) {
      m[y][x] = dv
    }
  }
  
  s    = pxwh*zoom
  mwpx = s*mw
  mhpx = s*mh
  hRef = (w-mwpx)/2
  vRef = (h-mhpx)/2
  hPan = 0
  vPan = 0

  clickButtonArray = [[w-uipx/1.25, 1*uipx/1.25, undo, undoButton],
                      [w-uipx/1.25, 3*uipx/1.25, redo, redoButton],
                      [w-uipx/1.25, 5*uipx/1.25, reCenter, reCenterButton],
                      [w-uipx/1.25, 7*uipx/1.25, enlargeMatrix, enlargeMatrixButton, 2],]
  
  cWx = cWd/1.725 + uipx/5
  cWy = cWd/1.725 + 3*uipx/1.25 - uipx/2.25
  imageMode(CENTER)
  ellipseMode(CENTER)
  
  mHist.push([deepCopy2D(m), mw, mh])
}

  

function draw() {
  background(bgc)
  zoom = updateZoom(minZ, maxZ)
  s    = pxwh*zoom
  mwpx = s*mw
  mhpx = s*mh
  pan  = updatePan()
  hPan = pan[0]
  vPan = pan[1]
  hRef = (w-mwpx+s)/2 + hPan*zoom
  vRef = (h-mhpx+s)/2 + vPan*zoom
  
  zFac = constrain(zoom, 0, 1)
  la   = lineca[1] * zFac**1.5
  // ta   = tca[1] * zFac**2
  
  // Draw grid 
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      
      stroke(lineca[0], la)
      strokeWeight(linew)
      fill(valc[m[y][x] + 1])
      rect(hRef + x*s, vRef + y*s, s, s)
      
      // fill(tca[0], ta)
      // noStroke()
      // textAlign(CENTER, CENTER);
      // textSize(s/1.5)
      // text(m[y][x], hRef + x*s+s/2, vRef + y*s+s/2)
      
    }
  }
  
  // Draw GUI
  drawClickButtons()
  if (cPicking) {
    drawColorWheel()
  }
  
  prevx = mouseX
  prevy = mouseY
  if (!mouseIsPressed && (frameCount == 1 || mod)) {
    if (verbose) {
      console.log(showMatrix(m))
    } if (!undoredo) {
      mHist = mHist.slice(0, cm+1)
      mHist.push([deepCopy2D(m), mw, mh])
      cm = cm + 1
    }
  }
  mod = false
  undoredo = false
}
  

  
function showMatrix(m) {
  let rowText = ''
  let matrixText = '['
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      if (m[y][x] < 0) {
        rowText += ''+m[y][x]+','
      } else {
        rowText += ' '+m[y][x]+','
      }
    }
    if (y == 0) {
      matrixText += '['+rowText+'],'
    } else {
      matrixText +=' ['+rowText+'],'
    }
    if (y != mh-1) {
      matrixText += '\n'
    }
    rowText = ''
  }
  matrixText += ']'
  return matrixText
}
  
  
  
function updateZoom(min, max) {
  let zoomIn  = keyIsPressed && (key === '+')
  let zoomOut = keyIsPressed && (key === '-')
  if (zoomIn) {
    // zoom += 0.1
    zoom *= 1.025
  } else if (zoomOut) {
    // zoom -= 0.1
    zoom *= 0.975
  }

  if (mouseIsPressed) {
    if (mouseButton === CENTER) {
      zoom -= 2*zoom*(mouseY-prevy)/h
    }
  }
  
  zoom = constrain(zoom, min, max)
  return zoom
}



function updatePan() {
  let p = pxwh/2 
  let r = keyIsDown(RIGHT_ARROW)
  let l = keyIsDown(LEFT_ARROW)
  let u = keyIsDown(UP_ARROW)
  let d = keyIsDown(DOWN_ARROW)
  if (r) {
    hPan -= p
  } if (l) {
    hPan += p
  } if (u) {
    vPan += p
  } if (d) {
    vPan -= p
  }
  
  if (mouseIsPressed) {
    if (mouseButton === RIGHT) {
      hPan += (mouseX-prevx)/zoom
      vPan += (mouseY-prevy)/zoom
    }
  }
  
  return [hPan, vPan]
}



function reCenter() {
  hPan = 0
  vPan = 0
  zoom = 1.0
}



function enlargeMatrix(n) {
  let nmw = n*mw
  let nmh = n*mh
  let nm  = []
  for (let y = 0; y < nmh; y++) {
    nm[y] = []
    for (let x = 0; x < nmw; x++) {
      nm[y][x] = dv
    }
  }
  for (let y = 0; y < nmh; y+=n) {
    for (let x = 0; x < nmw; x+=n) {
      for (let ny = y; ny < y+n; ny++) {
        for (let nx = x; nx < x+n; nx++) {
          nm[ny][nx] = m[ceil(y/n)][ceil(x/n)]
        }
      }
    }
  }
  m = nm
  mw = nmw
  mh = nmh
  // reCenter()
  mod = true
}



function reShapeMatrix(nmw, nmh) {
  // m is reshaped from bottom-left to up-right
  let nm  = []
  let delta = nmh - mh
  for (let y = 0; y < nmh; y++) {
    nm[y] = []
    for (let x = 0; x < nmw; x++) {
      if (y-delta+1 > 0 && x < mw) {
        nm[y][x] = m[y-delta][x]
      } else {
        nm[y][x] = dv
      }
    }
  }
  m = nm
  mw = nmw
  mh = nmh
  // reCenter()
  mod = true
}



function undo() {
  if (cm > 0) {
    cm--
    nm = mHist[cm]
    m  = nm[0]
    mw = nm[1]
    mh = nm[2]
    // reCenter()
    mod = true
    undoredo = true
  }
}



function redo() {
  if (cm < mHist.length-1) {
    cm++
    nm  = mHist[cm]
    m  = nm[0]
    mw = nm[1]
    mh = nm[2]
    // reCenter()
    mod = true
    undoredo = true
  }
}



function baseButton(x, y) {
  rectMode(CENTER)
  noStroke()
  fill(bgc/2)
  // ellipse(x + uipx/20, y + uipx/20, uipx)
  rect(x + uipx/10, y + uipx/10, uipx, uipx, uipx/10)
  fill(uibc)
  // ellipse(x, y, uipx)
  rect(x, y, uipx, uipx, uipx/10)
}



function reCenterButton(x, y) {
  baseButton(x, y)
  fill(uihc)
  ellipse(x, y, uipx*2.25/3)
  fill(uibc)
  ellipse(x, y, uipx*1.75/3)
  fill(uihc)
  ellipse(x, y, uipx*1/5)
}



function enlargeMatrixButton(x, y) {
  baseButton(x, y)
  noFill()
  strokeWeight(uipx/20)
  stroke(uihc, 150)
  rect(x-uipx*1/6, y-uipx*1/6, uipx*1/3)
  stroke(uihc)
  rect(x, y, uipx*2/3)
}



function undoButton(x, y) {
  baseButton(x, y)
  fill(uihc)
  ellipse(x, y, uipx*1.8/3)
  fill(uibc)
  ellipse(x, y, uipx*1.4/3)
  rect(x-uipx/4.5, y-uipx/4.5, uipx/2.25)
  fill(uihc)
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x-uipx/6, y-0.6*uipx/2.25)
}



function undoButton(x, y) {
  baseButton(x, y)
  fill(uihc)
  ellipse(x, y, uipx*1.8/3)
  fill(uibc)
  ellipse(x, y, uipx*1.4/3)
  rect(x-uipx/4.5, y-uipx/4.5, uipx/2.25)
  fill(uihc)
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x-uipx/6, y-0.6*uipx/2.25)
}



function redoButton(x, y) {
  baseButton(x, y)
  fill(uihc)
  ellipse(x, y, uipx*1.8/3)
  fill(uibc)
  ellipse(x, y, uipx*1.4/3)
  rect(x+uipx/4.5, y-uipx/4.5, uipx/2.25)
  fill(uihc)
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x+uipx/6, y-0.6*uipx/2.25)
}



function drawClickButtons() {
  for (let button of clickButtonArray) {
    let bx = button[0]
    let by = button[1]
    let draw = button[3]
    draw(bx, by)
  }
}



function mouseClicked() {
  // Botones
  for (let button of clickButtonArray) {
    let bx = button[0]
    let by = button[1]
    let func = button[2]
    let args = button[4]
    if (mouseX > bx - uipx/2 && mouseX < bx + uipx/2) {
      if (mouseY > by - uipx/2 && mouseY < by + uipx/2) {
        func(args)
      }
    }
  }
  
  // Colores
  if (cPicking) {
    if (dist(mouseX, mouseY, cWx, cWy) < cWd/2) {
      pxIndex = (mouseY * width + mouseX) * pxd * 4
      loadPixels()
      cPick = [pixels[pxIndex],
               pixels[pxIndex + 1],
               pixels[pxIndex + 2],
               pixels[pxIndex + 3]]
      updatePixels()
      cPick = [cPick[0]*v, cPick[1]*v, cPick[2]*v]
    }
  }
}



function deepCopy2D(a) {
  let copy = []
  for (let y = 0; y < a.length; y++) {
    copy[y] = [...a[y]]
  }
  return copy
}



function mouseReleased() {
  vMod = false
}



function drawColorWheel() {
  noStroke()
  rectMode(CENTER)
  fill(bgc/2)
  rect(cWx + uipx/10, cWy + cWd/8 + uipx/10, cWd*1.15, cWd*1.4, cWd/8)
  fill(uibc-30)
  rect(cWx, cWy + cWd/8, cWd*1.15, cWd*1.4, cWd/8)
  rectMode(CORNER)
  fill(uihc)
  ellipse(cWx, cWy, cWd*21/20)
  tint(255*v)
  image(cWheel, cWx, cWy, cWd, cWd)
  fill(uihc-50)
  rect(cWx-cWd/2, cWy + cWd/1.55 - cWd/160, cWd*v, cWd/80, cWd/80)
  fill(uibc)
  rect(cWx-cWd/2+cWd*v, cWy + cWd/1.55 - cWd/160, cWd*(1-v), cWd/80, cWd/80)
  fill(uihc)
  ellipse(cWx-cWd/2+v*cWd, cWy + cWd/1.55, cWd/20)
  if (mouseIsPressed) {
    if (vMod || ((mouseX > cWx-cWd/2-cWd/40 && mouseX < cWx+cWd/2+cWd/40) && (mouseY > cWy + cWd/1.8 && mouseY < cWy + cWd/1.3))) {
      v = constrain(map(mouseX, cWx-cWd/2, cWx+cWd/2, 0, 1), 0, 1)
      vMod = true
    }
  }
}







